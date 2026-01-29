import CartItem from './CartItem'

function CartItems({ items, onRemove, onQuantityChange, isEmpty }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {isEmpty ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">El carrito está vacío</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <CartItem
              key={item.id}
              cartItemId={item.id}
              productId={item.product_id}
              cantidad={item.quantity}
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
