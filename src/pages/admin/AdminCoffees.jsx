import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdmin } from '../../hooks/admin/useAdmin'
import { CATEGORIES } from '../../shared/variants'

const EMPTY_FORM = {
  name: '',
  slug: '',
  category: '',
  description: '',
  description_en: '',
  image_url: '',
  sort_order: 0,
  active: 1,
}

function AdminCoffees() {
  const { t } = useTranslation('admin')
  const { getCoffees, createCoffee, updateCoffee, deleteCoffee, loading } = useAdmin()
  const [coffees, setCoffees] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [feedback, setFeedback] = useState(null)

  const load = async () => {
    try {
      const data = await getCoffees()
      setCoffees(data.coffees || [])
    } catch (e) {
      setFeedback({ type: 'error', message: e.message })
    }
  }

  useEffect(() => {
    load()
    // load() se define arriba a propósito: si va después, se referencia
    // antes de declararse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  const abrirNuevo = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const abrirEditar = (c) => {
    setEditing(c)
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      category: c.category || '',
      description: c.description || '',
      description_en: c.description_en || '',
      image_url: c.image_url || '',
      sort_order: c.sort_order ?? 0,
      active: c.active ?? 1,
    })
    setShowModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    try {
      if (editing) await updateCoffee(editing.id, form)
      else await createCoffee(form)

      setShowModal(false)
      setFeedback({ type: 'success', message: t('coffees.saved') })
      await load()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  const borrar = async (c) => {
    if (!window.confirm(t('coffees.confirmDelete', { name: c.name }))) return
    try {
      await deleteCoffee(c.id)
      setFeedback({ type: 'success', message: t('coffees.deleted') })
      await load()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('coffees.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('coffees.subtitle')}</p>
        </div>
        <button
          onClick={abrirNuevo}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {t('coffees.newCoffee')}
        </button>
      </div>

      {feedback && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          feedback.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">{t('coffees.tableName')}</th>
              <th className="px-6 py-3">{t('coffees.tableCategory')}</th>
              <th className="px-6 py-3 text-center">{t('coffees.tableVariants')}</th>
              <th className="px-6 py-3 text-right">{t('coffees.tableActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coffees.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400">/cafe/{c.slug}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                    {c.category}
                  </span>
                  {!c.active && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      {t('coffees.archived')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">{c.variant_count}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => abrirEditar(c)} className="text-amber-600 hover:text-amber-800 text-sm font-medium">
                    {t('coffees.edit')}
                  </button>
                  <button onClick={() => borrar(c)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                    {t('coffees.delete')}
                  </button>
                </td>
              </tr>
            ))}
            {coffees.length === 0 && !loading && (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">{t('coffees.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <form
            onSubmit={guardar}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? t('coffees.editTitle') : t('coffees.createTitle')}
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('coffees.name')} *</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('coffees.slug')}</label>
                <input
                  type="text" value={form.slug} placeholder={t('coffees.slugPlaceholder')}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">{t('coffees.slugHint')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('coffees.category')} *</label>
                <select
                  required value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">{t('coffees.selectCategory')}</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{t(`coffees.category_${cat}`)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('coffees.description')}</label>
                <textarea
                  rows={4} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">{t('coffees.descriptionHint')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('coffees.descriptionEn')}</label>
                <textarea
                  rows={3} value={form.description_en}
                  onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('coffees.imageUrl')}</label>
                  <input
                    type="text" value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('coffees.sortOrder')}</label>
                  <input
                    type="number" value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {editing && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox" checked={form.active === 1 || form.active === true}
                    onChange={(e) => setForm({ ...form, active: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4"
                  />
                  {t('coffees.activeLabel')}
                </label>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                {t('coffees.cancel')}
              </button>
              <button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-semibold px-4 py-2 rounded-lg text-sm">
                {t('coffees.save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminCoffees
