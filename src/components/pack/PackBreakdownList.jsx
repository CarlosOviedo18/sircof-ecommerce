import { useTranslation } from 'react-i18next'

// Muestra "3 × Tueste Medio · Grano" por cada combinación elegida.
// Usado por el carrito, el resumen del pedido y el historial.
function PackBreakdownList({ selections, className = '' }) {
  const { t } = useTranslation('store')

  if (!selections?.length) return null

  return (
    <ul className={`text-xs text-gray-500 space-y-0.5 ${className}`}>
      {selections.map((sel) => (
        <li key={`${sel.roast}-${sel.grind}`}>
          {sel.quantity} × {t(`roast.${sel.roast}`)} · {t(`grind.${sel.grind}`)}
        </li>
      ))}
    </ul>
  )
}

export default PackBreakdownList
