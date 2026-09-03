
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TIMEOUT: 30000,
  ENDPOINTS: {
    // ====== AUTH ======
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    GOOGLE: '/api/auth/google',
    VERIFY_2FA: '/api/auth/verify-2fa',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_RESET_CODE: '/api/auth/verify-reset-code',
    RESET_PASSWORD: '/api/auth/reset-password',
    
    // ====== CART ======
    CART_GET: '/api/cart',
    CART_ADD: '/api/cart/add',
    CART_UPDATE: '/api/cart/:id',
    CART_DELETE: '/api/cart/:id',
    CART_CLEAR: '/api/cart/clear',
    
    // ====== PRODUCTS ======
    PRODUCTS_LIST: '/api/productos',
    PRODUCTS_DETAIL: '/api/products/:id',
    PRODUCTS_FEATURED: '/api/productos-destacados',

    // ====== CATALOGO (cafés con sus variantes) ======
    CATALOG_LIST: '/api/catalogo',
    CATALOG_DETAIL: '/api/catalogo/:slug',
    
    // ====== ORDERS ======
    ORDERS_LIST: '/api/orders/orders',
    ORDERS_DETAIL: '/api/orders/:id',
    ORDERS_CREATE: '/api/orders',
    
    // ====== USER PROFILE ======
    USER_SETTINGS_EMAIL: '/api/user-settings/email',
    USER_SETTINGS_PASSWORD: '/api/user-settings/password',
    USER_PROFILE: '/api/user/profile',
    USER_UPDATE: '/api/user/update',
    
    // ====== ADMIN ======
    ADMIN_STATS: '/api/admin/stats',
    ADMIN_NOTIFICATIONS: '/api/admin/stats/notifications',
    ADMIN_PRODUCTS: '/api/admin/products',
    ADMIN_PRODUCTS_CREATE: '/api/admin/products',
    ADMIN_PRODUCTS_UPDATE: '/api/admin/products/:id',
    ADMIN_PRODUCTS_DELETE: '/api/admin/products/:id',
    ADMIN_ORDERS: '/api/admin/orders',
    ADMIN_ORDERS_UPDATE_STATUS: '/api/admin/orders/:id/status',
    ADMIN_USERS: '/api/admin/users',
    ADMIN_USERS_UPDATE_ROLE: '/api/admin/users/:id/role',
    ADMIN_USERS_DELETE: '/api/admin/users/:id',
    ADMIN_CONTACTS: '/api/admin/contacts',
    ADMIN_CONTACTS_DELETE: '/api/admin/contacts/:id',
    
    // ====== CONTACT ======
    CONTACT_SUBMIT: '/api/contact',
    
    // ====== PAYMENT ======
    PAYMENT_PROCESS: '/api/payment/process',
    PAYMENT_CONFIRM: '/api/payment/confirm',
    PAYPAL_CREATE_ORDER: '/api/paypal/create-order',
    PAYPAL_CAPTURE_ORDER: '/api/paypal/capture-order',

    // ====== SETTINGS ======
    SETTINGS_SHIPPING: '/api/settings/shipping',
    SETTINGS_COUNTRIES: '/api/settings/countries',
    SETTINGS_PACK: '/api/settings/pack'
  }
}


export const buildUrl = (endpoint, params) => {
  let url = endpoint
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value)
    })
  }
  return url
}

export const buildFullUrl = (endpoint, params) => {
  const path = buildUrl(endpoint, params)
  return `${API_CONFIG.BASE_URL}${path}`
}
