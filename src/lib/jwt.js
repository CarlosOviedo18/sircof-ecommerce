import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion'

export const generateToken = (userId, email) => {
  try {
    return jwt.sign(
      { id: userId, email },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
  } catch (error) {
    throw new Error('Error al generar token: ' + error.message)
  }
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Token inválido o expirado: ' + error.message)
  }
}
