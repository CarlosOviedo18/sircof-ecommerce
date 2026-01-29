import ShippingForm from './ShippingForm'

function CartFooter({ total, isEmpty, isLoading, hasUser, shippingData, setShippingData, formError, paymentError, onCheckout, onClose }) {
  return (
    <div className="border-t p-6 space-y-4 overflow-y-auto max-h-96">
      <div className="flex justify-between items-center text-lg font-bold">
        <span>Total:</span>
        <span className="text-coffee">₡{total.toLocaleString('es-CR')}</span>
      </div>

      {!isEmpty && (
        <ShippingForm 
          data={shippingData}
          setData={setShippingData}
          formError={formError}
        />
      )}

      {paymentError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {paymentError}
        </div>
      )}

      <button
        onClick={onCheckout}
        disabled={isEmpty || isLoading || !hasUser}
        className="w-full bg-coffee hover:bg-dark-coffee disabled:bg-gray-300 text-white font-bold py-3 rounded transition-colors text-sm"
      >
        {isLoading ? 'Procesando...' : 'Proceder al Pago'}
      </button>

      <button
        onClick={onClose}
        className="w-full border-2 border-coffee text-coffee hover:bg-coffee hover:text-white font-bold py-3 rounded transition-colors text-sm"
      >
        Seguir Comprando
      </button>
    </div>
  )
}

export default CartFooter
