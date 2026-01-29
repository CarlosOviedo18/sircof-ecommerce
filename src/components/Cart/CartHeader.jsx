function CartHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <h2 className="text-2xl font-bold text-dark-coffee">Carrito de Compra</h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
        aria-label="Cerrar carrito"
      >
        ✕
      </button>
    </div>
  )
}

export default CartHeader
