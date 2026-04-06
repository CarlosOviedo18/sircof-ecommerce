import { verifyToken } from '../lib/jwt.js'

/**
 * Middleware para proteger rutas que requieren autenticación
 * 
 * Verifica la presencia y validez del token JWT en cookies httpOnly.
 * Si el token es válido, extrae la información del usuario y la adjunta a la solicitud.
 * Este middleware debe usarse en rutas que requieren que el usuario esté autenticado.
 * 
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} req.headers - Headers de la solicitud HTTP con cookies
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 * 
 * @returns {void} Llama a next() si el token es válido, o retorna una respuesta de error
 * 
 * @throws {401} Si no se proporciona token, formato inválido o token expirado/inválido
 * 
 * @example
 * router.post('/compra', protectRoute, comprarProducto)
 * router.get('/perfil', protectRoute, obtenerPerfil)
 * 
 * @see users.js - Archivo con las acciones autenticadas del usuario (compra, etc.)
 */

export const protectRoute = (req, res, next) => {
  try {
    let token = null

    // Primero intentar obtener token de cookies
    const cookieHeader = req.headers.cookie
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim())
      const tokenCookie = cookies.find(c => c.startsWith('token='))
      if (tokenCookie) {
        token = tokenCookie.split('=')[1]
      }
    }

    // Si no está en cookies, intentar desde header Authorization (para compatibilidad)
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader) {
        const parts = authHeader.split(' ')
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1]
        }
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      })
    }

    const decoded = verifyToken(token)
    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    })
  }
}
