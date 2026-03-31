import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Info,
  Layers,
  LayoutGrid,
  List,
  Search,
  Shield,
  Table2,
  X,
} from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  DELAY_REASON_OPTIONS,
  PENDING_PRIORITY_SEED,
  type DelayReasonCode,
  type PendingPriorityRow,
  termRiskClass,
  termRiskLabel,
  urgencyLabel,
  type Urgency,
} from '../../data/pendingPriorityMock'
import { getPendingPriorityDemoImageUrls, pickDemoImageForRow } from '../../data/pendingPriorityDemoImages'
import { useI18n } from '../../i18n/I18nProvider'

const inset =
  'rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'
const btnNeo =
  'rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-800 dark:text-gray-100'

/** 00c — görünüm modu; localStorage ile mock persist */
const VIEW_STORAGE_KEY = 'precast-pf-pending-priority-view-mode'

export type PendingViewMode = 'icon' | 'list' | 'table' | 'gallery'

function readStoredViewMode(): PendingViewMode {
  if (typeof window === 'undefined') return 'table'
  try {
    const v = window.localStorage.getItem(VIEW_STORAGE_KEY)
    if (v === 'icon' || v === 'list' || v === 'table' || v === 'gallery') return v
  } catch {
    /* ignore */
  }
  return 'table'
}

type TableColId = 'thumb' | 'order' | 'part' | 'wait' | 'risk' | 'score' | 'line' | 'project' | 'delay' | 'move'

const DEFAULT_TABLE_COLS: Record<TableColId, boolean> = {
  thumb: true,
  order: true,
  part: true,
  wait: true,
  risk: true,
  score: true,
  line: true,
  project: true,
  delay: true,
  move: true,
}

function cloneRows(): PendingPriorityRow[] {
  return PENDING_PRIORITY_SEED.map((r) => ({ ...r }))
}

function normalizeRanks(list: PendingPriorityRow[]): PendingPriorityRow[] {
  return list.map((r, i) => ({ ...r, rank: i + 1 }))
}

const viewTab = (on: boolean) =>
  [
    'inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 sm:flex-none sm:px-3.5',
    on
      ? 'bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900'
      : 'bg-gray-100 text-gray-600 shadow-neo-in hover:text-gray-900 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white',
  ].join(' ')

