import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pool from './database.js';
import { securityHeaders } from './middleware/securityHeaders.js';
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
import settingsRoutes from './routes/settings/settings.js';
import adminRoutes from './routes/admin.js';
import { maintenance } from './middleware/maintenanceMode.js';


const app = express();

// Hostinger pone un reverse proxy delante de Node. Sin esto, req.ip es la IP
// del proxy para TODOS, y los rate limiters cuentan globalmente: un atacante
// bloquearía a todos. Con 1 salto, express lee el X-Forwarded-For real.
app.set('trust proxy', 1);

// CORS restringido al origen del frontend
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',  
      'http://localhost:3000',  
      process.env.CORS_ORIGIN   
    ].filter(Boolean)
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  },
  credentials: true
}));

// Middleware de seguridad (headers HTTP)
app.use(securityHeaders);

app.use(maintenance); 


const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, 
  message: { success: false, message: 'Demasiadas peticiones, por favor espera un momento' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  message: { success: false, message: 'Demasiados intentos de login/registro, por favor espera un momento' },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Demasiados intentos, por favor espera un momento' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Reseteo de contraseña: 10 requests por hora por IP (cubre las 3 rutas).
// Antes no tenía ninguno, así que un código de 6 dígitos se podía fuerza-
// brutear a piacere. El corte fino es el contador por código (5 fallos y se
// quema), este limiter es la barrera de IP.
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Demasiados intentos, esperá una hora' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
// Antes decía '/signup', ruta que no existe: el registro es /register.
app.use('/api/auth/register', authLimiter);

// strict: true rechaza JSON que no sea objeto/array (antes un body `null`
// rompía destructuraciones). Límite de 1mb: esta API no recibe archivos, y
// 10mb dejaba pasar payloads enormes (DoS de CPU al hashear, por ejemplo).
app.use(express.json({ limit: '1mb', strict: true }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// JSON malformado / body demasiado grande: responder limpio en vez de un stack.
app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large' || err instanceof SyntaxError)) {
    return res.status(400).json({ success: false, message: 'Cuerpo de la petición inválido' });
  }
  next(err);
});

app.use('/api', productsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/paypal', paypalRoutes);
// (se quitó el montaje accidental de usersRoutes bajo /api/logout: el logout
//  real es /api/auth/logout; ese alias solo re-exponía /profile y /purchases)
app.use('/api/orders', ordersRoutes);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/contact', contactLimiter, contactFormRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
// El limiter va montado en las rutas de reseteo antes del router.
app.use('/api/auth/forgot-password', resetLimiter);
app.use('/api/auth/verify-reset-code', resetLimiter);
app.use('/api/auth/reset-password', resetLimiter);
app.use('/api/auth', passwordResetRoutes);


// Servir archivos estáticos del frontend (dist/)
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Servir archivos de modelos 3D explícitamente para evitar que app.get('*') los capture
app.use('/models', express.static(path.join(__dirname, '..', 'public', 'models')));

app.get('/test-db', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        res.json({ message: 'Conexión a BD exitosa' });
    } catch (error) {
        console.error('Error de conexión a BD:', error.message);
        res.status(500).json({ message: 'Error de conexión' });
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
