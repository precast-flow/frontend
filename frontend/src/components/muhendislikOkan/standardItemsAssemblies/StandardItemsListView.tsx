import {
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileBarChart,
  FileText,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useI18n } from '../../../i18n/I18nProvider'
import { MptsActionBar } from '../../manualPieceTemplateStudio/components/MptsActionBar'
import { MptsDenseTable, MptsTd, MptsTh } from '../../manualPieceTemplateStudio/components/MptsDenseTable'
import { MptsPageHeader } from '../../manualPieceTemplateStudio/components/MptsPageHeader'
import { MptsPaginationBar } from '../../manualPieceTemplateStudio/components/MptsPaginationBar'
import type { StandardAssembly } from './standardItemsAssembliesMock'
import { SIA_LOCATIONS } from './standardItemsAssembliesMock'

type SortDir = 'asc' | 'desc' | null

type Props = {
  rows: StandardAssembly[]
  loading?: boolean
  onAddNew: () => void
  onClose: () => void
  onEdit: (id: string) => void
  onView: (id: string) => void
  onCopy: (id: string) => void
  onDelete: (id: string) => void
}

export function StandardItemsListView({
  rows,
  loading,
  onAddNew,
  onClose,
  onEdit,
  onView,
  onCopy,
  onDelete,
}: Props) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState<string>('all')
  const [active, setActive] = useState<'all' | 'yes' | 'no'>('all')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionFlash, setActionFlash] = useState<string | null>(null)

  const breadcrumb = `${t('nav.engineering')} / ${t('sia.mainTab.standardItems')}`

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (location !== 'all' && r.location !== location) return false
      if (active === 'yes' && !r.active) return false
      if (active === 'no' && r.active) return false
      if (!q) return true
      const blob = `${r.itemCode} ${r.description} ${r.location}`.toLowerCase()
      return blob.includes(q)
    })
  }, [rows, search, location, active])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    if (sortDir) {
      copy.sort((a, b) => {
        const c = a.itemCode.localeCompare(b.itemCode, 'en')
        return sortDir === 'asc' ? c : -c
      })
    }
    return copy
  }, [filtered, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const effectivePage = Math.min(Math.max(1, page), totalPages)
  const pageRows = sorted.slice((effectivePage - 1) * perPage, effectivePage * perPage)

  const toggleSort = () => {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
  }

  const flash = (msg: string) => {
    setActionFlash(msg)
    window.setTimeout(() => setActionFlash(null), 2600)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MptsPageHeader
        breadcrumb={breadcrumb}
        title={t('sia.title')}
        badge={
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{t('sia.demoBadge')}</span>
        }
      />

      <MptsActionBar
        filters={
          <>
            <label className="flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
              <span className="shrink-0 whitespace-nowrap">{t('mpts.common.search')}</span>
              <input
                className="okan-liquid-input min-w-[17rem] max-w-[28rem] flex-1 px-2.5 py-1.5 text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder={t('mpts.materialItems.placeholderSearch')}
              />
            </label>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
              <span className="shrink-0 whitespace-nowrap">{t('sia.filter.location')}</span>
              <select
                className="okan-liquid-select min-w-[8rem] px-2.5 py-1.5 text-sm"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  setPage(1)
                }}
              >
                <option value="all">{t('sia.filter.allLocations')}</option>
                {SIA_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
              <span className="shrink-0 whitespace-nowrap">{t('mpts.common.active')}</span>
              <select
                className="okan-liquid-select min-w-[5.5rem] px-2.5 py-1.5 text-sm"
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
          </>
        }
        right={
          <>
            <button
              type="button"
              className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold"
              onClick={() => flash(t('mpts.toast.reportQueued'))}
            >
              <FileBarChart className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.report')}
            </button>
            <button
              type="button"
              className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold"
              onClick={() => flash(t('mpts.toast.exportQueued'))}
            >
              <Download className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.export')}
            </button>
            <button
              type="button"
              className="okan-liquid-btn-primary px-3 py-1.5 text-xs font-semibold"
              onClick={onAddNew}
            >
              <Plus className="mr-1 inline h-3.5 w-3.5" />
              {t('sia.addNew')}
            </button>
            <button type="button" className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold" onClick={onClose}>
              <XCircle className="mr-1 inline h-3.5 w-3.5" />
              {t('sia.close')}
            </button>
          </>
        }
      />

      {actionFlash ? (
        <div
          role="status"
          className="okan-liquid-panel-nested mb-2 shrink-0 px-3 py-2 text-xs text-slate-700 dark:text-slate-200"
        >
          {actionFlash}
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-sm text-slate-600 dark:text-slate-400">
          {t('sia.loading')}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded border border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('sia.empty')}</p>
          <button
            type="button"
            className="mt-3 rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            onClick={onAddNew}
          >
            {t('sia.addNew')}
          </button>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-auto">
            <MptsDenseTable>
              <thead className="sticky top-0 z-10">
                <tr>
                  <MptsTh sticky>{t('sia.col.location')}</MptsTh>
                  <MptsTh>
                    <button
                      type="button"
                      onClick={toggleSort}
                      className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-100"
                    >
                      {t('sia.col.itemCode')}
                      {sortDir === 'asc' ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </button>
                  </MptsTh>
                  <MptsTh>{t('sia.col.description')}</MptsTh>
                  <MptsTh>{t('sia.col.unitCode')}</MptsTh>
                  <MptsTh>{t('sia.col.active')}</MptsTh>
                  <MptsTh className="text-right">{t('sia.col.actions')}</MptsTh>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => {
                  const isHi = highlightId === r.id
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <MptsTd sticky className={isHi ? 'bg-sky-100/40 dark:bg-sky-950/35' : ''}>
                        {r.location}
                      </MptsTd>
                      <MptsTd
                        className={`font-mono text-[11px] ${isHi ? 'bg-sky-100/40 ring-1 ring-sky-400/50 dark:bg-sky-950/35' : ''}`}
                        onClick={() => setHighlightId(r.id)}
                      >
                        {r.itemCode}
                      </MptsTd>
                      <MptsTd
                        className={`max-w-[220px] truncate ${isHi ? 'ring-1 ring-sky-400/50' : ''}`}
                        title={r.description}
                        onClick={() => setHighlightId(r.id)}
                      >
                        {r.description}
                      </MptsTd>
                      <MptsTd className="font-mono text-[11px]">{r.unitCode}</MptsTd>
                      <MptsTd>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            r.active
                              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {r.active ? t('mpts.common.yes') : t('mpts.common.no')}
                        </span>
                      </MptsTd>
                      <MptsTd className="text-right whitespace-nowrap">
                        <button
                          type="button"
                          className="mr-1 rounded p-1 text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/50"
                          title={t('sia.tooltip.edit')}
                          onClick={() => onEdit(r.id)}
                          aria-label={t('sia.tooltip.edit')}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="mr-1 rounded p-1 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60"
                          title={t('sia.tooltip.view')}
                          onClick={() => onView(r.id)}
                          aria-label={t('sia.tooltip.view')}
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="mr-1 rounded p-1 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60"
                          title={t('sia.tooltip.copy')}
                          onClick={() => onCopy(r.id)}
                          aria-label={t('sia.tooltip.copy')}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded p-1 text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                          title={t('sia.tooltip.delete')}
                          onClick={() => setDeleteId(r.id)}
                          aria-label={t('sia.tooltip.delete')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </MptsTd>
                    </tr>
                  )
                })}
              </tbody>
            </MptsDenseTable>
          </div>
          <MptsPaginationBar
            page={effectivePage}
            totalPages={totalPages}
            onPageChange={setPage}
            perPage={perPage}
            onPerPageChange={(n) => {
              setPerPage(n)
              setPage(1)
            }}
          />
        </>
      )}

      {deleteId ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]" role="dialog">
          <div className="okan-liquid-panel-nested max-w-md p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{t('sia.delete.title')}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t('sia.delete.body')}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteId(null)} className="okan-liquid-btn-secondary px-3 py-1.5 text-sm font-semibold">
                {t('sia.delete.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(deleteId)
                  setDeleteId(null)
                }}
                className="okan-liquid-btn-primary px-3 py-1.5 text-sm font-semibold"
              >
                {t('sia.delete.confirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
