import { useState, useEffect } from 'react'
import { API_CONFIG, buildFullUrl } from '../../config/api'

// Catálogo agrupado: un objeto por café, con sus variantes anidadas.
// Reemplaza a useProducts() en la tienda.
export const useCatalog = () => {
  const [coffees, setCoffees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true)
        const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.CATALOG_LIST))

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        setCoffees(data.coffees || [])
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCatalog()
  }, [])

  return { coffees, loading, error }
}
