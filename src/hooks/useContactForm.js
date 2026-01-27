import { useState } from 'react'

export const useContactForm = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = async (formData) => {
    try {
      setLoading(true)
      setError(null)

      // Validar que tenga los datos requeridos
      if (!formData.nombre || !formData.email || !formData.mensaje) {
        throw new Error('Por favor completa todos los campos requeridos')
      }

      // Hacer petición al backend
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.nombre,
          email: formData.email,
          subject: formData.asunto || null,
          message: formData.mensaje
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al enviar el mensaje')
      }

      const data = await response.json()
      return { success: true, message: 'Mensaje enviado correctamente', id: data.id }

    } catch (err) {
      setError(err.message)
      console.error('Error sending message:', err)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { sendMessage, loading, error }
}
