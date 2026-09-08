import pool from '../database.js';

/**
 * Inserta los items de una orden y, si alguno es un pack, su desglose.
 *
 * Compartido por las dos rutas de pago para que no se desvien entre si.
 * Recibe una CONEXION (no el pool) porque se ejecuta dentro de la transaccion
 * que abre la ruta junto con el INSERT de la orden.
 *
 * @param {object} conn conexion de mysql2 dentro de una transaccion
 * @param {number} orderId
 * @param {Array} items los items de getCartTotals (precios de la BD, con packSelections)
 */
export const insertOrderItems = async (conn, orderId, items) => {
  for (const item of items) {
    const [result] = await conn.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES (?, ?, ?, ?)`,
      [orderId, item.product_id, item.quantity, item.price],
    );

    if (item.packSelections?.length) {
      for (const sel of item.packSelections) {
        await conn.query(
          `INSERT INTO order_item_selections (order_item_id, roast, grind, quantity)
           VALUES (?, ?, ?, ?)`,
          [result.insertId, sel.roast, sel.grind, sel.quantity],
        );
      }
    }
  }
};

/**
 * Descuenta el stock de los productos de una orden, al confirmarse el pago.
 *
 * El descuento es ATÓMICO y condicional (stock >= quantity): si dos órdenes
 * pelean por la última unidad, solo una la descuenta. Se corre dentro de la
 * transacción que marca la orden como pagada.
 *
 * Devuelve los items que NO se pudieron descontar (sobreventa): el pago ya se
 * cobró, así que no se puede rechazar; se devuelven para loguearlos y que
 * alguien los resuelva (reembolso o reposición).
 *
 * @param {object} conn conexión dentro de una transacción
 * @param {number} orderId
 * @returns {Promise<Array>} items sin stock (vacío si todo bien)
 */
export const decrementStockForOrder = async (conn, orderId) => {
  const [items] = await conn.query(
    'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
    [orderId],
  );

  const sobreventa = [];
  for (const item of items) {
    const [res] = await conn.query(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [item.quantity, item.product_id, item.quantity],
    );
    if (res.affectedRows === 0) sobreventa.push(item);
  }

  return sobreventa;
};

/**
 * Items de una orden con su desglose de pack, para los emails y el admin.
 * Dos consultas, sin N+1.
 */
export const getOrderItemsWithSelections = async (orderId) => {
  const [items] = await pool.query(
    `SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId],
  );

  if (items.length === 0) return [];

  const [selections] = await pool.query(
    `SELECT s.order_item_id, s.roast, s.grind, s.quantity
     FROM order_item_selections s
     JOIN order_items oi ON s.order_item_id = oi.id
     WHERE oi.order_id = ?
     ORDER BY s.id`,
    [orderId],
  );

  const porItem = new Map();
  for (const s of selections) {
    if (!porItem.has(s.order_item_id)) porItem.set(s.order_item_id, []);
    porItem.get(s.order_item_id).push({
      roast: s.roast,
      grind: s.grind,
      quantity: Number(s.quantity),
    });
  }

  return items.map((item) => ({
    ...item,
    packSelections: porItem.get(item.id) || [],
  }));
};
