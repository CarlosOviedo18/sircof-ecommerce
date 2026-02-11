import { Router } from 'express'
import pool from '../database.js'
import { hashPassword } from '../lib/crypto.js'
import { sendResetCodeEmail } from '../services/passwordResetEmail.js'

const router = Router()

/**
 * Genera un código numérico aleatorio de 6 dígitos
 */
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * POST /forgot-password
 * Paso 1: El usuario envía su email, se genera un código y se manda por correo
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico es requerido'
      })
    }

    // Buscar usuario por email
    const [users] = await pool.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No existe una cuenta con ese correo electrónico'
      })
    }

    const user = users[0]
    const resetCode = generateResetCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    // Invalidar códigos anteriores de este usuario
    await pool.query(
      'UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0',
      [user.id]
    )

    // Guardar nuevo código en BD
    await pool.query(
      'INSERT INTO password_resets (user_id, code, expires_at) VALUES (?, ?, ?)',
      [user.id, resetCode, expiresAt]
    )

    // Enviar correo con el código
    const emailSent = await sendResetCodeEmail(user.email, user.name, resetCode)

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el correo de recuperación'
      })
    }

    res.json({
      success: true,
      message: 'Código de recuperación enviado al correo electrónico'
    })
  } catch (error) {
    console.error('Error en /forgot-password:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor: ' + error.message
    })
  }
})

/**
 * POST /verify-reset-code
 * Paso 2: El usuario envía email + código para verificar que es válido
 */
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email y código son requeridos'
      })
    }

    // Buscar código válido (no usado y no expirado)
    const [results] = await pool.query(
      `SELECT pr.id, pr.user_id 
       FROM password_resets pr
       JOIN users u ON u.id = pr.user_id
       WHERE u.email = ? AND pr.code = ? AND pr.used = 0 AND pr.expires_at > NOW()
       ORDER BY pr.created_at DESC
       LIMIT 1`,
      [email, code]
    )

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado'
      })
    }

    res.json({
      success: true,
      message: 'Código verificado correctamente'
    })
  } catch (error) {
    console.error('Error en /verify-reset-code:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor: ' + error.message
    })
  }
})

/**
 * POST /reset-password
 * Paso 3: El usuario envía email + código + nueva contraseña para cambiarla
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, código y nueva contraseña son requeridos'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      })
    }

    // Verificar código una vez más por seguridad
    const [results] = await pool.query(
      `SELECT pr.id, pr.user_id 
       FROM password_resets pr
       JOIN users u ON u.id = pr.user_id
       WHERE u.email = ? AND pr.code = ? AND pr.used = 0 AND pr.expires_at > NOW()
       ORDER BY pr.created_at DESC
       LIMIT 1`,
      [email, code]
    )

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado'
      })
    }

    const resetRecord = results[0]

    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(newPassword)

    // Actualizar contraseña del usuario
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, resetRecord.user_id]
    )

    // Marcar código como usado
    await pool.query(
      'UPDATE password_resets SET used = 1 WHERE id = ?',
      [resetRecord.id]
    )

    console.log(`✓ Contraseña restablecida para usuario ID: ${resetRecord.user_id}`)

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error en /reset-password:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor: ' + error.message
    })
  }
})

export default router
