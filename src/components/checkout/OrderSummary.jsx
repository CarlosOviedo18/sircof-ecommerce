import { useTranslation } from 'react-i18next'
import { useProductDetail } from '../../hooks/products/useProductDetail'
import cafeNacional from '../../assets/webp/cafeNacional.webp'
import cafePremium from '../../assets/webp/cafePremium.webp'

function OrderItemRow({ item }) {
  const { t } = useTranslation('checkout')
  const { producto, loading } = useProductDetail(item.product_id)

  if (loading) {
    return (
      <tr className="border-b">
        <td colSpan={4} className="py-4 text-gray-400 text-sm">{t('orderSummary.loading')}</td>
      </tr>
    )
  }

  if (!producto) return null

  const imagen = producto.line === 'Premium' ? cafePremium : cafeNacional
  const subtotal = producto.price * item.quantity

  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <img
            src={imagen}
            alt={producto.name}
            loading="lazy"
            decoding="async"
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div>
            <p className="font-semibold text-gray-800 text-sm">{producto.name}</p>
            <p className="text-xs text-gray-500">{t('orderSummary.line')}: {producto.line}</p>
          </div>
        </div>
      </td>
      <td className="py-4 text-center text-gray-600 text-sm">{item.quantity}</td>
      <td className="py-4 text-center text-gray-600 text-sm">₡{producto.price.toLocaleString('es-CR')}</td>
      <td className="py-4 text-right font-semibold text-gray-800 text-sm">₡{subtotal.toLocaleString('es-CR')}</td>
    </tr>
  )
}

function OrderSummary({ cartItems, total }) {
  const { t } = useTranslation('checkout')
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {t('orderSummary.title')}
      </h2>

      {/* Tabla de productos */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left pb-3">{t('orderSummary.product')}</th>
              <th className="text-center pb-3">{t('orderSummary.qty')}</th>
              <th className="text-center pb-3">{t('orderSummary.price')}</th>
              <th className="text-right pb-3">{t('orderSummary.subtotal')}</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map(item => (
              <OrderItemRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t-2 border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-800">{t('orderSummary.total')}</span>
          <span className="text-2xl font-bold text-coffee">₡{total.toLocaleString('es-CR')}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
