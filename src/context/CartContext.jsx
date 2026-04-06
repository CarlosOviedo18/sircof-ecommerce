import React, { createContext, useState, useCallback, useEffect } from 'react'
import { API_CONFIG, buildFullUrl } from '../config/api'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener el carrito del usuario logueado
  const fetchCart = useCallback(async () => {

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')

      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.CART_GET), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener el carrito')
      }

      const data = await response.json()
      setCartItems(data.items || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para agregar producto al carrito
  const addToCart = useCallback(async (productId, cantidad = 1) => {
    try {
      setError(null)

      const token = localStorage.getItem('token')

      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.CART_ADD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ productId, cantidad })
      })

      if (!response.ok) {
        throw new Error('Error al agregar al carrito')
      }

      // Recarga el carrito después de agregar
      await fetchCart()
    } catch (err) {
      setError(err.message)
    }
  }, [fetchCart])

  // Función para remover producto del carrito
  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      setError(null)

      const token = localStorage.getItem('token')

      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.CART_DELETE, { id: cartItemId }), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (!response.ok) {
        throw new Error('Error al remover del carrito')
      }

      // Actualizar el estado localmente inmediatamente
      setCartItems(prev => prev.filter(item => item.id !== cartItemId))

      // Luego recarga el carrito desde el servidor
      await fetchCart()
    } catch (err) {
      setError(err.message)
    }
  }, [fetchCart])

  // Función para cambiar la cantidad de un producto
  const updateQuantity = useCallback(async (cartItemId, newQuantity) => {
    // Si cantidad es 0 o menor, remover el producto
    if (newQuantity <= 0) {
      removeFromCart(cartItemId)
      return
    }

    try {
      setError(null)

      const token = localStorage.getItem('token')

      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.CART_UPDATE), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ cartItemId, cantidad: newQuantity })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar cantidad')
      }

      // Recarga el carrito después de actualizar
      await fetchCart()
    } catch (err) {
      setError(err.message)
    }
  }, [fetchCart, removeFromCart])

  // Función para limpiar el carrito
  const clearCart = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.CART_GET), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (response.ok) {
        setCartItems([])
      }
    } catch (err) {
    }
  }, [])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refetchCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
