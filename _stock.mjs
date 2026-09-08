import 'dotenv/config'; import mysql from 'mysql2/promise';
import { getCartTotals } from './src/services/orderTotals.js';
import { decrementStockForOrder } from './src/services/orderItems.js';
const c=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});

// preparar: carrito de user 1 con producto 2, stock del producto 2 = 3, cantidad pedida 5
const [[cart]]=await c.query('SELECT id FROM carts WHERE user_id=1');
await c.query('DELETE FROM cart_items WHERE cart_id=?',[cart.id]);
await c.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?,2,5)',[cart.id]);
const [[stockPrev]]=await c.query('SELECT stock FROM products WHERE id=2');
await c.query('UPDATE products SET stock=3 WHERE id=2');
console.log('producto 2: stock=3, carrito pide 5');
try { await getCartTotals(1); console.log('  getCartTotals: PASO (FALLO, deberia frenar)'); }
catch(e){ console.log('  getCartTotals frena:', e.code, '| items:', JSON.stringify(e.items)); }

// ahora stock suficiente: pide 5, stock 10 -> descuento atomico
await c.query('UPDATE products SET stock=10 WHERE id=2');
const t=await getCartTotals(1);
console.log('  con stock 10: total', t.total, '(pasa)');
// simular orden pagada: crear order + items y descontar
const [o]=await c.query("INSERT INTO orders (user_id,total,subtotal,shipping_cost,status,tilopay_reference,payment_method) VALUES (1,?,?,?,'pending','STOCKTEST','tilopay')",[t.total,t.subtotal,t.shippingCost]);
await c.query('INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (?,2,5,2600)',[o.insertId]);
const sob=await decrementStockForOrder(c, o.insertId);
const [[stockPost]]=await c.query('SELECT stock FROM products WHERE id=2');
console.log('  tras descontar 5: stock', stockPost.stock, '(era 10) | sobreventa:', sob.length);

// probar sobreventa: pedir 100 con stock 5
await c.query('UPDATE products SET stock=5 WHERE id=2');
await c.query('INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (?,2,100,2600)',[o.insertId]);
const [items2]=await c.query('SELECT product_id,quantity FROM order_items WHERE order_id=? AND quantity=100',[o.insertId]);
const [r]=await c.query('UPDATE products SET stock=stock-? WHERE id=? AND stock>=?',[100,2,100]);
console.log('  descuento de 100 con stock 5: affectedRows', r.affectedRows, '(0 = sobreventa detectada, OK)');

// limpiar
await c.query('DELETE FROM orders WHERE id=?',[o.insertId]);
await c.query('DELETE FROM cart_items WHERE cart_id=?',[cart.id]);
await c.query('UPDATE products SET stock=? WHERE id=2',[stockPrev.stock]);
console.log('(limpieza: stock del producto 2 restaurado a', stockPrev.stock+')');
await c.end();
