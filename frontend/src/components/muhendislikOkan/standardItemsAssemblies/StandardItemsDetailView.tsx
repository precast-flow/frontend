import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '../../../i18n/I18nProvider'
import type { StandardAssembly, StandardAssemblyComponent } from './standardItemsAssembliesMock'
import { PIECE_MARK_OPTIONS, newId } from './standardItemsAssembliesMock'

type Props = {
  assembly: StandardAssembly
  onSave: (next: StandardAssembly) => void
  onClose: () => void
}

export function StandardItemsDetailView({ assembly, onSave, onClose }: Props) {
  const { t } = useI18n()
  const [rows, setRows] = useState<StandardAssemblyComponent[]>(() =>
    assembly.components.map((c) => ({ ...c })),
  )
  const [baseline, setBaseline] = useState(JSON.stringify(assembly.components))
  const [unsavedOpen, setUnsavedOpen] = useState(false)

  useEffect(() => {
    setRows(assembly.components.map((c) => ({ ...c })))
    setBaseline(JSON.stringify(assembly.components))
  }, [assembly])

  const dirty = JSON.stringify(rows) !== baseline

  const persistRows = () => {
    onSave({ ...assembly, components: rows })
    setBaseline(JSON.stringify(rows))
  }

  const tryClose = () => {
    if (dirty) setUnsavedOpen(true)
    else onClose()
  }

  const addRow = () => {
    setRows((r) => [
      ...r,
      {
        id: newId('row'),
        pieceMarkId: '',
        description: '',
        productCategory: '',
        prdCode: '',
        crossSection: '',
        active: true,
      },
    ])
  }

  const emptyGrid = rows.length === 0

  const applyPieceMark = (rowId: string, pieceMarkId: string) => {
    const pm = PIECE_MARK_OPTIONS.find((p) => p.id === pieceMarkId)
    setRows((list) =>
      list.map((row) => {
        if (row.id !== rowId) return row
        if (!pm) {
          return {
            ...row,
            pieceMarkId: '',
            productCategory: '',
            prdCode: '',
            crossSection: '',
          }
        }
        return {
          ...row,
          pieceMarkId: pm.id,
          productCategory: pm.productCategory,
          prdCode: pm.prdCode,
          crossSection: pm.crossSection,
          description: row.description.trim() ? row.description : (pm.suggestedDescription ?? ''),
        }
      }),
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="okan-liquid-panel-nested flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{t('sia.detail.title')}</h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('sia.demoBadge')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={persistRows} className="okan-liquid-btn-primary px-3 py-2 text-sm font-semibold">
            {t('sia.detail.save')}
          </button>
          <button type="button" onClick={tryClose} className="okan-liquid-btn-secondary px-3 py-2 text-sm font-semibold">
            {t('sia.close')}
          </button>
        </div>
      </div>

      <div className="okan-liquid-panel-nested overflow-x-auto p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">{t('sia.detail.summary')}</p>
        <div className="okan-liquid-table-wrap">
          <table className="w-full min-w-[640px] border-collapse text-sm text-slate-900 dark:text-slate-100">
            <thead>
              <tr>
                <th className="okan-liquid-table-thead px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide">
                  {t('sia.col.location')}
                </th>
                <th className="okan-liquid-table-thead px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide">
                  {t('sia.col.itemCode')}
                </th>
                <th className="okan-liquid-table-thead px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide">
                  {t('sia.col.description')}
                </th>
                <th className="okan-liquid-table-thead px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide">
                  {t('sia.col.unitCode')}
                </th>
                <th className="okan-liquid-table-thead px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide">
                  {t('sia.col.active')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="okan-liquid-table-row border-b px-2 py-2 text-xs text-slate-800 dark:text-slate-100">
                  {assembly.location}
                </td>
                <td className="okan-liquid-table-row border-b px-2 py-2 font-mono text-xs">{assembly.itemCode}</td>
                <td className="okan-liquid-table-row border-b px-2 py-2 text-xs">{assembly.description}</td>
                <td className="okan-liquid-table-row border-b px-2 py-2 text-xs">{assembly.unitCode}</td>
                <td className="okan-liquid-table-row border-b px-2 py-2 text-xs">
                  {assembly.active ? t('sia.filter.yes') : t('sia.filter.no')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="okan-liquid-table-wrap min-h-0 flex-1 overflow-auto">
        {emptyGrid ? (
          <div className="okan-liquid-panel-nested m-3 flex flex-col items-center gap-3 p-6 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>{t('sia.detail.gridEmpty')}</p>
            <button type="button" onClick={addRow} className="okan-liquid-btn-primary px-4 py-2 text-sm font-semibold">
              {t('sia.detail.addRow')}
            </button>
          </div>
        ) : (
        <table className="w-full min-w-[960px] border-collapse text-left text-sm text-slate-900 dark:text-slate-100">
          <thead>
            <tr>
              <th className="okan-liquid-table-thead w-12 px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">
                {t('sia.col.actions')}
              </th>
              <th className="okan-liquid-table-thead min-w-[220px] px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">
                {t('sia.detail.pieceMark')}
              </th>
              <th className="okan-liquid-table-thead min-w-[140px] px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">
                {t('sia.col.description')}
              </th>
              <th className="okan-liquid-table-thead px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">
                {t('sia.detail.productCategory')}
              </th>
              <th className="okan-liquid-table-thead px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">
                {t('sia.detail.prdCode')}
              </th>
              <th className="okan-liquid-table-thead px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">
                {t('sia.detail.crossSection')}
              </th>
              <th className="okan-liquid-table-thead px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">
                {t('sia.col.active')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="okan-liquid-table-row border-b px-2 py-2 align-top text-xs">
                  <button
                    type="button"
                    title={t('sia.detail.addRow')}
                    onClick={addRow}
                    className="okan-liquid-btn-secondary inline-flex size-8 items-center justify-center p-0"
                  >
                    <Plus className="size-4" />
                  </button>
                </td>
                <td className="okan-liquid-table-row border-b px-2 py-2 align-top text-xs">
                  <select
                    className="okan-liquid-select w-full min-w-[200px] px-2 py-1.5 text-xs"
                    value={row.pieceMarkId}
                    onChange={(e) => applyPieceMark(row.id, e.target.value)}
                  >
                    <option value="">{t('sia.detail.selectPieceMark')}</option>
                    {PIECE_MARK_OPTIONS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="okan-liquid-table-row border-b px-2 py-2 align-top text-xs">
                  <input
                    className="okan-liquid-input w-full px-2 py-1.5 text-xs"
                    value={row.description}
                    onChange={(e) =>
                      setRows((list) => list.map((r) => (r.id === row.id ? { ...r, description: e.target.value } : r)))
                    }
                  />
                </td>
                <td className="okan-liquid-table-row border-b px-2 py-2 align-top text-xs text-slate-600 dark:text-slate-300">
                  {row.productCategory}
                </td>
                <td className="okan-liquid-table-row border-b px-2 py-2 align-top text-xs text-slate-600 dark:text-slate-300">
                  {row.prdCode}
                </td>
                <td className="okan-liquid-table-row border-b px-2 py-2 align-top text-xs text-slate-600 dark:text-slate-300">
                  {row.crossSection}
                </td>
                <td className="okan-liquid-table-row border-b px-2 py-2 align-top text-xs">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-slate-300"
                    checked={row.active}
                    onChange={(e) =>
                      setRows((list) => list.map((r) => (r.id === row.id ? { ...r, active: e.target.checked } : r)))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {unsavedOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="okan-liquid-panel-nested max-w-md p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{t('sia.form.unsavedTitle')}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t('sia.form.unsavedBody')}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setUnsavedOpen(false)} className="okan-liquid-btn-secondary px-3 py-1.5 text-sm font-semibold">
                {t('sia.delete.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setUnsavedOpen(false)
                  onClose()
                }}
                className="okan-liquid-btn-primary px-3 py-1.5 text-sm font-semibold"
              >
                {t('sia.form.unsavedConfirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
