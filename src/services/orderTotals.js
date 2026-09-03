import pool from '../database.js';
import { getShippingCost, getPackProductId } from './settingsService.js';

// Las columnas de dinero son DECIMAL(10,2), asi que redondeamos a 2 decimales.
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Trae el desglose del pack de todos los items de un carrito, en una sola
 * consulta, y lo devuelve indexado por cart_item_id.
 *
 * No se hace LEFT JOIN contra la consulta principal a proposito: multiplicaria
 * las filas de items y todos los consumidores calculan price * quantity sobre ellas.
 */
const getSelectionsByCartItem = async (userId) => {
  const [rows] = await pool.query(
    `SELECT s.cart_item_id, s.roast, s.grind, s.quantity
     FROM cart_item_selections s
     JOIN cart_items ci ON s.cart_item_id = ci.id
     JOIN carts c ON ci.cart_id = c.id
     WHERE c.user_id = ?
     ORDER BY s.id`,
    [userId],
  );

  const porItem = new Map();
  for (const row of rows) {
    if (!porItem.has(row.cart_item_id)) porItem.set(row.cart_item_id, []);
    porItem.get(row.cart_item_id).push({
      roast: row.roast,
      grind: row.grind,
      quantity: Number(row.quantity),
    });
  }

  return porItem;
};

/**
 * Calcula los totales de la orden desde la BD, no desde lo que manda el cliente.
 *
 * El join va por carts.user_id (a diferencia de routes/cart/cart.js, que usa un
 * cart_id ya resuelto), asi la funcion solo recibe el userId y no puede apuntar
 * al carrito de otro usuario.
 *
 * Devuelve tambien los items con el precio de la BD y su desglose de pack, para
 * que quien inserte order_items no tenga que confiar en el body ni volver a consultar.
 *
 * @param {number} userId
 * @returns {Promise<{items: Array, subtotal: number, shippingCost: number, total: number, hasPack: boolean}>}
 */
export const getCartTotals = async (userId) => {
  const [rows] = await pool.query(
    `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.line
     FROM cart_items ci
     JOIN carts c ON ci.cart_id = c.id
     JOIN products p ON ci.product_id = p.id
     WHERE c.user_id = ?
     ORDER BY ci.id DESC`,
    [userId],
  );

  const packProductId = await getPackProductId();
  const selections = await getSelectionsByCartItem(userId);

  // mysql2 devuelve DECIMAL como string: hay que convertir antes de sumar.
  const items = rows.map((row) => ({
    ...row,
    price: Number(row.price),
    quantity: Number(row.quantity),
    is_pack: packProductId !== null && Number(row.product_id) === packProductId,
    packSelections: selections.get(row.id) || [],
  }));

  const subtotal = round2(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  // El precio del pack YA incluye el envio internacional.
  //
  // INVARIANTE: "hay pack => envio 0 para todo el carrito" solo es correcto
  // porque el carrito mixto esta bloqueado en routes/cart/cart.js. Si alguien
  // permite mezclar pack con productos sueltos, esto se vuelve un exploit
  // de envio gratis y hay que calcular el envio por item.
  const hasPack = items.some((item) => item.is_pack);
  const shippingCost = hasPack ? 0 : await getShippingCost();
  const total = round2(subtotal + shippingCost);

  return { items, subtotal, shippingCost, total, hasPack };
};
