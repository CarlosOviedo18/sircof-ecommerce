import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { API_CONFIG, buildFullUrl } from '../../config/api'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user: authUser, setUser: setAuthUser } = useAuthContext()

  // Función para registrar usuario
  const register = async (name, email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.REGISTER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error en el registro')
      }

      const data = await response.json()
      
      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      
      setAuthUser(data.user)
      return data
    } catch (err) {
      const errorMsg = err.message || 'Error en el registro'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Función para login
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error en el login')
      }

      const data = await response.json()
      
      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      
      setAuthUser(data.user)
      return data
    } catch (err) {
      const errorMsg = err.message || 'Error en el login'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Función para logout
  const logout = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('token')
      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.LOGOUT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      })

      if (!response.ok) {
        throw new Error('Error en logout')
      }

      localStorage.removeItem('token')
      setAuthUser(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    user: authUser,
    loading,
    error,
    register,
    login,
    logout
  }
}
