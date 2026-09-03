import { Router } from 'express'
import pool from '../../database.js'
import { protectRoute } from '../../middleware/auth.js'
import { getPackProductId } from '../../services/settingsService.js'
import { validatePackSelections, PACK_ERRORS, PACK_SIZE } from '../../shared/pack.js'

const router = Router()

// GET /api/cart - Obtener carrito del usuario
router.get('/', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id

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

    // Desglose del pack en una sola consulta extra (no N+1, y sin LEFT JOIN
    // arriba: eso multiplicaría las filas de items y rompería los subtotales).
    const [selections] = await pool.query(
      `SELECT s.cart_item_id, s.roast, s.grind, s.quantity
       FROM cart_item_selections s
       JOIN cart_items ci ON s.cart_item_id = ci.id
       WHERE ci.cart_id = ?
       ORDER BY s.id`,
      [cartId]
    )

    const porItem = new Map()
    for (const s of selections) {
      if (!porItem.has(s.cart_item_id)) porItem.set(s.cart_item_id, [])
      porItem.get(s.cart_item_id).push({
        roast: s.roast,
        grind: s.grind,
        quantity: Number(s.quantity)
      })
    }

    const packProductId = await getPackProductId()

    const items = (cartItems || []).map(item => ({
      ...item,
      is_pack: packProductId !== null && Number(item.product_id) === packProductId,
      packSelections: porItem.get(item.id) || []
    }))

    res.json({ success: true, items })
  } catch (error) {
    console.error('Error al obtener carrito:', error)
    res.status(500).json({ success: false, message: 'Error al obtener el carrito' })
  }
})

// POST /api/cart/add - Agregar producto
router.post('/add', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id
    const { productId, cantidad, packSelections } = req.body

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

    const packProductId = await getPackProductId()
    const isPack = packProductId !== null && Number(productId) === packProductId

    // Estado actual del carrito, para decidir antes de escribir nada
    const [itemsActuales] = await pool.query(
      'SELECT id, product_id FROM cart_items WHERE cart_id = ?',
      [cartId]
    )
    const cartHasPack = itemsActuales.some(i => Number(i.product_id) === packProductId)
    const cartHasOther = itemsActuales.some(i => Number(i.product_id) !== packProductId)

    // El pack se envía al exterior con el envío incluido y los productos sueltos
    // llevan envío nacional: mezclarlos no se puede cobrar bien.
    if (isPack && cartHasOther) {
      return res.status(409).json({
        success: false,
        code: PACK_ERRORS.MIXED_CART_PACK,
        message: 'El pack no se puede combinar con productos individuales'
      })
    }

    if (!isPack && cartHasPack) {
      return res.status(409).json({
        success: false,
        code: PACK_ERRORS.MIXED_CART_PRODUCTS,
        message: 'No se pueden agregar productos individuales junto al pack'
      })
    }

    if (isPack) {
      if (cartHasPack) {
        return res.status(409).json({
          success: false,
          code: PACK_ERRORS.PACK_ALREADY_IN_CART,
          message: 'Ya tenés un pack en el carrito'
        })
      }

      // El desglose describe UN pack, así que la cantidad es siempre 1.
      // Se ignora lo que haya mandado el cliente.
      const validacion = validatePackSelections(packSelections)

      if (!validacion.ok) {
        return res.status(400).json({
          success: false,
          code: validacion.code,
          message: `El pack debe tener exactamente ${PACK_SIZE} paquetes`
        })
      }

      // Transacción: un pack sin desglose es indespachable e invisible en la UI.
      const conn = await pool.getConnection()
      try {
        await conn.beginTransaction()

        const [result] = await conn.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, 1)',
          [cartId, productId]
        )

        for (const sel of validacion.selections) {
          await conn.query(
            'INSERT INTO cart_item_selections (cart_item_id, roast, grind, quantity) VALUES (?, ?, ?, ?)',
            [result.insertId, sel.roast, sel.grind, sel.quantity]
          )
        }

        await conn.commit()
      } catch (error) {
        await conn.rollback()
        throw error
      } finally {
        conn.release()
      }

      return res.json({ success: true, message: 'Pack agregado al carrito' })
    }

    // Productos normales: la lógica de dedupe/incremento de siempre
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
router.delete('/clear', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id

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
router.delete('/:cartItemId', protectRoute, async (req, res) => {
  try {
    const { cartItemId } = req.params
    const userId = req.user.id

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
router.patch('/:cartItemId', protectRoute, async (req, res) => {
  try {
    const { cartItemId } = req.params
    const { cantidad } = req.body
    const userId = req.user.id

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({ message: 'Cantidad inválida' })
    }

    // Verificar que el item pertenece al usuario
    const [items] = await pool.query(
      `SELECT ci.id, ci.product_id FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [cartItemId, userId]
    )

    if (items.length === 0) {
      return res.status(403).json({ message: 'No autorizado' })
    }

    // El pack va siempre en cantidad 1: su desglose describe UN pack de 9.
    // Sin este guard, los botones +/- darían 2 packs con un solo desglose.
    const packProductId = await getPackProductId()

    if (packProductId !== null && Number(items[0].product_id) === packProductId && Number(cantidad) !== 1) {
      return res.status(400).json({
        success: false,
        code: PACK_ERRORS.PACK_QTY_FIXED,
        message: 'La cantidad del pack no se puede cambiar'
      })
    }

    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [cantidad, cartItemId])
    res.json({ success: true, message: 'Cantidad actualizada' })
  } catch (error) {
    console.error('Error al actualizar:', error)
    res.status(500).json({ success: false, message: 'Error al actualizar' })
  }
})

export default router
