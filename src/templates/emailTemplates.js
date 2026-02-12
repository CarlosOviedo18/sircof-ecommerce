export const clientEmailTemplate = (orderData) => {
  const { orderId, products, total, clientName } = orderData;

  const productsHTML = products
    .map(
      (p) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px;">${p.name}</td>
      <td style="padding: 8px; text-align: center;">${p.quantity}</td>
      <td style="padding: 8px; text-align: right;">$${p.price}</td>
      <td style="padding: 8px; text-align: right;">$${(p.price * p.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .logo-section { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; height: auto; }
        .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #f2f2f2; padding: 10px; text-align: left; }
        .total { font-size: 18px; font-weight: bold; text-align: right; padding: 20px 0; }
        .footer { text-align: center; color: #999; font-size: 12px; padding: 20px; border-top: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-section">
          <img src="${process.env.VITE_API_URL || 'http://localhost:3000'}/src/assets/img/logo.png" alt="Sircof Logo" class="logo">
        </div>
        <div class="header">
          <h1>¡Gracias por tu compra!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${clientName}</strong>,</p>
          <p>Tu pedido ha sido confirmado con éxito. Aquí están los detalles:</p>
          
          <p><strong>Número de Pedido:</strong> #${orderId}</p>
          
          <h3>Productos Pedidos:</h3>
          <table>
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productsHTML}
            </tbody>
          </table>
          
          <div class="total">
            Total: $${total.toFixed(2)}
          </div>
          
          <p>Pronto recibirás información de tu envío. Si tienes alguna pregunta, no dudes en contactarnos.</p>
          
          <p>¡Gracias por confiar en nosotros!</p>
          <p>Saludos,<br><strong>El Equipo de Sircof</strong></p>
        </div>
        <div class="footer">
          <p>Este es un correo automático. Por favor no responder a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const companyEmailTemplate = (orderData) => {
  const { orderId, products, total, clientName, clientEmail, clientPhone } = orderData;

  const productsHTML = products
    .map(
      (p) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px;">${p.name}</td>
      <td style="padding: 8px; text-align: center;">${p.quantity}</td>
      <td style="padding: 8px; text-align: right;">$${p.price}</td>
      <td style="padding: 8px; text-align: right;">$${(p.price * p.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #333; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #f2f2f2; padding: 10px; text-align: left; }
        .total { font-size: 18px; font-weight: bold; text-align: right; padding: 20px 0; }
        .client-info { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #8B4513; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NUEVO PEDIDO RECIBIDO</h1>
        </div>
        <div class="content">
          <p><strong>ID del Pedido:</strong> #${orderId}</p>
          
          <div class="client-info">
            <h3>Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>Teléfono:</strong> ${clientPhone || 'No proporcionado'}</p>
          </div>
          
          <h3>Productos Pedidos:</h3>
          <table>
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productsHTML}
            </tbody>
          </table>
          
          <div class="total">
            TOTAL: $${total.toFixed(2)}
          </div>
          
          <p style="color: #666; font-size: 12px;">Pedido recibido: ${new Date().toLocaleString('es-ES')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
