import nodemailer from 'nodemailer';
import { clientEmailTemplate, companyEmailTemplate } from '../templates/emailTemplates.js';

// Configurar transporte de email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verificar conexión
transporter.verify((error, success) => {
  if (error) {
    console.error('Error en configuración de email:', error);
  } else {
    console.log('✓ Servidor de email listo');
  }
});

// Enviar email al cliente
export const sendClientEmail = async (email, orderData) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmación de Pedido #${orderData.orderId}`,
      html: clientEmailTemplate(orderData),
    });
    console.log(`✓ Email enviado a cliente: ${email}`);
    return true;
  } catch (error) {
    console.error('✗ Error al enviar email al cliente:', error.message);
    return false;
  }
};

// Enviar email a la empresa
export const sendCompanyEmail = async (orderData) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: process.env.COMPANY_EMAIL,
      subject: `Nuevo Pedido #${orderData.orderId} - ${orderData.clientName}`,
      html: companyEmailTemplate(orderData),
    });
    console.log(`✓ Email enviado a empresa`);
    return true;
  } catch (error) {
    console.error('✗ Error al enviar email a empresa:', error.message);
    return false;
  }
};

// Función unificada para enviar ambos emails
export const sendOrderEmails = async (orderData) => {
  try {
    const clientResult = await sendClientEmail(orderData.clientEmail, orderData);
    const companyResult = await sendCompanyEmail(orderData);
    
    return {
      success: clientResult && companyResult,
      clientEmailSent: clientResult,
      companyEmailSent: companyResult,
    };
  } catch (error) {
    console.error('✗ Error al enviar emails:', error.message);
    return {
      success: false,
      clientEmailSent: false,
      companyEmailSent: false,
      error: error.message,
    };
  }
};
