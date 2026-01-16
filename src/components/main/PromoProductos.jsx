import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProductosDestacados } from '../../hooks/useProductosDestacados'
import cafeNacional from '../../img/cafeNacional.jpeg'
import cafePremium from '../../img/cafePremium.jpeg'
import sobreNosotrosImg from '../../img/SobreNosotros.jpg'

function PromoProductos() {
  const { productos, loading, error } = useProductosDestacados()

  useEffect(() => {
  
  }, [productos, loading, error])

  if (loading) {
    return (
      <section className="w-full py-20 px-4 md:px-8 bg-cover bg-center relative" style={{ backgroundImage: `url(${sobreNosotrosImg})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-white font-syne font-bold text-3xl md:text-4xl text-center mb-16">
            Productos
          </h2>
          <p className="text-red-500 text-center">Error: {error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-20 px-4 md:px-8 bg-cover bg-center relative" style={{ backgroundImage: `url(${sobreNosotrosImg})` }}>
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Título */}
        <h2 className="text-white font-syne font-bold text-4xl md:text-5xl text-center mb-16">
          Productos
        </h2>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {productos.map((producto) => (
            <div key={producto.id} className="flex flex-col group">
              {/* Imagen con etiqueta de fecha */}
              <div className="relative overflow-hidden rounded-lg mb-4 h-80 md:h-96">
                <img 
                  src={producto.line === 'Premium' ? cafePremium : cafeNacional}
                  alt={producto.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Etiqueta de fecha */}
                <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-2 rounded font-syne font-bold text-sm">
                  <div>12</div>
                  <div className="text-xs">JUN</div>
                </div>
              </div>

              {/* Info del producto */}
              <div className="flex flex-col gap-2">
                {/* Categoría */}
                <p className="text-gray-400 text-sm tracking-wider font-syne">
                  LÍNEA {producto.line?.toUpperCase()}
                </p>

                {/* Comentarios */}
                <p className="text-gray-400 text-xs font-syne">
                  1 Comment
                </p>

                {/* Nombre del producto */}
                <h3 className="text-white font-syne font-bold text-lg md:text-xl leading-tight group-hover:text-coffee transition-colors duration-300">
                  {producto.name}
                </h3>

                {/* Precio */}
                <p className="text-coffee text-sm font-syne font-semibold">
                  ₡{producto.price.toLocaleString('es-CR')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Botón */}
        <div className="flex justify-center">
          <Link to="/tienda" onClick={() => window.scrollTo(0, 0)} className="bg-red-400 hover:bg-red-500 text-white font-syne font-semibold px-10 py-3 rounded transition-colors duration-300 inline-block">
            Ordena al tuyo
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PromoProductos
