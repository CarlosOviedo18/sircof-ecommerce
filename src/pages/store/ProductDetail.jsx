import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProductImage } from '../../lib/productImage'
import { useProductDetail } from '../../hooks/products/useProductDetail'
import { useProductVariant } from '../../hooks/products/useProductVariant'
import { useCart } from '../../hooks/cart/useCart'
import { useShippingCost } from '../../hooks/settings/useShippingCost'
import { usePackConfig } from '../../hooks/settings/usePackConfig'
import { useAuthContext } from '../../context/AuthContext'
import PackPickerModal from '../../components/pack/PackPickerModal'
import QuantityStepper from '../../components/ui/QuantityStepper'

// Esta página quedó como RESOLVER de las URLs viejas por id de producto.
//
// Si el producto pertenece a un café, redirige a /cafe/:slug?variant=<id>,
// así siguen vivos los bookmarks y los links de emails de órdenes viejas.
// Si no tiene café padre (el Pack, o cualquier producto suelto), renderiza
// la página de siempre sin ningún cambio.
function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('store')
  const { user } = useAuthContext()
  const { producto, loading, error } = useProductDetail(id)
  const { coffee: cafePadre, loading: resolviendo } = useProductVariant(id)

  // replace: true para que el botón Atrás no rebote contra la redirección.
  useEffect(() => {
    if (cafePadre?.slug) {
      navigate(`/cafe/${cafePadre.slug}?variant=${id}`, { replace: true })
    }
  }, [cafePadre, id, navigate])
  const { addToCart, refetchCart } = useCart()
  const { shippingCost } = useShippingCost()
  const { packProductId } = usePackConfig()
  const [cantidad, setCantidad] = useState(1)
  const [agregando, setAgregando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState(false)
  const [packModalAbierto, setPackModalAbierto] = useState(false)
  const [errorCarrito, setErrorCarrito] = useState('')

  const esPack = packProductId !== null && producto?.id === packProductId

  // Función para agregar el producto al carrito
  const handleAddToCart = async () => {
    // Verificar si el usuario está logueado
    if (!user) {
      navigate('/login', { state: { returnTo: `/producto/${id}` } })
      return
    }

    // El pack se arma primero en el modal
    if (esPack) {
      setErrorCarrito('')
      setPackModalAbierto(true)
      return
    }

    setAgregando(true)
    const resultado = await addToCart(producto.id, cantidad)
    setAgregando(false)

    // Solo se avisa "agregado" si el servidor realmente lo aceptó
    if (!resultado.ok) {
      setErrorCarrito(t(`pack.errors.${resultado.code}`, { defaultValue: t('pack.errors.generic') }))
      return
    }

    await refetchCart()
    setMensajeExito(true)
    setCantidad(1)

    setTimeout(() => setMensajeExito(false), 2000)
  }

  const handleConfirmarPack = async (packSelections) => {
    setErrorCarrito('')
    setAgregando(true)
    const resultado = await addToCart(producto.id, 1, { packSelections })
    setAgregando(false)

    if (!resultado.ok) {
      setErrorCarrito(t(`pack.errors.${resultado.code}`, { defaultValue: t('pack.errors.generic') }))
      return
    }

    await refetchCart()
    setPackModalAbierto(false)
    setMensajeExito(true)

    setTimeout(() => setMensajeExito(false), 2000)
  }

  // `resolviendo` y `cafePadre` evitan que se vea un parpadeo de esta página
  // antes de saltar a /cafe/:slug.
  if (loading || resolviendo || cafePadre?.slug) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-20 flex items-center justify-center">
        <p className="text-gray-500 text-lg">{t('detail.loadingProduct')}</p>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-20 flex items-center justify-center flex-col gap-4">
        <p className="text-red-500 text-lg">{error ? `Error: ${error}` : t('detail.notFound')}</p>
        <button
          onClick={() => navigate('/tienda')}
          className="bg-coffee hover:bg-dark-coffee text-white font-semibold py-2 px-6 rounded transition-colors"
        >
          {t('detail.backToStore')}
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
          {t('detail.backToStore')}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden h-96 md:h-full">
            <img
              src={getProductImage(producto)}
              alt={producto.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-gray-500 text-sm font-semibold tracking-wider uppercase">
              {t('detail.lineName')} {producto.line}
            </p>

            <h1 className="text-4xl md:text-5xl font-bold text-dark-coffee">
              {producto.name}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex gap-1 text-2xl">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600">(5 {t('detail.reviews')})</p>
            </div>

            <div className="border-t border-b py-6">
              <p className="text-sm text-gray-600 mb-2">{t('detail.price')}</p>
              <p className="text-4xl font-bold text-coffee">
                ₡{producto.price.toLocaleString('es-CR')}
              </p>
            </div>

            <div>
              <p className="text-gray-700 leading-relaxed">
                {t('detail.description', { name: producto.name.toLowerCase(), line: producto.line })}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Selector de cantidad. El pack no lo lleva: se arma en el modal
                  y va siempre de a 1. */}
              {!esPack && (
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-semibold text-gray-700">{t('detail.quantity')}</span>
                  <QuantityStepper
                    value={cantidad}
                    onChange={setCantidad}
                    min={1}
                    decreaseLabel={t('detail.decreaseQuantity')}
                    increaseLabel={t('detail.increaseQuantity')}
                  />
                </div>
              )}

              {/* Mensaje de éxito */}
              {mensajeExito && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded animate-pulse">
                  {t('detail.addedToCart')}
                </div>
              )}

              {errorCarrito && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {errorCarrito}
                </div>
              )}

              {/* Botón agregar al carrito */}
              <button
                onClick={handleAddToCart}
                disabled={agregando}
                className="w-full bg-coffee hover:bg-dark-coffee disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded text-lg transition-colors duration-300"
              >
                {agregando ? t('detail.adding') : esPack ? t('pack.cta') : t('detail.addToCart')}
              </button>

            </div>

            <div className="bg-gray-50 p-6 rounded-lg mt-6 space-y-3 text-sm text-gray-700">
              <div className="flex gap-3">
                <span></span>
                {/* El pack ya trae el envío en el precio: mostrar la tarifa
                    nacional acá sería contradecirlo. */}
                {esPack ? (
                  <p><strong>{t('pack.badgeShipping')}</strong> {t('pack.notForCR')}</p>
                ) : (
                  <p><strong>{t('detail.shipping')}</strong> {t('detail.shippingDesc', { cost: `₡${shippingCost.toLocaleString('es-CR')}` })}</p>
                )}
              </div>
              <div className="flex gap-3">
                <span></span>
                <p><strong>{t('detail.freeReturns')}</strong> {t('detail.freeReturnsDesc')}</p>
              </div>
              <div className="flex gap-3">
                <span></span>
                <p><strong>{t('detail.qualityGuarantee')}</strong> {t('detail.qualityGuaranteeDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {esPack && (
        <PackPickerModal
          isOpen={packModalAbierto}
          onClose={() => setPackModalAbierto(false)}
          onConfirm={handleConfirmarPack}
          precio={Number(producto.price)}
          adding={agregando}
          error={errorCarrito}
        />
      )}
    </div>
  )
}

export default ProductDetail
