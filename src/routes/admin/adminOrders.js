import { Router } from 'express'
import pool from '../../database.js'
import { protectAdmin } from '../../middleware/adminAuth.js'

const router = Router()

// GET /api/admin/orders - Listar todas las órdenes con sus items
router.get('/', protectAdmin, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    )

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query(
          `SELECT oi.*, p.name as product_name
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
    console.error('Error en GET /admin/orders:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// PATCH /api/admin/orders/:id/status - Cambiar estado de una orden
router.patch('/:id/status', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'paid', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Los estados válidos son: ${validStatuses.join(', ')}`
      })
    }

    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' })
    }

    res.json({ success: true, message: `Estado de orden #${id} actualizado a "${status}"` })
  } catch (error) {
    console.error('Error en PATCH /admin/orders/:id/status:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
