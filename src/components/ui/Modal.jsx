import { useEffect } from 'react'

// Modal genérico. No existía ninguno en el proyecto: el único parecido estaba
// suelto dentro de AdminProducts. Sigue ese mismo estilo visual.
function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-lg' }) {
  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  // Evitar que la página de atrás haga scroll mientras el modal está abierto
  useEffect(() => {
    if (!isOpen) return

    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = anterior }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-700 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-100">{footer}</div>
        )}
      </div>
    </div>
  )
}

export default Modal
