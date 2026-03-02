function CartFooter({ total, isEmpty, onGoToCheckout, onClose }) {
  return (
    <div className="border-t p-6 space-y-4">
      <div className="flex justify-between items-center text-lg font-bold">
        <span>Total:</span>
        <span className="text-coffee">₡{total.toLocaleString('es-CR')}</span>
      </div>

      <button
        onClick={onGoToCheckout}
        disabled={isEmpty}
        className="w-full bg-coffee hover:bg-dark-coffee disabled:bg-gray-300 text-white font-bold py-3 rounded transition-colors text-sm flex items-center justify-center gap-2"
      >
      
        Ir a Pagar
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
