import { verifyToken } from '../lib/jwt.js'
import pool from '../database.js'


export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      })
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      })
    }

    const token = parts[1]
    const decoded = verifyToken(token)

    // Confirmar que el usuario sigue existiendo y que el token no fue revocado.
    // token_version se sube al cambiar/resetear contraseña y al borrar la cuenta,
    // así que un token viejo deja de servir aunque no haya expirado.
    const [users] = await pool.query(
      'SELECT id, token_version FROM users WHERE id = ?',
      [decoded.id]
    )

    if (users.length === 0 || users[0].token_version !== (decoded.tv ?? 0)) {
      return res.status(401).json({
        success: false,
        message: 'Sesión inválida, iniciá sesión de nuevo'
      })
    }

    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    })
  }
}
