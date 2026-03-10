import { useTranslation } from 'react-i18next'

function CartHeader({ onClose }) {
  const { t } = useTranslation('cart')
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <h2 className="text-2xl font-bold text-dark-coffee">{t('title')}</h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
        aria-label={t('closeCart')}
      >
        ✕
      </button>
    </div>
  )
}

export default CartHeader
