

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) DEFAULT NULL,
  google_id VARCHAR(255) UNIQUE DEFAULT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Cafes: lo que ve el cliente en la tienda (una card por cafe).
-- Sus presentaciones concretas viven en products.
CREATE TABLE IF NOT EXISTS coffees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  description_en TEXT,
  category ENUM('nacional','premium','variedades') NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- products = las VARIANTES: lo que realmente se compra.
-- cart_items y order_items apuntan aca, asi que cada fila es un SKU.
--
-- Regla de forma (la exige chk_products_variant_shape): una variante tiene
-- coffee_id + size_g + grind + roast los cuatro no nulos; un producto suelto
-- (el Pack) los tiene todos NULL. Sin estados intermedios.
--
-- `line` es LEGACY: la categoria real vive en coffees.category. Se mantiene
-- porque getPackProductId() la usa de respaldo y porque el carrito y el
-- checkout la muestran como etiqueta.
--
-- OJO: los ENUM de grind/roast estan duplicados en cart_item_selections,
-- order_item_selections y en ROASTS/GRINDS de src/shared/pack.js.
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coffee_id INT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  size_g SMALLINT UNSIGNED NULL,
  grind ENUM('grano','molido') NULL,
  roast ENUM('medio','oscuro') NULL,
  image_url VARCHAR(255),
  line VARCHAR(50),
  stock INT DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_product_variant (coffee_id, size_g, grind, roast),
  -- FK sin ON DELETE/ON UPDATE: el default ya se comporta como RESTRICT, y
  -- MySQL prohibe un CHECK sobre una columna con acciones referenciales.
  CONSTRAINT fk_products_coffee
    FOREIGN KEY (coffee_id)
    REFERENCES coffees(id),
  CONSTRAINT chk_products_variant_shape CHECK (
       (coffee_id IS NULL     AND size_g IS NULL     AND grind IS NULL     AND roast IS NULL)
    OR (coffee_id IS NOT NULL AND size_g IS NOT NULL AND grind IS NOT NULL AND roast IS NOT NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id)
    REFERENCES carts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('pending','paid','cancelled') DEFAULT 'pending',
  payment_method ENUM('tilopay','paypal') DEFAULT 'tilopay',
  tilopay_reference VARCHAR(255) DEFAULT NULL,
  tilopay_order_number VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  postal_code VARCHAR(20) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  country_code VARCHAR(2) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Desglose del Pack: cuantos paquetes de cada combinacion tueste/molienda.
-- Una fila por combinacion elegida (maximo 4), sumando siempre 9.
-- Son dos tablas espejo a proposito: al vaciar el carrito despues de pagar,
-- una tabla compartida borraria por cascada el desglose de la orden.
-- OJO: los ENUM de abajo deben coincidir con ROASTS y GRINDS de src/shared/pack.js
CREATE TABLE IF NOT EXISTS cart_item_selections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_item_id INT NOT NULL,
  roast ENUM('medio','oscuro') NOT NULL,
  grind ENUM('grano','molido') NOT NULL,
  quantity TINYINT UNSIGNED NOT NULL,
  CONSTRAINT fk_cart_item_selections_item
    FOREIGN KEY (cart_item_id)
    REFERENCES cart_items(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_cart_item_selection UNIQUE (cart_item_id, roast, grind)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS order_item_selections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_item_id INT NOT NULL,
  roast ENUM('medio','oscuro') NOT NULL,
  grind ENUM('grano','molido') NOT NULL,
  quantity TINYINT UNSIGNED NOT NULL,
  CONSTRAINT fk_order_item_selections_item
    FOREIGN KEY (order_item_id)
    REFERENCES order_items(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_order_item_selection UNIQUE (order_item_id, roast, grind)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  subject VARCHAR(255),
  message LONGTEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_password_resets_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Configuracion del sitio (clave-valor).
-- setting_key/setting_value porque `key` es palabra reservada en MySQL.
CREATE TABLE IF NOT EXISTS settings (
  setting_key   VARCHAR(64)  NOT NULL PRIMARY KEY,
  setting_value VARCHAR(255) NOT NULL,
  description   VARCHAR(255) DEFAULT NULL,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;


INSERT IGNORE INTO settings (setting_key, setting_value, description) VALUES
('shipping_cost', '3700.00', 'Costo fijo de envio en CRC');


-- Pack de 9 paquetes Premium, envio internacional incluido en el precio.
-- El WHERE NOT EXISTS lo hace idempotente: reejecutar db.sql no duplica el pack.
INSERT INTO products (name, description, price, line, stock)
SELECT * FROM (
  SELECT 'Pack Premium 9 Paquetes 500g' AS name,
         'Pack de 9 paquetes de Cafe Linea Premium 500g, a elegir entre tueste medio u oscuro, en grano o molido. Precio con envio internacional incluido.' AS description,
         83007.54 AS price,
         'Pack' AS line,
         50 AS stock
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products WHERE line = 'Pack');


-- Guarda el id del pack para no compararlo por nombre en el codigo.
INSERT INTO settings (setting_key, setting_value, description)
SELECT 'pack_product_id', CAST(id AS CHAR), 'ID del producto Pack (9 paquetes, envio incluido)'
FROM products WHERE line = 'Pack' ORDER BY id LIMIT 1
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- ============================================================
-- Cafes (lo que ve el cliente) + sus variantes (lo que se compra)
-- Generado desde la BD real. Idempotente: reejecutar no duplica.
-- ============================================================

INSERT IGNORE INTO coffees (slug, name, description, category, sort_order) VALUES
('cafe-nacional', 'Café Nacional', 'El Café Nacional es una exquisita mezcla que reúne todas nuestras variedades exclusivas, cuidadosamente seleccionadas para ofrecer una experiencia única. Este café 100% puro se distingue por su aroma intenso, cuerpo balanceado y sabor auténtico, reflejando la esencia del café costarricense. \nAl no estar sujeto a requisitos de venta ni exportación, garantiza frescura, pureza y calidad superior en cada taza.', 'nacional', 10),
('linea-premium', 'Línea Premium', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación, \nelaborada principalmente con las variedades Catuaí y Villa Sarchí. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 'premium', 20),
('san-roque', 'San Roque', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 'variedades', 30),
('geisha', 'Geisha', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 'variedades', 40),
('san-isidro', 'San Isidro', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 'variedades', 50);


-- Variantes. El NOT EXISTS por (slug, tamano, molienda, tueste) las hace
-- idempotentes: el seed viejo era un INSERT pelado y duplicaba los productos
-- cada vez que se reejecutaba db.sql.
INSERT INTO products (coffee_id, name, description, price, size_g, grind, roast, line, stock)
SELECT cf.id, 'Café Nacional - Tueste Medio Molido 500g', 'El Café Nacional es una exquisita mezcla que reúne todas nuestras variedades exclusivas, cuidadosamente seleccionadas para ofrecer una experiencia única. Este café 100% puro se distingue por su aroma intenso, cuerpo balanceado y sabor auténtico, reflejando la esencia del café costarricense. \nAl no estar sujeto a requisitos de venta ni exportación, garantiza frescura, pureza y calidad superior en cada taza.', 3600.00, 500, 'molido', 'medio', 'Nacional', 50
FROM coffees cf WHERE cf.slug = 'cafe-nacional'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM products) x
    WHERE x.coffee_id = cf.id AND x.size_g = 500
      AND x.grind = 'molido' AND x.roast = 'medio');

INSERT INTO products (coffee_id, name, description, price, size_g, grind, roast, line, stock)
SELECT cf.id, 'Café Nacional - Tueste Medio Molido 350g', 'El Café Nacional es una exquisita mezcla que reúne todas nuestras variedades exclusivas, \ncuidadosamente seleccionadas para ofrecer una experiencia única. Este café 100% puro se distingue por su aroma intenso, cuerpo balanceado y sabor auténtico, reflejando la esencia del café costarricense. Al no estar sujeto a requisitos de venta ni exportación, garantiza frescura, pureza y calidad superior en cada taza.', 2600.00, 350, 'molido', 'medio', 'Nacional', 50
FROM coffees cf WHERE cf.slug = 'cafe-nacional'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM products) x
    WHERE x.coffee_id = cf.id AND x.size_g = 350
      AND x.grind = 'molido' AND x.roast = 'medio');

INSERT INTO products (coffee_id, name, description, price, size_g, grind, roast, line, stock)
SELECT cf.id, 'Línea Premium - Tueste Medio Molido 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación, \nelaborada principalmente con las variedades Catuaí y Villa Sarchí. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 5300.00, 500, 'molido', 'medio', 'Premium', 50
FROM coffees cf WHERE cf.slug = 'linea-premium'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM products) x
    WHERE x.coffee_id = cf.id AND x.size_g = 500
      AND x.grind = 'molido' AND x.roast = 'medio');

INSERT INTO products (coffee_id, name, description, price, size_g, grind, roast, line, stock)
SELECT cf.id, 'Línea Premium - Tueste Medio Grano 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación, \nelaborada principalmente con las variedades Catuaí y Villa Sarchí. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 5300.00, 500, 'grano', 'medio', 'Premium', 50
FROM coffees cf WHERE cf.slug = 'linea-premium'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM products) x
    WHERE x.coffee_id = cf.id AND x.size_g = 500
      AND x.grind = 'grano' AND x.roast = 'medio');

INSERT INTO products (coffee_id, name, description, price, size_g, grind, roast, line, stock)
SELECT cf.id, 'Línea Premium - Tueste Oscuro Molido 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación, \nelaborada principalmente con las variedades Catuaí y Villa Sarchí. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 5300.00, 500, 'molido', 'oscuro', 'Premium', 50
FROM coffees cf WHERE cf.slug = 'linea-premium'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM products) x
    WHERE x.coffee_id = cf.id AND x.size_g = 500
      AND x.grind = 'molido' AND x.roast = 'oscuro');

