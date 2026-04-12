import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileBarChart, Pencil, Plus, Trash2, XCircle } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { MPTS_BASE_PATH } from '../constants'
import { useMpts } from '../MptsContext'
import type { MaterialCategory, MaterialItem } from '../types'
import { useMptsBreadcrumb } from '../useMptsBreadcrumb'
import { MptsActionBar } from '../components/MptsActionBar'
import { MptsDenseTable, MptsTd, MptsTh } from '../components/MptsDenseTable'
import { MptsPageHeader } from '../components/MptsPageHeader'

const categories: MaterialCategory[] = [
  'Rebar',
  'Strand',
  'Insert',
  'Lifting Loop',
  'Miscellaneous Items',
  'Assembly Kit',
]

export function MaterialItemsListPage({ onCloseModule }: { onCloseModule: () => void }) {
  const { t } = useI18n()
  const bc = useMptsBreadcrumb()
  const { materialItems, deleteMaterialItem, pushToast } = useMpts()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<string>('all')
  const [active, setActive] = useState<'all' | 'yes' | 'no'>('all')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)

  const catLabel = (c: MaterialCategory) => t(`mpts.cat.${c}`)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return materialItems.filter((r) => {
      if (cat !== 'all' && r.category !== cat) return false
      if (active === 'yes' && !r.active) return false
      if (active === 'no' && r.active) return false
      if (!q) return true
      const blob = `${r.materialNum} ${r.description} ${r.embedLabel}`.toLowerCase()
      return blob.includes(q)
    })
  }, [materialItems, search, cat, active])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage)

  const onDelete = (row: MaterialItem) => {
    if (!window.confirm(t('mpts.materialItems.deleteConfirm', { num: row.materialNum }))) return
    deleteMaterialItem(row.id)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MptsPageHeader
        breadcrumb={bc.catalogList}
        title={t('mpts.materialItems.title')}
        subtitle={t('mpts.materialItems.subtitle')}
      />
      <MptsActionBar
        left={<span>{t('mpts.materialItems.rowCount', { count: String(filtered.length) })}</span>}
        right={
          <>
            <button
              type="button"
              className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold"
              onClick={() => pushToast({ type: 'info', text: t('mpts.toast.reportQueued') })}
            >
              <FileBarChart className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.report')}
            </button>
            <button
              type="button"
              className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold"
              onClick={() => pushToast({ type: 'success', text: t('mpts.toast.exportQueued') })}
            >
              <Download className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.export')}
            </button>
            <button
              type="button"
              className="okan-liquid-btn-primary px-3 py-1.5 text-xs font-semibold"
              onClick={() => navigate(`${MPTS_BASE_PATH}/catalog/material-items/new`)}
            >
              <Plus className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.addNew')}
            </button>
            <button
              type="button"
              className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold"
              onClick={onCloseModule}
            >
              <XCircle className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.close')}
            </button>
          </>
        }
      />

      <div className="okan-liquid-panel-nested mb-2 flex flex-wrap items-end gap-3 p-3">
        <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
          {t('mpts.common.search')}
          <input
            className="okan-liquid-input ml-1 mt-1 block w-56 px-3 py-2 text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder={t('mpts.materialItems.placeholderSearch')}
          />
        </label>
        <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
          {t('mpts.common.category')}
          <select
            className="okan-liquid-select ml-1 mt-1 block px-3 py-2 text-sm"
            value={cat}
            onChange={(e) => {
              setCat(e.target.value)
              setPage(1)
            }}
          >
            <option value="all">{t('mpts.common.all')}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {catLabel(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
          {t('mpts.common.active')}
          <select
            className="okan-liquid-select ml-1 mt-1 block px-3 py-2 text-sm"
            value={active}
            onChange={(e) => {
              setActive(e.target.value as typeof active)
              setPage(1)
            }}
          >
            <option value="all">{t('mpts.common.all')}</option>
            <option value="yes">{t('mpts.common.yes')}</option>
            <option value="no">{t('mpts.common.no')}</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded border border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('mpts.materialItems.empty')}</p>
          <button
            type="button"
            className="mt-3 rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            onClick={() => navigate(`${MPTS_BASE_PATH}/catalog/material-items/new`)}
          >
            {t('mpts.common.addNew')}
          </button>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-auto">
            <MptsDenseTable>
              <thead className="sticky top-0 z-10">
                <tr>
                  <MptsTh sticky>{t('mpts.materialItems.th.category')}</MptsTh>
                  <MptsTh sticky>{t('mpts.materialItems.th.materialNum')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.embed')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.description')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.glCode')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.bendType')}</MptsTh>
                  <MptsTh className="text-right">{t('mpts.materialItems.th.materialCost')}</MptsTh>
                  <MptsTh className="text-right">{t('mpts.materialItems.th.dimLength')}</MptsTh>
                  <MptsTh className="text-right">{t('mpts.materialItems.th.orderBy')}</MptsTh>
                  <MptsTh>{t('mpts.common.active')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.prod')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.cip')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.erect')}</MptsTh>
                  <MptsTh className="text-right">{t('mpts.common.actions')}</MptsTh>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <MptsTd sticky>{catLabel(r.category)}</MptsTd>
                    <MptsTd sticky className="font-mono text-[11px]">
                      {r.materialNum}
                    </MptsTd>
                    <MptsTd>{r.embedLabel}</MptsTd>
                    <MptsTd className="max-w-[200px] truncate" title={r.description}>
                      {r.description}
                    </MptsTd>
                    <MptsTd className="font-mono text-[11px]">{r.glCode}</MptsTd>
                    <MptsTd>{r.bendType}</MptsTd>
                    <MptsTd className="text-right tabular-nums">{r.materialCost.toFixed(2)}</MptsTd>
                    <MptsTd className="text-right tabular-nums">{r.dimLength}</MptsTd>
                    <MptsTd className="text-right tabular-nums">{r.orderBy}</MptsTd>
                    <MptsTd>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          r.active ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {r.active ? t('mpts.common.yes') : t('mpts.common.no')}
                      </span>
                    </MptsTd>
                    <MptsTd>{r.production ? '✓' : '—'}</MptsTd>
                    <MptsTd>{r.cip ? '✓' : '—'}</MptsTd>
                    <MptsTd>{r.erection ? '✓' : '—'}</MptsTd>
                    <MptsTd className="text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="mr-1 rounded p-1 text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/50"
                        onClick={() => navigate(`${MPTS_BASE_PATH}/catalog/material-items/${r.id}/edit`)}
                        aria-label={t('mpts.common.edit')}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                        onClick={() => onDelete(r)}
                        aria-label={t('mpts.common.delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </MptsTd>
                  </tr>
                ))}
              </tbody>
            </MptsDenseTable>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>{t('mpts.common.rowsPerPage')}</span>
              <select
                className="rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setPage(1)
                }}
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40 dark:border-slate-600"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t('mpts.common.prev')}
              </button>
              <span>
                {t('mpts.common.page')} {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40 dark:border-slate-600"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {t('mpts.common.next')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
