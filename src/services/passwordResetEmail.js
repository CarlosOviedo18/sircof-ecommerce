import nodemailer from 'nodemailer';
import { passwordResetTemplate } from '../templates/passwordResetTemplate.js';

// Configurar transporte de email (mismo patrón que emailService.js)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Envía el correo con el código de recuperación de contraseña
 * @param {string} email - Correo del usuario
 * @param {string} userName - Nombre del usuario
 * @param {string} resetCode - Código de 6 dígitos
 * @returns {boolean} true si se envió correctamente
 */
export const sendResetCodeEmail = async (email, userName, resetCode) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Sircof - Código de recuperación de contraseña',
      html: passwordResetTemplate(userName, resetCode),
    });
    console.log(`✓ Email de recuperación enviado a: ${email}`);
    return true;
  } catch (error) {
    console.error('✗ Error al enviar email de recuperación:', error.message);
    return false;
  }
};
