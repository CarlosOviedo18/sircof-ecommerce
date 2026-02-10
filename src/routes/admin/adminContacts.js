import { Router } from 'express'
import pool from '../../database.js'
import { protectAdmin } from '../../middleware/adminAuth.js'

const router = Router()

// GET - Listar todos los mensajes de contacto
router.get('/', protectAdmin, async (req, res) => {
  try {
    const [contacts] = await pool.query(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    )
    res.json({ success: true, contacts })
  } catch (error) {
    console.error('Error en GET /admin/contacts:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE - Eliminar mensaje de contacto
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM contacts WHERE id = ?',
      [req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Mensaje no encontrado' })
    }

    res.json({ success: true, message: 'Mensaje eliminado exitosamente' })
  } catch (error) {
    console.error('Error en DELETE /admin/contacts/:id:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
