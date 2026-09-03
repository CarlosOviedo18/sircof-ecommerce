-- ============================================================
-- Cafes y variantes: una card por cafe en la tienda
-- Fecha: 2026-09-03
-- ============================================================
-- Correr UNA sola vez sobre la BD EXISTENTE.
-- NO correr sobre una BD nueva creada con db.sql: ahi los ids no coinciden
-- (db.sql ya deja el esquema y los datos en su estado final).
--
-- Local (Workbench):     abrir este archivo y ejecutar por pasos.
-- Produccion (Hostinger): phpMyAdmin -> pestana SQL -> pegar por pasos.
--
-- IMPORTANTE: hacer un respaldo antes. Es el unico deshacer que hay.
-- ============================================================


-- ------------------------------------------------------------
-- PASO 0: preflight. Mirar la salida ANTES de seguir.
-- ------------------------------------------------------------
SELECT VERSION();
-- El CHECK del paso 6 solo se APLICA desde MySQL 8.0.16.
-- En 5.7 se parsea y se ignora en silencio; la validacion de la API es la que manda.

SELECT id, name, price, line FROM products ORDER BY id;
-- Deben aparecer los ids 1,2,3,4,6,7,8,9,10,11,12,13. El id 5 no existe (se borro).
-- Si los ids NO coinciden, PARAR: los UPDATE del paso 3 son por id.


-- ------------------------------------------------------------
-- PASO 1: tabla de cafes (el "producto" que ve el cliente)
-- ------------------------------------------------------------
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

-- INSERT IGNORE sobre el slug UNIQUE: se puede reejecutar y no pisa
-- ediciones que haya hecho el admin despues.
INSERT IGNORE INTO coffees (slug, name, category, sort_order) VALUES
  ('cafe-nacional', 'Café Nacional', 'nacional',   10),
  ('linea-premium', 'Línea Premium', 'premium',    20),
  ('san-roque',     'San Roque',     'variedades', 30),
  ('geisha',        'Geisha',        'variedades', 40),
  ('san-isidro',    'San Isidro',    'variedades', 50);

SELECT * FROM coffees;
-- Deben ser 5 filas. INSERT IGNORE tambien se traga errores de truncado,
-- asi que hay que mirar de verdad esta salida.


-- ------------------------------------------------------------
-- PASO 2: columnas de variante en products
-- ------------------------------------------------------------
-- Regla de forma: una variante tiene los CUATRO campos no nulos;
-- un producto suelto (el Pack) los tiene todos NULL. Sin estados intermedios.
--
-- La FK va SIN ON DELETE / ON UPDATE explicitos, por dos razones:
--   1) El default (NO ACTION) ya se comporta como RESTRICT, que es lo que
--      queremos: products -> order_items es CASCADE, asi que un borrado en
--      cascada desde coffees borraria historial de ordenes dos niveles abajo.
--   2) MySQL PROHIBE un CHECK sobre una columna que participa en una FK con
--      acciones referenciales explicitas (ER_CHECK_CONSTRAINT_CLAUSE_USING_
--      FK_REFER_ACTION_COLUMN). Con acciones explicitas, el CHECK del paso 6
--      no se puede crear.
--
-- OJO: los ENUM de grind/roast estan duplicados en cart_item_selections y
-- order_item_selections, y en ROASTS/GRINDS de src/shared/pack.js.
ALTER TABLE products
  ADD COLUMN coffee_id INT NULL AFTER id,
  ADD COLUMN size_g SMALLINT UNSIGNED NULL AFTER price,
  ADD COLUMN grind ENUM('grano','molido') NULL AFTER size_g,
  ADD COLUMN roast ENUM('medio','oscuro') NULL AFTER grind,
  ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1,
  ADD CONSTRAINT fk_products_coffee
    FOREIGN KEY (coffee_id) REFERENCES coffees(id);


-- ------------------------------------------------------------
-- PASO 3: vincular cada variante a su cafe y poblar dimensiones
-- ------------------------------------------------------------
SET @nacional  = (SELECT id FROM coffees WHERE slug='cafe-nacional');
SET @premium   = (SELECT id FROM coffees WHERE slug='linea-premium');
SET @sanroque  = (SELECT id FROM coffees WHERE slug='san-roque');
SET @geisha    = (SELECT id FROM coffees WHERE slug='geisha');
SET @sanisidro = (SELECT id FROM coffees WHERE slug='san-isidro');

-- Cada UPDATE cruza el id CON un discriminador de nombre: si esto se corre
-- contra la BD equivocada, no vincula nada en vez de vincular mal.
-- El LIKE con comodines hace irrelevante el tabulador que tiene el id 10.
UPDATE products SET coffee_id=@nacional  WHERE id IN (1,2)   AND name LIKE '%Nacional%';
UPDATE products SET coffee_id=@premium   WHERE id IN (3,4,6) AND name LIKE '%Premium - Tueste%';
UPDATE products SET coffee_id=@sanroque  WHERE id IN (7,8)   AND name LIKE '%San Roque%';
UPDATE products SET coffee_id=@geisha    WHERE id IN (9,10)  AND name LIKE '%Geisha%';
UPDATE products SET coffee_id=@sanisidro WHERE id IN (11,12) AND name LIKE '%San Isidro%';

