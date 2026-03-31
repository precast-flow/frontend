import { useId, useMemo, useState } from 'react'
import { Factory, Pencil, Plus, Trash2 } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import { useI18n } from '../../i18n/I18nProvider'
import type { MockFactory } from '../../data/mockFactories'

const field =
  'mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

function emptyDraft(): Omit<MockFactory, 'code'> & { code: string } {
  return {
    code: '',
    name: '',
    city: '',
    active: true,
    address: '',
    shiftCount: 2,
    siteManager: '',
  }
}

function normalizeCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '')
}

export function SettingsFactoriesPanel() {
  const { t } = useI18n()
  const baseId = useId()
  const { factories, addFactory, updateFactory, removeFactory, selectedCode, setSelectedCode } = useFactoryContext()
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [draft, setDraft] = useState(() => emptyDraft())
  const [isCreating, setIsCreating] = useState(false)

  const editingFactory = useMemo(
    () => (editingCode ? factories.find((f) => f.code === editingCode) : null),
    [editingCode, factories],
  )

  const startCreate = () => {
    setIsCreating(true)
    setEditingCode(null)
    setDraft(emptyDraft())
  }

  const startEdit = (f: MockFactory) => {
    setIsCreating(false)
    setEditingCode(f.code)
    setDraft({ ...f })
  }

  const cancelForm = () => {
    setIsCreating(false)
    setEditingCode(null)
    setDraft(emptyDraft())
  }

  const save = () => {
    const code = isCreating ? normalizeCode(draft.code) : editingCode ?? ''
    if (!code) {
      window.alert(t('factories.codeRequired'))
      return
    }
    if (!draft.name.trim()) {
      window.alert(t('factories.nameRequired'))
      return
    }
    const payload: MockFactory = {
      code,
      name: draft.name.trim(),
      city: draft.city.trim() || '—',
      active: draft.active,
      address: draft.address.trim() || '—',
      shiftCount: Math.max(1, Math.min(4, Number(draft.shiftCount) || 1)),
      siteManager: draft.siteManager.trim() || '—',
    }
    if (isCreating) {
      if (factories.some((f) => f.code === code)) {
        window.alert(t('factories.duplicateCode'))
        return
      }
      addFactory(payload)
      setSelectedCode(code)
    } else if (editingCode) {
      updateFactory(editingCode, {
        name: payload.name,
        city: payload.city,
        active: payload.active,
        address: payload.address,
        shiftCount: payload.shiftCount,
        siteManager: payload.siteManager,
      })
    }
    cancelForm()
  }

  const remove = (code: string) => {
    if (factories.length <= 1) {
      window.alert(t('factories.deleteLast'))
      return
    }
    const f = factories.find((x) => x.code === code)
    if (!f) return
    const ok = window.confirm(t('factories.deleteConfirm', { name: f.name, code: f.code }))
    if (!ok) return
    removeFactory(code)
    if (selectedCode === code) {
      const next = factories.find((x) => x.code !== code)?.code
      if (next) setSelectedCode(next)
    }
    if (editingCode === code) cancelForm()
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('factories.title')}</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('factories.intro')}</p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
          >
            <Plus className="size-4" strokeWidth={1.75} aria-hidden />
            {t('factories.new')}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200/90 bg-gray-100/80 text-xs uppercase tracking-wide text-gray-600 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-400">
                <th className="px-3 py-2.5 font-semibold">{t('factories.col.code')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('factories.col.name')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('factories.col.city')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('factories.col.status')}</th>
                <th className="px-3 py-2.5 text-right font-semibold">{t('factories.col.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {factories.map((f) => (
                <tr
                  key={f.code}
                  className={[
                    'border-b border-gray-200/70 last:border-0 dark:border-gray-700/70',
                    f.code === selectedCode ? 'bg-amber-50/80 dark:bg-amber-950/30' : 'odd:bg-white/40 even:bg-gray-50/50 dark:odd:bg-gray-950/30 dark:even:bg-gray-900/40',
                  ].join(' ')}
                >
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gray-900 dark:text-gray-50">
                    {f.code}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-50">{f.name}</td>
                  <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{f.city}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {f.active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-100">
                        {t('factories.active')}
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 font-semibold text-gray-700 dark:text-gray-300">
                        {t('factories.inactive')}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(f)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        <Pencil className="size-3.5" aria-hidden />
                        {t('factories.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(f.code)}
                        disabled={factories.length <= 1}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-300 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                        {t('factories.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(isCreating || editingFactory) && (
        <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
          <div className="flex items-center gap-2">
            <Factory className="size-5 text-gray-600 dark:text-gray-400" strokeWidth={1.75} aria-hidden />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              {isCreating ? t('factories.formNew') : t('factories.formEditWithCode', { code: editingFactory?.code ?? '' })}
            </h3>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={isCreating ? 'block sm:col-span-2' : 'hidden'}>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {t('factories.code')}
              </span>
              <input
                id={`${baseId}-code`}
                value={draft.code}
                onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
                placeholder={t('factories.codePh')}
                className={field}
                autoComplete="off"
              />
              <span className="mt-1 block text-[11px] text-gray-500 dark:text-gray-400">{t('factories.codeHint')}</span>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {t('factories.name')}
              </span>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className={field}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {t('factories.city')}
              </span>
              <input
                value={draft.city}
                onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                className={field}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {t('factories.shifts')}
              </span>
              <input
                type="number"
                min={1}
                max={4}
                value={draft.shiftCount}
                onChange={(e) => setDraft((d) => ({ ...d, shiftCount: Number(e.target.value) }))}
                className={field}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {t('factories.address')}
              </span>
              <textarea
                rows={2}
                value={draft.address}
                onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                className={`${field} resize-y`}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {t('factories.manager')}
              </span>
              <input
                value={draft.siteManager}
                onChange={(e) => setDraft((d) => ({ ...d, siteManager: e.target.value }))}
                className={field}
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                className="size-4 rounded border-gray-300 accent-gray-800 dark:accent-gray-200"
                checked={draft.active}
                onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
              />
              <span className="text-sm text-gray-800 dark:text-gray-100">{t('factories.activeCheck')}</span>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
            >
              {isCreating ? t('factories.save') : t('factories.update')}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:hover:text-white"
            >
              {t('factories.cancel')}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
