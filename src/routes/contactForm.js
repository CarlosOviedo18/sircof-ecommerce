import express from 'express'
import pool from '../database.js'

const router = express.Router()

// POST /api/contact - Crear nuevo mensaje de contacto
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    // Validar campos requeridos
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, email y mensaje son requeridos'
      })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El email no es válido'
      })
    }

    // Insertar en la base de datos
    const [result] = await pool.query(
      'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject || null, message]
    )

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      id: result.insertId
    })

  } catch (error) {
    console.error('Error en POST /contact:', error)
    res.status(500).json({
      success: false,
      message: 'Error al guardar el mensaje'
    })
  }
})


// aqui a más rutas relacionadas con el formulario de contacto si es necesario(admin)


export default router
