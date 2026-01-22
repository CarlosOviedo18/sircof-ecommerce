import React, { createContext, useState, useCallback, useEffect } from 'react'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener el carrito del usuario logueado
  const fetchCart = useCallback(async (token) => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:3000/api/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener el carrito')
      }

      const data = await response.json()
      setCartItems(data.items || [])
    } catch (err) {
      console.error('Error fetching cart:', err)
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
      const response = await fetch('http://localhost:3000/api/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, cantidad })
      })

      if (!response.ok) {
        throw new Error('Error al agregar al carrito')
      }

      // Recarga el carrito después de agregar
      await fetchCart(token)
    } catch (err) {
      console.error('Error adding to cart:', err)
      setError(err.message)
    }
  }, [fetchCart])

  // Función para remover producto del carrito
  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      setError(null)

      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3000/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al remover del carrito')
      }

      // Actualizar el estado localmente inmediatamente
      setCartItems(prev => prev.filter(item => item.id !== cartItemId))

      // Luego recarga el carrito desde el servidor
      await fetchCart(token)
    } catch (err) {
      console.error('Error removing from cart:', err)
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
      const response = await fetch(`http://localhost:3000/api/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cantidad: newQuantity })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar cantidad')
      }

      // Recarga el carrito después de actualizar
      await fetchCart(token)
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError(err.message)
    }
  }, [fetchCart, removeFromCart])

  // Función para limpiar el carrito
  const clearCart = useCallback(async (token) => {
    try {
      const response = await fetch('http://localhost:3000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setCartItems([])
      }
    } catch (err) {
      console.error('Error clearing cart:', err)
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
