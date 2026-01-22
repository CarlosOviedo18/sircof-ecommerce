import { Router } from 'express'
import pool from '../database.js'
import { verifyToken } from '../lib/jwt.js'

const router = Router()

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Token requerido' })

    const decoded = verifyToken(token)
    req.userId = decoded.id
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

// GET /api/cart - Obtener carrito del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId

    // Obtener o crear carrito del usuario
    let [carts] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId])
    
    let cartId = carts[0]?.id
    
    if (!cartId) {
      const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId])
      cartId = result.insertId
    }

    // Obtener items del carrito
    const [cartItems] = await pool.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.line
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?
       ORDER BY ci.id DESC`,
      [cartId]
    )

    res.json({ success: true, items: cartItems || [] })
  } catch (error) {
    console.error('Error al obtener carrito:', error)
    res.status(500).json({ success: false, message: 'Error al obtener el carrito' })
  }
})

// POST /api/cart/add - Agregar producto
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const { productId, cantidad } = req.body

    if (!productId || !cantidad) {
      return res.status(400).json({ message: 'Datos incompletos' })
    }

    // Obtener carrito del usuario
    let [carts] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId])
    let cartId = carts[0]?.id

    if (!cartId) {
      const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId])
      cartId = result.insertId
    }

    // Verificar si el producto ya está en el carrito
    const [existingItem] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    )

    if (existingItem.length > 0) {
      // Actualizar cantidad
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [cantidad, existingItem[0].id]
      )
    } else {
      // Insertar nuevo item
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cartId, productId, cantidad]
      )
    }

    res.json({ success: true, message: 'Producto agregado al carrito' })
  } catch (error) {
    console.error('Error al agregar:', error)
    res.status(500).json({ success: false, message: 'Error al agregar' })
  }
})

// DELETE /api/cart/clear - Vaciar todo el carrito
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId

    // Obtener el carrito del usuario
    const [carts] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId])
    
    if (carts.length === 0) {
      return res.json({ success: true, message: 'Carrito vacío' })
    }

    const cartId = carts[0].id

    // Eliminar todos los items del carrito
    await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId])

    res.json({ success: true, message: 'Carrito vaciado correctamente' })
  } catch (error) {
    console.error('Error al vaciar carrito:', error)
    res.status(500).json({ success: false, message: 'Error al vaciar carrito' })
  }
})

// DELETE /api/cart/:cartItemId - Remover producto
router.delete('/:cartItemId', authMiddleware, async (req, res) => {
  try {
    const { cartItemId } = req.params
    const userId = req.userId

    // Verificar que el item pertenece al usuario
    const [items] = await pool.query(
      `SELECT ci.id FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [cartItemId, userId]
    )

    if (items.length === 0) {
      return res.status(403).json({ message: 'No autorizado' })
    }

    await pool.query('DELETE FROM cart_items WHERE id = ?', [cartItemId])
    res.json({ success: true, message: 'Producto removido' })
  } catch (error) {
    console.error('Error al remover:', error)
    res.status(500).json({ success: false, message: 'Error al remover' })
  }
})

// PATCH /api/cart/:cartItemId - Cambiar cantidad
router.patch('/:cartItemId', authMiddleware, async (req, res) => {
  try {
    const { cartItemId } = req.params
    const { cantidad } = req.body
    const userId = req.userId

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({ message: 'Cantidad inválida' })
    }

    // Verificar que el item pertenece al usuario
    const [items] = await pool.query(
      `SELECT ci.id FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [cartItemId, userId]
    )

    if (items.length === 0) {
      return res.status(403).json({ message: 'No autorizado' })
    }

    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [cantidad, cartItemId])
    res.json({ success: true, message: 'Cantidad actualizada' })
  } catch (error) {
    console.error('Error al actualizar:', error)
    res.status(500).json({ success: false, message: 'Error al actualizar' })
  }
})

// DELETE /api/cart/clear - Vaciar todo el carrito
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId

    // Obtener el carrito del usuario
    const [carts] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId])
    
    if (carts.length === 0) {
      return res.json({ success: true, message: 'Carrito vacío' })
    }

    const cartId = carts[0].id

    // Eliminar todos los items del carrito
    await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId])

    res.json({ success: true, message: 'Carrito vaciado correctamente' })
  } catch (error) {
    console.error('Error al vaciar carrito:', error)
    res.status(500).json({ success: false, message: 'Error al vaciar carrito' })
  }
})

export default router