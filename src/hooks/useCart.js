import { useState, useEffect } from 'react'
import { useAuthContext } from '../context/AuthContext'

const API_URL = 'http://localhost:3000/api/cart'

export const useCart = () => {
  const { user } = useAuthContext()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener el carrito del usuario logueado
  useEffect(() => {
    if (user) {
      fetchCart()
    }
  }, [user])

  // Función para obtener items del carrito
  const fetchCart = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}`, {
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
  }

  // Función para agregar producto al carrito
  const addToCart = async (productId, cantidad = 1) => {
    try {
      setError(null)
      
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/add`, {
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
      await fetchCart()
    } catch (err) {
      console.error('Error adding to cart:', err)
      setError(err.message)
    }
  }

  // Función para remover producto del carrito
  const removeFromCart = async (cartItemId) => {
    try {
      setError(null)
      
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al remover del carrito')
      }

      // Recarga el carrito después de remover
      await fetchCart()
    } catch (err) {
      console.error('Error removing from cart:', err)
      setError(err.message)
    }
  }

  // Función para cambiar la cantidad de un producto
  const updateQuantity = async (cartItemId, newQuantity) => {
    // Si cantidad es 0 o menor, remover el producto
    if (newQuantity <= 0) {
      removeFromCart(cartItemId)
      return
    }

    try {
      setError(null)
      
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/${cartItemId}`, {
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
      await fetchCart()
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError(err.message)
    }
  }

  // Función para calcular el total del carrito
  const calcularTotal = () => {
    return 0
  }

  return {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    calcularTotal,
    refetchCart: fetchCart
  }
}
