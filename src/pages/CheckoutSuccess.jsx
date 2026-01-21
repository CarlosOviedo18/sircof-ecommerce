import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)

  useEffect(() => {
    // Obtener parámetros de Tilopay
    const code = searchParams.get('code')
    const orderNumber = searchParams.get('orderNumber')
    const description = searchParams.get('description')
    const tilopayOrderId = searchParams.get('tilopayOrderId')
    const creditCardBrand = searchParams.get('creditCardBrand')
    const last4CreditCardNumber = searchParams.get('last4CreditCardNumber')

    setOrderData({
      code,
      orderNumber,
      description,
      tilopayOrderId,
      creditCardBrand,
      last4CreditCardNumber
    })

    // Si el pago fue aprobado, limpiar el carrito
    if (code === '1') {
      clearCart()
      localStorage.removeItem('anonCart')
      localStorage.setItem('cartCleared', Date.now().toString())
    }
  }, [searchParams])

  // Función para limpiar el carrito desde el backend
  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.warn('No hay token, carrito no se puede limpiar en BD')
        return
      }

      const response = await fetch('http://localhost:3000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Error limpiando carrito:', response.statusText)
        return
      }

      const data = await response.json()
      console.log('Carrito limpiado:', data)
    } catch (error) {
      console.error('Error limpiando carrito:', error)
    }
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-20 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee/10 to-white pt-20 pb-20 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
        
        {orderData.code === '1' ? (
          <>
            {/* ✅ Pago Aprobado */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-bounce">✅</div>
              <h1 className="text-4xl font-bold text-green-600 mb-2">¡Pago Aprobado!</h1>
              <p className="text-gray-600 text-lg">Tu orden ha sido procesada correctamente</p>
            </div>

            {/* Detalles de la Orden */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
              <div className="border-b pb-4">
                <p className="text-sm text-gray-600 mb-1">Número de Orden</p>
                <p className="text-xl font-bold text-dark-coffee">{orderData.orderNumber}</p>
              </div>

              <div className="border-b pb-4">
                <p className="text-sm text-gray-600 mb-1">ID de Transacción</p>
                <p className="font-mono text-sm text-gray-700">{orderData.tilopayOrderId}</p>
              </div>

              <div className="border-b pb-4">
                <p className="text-sm text-gray-600 mb-1">Método de Pago</p>
                <p className="text-gray-700">
                  {orderData.creditCardBrand || 'Tarjeta'} 
                  {orderData.last4CreditCardNumber && ` ****${orderData.last4CreditCardNumber}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Estado</p>
                <p className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                  Pagado
                </p>
              </div>
            </div>

            {/* Mensaje informativo */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
              <p className="text-blue-900 text-sm">
                 <strong>Recibirás un email de confirmación</strong> en breve con los detalles de tu pedido y el estado del envío.
              </p>
            </div>

            {/* Próximos Pasos */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-dark-coffee mb-4">Próximos Pasos:</h2>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-coffee text-white rounded-full flex items-center justify-center text-sm">1</span>
                  <p className="text-gray-700">Verificaremos y prepararemos tu pedido</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-coffee text-white rounded-full flex items-center justify-center text-sm">2</span>
                  <p className="text-gray-700">Te enviaremos el número de seguimiento</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-coffee text-white rounded-full flex items-center justify-center text-sm">3</span>
                  <p className="text-gray-700">Recibirás tu pedido en el domicilio</p>
                </li>
              </ol>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-coffee hover:bg-dark-coffee text-white font-bold py-3 rounded transition-colors"
              >
                Volver al Inicio
              </button>
              <button
                onClick={() => navigate('/tienda')}
                className="flex-1 border-2 border-coffee text-coffee hover:bg-coffee hover:text-white font-bold py-3 rounded transition-colors"
              >
                Seguir Comprando
              </button>
            </div>
          </>
        ) : (
          <>
            {/*  Pago Rechazado o Error */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4"></div>
              <h1 className="text-4xl font-bold text-red-600 mb-2">Pago Rechazado</h1>
              <p className="text-gray-600 text-lg">{orderData.description || 'Hubo un problema con tu pago'}</p>
            </div>

            {/* Detalles del Error */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-8">
              <p className="text-red-900 text-sm">
                <strong>Código de Error:</strong> {orderData.code}
              </p>
            </div>

            {/* Recomendaciones */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8">
              <p className="text-yellow-900 text-sm">
                 <strong>Por favor intenta:</strong>
              </p>
              <ul className="text-yellow-900 text-sm mt-2 space-y-1 ml-4 list-disc">
                <li>Verifica que los datos de tu tarjeta sean correctos</li>
                <li>Intenta con otra tarjeta</li>
                <li>Contacta con tu banco si el problema persiste</li>
              </ul>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/tienda')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors"
              >
                Intentar Nuevamente
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 rounded transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CheckoutSuccess
