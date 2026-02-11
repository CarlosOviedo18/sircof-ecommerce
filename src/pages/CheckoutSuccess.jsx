import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useConfirmPayment } from '../hooks/useConfirmPayment'

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)
  const { confirmPayment, clearCart, emailSent, confirming } = useConfirmPayment()

  useEffect(() => {
    const code = searchParams.get('code')
    const orderNumber = searchParams.get('order') 
      || searchParams.get('returnData') 
      || searchParams.get('orderNumber')
    const description = searchParams.get('description')
    const tilopayOrderId = searchParams.get('tilopay-transaction') || searchParams.get('tpt')
    const creditCardBrand = searchParams.get('brand')
    const last4CreditCardNumber = searchParams.get('last-digits')

    setOrderData({
      code,
      orderNumber,
      description,
      tilopayOrderId,
      creditCardBrand,
      last4CreditCardNumber
    })

    if (code === '1') {
      clearCart()
      confirmPayment(orderNumber, code)
    }
  }, [searchParams])

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <svg className="w-12 h-12 text-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">Cargando tu confirmación...</p>
        </div>
      </div>
    )
  }

  const isSuccess = orderData.code === '1'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        
        {isSuccess ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 border-b border-green-100">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-green-700 text-center mb-2">¡Pago Aprobado!</h1>
              <p className="text-center text-gray-600 text-lg">Tu orden ha sido procesada correctamente</p>
            </div>

            {/* Contenido principal */}
            <div className="p-8">
              {/* Detalles de la Orden */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Número de Orden</p>
                    <p className="text-2xl font-bold text-dark-coffee mt-1">{orderData.orderNumber}</p>
                  </div>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">ID de Transacción</p>
                    <p className="font-mono text-sm text-gray-700 mt-1">{orderData.tilopayOrderId}</p>
                  </div>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Método de Pago</p>
                    <p className="text-gray-700 mt-1">
                      {orderData.creditCardBrand || 'Tarjeta'} 
                      {orderData.last4CreditCardNumber && ` ****${orderData.last4CreditCardNumber}`}
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10m4 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Estado</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      <p className="text-green-700 font-semibold">Pagado</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Mensaje informativo */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-blue-900 text-sm">
                    <strong>Recibirás un email de confirmación</strong> en breve con los detalles de tu pedido y el estado del envío.
                  </p>
                </div>
              </div>

              {/* Próximos Pasos */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-dark-coffee mb-6">Próximos Pasos</h2>
                <div className="space-y-4">
                  {[
                    { icon: '📋', title: 'Verificaremos tu pedido', desc: 'Nuestro equipo revisa los detalles' },
                    { icon: '📦', title: 'Preparación y empaque', desc: 'Empacaremos tu orden con cuidado' },
                    { icon: '🚚', title: 'Envío y seguimiento', desc: 'Te enviaremos el número de seguimiento' }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-coffee text-white font-bold">
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{step.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-coffee hover:bg-dark-coffee text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-12m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 12m0 0l-7 7-7-7m14-7v10a1 1 0 01-1 1h-3" />
                  </svg>
                  Volver al Inicio
                </button>
                <button
                  onClick={() => navigate('/tienda')}
                  className="flex-1 border-2 border-coffee text-coffee hover:bg-coffee hover:text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Seguir Comprando
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header con gradiente rojo */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 border-b border-red-100">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-red-700 text-center mb-2">Pago Rechazado</h1>
              <p className="text-center text-gray-600 text-lg">{orderData.description || 'Hubo un problema con tu pago'}</p>
            </div>

            {/* Contenido principal */}
            <div className="p-8">
              {/* Error details */}
              <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg mb-8">
                <div className="flex gap-4">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-red-900 font-semibold">Código de Error</p>
                    <p className="text-red-800 mt-1">{orderData.code}</p>
                  </div>
                </div>
              </div>

              {/* Recomendaciones */}
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-8">
                <div className="flex gap-4">
                  <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-yellow-900 font-semibold mb-3">Cómo resolver esto:</p>
                    <ul className="text-yellow-800 space-y-2">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Verifica que los datos de tu tarjeta sean correctos</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Intenta con otra tarjeta si tienes disponible</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Contacta con tu banco si el problema persiste</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/tienda')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Intentar Nuevamente
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-12m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 12m0 0l-7 7-7-7m14-7v10a1 1 0 01-1 1h-3" />
                  </svg>
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutSuccess