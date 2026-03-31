import { useMemo, useState } from 'react'
import { GitCompare, LayoutGrid, Shield } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import { useProductionRolePreview } from '../../context/ProductionRolePreviewContext'
import {
  PROD_SCREEN_KEYS,
  PROD_TAB_HIDDEN_MOCK,
  ROLE_MATRIX_ROWS,
  readOnlyIdsFor,
  getRoleMatrixRow,
} from '../../data/productionRoleMatrixMock'
import { findNavItem } from '../../data/navigation'
import { useI18n } from '../../i18n/I18nProvider'

const insetWell = 'rounded-xl bg-gray-100 px-3 py-2 shadow-neo-in dark:bg-gray-950/80'

export function ProductionRolePreviewView() {
  const { t } = useI18n()
  const { contextDetail, selectedFactory, selectedCodes } = useFactoryContext()
  const { previewRoleId, setPreviewRoleId, clearPreview } = useProductionRolePreview()
  const [diffA, setDiffA] = useState('chief')
  const [diffB, setDiffB] = useState('batch_op')

  const factoryHint = selectedCodes.length > 1 ? selectedCodes.join(', ') : selectedFactory.code

  const diffRows = useMemo(() => {
    const a = getRoleMatrixRow(diffA)
    const b = getRoleMatrixRow(diffB)
    if (!a || !b) return []
    const keys = new Set([...a.menuIds, ...b.menuIds])
    return Array.from(keys).map((id) => {
      const inA = a.menuIds.includes(id)
      const inB = b.menuIds.includes(id)
      const editA = a.editIds.includes(id)
      const editB = b.editIds.includes(id)
      const item = findNavItem(id)
      const label = item ? t(item.labelKey) : id
      return {
        id,
        label,
        inA,
        inB,
        editA,
        editB,
        diff: inA !== inB || editA !== editB,
      }
    })
  }, [diffA, diffB, t])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        <strong className="text-gray-800 dark:text-gray-100">prod-07:</strong> {t('rolePreview.intro')}{' '}
        <span className="text-gray-500">{contextDetail}</span> · <strong>{factoryHint}</strong>
      </p>

      {/* P0 — önizleme seçici (sayfa içi; üst şerit AppShell’de) */}
      <div className={`${insetWell} flex flex-wrap items-end gap-4`}>
        <label className="flex min-w-[12rem] flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('rolePreview.previewSelect')}
          </span>
          <select
            className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 shadow-neo-in dark:bg-gray-900 dark:text-gray-50"
            value={previewRoleId ?? ''}
            onChange={(e) => setPreviewRoleId(e.target.value === '' ? null : e.target.value)}
          >
            <option value="">{t('rolePreview.previewOff')}</option>
            {ROLE_MATRIX_ROWS.map((r) => (
              <option key={r.id} value={r.id}>
                {t(r.labelKey)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={clearPreview}
          className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
        >
          {t('rolePreview.bannerExit')}
        </button>
        <p className="max-w-xl text-xs text-gray-600 dark:text-gray-300">{t('rolePreview.previewHint')}</p>
      </div>

      <div className="rounded-xl border border-gray-200/90 bg-gray-50/90 px-3 py-2 text-xs text-gray-700 shadow-neo-in dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-200">
        <Shield className="mb-1 inline size-3.5 text-gray-500" aria-hidden />
        {t('rolePreview.auditNote')}
      </div>

      {/* P0 — matris tablo */}
      <section className="min-h-0 flex-1 overflow-auto rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-900/80">
        <h2 className="sticky top-0 z-10 border-b border-gray-200/90 bg-gray-100/95 px-4 py-3 text-sm font-semibold text-gray-900 backdrop-blur dark:border-gray-700/90 dark:bg-gray-900/95 dark:text-gray-50">
          {t('rolePreview.matrixTitle')}
        </h2>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('rolePreview.colRole')}</th>
              <th className="px-4 py-3 font-semibold">{t('rolePreview.colMenu')}</th>
              <th className="px-4 py-3 font-semibold">{t('rolePreview.colEdit')}</th>
              <th className="px-4 py-3 font-semibold">{t('rolePreview.colReadonly')}</th>
            </tr>
          </thead>
          <tbody>
            {ROLE_MATRIX_ROWS.map((row) => {
              const ro = readOnlyIdsFor(row)
              return (
                <tr key={row.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-50">
                    {t(row.labelKey)}
                  </td>
                  <td className="max-w-[14rem] px-4 py-3 text-gray-700 dark:text-gray-200">
                    {row.menuIds
                      .map((id) => {
                        const item = findNavItem(id)
                        return item ? t(item.labelKey) : id
                      })
                      .join(' · ')}
                  </td>
                  <td className="max-w-[14rem] px-4 py-3 text-gray-700 dark:text-gray-200">
                    {row.editIds.length
                      ? row.editIds
                          .map((id) => {
                            const item = findNavItem(id)
                            return item ? t(item.labelKey) : id
                          })
                          .join(' · ')
                      : '—'}
                  </td>
                  <td className="max-w-[14rem] px-4 py-3 text-gray-600 dark:text-gray-300">
                    {ro.length
                      ? ro
                          .map((id) => {
                            const item = findNavItem(id)
                            return item ? t(item.labelKey) : id
                          })
                          .join(' · ')
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      {/* P1 — prod-01…06 gizli sekmeler */}
      <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
          <LayoutGrid className="size-4" aria-hidden />
          {t('rolePreview.p1Title')}
        </h2>
        <div className="mt-4 space-y-4">
            {ROLE_MATRIX_ROWS.map((row) => {
              const lines = PROD_SCREEN_KEYS.flatMap((pk) => {
                const hidden = PROD_TAB_HIDDEN_MOCK[row.id]?.[pk]
                if (!hidden?.length) return []
                return [{ pk, hidden }]
              })
              return (
                <div
                  key={row.id}
                  className="rounded-xl border border-gray-200/80 bg-gray-100/80 p-3 dark:border-gray-700/80 dark:bg-gray-900/50"
                >
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t(row.labelKey)}</p>
                  {lines.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('rolePreview.p1Empty')}</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5 text-sm text-gray-800 dark:text-gray-200">
                      {lines.map(({ pk, hidden }) => (
                        <li key={pk}>
                          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{t(`rolePreview.${pk}`)}</span>
                          {' — '}
                          {hidden.join(', ')}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
        </div>
      </section>

      {/* P2 — diff */}
      <section className="rounded-2xl border border-gray-200/90 bg-gray-100/80 p-4 shadow-neo-out-sm dark:border-gray-700 dark:bg-gray-900/70">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
          <GitCompare className="size-4" aria-hidden />
          {t('rolePreview.diffTitle')}
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase text-gray-500">{t('rolePreview.diffRoleA')}</span>
            <select
              className="rounded-xl border-0 bg-white px-3 py-2 text-sm shadow-neo-in dark:bg-gray-950 dark:text-gray-50"
              value={diffA}
              onChange={(e) => setDiffA(e.target.value)}
            >
              {ROLE_MATRIX_ROWS.map((r) => (
                <option key={r.id} value={r.id}>
                  {t(r.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase text-gray-500">{t('rolePreview.diffRoleB')}</span>
            <select
              className="rounded-xl border-0 bg-white px-3 py-2 text-sm shadow-neo-in dark:bg-gray-950 dark:text-gray-50"
              value={diffB}
              onChange={(e) => setDiffB(e.target.value)}
            >
              {ROLE_MATRIX_ROWS.map((r) => (
                <option key={r.id} value={r.id}>
                  {t(r.labelKey)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-950/60">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">{t('rolePreview.diffColModule')}</th>
                <th className="px-3 py-2 text-left font-semibold">{t('rolePreview.diffColA')}</th>
                <th className="px-3 py-2 text-left font-semibold">{t('rolePreview.diffColB')}</th>
              </tr>
            </thead>
            <tbody>
              {diffRows.map((r) => (
                <tr
                  key={r.id}
                  className={[
                    'border-t border-gray-200/80 dark:border-gray-700/80',
                    r.diff ? 'bg-amber-50/80 dark:bg-amber-950/30' : '',
                  ].join(' ')}
                >
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-50">{r.label}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                    {!r.inA ? (
                      t('rolePreview.diffHidden')
                    ) : r.editA ? (
                      t('rolePreview.diffEdit')
                    ) : (
                      t('rolePreview.diffRead')
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                    {!r.inB ? (
                      t('rolePreview.diffHidden')
                    ) : r.editB ? (
                      t('rolePreview.diffEdit')
                    ) : (
                      t('rolePreview.diffRead')
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{t('rolePreview.diffHint')}</p>
      </section>

      <p className="text-xs text-gray-500 dark:text-gray-400">{t('rolePreview.footerQuestions')}</p>
    </div>
  )
}
