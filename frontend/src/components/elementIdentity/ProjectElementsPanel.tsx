import { useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { ELEMENT_TYPES_BY_ID } from '../../elementIdentity/catalog/elementTypes'
import { TYPOLOGIES_BY_ID } from '../../elementIdentity/catalog/typologies'
import { resolveInstanceMark } from '../../elementIdentity/firm/nameResolver'
import { useElementIdentity } from './elementIdentityContextValue'

export function ProjectElementsPanel() {
  const { t, locale } = useI18n()
  const {
    projectElements,
    activeProject,
    activeFirm,
    activeTemplate,
    overrides,
    clearProjectElements,
    removeProjectElement,
  } = useElementIdentity()

  const [elementTypeFilter, setElementTypeFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const projectOnly = useMemo(
    () => projectElements.filter((e) => e.projectId === activeProject.id),
    [projectElements, activeProject.id],
  )

  // Re-resolve instance marks live (so template changes reflect)
  const resolvedRows = useMemo(
    () =>
      projectOnly.map((el) => {
        const { instanceMark } = resolveInstanceMark({
          element: el,
          template: activeTemplate,
          firm: activeFirm,
          project: activeProject,
          overrides,
        })
        return { el, instanceMark: instanceMark || el.instanceMark }
      }),
    [projectOnly, activeTemplate, activeFirm, activeProject, overrides],
  )

  const filtered = useMemo(() => {
    return resolvedRows.filter(({ el, instanceMark }) => {
      if (elementTypeFilter !== 'all' && el.elementTypeId !== elementTypeFilter) return false
      if (
        search &&
        !instanceMark.toLowerCase().includes(search.toLowerCase()) &&
        !(el.sourceName ?? '').toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [resolvedRows, elementTypeFilter, search])

  const distinctTypes = useMemo(() => {
    const ids = new Set(projectOnly.map((e) => e.elementTypeId))
    return [...ids]
  }, [projectOnly])

  if (projectOnly.length === 0) {
    return (
      <section className="flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-white/70 p-6 text-center dark:border-slate-700/70 dark:bg-slate-900/40">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
          {t('elementIdentity.projectElements.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('elementIdentity.projectElements.empty')}
        </p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-700/70 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
          {t('elementIdentity.projectElements.title')} · {activeProject.code}
        </h3>
        <button
          onClick={() => {
            if (confirm('Bu projedeki tüm elemanlar silinecek. Emin misiniz?')) {
              clearProjectElements(activeProject.id)
            }
          }}
          className="rounded-lg px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          {t('elementIdentity.projectElements.clearAll')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip
          active={elementTypeFilter === 'all'}
          onClick={() => setElementTypeFilter('all')}
          label={`Tümü (${projectOnly.length})`}
        />
        {distinctTypes.map((etId) => {
          const et = ELEMENT_TYPES_BY_ID[etId]
          const count = projectOnly.filter((e) => e.elementTypeId === etId).length
          return (
            <Chip
              key={etId}
              active={elementTypeFilter === etId}
              onClick={() => setElementTypeFilter(etId)}
              label={`${locale === 'en' ? et?.nameEn : et?.nameTr} (${count})`}
            />
          )
        })}
        <input
          type="text"
          placeholder="Ara (instance mark / kaynak ad)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200/70 bg-white/70 dark:border-slate-700/70 dark:bg-slate-900/40">
        <table className="w-full table-auto text-xs">
          <thead className="sticky top-0 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 dark:bg-gray-900/60 dark:text-gray-400">
            <tr>
              <th className="px-2 py-2 text-left">
                {t('elementIdentity.projectElements.instanceMark')}
              </th>
              <th className="px-2 py-2 text-left">{t('elementIdentity.table.elementType')}</th>
              <th className="px-2 py-2 text-left">{t('elementIdentity.table.typology')}</th>
              <th className="px-2 py-2 text-left">Boyutlar</th>
              <th className="px-2 py-2 text-left">Sıra</th>
              <th className="px-2 py-2 text-left">
                {t('elementIdentity.projectElements.revision')}
              </th>
              <th className="px-2 py-2 text-left">
                {t('elementIdentity.projectElements.source')}
              </th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ el, instanceMark }) => {
              const et = ELEMENT_TYPES_BY_ID[el.elementTypeId]
              const ty = TYPOLOGIES_BY_ID[el.typologyId]
              const dims = Object.entries(el.dimensions)
                .slice(0, 3)
                .map(([k, v]) => `${k}=${v}`)
                .join(', ')
              return (
                <tr
                  key={el.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100/60 dark:hover:bg-gray-900/50"
                >
                  <td className="px-2 py-2 font-mono text-[11px] font-semibold text-gray-900 dark:text-gray-100">
                    {instanceMark}
                  </td>
                  <td className="px-2 py-2 text-gray-700 dark:text-gray-300">
                    {locale === 'en' ? et?.nameEn : et?.nameTr}
                  </td>
                  <td className="px-2 py-2 text-gray-700 dark:text-gray-300">
                    {locale === 'en' ? ty?.nameEn : ty?.nameTr}
                  </td>
                  <td className="px-2 py-2 font-mono text-[10px] text-gray-500 dark:text-gray-400">
                    {dims}
                    {Object.keys(el.dimensions).length > 3 && '…'}
                  </td>
                  <td className="px-2 py-2 font-mono text-[11px]">{el.sequence}</td>
                  <td className="px-2 py-2 font-mono text-[11px]">R{el.revision}</td>
                  <td className="px-2 py-2 text-[10px] text-gray-500">
                    {el.sourceSystem ?? '—'}
                    {el.sourceName && <div className="font-mono text-[10px]">{el.sourceName}</div>}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => removeProjectElement(el.id)}
                      className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-full px-3 py-1 text-[11px] font-medium transition',
        active
          ? 'bg-gray-800 text-white shadow-neo-out dark:bg-gray-200 dark:text-gray-900'
          : 'bg-gray-100 text-gray-700 shadow-neo-in dark:bg-gray-900/70 dark:text-gray-200',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