INSERT INTO products (coffee_id, name, description, price, size_g, grind, roast, line, stock)
SELECT cf.id, 'Línea Premium San Roque - Grano 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 8000.00, 500, 'grano', 'medio', 'Premium', 50
FROM coffees cf WHERE cf.slug = 'san-roque'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM products) x
    WHERE x.coffee_id = cf.id AND x.size_g = 500
      AND x.grind = 'grano' AND x.roast = 'medio');

INSERT INTO products (coffee_id, name, description, price, size_g, grind, roast, line, stock)
SELECT cf.id, 'Línea Premium San Roque - Molido 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 8000.00, 500, 'molido', 'medio', 'Premium', 50
FROM coffees cf WHERE cf.slug = 'san-roque'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM products) x
    WHERE x.coffee_id = cf.id AND x.size_g = 500
      AND x.grind = 'molido' AND x.roast = 'medio');

INSERT INTO products (coffee_id, name, description, price, size_g, grind, roast, line, stock)
SELECT cf.id, 'Línea Premium Geisha - Grano 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 8500.00, 500, 'grano', 'medio', 'Premium', 50
FROM coffees cf WHERE cf.slug = 'geisha'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM products) x
    WHERE x.coffee_id = cf.id AND x.size_g = 500
      AND x.grind = 'grano' AND x.roast = 'medio');

INSERT INTO products (coffee_id, name, description, price, size_g, grind, roast, line, stock)
SELECT cf.id, 'Línea Premium Geisha - Molido 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 8500.00, 500, 'molido', 'medio', 'Premium', 50
FROM coffees cf WHERE cf.slug = 'geisha'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM products) x
    WHERE x.coffee_id = cf.id AND x.size_g = 500
      AND x.grind = 'molido' AND x.roast = 'medio');

INSERT INTO products (coffee_id, name, description, price, size_g, grind, roast, line, stock)
SELECT cf.id, 'Línea Premium San Isidro - Grano 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 5800.00, 500, 'grano', 'medio', 'Premium', 50
FROM coffees cf WHERE cf.slug = 'san-isidro'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM products) x
    WHERE x.coffee_id = cf.id AND x.size_g = 500
      AND x.grind = 'grano' AND x.roast = 'medio');

INSERT INTO products (coffee_id, name, description, price, size_g, grind, roast, line, stock)
SELECT cf.id, 'Línea Premium San Isidro - Molido 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 5800.00, 500, 'molido', 'medio', 'Premium', 50
FROM coffees cf WHERE cf.slug = 'san-isidro'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM products) x
    WHERE x.coffee_id = cf.id AND x.size_g = 500
      AND x.grind = 'molido' AND x.roast = 'medio');

