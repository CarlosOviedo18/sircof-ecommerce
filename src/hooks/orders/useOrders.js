import { useState } from 'react'
import { API_CONFIG, buildFullUrl } from '../../config/api'

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

      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.ORDERS_LIST), {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener las órdenes')
      }

      const data = await response.json()
      setPurchases(data.orders || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { purchases, loading, error, fetchPurchases }
}