import { useState } from 'react'

export const useConfirmPayment = () => {
  const [emailSent, setEmailSent] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const confirmPayment = async (orderNumber, code) => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !orderNumber) return

      setConfirming(true)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderNumber, code })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEmailSent(true)
        }
      }
    } catch (error) {
      console.error('Error confirmando pago:', error)
    } finally {
      setConfirming(false)
    }
  }

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await fetch(`${import.meta.env.VITE_API_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      localStorage.removeItem('anonCart')
      localStorage.setItem('cartCleared', Date.now().toString())
    } catch (error) {
      console.error('Error limpiando carrito:', error)
    }
  }

  return { confirmPayment, clearCart, emailSent, confirming }
}
