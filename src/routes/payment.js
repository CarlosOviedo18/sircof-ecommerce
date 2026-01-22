import { Router } from 'express'
import pool from '../database.js'
import { verifyToken } from '../lib/jwt.js'
import fetch from 'node-fetch'

const router = Router()

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' })
    }

    const decoded = verifyToken(token)
    req.userId = decoded.id
    next()
  } catch (error) {
    console.error('Error verificando token:', error)
    return res.status(401).json({ message: 'Token inválido' })
  }
}

const loginTilopay = async () => {
  try {
    const loginPayload = {
      apiuser: process.env.TILOPAY_API_USER,
      password: process.env.TILOPAY_API_PASSWORD
    }

    const response = await fetch('https://app.tilopay.com/api/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    })

    if (!response.ok) {
      throw new Error(`Error en login Tilopay: ${response.status}`)
    }

    const data = await response.json()
    return data.token || data.access_token || data.auth_token || data
  } catch (error) {
    console.error('Error en login Tilopay:', error.message)
    throw error
  }
}

router.post('/process', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const { cartItems, amount, phone } = req.body

    if (!cartItems || !amount || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Carrito vacío o datos incompletos'
      })
    }

    const [users] = await pool.query(
      'SELECT email, name FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    const user = users[0]
    const orderReference = `ORDER_${userId}_${Date.now()}`

    const tilopayToken = await loginTilopay()

    const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3000/api/payment/webhook'
    const callbackUrl = process.env.CALLBACK_URL || 'http://localhost:5173/checkout/success'

    const linkPaymentPayload = {
      key: process.env.TILOPAY_API_KEY,
      amount: amount.toFixed(2),
      currency: 'CRC',
      reference: orderReference,
      type: 1,
      description: `Compra de ${cartItems.length} productos en SIRCOF Café`,
      client: user.name,
      callback_url: callbackUrl,
      webhook_url: webhookUrl
    }

    const tilopayResponse = await fetch('https://app.tilopay.com/api/v1/createLinkPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tilopayToken}`
      },
      body: JSON.stringify(linkPaymentPayload)
    })

    if (!tilopayResponse.ok) {
      const error = await tilopayResponse.text()
      console.error('Error de Tilopay:', error)
      throw new Error(error || 'Error en Tilopay')
    }

    const tilopayData = await tilopayResponse.json()

    const [orderResult] = await pool.query(
      `INSERT INTO orders (user_id, total, status, tilopay_reference, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, amount, 'pending', orderReference, phone]
    )

    for (const item of cartItems) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES (?, ?, ?, ?)`,
        [orderResult.insertId, item.product_id, item.quantity, item.price]
      )
    }

    res.json({
      success: true,
      paymentUrl: tilopayData.url,
      orderId: orderResult.insertId,
      orderReference,
      tilopayLinkId: tilopayData.id
    })
  } catch (error) {
    console.error('Error procesando pago:', error.message)
    res.status(500).json({
      success: false,
      message: error.message || 'Error procesando pago'
    })
  }
})

router.post('/webhook', async (req, res) => {
  try {
    const data = { ...req.body, ...req.query }

    const {
      code,
      orderNumber,
      tilopayOrderId,
      reference
    } = data

    if (!code || (!orderNumber && !reference)) {
      return res.status(400).json({ success: false, message: 'Datos incompletos en webhook' })
    }

    let orderStatus = 'pending'
    if (code === '1' || code === 1) {
      orderStatus = 'paid'
    } else if (code === '0' || code === 0 || code === '2' || code === 2) {
      orderStatus = 'cancelled'
    }

    const searchReference = orderNumber || reference

    const [orders] = await pool.query(
      'SELECT id FROM orders WHERE tilopay_reference = ?',
      [searchReference]
    )

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' })
    }

    const orderId = orders[0].id

    await pool.query(
      `UPDATE orders SET status = ?, tilopay_transaction_id = ? WHERE id = ?`,
      [orderStatus, tilopayOrderId, orderId]
    )

    res.json({ success: true, message: 'Orden actualizada correctamente' })
  } catch (error) {
    console.error('Error en webhook:', error)
    res.status(500).json({ success: false, message: error.message })
  }





  
})

export default router