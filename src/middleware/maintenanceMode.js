const MAINTENANCE_MODE = true;


export const maintenance   = (req, res, next) => {
if (MAINTENANCE_MODE) {

    
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Café Sircof - Próximamente</title>
        <link href="https://fonts.googleapis.com/css?family=Poppins:400,600,700" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a0e05 0%, #3c1a00 50%, #1a0e05 100%);
            font-family: 'Poppins', sans-serif;
            color: #f5e6d3;
            text-align: center;
            padding: 20px;
          }
          .container {
            max-width: 600px;
          }
          .icon { font-size: 80px; margin-bottom: 20px; }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 15px;
            color: #d4a574;
            font-weight: 700;
          }
          p {
            font-size: 1.2rem;
            line-height: 1.6;
            opacity: 0.85;
          }
          .divider {
            width: 60px;
            height: 3px;
            background: #d4a574;
            margin: 25px auto;
            border-radius: 2px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Café Sircof</h1>
          <div class="divider"></div>
          <p>Estamos preparando algo especial para vos.</p>
          <p>Nuestro sitio estará disponible muy pronto.</p>
        </div>
      </body>
      </html>
    `);
    return;
  }
  next();
}
