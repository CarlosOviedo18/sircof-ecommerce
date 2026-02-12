import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import pool from '../database.js'
import { hashPassword, comparePassword } from '../lib/crypto.js'
import { generateToken } from '../lib/jwt.js'

const router = Router()

// Rate limit estricto para login/register: 5 intentos cada 15 minutos por IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Demasiados intentos, por favor espera 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false
})

// Validación de contraseña segura
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
      })
    }

    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      })
    }

    const hashedPassword = await hashPassword(password)
    
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: result.insertId,
        name,
        email,
        role: 'user'
      }
    })
  } catch (error) {
    console.error('Error en /register:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor: ' + error.message
    })
  }
})

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña requeridos'
      })
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      })
    }

    const user = users[0]

    const validPassword = await comparePassword(password, user.password)

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      })
    }

    const token = generateToken(user.id, user.email)

    console.log(`Usuario login exitoso: ${user.email} (ID: ${user.id}, Role: ${user.role})`)
    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error en /login:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor: ' + error.message
    })
  }
})

router.post('/logout', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout exitoso'
    })
  } catch (error) {
    console.error('Error en /logout:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    })
  }
})

export default router


