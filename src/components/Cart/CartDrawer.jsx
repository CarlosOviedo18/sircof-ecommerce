import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { usePayment } from '../../hooks/usePayment'
import { useAuthContext } from '../../context/AuthContext'
import CartHeader from './CartHeader'
import CartItems from './CartItems'
import CartFooter from './CartFooter'

function CartDrawer({ isOpen, onClose }) {
  const { cartItems, loading, removeFromCart, updateQuantity, refetchCart } = useCart()
  const { processPayment, loading: paymentLoading, error: paymentError } = usePayment()
  const { user } = useAuthContext()
  const navigate = useNavigate()
  
  const [shippingData, setShippingData] = useState({
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Costa Rica'
  })
  const [formError, setFormError] = useState('')

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
      console.log('Carrito detectó pago completado, limpiando...')
      localStorage.removeItem('cartCleared')
      const token = localStorage.getItem('token')
      if (token && user?.id) {
        fetch('http://localhost:3001/api/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(() => {
          console.log('Carrito limpiado en BD')
          refetchCart()
        })
        .catch(err => console.error('Error limpiando carrito:', err))
      }
    }
  }, [])

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const estaVacio = cartItems.length === 0

  // Manejar checkout
  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/checkout' } })
      return
    }

    if (!shippingData.address.trim()) {
      setFormError('La dirección es requerida')
      return
    }
    if (!shippingData.city.trim()) {
      setFormError('La ciudad es requerida')
      return
    }
    if (!shippingData.postalCode.trim()) {
      setFormError('El código postal es requerido')
      return
    }

    setFormError('')

    try {
      const result = await processPayment({
        cartItems,
        amount: total,
        phone: shippingData.phone.replace(/\s/g, ''),
        address: shippingData.address,
        city: shippingData.city,
        postal_code: shippingData.postalCode,
        country: shippingData.country
      })

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      } else {
        setFormError('Error: No se recibió URL de pago')
      }
    } catch (error) {
      console.error('Error al procesar pago:', error.message)
      setFormError(error.message || 'Error al procesar el pago')
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
              isLoading={paymentLoading}
              hasUser={!!user}
              shippingData={shippingData}
              setShippingData={setShippingData}
              formError={formError}
              paymentError={paymentError}
              onCheckout={handleCheckout}
              onClose={onClose}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer
