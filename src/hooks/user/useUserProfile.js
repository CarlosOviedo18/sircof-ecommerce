import { useState } from 'react'
import { API_CONFIG, buildFullUrl } from '../../config/api'

export const useUserProfile = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateEmail = async (newEmail) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.USER_SETTINGS_EMAIL), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newEmail })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar email')
      }
      
      return { success: true, message: data.message }
    } catch (err) {
      const errorMsg = err.message
      setError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (currentPassword, newPassword) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(buildFullUrl(API_CONFIG.ENDPOINTS.USER_SETTINGS_PASSWORD), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar contraseña')
      }
      
      return { success: true, message: data.message }
    } catch (err) {
      const errorMsg = err.message
      setError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  return { updateEmail, updatePassword, loading, error }
}
