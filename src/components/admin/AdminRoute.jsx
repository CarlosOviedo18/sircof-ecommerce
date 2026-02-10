import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

/**
 * Componente protector de rutas de administración.
 * Redirige a /login si no hay usuario autenticado.
 * Redirige a / si el usuario no tiene rol admin.
 */
function AdminRoute({ children }) {
  const { user, loading } = useAuthContext()

  // Mientras carga el estado de autenticación, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
          <p className="text-sm text-gray-500">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si el usuario no es admin, redirigir al inicio
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
