import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/webp/logo.webp'
import CartDrawer from './Cart/CartDrawer'
import SearchBox from './navigation/SearchBox'
import { useAuthContext } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

function TrasparentNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { user } = useAuthContext()
  const { logout } = useAuth()
  const { cartItems } = useCart()
  const navigate = useNavigate()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Header Transparente - sin fondo ni imagen */}
      <header className="relative w-full bg-transparent z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/"><img src={logo} alt="Logo Cafe Sircof" loading="lazy" decoding="async" className="h-12 md:h-16 object-contain" /></a>
          </div>

          <div className="flex items-center gap-4 md:gap-12 ml-auto">
            {/* Navegación Desktop */}
            <nav className="hidden md:block">
              <ul className="flex gap-6 md:gap-8 font-sans">
                <li><a href="/" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Inicio</a></li>
                <li><a href="/#paginas" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Sobre Nosotros</a></li>
                <li><a href="/contactenos" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Contactenos</a></li>
                <li><a href="/galeria" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Galería</a></li>
                <li><a href="/tienda" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Tienda</a></li>
              </ul>
            </nav>

            {/* Iconos */}
            <div className="flex gap-3 md:gap-4 items-center">
              <button 
                onClick={() => setCartOpen(true)}
                className="text-white hover:scale-110 transition-transform relative" 
                aria-label="Carrito"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2 -1.61l1.34 -8.5h-13.02"/></svg>
                {/* Badge con cantidad */}
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <SearchBox />
              
              {/* Avatar Usuario / Logout */}
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                   <button
                          onClick={() => navigate("/user-settings")}
                          className="text-white hover:text-coffee transition-colors hover:scale-110 relative"
                          title="Configuración de usuario"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-user-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" /></svg>
                          {/* Indicador verde de online */}
                          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </button>
                
                </div>
              ) : (
                <a href="/login" className="hidden md:block text-white hover:text-coffee font-medium text-sm transition-colors">
                  Login
                </a>
              )}
              
              <button className="md:hidden text-white hover:scale-110 transition-transform text-2xl" aria-label="Menú" onClick={toggleMobileMenu}>☰</button>
            </div>
          </div>
        </div>

        {/* Menú Mobile */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-black/90 backdrop-blur">
            <ul className="flex flex-col gap-4 px-4 py-4 font-sans">
              <li><a href="/" className="text-white font-medium hover:text-coffee transition-colors" onClick={() => setMobileMenuOpen(false)}>Inicio</a></li>
              <li><a href="/#paginas" className="text-white font-medium hover:text-coffee transition-colors" onClick={() => setMobileMenuOpen(false)}>Sobre Nosotros</a></li>
              <li><a href="/contactenos" className="text-white font-medium hover:text-coffee transition-colors" onClick={() => setMobileMenuOpen(false)}>Contactenos</a></li>
              <li><a href="/galeria" className="text-white font-medium hover:text-coffee transition-colors" onClick={() => setMobileMenuOpen(false)}>Galería</a></li>
              <li><a href="/tienda" className="text-white font-medium hover:text-coffee transition-colors" onClick={() => setMobileMenuOpen(false)}>Tienda</a></li>
              {user && (
                <li><button onClick={handleLogout} className="text-white font-medium hover:text-coffee transition-colors">Logout</button></li>
              )}
            </ul>
          </nav>
        )}
      </header>

      {/* CartDrawer */}
      <CartDrawer cartOpen={cartOpen} setCartOpen={setCartOpen} />
    </>
  )
}

export default TrasparentNavigation
