import { Router } from 'express'
import db from '../database.js'

const router = Router()

// Ruta pública - obtener todos los productos (para tienda)
router.get('/productos', async (req, res) => {
  try {
    const [productos] = await db.query('SELECT id, name, price, line FROM products')
    res.json(productos)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos', details: error.message })
  }
})

// Ruta pública - obtener 3 productos destacados (para main)
router.get('/productos-destacados', async (req, res) => {
  try {
    const [productos] = await db.query('SELECT id, name, price, line FROM products LIMIT 3')
    res.json(productos)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos destacados', details: error.message })
  }
})

export default router
