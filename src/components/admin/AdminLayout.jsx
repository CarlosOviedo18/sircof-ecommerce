import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/webp/logo.webp'

/**
 * Layout principal del panel de administración.
 * Incluye sidebar de navegación, barra superior y área de contenido.
 * Diseño inspirado en Tabler, construido 100% con Tailwind CSS.
 */
function AdminLayout() {
  const { user } = useAuthContext()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768)
  const navigate = useNavigate()

  const links = [
    { to: '/admin', label: 'Dashboard', end: true, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h6v8H4z"/><path d="M4 16h6v4H4z"/><path d="M14 12h6v8h-6z"/><path d="M14 4h6v4h-6z"/></svg>
    )},
    { to: '/admin/products', label: 'Productos', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
    )},
    { to: '/admin/orders', label: 'Órdenes', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    )},
    { to: '/admin/users', label: 'Usuarios', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
    )},
    { to: '/admin/contacts', label: 'Contactos', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    )},
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Backdrop móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`bg-[#1b2a4a] text-white flex flex-col fixed h-full transition-all duration-300 z-30 w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-[72px]'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/10 gap-3">
          <img src={logo} alt="SIRCOF" className="w-10 h-10 rounded-lg object-contain flex-shrink-0" />
          {sidebarOpen && (
            <span className="text-lg font-bold tracking-wide"> CAFE SIRCOF</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarOpen && (
            <div className="px-5 mb-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Navegación</p>
            </div>
          )}
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false) }}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-amber-600/20 text-amber-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }
                ${!sidebarOpen ? 'justify-center' : ''}`
              }
              title={!sidebarOpen ? link.label : undefined}
            >
              <span className="flex-shrink-0">{link.icon}</span>
              {sidebarOpen && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="border-t border-white/10 p-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-full bg-amber-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className={`flex-1 ml-0 ${sidebarOpen ? 'md:ml-64' : 'md:ml-[72px]'} transition-all duration-300`}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <NavLink
              to="/"
              className="text-sm text-gray-500 hover:text-amber-600 transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              <span className="hidden sm:inline">Ver tienda</span>
            </NavLink>
            <div className="h-5 w-px bg-gray-200"></div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
