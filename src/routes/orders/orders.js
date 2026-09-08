import { Router } from 'express'
import pool from '../../database.js'
import { protectRoute } from '../../middleware/auth.js'

const router = Router()

// NOTA DE SEGURIDAD: acá vivía POST /create-order, que creaba órdenes y mandaba
// emails con el `total` y los `price` que mandaba el CLIENTE (se podía crear una
// orden falsa con precio 1). No tenía ningún llamador en el frontend —el checkout
// real crea la orden en payment.js/paypal.js recalculando en el servidor— así que
// se eliminó. No reponer sin recalcular precios desde la BD.

router.get('/orders', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id

    const [orders] = await pool.query(
      `SELECT o.id, o.total, o.status, o.created_at 
       FROM orders o 
       WHERE o.user_id = ? 
       ORDER BY o.created_at DESC`,
      [userId]
    )

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query(
          `SELECT oi.product_id, oi.quantity, oi.price, p.name 
           FROM order_items oi 
           JOIN products p ON oi.product_id = p.id 
           WHERE oi.order_id = ?`,
          [order.id]
        )
        return { ...order, items }
      })
    )

    res.json({ success: true, orders: ordersWithItems })
  } catch (error) {
    console.error('Error obteniendo órdenes:', error.message)
    res.status(500).json({ success: false, message: 'Error obteniendo las órdenes' })
  }
})

export default router