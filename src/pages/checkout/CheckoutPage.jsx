import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../hooks/cart/useCart'
import { usePayment } from '../../hooks/payment/usePayment'
import { usePayPalPayment } from '../../hooks/payment/usePayPalPayment'
import { useShippingCost } from '../../hooks/settings/useShippingCost'
import { useAuthContext } from '../../context/AuthContext'
import OrderSummary from '../../components/checkout/OrderSummary'
import CheckoutShippingForm from '../../components/checkout/CheckoutShippingForm'
import PaymentMethodSelector from '../../components/checkout/PaymentMethodSelector'

function CheckoutPage() {
  const { cartItems, loading: cartLoading, refetchCart } = useCart()
  const { processPayment, loading: paymentLoading, error: paymentError } = usePayment()
  const { createPayPalOrder, loading: paypalLoading, error: paypalError } = usePayPalPayment()
  const { shippingCost, loading: shippingLoading } = useShippingCost()
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const { t } = useTranslation('checkout')

  const [shippingData, setShippingData] = useState({
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Costa Rica',
    countryCode: 'CR'
  })
  const [formError, setFormError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('tilopay')

  // Redirigir a login si no hay usuario
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/checkout' } })
    }
  }, [user, navigate])

  // Cargar carrito al entrar
  useEffect(() => {
    if (user) {
      refetchCart()
    }
  }, [user])

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)

  // El precio del pack ya incluye el envío internacional. Esto refleja lo que
  // decide el servidor en src/services/orderTotals.js; el monto real siempre
  // se calcula allá, acá solo se muestra.
  const hasPack = cartItems.some(item => item.is_pack)
  const effectiveShipping = hasPack ? 0 : shippingCost
  const total = subtotal + effectiveShipping

  // El pack solo se puede pagar con PayPal: Tilopay tiene país y moneda
  // hardcodeados a Costa Rica / colones. Se deriva en vez de forzarlo con un
  // useEffect, así no hay un render extra ni un estado que pueda quedar viejo.
  const metodoActivo = hasPack ? 'paypal' : paymentMethod
  const estaVacio = cartItems.length === 0

  const handleConfirmPayment = async () => {
    // Validar campos requeridos
    if (!shippingData.address.trim()) {
      setFormError(t('errors.addressRequired'))
      return
    }
    if (!shippingData.city.trim()) {
      setFormError(t('errors.cityRequired'))
      return
    }
    if (!shippingData.postalCode.trim()) {
      setFormError(t('errors.postalCodeRequired'))
      return
    }

    // El pack es solo para envíos internacionales. El servidor lo valida
    // igual (packGuards.js); esto es solo para no hacer el viaje en vano.
    if (hasPack) {
      if (!shippingData.country.trim()) {
        setFormError(t('errors.countryRequired'))
        return
      }
      if (shippingData.countryCode === 'CR') {
        setFormError(t('errors.packNotForCR'))
        return
      }
      if (shippingData.countryCode === 'US' && !/^[A-Za-z]{2}$/.test(shippingData.state.trim())) {
        setFormError(t('errors.stateRequiredUS'))
        return
      }
    }

    setFormError('')

    if (metodoActivo === 'tilopay') {
      try {
        const result = await processPayment({
          cartItems,
          amount: total,
          phone: shippingData.phone.replace(/\s/g, ''),
          address: shippingData.address,
          city: shippingData.city,
          state: shippingData.state.trim().toUpperCase(),
          postal_code: shippingData.postalCode,
          country: shippingData.country,
          country_code: shippingData.countryCode
        })

        if (result.paymentUrl) {
          window.location.href = result.paymentUrl
        } else {
          setFormError(t('errors.noPaymentUrl'))
        }
      } catch (error) {
        console.error('Error al procesar pago:', error.message)
        setFormError(error.message || t('errors.paymentError'))
      }
    } else if (metodoActivo === 'paypal') {
      try {
        const result = await createPayPalOrder({
          cartItems,
          amount: total,
          phone: shippingData.phone.replace(/\s/g, ''),
          address: shippingData.address,
          city: shippingData.city,
          state: shippingData.state.trim().toUpperCase(),
          postal_code: shippingData.postalCode,
          country: shippingData.country,
          country_code: shippingData.countryCode
        })

        if (result.paymentUrl) {
          window.location.href = result.paymentUrl
        } else {
          setFormError(t('errors.noPaypalUrl'))
        }
      } catch (error) {
        console.error('Error al procesar pago PayPal:', error.message)
        setFormError(error.message || t('errors.paypalError'))
      }
    }
  }

  const isProcessing = paymentLoading || paypalLoading
  const activePaymentError = metodoActivo === 'paypal' ? paypalError : paymentError

  // Estado de carga
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 pb-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-coffee border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Carrito vacío
  if (estaVacio) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 pb-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('emptyCart.title')}</h2>
            <p className="text-gray-500 mb-8">{t('emptyCart.description')}</p>
            <button
              onClick={() => navigate('/tienda')}
              className="bg-coffee hover:bg-dark-coffee text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              {t('emptyCart.goToStore')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-coffee transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">{t('back')}</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{t('title')}</h1>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>

        {/* Layout 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Columna izquierda - Resumen */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28">
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                shippingCost={effectiveShipping}
                shippingIncluded={hasPack}
                total={total}
              />
            </div>
          </div>

          {/* Columna derecha - Formulario y Pago */}
          <div className="lg:col-span-3 space-y-6">
            <CheckoutShippingForm
              data={shippingData}
              setData={setShippingData}
              formError={formError}
            />

            <PaymentMethodSelector
              selectedMethod={metodoActivo}
              onSelect={setPaymentMethod}
              paypalOnly={hasPack}
              paypalOnlyReason={t('errors.packRequiresPaypal')}
            />

            {/* Error de pago */}
            {activePaymentError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {activePaymentError}
              </div>
            )}

            {/* Botón confirmar */}
            <button
              onClick={handleConfirmPayment}
              disabled={isProcessing || estaVacio || shippingLoading}
              className={`w-full ${metodoActivo === 'paypal' ? 'bg-[#0070ba] hover:bg-[#003087]' : 'bg-coffee hover:bg-dark-coffee'} disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg flex items-center justify-center gap-3`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('payment.processing')}
                </>
              ) : metodoActivo === 'paypal' ? (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 00-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 00.554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 01.923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
                  </svg>
                  {t('payment.payWithPaypal')} — ₡{total.toLocaleString('es-CR')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('payment.confirmPay')} — ₡{total.toLocaleString('es-CR')}
                </>
              )}
            </button>

            {/* Nota de seguridad */}
            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {t('payment.securePayment')} {metodoActivo === 'paypal' ? 'PayPal' : 'Tilopay'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
