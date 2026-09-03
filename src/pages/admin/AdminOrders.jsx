import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdmin } from '../../hooks/admin/useAdmin'

const STATUS_CONFIG = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  paid: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' }
}

const STATUS_LABEL_KEYS = {
  pending: 'orders.statusPending',
  paid: 'orders.statusPaid',
  cancelled: 'orders.statusCancelled'
}

function StatusBadge({ status, t }) {
  const config = STATUS_CONFIG[status] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' }
  const label = STATUS_LABEL_KEYS[status] ? t(STATUS_LABEL_KEYS[status]) : status
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {label}
    </span>
  )
}

// Detalle expandido de una orden. Estaba duplicado en la vista móvil y la de
// escritorio, así que el desglose del pack y la dirección se agregan una vez.
function OrderDetails({ order, t }) {
  const direccion = [
    order.address,
    [order.city, order.state].filter(Boolean).join(', '),
    order.postal_code,
    order.country
  ].filter(Boolean)

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {order.items?.map((item, i) => (
          <div key={i} className="text-xs text-gray-500 py-1">
            <div className="flex items-center justify-between">
              <span>{item.product_name} (x{item.quantity})</span>
              <span className="font-medium">₡{parseFloat(item.price).toLocaleString('es-CR')}</span>
            </div>

            {item.packSelections?.length > 0 && (
              <ul className="mt-1 ml-3 text-[11px] text-gray-400 space-y-0.5">
                {item.packSelections.map((sel, j) => (
                  <li key={j}>{sel.quantity} × {sel.roast} · {sel.grind}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Sin esto no se puede despachar el pedido */}
      {direccion.length > 0 && (
        <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
          <p className="font-semibold text-gray-600 mb-0.5">{t('orders.shippingAddress')}</p>
          {direccion.map((linea, i) => <p key={i}>{linea}</p>)}
          {order.phone && <p>Tel: {order.phone}</p>}
        </div>
      )}
    </div>
  )
}

function AdminOrders() {
  const { t, i18n } = useTranslation('admin')
  const { getOrders, updateOrderStatus, loading } = useAdmin()
  const [orders, setOrders] = useState([])
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  const loadOrders = async () => {
    try {
      const data = await getOrders()
      setOrders(data.orders)
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setFeedback({ type: 'success', message: t('orders.statusUpdated', { id: orderId, status: STATUS_LABEL_KEYS[newStatus] ? t(STATUS_LABEL_KEYS[newStatus]) : newStatus }) })
      loadOrders()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('orders.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('orders.subtitle')}</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: t('orders.all') },
          { key: 'pending', label: t('orders.pendingTab') },
          { key: 'paid', label: t('orders.paidTab') },
          { key: 'cancelled', label: t('orders.cancelledTab') },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === tab.key
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              filterStatus === tab.key ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {statusCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Vista móvil - Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredOrders.map(order => (
            <div key={order.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    {t('orders.order')} #{order.id}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">{order.user_name}</p>
                  <p className="text-xs text-gray-400">{order.user_email}</p>
                </div>
                <StatusBadge status={order.status} t={t} />
              </div>
              {expandedOrder === order.id && order.items && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <OrderDetails order={order} t={t} />
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-sm font-semibold text-gray-900">₡{parseFloat(order.total).toLocaleString('es-CR')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  disabled={loading}
                  className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                >
                  <option value="pending">{t('orders.statusPending')}</option>
                  <option value="paid">{t('orders.statusPaid')}</option>
                  <option value="cancelled">{t('orders.statusCancelled')}</option>
                </select>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">{filterStatus !== 'all' ? t('orders.noOrdersWithStatus', { status: STATUS_LABEL_KEYS[filterStatus] ? t(STATUS_LABEL_KEYS[filterStatus]) : filterStatus }) : t('orders.noOrders')}</p>
            </div>
          )}
        </div>

        {/* Tabla - Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{t('orders.order')}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{t('orders.client')}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{t('orders.status')}</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{t('orders.total')}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{t('orders.date')}</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{t('orders.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      #{order.id}
                    </button>
                    {/* Expanded items */}
                    {expandedOrder === order.id && order.items && (
                      <div className="mt-3 pl-5">
                        <OrderDetails order={order} t={t} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{order.user_name}</p>
                    <p className="text-xs text-gray-400">{order.user_email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} t={t} />
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    ₡{parseFloat(order.total).toLocaleString('es-CR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={loading}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="pending">{t('orders.statusPending')}</option>
                      <option value="paid">{t('orders.statusPaid')}</option>
                      <option value="cancelled">{t('orders.statusCancelled')}</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 text-gray-300"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p className="text-sm">{filterStatus !== 'all' ? t('orders.noOrdersWithStatus', { status: STATUS_LABEL_KEYS[filterStatus] ? t(STATUS_LABEL_KEYS[filterStatus]) : filterStatus }) : t('orders.noOrders')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminOrders
