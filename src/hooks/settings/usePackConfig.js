import { useState, useEffect } from 'react'
import { API_CONFIG, buildFullUrl } from '../../config/api'
import { PACK_SIZE, PACK_COMBINATIONS } from '../../shared/pack'

// Config del pack. Lo importante es el packProductId: la UI decide por ID,
// nunca comparando producto.line === 'Pack' (un admin podría escribir "pack"
// en minúscula y las reglas dejarían de aplicar).
export const usePackConfig = () => {
  const [packProductId, setPackProductId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true)
        const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.SETTINGS_PACK))

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        setPackProductId(data.packProductId ?? null)
      } catch (err) {
        // Sin config no hay pack: la tienda sigue funcionando con los productos normales.
        console.error('No se pudo cargar la configuración del pack:', err.message)
        setPackProductId(null)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return {
    packProductId,
    packSize: PACK_SIZE,
    combinations: PACK_COMBINATIONS,
    loading,
  }
}
