import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_CONFIG, buildFullUrl } from '../../config/api'

function CheckoutShippingForm({ data, setData, formError }) {
  const { t } = useTranslation('checkout')
  const [phoneError, setPhoneError] = useState('')
  const [countries, setCountries] = useState([])

  // Los países los sirve nuestro backend, que a su vez consulta restcountries.
  // Antes se llamaba a restcountries directo, pero descontinuaron esa versión
  // y el select quedaba vacío sin avisar.
  useEffect(() => {
    fetch(buildFullUrl(API_CONFIG.ENDPOINTS.SETTINGS_COUNTRIES))
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        // El endpoint ahora devuelve [{name, code}]. El shim cubre la ventana
        // entre deployar el backend y reconstruir dist/, donde el bundle viejo
        // podría recibir la forma nueva (o al revés).
        const lista = (data.countries || []).map(c =>
          typeof c === 'string' ? { name: c, code: '' } : c
        )
        setCountries(lista)
      })
      .catch(err => {
        console.error('No se pudieron cargar los países:', err.message)
        setCountries([])
      })
  }, [])

  // El formato de 8 dígitos es costarricense. Para otros países se acepta
  // un teléfono internacional: si no, todo comprador de EE.UU. veía un error.
  const validatePhone = (phoneValue) => {
    const limpio = phoneValue.replace(/\s/g, '')

    if (data.countryCode && data.countryCode !== 'CR') {
      return /^\+?[\d\-()]{7,20}$/.test(limpio)
    }

    return /^(\d{4}-\d{4}|\d{8})$/.test(limpio)
  }

  const handlePhoneChange = (value) => {
    setData({ ...data, phone: value })
    if (value.trim() && !validatePhone(value)) {
      setPhoneError(t('shippingData.phoneError'))
    } else {
      setPhoneError('')
    }
  }

  const inputClasses = "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coffee/30 focus:border-coffee transition-all"

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {t('shippingData.title')}
      </h2>

      <div className="space-y-4">
        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('shippingData.phone')}</label>
          <input
            type="tel"
            placeholder={t('shippingData.phonePlaceholder')}
            value={data.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`${inputClasses} ${phoneError ? '!border-red-500 !focus:ring-red-300' : ''}`}
          />
          {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('shippingData.address')} <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder={t('shippingData.addressPlaceholder')}
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            className={inputClasses}
          />
        </div>

        {/* Ciudad y Código Postal en una fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('shippingData.city')} <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder={t('shippingData.cityPlaceholder')}
              value={data.city}
              onChange={(e) => setData({ ...data, city: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('shippingData.postalCode')} <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder={t('shippingData.postalCodePlaceholder')}
              value={data.postalCode}
              onChange={(e) => setData({ ...data, postalCode: e.target.value })}
              className={inputClasses}
            />
          </div>
        </div>

        {/* País */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('shippingData.country')}</label>
          <select
            value={data.countryCode || ''}
            onChange={(e) => {
              // Se guardan los dos: el nombre va a orders.country (como siempre)
              // y el código ISO es lo que PayPal necesita en country_code.
              const elegido = countries.find(c => c.code === e.target.value)
              setData({
                ...data,
                country: elegido ? elegido.name : '',
                countryCode: elegido ? elegido.code : ''
              })
            }}
            className={inputClasses}
          >
            <option value="">{t('shippingData.selectCountry')}</option>
            {countries.map(c => (
              <option key={c.code || c.name} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Estado / Provincia: PayPal lo exige para direcciones fuera de CR */}
        {data.countryCode && data.countryCode !== 'CR' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('shippingData.state')}
              {data.countryCode === 'US' && <span className="text-red-500"> *</span>}
            </label>
            <input
              type="text"
              placeholder={t('shippingData.statePlaceholder')}
              value={data.state || ''}
              onChange={(e) => setData({ ...data, state: e.target.value })}
              className={inputClasses}
            />
            {data.countryCode === 'US' && (
              <p className="text-xs text-gray-500 mt-1">{t('shippingData.stateHintUS')}</p>
            )}
          </div>
        )}
      </div>

      {formError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {formError}
        </div>
      )}
    </div>
  )
}

export default CheckoutShippingForm
