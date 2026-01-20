import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { usePayment } from '../../hooks/usePayment'
import { useAuthContext } from '../../context/AuthContext'
import CartItem from './CartItem'

function CartDrawer({ isOpen, onClose }) {
  // Usar el Hook personalizado para obtener la lógica del carrito
  const { cartItems, loading, removeFromCart, updateQuantity, refetchCart } = useCart()
  const { processPayment, loading: paymentLoading, error: paymentError } = usePayment()
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')

  // Recargar carrito cuando se abre el drawer
  useEffect(() => {
    if (isOpen && user) {
      refetchCart()
    }
  }, [isOpen, user])

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const estaVacio = cartItems.length === 0

  // Validar formato del teléfono
  const validatePhone = (phoneValue) => {
    const phoneRegex = /^(\d{4}-\d{4}|\d{8})$/
    return phoneRegex.test(phoneValue.replace(/\s/g, ''))
  }

  // Manejar checkout
  const handleCheckout = async () => {
    // Verificar si el usuario está logueado
    if (!user) {
      navigate('/login', { state: { returnTo: '/checkout' } })
      return
    }

    // Validar teléfono SOLO si lo ingresó
    if (phone.trim() && !validatePhone(phone)) {
      setPhoneError('Formato inválido. Usa: 8765-4321 o 87654321')
      return
    }

    setPhoneError('')

    try {
      // Enviar datos del pago al backend
      const result = await processPayment({
        cartItems,
        amount: total,
        phone: phone.replace(/\s/g, '')
      })

      // Redirigir a Tilopay
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      } else {
        alert('Error: No se recibió URL de pago')
      }
    } catch (error) {
      console.error('Error al procesar pago:', error.message)
      setPhoneError(error.message || 'Error al procesar el pago')
    }
  }

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

            {/* Footer con total, teléfono y botón checkout */}
            <div className="border-t p-6 space-y-4">
              {/* Total del carrito */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-coffee">₡{total.toLocaleString('es-CR')}</span>
              </div>

              {/* Input de teléfono (solo mostrar si no está vacío) */}
              {!estaVacio && (
                <div>
                  <input
                    type="tel"
                    placeholder="Teléfono (ej: 8765-4321)"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setPhoneError('')
                    }}
                    className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                      phoneError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-coffee'
                    }`}
                  />
                  {phoneError && (
                    <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                  )}
                </div>
              )}

              {/* Mostrar error de pago si existe */}
              {paymentError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {paymentError}
                </div>
              )}

              {/* Botón Proceder al Pago */}
              <button
                onClick={handleCheckout}
                disabled={estaVacio || paymentLoading || !user}
                className="w-full bg-coffee hover:bg-dark-coffee disabled:bg-gray-300 text-white font-bold py-3 rounded transition-colors"
              >
                {paymentLoading ? 'Procesando...' : 'Proceder al Pago'}
              </button>

              {/* Botón Seguir Comprando */}
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
