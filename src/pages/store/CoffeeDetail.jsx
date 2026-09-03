import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProductImage } from '../../lib/productImage'
import { useCoffeeDetail } from '../../hooks/products/useCoffeeDetail'
import { useCart } from '../../hooks/cart/useCart'
import { useShippingCost } from '../../hooks/settings/useShippingCost'
import { useAuthContext } from '../../context/AuthContext'
import QuantityStepper from '../../components/ui/QuantityStepper'
import VariantSelector from '../../components/store/VariantSelector'
import { defaultSelection, findVariant, VARIANT_DIMENSIONS } from '../../shared/variants'

function CoffeeDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('store')
  const { user } = useAuthContext()
  const { coffee, loading, error } = useCoffeeDetail(slug)
  const { addToCart, refetchCart } = useCart()
  const { shippingCost } = useShippingCost()
  const [searchParams, setSearchParams] = useSearchParams()

  // Selección elegida por el usuario. Mientras sea null se usa la inicial,
  // que se DERIVA en vez de setearse en un efecto (evita un render de más).
  const [elegida, setElegida] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [agregando, setAgregando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState(false)
  const [errorCarrito, setErrorCarrito] = useState('')

  const variantParam = searchParams.get('variant')

  // Inicial: la variante de ?variant si existe, si no la más barata.
  // Así la card dice "desde ₡2.600" y al entrar se ve ₡2.600.
  const inicial = useMemo(() => {
    if (!coffee) return null

    const pedida = coffee.variants.find((v) => v.id === Number(variantParam))
    if (pedida) {
      return Object.fromEntries(VARIANT_DIMENSIONS.map((d) => [d, pedida[d]]))
    }

    return defaultSelection(coffee.variants)
  }, [coffee, variantParam])

  const selection = elegida ?? inicial
  const actual = coffee && selection ? findVariant(coffee.variants, selection) : null

  // La URL refleja siempre lo que está en pantalla, así se puede compartir.
  useEffect(() => {
    if (!actual) return
    if (Number(variantParam) === actual.id) return

    setSearchParams({ variant: String(actual.id) }, { replace: true })
  }, [actual, variantParam, setSearchParams])

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/cafe/${slug}` } })
      return
    }
    if (!actual) return

    setAgregando(true)
    const resultado = await addToCart(actual.id, cantidad)
    setAgregando(false)

    if (!resultado.ok) {
      setErrorCarrito(t(`pack.errors.${resultado.code}`, { defaultValue: t('pack.errors.generic') }))
      return
    }

    setErrorCarrito('')
    await refetchCart()
    setMensajeExito(true)
    setCantidad(1)
    setTimeout(() => setMensajeExito(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-20 flex items-center justify-center">
        <p className="text-gray-500 text-lg">{t('detail.loadingProduct')}</p>
      </div>
    )
  }

  if (error || !coffee) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-20 flex items-center justify-center flex-col gap-4">
        <p className="text-red-500 text-lg">{t('detail.notFound')}</p>
        <button
          onClick={() => navigate('/tienda')}
          className="bg-coffee hover:bg-dark-coffee text-white font-semibold py-2 px-6 rounded transition-colors"
        >
          {t('detail.backToStore')}
        </button>
      </div>
    )
  }

  // La descripción de la BD reemplaza a la plantilla i18n genérica.
  const descripcion =
    (i18n.language === 'en' && coffee.descriptionEn) ||
    coffee.description ||
    t('detail.description', { name: coffee.name.toLowerCase(), line: t(`categories.${coffee.category}`) })

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
              src={getProductImage(coffee)}
              alt={coffee.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-gray-500 text-sm font-semibold tracking-wider uppercase">
              {t(`categories.${coffee.category}`)}
            </p>

            <h1 className="text-4xl md:text-5xl font-bold text-dark-coffee">{coffee.name}</h1>

            <div className="flex items-center gap-4">
              <div className="flex gap-1 text-2xl">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600">(5 {t('detail.reviews')})</p>
            </div>

            <div className="border-t border-b py-6">
              <p className="text-sm text-gray-600 mb-2">{t('detail.price')}</p>
              <p className="text-4xl font-bold text-coffee">
                {actual ? `₡${actual.price.toLocaleString('es-CR')}` : t('variant.unavailable')}
              </p>
            </div>

            <div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{descripcion}</p>
            </div>

            {/* Selector de presentación */}
            {selection && (
              <VariantSelector
                variants={coffee.variants}
                selection={selection}
                onChange={setElegida}
              />
            )}

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">{t('detail.quantity')}</span>
                <QuantityStepper
                  value={cantidad}
                  onChange={setCantidad}
                  min={1}
                  decreaseLabel={t('detail.decreaseQuantity')}
                  increaseLabel={t('detail.increaseQuantity')}
                />
              </div>

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

              <button
                onClick={handleAddToCart}
                disabled={agregando || !actual}
                className="w-full bg-coffee hover:bg-dark-coffee disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded text-lg transition-colors duration-300"
              >
                {agregando ? t('detail.adding') : !actual ? t('variant.unavailable') : t('detail.addToCart')}
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mt-6 space-y-3 text-sm text-gray-700">
              <div className="flex gap-3">
                <span></span>
                <p>
                  <strong>{t('detail.shipping')}</strong>{' '}
                  {t('detail.shippingDesc', { cost: `₡${shippingCost.toLocaleString('es-CR')}` })}
                </p>
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
    </div>
  )
}

export default CoffeeDetail
