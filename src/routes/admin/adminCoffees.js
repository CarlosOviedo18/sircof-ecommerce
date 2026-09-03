import { Router } from 'express'
import pool from '../../database.js'
import { protectAdmin } from '../../middleware/adminAuth.js'
import { CATEGORIES, VARIANT_ERRORS, normalizeText } from '../../shared/variants.js'

const router = Router()

// Slug a partir del nombre. Solo se usa cuando el admin deja el campo vacío:
// NUNCA se regenera al renombrar, porque eso rompería los links existentes.
const slugify = (name) =>
  normalizeText(name).replace(/\s+/g, '-').slice(0, 80)

const validar = ({ name, slug, category }) => {
  const nombre = String(name ?? '').trim()
  if (nombre.length < 1 || nombre.length > 150) {
    return { ok: false, message: 'El nombre es requerido (máx. 150 caracteres)' }
  }

  if (!CATEGORIES.includes(category)) {
    return { ok: false, code: VARIANT_ERRORS.INVALID_CATEGORY, message: 'Categoría inválida' }
  }

  const s = String(slug ?? '').trim() || slugify(nombre)
  if (!/^[a-z0-9-]+$/.test(s) || s.length > 80) {
    return { ok: false, message: 'El slug solo puede tener minúsculas, números y guiones' }
  }

  return { ok: true, name: nombre, slug: s, category }
}

// GET /api/admin/coffees
router.get('/', protectAdmin, async (req, res) => {
  try {
    const [coffees] = await pool.query(
      `SELECT c.*, COUNT(p.id) AS variant_count
       FROM coffees c LEFT JOIN products p ON p.coffee_id = c.id
       GROUP BY c.id ORDER BY c.sort_order, c.id`,
    )
    res.json({ success: true, coffees })
  } catch (error) {
    console.error('Error en GET /admin/coffees:', error.message)
    res.status(500).json({ success: false, message: 'Error al obtener los cafés' })
  }
})

// GET /api/admin/coffees/:id
router.get('/:id', protectAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coffees WHERE id = ?', [req.params.id])

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Café no encontrado' })
    }

    res.json({ success: true, coffee: rows[0] })
  } catch (error) {
    console.error('Error en GET /admin/coffees/:id:', error.message)
    res.status(500).json({ success: false, message: 'Error al obtener el café' })
  }
})

// POST /api/admin/coffees
router.post('/', protectAdmin, async (req, res) => {
  try {
    const v = validar(req.body)
    if (!v.ok) return res.status(400).json({ success: false, code: v.code, message: v.message })

    const { description, description_en, image_url, sort_order } = req.body

    const [result] = await pool.query(
      `INSERT INTO coffees (slug, name, description, description_en, category, image_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [v.slug, v.name, description || null, description_en || null, v.category,
       image_url || null, Number(sort_order) || 0],
    )

    res.status(201).json({ success: true, id: result.insertId })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Ya existe un café con ese slug' })
    }
    console.error('Error en POST /admin/coffees:', error.message)
    res.status(500).json({ success: false, message: 'Error al crear el café' })
  }
})

// PUT /api/admin/coffees/:id
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const v = validar(req.body)
    if (!v.ok) return res.status(400).json({ success: false, code: v.code, message: v.message })

    const { description, description_en, image_url, sort_order, active } = req.body

    const [result] = await pool.query(
      `UPDATE coffees SET slug=?, name=?, description=?, description_en=?, category=?,
              image_url=?, sort_order=?, active=?
       WHERE id = ?`,
      [v.slug, v.name, description || null, description_en || null, v.category,
       image_url || null, Number(sort_order) || 0, active === 0 || active === false ? 0 : 1,
       req.params.id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Café no encontrado' })
    }

    res.json({ success: true })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Ya existe un café con ese slug' })
    }
    console.error('Error en PUT /admin/coffees/:id:', error.message)
    res.status(500).json({ success: false, message: 'Error al actualizar el café' })
  }
})

// DELETE /api/admin/coffees/:id
// Un café con variantes no se borra: se archiva. Borrarlo dejaria productos
// huerfanos y la FK lo rechazaria igual.
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const [variantes] = await pool.query(
      'SELECT COUNT(*) AS n FROM products WHERE coffee_id = ?',
      [req.params.id],
    )

    if (variantes[0].n > 0) {
      return res.status(409).json({
        success: false,
        code: 'COFFEE_HAS_VARIANTS',
        message: `Este café tiene ${variantes[0].n} presentaciones. Archivalo en vez de borrarlo.`,
      })
    }

    const [result] = await pool.query('DELETE FROM coffees WHERE id = ?', [req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Café no encontrado' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /admin/coffees/:id:', error.message)
    res.status(500).json({ success: false, message: 'Error al eliminar el café' })
  }
})

export default router
