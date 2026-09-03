import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../../hooks/products/useCatalog'
import { useCart } from '../../hooks/cart/useCart'
import { useAuthContext } from '../../context/AuthContext'
import { getProductImage } from '../../lib/productImage'
import PackPickerModal from '../../components/pack/PackPickerModal'
import { CATEGORIES, normalizeText } from '../../shared/variants'

function StoreProduct() {
  const { coffees, loading, error } = useCatalog()
  const { addToCart, refetchCart } = useCart()
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const { t } = useTranslation('store')
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const [sortOrder, setSortOrder] = useState('latest')
  const [agregando, setAgregando] = useState({})
  const [exito, setExito] = useState({})
  const [packModalAbierto, setPackModalAbierto] = useState(false)
  const [errorCarrito, setErrorCarrito] = useState('')

  const packCoffee = coffees.find((c) => c.isPack) || null

  // Un texto normalizado por café: nombre + descripción + todas las
  // presentaciones. Así "cafe" (sin tilde), "500" o "grano" encuentran algo,
  // cosa que la búsqueda por nombre exacto no lograba.
  const conBusqueda = useMemo(
    () =>
      coffees.map((c) => ({
        ...c,
        _buscar: normalizeText(
          [
            c.name,
            c.description,
            ...c.variants.flatMap((v) => [v.sizeG, v.grind, v.roast]),
          ]
            .filter(Boolean)
            .join(' '),
        ),
      })),
    [coffees],
  )

  const filtrados = useMemo(() => {
    if (!searchQuery.trim()) return conBusqueda
    const q = normalizeText(searchQuery)
    return conBusqueda.filter((c) => c._buscar.includes(q))
  }, [conBusqueda, searchQuery])

  const porCategoria = useMemo(() => {
    // El orden se aplica DENTRO de cada sección: ordenar entre categorías
    // no significa nada una vez que la tienda está seccionada.
    const ordenar = (lista) => {
      const copia = [...lista]
      if (sortOrder === 'price-asc') copia.sort((a, b) => a.priceMin - b.priceMin)
      else if (sortOrder === 'price-desc') copia.sort((a, b) => b.priceMax - a.priceMax)
      else if (sortOrder === 'name') copia.sort((a, b) => a.name.localeCompare(b.name))
      return copia
    }

    return CATEGORIES.map((cat) => ({
      cat,
      items: ordenar(filtrados.filter((c) => c.category === cat)),
    })).filter((s) => s.items.length > 0)
  }, [filtrados, sortOrder])

  const handleAdd = async (coffee) => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/tienda' } })
      return
    }

    if (coffee.isPack) {
      setErrorCarrito('')
      setPackModalAbierto(true)
      return
    }

    const variante = coffee.variants[0]
    const clave = coffee.slug || variante.id

    setAgregando((p) => ({ ...p, [clave]: true }))
    const r = await addToCart(variante.id, 1)
    setAgregando((p) => ({ ...p, [clave]: false }))

    if (!r.ok) {
      setErrorCarrito(t(`pack.errors.${r.code}`, { defaultValue: t('pack.errors.generic') }))
      return
    }

    await refetchCart()
    setExito((p) => ({ ...p, [clave]: true }))
    setTimeout(() => setExito((p) => ({ ...p, [clave]: false })), 2000)
  }

  const handleConfirmarPack = async (packSelections) => {
    setErrorCarrito('')
    setAgregando((p) => ({ ...p, pack: true }))
    const r = await addToCart(packCoffee.variants[0].id, 1, { packSelections })
    setAgregando((p) => ({ ...p, pack: false }))

    if (!r.ok) {
      setErrorCarrito(t(`pack.errors.${r.code}`, { defaultValue: t('pack.errors.generic') }))
      return
    }

    await refetchCart()
    setPackModalAbierto(false)
    setExito((p) => ({ ...p, pack: true }))
    setTimeout(() => setExito((p) => ({ ...p, pack: false })), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-20 flex items-center justify-center">
        <p className="text-gray-500 text-lg">{t('loading')}</p>
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

  const total = filtrados.length

  return (
    <div className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-dark-coffee mb-4">{t('title')}</h1>

        {searchQuery && (
          <div className="text-center mb-4">
            <p className="text-gray-600">{t('resultsFor')} <strong>"{searchQuery}"</strong></p>
            <button onClick={() => navigate('/tienda')} className="text-coffee hover:underline text-sm mt-1">
              {t('clearSearch')}
            </button>
          </div>
        )}

        <p className="text-center text-gray-600 mb-12">
          {t('showing')} {total} {total !== 1 ? t('results') : t('result')}
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar: anclas a cada sección. Sin estado, solo scroll. */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="lg:sticky lg:top-28">
              <h3 className="text-lg font-bold text-dark-coffee mb-4">{t('filterByCategory')}</h3>
              <nav className="space-y-2">
                {porCategoria.map(({ cat, items }) => (
                  <a
                    key={cat}
                    href={`#cat-${cat}`}
                    className="block text-gray-600 hover:text-coffee transition-colors"
                  >
                    {t(`categories.${cat}`)}{' '}
                    <span className="text-gray-400 text-sm">({items.length})</span>
                  </a>
                ))}
              </nav>

              <div className="mt-8">
                <label htmlFor="sort" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('sortByLatest')}
                </label>
                <select
                  id="sort"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee/30"
                >
                  <option value="latest">{t('sortLatest')}</option>
                  <option value="price-asc">{t('sortPriceAsc')}</option>
                  <option value="price-desc">{t('sortPriceDesc')}</option>
                  <option value="name">{t('sortName')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secciones por categoría */}
          <div className="flex-1 space-y-14">
            {errorCarrito && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errorCarrito}
              </div>
            )}

            {porCategoria.map(({ cat, items }) => (
              <section key={cat} id={`cat-${cat}`} className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-dark-coffee mb-6 pb-3 border-b">
                  {t(`categories.${cat}`)}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((coffee) => {
                    const clave = coffee.slug || coffee.variants[0].id
                    const destino = coffee.slug
                      ? `/cafe/${coffee.slug}`
                      : `/producto/${coffee.variants[0].id}`
                    // Un café con varias presentaciones no tiene un product_id
                    // único que agregar: manda al detalle a elegir.
                    const eligeVariante = !coffee.isPack && coffee.variants.length > 1

                    return (
                      <div
                        key={clave}
                        className="flex flex-col group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                      >
                        <Link to={destino} className="relative overflow-hidden h-72 bg-gray-300 block">
                          <img
                            src={getProductImage(coffee)}
                            alt={coffee.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        <div className="p-4 flex flex-col gap-2 flex-1">
                          <p className="text-gray-500 text-xs font-semibold tracking-wider">
                            {t(`categories.${coffee.category}`).toUpperCase()}
                          </p>

                          <Link to={destino}>
                            <h3 className="text-dark-coffee font-bold text-lg group-hover:text-coffee transition-colors duration-300">
                              {coffee.name}
                            </h3>
                          </Link>

                          {coffee.isPack && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className="bg-coffee/10 text-coffee text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                {t('pack.badgeCount')}
                              </span>
                              <span className="bg-green-100 text-green-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                {t('pack.badgeShipping')}
                              </span>
                              <span className="bg-blue-100 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                {t('pack.badgeIntl')}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-dark-coffee font-bold text-lg">
                              {coffee.priceMin !== coffee.priceMax
                                ? t('fromPrice', { price: `₡${coffee.priceMin.toLocaleString('es-CR')}` })
                                : `₡${coffee.priceMin.toLocaleString('es-CR')}`}
                            </p>
                            <span className="text-yellow-400 text-sm">★★★★★</span>
                          </div>

                          <div className="mt-auto pt-4">
                            {exito[clave] ? (
                              <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center font-semibold animate-pulse">
                                {t('addedToCart')}
                              </div>
                            ) : eligeVariante ? (
                              <Link
                                to={destino}
                                className="block w-full bg-coffee hover:bg-dark-coffee text-white font-semibold py-2 px-4 rounded transition-colors duration-300 text-center"
                              >
                                {t('viewOptions')}
                              </Link>
                            ) : (
                              <button
                                onClick={() => handleAdd(coffee)}
                                disabled={agregando[clave] || agregando.pack}
                                className="w-full bg-coffee hover:bg-dark-coffee disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors duration-300"
                              >
                                {agregando[clave] || (coffee.isPack && agregando.pack)
                                  ? t('adding')
                                  : coffee.isPack
                                    ? t('pack.cta')
                                    : t('addToCart')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}

            {total === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{t('noProducts')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {packCoffee && (
        <PackPickerModal
          isOpen={packModalAbierto}
          onClose={() => setPackModalAbierto(false)}
          onConfirm={handleConfirmarPack}
          precio={packCoffee.priceMin}
          adding={!!agregando.pack}
          error={errorCarrito}
        />
      )}
    </div>
  )
}

export default StoreProduct
