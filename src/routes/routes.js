import { Router } from 'express';
import db from '../database.js';

const router = Router();

// Ruta para obtener todos los productos
router.get('/productos', async (req, res) => {
  try {
    const [productos] = await db.query('SELECT id, name, price, line FROM products LIMIT 3');
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos', details: error.message });
  }
});



export default router;
