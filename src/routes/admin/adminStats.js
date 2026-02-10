import { Router } from 'express'
import pool from '../../database.js'
import { protectAdmin } from '../../middleware/adminAuth.js'

const router = Router()

// GET /api/admin/stats - Estadísticas del dashboard
router.get('/', protectAdmin, async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users')
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) as totalProducts FROM products')
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) as totalOrders FROM orders')
    const [[{ totalRevenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total), 0) as totalRevenue FROM orders WHERE status = 'paid'"
    )
    const [[{ pendingOrders }]] = await pool.query(
      "SELECT COUNT(*) as pendingOrders FROM orders WHERE status = 'pending'"
    )

    // Ventas de los últimos 7 días
    const [recentSales] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
       FROM orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    )

    // Últimas 5 órdenes
    const [latestOrders] = await pool.query(
      `SELECT o.id, o.total, o.status, o.created_at, u.name as user_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`
    )

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        recentSales,
        latestOrders
      }
    })
  } catch (error) {
    console.error('Error en GET /admin/stats:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
