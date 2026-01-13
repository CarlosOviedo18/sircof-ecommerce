import React from 'react'
import logo from '../img/logo.png'
import portada from '../img/portada.jpg'

function Navigation() {
  return (
    <>
      {/* Hero Section con Header superpuesto */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${portada})` }}>
        <div className="absolute inset-0 bg-black/25"></div>
        
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/40 to-transparent">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <img src={logo} alt="Logo Cafe Sircof" className="h-16 object-contain" />
            </div>

            <div className="flex items-center gap-12 ml-auto">
              {/* Navegación */}
              <nav className="hidden md:block">
                <ul className="flex gap-8 font-syne">
                  <li><a href="#inicio" className="text-white font-medium text-sm hover:text-coffee transition-colors">Inicio</a></li>
                  <li><a href="#paginas" className="text-white font-medium text-sm hover:text-coffee transition-colors">Sobre Nosotros</a></li>
                  <li><a href="#blog" className="text-white font-medium text-sm hover:text-coffee transition-colors">Blog</a></li>
                  <li><a href="#galeria" className="text-white font-medium text-sm hover:text-coffee transition-colors">Galería</a></li>
                  <li><a href="#tienda" className="text-white font-medium text-sm hover:text-coffee transition-colors">Tienda</a></li>
                </ul>
              </nav>

              {/* Iconos */}
              <div className="flex gap-4 items-center">
                <button className="text-white hover:scale-110 transition-transform" aria-label="Carrito">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1 -2.966 2.544h-6.852a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304" /><path d="M9 11v-5a3 3 0 0 1 6 0v5" /></svg>
                </button>
                <button className="text-white hover:scale-110 transition-transform" aria-label="Buscar">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
                </button>
                <button className="md:hidden text-white hover:scale-110 transition-transform" aria-label="Menú">☰</button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold drop-shadow-lg leading-tight font-niveau">
            Café servido<br />en tu mesa
          </h1>
          <div className="mt-8 text-3xl md:text-5xl italic text-coffee drop-shadow-md font-niveau">
            <p>Cafe Sircof</p>
          </div>
        </div>
      </section>
    </>
  )
}

export default Navigation
