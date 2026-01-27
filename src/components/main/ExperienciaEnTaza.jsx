import React from 'react'
import tazaCafe from '../../assets/webp/taza con cafe.webp'
import bandolasCafe from '../../assets/webp/bandolasCafe.webp'
import sobreNosotrosImg from '../../assets/webp/SobreNosotros.webp'
import iconoExperiencia from '../../assets/webp/iconoExperienciataza.webp'

function ExperienciaEnTaza() {
return (
    <section className="w-full py-20 px-4 md:px-8 bg-cover bg-center relative" style={{ backgroundImage: `url(${sobreNosotrosImg})` }}>
        {/* Overlay café oscuro */}
        <div className="absolute inset-0 bg-black/40" style={{ backgroundColor: 'rgba(15, 7, 3, 0.5)' }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
            {/* Grid Principal - 2 Columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                
                {/* Columna Izquierda - Imágenes */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 relative z-20">
                    <div className="overflow-hidden rounded-lg">
                        <img src={tazaCafe} alt="Taza con café" loading="lazy" decoding="async" className="w-full h-96 md:h-[30rem] object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                    
                    <div className="overflow-hidden rounded-lg">
                        <img src={bandolasCafe} alt="Bandolas de café" loading="lazy" decoding="async" className="w-full h-96 md:h-[30rem] object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                </div>

                {/* Columna Derecha - Contenido */}
                <div className="flex flex-col gap-4 relative z-20">
                    <h2 className="text-white font-serif font-bold text-3xl md:text-4xl leading-tight">
                        Experiencias únicas en cada taza
                    </h2>

                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                        Descubre el verdadero sabor del café, con aroma intenso y notas únicas que harán disfrutar cada momento.
                    </p>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coffee flex-shrink-0">
                              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                              <path d="M5 12l5 5l10 -10" />
                            </svg>
                            <p className="text-gray-200 text-sm md:text-base">Cultivado con dedicación y pasión</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coffee flex-shrink-0">
                              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                              <path d="M5 12l5 5l10 -10" />
                            </svg>
                            <p className="text-gray-200 text-sm md:text-base">Tostado para resaltar su sabor auténtico</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coffee flex-shrink-0">
                              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                              <path d="M5 12l5 5l10 -10" />
                            </svg>
                            <p className="text-gray-200 text-sm md:text-base">Hecho para quienes disfrutan un buen café</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button className="bg-red-400 hover:bg-red-500 text-white font-poppins font-semibold px-6 py-2 text-sm rounded transition-colors duration-300">
                            Conócenos
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="hidden md:block absolute bottom-4 right-4 opacity-100 z-10">
            <img src={iconoExperiencia} alt="Decoración" loading="lazy" decoding="async" className="w-56 h-56 object-contain" />
        </div>
    </section>
)
}

export default ExperienciaEnTaza
