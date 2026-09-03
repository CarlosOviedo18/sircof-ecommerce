// Selector de cantidad + / −.
// Extraído de ProductDetail y CartItem, que tenían dos copias del mismo JSX.
// Tercer uso: las 4 filas del armador del pack.
function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  size = 'md',
  decreaseLabel = 'Disminuir cantidad',
  increaseLabel = 'Aumentar cantidad',
}) {
  const puedeBajar = !disabled && value > min
  const puedeSubir = !disabled && (max === undefined || value < max)

  const estilos = {
    sm: { caja: 'gap-2 px-2 py-1', boton: 'text-gray-600 hover:text-coffee', valor: 'w-6' },
    md: { caja: 'gap-3 px-3 py-2', boton: 'text-coffee hover:text-dark-coffee text-lg', valor: 'w-8' },
  }[size]

  return (
    <div className={`flex items-center border rounded-lg ${estilos.caja}`}>
      <button
        type="button"
        onClick={() => puedeBajar && onChange(value - 1)}
        disabled={!puedeBajar}
        aria-label={decreaseLabel}
        className={`font-bold transition-colors disabled:text-gray-300 disabled:cursor-not-allowed ${estilos.boton}`}
      >
        −
      </button>

      <span className={`${estilos.valor} text-center font-semibold`}>{value}</span>

      <button
        type="button"
        onClick={() => puedeSubir && onChange(value + 1)}
        disabled={!puedeSubir}
        aria-label={increaseLabel}
        className={`font-bold transition-colors disabled:text-gray-300 disabled:cursor-not-allowed ${estilos.boton}`}
      >
        +
      </button>
    </div>
  )
}

export default QuantityStepper
