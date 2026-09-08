import { Router } from 'express'
import pool from '../../database.js'
import { protectAdmin } from '../../middleware/adminAuth.js'
import { clearSettingsCache } from '../../services/settingsService.js'

const router = Router()

// PUT /api/admin/settings/shipping - Cambiar el costo de envío.
//
// El valor vive en la tabla settings (misma que lee getShippingCost y el
// endpoint público /api/settings/shipping). Al guardar se limpia el caché
// para que aplique al instante, sin esperar los 60 s del TTL.
router.put('/shipping', protectAdmin, async (req, res) => {
  try {
    const valor = Number(req.body.shippingCost)

    if (!Number.isFinite(valor) || valor < 0 || valor > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'El costo de envío debe ser un número entre 0 y 1.000.000',
      })
    }

    // Se guarda con 2 decimales, como el resto de los montos.
    const guardado = valor.toFixed(2)

    await pool.query(
      `INSERT INTO settings (setting_key, setting_value, description)
       VALUES ('shipping_cost', ?, 'Costo fijo de envio en CRC')
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [guardado],
    )

    clearSettingsCache()

    res.json({ success: true, shippingCost: valor })
  } catch (error) {
    console.error('Error al actualizar el costo de envío:', error.message)
    res.status(500).json({ success: false, message: 'Error al actualizar el costo de envío' })
  }
})

export default router
