import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' }
]

function LanguageSelector() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = languages.find((l) => l.code === i18n.language) || languages[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const changeLanguage = (code) => {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative inline-block">
      {/* Botón principal */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-200"
        aria-label="Cambiar idioma"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6l6 -6" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl bg-neutral-900/95 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                lang.code === current.code
                  ? 'bg-coffee/20 text-coffee'
                  : 'text-gray-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
              {lang.code === current.code && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-auto text-coffee"
                >
                  <path d="M5 12l5 5l10 -10" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
