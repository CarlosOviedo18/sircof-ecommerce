import bcryptjs from 'bcryptjs'

// Encriptar contraseña
export const hashPassword = async (password) => {
  try {
    const salt = await bcryptjs.genSalt(10)
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
