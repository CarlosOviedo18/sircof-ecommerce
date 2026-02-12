import { useState } from 'react'
import { useAuthContext } from '../context/AuthContext'

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user: authUser, setUser: setAuthUser } = useAuthContext()

  // Función para registrar usuario
  const register = async (name, email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/register`, {
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
      setAuthUser(data.user)
      return data
    } catch (err) {
      const errorMsg = err.message || 'Error en el registro'
      console.error('Error en registro:', errorMsg)
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
      
      const response = await fetch(`${API_URL}/login`, {
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
      localStorage.setItem('token', data.token)
      setAuthUser(data.user)
      return data
    } catch (err) {
      const errorMsg = err.message || 'Error en el login'
      console.error('Error en login:', errorMsg)
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
      
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error en logout')
      }

      localStorage.removeItem('token')
      setAuthUser(null)
      setError(null)
    } catch (err) {
      console.error('Error en logout:', err.message)
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
