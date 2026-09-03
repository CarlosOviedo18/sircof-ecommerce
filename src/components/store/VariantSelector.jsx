import { useTranslation } from 'react-i18next'
import {
  VARIANT_DIMENSIONS,
  availableOptions,
  hasDimension,
  isOptionEnabled,
  resolveSelection,
} from '../../shared/variants'

const ETIQUETA_DIMENSION = {
  size_g: 'variant.sizeLabel',
  roast: 'variant.roastLabel',
  grind: 'variant.grindLabel',
}

// Cómo se lee el valor de cada dimensión
const textoOpcion = (dim, valor, t) => {
  if (dim === 'size_g') return t('variant.size', { grams: valor })
  if (dim === 'roast') return t(`roast.${valor}`)
  return t(`grind.${valor}`)
}

/**
 * Selector de presentación: una fila por dimensión en la que el café varía.
 *
 * Las dimensiones van en orden de RESTRICCIÓN (tamaño → tueste → molienda):
 * cada fila está condicionada por las de arriba, y elegir algo repara
 * automáticamente las de abajo.
 */
function VariantSelector({ variants, selection, onChange }) {
  const { t } = useTranslation('store')
  const opciones = availableOptions(variants)

  // Solo se muestran las dimensiones en las que el café realmente varía:
  // el Café Nacional solo existe molido, así que no dibuja un "Grano" muerto.
  const dimensiones = VARIANT_DIMENSIONS.filter((d) => hasDimension(variants, d))

  if (dimensiones.length === 0) return null

  return (
    <div className="space-y-4">
      {dimensiones.map((dim) => (
        <div key={dim}>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {t(ETIQUETA_DIMENSION[dim])}
          </p>

          <div role="radiogroup" aria-label={t(ETIQUETA_DIMENSION[dim])} className="flex flex-wrap gap-2">
            {opciones[dim].map((valor) => {
              const activa = selection[dim] === valor
              const habilitada = isOptionEnabled(variants, selection, dim, valor)

              return (
                <button
                  key={String(valor)}
                  type="button"
                  role="radio"
                  aria-checked={activa}
                  aria-disabled={!habilitada}
                  disabled={!habilitada}
                  title={habilitada ? undefined : t('variant.unavailable')}
                  onClick={() => onChange(resolveSelection(variants, selection, dim, valor))}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                    ${activa
                      ? 'border-coffee bg-coffee/5 text-dark-coffee'
                      : habilitada
                        ? 'border-gray-200 hover:border-gray-300 text-gray-700'
                        : 'border-gray-100 text-gray-300 line-through cursor-not-allowed'}`}
                >
                  {textoOpcion(dim, valor, t)}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default VariantSelector
