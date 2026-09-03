import { Router } from 'express'
import pool from '../../database.js'
import { protectAdmin } from '../../middleware/adminAuth.js'
import { getPackProductId, clearSettingsCache } from '../../services/settingsService.js'
import { validateVariantShape, VARIANT_ERRORS } from '../../shared/variants.js'

const router = Router()

// GET /api/admin/products - Listar todos los productos
router.get('/', protectAdmin, async (req, res) => {
  try {
    // Se trae el nombre del café para poder mostrar a qué pertenece cada
    // presentación, y detectar las que quedaron huérfanas.
    const [products] = await pool.query(
      `SELECT p.*, c.name AS coffee_name, c.slug AS coffee_slug
       FROM products p LEFT JOIN coffees c ON p.coffee_id = c.id
       ORDER BY p.id DESC`
    )
    res.json({ success: true, products })
  } catch (error) {
    console.error('Error en GET /admin/products:', error.message)
    res.status(500).json({ success: false, message: 'Error al obtener los productos' })
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

// Líneas que un admin puede escribir. 'Pack' NO está: si alguien la tipea,
// getPackProductId() podría empezar a apuntar al producto equivocado y el
// bloqueo de envíos a Costa Rica dejaría de aplicar.
const LINEAS_PERMITIDAS = ['Nacional', 'Premium']

// La validación de antes era `if (!name || !price || !line)`: dejaba pasar
// precios negativos, stock con letras y cafés inexistentes.
const validarProducto = async (body) => {
  const nombre = String(body.name ?? '').trim()
  if (nombre.length < 1 || nombre.length > 150) {
    return { ok: false, message: 'El nombre es requerido (máx. 150 caracteres)' }
  }

  const precio = Number(body.price)
  if (!Number.isFinite(precio) || precio <= 0 || precio > 99999999.99) {
    return { ok: false, message: 'El precio debe ser un número mayor a 0' }
  }

  const stock = body.stock === '' || body.stock == null ? 0 : Number(body.stock)
  if (!Number.isInteger(stock) || stock < 0) {
    return { ok: false, message: 'El stock debe ser un entero mayor o igual a 0' }
  }

  if (!LINEAS_PERMITIDAS.includes(body.line)) {
    return { ok: false, message: `La línea debe ser una de: ${LINEAS_PERMITIDAS.join(', ')}` }
  }

  const coffeeId = body.coffee_id === '' || body.coffee_id == null ? null : Number(body.coffee_id)

  const forma = validateVariantShape({
    coffee_id: coffeeId,
    size_g: body.size_g,
    grind: body.grind,
    roast: body.roast,
  })

  if (!forma.ok) {
    return {
      ok: false,
      code: forma.code,
      message: 'Una presentación necesita café, tamaño, molienda y tueste; un producto suelto, ninguno de los cuatro',
    }
  }

  if (coffeeId !== null) {
    const [cf] = await pool.query('SELECT id FROM coffees WHERE id = ?', [coffeeId])
    if (cf.length === 0) {
      return { ok: false, code: VARIANT_ERRORS.COFFEE_NOT_FOUND, message: 'El café indicado no existe' }
    }
  }

  return {
    ok: true,
    valores: {
      name: nombre,
      price: Math.round(precio * 100) / 100,
      line: body.line,
      description: body.description || null,
      stock,
      image_url: body.image_url || null,
      coffee_id: coffeeId,
      size_g: coffeeId === null ? null : Number(body.size_g),
      grind: coffeeId === null ? null : body.grind,
      roast: coffeeId === null ? null : body.roast,
    },
  }
}

// La fila del pack no se toca desde el admin: cambiarle la línea o el café
// rompería la detección del pack y con ella el guard de Costa Rica.
const esFilaProtegida = async (id) => Number(id) === (await getPackProductId())

// POST /api/admin/products - Crear producto
router.post('/', protectAdmin, async (req, res) => {
  try {
    const v = await validarProducto(req.body)
    if (!v.ok) return res.status(400).json({ success: false, code: v.code, message: v.message })

    const p = v.valores
    const [result] = await pool.query(
      `INSERT INTO products (name, price, line, description, stock, image_url, coffee_id, size_g, grind, roast)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.name, p.price, p.line, p.description, p.stock, p.image_url, p.coffee_id, p.size_g, p.grind, p.roast]
    )

    clearSettingsCache()

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      productId: result.insertId
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        code: VARIANT_ERRORS.VARIANT_ALREADY_EXISTS,
        message: 'Ya existe una presentación con ese tamaño, molienda y tueste para ese café'
      })
    }
    console.error('Error en POST /admin/products:', error.message)
    res.status(500).json({ success: false, message: 'Error al crear el producto' })
  }
})

// PUT /api/admin/products/:id - Actualizar producto
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (await esFilaProtegida(id)) {
      const [actual] = await pool.query('SELECT line, coffee_id FROM products WHERE id = ?', [id])
      const cambiaLinea = actual[0] && req.body.line !== actual[0].line
      const cambiaCafe = actual[0] && (req.body.coffee_id ?? null) !== actual[0].coffee_id

      if (cambiaLinea || cambiaCafe) {
        return res.status(409).json({
          success: false,
          code: 'PACK_ROW_PROTECTED',
          message: 'No se puede cambiar la línea ni el café del producto Pack'
        })
      }
    }

    const v = await validarProducto(req.body)
    if (!v.ok) return res.status(400).json({ success: false, code: v.code, message: v.message })

    const p = v.valores
    const [result] = await pool.query(
      `UPDATE products SET name=?, price=?, line=?, description=?, stock=?, image_url=?,
              coffee_id=?, size_g=?, grind=?, roast=?
       WHERE id = ?`,
      [p.name, p.price, p.line, p.description, p.stock, p.image_url, p.coffee_id, p.size_g, p.grind, p.roast, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' })
    }

    clearSettingsCache()

    res.json({ success: true, message: 'Producto actualizado exitosamente' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        code: VARIANT_ERRORS.VARIANT_ALREADY_EXISTS,
        message: 'Ya existe una presentación con ese tamaño, molienda y tueste para ese café'
      })
    }
    console.error('Error en PUT /admin/products/:id:', error.message)
    res.status(500).json({ success: false, message: 'Error al actualizar el producto' })
  }
})

// DELETE /api/admin/products/:id - Eliminar producto
//
// order_items.product_id es ON DELETE CASCADE: borrar un producto con
// historial destruye las lineas de esas ordenes en silencio, dejandolas con
// un total que ya no cuadra con sus items. Por eso se cuenta primero.
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (await esFilaProtegida(id)) {
      return res.status(409).json({
        success: false,
        code: 'PACK_ROW_PROTECTED',
        message: 'El producto Pack no se puede eliminar'
      })
    }

    const [ordenes] = await pool.query(
      'SELECT COUNT(DISTINCT order_id) AS n FROM order_items WHERE product_id = ?',
      [id]
    )

    if (ordenes[0].n > 0) {
      return res.status(409).json({
        success: false,
        code: 'PRODUCT_HAS_ORDERS',
        message: `Este producto aparece en ${ordenes[0].n} órdenes. Archivalo en vez de borrarlo para no perder ese historial.`
      })
    }

    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' })
    }

    clearSettingsCache()

    res.json({ success: true, message: 'Producto eliminado exitosamente' })
  } catch (error) {
    console.error('Error en DELETE /admin/products/:id:', error.message)
    res.status(500).json({ success: false, message: 'Error al eliminar el producto' })
  }
})

// PATCH /api/admin/products/:id/archive - Archivar / desarchivar
router.patch('/:id/archive', protectAdmin, async (req, res) => {
  try {
    const activo = req.body.active === true || req.body.active === 1 ? 1 : 0

    const [result] = await pool.query('UPDATE products SET active = ? WHERE id = ?', [activo, req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' })
    }

    res.json({ success: true, active: activo })
  } catch (error) {
    console.error('Error en PATCH /admin/products/:id/archive:', error.message)
    res.status(500).json({ success: false, message: 'Error al archivar el producto' })
  }
})

export default router
