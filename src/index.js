import 'dotenv/config.js'
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pool from './database.js';
import routes from './routes/routes.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import cartRoutes from './routes/cart.js';
import paymentRoutes from './routes/payment.js';
import ordersRoutes from './routes/orders.js';
import userSettingsRoutes from './routes/UserSettings.js';
import contactFormRoutes from './routes/contactForm.js';
import adminRoutes from './routes/admin.js';
import passwordResetRoutes from './routes/passwordReset.js';

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

app.use('/api', routes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/logout', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/contact', contactFormRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', passwordResetRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Sircof Backend-Servidor funcionando' });
});

app.get('/test-db', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        res.json({ message: 'Conexión a BD exitosa' });
    } catch (error) {
        res.status(500).json({ message: 'Error de conexión', error: error.message });
    }
});

app.use((req, res) => {
    console.error(`Ruta no encontrada: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path,
        method: req.method
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
