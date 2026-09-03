import { useState, useEffect } from 'react'
import { API_CONFIG, buildFullUrl } from '../../config/api'

// Una variante con su café (si lo tiene).
// Lo usa el resolver de /producto/:id para redirigir a /cafe/:slug.
export const useProductVariant = (id) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    let cancelado = false

    const fetchVariant = async () => {
      try {
        setLoading(true)
        const url = buildFullUrl(API_CONFIG.ENDPOINTS.PRODUCTS_DETAIL, { id })
        const response = await fetch(url)

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const json = await response.json()
        if (cancelado) return

        setData({ product: json.product, coffee: json.coffee })
        setError(null)
      } catch (err) {
        if (!cancelado) {
          setData(null)
          setError(err.message)
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    fetchVariant()
    return () => { cancelado = true }
  }, [id])

  return { product: data?.product ?? null, coffee: data?.coffee ?? null, loading, error }
}
