

SET FOREIGN_KEY_CHECKS = 0;


CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  line VARCHAR(50),
  stock INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  status ENUM('pending','paid','cancelled') DEFAULT 'pending',
  payment_method ENUM('tilopay','paypal') DEFAULT 'tilopay',
  tilopay_reference VARCHAR(255) DEFAULT NULL,
  tilopay_order_number VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  postal_code VARCHAR(20) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
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

SET FOREIGN_KEY_CHECKS = 1;


INSERT INTO products (name, description, price, line, stock) VALUES
('Café Nacional - Tueste Medio Molido 500g', 'El Café Nacional es una exquisita mezcla que reúne todas nuestras variedades exclusivas, cuidadosamente seleccionadas para ofrecer una experiencia única. Este café 100% puro se distingue por su aroma intenso, cuerpo balanceado y sabor auténtico, reflejando la esencia del café costarricense. Al no estar sujeto a requisitos de venta ni exportación, garantiza frescura, pureza y calidad superior en cada taza.', 3300.00, 'Nacional', 50),
('Café Nacional - Tueste Medio Molido 350g', 'El Café Nacional es una exquisita mezcla que reúne todas nuestras variedades exclusivas, cuidadosamente seleccionadas para ofrecer una experiencia única. Este café 100% puro se distingue por su aroma intenso, cuerpo balanceado y sabor auténtico, reflejando la esencia del café costarricense. Al no estar sujeto a requisitos de venta ni exportación, garantiza frescura, pureza y calidad superior en cada taza.', 2400.00, 'Nacional', 50),
('Línea Premium - Tueste Medio Molido 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación, elaborada principalmente con las variedades Catuaí y Villa Sarchí. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 4500.00, 'Premium', 50),
('Línea Premium - Tueste Medio Grano 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación, elaborada principalmente con las variedades Catuaí y Villa Sarchí. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 4500.00, 'Premium', 50),
('Línea Premium - Tueste Oscuro Grano 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación, elaborada principalmente con las variedades Catuaí y Villa Sarchí. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 4500.00, 'Premium', 50),
('Línea Premium - Tueste Oscuro Molido 500g', 'Nuestra Línea Premium es una mezcla excepcional de cafés con calidad de exportación, elaborada principalmente con las variedades Catuaí y Villa Sarchí. Este café 100% puro ofrece un equilibrio perfecto entre cuerpo, aroma y acidez, destacando las características únicas del café costarricense. Cada grano es seleccionado cuidadosamente para brindar una taza de sabor auténtico, con la frescura y excelencia que distinguen nuestras cosechas.', 4500.00, 'Premium', 50);