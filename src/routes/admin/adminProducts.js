import { Router } from 'express'
import pool from '../../database.js'
import { protectAdmin } from '../../middleware/adminAuth.js'

const router = Router()

// GET /api/admin/products - Listar todos los productos
router.get('/', protectAdmin, async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products ORDER BY id DESC'
    )
    res.json({ success: true, products })
  } catch (error) {
    console.error('Error en GET /admin/products:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/admin/products/:id - Obtener producto por ID
router.get('/:id', protectAdmin, async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    )

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' })
    }

    res.json({ success: true, product: products[0] })
  } catch (error) {
    console.error('Error en GET /admin/products/:id:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/admin/products - Crear producto
router.post('/', protectAdmin, async (req, res) => {
  try {
    const { name, price, line, description, stock, image_url } = req.body

    if (!name || !price || !line) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, precio y línea son campos requeridos'
      })
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, price, line, description, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, price, line, description || null, stock || 0, image_url || null]
    )

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      productId: result.insertId
    })
  } catch (error) {
    console.error('Error en POST /admin/products:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// PUT /api/admin/products/:id - Actualizar producto
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, price, line, description, stock, image_url } = req.body

    if (!name || !price || !line) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, precio y línea son campos requeridos'
      })
    }

    const [result] = await pool.query(
      'UPDATE products SET name = ?, price = ?, line = ?, description = ?, stock = ?, image_url = ? WHERE id = ?',
      [name, price, line, description || null, stock || 0, image_url || null, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' })
    }

    res.json({ success: true, message: 'Producto actualizado exitosamente' })
  } catch (error) {
    console.error('Error en PUT /admin/products/:id:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE /api/admin/products/:id - Eliminar producto
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' })
    }

    res.json({ success: true, message: 'Producto eliminado exitosamente' })
  } catch (error) {
    console.error('Error en DELETE /admin/products/:id:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
