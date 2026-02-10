import { verifyToken } from '../lib/jwt.js'
import pool from '../database.js'


export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      })
    }

    const decoded = verifyToken(token)

    // Verificar directamente en BD que el usuario existe y es admin
    const [users] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.id]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    if (users[0].role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: se requiere rol de administrador'
      })
    }

    req.user = users[0]
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    })
  }
}
