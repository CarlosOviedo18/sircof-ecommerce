import { useState, useEffect } from 'react'
import { API_CONFIG, buildFullUrl } from '../../config/api'

// Fallback mientras carga o si el endpoint falla.
// Arranca en 3700 y no en 0 para que el resumen del pedido nunca pinte
// un ₡0 engañoso ni un NaN en el primer render.
export const FALLBACK_SHIPPING = 3700

export const useShippingCost = () => {
  const [shippingCost, setShippingCost] = useState(FALLBACK_SHIPPING)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchShippingCost = async () => {
      try {
        setLoading(true)
        const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.SETTINGS_SHIPPING))

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Error al obtener el costo de envío`)
        }

        const data = await response.json()
        setShippingCost(Number(data.shippingCost))
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchShippingCost()
  }, [])

  return { shippingCost, loading, error }
}
