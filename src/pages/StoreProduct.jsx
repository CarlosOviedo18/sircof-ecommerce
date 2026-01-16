import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProductos } from '../hooks/useProductos'
import cafeNacional from '../img/cafeNacional.jpeg'
import cafePremium from '../img/cafePremium.jpeg'

function StoreProduct() {
  const { productos, loading, error } = useProductos()
  const [sortedProductos, setSortedProductos] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All categories')
  const [sortOrder, setSortOrder] = useState('latest')

  useEffect(() => {
    let filtered = [...(productos || [])]

    // Filtrar por categoría
    if (selectedCategory !== 'All categories') {
      filtered = filtered.filter(p => p.line === selectedCategory)
    }

    // Ordenar
    if (sortOrder === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortOrder === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortOrder === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    setSortedProductos(filtered)
  }, [productos, selectedCategory, sortOrder])

  const categories = ['All categories', ...new Set(productos?.map(p => p.line) || [])]

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-20 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-20 flex items-center justify-center">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-dark-coffee mb-4">
          Tienda SIRCOF
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Mostrando {sortedProductos.length} resultado{sortedProductos.length !== 1 ? 's' : ''}
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filtros */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Filter by category */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-dark-coffee mb-4 flex items-center justify-between cursor-pointer">
                Filter by category
                <span>−</span>
              </h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={selectedCategory === cat}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className={selectedCategory === cat ? 'text-dark-coffee font-semibold' : 'text-gray-600'}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-dark-coffee mb-4">Price</h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  className="w-full"
                />
                <p className="text-gray-600 text-sm">
                  Price: 2400 - 4500
                </p>
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-lg font-bold text-dark-coffee mb-4">Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <label key={stars} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-yellow-400">
                      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main content - Productos */}
          <div className="flex-1">
            {/* Header con ordenamiento */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              <p className="text-gray-600 text-sm">
                Mostrando {sortedProductos.length} resultado{sortedProductos.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-gray-600 font-semibold">
                  Ordenar por los últimos
                </label>
                <select
                  id="sort"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-coffee"
                >
                  <option value="latest">Últimos</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="name">Nombre A-Z</option>
                </select>
              </div>
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProductos.map((producto) => (
                <div key={producto.id} className="flex flex-col group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Imagen */}
                  <Link to={`/producto/${producto.id}`} className="relative overflow-hidden h-72 bg-gray-300 block">
                    <img
                      src={producto.line === 'Premium' ? cafePremium : cafeNacional}
                      alt={producto.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Corazón favorito */}
                    <button className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </Link>

                  {/* Info del producto */}
                  <div className="p-4 flex flex-col gap-2">
                    {/* Categoría */}
                    <p className="text-gray-500 text-xs font-semibold tracking-wider">
                      LÍNEA {producto.line?.toUpperCase()}
                    </p>

                    {/* Nombre */}
                    <h3 className="text-dark-coffee font-bold text-lg group-hover:text-coffee transition-colors duration-300">
                      {producto.name}
                    </h3>

                    {/* Precio y Rating */}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-dark-coffee font-bold text-lg">
                        ₡{producto.price.toLocaleString('es-CR')}
                      </p>
                      <div className="flex gap-1">
                        <span className="text-yellow-400 text-sm">★★★★★</span>
                      </div>
                    </div>

                    {/* Botón agregar */}
                    <button className="mt-4 w-full bg-coffee hover:bg-dark-coffee text-white font-semibold py-2 px-4 rounded transition-colors duration-300">
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {sortedProductos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron productos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreProduct
