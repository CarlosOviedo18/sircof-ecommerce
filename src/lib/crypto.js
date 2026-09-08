import bcryptjs from 'bcryptjs'
import crypto from 'crypto'

// Cost 12 (OWASP). Subirlo de 10 endurece contra fuerza bruta offline.
const BCRYPT_COST = 12

// Encriptar contraseña
export const hashPassword = async (password) => {
  try {
    const salt = await bcryptjs.genSalt(BCRYPT_COST)
    return await bcryptjs.hash(password, salt)
  } catch (error) {
    throw new Error('Error al encriptar contraseña: ' + error.message)
  }
}

// Comparar contraseña con hash
export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcryptjs.compare(password, hashedPassword)
  } catch (error) {
    throw new Error('Error al comparar contraseña: ' + error.message)
  }
}

// Hash del código de reseteo. Se guarda hasheado en la BD para que, si alguien
// lee la tabla password_resets, no obtenga códigos usables. SHA-256 alcanza:
// el código ya es de un solo uso, corta vida y con límite de intentos.
export const hashResetCode = (code) =>
  crypto.createHash('sha256').update(String(code), 'utf8').digest('hex')
