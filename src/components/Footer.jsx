import React from 'react'
import footerImg from '../img/footer.jpg'
import logoImg from '../img/logo.png'

function Footer() {
  return (
    <footer className="relative w-full py-16 md:py-20 bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${footerImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Contenido del footer */}
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center gap-8 mb-12">
          
          {/* Logo - Centrado */}
          <div className="flex flex-col items-center">
            <p className="text-coffee font-syne font-semibold text-sm">@cafeSircof</p>
            <img src={logoImg} alt="logo" className="m-2 w-12 h-13 object-contain" />
            <p className="text-gray-300 text-xs mt-1">Síguenos en Instagram</p>
          </div>

          {/* Navegación - Vertical */}
          <div className="flex flex-col items-center">
            <nav>
              <ul className="flex flex-row gap-2 text-center font-syne">
                <li><a href="#inicio" className="text-gray-100 text-sm hover:text-coffee transition-colors">Inicio</a></li>
                <li><a href="#sobre" className="text-gray-100 text-sm hover:text-coffee transition-colors">Sobre Nosotros</a></li>
                <li><a href="#contacto" className="text-gray-100 text-sm hover:text-coffee transition-colors">Contacto</a></li>
                <li><a href="#servicio" className="text-gray-100 text-sm hover:text-coffee transition-colors">Galeria</a></li>
                <li><a href="#tienda" className="text-gray-100 text-sm hover:text-coffee transition-colors">Tienda</a></li>
              </ul>
            </nav>
          </div>

          {/* Redes Sociales - Vertical */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-coffee font-syne font-semibold text-sm">Síguenos</p>
            <div className="flex gap-4">
              <a href="#instagram" className="text-gray-100 hover:text-coffee transition-colors text-lg" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/></svg>
              </a>
              <a href="#facebook" className="text-gray-100 hover:text-coffee transition-colors text-lg" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333H16V2.169c-.585-.089-1.308-.169-2.227-.169-2.995 0-5.044 1.541-5.044 4.618V8z"/></svg>
              </a>
              <a href="#whatsapp" className="text-gray-100 hover:text-coffee transition-colors text-lg" aria-label="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.15-1.739-.861-2.009-.96-.27-.099-.467-.15-.67.15-.203.299-.788.96-.966 1.155-.177.194-.355.194-.652.037-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.297.297-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a6.963 6.963 0 0 0-6.94 6.979c0 1.538.399 3.039 1.156 4.383L2.92 22l4.799-1.258c1.287.699 2.726 1.064 4.162 1.064h.004a6.97 6.97 0 0 0 6.936-6.979 6.936 6.936 0 0 0-2.036-4.938 6.944 6.944 0 0 0-4.9-2.854M20.52 3.449C18.24 1.245 15.247 0 12.034 0 5.492 0 .104 5.334.104 11.845 0 14.172.563 16.437 1.614 18.44L.254 23.192 5.15 21.815c2.007 1.05 4.271 1.593 6.584 1.593 6.54 0 11.928-5.335 11.928-11.845 0-3.169-1.200-6.134-3.383-8.413Z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-400/30 my-8"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-300 text-sm font-syne">
            CafeSircof © 2024. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
