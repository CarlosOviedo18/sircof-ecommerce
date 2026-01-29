import { Router } from 'express'
import pool from '../database.js'
import { protectRoute } from '../middleware/auth.js'
import { sendOrderEmails } from '../services/emailService.js'

const router = Router()

// Crear nueva orden y enviar emails
router.post('/create-order', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id
    const { products, total, clientName, clientEmail, clientPhone, address } = req.body

    // Validaciones
    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay productos en la orden' })
    }

    // Crear orden en BD
    const [orderResult] = await pool.query(
      'INSERT INTO orders (user_id, total, status, created_at) VALUES (?, ?, ?, NOW())',
      [userId, total, 'pending']
    )

    const orderId = orderResult.insertId

    // Insertar items de la orden
    for (const item of products) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      )
    }

    // Preparar datos para emails
    const orderData = {
      orderId,
      products,
      total,
      clientName,
      clientEmail,
      clientPhone,
      address,
    }

    // Enviar emails
    const emailResult = await sendOrderEmails(orderData)

    if (!emailResult.success) {
      console.warn('⚠ Orden creada pero hubo error al enviar emails')
    }

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      orderId,
      emailsSent: emailResult,
    })
  } catch (error) {
    console.error('Error al crear pedido:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})


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