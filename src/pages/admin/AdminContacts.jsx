import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'

function AdminContacts() {
  const { getContacts, deleteContact, loading } = useAdmin()
  const [contacts, setContacts] = useState([])
  const [expandedContact, setExpandedContact] = useState(null)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  const loadContacts = async () => {
    try {
      const data = await getContacts()
      setContacts(data.contacts)
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este mensaje de contacto?')) return
    try {
      await deleteContact(id)
      setFeedback({ type: 'success', message: 'Mensaje eliminado exitosamente' })
      if (expandedContact === id) setExpandedContact(null)
      loadContacts()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  const toggleExpand = (id) => {
    setExpandedContact(expandedContact === id ? null : id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mensajes de contacto</h1>
        <p className="text-sm text-gray-500 mt-1">{contacts.length} mensaje{contacts.length !== 1 ? 's' : ''} recibido{contacts.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Contacts list */}
      {contacts.length > 0 ? (
        <div className="space-y-3">
          {contacts.map(contact => (
            <div key={contact.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Contact header row */}
              <div
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(contact.id)}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                    {contact.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                      {contact.subject && (
                        <span className="text-xs text-gray-400">— {contact.subject}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{contact.email}</p>
                  </div>

                  <div className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                    {new Date(contact.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>

                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-gray-400 transition-transform flex-shrink-0 ${expandedContact === contact.id ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              {/* Expanded message */}
              {expandedContact === contact.id && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <div className="pt-4 space-y-3">
                    {contact.subject && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Asunto</p>
                        <p className="text-sm text-gray-700">{contact.subject}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mensaje</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{contact.message}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <a
                        href={`mailto:${contact.email}?subject=Re: ${contact.subject || 'Mensaje de contacto'}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        Responder por email
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(contact.id)
                        }}
                        disabled={loading}
                        className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 text-gray-300"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <p className="text-gray-400 text-sm">No hay mensajes de contacto</p>
        </div>
      )}
    </div>
  )
}

export default AdminContacts
