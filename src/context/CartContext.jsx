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

  // Función para agregar producto al carrito.
  //
  // Devuelve { ok, code } en vez de tragarse el error: antes cualquier fallo
  // se guardaba en el estado y el llamador seguía como si nada, así que un
  // rechazo del servidor (carrito mixto, pack inválido) mostraba
  // "✓ Agregado al carrito".
  //
  // `code` es el código del backend (ver src/shared/pack.js); el llamador lo
  // traduce. El `message` del servidor está en español y no se muestra.
  const addToCart = useCallback(async (productId, cantidad = 1, options = {}) => {
    try {
      setError(null)

      const token = localStorage.getItem('token')

      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.CART_ADD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          productId,
          cantidad,
          ...(options.packSelections && { packSelections: options.packSelections })
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.code || 'CART_ADD_FAILED')
        return { ok: false, code: data.code || 'CART_ADD_FAILED' }
      }

      // Recarga el carrito después de agregar
      await fetchCart()
      return { ok: true }
    } catch (err) {
      setError(err.message)
      return { ok: false, code: 'NETWORK_ERROR' }
    }
  }, [fetchCart])

  // Función para remover producto del carrito
  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      setError(null)

      const token = localStorage.getItem('token')

      // Reemplaza :id con el cartItemId real
      const url = buildFullUrl(API_CONFIG.ENDPOINTS.CART_DELETE, { id: cartItemId })

      const response = await fetch(url, {
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

      // Reemplaza :id con el cartItemId real
      const url = buildFullUrl(API_CONFIG.ENDPOINTS.CART_UPDATE, { id: cartItemId })

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ cantidad: newQuantity })
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
      
      // CART_CLEAR, no CART_GET: apuntaba a /api/cart, que no tiene ruta
      // DELETE y caía en el 404 genérico, así que ni siquiera limpiaba.
      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.CART_CLEAR), {
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
