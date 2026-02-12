CREATE DATABASE database_sircof;
USE database_sircof;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  line VARCHAR(50),
  stock INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE cart_items (
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
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','cancelled') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE order_items (
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
);

CREATE TABLE password_resets (
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
);

ALTER TABLE products ADD COLUMN line VARCHAR(50);

-- Tabla de contactos (mensajes del formulario de contacto)
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);




-- Insertar productos
INSERT INTO products (name, description, price, line, stock) VALUES
('Café Nacional - Tueste Medio Molido 500g', 'El Café Nacional es una exquisita mezcla que reúne todas nuestras variedades exclusivas, cuidadosamente seleccionadas para ofrecer una experiencia única. Este café 100% puro se distingue por su aroma intenso, cuerpo balanceado y sabor auténtico, reflejando la esencia del café costarricense. Al no estar sujeto a requisitos de venta ni exportación, garantiza frescura, pureza y calidad superior en cada taza.', 3300.00, 'Nacional', 50),
('Café Nacional - Tueste Medio Molido 350g', 'El Café Nacional es una exquisita mezcla que reúne todas nuestras variedades exclusivas, cuidadosamente seleccionadas para ofrecer una experiencia única. Este café 100% puro se distingue por su aroma intenso, cuerpo balanceado y sabor auténtico, reflejando la esencia del café costarricense. Al no estar sujeto a requisitos de venta ni exportación, garantiza frescura, pureza y calidad superior en cada taza.', 2400.00, 'Nacional', 50),
('Línea Premium - Tueste Medio Molido 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación, elaborada principalmente con las variedades Catuaí y Villa Sarchí. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 4500.00, 'Premium', 50),
('Línea Premium - Tueste Medio Grano 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación, elaborada principalmente con las variedades Catuaí y Villa Sarchí. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 4500.00, 'Premium', 50),
('Línea Premium - Tueste Oscuro Grano 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación, elaborada principalmente con las variedades Catuaí y Villa Sarchí. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 4500.00, 'Premium', 50),
('Línea Premium - Tueste Oscuro Molido 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación, elaborada principalmente con las variedades Catuaí y Villa Sarchí. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 4500.00, 'Premium', 50);