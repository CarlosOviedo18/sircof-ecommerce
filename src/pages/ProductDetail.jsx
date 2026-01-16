import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProductos } from '../hooks/useProductos'
import cafeNacional from '../img/cafeNacional.jpeg'
import cafePremium from '../img/cafePremium.jpeg'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { productos, loading, error } = useProductos()
  const [producto, setProducto] = useState(null)

  useEffect(() => {
    if (productos.length > 0) {
      const productoEncontrado = productos.find(p => p.id === parseInt(id))
      if (productoEncontrado) {
        setProducto(productoEncontrado)
      }
    }
  }, [productos, id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-20 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Cargando producto...</p>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-20 flex items-center justify-center flex-col gap-4">
        <p className="text-red-500 text-lg">{error ? `Error: ${error}` : 'Producto no encontrado'}</p>
        <button
          onClick={() => navigate('/tienda')}
          className="bg-coffee hover:bg-dark-coffee text-white font-semibold py-2 px-6 rounded transition-colors"
        >
          Volver a la tienda
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => navigate('/tienda')}
          className="mb-8 text-coffee hover:text-dark-coffee font-semibold flex items-center gap-2"
        >
          ← Volver a la tienda
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden h-96 md:h-full">
            <img
              src={producto.line === 'Premium' ? cafePremium : cafeNacional}
              alt={producto.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-gray-500 text-sm font-semibold tracking-wider uppercase">
              Línea {producto.line}
            </p>

            <h1 className="text-4xl md:text-5xl font-bold text-dark-coffee">
              {producto.name}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex gap-1 text-2xl">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600">(5 reseñas)</p>
            </div>

            <div className="border-t border-b py-6">
              <p className="text-sm text-gray-600 mb-2">Precio</p>
              <p className="text-4xl font-bold text-coffee">
                ₡{producto.price.toLocaleString('es-CR')}
              </p>
            </div>

            <div>
              <p className="text-gray-700 leading-relaxed">
                Disfruta de nuestro café {producto.name.toLowerCase()} de la línea {producto.line}. 
                Cuidadosamente seleccionado y tostado para ofrecerte la mejor experiencia de sabor.
                Cada grano es procesado con dedicación para garantizar la calidad SIRCOF.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button className="w-full bg-coffee hover:bg-dark-coffee text-white font-bold py-3 px-6 rounded text-lg transition-colors duration-300">
                Agregar al carrito
              </button>
              <button className="w-full border-2 border-coffee text-coffee hover:bg-coffee hover:text-white font-bold py-3 px-6 rounded text-lg transition-colors duration-300">
                ❤ Agregar a favoritos
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mt-6 space-y-3 text-sm text-gray-700">
              <div className="flex gap-3">
                <span>📦</span>
                <p><strong>Envío gratis</strong> en compras mayores a ₡10,000</p>
              </div>
              <div className="flex gap-3">
                <span>🔄</span>
                <p><strong>Devoluciones gratis</strong> en los primeros 30 días</p>
              </div>
              <div className="flex gap-3">
                <span>✓</span>
                <p><strong>Garantía de calidad</strong> SIRCOF</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
