import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

function SearchBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const navigate = useNavigate()
  const inputRef = useRef(null)

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Enfocar input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/tienda?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsOpen(false)
    }
  }

  const handleSuggestionClick = (term) => {
    navigate(`/tienda?search=${encodeURIComponent(term)}`)
    setSearchQuery('')
    setIsOpen(false)
  }



  // Variantes de animación para mobile (fullscreen)
  const mobileOverlayVariants = {
    hidden: {
      opacity: 0,
      y: '100%'
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      y: '100%',
      transition: { duration: 0.3 }
    }
  }

  // Variantes para desktop panel
  const desktopPanelVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      originX: 1,
      originY: 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: { duration: 0.2 }
    }
  }

  // Para mobile
  if (isMobile) {
    return (
      <>
        {/* Botón de lupa mobile */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-amber-300 transition-colors"
          aria-label="Buscar"
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: isOpen ? 1.1 : 1
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={28}
            height={28}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
            <path d="M21 21l-6 -6" />
          </svg>
        </motion.button>

        {/* Overlay fullscreen mobile */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={mobileOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 bg-gradient-to-b from-amber-900 to-amber-950 flex flex-col items-center justify-start pt-8 px-4"
            >
              {/* Botón cerrar */}
              <motion.button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-white hover:text-amber-300 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={32}
                  height={32}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Título */}
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-white mb-6 mt-4"
              >
                Buscar Café
              </motion.h2>

              {/* Input */}
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-sm flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="¿Qué café buscas?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-gray-900 placeholder:text-gray-500 font-medium"
                />
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-amber-300 text-amber-900 rounded-lg hover:bg-yellow-300 font-bold transition-colors"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                    <path d="M21 21l-6 -6" />
                  </svg>
                </motion.button>
              </motion.form>

              {/* Sugerencias */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-sm mt-8"
              >
                <p className="text-amber-100 text-sm font-semibold mb-4">Populares:</p>
                <div className="flex flex-wrap gap-2">
                  {['Espresso', 'Cappuccino', 'Premium', 'Nacional'].map((term, idx) => (
                    <motion.button
                      key={term}
                      onClick={() => handleSuggestionClick(term)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.05 }}
                      className="px-4 py-2 bg-amber-800 text-amber-100 rounded-full hover:bg-amber-700 transition-colors font-medium text-sm"
                      whileTap={{ scale: 0.95 }}
                    >
                      {term}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Para desktop
  return (
    <div className="relative">
      {/* Botón de lupa desktop */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-amber-300 transition-colors"
        aria-label="Buscar"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          rotateZ: isOpen ? 360 : 0
        }}
        transition={{
          duration: 0.6,
          type: 'spring',
          stiffness: 200,
          damping: 15
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
          <path d="M21 21l-6 -6" />
        </svg>
      </motion.button>

      {/* Panel de búsqueda desktop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Panel */}
            <motion.div
              variants={desktopPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl p-6 z-50 border-2 border-amber-100"
            >
              {/* Header del panel */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4"
              >
                <h3 className="text-lg font-bold text-gray-900">Buscar Café</h3>
                <p className="text-sm text-gray-500">Encuentra tu café favorito</p>
              </motion.div>

              {/* Input */}
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex gap-2 mb-5"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Escribe aquí..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-700 transition-colors text-gray-900 placeholder:text-gray-400 font-medium"
                />
                <motion.button
                  type="submit"
                  className="px-5 py-3 bg-amber-900 text-white rounded-lg hover:bg-amber-950 transition-colors font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                    <path d="M21 21l-6 -6" />
                  </svg>
                </motion.button>
              </motion.form>

              {/* Separador */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mb-4"
              />

              {/* Sugerencias */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <p className="text-sm font-bold text-gray-700 mb-3">Búsquedas Populares:</p>
                <div className="flex flex-wrap gap-2">
                  {['Espresso', 'Cappuccino', 'Premium', 'Nacional'].map((term, idx) => (
                    <motion.button
                      key={term}
                      onClick={() => handleSuggestionClick(term)}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-amber-50 to-amber-100 text-amber-900 rounded-full hover:from-amber-700 hover:to-amber-800 hover:text-white transition-all font-semibold border border-amber-200"
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {term}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Pie del panel */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs text-gray-400 mt-4 text-center"
              >
                Presiona Enter para buscar
              </motion.p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBox
