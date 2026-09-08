import { Router } from 'express'
import crypto from 'crypto'
import pool from '../../database.js'
import { hashPassword, hashResetCode } from '../../lib/crypto.js'
import { validatePassword } from '../../lib/passwordPolicy.js'
import { sendResetCodeEmail } from '../../services/passwordResetEmail.js'

const router = Router()

const MAX_INTENTOS = 5

// Código de 6 dígitos con generador CRIPTOGRÁFICO.
// Math.random() no lo era: su estado se reconstruye observando salidas.
const generateResetCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0')

// Respuesta idéntica exista o no la cuenta: no filtra qué emails están registrados.
const respuestaGenerica = (res) =>
  res.json({
    success: true,
    message: 'Si existe una cuenta con ese correo, se envió un código de recuperación',
  })

/**
 * POST /forgot-password
 * Paso 1: genera un código, lo guarda hasheado y lo manda por correo.
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: 'El correo electrónico es requerido' })
    }

    const [users] = await pool.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email],
    )

    // No revela si la cuenta existe: siempre responde igual.
    if (users.length === 0) {
      return respuestaGenerica(res)
    }

    const user = users[0]
    const resetCode = generateResetCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    // Invalidar códigos anteriores del usuario
    await pool.query(
      'UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0',
      [user.id],
    )

    // Se guarda HASHEADO; el código en claro solo va al email.
    await pool.query(
      'INSERT INTO password_resets (user_id, code, expires_at) VALUES (?, ?, ?)',
      [user.id, hashResetCode(resetCode), expiresAt],
    )

    await sendResetCodeEmail(user.email, user.name, resetCode)

    // Aunque el email falle, no se lo decimos al cliente (evita el oráculo).
    return respuestaGenerica(res)
  } catch (error) {
    console.error('Error en /forgot-password:', error.message)
    res.status(500).json({ success: false, message: 'Error en el servidor' })
  }
})

// Busca el registro de reseteo vigente y controla el límite de intentos.
// Devuelve { record } si el código es válido, o { error, status } si no.
const verificarCodigo = async (email, code) => {
  const [rows] = await pool.query(
    `SELECT pr.id, pr.user_id, pr.code, pr.attempts
     FROM password_resets pr
     JOIN users u ON u.id = pr.user_id
     WHERE u.email = ? AND pr.used = 0 AND pr.expires_at > NOW()
     ORDER BY pr.created_at DESC
     LIMIT 1`,
    [email],
  )

  if (rows.length === 0) {
    return { error: 'Código inválido o expirado', status: 400 }
  }

  const record = rows[0]

  if (record.attempts >= MAX_INTENTOS) {
    // Se quema el código: no más intentos sobre este.
    await pool.query('UPDATE password_resets SET used = 1 WHERE id = ?', [record.id])
    return { error: 'Demasiados intentos. Solicitá un código nuevo.', status: 429 }
  }

  // Comparación en tiempo constante del hash del código.
  const esperado = Buffer.from(record.code, 'utf8')
  const recibido = Buffer.from(hashResetCode(code), 'utf8')
  const coincide = esperado.length === recibido.length && crypto.timingSafeEqual(esperado, recibido)

  if (!coincide) {
    await pool.query('UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?', [record.id])
    return { error: 'Código inválido o expirado', status: 400 }
  }

  return { record }
}

/**
 * POST /verify-reset-code
 * Paso 2: valida el código sin consumirlo.
 */
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email y código son requeridos' })
    }

    const resultado = await verificarCodigo(email, code)

    if (resultado.error) {
      return res.status(resultado.status).json({ success: false, message: resultado.error })
    }

    res.json({ success: true, message: 'Código verificado correctamente' })
  } catch (error) {
    console.error('Error en /verify-reset-code:', error.message)
    res.status(500).json({ success: false, message: 'Error en el servidor' })
  }
})

/**
 * POST /reset-password
 * Paso 3: valida el código, cambia la contraseña y revoca las sesiones viejas.
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, código y nueva contraseña son requeridos',
      })
    }

    // Misma política que el registro (antes acá alcanzaba con 6 caracteres).
    const politica = validatePassword(newPassword)
    if (!politica.ok) {
      return res.status(400).json({ success: false, message: politica.message })
    }

    const resultado = await verificarCodigo(email, code)

    if (resultado.error) {
      return res.status(resultado.status).json({ success: false, message: resultado.error })
    }

    const { record } = resultado
    const hashedPassword = await hashPassword(newPassword)

    // Cambiar contraseña Y subir token_version: los JWT viejos dejan de servir.
    await pool.query(
      'UPDATE users SET password = ?, token_version = token_version + 1 WHERE id = ?',
      [hashedPassword, record.user_id],
    )

    await pool.query('UPDATE password_resets SET used = 1 WHERE id = ?', [record.id])

    console.log(`✓ Contraseña restablecida para usuario ID: ${record.user_id}`)

    res.json({ success: true, message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    console.error('Error en /reset-password:', error.message)
    res.status(500).json({ success: false, message: 'Error en el servidor' })
  }
})

export default router
