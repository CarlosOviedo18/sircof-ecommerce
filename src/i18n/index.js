import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// ES namespaces
import esNavbar from './locales/es/navbar.json'
import esHome from './locales/es/home.json'
import esFooter from './locales/es/footer.json'
import esContact from './locales/es/contact.json'
import esAbout from './locales/es/about.json'
import esStore from './locales/es/store.json'
import esCart from './locales/es/cart.json'
import esCheckout from './locales/es/checkout.json'
import esAuth from './locales/es/auth.json'
import esUser from './locales/es/user.json'
import esGallery from './locales/es/gallery.json'
import esAdmin from './locales/es/admin.json'
import esCommon from './locales/es/common.json'

// EN namespaces
import enNavbar from './locales/en/navbar.json'
import enHome from './locales/en/home.json'
import enFooter from './locales/en/footer.json'
import enContact from './locales/en/contact.json'
import enAbout from './locales/en/about.json'
import enStore from './locales/en/store.json'
import enCart from './locales/en/cart.json'
import enCheckout from './locales/en/checkout.json'
import enAuth from './locales/en/auth.json'
import enUser from './locales/en/user.json'
import enGallery from './locales/en/gallery.json'
import enAdmin from './locales/en/admin.json'
import enCommon from './locales/en/common.json'

const savedLanguage = localStorage.getItem('language') || 'es'

i18n.use(initReactI18next).init({
  resources: {
    es: {
      navbar: esNavbar,
      home: esHome,
      footer: esFooter,
      contact: esContact,
      about: esAbout,
      store: esStore,
      cart: esCart,
      checkout: esCheckout,
      auth: esAuth,
      user: esUser,
      gallery: esGallery,
      admin: esAdmin,
      common: esCommon
    },
    en: {
      navbar: enNavbar,
      home: enHome,
      footer: enFooter,
      contact: enContact,
      about: enAbout,
      store: enStore,
      cart: enCart,
      checkout: enCheckout,
      auth: enAuth,
      user: enUser,
      gallery: enGallery,
      admin: enAdmin,
      common: enCommon
    }
  },
  lng: savedLanguage,
  fallbackLng: 'es',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false
  }
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng)
})

export default i18n