-- Valores absolutos: se pueden reejecutar sin efecto.
-- Las variedades llevan roast='medio' aunque no anuncien tueste; es lo que
-- hace que la clave unica del paso 6 sirva (InnoDB trata los NULL como
-- distintos, y con roast nullable se podria insertar la misma variante dos veces).
-- La UI oculta la fila de tueste sola cuando el cafe tiene un solo valor.
UPDATE products SET size_g=500, grind='molido', roast='medio'  WHERE id=1;
UPDATE products SET size_g=350, grind='molido', roast='medio'  WHERE id=2;
UPDATE products SET size_g=500, grind='molido', roast='medio'  WHERE id=3;
UPDATE products SET size_g=500, grind='grano',  roast='medio'  WHERE id=4;
UPDATE products SET size_g=500, grind='molido', roast='oscuro' WHERE id=6;
UPDATE products SET size_g=500, grind='grano',  roast='medio'  WHERE id=7;
UPDATE products SET size_g=500, grind='molido', roast='medio'  WHERE id=8;
UPDATE products SET size_g=500, grind='grano',  roast='medio'  WHERE id=9;
UPDATE products SET size_g=500, grind='molido', roast='medio'  WHERE id=10;
UPDATE products SET size_g=500, grind='grano',  roast='medio'  WHERE id=11;
UPDATE products SET size_g=500, grind='molido', roast='medio'  WHERE id=12;

-- El id 13 (Pack) NO se toca: queda con coffee_id NULL, dimensiones NULL
-- y line='Pack'. Es un producto suelto a proposito.


-- ------------------------------------------------------------
-- PASO 4: mover la descripcion al cafe padre
-- ------------------------------------------------------------
-- La guarda de vacio permite reejecutar sin pisar ediciones posteriores.
UPDATE coffees SET description=(SELECT description FROM products WHERE id=1)
  WHERE slug='cafe-nacional' AND (description IS NULL OR description='');
UPDATE coffees SET description=(SELECT description FROM products WHERE id=3)
  WHERE slug='linea-premium' AND (description IS NULL OR description='');
UPDATE coffees SET description=(SELECT description FROM products WHERE id=7)
  WHERE slug='san-roque'     AND (description IS NULL OR description='');
UPDATE coffees SET description=(SELECT description FROM products WHERE id=9)
  WHERE slug='geisha'        AND (description IS NULL OR description='');
UPDATE coffees SET description=(SELECT description FROM products WHERE id=11)
  WHERE slug='san-isidro'    AND (description IS NULL OR description='');


-- ------------------------------------------------------------
-- PASO 5: limpiar el tabulador del id 10
-- ------------------------------------------------------------
-- Se usa el literal y no TRIM(): TRIM() de MySQL quita espacios, no tabs.
-- Los nombres de variante NO se acortan: los emails de ordenes y el panel
-- de admin hacen join contra products.name VIVO, asi que renombrarlos
-- reescribiria el historial de compras.
UPDATE products SET name='Línea Premium Geisha - Molido 500g' WHERE id=10;


-- ------------------------------------------------------------
-- PASO 6: detector de duplicados, y RECIEN AHI las constraints
-- ------------------------------------------------------------
SELECT coffee_id, size_g, grind, roast, COUNT(*) c
FROM products GROUP BY 1,2,3,4 HAVING c > 1;
-- Debe devolver 0 filas. Si devuelve algo, resolver el duplicado antes
-- de seguir: si no, el ALTER de abajo falla.

ALTER TABLE products
  ADD UNIQUE KEY uq_product_variant (coffee_id, size_g, grind, roast);

ALTER TABLE products
  ADD CONSTRAINT chk_products_variant_shape CHECK (
       (coffee_id IS NULL     AND size_g IS NULL     AND grind IS NULL     AND roast IS NULL)
    OR (coffee_id IS NOT NULL AND size_g IS NOT NULL AND grind IS NOT NULL AND roast IS NOT NULL)
  );


-- ------------------------------------------------------------
-- PASO 7: verificacion final
-- ------------------------------------------------------------
SELECT p.id, c.slug, p.size_g, p.grind, p.roast, p.price, p.line
FROM products p LEFT JOIN coffees c ON p.coffee_id = c.id
ORDER BY p.id;
-- 12 filas con slug; exactamente 1 (el id 13) con slug NULL y dimensiones NULL.

SELECT COUNT(*) AS huerfanos FROM products
WHERE coffee_id IS NULL
  AND id <> (SELECT CAST(setting_value AS UNSIGNED) FROM settings WHERE setting_key='pack_product_id');
-- Debe ser 0: el unico producto sin cafe padre es el Pack.

SELECT COUNT(*) AS order_items FROM order_items;
-- Debe ser el mismo numero que antes de la migracion (no se borro nada).
