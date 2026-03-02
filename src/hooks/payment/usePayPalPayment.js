import { useState } from 'react'

export const usePayPalPayment = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Crear orden en PayPal y obtener URL de aprobación
   */
  const createPayPalOrder = async (paymentData) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear orden PayPal')
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error en pago PayPal:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Capturar (confirmar) un pago aprobado por el usuario
   */
  const capturePayPalOrder = async (paypalOrderId) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/paypal/capture-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paypalOrderId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al capturar pago PayPal')
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error capturando pago PayPal:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createPayPalOrder, capturePayPalOrder, loading, error }
}
