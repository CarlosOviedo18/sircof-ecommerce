import { Router } from 'express'
import pool from '../database.js'
import { protectRoute } from '../middleware/auth.js'

const router = Router()

// Obtener todas las órdenes del usuario autenticado
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
    console.error('Error obteniendo órdenes:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router