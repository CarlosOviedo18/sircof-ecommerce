// Formatea un monto en colones. Number() porque el valor puede llegar como
// string desde la BD, y en ese caso .toFixed() reventaría.
const formatCRC = (amount) => `₡${Number(amount).toFixed(2)}`;

const ROAST_LABEL = { medio: 'Tueste Medio', oscuro: 'Tueste Oscuro' };
const GRIND_LABEL = { grano: 'Grano', molido: 'Molido' };

// Desglose del pack bajo el nombre del producto. Vacío si el item no es un pack,
// así los productos normales se ven exactamente igual que antes.
const packBreakdownHTML = (packSelections) => {
  if (!packSelections?.length) return '';

  const filas = packSelections
    .map(
      (s) =>
        `<li>${s.quantity} × ${ROAST_LABEL[s.roast] || s.roast} · ${GRIND_LABEL[s.grind] || s.grind}</li>`,
    )
    .join('');

  return `<ul style="margin: 6px 0 0 0; padding-left: 18px; font-size: 12px; color: #666;">${filas}</ul>`;
};

// Bloque de dirección para el email de la empresa: sin esto no se puede despachar.
const shippingAddressHTML = ({ address, city, state, postalCode, country, clientPhone }) => {
  const partes = [
    address,
    [city, state].filter(Boolean).join(', '),
    postalCode,
    country,
  ].filter(Boolean);

  if (partes.length === 0) return '';

  return `
    <div style="margin-top: 20px; padding: 12px; background: #f7f7f7; border-left: 3px solid #6f4e37;">
      <p style="margin: 0 0 6px 0;"><strong>Dirección de envío</strong></p>
      ${partes.map((p) => `<p style="margin: 2px 0;">${p}</p>`).join('')}
      ${clientPhone ? `<p style="margin: 6px 0 0 0;">Tel: ${clientPhone}</p>` : ''}
    </div>
  `;
};

export const clientEmailTemplate = (orderData) => {
  // subtotal/shippingCost con default: las órdenes de la ruta legacy
  // (routes/orders/orders.js) no los pasan y deben seguir renderizando igual.
  const { orderId, products, total, subtotal = null, shippingCost = 0, clientName } = orderData;

  const productsHTML = products
    .map(
      (p) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px;">${p.name}${packBreakdownHTML(p.packSelections)}</td>
      <td style="padding: 8px; text-align: center;">${p.quantity}</td>
      <td style="padding: 8px; text-align: right;">${formatCRC(p.price)}</td>
      <td style="padding: 8px; text-align: right;">${formatCRC(Number(p.price) * p.quantity)}</td>
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
          <img src="${process.env.PUBLIC_URL || process.env.BACKEND_URL || 'http://localhost:3000'}/src/assets/img/logo.png" alt="Sircof Logo" class="logo">
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
          
          ${
            shippingCost > 0
              ? `<div style="margin-top: 20px; text-align: right; color: #555;">
                   <p style="margin: 4px 0;">Subtotal: ${formatCRC(subtotal ?? total - shippingCost)}</p>
                   <p style="margin: 4px 0;">Envío: ${formatCRC(shippingCost)}</p>
                 </div>`
              : ''
          }

          <div class="total">
            Total: ${formatCRC(total)}
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
  const { orderId, products, total, subtotal = null, shippingCost = 0, clientName, clientEmail, clientPhone } = orderData;

  const productsHTML = products
    .map(
      (p) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px;">${p.name}${packBreakdownHTML(p.packSelections)}</td>
      <td style="padding: 8px; text-align: center;">${p.quantity}</td>
      <td style="padding: 8px; text-align: right;">${formatCRC(p.price)}</td>
      <td style="padding: 8px; text-align: right;">${formatCRC(Number(p.price) * p.quantity)}</td>
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

          ${shippingAddressHTML(orderData)}

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
          
          ${
            shippingCost > 0
              ? `<div style="margin-top: 20px; text-align: right; color: #555;">
                   <p style="margin: 4px 0;">Subtotal: ${formatCRC(subtotal ?? total - shippingCost)}</p>
                   <p style="margin: 4px 0;">Envío: ${formatCRC(shippingCost)}</p>
                 </div>`
              : ''
          }

          <div class="total">
            TOTAL: ${formatCRC(total)}
          </div>
          
          <p style="color: #666; font-size: 12px;">Pedido recibido: ${new Date().toLocaleString('es-ES')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
