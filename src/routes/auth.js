

import { Router } from 'express'
import pool from '../database.js'

const router = Router()

// POST /api/auth/register
// Registra un nuevo usuario en la BD
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validaciones
    if (!name || !email || !password) {
      console.log('❌ Validación: Faltan campos', { name, email, password })
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ Validación: Email inválido', email)
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      })
    }

    // Verificar si el email ya existe
    console.log('🔍 Verificando email:', email)
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUser.length > 0) {
      console.log('❌ Email ya registrado:', email)
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      })
    }

    // Insertar usuario en BD
    console.log('📝 Insertando usuario:', { name, email })
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    )

    console.log('✅ Usuario registrado con ID:', result.insertId)
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: result.insertId,
        name,
        email
      }
    })
  } catch (error) {
    console.error('❌ Error en /register:', error)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor: ' + error.message
    })
  }
})

// POST /api/auth/login
// Verifica credenciales y retorna usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      console.log('❌ Validación: Faltan email o password')
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña requeridos'
      })
    }

    // Buscar usuario en BD
    console.log('🔍 Buscando usuario:', email)
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      console.log('❌ Usuario no encontrado:', email)
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      })
    }

    const user = users[0]

    // Aquí irá: const validPassword = await bcrypt.compare(password, user.password)
    // Por ahora compara directamente (NO HACER EN PRODUCCIÓN)

    if (user.password !== password) {
      console.log('❌ Contraseña incorrecta para:', email)
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      })
    }

    console.log('✅ Login exitoso para:', email)
    res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
      // token: 'jwt_token_aqui' // Se agregará con JWT
    })
  } catch (error) {
    console.error('❌ Error en /login:', error)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor: ' + error.message
    })
  }
})

// POST /api/auth/logout
// Limpia sesión del usuario
router.post('/logout', (req, res) => {
  try {
    // Aquí iría invalidar token, limpiar sesión, etc.
    res.json({
      success: true,
      message: 'Logout exitoso'
    })
  } catch (error) {
    console.error('❌ Error en /logout:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    })
  }
})

export default router


