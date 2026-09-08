import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

// Fallar al arrancar si el secreto falta o es débil: un secreto corto se
// fuerza-brutea offline desde cualquier token capturado.
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET no está configurado o mide menos de 32 caracteres')
}

const ALG = 'HS256'

// tokenVersion viaja en el token; protectRoute lo compara contra la BD.
// Si no coinciden (cambio/reseteo de contraseña, borrado), el token se rechaza.
export const generateToken = (userId, email, tokenVersion = 0) => {
  try {
    return jwt.sign(
      { id: userId, email, tv: tokenVersion },
      JWT_SECRET,
      { expiresIn: '4h', algorithm: ALG },
    )
  } catch (error) {
    throw new Error('Error al generar token: ' + error.message)
  }
}

export const verifyToken = (token) => {
  try {
    // algorithms fijo: cierra alg=none y confusiones HS/RS a futuro.
    return jwt.verify(token, JWT_SECRET, { algorithms: [ALG] })
  } catch (error) {
    throw new Error('Token inválido o expirado: ' + error.message)
  }
}
