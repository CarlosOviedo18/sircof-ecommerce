import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Buscar .env en múltiples ubicaciones
const envPaths = [
  path.join(__dirname, '..', '.env'),                                    // Raíz del proyecto
  path.join(process.cwd(), '.env'),                                      // Directorio de trabajo
  '/home/u663504527/domains/cafesircof.com/.env',                        // Fuera de nodejs/ (no lo toca Git)
  path.join(__dirname, '..', '..', '.env'),                              // Un nivel más arriba
];

let envLoaded = false;
for (const ep of envPaths) {
  if (fs.existsSync(ep)) {
    dotenv.config({ path: ep });
    console.log('ENV cargado desde:', ep);
    envLoaded = true;
    break;
  }
}
if (!envLoaded) {
  console.log('ADVERTENCIA: No se encontró archivo .env en ninguna ubicación');
}
console.log('DB_NAME:', process.env.DB_NAME);

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pool from './database.js';
import productsRoutes from './routes/products/products.js';
import authRoutes from './routes/auth/auth.js';
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

// Rate limit general: 100 peticiones por minuto por IP
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Demasiadas peticiones, por favor espera un momento' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', generalLimiter);

app.use(express.json({ limit: '10mb', strict: false }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api', productsRoutes);
app.use('/api/auth', authRoutes);
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

// RUTA TEMPORAL DE DEBUG - BORRAR DESPUÉS
app.get('/debug-env', (req, res) => {
    const envFilePath = path.join(__dirname, '..', '.env');
    let envContent = '';
    try { envContent = fs.readFileSync(envFilePath, 'utf8'); } catch(e) { envContent = 'ERROR: ' + e.message; }
    const result = dotenv.config({ path: envFilePath, override: true });
    res.json({
        envFirst200Chars: envContent.substring(0, 200),
        envCharCodes: Array.from(envContent.substring(0, 30)).map(c => c.charCodeAt(0)),
        dotenvError: result.error ? result.error.message : 'ninguno',
        DB_HOST: process.env.DB_HOST || 'NO DEFINIDO',
        DB_USER: process.env.DB_USER || 'NO DEFINIDO',
        DB_NAME: process.env.DB_NAME || 'NO DEFINIDO',
        HAS_PASSWORD: process.env.DB_PASSWORD ? 'SI' : 'NO'
    });
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
