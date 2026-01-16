import express from 'express';
import cors from 'cors';
import pool from './database.js';
import routes from './routes/routes.js';
import authRoutes from './routes/auth.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
    console.log(` ${req.method} ${req.path}`);
    next();
});

// Usar rutas
app.use('/api', routes);
app.use('/api/auth', authRoutes);

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
    console.log(`❌ Ruta no encontrada: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path,
        method: req.method
    });
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'Sircof Backend - Servidor funcionando' });
});

// Ruta de prueba de conexión a BD
app.get('/test-db', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        res.json({ message: 'Conexión a BD exitosa' });
    } catch (error) {
        res.status(500).json({ message: 'Error de conexión', error: error.message });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📡 Rutas disponibles:`);
    console.log(`   GET http://localhost:${PORT}/`);
    console.log(`   GET http://localhost:${PORT}/test-db`);
    console.log(`   GET http://localhost:${PORT}/api/productos`);
    console.log(`   POST http://localhost:${PORT}/api/auth/register`);
    console.log(`   POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   POST http://localhost:${PORT}/api/auth/logout`);
});