export function PendingPriorityReportView() {
  const { t } = useI18n()
  const { contextDetail, selectedFactory, selectedCodes } = useFactoryContext()
  const [rows, setRows] = useState(cloneRows)
  const [lineFilter, setLineFilter] = useState<string>('')
  const [projectFilter, setProjectFilter] = useState<string>('')
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | Urgency>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<PendingViewMode>(() => readStoredViewMode())
  const [tableCols, setTableCols] = useState<Record<TableColId, boolean>>(() => ({ ...DEFAULT_TABLE_COLS }))
  /** P0 — şef tam yetki mock */
  const [roleChief, setRoleChief] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, viewMode)
    } catch {
      /* ignore */
    }
  }, [viewMode])

  const projects = useMemo(() => {
    const s = new Set(rows.map((r) => r.project))
    return Array.from(s).sort()
  }, [rows])

  const lines = useMemo(() => {
    const s = new Set(rows.map((r) => r.lineLabel))
    return Array.from(s).sort()
  }, [rows])

  const demoImageUrls = useMemo(() => getPendingPriorityDemoImageUrls(), [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return rows.filter((r) => {
      if (lineFilter && r.lineLabel !== lineFilter) return false
      if (projectFilter && r.project !== projectFilter) return false
      if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false
      if (q) {
        const hit =
          r.orderNo.toLowerCase().includes(q) ||
          r.part.toLowerCase().includes(q) ||
          r.project.toLowerCase().includes(q)
        if (!hit) return false
      }
      return true
    })
  }, [rows, lineFilter, projectFilter, urgencyFilter, searchQuery])

  const canReorder = roleChief

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  const moveRow = (id: string, dir: -1 | 1) => {
    if (!canReorder) return
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id)
      if (idx < 0) return prev
      const j = idx + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[j]] = [next[j]!, next[idx]!]
      return normalizeRanks(next)
    })
  }

  const updateDelayReason = (id: string, code: DelayReasonCode) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, delayReason: code } : r)))
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const bulkRaise = () => {
    if (!selectedIds.size || !canReorder) return
    const n = selectedIds.size
    setRows((prev) =>
      prev.map((r) =>
        selectedIds.has(r.id) ? { ...r, suggestedScore: Math.min(100, r.suggestedScore + 5) } : r,
      ),
    )
    clearSelection()
    showToast(t('pendingPriority.bulkToast', { n: String(n) }))
  }

  const toggleTableCol = (id: TableColId) => {
    setTableCols((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const factoryHint = selectedCodes.length > 1 ? selectedCodes.join(', ') : selectedFactory.code

  const renderMoveBtns = (id: string) => (
    <div className="flex gap-1">
      <button
        type="button"
        disabled={!canReorder}
        className={btnNeo}
        onClick={() => moveRow(id, -1)}
        title={t('pendingPriority.up')}
      >
        <ArrowUp className="size-3.5" aria-hidden />
      </button>
      <button
        type="button"
        disabled={!canReorder}
        className={btnNeo}
        onClick={() => moveRow(id, 1)}
        title={t('pendingPriority.down')}
      >
        <ArrowDown className="size-3.5" aria-hidden />
      </button>
    </div>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pb-20">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        <strong className="text-gray-800 dark:text-gray-100">prod-04 · 00c:</strong> {t('pendingPriority.intro')}{' '}
        <span className="text-gray-500">{contextDetail}</span> · <strong>{factoryHint}</strong>
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3 shadow-neo-in dark:bg-gray-950/70">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
          <input
            type="checkbox"
            className="size-4 rounded accent-gray-800 dark:accent-gray-200"
            checked={roleChief}
            onChange={(e) => setRoleChief(e.target.checked)}
          />
          <Shield className="size-4" aria-hidden />
          {t('pendingPriority.roleChief')}
        </label>
        {!roleChief ? (
          <p className="max-w-md text-xs text-amber-800 dark:text-amber-200">{t('pendingPriority.shiftNote')}</p>
        ) : null}
      </div>

      {/* 00c — toolbar: filtre + arama + görünüm seçici */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/90 bg-gray-100/80 p-4 shadow-neo-in dark:border-gray-700 dark:bg-gray-900/50">
        <div className="flex flex-wrap gap-2">
          <label className="min-w-[8rem]">
            <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
              {t('pendingPriority.filterLine')}
            </span>
            <select className={`${inset} mt-1 w-full`} value={lineFilter} onChange={(e) => setLineFilter(e.target.value)}>
              <option value="">{t('pendingPriority.all')}</option>
              {lines.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-[10rem]">
            <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
              {t('pendingPriority.filterProject')}
            </span>
            <select
              className={`${inset} mt-1 w-full`}
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">{t('pendingPriority.all')}</option>
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-[8rem]">
            <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
              {t('pendingPriority.filterUrgency')}
            </span>
            <select
              className={`${inset} mt-1 w-full`}
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value as 'all' | Urgency)}
            >
              <option value="all">{t('pendingPriority.all')}</option>
              <option value="kritik">{urgencyLabel('kritik')}</option>
              <option value="acil">{urgencyLabel('acil')}</option>
              <option value="normal">{urgencyLabel('normal')}</option>
            </select>
          </label>
          <label className="min-w-[12rem] flex-1">
            <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
              {t('pendingPriority.searchLabel')}
            </span>
            <span className="relative mt-1 block">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                type="search"
                className={`${inset} w-full pl-9`}
                placeholder={t('pendingPriority.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t('pendingPriority.searchPlaceholder')}
              />
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('pendingPriority.viewPersistHint')}</p>
          <div
            className="flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1.5 shadow-neo-in dark:bg-gray-950/70"
            role="tablist"
            aria-label={t('pendingPriority.viewModeAria')}
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'icon'}
              className={viewTab(viewMode === 'icon')}
              onClick={() => setViewMode('icon')}
              title={t('pendingPriority.viewIcon')}
            >
              <Layers className="size-3.5 shrink-0 opacity-90" aria-hidden />
              <span className="hidden sm:inline">{t('pendingPriority.viewIcon')}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'list'}
              className={viewTab(viewMode === 'list')}
              onClick={() => setViewMode('list')}
              title={t('pendingPriority.viewList')}
            >
              <List className="size-3.5 shrink-0 opacity-90" aria-hidden />
              <span className="hidden sm:inline">{t('pendingPriority.viewList')}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'table'}
              className={viewTab(viewMode === 'table')}
              onClick={() => setViewMode('table')}
              title={t('pendingPriority.viewTable')}
            >
              <Table2 className="size-3.5 shrink-0 opacity-90" aria-hidden />
              <span className="hidden sm:inline">{t('pendingPriority.viewTable')}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'gallery'}
              className={viewTab(viewMode === 'gallery')}
              onClick={() => setViewMode('gallery')}
              title={t('pendingPriority.viewGallery')}
            >
              <LayoutGrid className="size-3.5 shrink-0 opacity-90" aria-hidden />
              <span className="hidden sm:inline">{t('pendingPriority.viewGallery')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* P2 */}
      <div className="flex gap-2 rounded-xl border border-gray-200/90 bg-gray-100/80 px-3 py-2 text-xs text-gray-700 shadow-neo-in dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200">
        <Info className="size-4 shrink-0 text-gray-500" aria-hidden />
        <p>{t('pendingPriority.autoExplain')}</p>
      </div>

      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        {demoImageUrls.length
          ? t('pendingPriority.demoImagesHint', { n: String(demoImageUrls.length) })
          : t('pendingPriority.demoImagesEmpty')}
      </p>

      {/* P1 — tablo sütun görünürlüğü */}
      {viewMode === 'table' ? (
        <details className="rounded-xl border border-dashed border-gray-300 bg-gray-50/90 px-3 py-2 dark:border-gray-600 dark:bg-gray-950/50">
          <summary className="cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-200">
            {t('pendingPriority.columnsTitle')}
          </summary>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {(Object.keys(DEFAULT_TABLE_COLS) as TableColId[]).map((cid) => (
              <label key={cid} className="inline-flex cursor-pointer items-center gap-1.5 text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  className="size-3.5 rounded accent-gray-800"
                  checked={tableCols[cid]}
                  onChange={() => toggleTableCol(cid)}
                />
                {t(`pendingPriority.colKey.${cid}`)}
              </label>
            ))}
          </div>
        </details>
      ) : null}

      {/* Gövde — dört mod, aynı veri */}
      {viewMode === 'icon' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((r, idx) => {
            const imgSrc = pickDemoImageForRow(demoImageUrls, idx)
            return (
            <div
              key={r.id}
              className="flex gap-3 rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/85"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100 shadow-neo-in ring-1 ring-gray-200/80 dark:bg-gray-950/80 dark:ring-gray-700/60">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={t('pendingPriority.imageAlt', { code: r.orderNo })}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Layers className="size-7 text-gray-500 dark:text-gray-400" strokeWidth={1.5} aria-hidden />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-bold text-gray-900 dark:text-gray-50">{r.orderNo}</p>
                    <p className="truncate text-sm text-gray-700 dark:text-gray-200">{r.part}</p>
                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                      {r.lineLabel} · {r.project}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 font-mono text-[10px] font-bold text-white dark:bg-gray-200 dark:text-gray-900">
                      #{r.rank}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${termRiskClass(r.termRisk)}`}
                    >
                      {termRiskLabel(r.termRisk)}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200/80 pt-2 dark:border-gray-700/80">
                  <span className="text-[11px] text-gray-600 dark:text-gray-300">
                    {t('pendingPriority.metricWaitScore', { wait: String(r.waitingDays), score: String(r.suggestedScore) })}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 rounded accent-gray-800"
                      checked={selectedIds.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      aria-label={t('pendingPriority.select')}
                    />
                    {renderMoveBtns(r.id)}
                  </div>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      ) : null}

      {viewMode === 'list' ? (
        <div className="divide-y divide-gray-200/90 overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-50 shadow-neo-in dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-900/70">
          {filtered.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 p-4 hover:bg-gray-100/80 dark:hover:bg-gray-950/50">
              <input
                type="checkbox"
                className="size-4 shrink-0 rounded accent-gray-800"
                checked={selectedIds.has(r.id)}
                onChange={() => toggleSelect(r.id)}
                aria-label={t('pendingPriority.select')}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-50">{r.orderNo}</p>
                  <span className="font-mono text-xs text-gray-500">#{r.rank}</span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-100">{r.part}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {r.lineLabel} · {urgencyLabel(r.urgency)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${termRiskClass(r.termRisk)}`}
                >
                  {termRiskLabel(r.termRisk)}
                </span>
                <span className="tabular-nums text-sm font-medium text-gray-700 dark:text-gray-200">{r.waitingDays}g</span>
                <span className="tabular-nums text-sm text-gray-600 dark:text-gray-300">{r.suggestedScore}</span>
                <select
                  className="max-w-[9rem] rounded-lg border-0 bg-gray-100 py-1.5 pl-2 text-[11px] text-gray-900 shadow-neo-in dark:bg-gray-950 dark:text-gray-50"
                  value={r.delayReason}
                  onChange={(e) => updateDelayReason(r.id, e.target.value as DelayReasonCode)}
                >
                  {DELAY_REASON_OPTIONS.map((o) => (
                    <option key={o.value || 'empty'} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {renderMoveBtns(r.id)}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {viewMode === 'gallery' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r, idx) => {
            const imgSrc = pickDemoImageForRow(demoImageUrls, idx)
            return (
            <div
              key={r.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-neo-out dark:bg-gray-900/85"
            >
              <div className="relative h-36 overflow-hidden bg-gray-200/60 dark:bg-gray-800/60">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={t('pendingPriority.imageAlt', { code: r.orderNo })}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-gray-200/90 to-gray-100 dark:from-gray-800 dark:to-gray-950" />
                )}
                <span className="absolute left-3 top-3 z-10 rounded-full bg-gray-900/90 px-2 py-0.5 font-mono text-[11px] font-bold text-white backdrop-blur-[2px] dark:bg-gray-100/90 dark:text-gray-900">
                  #{r.rank}
                </span>
                <span
                  className={`absolute right-3 top-3 z-10 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-neo-out-sm ${termRiskClass(r.termRisk)}`}
                >
                  {termRiskLabel(r.termRisk)}
                </span>
                <p className="absolute bottom-2 left-3 right-3 z-10 truncate rounded bg-gray-900/55 px-2 py-0.5 font-mono text-xs font-semibold text-white backdrop-blur-sm dark:bg-gray-950/55 dark:text-gray-50">
                  {r.orderNo}
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-50">{r.part}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {t('pendingPriority.galleryMeta', {
                    wait: String(r.waitingDays),
                    score: String(r.suggestedScore),
                    line: r.lineLabel,
                  })}
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-gray-200/80 pt-3 dark:border-gray-700/80">
                  <input
                    type="checkbox"
                    className="size-4 rounded accent-gray-800"
                    checked={selectedIds.has(r.id)}
                    onChange={() => toggleSelect(r.id)}
                    aria-label={t('pendingPriority.select')}
                  />
                  {renderMoveBtns(r.id)}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      ) : null}

      {viewMode === 'table' ? (
        <div className="min-h-0 flex-1 overflow-auto rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-900/80">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-gray-100/95 text-xs uppercase tracking-wide text-gray-500 backdrop-blur dark:bg-gray-900/95 dark:text-gray-400">
              <tr>
                <th className="w-10 px-2 py-2.5 font-semibold">
                  <span className="sr-only">{t('pendingPriority.select')}</span>
                </th>
                <th className="px-2 py-2.5 font-semibold">#</th>
                {tableCols.thumb ? (
                  <th className="w-14 px-1 py-2.5 font-semibold">{t('pendingPriority.colThumb')}</th>
                ) : null}
                {tableCols.order ? (
                  <th className="px-2 py-2.5 font-semibold">{t('pendingPriority.colOrder')}</th>
                ) : null}
                {tableCols.part ? (
                  <th className="px-2 py-2.5 font-semibold">{t('pendingPriority.colPart')}</th>
                ) : null}
                {tableCols.wait ? (
                  <th className="px-2 py-2.5 font-semibold">{t('pendingPriority.colWait')}</th>
                ) : null}
                {tableCols.risk ? (
                  <th className="px-2 py-2.5 font-semibold">{t('pendingPriority.colRisk')}</th>
                ) : null}
                {tableCols.score ? (
                  <th className="px-2 py-2.5 font-semibold">{t('pendingPriority.colScore')}</th>
                ) : null}
                {tableCols.line ? (
                  <th className="px-2 py-2.5 font-semibold">{t('pendingPriority.colLine')}</th>
                ) : null}
                {tableCols.project ? (
                  <th className="px-2 py-2.5 font-semibold">{t('pendingPriority.colProject')}</th>
                ) : null}
                {tableCols.delay ? (
                  <th className="min-w-[8rem] px-2 py-2.5 font-semibold">{t('pendingPriority.colDelay')}</th>
                ) : null}
                {tableCols.move ? (
                  <th className="px-2 py-2.5 font-semibold">{t('pendingPriority.colMove')}</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const thumbSrc = pickDemoImageForRow(demoImageUrls, idx)
                return (
                <tr
                  key={r.id}
                  className="border-b border-gray-200/80 transition hover:bg-gray-50/90 dark:border-gray-700/80 dark:hover:bg-gray-950/60"
                >
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      className="size-4 rounded accent-gray-800 dark:accent-gray-200"
                      checked={selectedIds.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                    />
                  </td>
                  <td className="px-2 py-2 tabular-nums text-gray-700 dark:text-gray-200">{r.rank}</td>
                  {tableCols.thumb ? (
                    <td className="px-1 py-1.5 align-middle">
                      <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-gray-200 shadow-neo-in dark:bg-gray-800">
                        {thumbSrc ? (
                          <img
                            src={thumbSrc}
                            alt={t('pendingPriority.imageAlt', { code: r.orderNo })}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-300/70 dark:bg-gray-700/70" aria-hidden />
                        )}
                      </div>
                    </td>
                  ) : null}
                  {tableCols.order ? (
                    <td className="whitespace-nowrap px-2 py-2 font-mono text-xs font-semibold text-gray-900 dark:text-gray-50">
                      {r.orderNo}
                    </td>
                  ) : null}
                  {tableCols.part ? (
                    <td className="max-w-[10rem] truncate px-2 py-2 text-gray-800 dark:text-gray-100">{r.part}</td>
                  ) : null}
                  {tableCols.wait ? (
                    <td className="px-2 py-2 tabular-nums text-gray-700 dark:text-gray-200">{r.waitingDays}</td>
                  ) : null}
                  {tableCols.risk ? (
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${termRiskClass(r.termRisk)}`}
                      >
                        {termRiskLabel(r.termRisk)}
                      </span>
                    </td>
                  ) : null}
                  {tableCols.score ? (
                    <td className="px-2 py-2 tabular-nums font-medium text-gray-800 dark:text-gray-100">
                      {r.suggestedScore}
                    </td>
                  ) : null}
                  {tableCols.line ? (
                    <td className="whitespace-nowrap px-2 py-2 text-xs text-gray-700 dark:text-gray-200">{r.lineLabel}</td>
                  ) : null}
                  {tableCols.project ? (
                    <td className="max-w-[8rem] truncate px-2 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">
                      {r.project}
                    </td>
                  ) : null}
                  {tableCols.delay ? (
                    <td className="px-2 py-2">
                      <select
                        className="w-full min-w-[7rem] rounded-lg border-0 bg-gray-50 py-1.5 pl-2 text-[11px] text-gray-900 shadow-neo-in dark:bg-gray-950 dark:text-gray-50"
                        value={r.delayReason}
                        onChange={(e) => updateDelayReason(r.id, e.target.value as DelayReasonCode)}
                      >
                        {DELAY_REASON_OPTIONS.map((o) => (
                          <option key={o.value || 'empty'} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  ) : null}
                  {tableCols.move ? (
                    <td className="whitespace-nowrap px-2 py-2">{renderMoveBtns(r.id)}</td>
                  ) : null}
                </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">{t('pendingPriority.empty')}</p>
          ) : null}
        </div>
      ) : null}

      {(viewMode === 'icon' || viewMode === 'list' || viewMode === 'gallery') && filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/90 p-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-950/50 dark:text-gray-400">
          {t('pendingPriority.empty')}
        </p>
      ) : null}

      {/* 00c — seçim şeridi (P1) */}
      {selectedIds.size > 0 ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-[90] border-t border-gray-200/90 bg-gray-100/95 px-4 py-3 shadow-neo-out backdrop-blur dark:border-gray-700 dark:bg-gray-900/95"
          role="region"
          aria-label={t('pendingPriority.selectionBarAria')}
        >
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {t('pendingPriority.selectionBar', { n: String(selectedIds.size) })}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
                onClick={clearSelection}
              >
                <span className="inline-flex items-center gap-1">
                  <X className="size-4" aria-hidden />
                  {t('pendingPriority.clearSelection')}
                </span>
              </button>
              <button
                type="button"
                disabled={!canReorder}
                onClick={bulkRaise}
                className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 disabled:opacity-40 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
              >
                {t('pendingPriority.bulkRaise')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className={`fixed left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-gray-200/90 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 shadow-neo-out dark:border-gray-600 dark:bg-gray-900 dark:text-gray-50 ${
            selectedIds.size > 0 ? 'bottom-24' : 'bottom-6'
          }`}
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
