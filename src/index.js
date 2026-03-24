import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pool from './database.js';
import productsRoutes from './routes/products/products.js';
import authRoutes from './routes/auth/auth.js';
import googleAuthRoutes from './routes/auth/googleAuth.js';
import passwordResetRoutes from './routes/auth/passwordReset.js';
import usersRoutes from './routes/user/users.js';
import userSettingsRoutes from './routes/user/userSettings.js';
import cartRoutes from './routes/cart/cart.js';
import paymentRoutes from './routes/payment/payment.js';
import paypalRoutes from './routes/payment/paypal.js';
import ordersRoutes from './routes/orders/orders.js';
import contactFormRoutes from './routes/contact/contactForm.js';
import adminRoutes from './routes/admin.js';


const app = express();

// CORS restringido al origen del frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));



const MAINTENANCE_MODE = false;
// ============================================

if (MAINTENANCE_MODE) {
  app.use((req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Café Sircof - Próximamente</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a0e05 0%, #3c1a00 50%, #1a0e05 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
          <div class="icon"></div>
          <h1>Café Sircof</h1>
          <div class="divider"></div>
          <p>Estamos preparando algo especial para vos.</p>
          <p>Nuestro sitio estará disponible muy pronto.</p>
        </div>
      </body>
      </html>
    `);
  });
}




const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, 
  message: { success: false, message: 'Demasiadas peticiones, por favor espera un momento' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, 
  message: { success: false, message: 'Demasiados intentos de login/registro, por favor espera un momento' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

app.use(express.json({ limit: '10mb', strict: false }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api', productsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/logout', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/contact', contactFormRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', passwordResetRoutes);


// Servir archivos estáticos del frontend (dist/)
app.use(express.static(path.join(__dirname, '..', 'dist')));

app.get('/test-db', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        res.json({ message: 'Conexión a BD exitosa' });
    } catch (error) {
        res.status(500).json({ message: 'Error de conexión', error: error.message });
    }
});

// Ruta 404 solo para rutas /api no encontradas
app.all('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path,
        method: req.method
    });
});

// Todas las demás rutas devuelven index.html (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
