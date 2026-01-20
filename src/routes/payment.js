import { Router } from 'express'
import pool from '../database.js'
import { verifyToken } from '../lib/jwt.js'
import fetch from 'node-fetch'

const router = Router()

// Middleware de autenticación
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

// Función para login en Tilopay
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
    const token = data.token || data.access_token || data.auth_token || data
    
    return token
  } catch (error) {
    console.error('Error en login Tilopay:', error.message)
    throw error
  }
}

// POST /api/payment/process - Procesar el pago
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

    console.log('Creando orden:', orderReference)

    const tilopayToken = await loginTilopay()

    const linkPaymentPayload = {
      key: process.env.TILOPAY_API_KEY,
      amount: amount.toFixed(2),
      currency: 'CRC',
      reference: orderReference,
      type: 1,
      description: `Compra de ${cartItems.length} productos en SIRCOF Café`,
      client: user.name,
      callback_url: 'http://localhost:5173/checkout/success',
      webhook_url: 'http://localhost:3000/api/payment/webhook'
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

    console.log('Orden guardada con ID:', orderResult.insertId)

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

// POST /api/payment/webhook - Tilopay nos avisa cuando se completa el pago
router.post('/webhook', async (req, res) => {
  try {
    const {
      code,
      orderNumber,
      tilopayOrderId,
      address,
      city,
      postal_code,
      country,
      creditCardBrand,
      last4CreditCardNumber,
      shipping_address,
      shipping_city,
      shipping_postal,
      billing_address,
      billing_city
    } = req.body

    let orderStatus = 'pending'
    if (code === '1' || code === 1) {
      orderStatus = 'paid'
      console.log('Pago aprobado - Orden:', orderNumber)
    } else if (code === '0' || code === 0 || code === '2' || code === 2) {
      orderStatus = 'cancelled'
      console.log('Pago rechazado - Orden:', orderNumber)
    }

    const [orders] = await pool.query(
      'SELECT id FROM orders WHERE tilopay_reference = ?',
      [orderNumber]
    )

    if (orders.length === 0) {
      console.warn('Orden no encontrada:', orderNumber)
      return res.json({ success: false, message: 'Orden no encontrada' })
    }

    const orderId = orders[0].id

    await pool.query(
      `UPDATE orders 
       SET status = ?, 
           tilopay_transaction_id = ?,
           address = ?,
           city = ?,
           postal_code = ?,
           country = ?
       WHERE tilopay_reference = ?`,
      [
        orderStatus,
        tilopayOrderId,
        address || shipping_address || billing_address || null,
        city || shipping_city || null,
        postal_code || shipping_postal || null,
        country || null,
        orderNumber
      ]
    )

    console.log('Orden actualizada - ID:', orderId, 'Status:', orderStatus)

    res.json({ success: true })
  } catch (error) {
    console.error('Error en webhook:', error)
    res.status(500).json({ success: false })
  }
})

export default router