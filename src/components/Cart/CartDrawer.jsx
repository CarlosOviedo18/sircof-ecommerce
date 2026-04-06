import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/cart/useCart'
import { useAuthContext } from '../../context/AuthContext'
import { API_CONFIG, buildFullUrl } from '../../config/api'
import CartHeader from './CartHeader'
import CartItems from './CartItems'
import CartFooter from './CartFooter'

function CartDrawer({ isOpen, onClose }) {
  const { cartItems, loading, removeFromCart, updateQuantity, refetchCart } = useCart()
  const { user } = useAuthContext()
  const navigate = useNavigate()

  // Recargar carrito cuando se abre el drawer
  useEffect(() => {
    if (isOpen && user) {
      refetchCart()
    }
  }, [isOpen, user])

  // Limpiar carrito cuando se detecta que fue pagado
  useEffect(() => {
    const cleared = localStorage.getItem('cartCleared')
    if (cleared) {
      localStorage.removeItem('cartCleared')
      const token = localStorage.getItem('token')
      if (token && user?.id) {
        fetch(buildFullUrl(API_CONFIG.ENDPOINTS.CART_CLEAR), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then(() => {
          refetchCart()
        })
        .catch(err => {})
      }
    }
  }, [])

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const estaVacio = cartItems.length === 0

  // Navegar a la página de checkout
  const handleGoToCheckout = () => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/checkout' } })
    } else {
      navigate('/checkout')
    }
    onClose()
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
            <CartHeader onClose={onClose} />
            <CartItems 
              items={cartItems} 
              onRemove={removeFromCart} 
              onQuantityChange={updateQuantity} 
              isEmpty={estaVacio} 
            />
            <CartFooter 
              total={total}
              isEmpty={estaVacio}
              onGoToCheckout={handleGoToCheckout}
              onClose={onClose}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer
