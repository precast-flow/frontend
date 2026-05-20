import {
  Building2,
  ChevronsLeftRight,
  ChevronRight,
  Factory,
  Filter,
  GripVertical,
  Home,
  Route,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { activeModuleIdFromPathname } from '../../data/navigation'
import { crmCustomers, type CrmProjectRow } from '../../data/crmCustomers'
import {
  projectManagementCardsMock,
  type ProjectCardItem,
  type ProjectStatus,
} from '../../data/projectManagementCardsMock'
import { useThemeMode } from '../../theme/ThemeProvider'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import { eiSplitFilterToggleClass } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { SplitListPaginationNav } from '../shared/SplitListPaginationNav'
import { useSplitPaneDrag, useSplitPaneRatio } from '../shared/splitModuleStyles'

const projectStatusLabel: Record<ProjectStatus, string> = {
  planlama: 'Planlama',
  devam: 'Devam',
  riskli: 'Riskli',
  beklemede: 'Beklemede',
  tamamlandi: 'Tamamlandı',
}

const priorityLabel: Record<ProjectCardItem['priority'], string> = {
  dusuk: 'Düşük',
  normal: 'Normal',
  yuksek: 'Yüksek',
  kritik: 'Kritik',
}

type MergedRow = { row: CrmProjectRow; card: ProjectCardItem }

type ProjectTypeMeta = { label: string; icon: typeof Building2 }

function getProjectTypeMeta(row: Pick<ProjectCardItem, 'name' | 'customer'>): ProjectTypeMeta {
  const haystack = `${row.name} ${row.customer}`.toLocaleLowerCase('tr-TR')
  if (haystack.includes('köprü') || haystack.includes('viyadük')) return { label: 'Köprü / Viyadük', icon: Route }
  if (haystack.includes('konut') || haystack.includes('site')) return { label: 'Konut', icon: Home }
  if (haystack.includes('sanayi') || haystack.includes('endustri')) return { label: 'Sanayi Yapısı', icon: Factory }
  return { label: 'Yapı Projesi', icon: Building2 }
}

function getProjectStatusProgress(status: ProjectStatus): number {
  const map: Record<ProjectStatus, number> = {
    planlama: 20,
    devam: 55,
    riskli: 45,
    beklemede: 35,
    tamamlandi: 100,
  }
  return map[status]
}

function getProjectStatusBarClasses(status: ProjectStatus): { track: string; fill: string; text: string } {
  const neutral = {
    track: 'bg-black/12 dark:bg-black/55',
    fill: 'bg-black dark:bg-neutral-200',
    text: 'text-black/80 dark:text-white/80',
  }
  return {
    planlama: neutral,
    devam: neutral,
    riskli: neutral,
    beklemede: neutral,
    tamamlandi: neutral,
  }[status]
}

function parseTrDateOnly(tr: string): number {
  const [day, month, year] = tr.split('.').map(Number)
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1).getTime()
}

function parseUpdatedAt(tr: string): number {
  const datePart = tr.split(' ')[0] ?? ''
  return parseTrDateOnly(datePart)
}

type CommercialTabId = 'ozet' | 'butce' | 'faturalar' | 'riskler'

type ProjectSortMode = 'updated-desc' | 'due-asc' | 'progress-desc' | 'name-asc'

const COMMERCIAL_LIST_PAGE_SIZE = 6

