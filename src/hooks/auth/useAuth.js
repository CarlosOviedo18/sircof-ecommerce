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
        credentials: 'include',
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
        credentials: 'include',
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
      
      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.LOGOUT), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
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
