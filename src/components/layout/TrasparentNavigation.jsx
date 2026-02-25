import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/webp/logo.webp'
import CartDrawer from '../Cart/CartDrawer'
import SearchBox from '../navigation/SearchBox'
import { useAuthContext } from '../../context/AuthContext'
import { useAuth } from '../../hooks/auth/useAuth'
import { useCart } from '../../hooks/cart/useCart'

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
              <button className="md:hidden text-white hover:scale-110 transition-transform text-2xl" aria-label="Menú" onClick={toggleMobileMenu}>☰</button>
              <SearchBox />
              
              {/* Avatar Usuario / Logout */}
            
              
     
            </div>
          </div>
        </div>

        {/* Menú Mobile */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-black/90 backdrop-blur">
            <ul className="flex flex-col gap-4 px-4 py-4 font-sans">
              <li><a href="/" className="text-white font-medium hover:text-coffee transition-colors" onClick={() => setMobileMenuOpen(false)}>Inicio</a></li>
              <li><a href="/sobre-nosotros" className="text-white font-medium hover:text-coffee transition-colors" onClick={() => setMobileMenuOpen(false)}>Sobre Nosotros</a></li>
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
