import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()
const SESSION_TIMEOUT_MINUTES = 30 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const lastActivityTime = localStorage.getItem('lastActivityTime')
    
    if (storedUser && lastActivityTime) {
      try {
        // Verificar si la sesión ha expirado
        const timeSinceLastActivity = Date.now() - parseInt(lastActivityTime)
        const timeoutMs = SESSION_TIMEOUT_MINUTES * 60 * 1000
        
        if (timeSinceLastActivity > timeoutMs) {
          // Sesión expirada, limpiar datos
          localStorage.removeItem('user')
          localStorage.removeItem('lastActivityTime')
          setUser(null)
        } else {
          // Sesión válida, restaurar usuario
          setUser(JSON.parse(storedUser))
          // Actualizar timestamp de actividad
          localStorage.setItem('lastActivityTime', Date.now().toString())
        }
      } catch (err) {
        localStorage.removeItem('user')
        localStorage.removeItem('lastActivityTime')
      }
    }
    setLoading(false)
  }, [])

  // Guardar usuario en localStorage cuando cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('lastActivityTime', Date.now().toString())
    } else {
      localStorage.removeItem('user')
      localStorage.removeItem('lastActivityTime')
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de AuthProvider')
  }
  return context
}

