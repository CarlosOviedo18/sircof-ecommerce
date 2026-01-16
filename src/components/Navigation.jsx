import React, { useState } from 'react'
import logo from '../img/logo.png'
import portada from '../img/portada.jpg'
import avatar from '../img/avatar.jpg'

function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
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
              <img src={logo} alt="Logo Cafe Sircof" className="h-12 md:h-16 object-contain" />
            </div>

            <div className="flex items-center gap-4 md:gap-12 ml-auto">
             { /* Navegación Desktop */}
                      <nav className="hidden md:block">
                      <ul className="flex gap-6 md:gap-8 font-syne">
                        <li><a href="#inicio" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Inicio</a></li>
                        <li><a href="#paginas" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Sobre Nosotros</a></li>
                        <li><a href="#contacto" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Contactenos</a></li>
                        <li><a href="#galeria" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Galería</a></li>
                        <li><a href="/tienda" className="text-white font-medium text-base md:text-lg hover:text-coffee transition-colors">Tienda</a></li>
                      </ul>
                      </nav>

                      {/* Iconos */}
                          <div className="flex gap-3 md:gap-4 items-center">
                          <button className="text-white hover:scale-110 transition-transform" aria-label="Carrito">
                          <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1 -2.966 2.544h-6.852a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304" /><path d="M9 11v-5a3 3 0 0 1 6 0v5" /></svg>
                          </button>
                          <button className="text-white hover:scale-110 transition-transform" aria-label="Buscar">
                          <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
                          </button>
                          
                          {/* Avatar Usuario */}
                      <div className="hidden md:flex items-center">
                        <img src={avatar} alt="Usuario" className="w-10 h-10 rounded-full object-cover" />
                      </div>
                      
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
                <ul className="flex flex-col gap-1 font-syne px-6">
                  <li><a href="#inicio" className="text-white font-medium text-lg hover:text-coffee transition-colors block py-3 px-4 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Inicio</a></li>
                  <li><a href="#paginas" className="text-white font-medium text-lg hover:text-coffee transition-colors block py-3 px-4 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Sobre Nosotros</a></li>
                  <li><a href="#blog" className="text-white font-medium text-lg hover:text-coffee transition-colors block py-3 px-4 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Blog</a></li>
                  <li><a href="#galeria" className="text-white font-medium text-lg hover:text-coffee transition-colors block py-3 px-4 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Galería</a></li>
                  <li><a href="#tienda" className="text-white font-medium text-lg hover:text-coffee transition-colors block py-3 px-4 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>Tienda</a></li>
                </ul>
              </nav>
            </div>
          )}
        </header>

        {/* Contenido principal */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-lg leading-tight font-niveau">
            Café servido<br />en tu mesa
          </h1>
          <div className="mt-6 md:mt-8 text-xl sm:text-2xl md:text-4xl lg:text-5xl italic text-coffee drop-shadow-md font-niveau">
            <p>Cafe Sircof</p>
          </div>
        </div>
      </section>
    </>
  )
}

export default Navigation
