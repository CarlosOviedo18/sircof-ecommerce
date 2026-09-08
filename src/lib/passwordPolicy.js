// Política de contraseña ÚNICA para todo el sistema.
//
// Antes estaba en tres lugares con reglas distintas: 8+mayúscula+dígito al
// registrar, pero solo 6 al resetear y al cambiar. Eso permitía registrarse
// con una contraseña fuerte y bajarla a "aaaaaa" por el reseteo.
//
// Regla: mínimo 8, al menos una mayúscula y un dígito. Tope de 72 bytes:
// bcrypt ignora lo que pasa de 72, y sin tope una contraseña enorme es un
// DoS de CPU (bcryptjs es JS puro y single-thread).
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const MAX_BYTES = 72;

/**
 * @returns {{ ok: boolean, message?: string }}
 */
export const validatePassword = (password) => {
  if (typeof password !== 'string' || password.length === 0) {
    return { ok: false, message: 'La contraseña es requerida' };
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_BYTES) {
    return { ok: false, message: 'La contraseña es demasiado larga (máx. 72 caracteres)' };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return {
      ok: false,
      message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
    };
  }
  return { ok: true };
};
