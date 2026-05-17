import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronsLeftRight, ChevronRight, Filter, GripVertical, X } from 'lucide-react'
import {
  lineTotal,
  quotes as allQuotes,
  statusLabel,
  type Quote,
  type QuoteStatus,
} from '../../data/quotesMock'
import { activeModuleIdFromPathname } from '../../data/navigation'
import { useI18n } from '../../i18n/I18nProvider'
import { useThemeMode } from '../../theme/ThemeProvider'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'
import { eiSplitFilterToggleClass } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { SplitListPaginationNav } from '../shared/SplitListPaginationNav'

type Props = {
  onNavigate?: (moduleId: string) => void
  /** Müşteri detayında: üst breadcrumb ve dış yuvarlak kaldırılır */
  embedded?: boolean
  /** Doluysa yalnızca bu müşteri adına ait teklifler listelenir */
  customerName?: string | null
  /** Örn. crm:detail:c1:quotes — split, seçim ve filtre durumu */
  storageKeyPrefix?: string
}

const QUOTE_LIST_PAGE_SIZE = 6
const QUOTE_DEFAULT_SPLIT_RATIO = 40

const detailTabDefs = [
  { id: 'ozet', label: 'Özet' },
  { id: 'kalemler', label: 'Kalemler' },
  { id: 'onay', label: 'Onay geçmişi' },
  { id: 'surumler', label: 'Sürümler' },
  { id: 'dokumanlar', label: 'Dokümanlar' },
  { id: 'notlar', label: 'Notlar' },
] as const

type DetailTabId = (typeof detailTabDefs)[number]['id']

const ALL_STATUSES: QuoteStatus[] = ['taslak', 'onay_bekliyor', 'onayli', 'red']

function statusPill(status: QuoteStatus) {
  const base = 'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1'
  switch (status) {
    case 'taslak':
      return `${base} bg-white/35 text-slate-800 ring-white/35 dark:bg-white/12 dark:text-slate-100`
    case 'onay_bekliyor':
      return `${base} bg-amber-200/50 text-amber-900 ring-amber-300/60 dark:bg-amber-400/20 dark:text-amber-100`
    case 'onayli':
      return `${base} bg-emerald-200/55 text-emerald-900 ring-emerald-300/60 dark:bg-emerald-400/20 dark:text-emerald-100`
    case 'red':
      return `${base} bg-red-200/45 text-red-900 ring-red-300/70 dark:bg-red-400/15 dark:text-red-200`
  }
}

