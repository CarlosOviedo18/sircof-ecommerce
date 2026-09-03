import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../ui/Modal'
import QuantityStepper from '../ui/QuantityStepper'
import { PACK_SIZE, PACK_COMBINATIONS, comboKey, parseComboKey } from '../../shared/pack'

// Estado inicial: 0 en las 4 combinaciones
const seleccionVacia = () =>
  Object.fromEntries(PACK_COMBINATIONS.map((c) => [comboKey(c.roast, c.grind), 0]))

function PackPickerModal({ isOpen, onClose, onConfirm, precio, adding = false, error = '' }) {
  const { t } = useTranslation('store')
  const [seleccion, setSeleccion] = useState(seleccionVacia)

  // Empezar de cero cada vez que se abre
  useEffect(() => {
    if (isOpen) setSeleccion(seleccionVacia())
  }, [isOpen])

  const total = Object.values(seleccion).reduce((a, b) => a + b, 0)
  const restantes = PACK_SIZE - total
  const completo = total === PACK_SIZE

  const handleConfirm = () => {
    // Solo las combinaciones con cantidad > 0, en el formato que espera el backend
    const selections = Object.entries(seleccion)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([key, cantidad]) => ({ ...parseComboKey(key), quantity: cantidad }))

    onConfirm(selections)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('pack.modalTitle')}
      footer={
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!completo || adding}
            className="w-full bg-coffee hover:bg-dark-coffee disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
          >
            {adding
              ? t('pack.adding')
              : `${t('pack.add')} — ₡${precio.toLocaleString('es-CR')}`}
          </button>

          {/* Nunca dejar el botón muerto sin explicar por qué */}
          {!completo && (
            <p className="text-center text-xs text-gray-500">
              {restantes > 0
                ? t('pack.remaining', { count: restantes })
                : t('pack.needExactly', { size: PACK_SIZE })}
            </p>
          )}

          {error && (
            <p className="text-center text-xs text-red-600">{error}</p>
          )}
        </div>
      }
    >
      {/* Datos fijos del pack, no se eligen */}
      <div className="bg-gray-50 rounded-lg p-4 mb-5 space-y-1 text-sm">
        <p className="font-semibold text-gray-800">{t('pack.line')}</p>
        <p className="text-gray-600">{t('pack.shippingIncluded')}</p>
        <p className="text-gray-600">{t('pack.notForCR')}</p>
      </div>

      <p className="text-sm text-gray-600 mb-4">{t('pack.modalSubtitle', { size: PACK_SIZE })}</p>

      <div className="space-y-3">
        {PACK_COMBINATIONS.map(({ roast, grind }) => {
          const key = comboKey(roast, grind)
          const valor = seleccion[key]

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-700">
                {t(`roast.${roast}`)} · {t(`grind.${grind}`)}
              </span>

              <QuantityStepper
                value={valor}
                min={0}
                // El + se bloquea solo al llegar a 9: la suma nunca puede pasarse.
                max={valor + restantes}
                onChange={(nuevo) => setSeleccion((prev) => ({ ...prev, [key]: nuevo }))}
                size="sm"
                decreaseLabel={t('detail.decreaseQuantity')}
                increaseLabel={t('detail.increaseQuantity')}
              />
            </div>
          )
        })}
      </div>

      {/* Contador */}
      <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">
          {t('pack.counter', { selected: total, size: PACK_SIZE })}
        </span>
        <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${completo ? 'bg-green-500' : 'bg-coffee'}`}
            style={{ width: `${(total / PACK_SIZE) * 100}%` }}
          />
        </div>
      </div>
    </Modal>
  )
}

export default PackPickerModal
