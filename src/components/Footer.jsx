import footerImg from '../assets/webp/footer.webp'
import logoImg from '../assets/webp/logo.webp'

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
            <p className="text-coffee font-poppins font-semibold text-base">@cafeSircof</p>
            <img src={logoImg} alt="logo" loading="lazy" decoding="async" className="m-2 w-12 h-13 object-contain" />
            <p className="text-gray-300 text-sm mt-1">Síguenos en Instagram</p>
          </div>

          {/* Navegación - Vertical */}
          <div className="flex flex-col items-center">
            <nav>
              <ul className="flex flex-row gap-2 text-center font-poppins">
                <li><a href="/inicio" className="text-gray-100 text-base hover:text-coffee transition-colors">Inicio</a></li>
                <li><a href="/SobreNosotros" className="text-gray-100 text-base hover:text-coffee transition-colors">Sobre Nosotros</a></li>
                <li><a href="/contactenos" className="text-gray-100 text-base hover:text-coffee transition-colors">Contacto</a></li>
                <li><a href="/galeria" className="text-gray-100 text-base hover:text-coffee transition-colors">Galeria</a></li>
                <li><a href="/tienda" className="text-gray-100 text-base hover:text-coffee transition-colors">Tienda</a></li>
              </ul>
            </nav>
          </div>

          {/* Redes Sociales - Vertical */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-coffee font-poppins font-semibold text-base">Síguenos</p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/cafe_sircof" className="text-gray-100 hover:text-coffee transition-colors text-lg" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4l0 -8" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M16.5 7.5v.01" /></svg>
              </a>
              <a href="https://www.facebook.com/sircof/" className="text-gray-100 hover:text-coffee transition-colors text-lg" aria-label="Facebook">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" /></svg>
              </a>
              <a href="https://api.whatsapp.com/send?phone=50624444072" className="text-gray-100 hover:text-coffee transition-colors text-lg" aria-label="WhatsApp">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" /><path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" /></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-400/30 my-8"></div>

        {/* Copyright */}
        <div className="text-center">
            <p className="text-gray-300 text-base font-poppins">
            CafeSircof © 2026. Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
