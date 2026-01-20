import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../img/logo.png'
import portada from '../img/portada.jpg'
import avatar from '../img/avatar.jpg'
import CartDrawer from './Cart/CartDrawer'
import { useAuthContext } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'

function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { user } = useAuthContext()
  const { logout } = useAuth()
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
      {/* Hero Section con Header superpuesto */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden" style={{ backgroundImage: `url(${portada})`, backgroundSize: 'cover', backgroundPosition: 'center 20%', backgroundAttachment: 'fixed' }}>
        <div className="absolute inset-0 bg-black/25"></div>
        
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/40 to-transparent">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/"><img src={logo} alt="Logo Cafe Sircof" className="h-12 md:h-16 object-contain" /></a>
            </div>

            <div className="flex items-center gap-4 md:gap-12 ml-auto">
              {/* Navegación Desktop */}
              <nav className="hidden md:block">
                <ul className="flex gap-6 md:gap-8 font-sans">
                  <li><a href="#inicio" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Inicio</a></li>
                  <li><a href="#paginas" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Sobre Nosotros</a></li>
                  <li><a href="#contacto" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Contactenos</a></li>
                  <li><a href="#galeria" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Galería</a></li>
                  <li><a href="/tienda" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Tienda</a></li>
                </ul>
              </nav>

              {/* Iconos */}
              <div className="flex gap-3 md:gap-4 items-center">
                <button 
                  onClick={() => setCartOpen(true)}
                  className="text-white hover:scale-110 transition-transform" 
                  aria-label="Carrito"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-shopping-cart"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M15 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 17h-11v-14h-2" /><path d="M6 5l14 1l-1 7h-13" /></svg>
                </button>

                <button className="text-white hover:scale-110 transition-transform" aria-label="Buscar">
                  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
                </button>

                {/* Usuario */}
                        {user ? (
                          <div className="hidden md:flex items-center gap-4">
                          <img src={avatar} alt="Usuario" className="w-10 h-10 rounded-full object-cover border-2 border-coffee" />
                          <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-coffee text-white font-medium text-base md:text-lg rounded-lg hover:bg-coffee/90 transition-colors"
                          >
                            Logout
                          </button>
                          </div>
                        ) : (
                          <a href="/login" className="hidden md:block px-2 py-1 bg-coffee text-white font-medium text-base md:text-lg rounded-lg hover:bg-coffee/90 transition-colors">
                          ¡Inicia sesión!
                          </a>
                        )}

                        <button className="md:hidden text-white hover:scale-110 transition-transform text-2xl" aria-label="Menú" onClick={toggleMobileMenu}>☰</button>
                        </div>
                      </div>
                      </div>

                      {/* Menú Mobile */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 md:hidden z-40" onClick={() => setMobileMenuOpen(false)}>
              <nav className="absolute top-0 right-0 h-screen w-3/4 max-w-xs bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-md shadow-2xl animate-in slide-in-from-right">
                <div className="flex justify-end p-6">
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white text-3xl hover:text-coffee transition-colors w-10 h-10 flex items-center justify-center"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>
                <ul className="flex flex-col gap-1 font-sans px-6">
                  <li><a href="#inicio" className="text-white font-medium text-lg hover:text-coffee transition-colors block py-3 px-4 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Inicio</a></li>
                  <li><a href="#paginas" className="text-white font-medium text-lg hover:text-coffee transition-colors block py-3 px-4 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Sobre Nosotros</a></li>
                  <li><a href="#contacto" className="text-white font-medium text-lg hover:text-coffee transition-colors block py-3 px-4 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Contactenos</a></li>
                  <li><a href="#galeria" className="text-white font-medium text-lg hover:text-coffee transition-colors block py-3 px-4 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Galería</a></li>
                  <li><a href="/tienda" className="text-white font-medium text-lg hover:text-coffee transition-colors block py-3 px-4 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Tienda</a></li>
                  {user ? (
                    <li><button onClick={handleLogout} className="w-full text-left text-white font-medium text-lg hover:text-coffee transition-colors block py-3 px-4 rounded-lg hover:bg-white/10">Logout</button></li>
                  ) : (
                    <li><a href="/login" className="text-white font-medium text-lg hover:text-coffee transition-colors block py-3 px-4 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Login</a></li>
                  )}
                </ul>
              </nav>
            </div>
          )}
        </header>

        {/* CartDrawer */}
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

        {/* Contenido principal */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-lg leading-tight font-serif">
            Café servido<br />en tu mesa
          </h1>
          <div className="mt-6 md:mt-8 text-xl sm:text-2xl md:text-4xl lg:text-5xl italic text-coffee drop-shadow-md font-serif">
            <p>Cafe Sircof</p>
          </div>
        </div>
      </section>
    </>
  )
}

export default Navigation
