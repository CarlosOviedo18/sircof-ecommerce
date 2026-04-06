import { useState, useEffect } from 'react'
import { API_CONFIG, buildFullUrl } from '../../config/api'

export const useFeaturedProducts = () => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true)
        const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.PRODUCTS_FEATURED))
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Error al obtener productos destacados`)
        }
        
        const data = await response.json()
        setProductos(data)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [])

  return { productos, loading, error }
}
