import { Router } from 'express'
import db from '../database.js'
import { protectRoute } from '../middleware/auth.js'

const router = Router()

// RUTAS PROTEGIDAS DE USUARIO
// Todas requieren token JWT válido en header Authorization

/*
// Ruta protegida - obtener perfil del usuario
router.get('/perfil', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id
    
    const [users] = await db.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [userId]
    )
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }
    
    res.json({
      success: true,
      user: users[0]
    })
  } catch (error) {
    console.error('Error en /perfil:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      details: error.message
    })
  }
})

// Ruta protegida - obtener historial de compras del usuario
router.get('/compras', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id
    
    const [compras] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )
    
    res.json({
      success: true,
      compras: compras
    })
  } catch (error) {
    console.error('Error en /compras:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error al obtener compras',
      details: error.message
    })
  }
})

// Ruta protegida - actualizar perfil del usuario
router.put('/perfil', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id
    const { name, email } = req.body
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y email son requeridos'
      })
    }
    
    await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    )
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error en PUT /perfil:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      details: error.message
    })
  }
})
*/

export default router
