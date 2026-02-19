import { useState } from 'react'

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin`

/**
 * Hook para manejar todas las operaciones del panel de administración.
 * Centraliza las llamadas a la API de admin con autenticación JWT.
 */
export const useAdmin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  })

  /**
   * Función genérica para realizar peticiones al API de admin
   */
  const request = async (endpoint, method = 'GET', body = null) => {
    setLoading(true)
    setError(null)
    try {
      const options = { method, headers: getHeaders() }
      if (body) options.body = JSON.stringify(body)

      const response = await fetch(`${API_URL}${endpoint}`, options)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición')
      }

      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ---- Estadísticas ----
  const getStats = () => request('/stats')

  // ---- Productos ----
  const getProducts = () => request('/products')
  const getProduct = (id) => request(`/products/${id}`)
  const createProduct = (product) => request('/products', 'POST', product)
  const updateProduct = (id, product) => request(`/products/${id}`, 'PUT', product)
  const deleteProduct = (id) => request(`/products/${id}`, 'DELETE')

  // ---- Órdenes ----
  const getOrders = () => request('/orders')
  const updateOrderStatus = (id, status) => request(`/orders/${id}/status`, 'PATCH', { status })

  // ---- Usuarios ----
  const getUsers = () => request('/users')
  const updateUserRole = (id, role) => request(`/users/${id}/role`, 'PATCH', { role })
  const deleteUser = (id) => request(`/users/${id}`, 'DELETE')

  // ---- Contactos ----
  const getContacts = () => request('/contacts')
  const deleteContact = (id) => request(`/contacts/${id}`, 'DELETE')

  return {
    loading,
    error,
    getStats,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus,
    getUsers,
    updateUserRole,
    deleteUser,
    getContacts,
    deleteContact
  }
}
