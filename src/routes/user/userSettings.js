import { Router } from 'express'
import pool from '../../database.js'
import { protectRoute } from '../../middleware/auth.js'
import { comparePassword, hashPassword } from '../../lib/crypto.js'
import { validatePassword } from '../../lib/passwordPolicy.js'

const router = Router()

// Actualizar email del usuario
router.put('/email', protectRoute, async (req, res) => {
  try {
    const { email } = req.body
    const userId = req.user.id

    // Validar que el email no esté vacío
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El correo es requerido'
      })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de correo inválido'
      })
    }

    // Validar que el email no esté en uso por otro usuario
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado'
      })
    }

    // Actualizar email
    const [result] = await pool.query(
      'UPDATE users SET email = ? WHERE id = ?',
      [email, userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Correo actualizado correctamente'
    })
  } catch (error) {
    console.error('Error actualizando email:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// Actualizar contraseña del usuario
router.put('/password', protectRoute, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    // Validar que ambas contraseñas estén presentes
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son requeridas'
      })
    }

    // Misma política que registro y reseteo (antes acá alcanzaba con 6).
    const politica = validatePassword(newPassword)
    if (!politica.ok) {
      return res.status(400).json({ success: false, message: politica.message })
    }

    // Obtener contraseña actual del usuario
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    // Una cuenta de solo-Google no tiene contraseña: no se puede "cambiar".
    if (!users[0].password) {
      return res.status(400).json({
        success: false,
        message: 'Esta cuenta usa inicio de sesión con Google'
      })
    }

    // Validar contraseña actual
    const isValid = await comparePassword(currentPassword, users[0].password)
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      })
    }

    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(newPassword)

    // Actualizar contraseña y revocar sesiones viejas (token_version++)
    const [result] = await pool.query(
      'UPDATE users SET password = ?, token_version = token_version + 1 WHERE id = ?',
      [hashedPassword, userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Error al actualizar contraseña'
      })
    }

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    })
  } catch (error) {
    console.error('Error actualizando contraseña:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

export default router
