import { useTranslation } from 'react-i18next'

function PaymentMethodSelector({ selectedMethod, onSelect, paypalOnly = false, paypalOnlyReason = '' }) {
  const { t } = useTranslation('checkout')
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        {t('payment.title')}
      </h2>

      {/* Con el pack en el carrito solo se ofrece PayPal: Tilopay cobra en
          colones y tiene el país fijo en Costa Rica. */}
      {paypalOnly && paypalOnlyReason && (
        <p className="mb-4 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
          {paypalOnlyReason}
        </p>
      )}

      <div className="space-y-3">
        {/* Opción Tarjeta - Tilopay */}
        {!paypalOnly && (
        <button
          type="button"
          onClick={() => onSelect('tilopay')}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
            selectedMethod === 'tilopay'
              ? 'border-coffee bg-coffee/5 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          {/* Radio indicator */}
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            selectedMethod === 'tilopay' ? 'border-coffee' : 'border-gray-300'
          }`}>
            {selectedMethod === 'tilopay' && (
              <div className="w-3 h-3 rounded-full bg-coffee" />
            )}
          </div>

          {/* Card icon */}
          <div className={`p-2 rounded-lg ${selectedMethod === 'tilopay' ? 'bg-coffee/10' : 'bg-gray-100'}`}>
            <svg className={`w-6 h-6 ${selectedMethod === 'tilopay' ? 'text-coffee' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>

          {/* Info */}
          <div className="flex-1 text-left">
            <p className={`font-semibold ${selectedMethod === 'tilopay' ? 'text-gray-800' : 'text-gray-700'}`}>
              {t('payment.card')}
            </p>
            <p className="text-xs text-gray-500">{t('payment.cardBrands')}</p>
          </div>

          {/* Card brand logos */}
          <div className="flex gap-1 flex-shrink-0">
            <div className="w-8 h-5 bg-blue-600 rounded text-white text-[8px] font-bold flex items-center justify-center">VISA</div>
            <div className="w-8 h-5 bg-red-500 rounded text-white text-[8px] font-bold flex items-center justify-center">MC</div>
          </div>
        </button>
        )}

        {/* Opción PayPal */}
        <button
          type="button"
          onClick={() => onSelect('paypal')}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
            selectedMethod === 'paypal'
              ? 'border-[#0070ba] bg-[#0070ba]/5 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          {/* Radio indicator */}
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            selectedMethod === 'paypal' ? 'border-[#0070ba]' : 'border-gray-300'
          }`}>
            {selectedMethod === 'paypal' && (
              <div className="w-3 h-3 rounded-full bg-[#0070ba]" />
            )}
          </div>

          {/* PayPal icon */}
          <div className={`p-2 rounded-lg ${selectedMethod === 'paypal' ? 'bg-[#0070ba]/10' : 'bg-gray-100'}`}>
            <svg className={`w-6 h-6 ${selectedMethod === 'paypal' ? 'text-[#0070ba]' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 00-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 00-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 00.554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 01.923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
            </svg>
          </div>

          {/* Info */}
          <div className="flex-1 text-left">
            <p className={`font-semibold ${selectedMethod === 'paypal' ? 'text-gray-800' : 'text-gray-700'}`}>
              {t('payment.paypal')}
            </p>
            <p className="text-xs text-gray-500">{t('payment.paypalDesc')}</p>
          </div>

          {/* PayPal logo */}
          <div className="flex-shrink-0">
            <div className="px-2 py-1 bg-[#0070ba] rounded text-white text-[9px] font-bold">PayPal</div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default PaymentMethodSelector
