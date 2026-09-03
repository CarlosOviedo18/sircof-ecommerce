import { useState, useEffect } from 'react'
import { API_CONFIG, buildFullUrl } from '../../config/api'

// Un café con sus variantes.
//
// A diferencia de useProductDetail, que se baja el catálogo ENTERO y filtra
// en el cliente, esto pide solo el café que se está viendo.
export const useCoffeeDetail = (slug) => {
  const [coffee, setCoffee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    let cancelado = false

    const fetchCoffee = async () => {
      try {
        setLoading(true)
        const url = buildFullUrl(API_CONFIG.ENDPOINTS.CATALOG_DETAIL, { slug })
        const response = await fetch(url)

        if (response.status === 404) throw new Error('NOT_FOUND')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        if (cancelado) return

        setCoffee(data.coffee)
        setError(null)
      } catch (err) {
        if (!cancelado) {
          setCoffee(null)
          setError(err.message)
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    fetchCoffee()
    return () => { cancelado = true }
  }, [slug])

  return { coffee, loading, error }
}
