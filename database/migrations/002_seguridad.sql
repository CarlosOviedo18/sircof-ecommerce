-- ============================================================
-- Correcciones de seguridad (auditoria)
-- Fecha: 2026-09
-- ============================================================
-- Correr UNA vez sobre la BD EXISTENTE (local y Hostinger).
-- Requiere MySQL 8.0.16+ para que los CHECK se apliquen de verdad.
--
-- Preflight: no debe haber cantidades <= 0 ya guardadas, o el CHECK falla.
--   SELECT COUNT(*) FROM cart_items  WHERE quantity <= 0;
--   SELECT COUNT(*) FROM order_items WHERE quantity <= 0;
-- Si devuelven > 0, limpiar esas filas antes de seguir.
-- ============================================================


-- 1. Cantidades siempre positivas (vulnerabilidad: pagar de menos con -N)
ALTER TABLE cart_items
  ADD CONSTRAINT chk_cart_qty CHECK (quantity > 0);

ALTER TABLE order_items
  ADD CONSTRAINT chk_order_item_qty CHECK (quantity > 0),
  ADD CONSTRAINT chk_order_item_price CHECK (price >= 0);


-- 2. Idempotencia de la confirmacion de Tilopay: dos confirmaciones en
--    paralelo con el mismo tilopay_order_number no pueden crear dos pagos.
--    UNIQUE parcial no existe en MySQL; se usa indice normal + el UPDATE
--    condicional (status='pending') que ya hace payment.js. El indice ayuda
--    a la busqueda y documenta la intencion.
CREATE INDEX idx_orders_tpay_number ON orders (tilopay_order_number);


-- 3. Revocacion de sesion: version del token. Se incrementa al cambiar/
--    resetear contrasena y al borrar el usuario; el JWT la incluye y
--    protectRoute la compara. Un token viejo deja de servir.
ALTER TABLE users
  ADD COLUMN token_version INT NOT NULL DEFAULT 0;


-- 4. Reseteo de contrasena: el codigo pasa a guardarse HASHEADO (SHA-256 = 64
--    chars) en vez de en claro, y se agrega contador de intentos para bloquear
--    al 5o fallo. Los codigos viejos (6 digitos en claro) quedan invalidos, lo
--    cual es correcto: cualquier reseteo en curso se reinicia.
ALTER TABLE password_resets
  MODIFY COLUMN code VARCHAR(64) NOT NULL,
  ADD COLUMN attempts TINYINT UNSIGNED NOT NULL DEFAULT 0;
