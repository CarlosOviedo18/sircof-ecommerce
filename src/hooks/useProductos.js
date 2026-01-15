import { useState, useEffect } from 'react'

export const useProductos = () => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:3000/api/productos')
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Error al obtener productos`)
        }
        
        const data = await response.json()
        setProductos(data)
        setError(null)
      } catch (err) {
        console.error('❌ Error en useProductos:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [])

  return { productos, loading, error }
}
