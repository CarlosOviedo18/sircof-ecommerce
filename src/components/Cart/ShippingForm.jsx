import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function ShippingForm({ data, setData, formError }) {
  const { t } = useTranslation('cart')
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
      setPhoneError(t('shipping.phoneError'))
    } else {
      setPhoneError('')
    }
  }

  return (
    <div className="space-y-3 pt-4 border-t">
      <h3 className="font-bold text-sm">{t('shipping.title')}</h3>
      
      <div>
        <input
          type="tel"
          placeholder={t('shipping.phonePlaceholder')}
          value={data.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className={`w-full border rounded px-3 py-2 text-sm focus:outline-none transition-colors ${
            phoneError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-coffee'
          }`}
        />
        {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
      </div>

      <input
        type="text"
        placeholder={t('shipping.addressPlaceholder')}
        value={data.address}
        onChange={(e) => setData({ ...data, address: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-coffee transition-colors"
      />

      <input
        type="text"
        placeholder={t('shipping.cityPlaceholder')}
        value={data.city}
        onChange={(e) => setData({ ...data, city: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-coffee transition-colors"
      />

      <input
        type="text"
        placeholder={t('shipping.postalCodePlaceholder')}
        value={data.postalCode}
        onChange={(e) => setData({ ...data, postalCode: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-coffee transition-colors"
      />

      <select
        value={data.country}
        onChange={(e) => setData({ ...data, country: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-coffee transition-colors"
      >
        <option value="">{t('shipping.selectCountry')}</option>
        {countries.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs">
          {formError}
        </div>
      )}
    </div>
  )
}

export default ShippingForm
