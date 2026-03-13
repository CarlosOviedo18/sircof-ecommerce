import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import App from './App.jsx'
import './i18n'
import './styles/index.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

const AppProviders = ({ children }) => (
  <AuthProvider>
    <CartProvider>
      {children}
    </CartProvider>
  </AuthProvider>
)


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <AppProviders>
            <App />
          </AppProviders>
        </GoogleOAuthProvider>
      ) : (
        <AppProviders>
          <App />
        </AppProviders>
      )}
    </BrowserRouter>
  </StrictMode>,
)
