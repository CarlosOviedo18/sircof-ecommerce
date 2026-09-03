import { Router } from 'express'
import { getShippingCost, getPackProductId } from '../../services/settingsService.js'
import { getCountries } from '../../services/countriesService.js'
import { PACK_SIZE, ROASTS, GRINDS, PACK_COMBINATIONS } from '../../shared/pack.js'

const router = Router()

// GET /api/settings/shipping - Costo de envío (público, lo necesita el checkout)
//
// Sin protectRoute a propósito: el precio no es sensible (va impreso en la
// página de producto) y así se puede leer sin token.
//
// Se expone SOLO esta clave, nunca un SELECT * de settings: el día que alguien
// guarde un API key en esa tabla, no se filtra por acá.
router.get('/shipping', async (req, res) => {
  try {
    const shippingCost = await getShippingCost()

    res.json({
      success: true,
      shippingCost,
      currency: 'CRC',
    })
  } catch (error) {
    console.error('Error al obtener el costo de envío:', error.message)
    res.status(500).json({ success: false, message: 'Error al obtener el costo de envío' })
  }
})

// GET /api/settings/countries - Lista de países para el formulario de envío
//
// Hace de intermediario con restcountries v5: la API key vive en el .env del
// servidor y nunca llega al navegador. Además la respuesta se cachea 24h acá,
// así el checkout no gasta 3 requests paginados a la API externa en cada carga.
router.get('/countries', async (req, res) => {
  try {
    const countries = await getCountries()
    res.json({ success: true, countries })
  } catch (error) {
    console.error('Error al obtener los países:', error.message)
    res.status(500).json({ success: false, message: 'Error al obtener los países' })
  }
})

// GET /api/settings/pack - Configuración del pack para la tienda y el modal
//
// El frontend decide por ID, nunca comparando line === 'Pack'.
router.get('/pack', async (req, res) => {
  try {
    const packProductId = await getPackProductId()

    res.json({
      success: true,
      packProductId,
      packSize: PACK_SIZE,
      roasts: ROASTS,
      grinds: GRINDS,
      combinations: PACK_COMBINATIONS,
    })
  } catch (error) {
    console.error('Error al obtener la configuración del pack:', error.message)
    res.status(500).json({ success: false, message: 'Error al obtener la configuración del pack' })
  }
})

export default router
