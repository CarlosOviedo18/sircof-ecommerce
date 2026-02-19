import { useState } from 'react'

export const usePurchases = () => {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPurchases = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No hay token disponible')
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/orders`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener las órdenes')
      }

      const data = await response.json()
      setPurchases(data.orders || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching purchases:', err)
    } finally {
      setLoading(false)
    }
  }

  return { purchases, loading, error, fetchPurchases }
}