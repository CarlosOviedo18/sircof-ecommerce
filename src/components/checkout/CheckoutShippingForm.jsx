import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function CheckoutShippingForm({ data, setData, formError }) {
  const { t } = useTranslation('checkout')
  const [phoneError, setPhoneError] = useState('')
  const [countries, setCountries] = useState([])

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name')
      .then(res => res.json())
      .then(data => {
        const countryNames = data.map(c => c.name.common).sort()
        setCountries(countryNames)
      })
      .catch(err => console.error('Error cargando países:', err))
  }, [])

  const validatePhone = (phoneValue) => {
    const phoneRegex = /^(\d{4}-\d{4}|\d{8})$/
    return phoneRegex.test(phoneValue.replace(/\s/g, ''))
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
            value={data.country}
            onChange={(e) => setData({ ...data, country: e.target.value })}
            className={inputClasses}
          >
            <option value="">{t('shippingData.selectCountry')}</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
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
