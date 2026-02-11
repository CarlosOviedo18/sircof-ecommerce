
export const passwordResetTemplate = (userName, resetCode) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .logo-section { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; height: auto; }
        .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; }
        .code-box { 
          background-color: #f4f4f4; 
          padding: 25px; 
          text-align: center; 
          margin: 25px 0; 
          border-radius: 8px; 
          border: 2px dashed #8B4513;
        }
        .code { 
          color: #8B4513; 
          letter-spacing: 10px; 
          font-size: 36px; 
          font-weight: bold; 
          margin: 0; 
        }
        .warning { 
          color: #666; 
          font-size: 13px; 
          background-color: #fff3cd; 
          padding: 12px; 
          border-radius: 5px; 
          border-left: 4px solid #ffc107;
          margin: 15px 0;
        }
        .footer { 
          text-align: center; 
          color: #999; 
          font-size: 12px; 
          padding: 20px; 
          border-top: 1px solid #ddd; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Recuperación de Contraseña</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${userName}</strong>,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código para continuar:</p>
          
          <div class="code-box">
            <p class="code">${resetCode}</p>
          </div>
          
          <div class="warning">
            ⏱ Este código expira en <strong>15 minutos</strong>. Si no solicitaste este cambio, puedes ignorar este correo.
          </div>
          
          <p>Si tienes problemas, no dudes en contactarnos.</p>
          <p>Saludos,<br><strong>El Equipo de Sircof</strong></p>
        </div>
        <div class="footer">
          <p>Este es un correo automático. Por favor no responder a este mensaje.</p>
          <p>&copy; ${new Date().getFullYear()} Sircof. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
