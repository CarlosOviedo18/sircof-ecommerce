import { useState } from 'react'
import { API_CONFIG, buildFullUrl } from '../../config/api'

export const usePayment = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const processPayment = async (paymentData) => {
    try {
      setLoading(true)
      setError(null)

      // Obtener el token del localStorage
      const token = localStorage.getItem('token')

      // Enviar los datos del pago al backend
      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.PAYMENT_PROCESS), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      })

      // Si la respuesta no es OK, lanzar error
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error en el pago')
      }

      // Obtener los datos de respuesta
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { processPayment, loading, error }
}
