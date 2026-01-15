import React from 'react'
import sobreNosotrosImg from '../../img/SobreNosotros.jpg'

function SobreNosotros() {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coffee">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M12.432 17.949c.863 1.544 2.589 1.976 4.13 1.112c1.54 -.865 1.972 -2.594 1.048 -4.138c-.185 -.309 -.309 -.556 -.494 -.74c.247 .06 .555 .06 .925 .06c1.726 0 2.959 -1.234 2.959 -2.963c0 -1.73 -1.233 -2.965 -3.02 -2.965c-.37 0 -.617 0 -.925 .062c.185 -.185 .308 -.432 .493 -.74c.863 -1.545 .431 -3.274 -1.048 -4.138c-1.541 -.865 -3.205 -.433 -4.13 1.111c-.185 .309 -.308 .556 -.432 .803c-.123 -.247 -.246 -.494 -.431 -.803c-.802 -1.605 -2.528 -2.038 -4.007 -1.173c-1.541 .865 -1.973 2.594 -1.048 4.137c.185 .31 .308 .556 .493 .741c-.246 -.061 -.555 -.061 -.924 -.061c-1.788 0 -3.021 1.235 -3.021 2.964c0 1.729 1.233 2.964 3.02 2.964" />
          <path d="M4.073 21c4.286 -2.756 5.9 -5.254 7.927 -9" />
        </svg>
      ),
      title: "Calidad de ingredientes",
      description: ""
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coffee">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
          <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
          <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
          <path d="M17 10h2a2 2 0 0 1 2 2v1" />
          <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
          <path d="M3 13v-1a2 2 0 0 1 2 -2h2" />
        </svg>
      ),
      title: "Familia Amor",
      description: ""
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coffee">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M3 14c.83 .642 2.077 1.017 3.5 1c1.423 .017 2.67 -.358 3.5 -1c.83 -.642 2.077 -1.017 3.5 -1c1.423 -.017 2.67 .358 3.5 1" />
          <path d="M8 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2" />
          <path d="M12 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2" />
          <path d="M3 10h14v5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -6 -6v-5" />
          <path d="M16.746 16.726a3 3 0 1 0 .252 -5.555" />
        </svg>
      ),
      title: "Café Fresco",
      description: ""
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coffee">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M16.5 15a4.5 4.5 0 0 0 -4.5 4.5m4.5 -8.5a4.5 4.5 0 0 0 -4.5 4.5m4.5 -8.5a4.5 4.5 0 0 0 -4.5 4.5m-4 3.5c2.21 0 4 2.015 4 4.5m-4 -8.5c2.21 0 4 2.015 4 4.5m-4 -8.5c2.21 0 4 2.015 4 4.5m0 -7.5v6" />
        </svg>
      ),
      title: "Variedad de grano",
      description: ""
    }
  ]

  return (
    <section className="w-full py-20 px-4 md:px-8 bg-cover bg-center relative" style={{ backgroundImage: `url(${sobreNosotrosImg})` }}>
      {/* Overlay oscuro */}
      <div className="absolute inset-0 "></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Encabezado - Grid 2 Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-16">
          {/* Izquierda */}
          <div>
            <p className="text-coffee font-syne text-xs tracking-wider mb-4">NUESTRO CAFE</p>
            <h2 className="text-white font-syne font-bold text-3xl md:text-4xl leading-tight">
              Saborea la mezcla de sabores clásicos
            </h2>
          </div>
          
          {/* Derecha */}
          <div>
            <p className="text-gray-200 text-xs md:text-sm leading-relaxed">
              Café Sircof es un lugar que combina tradición, sabor y hospitalidad familiar. Ofrece un café de alta calidad cultivado en sus propias tierras, donde cada grano es cosechado con esmero para brindar una experiencia auténtica en cada taza.
            </p>
          </div>
        </div>

        {/* Cards Grid - 4 Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-2">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-start group">
              {/* Icono */}
              <div className="w-10 h-10 mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              
              {/* Título */}
              <h3 className="text-white font-syne font-bold text-base md:text-lg mb-4">
                {feature.title}
              </h3>
              
              {/* Flecha */}
              <div className="text-coffee text-xl group-hover:translate-x-2 transition-transform duration-300">
                →
              </div>
              
              {/* Línea divisoria */}
              <div className="w-full h-px bg-gray-600 mt-6 hidden md:block"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SobreNosotros
