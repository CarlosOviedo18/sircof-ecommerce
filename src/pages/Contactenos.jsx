import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContactForm } from '../hooks/useContactForm'

function Contactenos() {
  const { sendMessage, loading: isSubmitting } = useContactForm()

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  })

  const [submitted, setSubmitted] = useState(false)
  const [paperFly, setPaperFly] = useState(false)
  const [formError, setFormError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Limpiar errores previos
    setFormError(null)

    // Validar campos requeridos
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      setFormError('Por favor completa los campos requeridos')
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFormError('Por favor ingresa un email válido')
      return
    }

    // Animación de envío
    setPaperFly(true)

    // Enviar mensaje al backend
    const result = await sendMessage(formData)

    if (result.success) {
      // Mostrar pantalla de éxito
      setSubmitted(true)
      
      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        setFormData({
          nombre: '',
          email: '',
          asunto: '',
          mensaje: ''
        })
        setSubmitted(false)
        setPaperFly(false)
      }, 3000)
    } else {
      // Mostrar error
      setFormError(result.message || 'Error al enviar el mensaje')
      setPaperFly(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 px-4 sm:px-6">
      {/* Header */}
      <motion.div 
        className="max-w-2xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Ponte en Contacto
        </h1>
        <p className="text-lg text-gray-600">
          Nos encantaría escucharte. Completa el formulario y nos pondremos en contacto pronto.
        </p>
      </motion.div>

      {/* Contenedor principal */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Formulario */}
          {!submitted && (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mostrar error si existe */}
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                  >
                    {formError}
                  </motion.div>
                )}
                {/* Campo: Nombre */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="nombre" className="block text-sm font-semibold text-gray-900 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-700 transition-colors text-gray-900 placeholder:text-gray-400"
                  />
                </motion.div>

                {/* Campo: Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-700 transition-colors text-gray-900 placeholder:text-gray-400"
                  />
                </motion.div>

                {/* Campo: Asunto (opcional) */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="asunto" className="block text-sm font-semibold text-gray-900 mb-2">
                    Asunto <span className="text-gray-400 text-xs">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    placeholder="¿De qué se trata?"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-700 transition-colors text-gray-900 placeholder:text-gray-400"
                  />
                </motion.div>

                {/* Campo: Mensaje */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-900 mb-2">
                    Mensaje <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder="Cuéntanos lo que tengas en mente..."
                    rows="6"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-700 transition-colors text-gray-900 placeholder:text-gray-400 resize-none"
                  />
                </motion.div>

                {/* Botón de envío con animación */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative"
                >
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-amber-900 hover:bg-amber-950 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    <motion.span
                      initial={{ opacity: 1 }}
                      animate={{ opacity: isSubmitting ? 0 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                    </motion.span>

                    {/* Animación del papel volando */}
                    <AnimatePresence>
                      {paperFly && (
                        <>
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-2 h-2 bg-white rounded-full"
                              initial={{
                                x: 0,
                                y: 0,
                                opacity: 1,
                                scale: 1
                              }}
                              animate={{
                                x: Math.random() * 200 - 100,
                                y: -300,
                                opacity: 0,
                                scale: 0
                              }}
                              transition={{
                                duration: 1.5,
                                ease: 'easeOut',
                                delay: i * 0.1
                              }}
                            />
                          ))}
                        </>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>

                {/* Info de campos requeridos */}
                <p className="text-xs text-gray-500 text-center">
                  Los campos marcados con <span className="text-red-500">*</span> son obligatorios
                </p>
              </form>
            </motion.div>
          )}

          {/* Mensaje de éxito */}
          {submitted && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="text-center"
            >
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center mb-4"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">✓</span>
                  </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Mensaje Enviado
                </h2>

                <p className="text-gray-600 mb-2">
                  Gracias por tu mensaje. Nos pondremos en contacto pronto.
                </p>

                <p className="text-sm text-gray-500">
                  Redirigiendo al formulario...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Contactenos
