import { Router } from 'express'
import pool from '../../database.js'
import { getCatalog, getCoffeeBySlug, getProductWithCoffee } from '../../services/catalogService.js'

const router = Router()

// GET /api/catalogo - Cafés con sus variantes anidadas (lo que usa la tienda)
router.get('/catalogo', async (req, res) => {
  try {
    const coffees = await getCatalog()
    res.json({ success: true, coffees })
  } catch (error) {
    console.error('Error al obtener el catálogo:', error.message)
    res.status(500).json({ success: false, message: 'Error al obtener el catálogo' })
  }
})

// GET /api/catalogo/:slug - Un café con sus variantes
router.get('/catalogo/:slug', async (req, res) => {
  try {
    const coffee = await getCoffeeBySlug(req.params.slug)

    if (!coffee) {
      return res.status(404).json({ success: false, message: 'Café no encontrado' })
    }

    res.json({ success: true, coffee })
  } catch (error) {
    console.error('Error al obtener el café:', error.message)
    res.status(500).json({ success: false, message: 'Error al obtener el café' })
  }
})

// GET /api/products/:id - Una variante con su café.
// Resuelve las URLs viejas /producto/:id hacia /cafe/:slug.
router.get('/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    const data = await getProductWithCoffee(id)

    if (!data) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' })
    }

    res.json({ success: true, ...data })
  } catch (error) {
    console.error('Error al obtener el producto:', error.message)
    res.status(500).json({ success: false, message: 'Error al obtener el producto' })
  }
})

// Ruta pública - lista plana de productos.
// Se mantiene la MISMA forma de respuesta que antes: la usan hooks viejos.
// La tienda ahora usa /api/catalogo.
router.get('/productos', async (req, res) => {
  try {
    const [productos] = await pool.query(
      'SELECT id, name, price, line, image_url FROM products WHERE active = 1'
    )
    res.json(productos)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos', details: error.message })
  }
})

// Ruta pública - 3 destacados para el home.
// Devuelve 3 CAFÉS distintos (su variante más barata), no 3 variantes del
// mismo café. El pack se excluye: cuesta ~20x un café suelto.
router.get('/productos-destacados', async (req, res) => {
  try {
    const coffees = await getCatalog()

    const destacados = coffees
      .filter((c) => !c.isPack)
      .slice(0, 3)
      .map((c) => {
        const barata = c.variants.reduce((a, b) => (a.price <= b.price ? a : b))
        return {
          id: barata.id,
          name: c.name,
          price: barata.price,
          line: c.line,
          slug: c.slug,
          image_url: c.imageUrl,
        }
      })

    res.json(destacados)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos destacados', details: error.message })
  }
})

export default router
