import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect } from 'react'
import { useCart } from '../../hooks/useCart'
import CartItem from './CartItem'

function CartDrawer({ isOpen, onClose }) {
  // Usar el Hook personalizado para obtener la lógica del carrito
  const { cartItems, loading, removeFromCart, updateQuantity, refetchCart } = useCart()

  // Recargar carrito cuando se abre el drawer
  useEffect(() => {
    if (isOpen) {
      refetchCart()
    }
  }, [isOpen, refetchCart])

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const estaVacio = cartItems.length === 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay semitransparente */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel deslizable desde la derecha */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header del Drawer */}
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

            {/* Contenido del Carrito */}
            <div className="flex-1 overflow-y-auto p-6">
              {estaVacio ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg">El carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cartItems.map(item => (
                    <CartItem
                      key={item.id}
                      cartItemId={item.id}
                      productId={item.product_id}
                      cantidad={item.quantity}
                      onRemove={removeFromCart}
                      onQuantityChange={updateQuantity}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer con total y botón checkout */}
            <div className="border-t p-6 space-y-4">
              {/* Total del carrito */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-coffee">₡{total.toLocaleString('es-CR')}</span>
              </div>

              {/* Botones de acción */}
              <button
                disabled={estaVacio}
                className="w-full bg-coffee hover:bg-dark-coffee disabled:bg-gray-300 text-white font-bold py-3 rounded transition-colors"
              >
                Proceder al Pago
              </button>

              <button
                onClick={onClose}
                className="w-full border-2 border-coffee text-coffee hover:bg-coffee hover:text-white font-bold py-3 rounded transition-colors"
              >
                Seguir Comprando
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer
