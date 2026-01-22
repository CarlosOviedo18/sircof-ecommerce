import { useContext, useEffect } from 'react'
import { CartContext } from '../context/CartContext'
import { useAuthContext } from '../context/AuthContext'

export const useCart = () => {
  const context = useContext(CartContext)
  const { user } = useAuthContext()

  // Auto-cargar el carrito cuando el usuario inicia sesión
  useEffect(() => {
    if (user && context?.refetchCart) {
      const token = localStorage.getItem('token')
      if (token) {
        context.refetchCart(token)
      }
    }
  }, [user, context])

  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider')
  }

  return context
}
