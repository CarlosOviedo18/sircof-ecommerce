import { Router } from 'express'
import pool from '../../database.js'
import { protectAdmin } from '../../middleware/adminAuth.js'

const router = Router()

// GET - Listar todos los usuarios (sin contraseña)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    )
    res.json({ success: true, users })
  } catch (error) {
    console.error('Error en GET /admin/users:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// PATCH - Cambiar rol de un usuario
router.patch('/:id/role', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Los roles válidos son: user, admin'
      })
    }

    // No permitir que un admin se cambie el rol a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes cambiar tu propio rol'
      })
    }

    const [result] = await pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    res.json({ success: true, message: `Rol de usuario #${id} actualizado a "${role}"` })
  } catch (error) {
    console.error('Error en PATCH /admin/users/:id/role:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE - Eliminar usuario
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // No permitir que un admin se elimine a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminarte a ti mismo'
      })
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    res.json({ success: true, message: 'Usuario eliminado exitosamente' })
  } catch (error) {
    console.error('Error en DELETE /admin/users/:id:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