function formatMoney(n: number, currency: string) {
  try {
    return `${currency}${n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
  } catch {
    return `${currency}${n}`
  }
}

function totalFromLines(quote: Quote) {
  let sum = 0
  for (const line of quote.lines) {
    const t = lineTotal(line)
    if (t == null) continue
    sum += t
  }
  return sum
}

type QuotePersist = {
  selectedId?: string
  splitRatio?: number
  pageSize?: number
  detailTab?: DetailTabId
  statusFilter?: QuoteStatus[]
  searchQuery?: string
  filtersOpen?: boolean
  listPage?: number
}

export function QuoteModuleView({
  onNavigate: _onNavigate,
  embedded = false,
  customerName = null,
  storageKeyPrefix,
}: Props) {
  void _onNavigate
  const { t } = useI18n()
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const navigate = useNavigate()
  const location = useLocation()
  const neutralShell = activeModuleIdFromPathname(location.pathname) === 'project'
  const detailPanelRef = useRef<HTMLElement | null>(null)
  const persistKey = storageKeyPrefix ? `${storageKeyPrefix}:state` : null

  const rows = useMemo(() => {
    if (!customerName) return allQuotes
    return allQuotes.filter((q) => q.customer === customerName)
  }, [customerName])

  const firstId = rows[0]?.id ?? allQuotes[0]!.id

  const [selectedId, setSelectedId] = useState(firstId)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<QuoteStatus[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [detailTab, setDetailTab] = useState<DetailTabId>('ozet')
  const [listPage, setListPage] = useState(1)
  const pageSize = QUOTE_LIST_PAGE_SIZE
  const [splitRatio, setSplitRatio] = useState(QUOTE_DEFAULT_SPLIT_RATIO)
  const [isResizing, setIsResizing] = useState(false)
  const [isResizerHover, setIsResizerHover] = useState(false)
  const [persistHydrated, setPersistHydrated] = useState(!persistKey)
  const listRef = useRef<HTMLUListElement | null>(null)
  const splitRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!persistKey) {
      setPersistHydrated(true)
      return
    }
    try {
      const raw = sessionStorage.getItem(persistKey)
      if (raw) {
        const p = JSON.parse(raw) as QuotePersist
        if (typeof p.splitRatio === 'number') setSplitRatio(Math.min(55, Math.max(30, p.splitRatio)))
        if (p.detailTab && detailTabDefs.some((d) => d.id === p.detailTab)) setDetailTab(p.detailTab)
        if (Array.isArray(p.statusFilter)) setStatusFilter(p.statusFilter)
        if (typeof p.searchQuery === 'string') setSearchQuery(p.searchQuery)
        if (typeof p.filtersOpen === 'boolean') setFiltersOpen(p.filtersOpen)
        if (typeof p.listPage === 'number' && p.listPage > 0) setListPage(p.listPage)
        if (typeof p.selectedId === 'string') setSelectedId(p.selectedId)
      }
    } catch {
      /* ignore */
    }
    setPersistHydrated(true)
  }, [persistKey])

  const activeFilterCount = statusFilter.length + (searchQuery.trim() ? 1 : 0)

  const filtered = useMemo(() => {
    const base = !statusFilter.length ? rows : rows.filter((r) => statusFilter.includes(r.status))
    const q = searchQuery.trim().toLowerCase()
    if (!q) return base
    return base.filter((r) =>
      `${r.number} ${r.customer} ${r.project} ${r.id}`.toLowerCase().includes(q),
    )
  }, [rows, statusFilter, searchQuery])

  const listPageCount = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / pageSize)),
    [filtered.length, pageSize],
  )
  const safeListPage = Math.min(listPage, listPageCount)
  const visibleQuotes = useMemo(
    () => filtered.slice((safeListPage - 1) * pageSize, safeListPage * pageSize),
    [filtered, pageSize, safeListPage],
  )
  const listPageStart = filtered.length === 0 ? 0 : (safeListPage - 1) * pageSize + 1
  const listPageEnd = Math.min(filtered.length, safeListPage * pageSize)

  useEffect(() => {
    if (!persistKey || !persistHydrated) return
    const p: QuotePersist = {
      selectedId,
      splitRatio,
      detailTab,
      statusFilter,
      searchQuery,
      filtersOpen,
      listPage: safeListPage,
    }
    sessionStorage.setItem(persistKey, JSON.stringify(p))
  }, [
    persistHydrated,
    persistKey,
    selectedId,
    splitRatio,
    detailTab,
    statusFilter,
    searchQuery,
    filtersOpen,
    safeListPage,
  ])

  useEffect(() => {
    if (!rows.length) return
    setSelectedId((prev) => (rows.some((r) => r.id === prev) ? prev : rows[0]!.id))
  }, [rows])

  useEffect(() => {
    setListPage(1)
  }, [statusFilter, searchQuery, pageSize])

  useEffect(() => {
    setListPage((p) => Math.min(p, listPageCount))
  }, [listPageCount])

  useEffect(() => {
    if (filtered.length === 0) return
    if (!filtered.some((c) => c.id === selectedId)) {
      setSelectedId(filtered[0]!.id)
    }
  }, [filtered, selectedId])

  const selected = useMemo(
    () =>
      filtered.length ? (filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null) : null,
    [filtered, selectedId],
  )

  useEffect(() => {
    if (!detailPanelRef.current) return
    detailPanelRef.current.scrollTo({ top: 0, behavior: 'auto' })
  }, [detailTab, selected?.id])

  useEffect(() => {
    if (!filtersOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [filtersOpen])

  useEffect(() => {
    if (!isResizing) return
    const onMouseMove = (event: MouseEvent) => {
      const host = splitRef.current
      if (!host) return
      const rect = host.getBoundingClientRect()
      if (rect.width <= 0) return
      const next = ((event.clientX - rect.left) / rect.width) * 100
      setSplitRatio(Math.min(55, Math.max(30, Number(next.toFixed(2)))))
    }
    const onMouseUp = () => setIsResizing(false)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isResizing])

  const scrollPanelTop = () => {
    requestAnimationFrame(() => {
      detailPanelRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    })
  }

  const clearListFilters = () => {
    setSearchQuery('')
    setStatusFilter([])
    setListPage(1)
  }

  const toggleStatus = (s: QuoteStatus) => {
    setListPage(1)
    setStatusFilter((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const breadcrumbNav = !embedded ? (
    <div className="px-[0.6875rem] py-1">
      <nav aria-label={t('project.breadcrumbAria')} className="mb-0">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <li>
            <Link
              to="/planlama"
              className="font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400"
            >
              {t('nav.sidebar.section.planning')}
            </Link>
          </li>
          <li className="flex items-center gap-1" aria-hidden>
            <ChevronRight className="size-3.5 shrink-0 opacity-70" />
          </li>
          <li className="font-semibold text-slate-800 dark:text-slate-100" aria-current="page">
            {t('nav.quote')}
          </li>
        </ol>
      </nav>
    </div>
  ) : null

  if (rows.length === 0) {
    return (
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden ${embedded ? 'h-full justify-center' : 'gap-2 rounded-[1.25rem]'}`}
      >
        {breadcrumbNav}
        <p className="rounded-xl border border-slate-200/50 bg-white/55 px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-700/50 dark:bg-slate-900/35 dark:text-slate-300">
          {customerName
            ? 'Bu müşteri için teklif listesinde kayıt yok (mock).'
            : 'Teklif listesi boş (mock).'}
        </p>
      </div>
    )
  }

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${embedded ? 'h-full min-h-0 gap-0' : 'gap-2 rounded-[1.25rem]'}`}
    >
      <div
        className={`grid min-h-0 flex-1 ${embedded ? 'grid-rows-[minmax(0,1fr)]' : 'grid-rows-[auto_minmax(0,1fr)]'} gap-2`}
      >
        {breadcrumbNav}

        <div
          className={
            embedded
              ? 'flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
              : 'min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5'
          }
        >
          <div
            ref={splitRef}
            data-split-dragging={isResizing ? 'true' : undefined}
            className={['relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden', gl ? 'gap-3 rounded-3xl lg:gap-4' : 'gap-0'].join(
              ' ',
            )}
          >
            <section
              className={[
                'okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden',
                gl ? 'glass-card glass-card--static project-mgmt-split-panel min-h-0' : 'p-3',
              ].join(' ')}
              style={{ width: `calc(${splitRatio}% - 5px)` }}
            >
              <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
                <h2
                  className={[
                    'min-w-0 shrink-0 text-sm font-semibold sm:text-base',
                    gl ? 'text-black dark:text-white' : 'text-slate-900 dark:text-slate-50',
                  ].join(' ')}
                >
                  {embedded ? 'Teklif listesi' : 'Teklif & Keşif'}
                </h2>
                <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                  <FilterToolbarSearch
                    id="quote-list-inline-search"
                    value={searchQuery}
                    onValueChange={(v) => {
                      setSearchQuery(v)
                      setListPage(1)
                    }}
                    placeholder="Teklif no, müşteri, proje..."
                    ariaLabel="Tekliflerde ara"
                    className={['min-w-0 sm:max-w-[14rem]', gl ? 'project-mgmt-toolbar-search' : ''].filter(Boolean).join(' ')}
                    inputClassName={gl ? 'glass-input' : undefined}
                  />
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFiltersOpen((v) => !v)}
                      aria-expanded={filtersOpen}
                      className={eiSplitFilterToggleClass(filtersOpen)}
                    >
                      <Filter className="size-3.5 shrink-0" aria-hidden />
                      Filtrele
                      {activeFilterCount > 0 ? (
                        <span
                          className={
                            gl
                              ? 'rounded-full bg-black/8 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-black dark:bg-white/10 dark:text-white'
                              : neutralShell
                                ? 'rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-black dark:bg-white/10 dark:text-white'
                                : 'rounded-full bg-black/12 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-black dark:bg-white/12 dark:text-white'
                          }
                        >
                          {activeFilterCount}
                        </span>
                      ) : null}
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative min-h-0 flex-1 overflow-hidden">
                <aside
                  className={[
                    'absolute inset-y-0 left-0 z-20 w-72 overflow-y-auto shadow-xl backdrop-blur-sm transition-transform duration-150 ease-out',
                    gl
                      ? 'glass-card glass-card--static project-mgmt-split-panel project-mgmt-filter-drawer'
                      : 'rounded-xl border border-black/15 bg-white/95 p-3 dark:border-white/12 dark:bg-black/70',
                    filtersOpen ? 'translate-x-0' : '-translate-x-[105%]',
                  ].join(' ')}
                  aria-hidden={!filtersOpen}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-black dark:text-white">Teklif filtreleri</h4>
                      <p className="mt-1 text-[11px] text-black/60 dark:text-white/65">Arama ve durum</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiltersOpen(false)}
                      className={
                        gl
                          ? 'card-button inline-flex size-7 items-center justify-center p-0'
                          : 'inline-flex size-7 items-center justify-center rounded-lg border border-black/20 text-black/80 hover:bg-black/5 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/10'
                      }
                      aria-label="Filtreyi kapat"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="quote-filter-drawer-search"
                        className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80"
                      >
                        Arama
                      </label>
                      <input
                        id="quote-filter-drawer-search"
                        type="search"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setListPage(1)
                        }}
                        placeholder="Teklif no, müşteri, proje..."
                        autoComplete="off"
                        className={
                          gl
                            ? 'glass-input mt-2 w-full'
                            : 'mt-2 w-full rounded-lg border border-black/22 bg-white px-3 py-2.5 text-sm dark:border-white/15 dark:bg-black/80'
                        }
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">Durum</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {ALL_STATUSES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleStatus(s)}
                            className={
                              gl
                                ? ['glass-btn', 'small', statusFilter.includes(s) ? 'primary' : 'secondary'].join(' ')
                                : [
                                    'rounded-full px-3 py-2 text-left text-sm font-semibold leading-snug transition',
                                    statusFilter.includes(s)
                                      ? 'okan-liquid-pill-active text-black dark:text-white'
                                      : 'okan-liquid-btn-secondary',
                                  ].join(' ')
                            }
                          >
                            {statusLabel(s)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-black/15 pt-2 dark:border-white/12">
                    <span className="text-[11px] text-black/75 dark:text-white/80">
                      Sonuç: <span className="tabular-nums font-semibold">{filtered.length}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        clearListFilters()
                        setFiltersOpen(false)
                        requestAnimationFrame(() => {
                          listRef.current?.scrollTo({ top: 0, behavior: 'auto' })
                        })
                      }}
                      className={
                        gl
                          ? ['glass-btn', 'secondary', 'small'].join(' ')
                          : 'rounded-md border border-black/22 px-2 py-1 text-[11px] font-semibold text-black hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10'
                      }
                    >
                      Temizle
                    </button>
                  </div>
                </aside>

                <ul
                  ref={listRef}
                  className="flex h-full min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1 transition-[padding] duration-100 ease-out"
                  style={{ paddingLeft: filtersOpen ? '18.5rem' : '0' }}
                  role="list"
                  aria-label="Teklifler"
                >
                  {visibleQuotes.length > 0 ? (
                    visibleQuotes.map((row) => (
                      <li
                        key={row.id}
                        className={[
                          gl
                            ? [
                                'glass-card',
                                'glass-card--static',
                                'project-mgmt-list-row-card',
                                'list-none',
                                'flex',
                                'min-h-0',
                                'shrink-0',
                                'items-stretch',
                                'gap-1.5',
                              ].join(' ')
                            : 'list-none flex min-h-0 shrink-0 items-stretch gap-1.5 rounded-lg border border-black/15 bg-white/70 px-2 py-1.5 dark:border-white/12 dark:bg-black/45',
                          selected?.id === row.id ? 'okan-project-list-row--active' : '',
                        ].join(' ')}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(row.id)
                            setDetailTab('ozet')
                            scrollPanelTop()
                          }}
                          aria-current={selected?.id === row.id ? 'true' : undefined}
                          className="min-w-0 flex-1 rounded-md px-0.5 py-0.5 text-left transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:hover:bg-white/8"
                        >
                          <p
                            className={
                              gl
                                ? 'font-mono text-sm font-semibold leading-snug text-black dark:text-white'
                                : 'font-mono text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50'
                            }
                          >
                            {row.number}
                          </p>
                          <p
                            className={
                              gl
                                ? 'mt-0.5 truncate text-xs text-black/70 dark:text-white/70'
                                : 'mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400'
                            }
                          >
                            {row.customer}
                          </p>
                          <p className="mt-1.5">
                            <span className={statusPill(row.status)}>{statusLabel(row.status)}</span>
                          </p>
                        </button>
                        <div className="flex shrink-0 flex-col justify-center">
                          <button
                            type="button"
                            title="Tam teklif detayı"
                            onClick={() => navigate(`/teklif-detay/${row.id}`, { state: { fromList: true } })}
                            className={
                              gl
                                ? 'card-button inline-flex items-center gap-0.5 py-1 pl-2 pr-2 text-[11px] font-medium leading-none'
                                : 'inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[11px] font-medium leading-none text-black/55 transition hover:bg-black/8 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:text-white/65 dark:hover:bg-white/8 dark:hover:text-white'
                            }
                          >
                            Detay
                            <ChevronRight className="size-3 opacity-70" strokeWidth={2} aria-hidden />
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li
                      className={
                        gl
                          ? 'glass-card glass-card--static list-none px-3 py-2 text-sm text-black dark:text-white'
                          : 'list-none rounded-lg border border-black/14 bg-white/50 px-3 py-2 text-sm text-black/80 dark:border-white/12 dark:bg-black/45 dark:text-white/85'
                      }
                    >
                      Filtreye uygun teklif bulunamadı.
                    </li>
                  )}
                </ul>
              </div>

              {gl ? (
                <div className="glass-card glass-card--static project-mgmt-footer-panel sticky bottom-0 z-10 mt-2 shrink-0 text-xs">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <p className="text-black dark:text-white/80">
                      {filtered.length > 0 ? (
                        <>
                          <span className="tabular-nums font-semibold text-black dark:text-white">{listPageStart}</span>-
                          <span className="tabular-nums font-semibold text-black dark:text-white">{listPageEnd}</span> /{' '}
                          <span className="tabular-nums font-semibold text-black dark:text-white">{filtered.length}</span> sonuç
                        </>
                      ) : (
                        'Sonuç yok'
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {filtered.length > 0 ? (
                        <SplitListPaginationNav
                          safePage={safeListPage}
                          pageCount={listPageCount}
                          onPrev={() => setListPage((p) => Math.max(1, p - 1))}
                          onNext={() => setListPage((p) => Math.min(listPageCount, p + 1))}
                          gl
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sticky bottom-0 z-10 mt-1 shrink-0 border-t border-black/15 bg-white/90 pt-2 text-xs backdrop-blur dark:border-white/12 dark:bg-black/75">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <p className="text-black/75 dark:text-white/80">
                      {filtered.length > 0 ? (
                        <>
                          <span className="tabular-nums font-semibold text-black dark:text-white">{listPageStart}</span>-
                          <span className="tabular-nums font-semibold text-black dark:text-white">{listPageEnd}</span> /{' '}
                          <span className="tabular-nums font-semibold text-black dark:text-white">{filtered.length}</span> sonuç
                        </>
                      ) : (
                        'Sonuç yok'
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {filtered.length > 0 ? (
                        <SplitListPaginationNav
                          safePage={safeListPage}
                          pageCount={listPageCount}
                          onPrev={() => setListPage((p) => Math.max(1, p - 1))}
                          onNext={() => setListPage((p) => Math.min(listPageCount, p + 1))}
                          buttonStyle="legacy"
                          pageIndicatorClassName="tabular-nums text-black/70 dark:text-white/75"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <div className="relative z-10 mx-1 hidden w-2 shrink-0 cursor-col-resize lg:flex">
              <button
                type="button"
                aria-label="Paneller arası genişliği ayarla"
                title="Çift tıklayarak varsayılan sütun genişliğine dön"
                onMouseDown={() => setIsResizing(true)}
                onDoubleClick={(e) => {
                  e.preventDefault()
                  setIsResizing(false)
                  setSplitRatio(QUOTE_DEFAULT_SPLIT_RATIO)
                }}
                onMouseEnter={() => setIsResizerHover(true)}
                onMouseLeave={() => setIsResizerHover(false)}
                className={[
                  'group absolute inset-y-3 left-1/2 -translate-x-1/2 rounded-full border transition',
                  isResizing || isResizerHover
                    ? gl
                      ? 'w-6 border-black/35 bg-black/12 dark:border-white/18 dark:bg-black/60'
                      : neutralShell
                        ? 'w-6 border-black/35 bg-black/12 dark:border-white/18 dark:bg-black/60'
                        : 'w-6 border-black/25 bg-black/8 dark:border-white/20 dark:bg-black/50'
                    : 'w-3 border-black/18 bg-white/70 dark:border-white/12 dark:bg-black/55',
                ].join(' ')}
              >
                <span className="pointer-events-none flex h-full items-center justify-center text-black/55 dark:text-white/70">
                  {isResizing || isResizerHover ? <ChevronsLeftRight className="size-3.5" /> : <GripVertical className="size-3.5" />}
                </span>
              </button>
            </div>

            <aside
              ref={detailPanelRef}
              className={
                gl
                  ? 'okan-project-split-aside glass-card glass-card--static project-mgmt-split-panel flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
                  : 'okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2'
              }
            >
              {selected ? (
                <div key={selected.id} className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
                  <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 lg:max-w-3xl">
                    <header
                      className={
                        gl
                          ? 'shrink-0 border-b border-black/12 pb-3 text-center dark:border-white/10'
                          : 'shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10'
                      }
                    >
                      <p
                        className={
                          gl
                            ? 'text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65'
                            : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                        }
                      >
                        Seçili teklif
                      </p>
                      <h3
                        className={
                          gl
                            ? 'mt-1.5 font-mono text-lg font-semibold leading-tight text-black sm:text-xl dark:text-white'
                            : 'mt-1.5 font-mono text-lg font-semibold leading-tight text-slate-900 sm:text-xl dark:text-slate-50'
                        }
                      >
                        {selected.number}
                      </h3>
                      <p
                        className={
                          gl
                            ? 'mt-1 text-sm leading-snug text-black/75 dark:text-white/80'
                            : 'mt-1 text-sm leading-snug text-slate-600 dark:text-slate-300'
                        }
                      >
                        {selected.customer} · {selected.project}
                      </p>
                      <p className="mt-1.5">
                        <span className={statusPill(selected.status)}>{statusLabel(selected.status)}</span>
                        <span
                          className={
                            gl
                              ? 'ms-2 text-sm font-semibold tabular-nums text-black dark:text-white'
                              : 'ms-2 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100'
                          }
                        >
                          {formatMoney(selected.total, selected.currency)}
                        </span>
                      </p>
                    </header>

                    <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-0.5">
                      <div
                        className={
                          gl
                            ? 'glass-nav max-w-full flex-wrap justify-center overflow-x-auto p-0'
                            : 'okan-liquid-pill-track flex max-w-full gap-1 overflow-x-auto rounded-full p-1'
                        }
                        role="tablist"
                        aria-label="Seçili teklif sekmeleri"
                        aria-orientation="horizontal"
                      >
                        {detailTabDefs.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            id={`quote-detail-tab-${tab.id}`}
                            aria-selected={detailTab === tab.id}
                            aria-controls="quote-detail-panel"
                            tabIndex={detailTab === tab.id ? 0 : -1}
                            onClick={() => {
                              setDetailTab(tab.id)
                              scrollPanelTop()
                            }}
                            className={
                              gl
                                ? ['nav-item', 'shrink-0', detailTab === tab.id ? 'active' : ''].filter(Boolean).join(' ')
                                : `shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                                    detailTab === tab.id
                                      ? 'okan-liquid-pill-active okan-project-tab-active text-slate-900 dark:text-slate-50'
                                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
                                  }`
                            }
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      key={detailTab}
                      id="quote-detail-panel"
                      role="tabpanel"
                      aria-labelledby={`quote-detail-tab-${detailTab}`}
                      className={
                        gl
                          ? 'okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-left text-sm text-black dark:text-white sm:px-1'
                          : 'okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-center sm:px-1'
                      }
                    >
                      {detailTab === 'ozet' ? (
                        gl ? (
                          <div className="flex flex-col divide-y divide-black/12 text-sm dark:divide-white/10">
                            <div className="space-y-4 pb-4 pt-0">
                              {selected.thresholdWarning ? (
                                <p className="max-w-lg text-sm text-amber-900 dark:text-amber-200">{selected.thresholdWarning}</p>
                              ) : null}
                              <dl className="mx-auto grid max-w-sm grid-cols-2 justify-items-start gap-x-6 gap-y-4 text-base sm:max-w-md sm:gap-x-10">
                                <div className="min-w-0">
                                  <dt className="text-xs font-medium text-black/60 dark:text-white/65">Sürüm</dt>
                                  <dd className="mt-0.5 font-medium text-black dark:text-white">{selected.version}</dd>
                                </div>
                                <div className="min-w-0">
                                  <dt className="text-xs font-medium text-black/60 dark:text-white/65">Aktif adım</dt>
                                  <dd className="mt-0.5 font-medium text-black dark:text-white">{selected.activeStepLabel}</dd>
                                </div>
                                <div className="min-w-0">
                                  <dt className="text-xs font-medium text-black/60 dark:text-white/65">Geçerlilik</dt>
                                  <dd className="mt-0.5 font-medium text-black dark:text-white">{selected.validityDate}</dd>
                                </div>
                                <div className="min-w-0">
                                  <dt className="text-xs font-medium text-black/60 dark:text-white/65">Şablon</dt>
                                  <dd className="mt-0.5 text-sm font-medium text-black dark:text-white">
                                    {selected.approvalTemplateName}
                                  </dd>
                                </div>
                              </dl>
                              <p className="max-w-lg text-base leading-relaxed text-black/90 dark:text-white/90">
                                {selected.versionNote || 'Açıklama yok.'}
                              </p>
                              <p className="text-sm text-black/75 dark:text-white/80">
                                Kalem toplamı:{' '}
                                <span className="font-semibold tabular-nums text-black dark:text-white">
                                  {formatMoney(totalFromLines(selected), selected.currency)}
                                </span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col divide-y divide-slate-200/25 dark:divide-white/10">
                            <div className="space-y-4 pb-4 pt-0">
                              {selected.thresholdWarning ? (
                                <p className="mx-auto max-w-lg text-sm text-amber-800 dark:text-amber-200">
                                  {selected.thresholdWarning}
                                </p>
                              ) : null}
                              <dl className="mx-auto grid max-w-sm grid-cols-2 justify-items-center gap-x-6 gap-y-4 text-base sm:max-w-md sm:gap-x-10">
                                <div className="min-w-0">
                                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Sürüm</dt>
                                  <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">{selected.version}</dd>
                                </div>
                                <div className="min-w-0">
                                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Aktif adım</dt>
                                  <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">
                                    {selected.activeStepLabel}
                                  </dd>
                                </div>
                                <div className="min-w-0">
                                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Geçerlilik</dt>
                                  <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">
                                    {selected.validityDate}
                                  </dd>
                                </div>
                                <div className="min-w-0">
                                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Şablon</dt>
                                  <dd className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {selected.approvalTemplateName}
                                  </dd>
                                </div>
                              </dl>
                              <p className="mx-auto max-w-lg text-base leading-relaxed text-slate-700 dark:text-slate-200">
                                {selected.versionNote || 'Açıklama yok.'}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-300">
                                Kalem toplamı:{' '}
                                <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                                  {formatMoney(totalFromLines(selected), selected.currency)}
                                </span>
                              </p>
                            </div>
                          </div>
                        )
                      ) : null}

                      {detailTab === 'kalemler' ? (
                        <div className="text-left">
                          {selected.lines.length === 0 ? (
                            <p className="text-sm text-slate-600 dark:text-slate-300">Teklif kalemi yok.</p>
                          ) : (
                            <ul className="mx-auto max-w-2xl divide-y divide-slate-200/25 dark:divide-white/10" role="list">
                              {selected.lines.map((line) => {
                                const lt = lineTotal(line)
                                return (
                                  <li
                                    key={line.id}
                                    className="flex flex-col gap-1 py-3 text-sm first:pt-0 sm:flex-row sm:items-baseline sm:justify-between"
                                  >
                                    <div className="min-w-0">
                                      <p className="font-mono text-xs font-medium text-slate-900 dark:text-slate-50">
                                        {line.code}
                                      </p>
                                      <p className="text-slate-700 dark:text-slate-200">{line.description}</p>
                                      <p className="text-xs text-slate-500">
                                        {line.qty ?? '—'} {line.unit}
                                      </p>
                                    </div>
                                    <div className="shrink-0 text-right sm:ps-4">
                                      <p className="text-xs text-slate-500">
                                        Birim: {line.unitPrice.toLocaleString('tr-TR')}
                                      </p>
                                      <p className="font-medium tabular-nums text-slate-900 dark:text-slate-50">
                                        {lt != null ? lt.toLocaleString('tr-TR') : '—'}
                                      </p>
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </div>
                      ) : null}

                      {detailTab === 'onay' ? (
                        <div className="text-left">
                          {selected.approvalHistory.length === 0 ? (
                            <p className="text-sm text-slate-600 dark:text-slate-300">Onay geçmişi yok.</p>
                          ) : (
                            <ul className="mx-auto max-w-lg divide-y divide-slate-200/20 text-left dark:divide-white/10">
                              {selected.approvalHistory.map((h) => (
                                <li
                                  key={h.id}
                                  className="flex flex-col gap-0.5 py-3 first:pt-0 sm:flex-row sm:items-start sm:gap-3"
                                >
                                  <span className="w-32 shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                                    {h.when}
                                  </span>
                                  <span className="min-w-0 flex-1 text-sm text-slate-800 dark:text-slate-200">
                                    <span className="font-medium text-slate-900 dark:text-slate-50">{h.action}</span> — {h.actor}{' '}
                                    <span className="text-slate-500">({h.role})</span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : null}

                      {detailTab === 'surumler' ? (
                        <div className="flex flex-col gap-4 text-left sm:mx-auto sm:max-w-lg">
                          {(['v1', 'v2'] as const).map((k) => (
                            <div
                              key={k}
                              className="border-b border-slate-200/25 pb-4 last:border-0 last:pb-0 dark:border-white/10"
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {k}
                              </p>
                              <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">
                                {selected.versionSnapshots[k].versionNote}
                              </p>
                              <p className="mt-2 font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                                {formatMoney(selected.versionSnapshots[k].total, selected.currency)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {detailTab === 'dokumanlar' ? (
                        <ul
                          className={
                            gl
                              ? 'mx-auto max-w-lg divide-y divide-black/12 text-left dark:divide-white/10'
                              : 'mx-auto max-w-lg divide-y divide-slate-200/25 text-left dark:divide-white/10'
                          }
                          role="list"
                        >
                          <li className="flex flex-col items-center gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <span
                              className={
                                gl
                                  ? 'min-w-0 text-center text-sm font-medium text-black sm:text-left dark:text-white'
                                  : 'min-w-0 text-center text-sm font-medium text-slate-800 sm:text-left dark:text-slate-100'
                              }
                            >
                              {selected.number}-teklif.pdf
                            </span>
                            <button
                              type="button"
                              className={
                                gl
                                  ? ['glass-btn', 'secondary', 'small', 'shrink-0'].join(' ')
                                  : 'okan-liquid-btn-secondary shrink-0 px-2.5 py-1.5 text-xs font-semibold'
                              }
                            >
                              Aç
                            </button>
                          </li>
                          <li className="flex flex-col items-center gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <span
                              className={
                                gl
                                  ? 'min-w-0 text-center text-sm font-medium text-black sm:text-left dark:text-white'
                                  : 'min-w-0 text-center text-sm font-medium text-slate-800 sm:text-left dark:text-slate-100'
                              }
                            >
                              {selected.number}-hesap.xlsx
                            </span>
                            <button
                              type="button"
                              className={
                                gl
                                  ? ['glass-btn', 'secondary', 'small', 'shrink-0'].join(' ')
                                  : 'okan-liquid-btn-secondary shrink-0 px-2.5 py-1.5 text-xs font-semibold'
                              }
                            >
                              Aç
                            </button>
                          </li>
                        </ul>
                      ) : null}

                      {detailTab === 'notlar' ? (
                        <div className="text-left text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                          <p>
                            Bu teklif <strong className="text-slate-900 dark:text-slate-50">{selected.version}</strong>{' '}
                            sürümü ile kayıtlı. Aktif adım: {selected.activeStepLabel}.
                          </p>
                          <p className="mt-3 text-slate-600 dark:text-slate-300">
                            İç not: Müşteri tarafından sevkiyat planına göre revizyon ihtimali bulunuyor (mock).
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">Teklif seçin.</p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