export function CustomerProjectsCommercialPanel({ customerId }: { customerId: string }) {
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const navigate = useNavigate()
  const location = useLocation()
  const neutralShell = activeModuleIdFromPathname(location.pathname) === 'project'

  const customer = useMemo(() => crmCustomers.find((c) => c.id === customerId) ?? null, [customerId])

  const rows = useMemo<MergedRow[]>(() => {
    if (!customer) return []
    return customer.projeler
      .map((p) => {
        const card = projectManagementCardsMock.find((c) => c.id === p.projectCardId) ?? null
        return { row: p, card }
      })
      .filter((x): x is MergedRow => x.card != null)
  }, [customer])

  const [searchQuery, setSearchQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus[]>([])
  const [sortMode, setSortMode] = useState<ProjectSortMode>('updated-desc')
  const [listPage, setListPage] = useState(1)
  const pageSize = COMMERCIAL_LIST_PAGE_SIZE

  const [selectedProjectCardId, setSelectedProjectCardId] = useState(() => rows[0]?.card.id ?? '')
  const [detailTab, setDetailTab] = useState<CommercialTabId>('ozet')
  const {
    isResizing,
    setIsResizing,
    resetRatio,
    leftWidthStyle,
    setRatioFromPointer,
  } = useSplitPaneRatio(`crm-customer-projects:${customerId}`)
  const [isResizerHover, setIsResizerHover] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const splitRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  useSplitPaneDrag(splitRef, { isResizing, setIsResizing, setRatioFromPointer })

  const filteredRows = useMemo(() => {
    let out = rows.slice()
    const q = searchQuery.trim().toLocaleLowerCase('tr-TR')
    if (q) {
      out = out.filter(
        ({ card, row }) =>
          card.name.toLocaleLowerCase('tr-TR').includes(q) ||
          card.code.toLocaleLowerCase('tr-TR').includes(q) ||
          card.owner.toLocaleLowerCase('tr-TR').includes(q) ||
          card.customer.toLocaleLowerCase('tr-TR').includes(q) ||
          row.phase.toLocaleLowerCase('tr-TR').includes(q),
      )
    }
    if (statusFilter.length > 0) {
      out = out.filter(({ card }) => statusFilter.includes(card.status))
    }
    if (sortMode === 'name-asc') {
      out.sort((a, b) => a.card.name.localeCompare(b.card.name, 'tr'))
    } else if (sortMode === 'due-asc') {
      out.sort((a, b) => parseTrDateOnly(a.card.dueDate) - parseTrDateOnly(b.card.dueDate))
    } else if (sortMode === 'progress-desc') {
      out.sort((a, b) => b.card.progress - a.card.progress)
    } else {
      out.sort((a, b) => parseUpdatedAt(b.card.updatedAt) - parseUpdatedAt(a.card.updatedAt))
    }
    return out
  }, [rows, searchQuery, sortMode, statusFilter])

  const activeFilterCount = (searchQuery.trim() ? 1 : 0) + statusFilter.length

  const listPageCount = useMemo(
    () => Math.max(1, Math.ceil(filteredRows.length / pageSize)),
    [filteredRows.length, pageSize],
  )
  const safeListPage = Math.min(listPage, listPageCount)
  const visibleRows = useMemo(
    () => filteredRows.slice((safeListPage - 1) * pageSize, safeListPage * pageSize),
    [filteredRows, pageSize, safeListPage],
  )

  const listPageStart = filteredRows.length === 0 ? 0 : (safeListPage - 1) * pageSize + 1
  const listPageEnd = Math.min(filteredRows.length, safeListPage * pageSize)

  const selectedRow = useMemo(() => {
    if (!filteredRows.length) return null
    return filteredRows.find((r) => r.card.id === selectedProjectCardId) ?? filteredRows[0] ?? null
  }, [filteredRows, selectedProjectCardId])

  const selected = selectedRow?.card ?? null

  useEffect(() => {
    if (!rows.length) return
    if (!rows.some((r) => r.card.id === selectedProjectCardId)) {
      setSelectedProjectCardId(rows[0]!.card.id)
    }
  }, [rows, selectedProjectCardId])

  useEffect(() => {
    if (!filteredRows.length) return
    if (filteredRows.some((r) => r.card.id === selectedProjectCardId)) return
    setSelectedProjectCardId(filteredRows[0]!.card.id)
  }, [filteredRows, selectedProjectCardId])

  useEffect(() => {
    setListPage((p) => Math.min(p, listPageCount))
  }, [listPageCount])

  const scrollPanelTop = () => {
    requestAnimationFrame(() => {
      panelRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    })
  }

  const toggleStatus = (s: ProjectStatus) => {
    setStatusFilter((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
    setListPage(1)
  }

  const clearListFilters = () => {
    setSearchQuery('')
    setStatusFilter([])
    setListPage(1)
  }

  if (!customer) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Müşteri bulunamadı.</p>
  }

  if (rows.length === 0) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Bu müşteriye bağlı proje kartı yok (mock).</p>
  }

  return (
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
        style={leftWidthStyle}
      >
        <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
          <h2 className="min-w-0 shrink-0 text-sm font-semibold text-black dark:text-white sm:text-base">Projeler</h2>
          <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
            <FilterToolbarSearch
              id={`crm-customer-projects-search-${customerId}`}
              value={searchQuery}
              onValueChange={(v) => {
                setSearchQuery(v)
                setListPage(1)
              }}
              placeholder="Proje adı, kod, müşteri, faz..."
              ariaLabel="Müşteri projelerinde ara"
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
                <h4 className="text-sm font-semibold text-black dark:text-white">Proje filtreleri</h4>
                <p className="mt-1 text-[11px] text-black/60 dark:text-white/65">Arama, durum ve sıralama</p>
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
                  htmlFor={`crm-cust-proj-search-${customerId}`}
                  className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80"
                >
                  Arama
                </label>
                <input
                  id={`crm-cust-proj-search-${customerId}`}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setListPage(1)
                  }}
                  placeholder="Proje adı, kod, müşteri, faz..."
                  autoComplete="off"
                  className={
                    gl
                      ? 'glass-input mt-2 w-full'
                      : 'mt-2 w-full rounded-lg border border-black/22 bg-white px-3 py-2.5 text-sm dark:border-white/15 dark:bg-black/80'
                  }
                />
              </div>
              <div>
                <label htmlFor={`crm-cust-proj-sort-${customerId}`} className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">
                  Sıralama
                </label>
                <select
                  id={`crm-cust-proj-sort-${customerId}`}
                  value={sortMode}
                  onChange={(e) => {
                    setSortMode(e.target.value as ProjectSortMode)
                    setListPage(1)
                  }}
                  className={
                    gl
                      ? 'glass-input mt-2 w-full'
                      : 'mt-2 w-full rounded-lg border border-black/22 bg-white px-2 py-1.5 text-xs dark:border-white/15 dark:bg-black/80'
                  }
                >
                  <option value="updated-desc">Son güncelleme (yeni-eski)</option>
                  <option value="due-asc">Termin (yakın-uzak)</option>
                  <option value="progress-desc">İlerleme (yüksek-düşük)</option>
                  <option value="name-asc">Proje adı (A-Z)</option>
                </select>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">Durum</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['planlama', 'devam', 'riskli', 'beklemede', 'tamamlandi'] as ProjectStatus[]).map((s) => (
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
                      {projectStatusLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-black/15 pt-2 dark:border-white/12">
              <span className="text-[11px] text-black/75 dark:text-white/80">
                Sonuç: <span className="tabular-nums font-semibold">{filteredRows.length}</span>
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
            className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto pr-1 transition-[padding] duration-100 ease-out"
            style={{ paddingLeft: filtersOpen ? '18.5rem' : '0' }}
            role="list"
            aria-label="Müşteri projeleri"
          >
            {visibleRows.length > 0 ? (
              visibleRows.map(({ row, card }) => {
                const typeMeta = getProjectTypeMeta(card)
                const TypeIcon = typeMeta.icon
                const statusPct = getProjectStatusProgress(card.status)
                const statusUi = getProjectStatusBarClasses(card.status)
                const st = projectStatusLabel[card.status]
                return (
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
                      selectedProjectCardId === card.id ? 'okan-project-list-row--active' : '',
                    ].join(' ')}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectCardId(card.id)
                        setDetailTab('ozet')
                        scrollPanelTop()
                      }}
                      aria-current={selectedProjectCardId === card.id ? 'true' : undefined}
                      className="min-w-0 flex-1 rounded-md px-0.5 py-0.5 text-left transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:hover:bg-white/8"
                    >
                      <p className="truncate text-sm font-semibold leading-snug text-black dark:text-white">{card.name}</p>
                      <p className="mt-0.5 truncate text-xs text-black/70 dark:text-white/70">
                        {card.code} · {row.phase}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-black/8 px-1.5 py-0.5 text-[10px] font-semibold text-black dark:bg-black/50 dark:text-white/90">
                        <TypeIcon className="size-3" aria-hidden />
                        {typeMeta.label}
                      </p>
                    </button>
                    <div className="flex w-[7.5rem] shrink-0 flex-col justify-center gap-1">
                      <button
                        type="button"
                        title="Proje detayını gör"
                        onClick={() =>
                          navigate(`/proje-detay/${card.id}`, {
                            state: { fromProjectList: true, projectName: card.name },
                          })
                        }
                        className={
                          gl
                            ? 'card-button ml-auto inline-flex items-center gap-0.5 py-1 pl-2 pr-2 text-[11px] font-medium leading-none'
                            : 'ml-auto inline-flex items-center justify-end gap-0.5 rounded-md px-1.5 py-1 text-[11px] font-medium leading-none text-black/55 transition hover:bg-black/8 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:text-white/65 dark:hover:bg-white/8 dark:hover:text-white'
                        }
                      >
                        Detay
                        <ChevronRight className="size-3 opacity-70" strokeWidth={2} aria-hidden />
                      </button>
                      {gl ? (
                        <>
                          <div className="progress-header text-[11px] leading-tight">
                            <span className="min-w-0 truncate">{st}</span>
                            <span className="shrink-0 tabular-nums">{statusPct}%</span>
                          </div>
                          <div
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={statusPct}
                            aria-valuetext={st}
                            className="glass-progress"
                          >
                            <div className="progress-fill" style={{ width: `${statusPct}%` }} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={statusPct}
                            aria-valuetext={st}
                            className={['h-1.5 w-full overflow-hidden rounded-full', statusUi.track].join(' ')}
                          >
                            <span
                              className={['block h-full rounded-full transition-all', statusUi.fill].join(' ')}
                              style={{ width: `${statusPct}%` }}
                            />
                          </div>
                          <span
                            className={['text-right text-[11px] font-semibold leading-none', statusUi.text].join(' ')}
                          >
                            {st}
                          </span>
                        </>
                      )}
                    </div>
                  </li>
                )
              })
            ) : (
              <li
                className={
                  gl
                    ? 'glass-card glass-card--static list-none text-sm text-black dark:text-white'
                    : 'list-none rounded-lg border border-black/14 bg-white/50 px-3 py-2 text-sm text-black/80 dark:border-white/12 dark:bg-black/45 dark:text-white/85'
                }
              >
                Filtreye uygun proje bulunamadı.
              </li>
            )}
          </ul>
        </div>

        {gl ? (
          <div className="glass-card glass-card--static project-mgmt-footer-panel sticky bottom-0 z-10 mt-2 shrink-0 text-xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-black dark:text-white/80">
                {filteredRows.length > 0 ? (
                  <>
                    <span className="tabular-nums font-semibold text-black dark:text-white">{listPageStart}</span>-
                    <span className="tabular-nums font-semibold text-black dark:text-white">{listPageEnd}</span> /{' '}
                    <span className="tabular-nums font-semibold text-black dark:text-white">{filteredRows.length}</span>{' '}
                    sonuç
                  </>
                ) : (
                  'Sonuç yok'
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {filteredRows.length > 0 ? (
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
                {filteredRows.length > 0 ? (
                  <>
                    <span className="tabular-nums font-semibold text-black dark:text-white">{listPageStart}</span>-
                    <span className="tabular-nums font-semibold text-black dark:text-white">{listPageEnd}</span> /{' '}
                    <span className="tabular-nums font-semibold text-black dark:text-white">{filteredRows.length}</span>{' '}
                    sonuç
                  </>
                ) : (
                  'Sonuç yok'
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {filteredRows.length > 0 ? (
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
            resetRatio()
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
            {isResizing || isResizerHover ? (
              <ChevronsLeftRight className="size-3.5" />
            ) : (
              <GripVertical className="size-3.5" />
            )}
          </span>
        </button>
      </div>

      <aside
        ref={panelRef}
        className={
          gl
            ? 'okan-project-split-aside glass-card glass-card--static project-mgmt-split-panel flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
            : 'okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2'
        }
      >
        {selected && selectedRow ? (
          <div key={selectedProjectCardId} className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 lg:max-w-3xl">
              <header className="shrink-0 border-b border-black/12 pb-3 text-center dark:border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">Seçili proje</p>
                <h3 className="mt-1.5 font-mono text-xl font-semibold leading-tight text-black dark:text-white">{selected.code}</h3>
                <p className="mt-1 text-sm leading-snug text-black/75 dark:text-white/80">{selected.name}</p>
                <p className="mt-0.5 text-xs text-black/65 dark:text-white/70">
                  {projectStatusLabel[selected.status]} · Öncelik {priorityLabel[selected.priority]} · Faz {selectedRow.row.phase}
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
                  aria-label="Proje ticari sekmeler"
                >
                  {(
                    [
                      ['ozet', 'Özet'],
                      ['butce', 'Bütçe & sözleşme'],
                      ['faturalar', 'Faturalar'],
                      ['riskler', 'Riskler'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={detailTab === id}
                      onClick={() => {
                        setDetailTab(id)
                        scrollPanelTop()
                      }}
                      className={
                        gl
                          ? ['nav-item', 'shrink-0', detailTab === id ? 'active' : ''].filter(Boolean).join(' ')
                          : `shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 ${
                              detailTab === id
                                ? 'okan-liquid-pill-active okan-project-tab-active text-black dark:text-white'
                                : 'text-black/70 hover:text-black dark:text-white/75 dark:hover:text-white'
                            }`
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                role="tabpanel"
                className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-left sm:px-1"
              >
                {detailTab === 'ozet' ? (
                  gl ? (
                    <div className="flex flex-col divide-y divide-black/12 text-sm dark:divide-white/10">
                      <div className="pb-4 pt-0">
                        <dl className="mx-auto grid max-w-sm grid-cols-2 justify-items-start gap-x-6 gap-y-4 text-base sm:max-w-md sm:gap-x-10">
                          <div className="min-w-0">
                            <dt className="text-xs font-medium text-black/60 dark:text-white/65">Durum</dt>
                            <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">
                              {projectStatusLabel[selected.status]}
                            </dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-xs font-medium text-black/60 dark:text-white/65">Öncelik</dt>
                            <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">
                              {priorityLabel[selected.priority]}
                            </dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-xs font-medium text-black/60 dark:text-white/65">Başlangıç</dt>
                            <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">{selected.startDate}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-xs font-medium text-black/60 dark:text-white/65">Termin</dt>
                            <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">{selected.dueDate}</dd>
                          </div>
                          <div className="min-w-0 sm:col-span-2">
                            <dt className="text-xs font-medium text-black/60 dark:text-white/65">CRM fazı</dt>
                            <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">{selectedRow.row.phase}</dd>
                          </div>
                        </dl>
                      </div>
                      <p className="py-4 text-base leading-relaxed text-black/90 dark:text-white/90">{selected.note}</p>
                      <div className="pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">Sorumlu</p>
                        <p className="mt-2 text-base font-medium text-black dark:text-white">{selected.owner}</p>
                        <p className="mt-1 text-xs text-black/65 dark:text-white/70">Son güncelleme: {selected.updatedAt}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="rounded-lg border border-black/15 bg-white/70 p-3 dark:border-white/12 dark:bg-black/45">
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">Takvim</p>
                        <p className="mt-2 font-medium text-black dark:text-white">
                          {selected.startDate} → {selected.dueDate}
                        </p>
                        <p className="mt-2 text-xs text-black/70 dark:text-white/70">Son güncelleme: {selected.updatedAt}</p>
                      </div>
                      <div className="rounded-lg border border-black/15 bg-white/70 p-3 dark:border-white/12 dark:bg-black/45">
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">Operasyon özeti</p>
                        <p className="mt-1 text-black/90 dark:text-white/90">{selected.note}</p>
                      </div>
                      <div className="rounded-lg border border-black/15 bg-white/70 p-3 dark:border-white/12 dark:bg-black/45">
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">Sorumlu & faz</p>
                        <p className="mt-2 font-medium text-black dark:text-white">{selected.owner}</p>
                        <p className="mt-1 text-xs text-black/70 dark:text-white/70">Faz: {selectedRow.row.phase}</p>
                      </div>
                    </div>
                  )
                ) : null}

                {detailTab === 'butce' ? (
                  gl ? (
                    <div className="flex flex-col gap-3 text-sm">
                      <div className="rounded-xl border border-black/10 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
                          Sözleşme çerçevesi (mock)
                        </p>
                        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div>
                            <dt className="text-[11px] font-medium text-black/50 dark:text-white/55">Sözleşme tutarı</dt>
                            <dd className="mt-1 font-semibold tabular-nums text-black dark:text-white">₺ — (ERP)</dd>
                          </div>
                          <div>
                            <dt className="text-[11px] font-medium text-black/50 dark:text-white/55">Hakediş aşaması</dt>
                            <dd className="mt-1 font-medium text-black dark:text-white">
                              %{selected.progress} ilerlemeye paralel (mock)
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <p className="text-[11px] text-black/60 dark:text-white/65">
                        Bu sekme satış ve finans kullanıcıları içindir; teknik ürün listesi proje detayındaki “Ürün listesi”
                        sekmesindedir.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="rounded-lg border border-black/15 bg-white/70 p-3 dark:border-white/12 dark:bg-black/45">
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                          Sözleşme çerçevesi (mock)
                        </p>
                        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div>
                            <dt className="text-xs text-black/60 dark:text-white/65">Sözleşme tutarı</dt>
                            <dd className="font-semibold tabular-nums text-black dark:text-white">₺ — (ERP)</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-black/60 dark:text-white/65">Hakediş aşaması</dt>
                            <dd className="font-medium text-black dark:text-white">
                              %{selected.progress} ilerlemeye paralel (mock)
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <p className="text-[11px] text-black/60 dark:text-white/65">
                        Bu sekme satış ve finans kullanıcıları içindir; teknik ürün listesi proje detayındaki “Ürün listesi”
                        sekmesindedir.
                      </p>
                    </div>
                  )
                ) : null}

                {detailTab === 'faturalar' ? (
                  <div
                    className={
                      gl
                        ? 'overflow-x-auto rounded-xl border border-black/12 dark:border-white/10'
                        : 'overflow-x-auto rounded-lg border border-black/15 dark:border-white/12'
                    }
                  >
                    <table className="w-full min-w-[320px] text-left text-xs">
                      <thead
                        className={
                          gl
                            ? 'border-b border-black/10 bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.06]'
                            : 'border-b border-black/15 bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.06]'
                        }
                      >
                        <tr>
                          <th className="px-3 py-2 font-semibold text-black/75 dark:text-white/80">Belge</th>
                          <th className="px-3 py-2 font-semibold text-black/75 dark:text-white/80">Tutar</th>
                          <th className="px-3 py-2 font-semibold text-black/75 dark:text-white/80">Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-black/8 dark:border-white/10">
                          <td className="px-3 py-2 text-black dark:text-white">Avans faturası (mock)</td>
                          <td className="px-3 py-2 tabular-nums text-black dark:text-white">—</td>
                          <td className="px-3 py-2 text-black/75 dark:text-white/75">Ödendi</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-black dark:text-white">Hakediş-1 (mock)</td>
                          <td className="px-3 py-2 tabular-nums text-black dark:text-white">—</td>
                          <td className="px-3 py-2 text-black/75 dark:text-white/75">Beklemede</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {detailTab === 'riskler' ? (
                  gl ? (
                    <div className="rounded-xl border border-black/10 bg-white/40 p-4 text-sm dark:border-white/10 dark:bg-white/[0.06]">
                      {selected.status === 'riskli' ? (
                        <p className="font-medium text-amber-900 dark:text-amber-100">
                          Riskli proje: operasyon notu ve termin takibi önceliklidir.
                        </p>
                      ) : (
                        <p className="text-black/85 dark:text-white/85">Kritik risk bayrağı yok (mock).</p>
                      )}
                      <p className="mt-2 text-xs text-black/65 dark:text-white/70">{selected.note}</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-black/15 bg-white/70 p-3 text-sm dark:border-white/12 dark:bg-black/45">
                      {selected.status === 'riskli' ? (
                        <p className="font-medium text-amber-900 dark:text-amber-100">
                          Riskli proje: operasyon notu ve termin takibi önceliklidir.
                        </p>
                      ) : (
                        <p className="text-black/85 dark:text-white/85">Kritik risk bayrağı yok (mock).</p>
                      )}
                      <p className="mt-2 text-xs text-black/70 dark:text-white/70">{selected.note}</p>
                    </div>
                  )
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
            <p className="text-sm text-black/75 dark:text-white/80">
              Filtreye uygun proje yok. Filtreleri temizleyerek tüm projeleri görebilirsiniz.
            </p>
            <button
              type="button"
              onClick={() => {
                clearListFilters()
                setFiltersOpen(false)
              }}
              className={
                gl
                  ? ['glass-btn', 'secondary', 'small', 'px-4', 'py-2', 'text-sm', 'font-semibold'].join(' ')
                  : 'rounded-lg border border-black/22 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5 dark:border-white/15 dark:bg-black/80 dark:text-white dark:hover:bg-white/10'
              }
            >
              Filtreleri temizle
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
