import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdmin } from '../../hooks/admin/useAdmin'
import { useAuthContext } from '../../context/AuthContext'

function AdminUsers() {
  const { t, i18n } = useTranslation('admin')
  const { getUsers, updateUserRole, deleteUser, loading } = useAdmin()
  const { user: currentUser } = useAuthContext()
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data.users)
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  const handleRoleChange = async (userId, newRole, userName) => {
    if (!window.confirm(t('users.confirmRoleChange', { name: userName, role: newRole }))) return
    try {
      await updateUserRole(userId, newRole)
      setFeedback({ type: 'success', message: t('users.roleUpdated', { name: userName, role: newRole }) })
      loadUsers()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(t('users.confirmDelete', { name: userName }))) return
    try {
      await deleteUser(userId)
      setFeedback({ type: 'success', message: t('users.deleted', { name: userName }) })
      loadUsers()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || u.role === filterRole
    return matchesSearch && matchesRole
  })

  const roleCounts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    user: users.filter(u => u.role === 'user').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('users.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{users.length} {t('users.count')}</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: t('users.allTab') },
          { key: 'admin', label: t('users.adminsTab') },
          { key: 'user', label: t('users.usersTab') },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterRole(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterRole === tab.key
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              filterRole === tab.key ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {roleCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Search */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <input
            type="text"
            placeholder={t('users.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Vista móvil - Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredUsers.map(user => {
            const isCurrentUser = user.id === currentUser?.id
            return (
              <div key={user.id} className={`p-4 space-y-3 ${isCurrentUser ? 'bg-amber-50/50' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                    user.role === 'admin' ? 'bg-purple-600' : 'bg-gray-400'
                  }`}>
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                      {isCurrentUser && <span className="ml-2 text-xs text-amber-600 font-normal">{t('users.you')}</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-400 font-mono flex-shrink-0">#{user.id}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'admin' ? t('users.admin') : t('users.user')}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(user.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {isCurrentUser ? (
                  <p className="text-xs text-gray-400 italic">{t('users.currentAccount')}</p>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value, user.name)}
                      disabled={loading}
                      className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 flex-1"
                    >
                      <option value="user">{t('users.user')}</option>
                      <option value="admin">{t('users.adminShort')}</option>
                    </select>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      {t('users.delete')}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">{t('users.noUsers')}</p>
            </div>
          )}
        </div>

        {/* Tabla - Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{t('users.tableId')}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{t('users.tableUser')}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{t('users.tableRole')}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{t('users.tableRegistered')}</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{t('users.tableActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map(user => {
                const isCurrentUser = user.id === currentUser?.id
                return (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${isCurrentUser ? 'bg-amber-50/50' : ''}`}>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">#{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                          user.role === 'admin' ? 'bg-purple-600' : 'bg-gray-400'
                        }`}>
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-amber-600 font-normal">{t('users.you')}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? t('users.admin') : t('users.user')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isCurrentUser ? (
                        <span className="text-xs text-gray-400 italic">{t('users.currentAccount')}</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value, user.name)}
                            disabled={loading}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                          >
                            <option value="user">{t('users.user')}</option>
                            <option value="admin">{t('users.adminShort')}</option>
                          </select>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors px-2 py-1.5 rounded hover:bg-red-50 disabled:opacity-50"
                          >
                            {t('users.delete')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 text-gray-300"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <p className="text-sm">{t('users.noUsers')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
