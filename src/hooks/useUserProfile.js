import { useState } from 'react'

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

      const response = await fetch('http://localhost:3000/api/user-settings/email', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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

      const response = await fetch('http://localhost:3000/api/user-settings/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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
