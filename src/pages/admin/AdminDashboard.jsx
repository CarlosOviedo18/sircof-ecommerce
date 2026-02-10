import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'

/**
 * Tarjeta de estadística reutilizable para el dashboard
 */
function StatCard({ icon, label, value, description, color }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
        </div>
      </div>
      {description && (
        <p className="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-3">{description}</p>
      )}
    </div>
  )
}

/**
 * Badge de estado para órdenes
 */
function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  const labels = {
    pending: 'Pendiente',
    paid: 'Pagado',
    cancelled: 'Cancelado'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  )
}

function AdminDashboard() {
  const { getStats, loading } = useAdmin()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getStats()
      .then(data => setStats(data.stats))
      .catch(err => setError(err.message))
  }, [])

  if (loading || (!stats && !error)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <p className="text-sm text-gray-500">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">Error al cargar estadísticas</p>
        <p className="text-red-400 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Resumen general de la tienda</p>
        </div>
        <div className="text-sm text-gray-400">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
          label="Ingresos Totales"
          value={`₡${parseFloat(stats.totalRevenue).toLocaleString('es-CR')}`}
          description="Órdenes completadas (pagadas)"
          color="bg-green-600"
        />
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          label="Total Órdenes"
          value={stats.totalOrders}
          description={`${stats.pendingOrders} pendiente${stats.pendingOrders !== 1 ? 's' : ''}`}
          color="bg-blue-600"
        />
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
          label="Productos"
          value={stats.totalProducts}
          description="En catálogo"
          color="bg-amber-600"
        />
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
          label="Usuarios"
          value={stats.totalUsers}
          description="Registrados en la plataforma"
          color="bg-purple-600"
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ventas recientes - 2 columnas */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Ventas — Últimos 7 días</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Fecha</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Órdenes</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentSales?.length > 0 ? (
                  stats.recentSales.map(sale => (
                    <tr key={sale.date} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(sale.date).toLocaleDateString('es-ES', {
                          weekday: 'short', day: 'numeric', month: 'short'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {sale.orders}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                        ₡{parseFloat(sale.revenue).toLocaleString('es-CR')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400 text-sm">
                      No hay ventas en los últimos 7 días
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Últimas órdenes - 1 columna */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Últimas órdenes</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.latestOrders?.length > 0 ? (
              stats.latestOrders.map(order => (
                <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-gray-500">{order.user_name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('es-ES')}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      ₡{parseFloat(order.total).toLocaleString('es-CR')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">
                No hay órdenes aún
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
