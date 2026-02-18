import { useEffect, useRef } from 'react'
import { useAuth } from './useAuth'
import { useNavigate } from 'react-router-dom'

export const useSessionTimeout = (timeoutMinutes = 30) => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const timeoutRef = useRef(null)
  const isWarningShownRef = useRef(false)

  useEffect(() => {
    // Solo activar si hay usuario logueado
    if (!user) return

    const resetTimeout = () => {
      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      isWarningShownRef.current = false

      // Establecer nuevo timeout
      timeoutRef.current = setTimeout(async () => {
    
        await logout()
        navigate('/login')
        alert('Tu sesión ha expirado por inactividad. Por favor inicia sesión de nuevo.')
      }, timeoutMinutes * 60 * 1000) 
    }

    // Iniciar timeout al montar o cuando cambia el usuario
    resetTimeout()

    // Eventos de actividad del usuario
    const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart']

    const handleActivity = () => {
      resetTimeout()
    }

    // Agregar listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity)
    })

    // Limpiar al desmontar
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [user, logout, navigate, timeoutMinutes])
}
