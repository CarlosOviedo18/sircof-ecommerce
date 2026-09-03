import { useTranslation } from 'react-i18next'
import CartItem from './CartItem'

function CartItems({ items, onRemove, onQuantityChange, isEmpty }) {
  const { t } = useTranslation('cart')
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {isEmpty ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={onRemove}
              onQuantityChange={onQuantityChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CartItems
