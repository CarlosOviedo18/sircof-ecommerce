import { useState } from 'react'
import { API_CONFIG, buildFullUrl } from '../../config/api'

export const useConfirmPayment = () => {
  const [emailSent, setEmailSent] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const confirmPayment = async (orderNumber, code) => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !orderNumber) return

      setConfirming(true)

      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.PAYMENT_CONFIRM), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    } finally {
      setConfirming(false)
    }
  }

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.CART_CLEAR), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      localStorage.removeItem('anonCart')
      localStorage.setItem('cartCleared', Date.now().toString())
    } catch (error) {
    }
  }

  return { confirmPayment, clearCart, emailSent, confirming }
}
