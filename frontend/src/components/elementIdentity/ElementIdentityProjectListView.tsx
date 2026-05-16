import { useEffect, useMemo, useRef, useState } from 'react'
import { Building2, ChevronsLeftRight, ChevronRight, Factory, Filter, GripVertical, Home, Route, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  projectManagementActivitiesMock,
  projectManagementCardsMock,
  type ProjectCardItem,
  type ProjectStatus,
} from '../../data/projectManagementCardsMock'
import { activeModuleIdFromPathname } from '../../data/navigation'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'
import { useI18n } from '../../i18n/I18nProvider'
import { useThemeMode } from '../../theme/ThemeProvider'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import { eiSplitListRowShell, eiTabPill } from './elementIdentitySplitUi'
import { useElementIdentity } from './elementIdentityContextValue'

const VIEW_STATE_KEY = 'element-identity:list:view'

function statusLabel(status: ProjectStatus) {
  if (status === 'planlama') return 'Planlama'
  if (status === 'devam') return 'Devam ediyor'
  if (status === 'riskli') return 'Riskli'
  if (status === 'beklemede') return 'Beklemede'
  return 'Tamamlandi'
}

type ProjectTypeMeta = { label: string; icon: typeof Home }
function getProjectTypeMeta(row: Pick<ProjectCardItem, 'name' | 'customer'>): ProjectTypeMeta {
  const haystack = `${row.name} ${row.customer}`.toLocaleLowerCase('tr-TR')
  if (haystack.includes('köprü') || haystack.includes('viyaduk')) return { label: 'Köprü / Viyadük', icon: Route }
  if (haystack.includes('konut') || haystack.includes('site')) return { label: 'Konut', icon: Home }
  if (haystack.includes('sanayi') || haystack.includes('endustri')) return { label: 'Sanayi Yapısı', icon: Factory }
  return { label: 'Yapı Projesi', icon: Building2 }
}

function getProjectStatusBarClasses(status: ProjectStatus): { track: string; fill: string; text: string } {
  const map: Record<ProjectStatus, { track: string; fill: string; text: string }> = {
    planlama: {
      track: 'bg-violet-200/70 dark:bg-violet-950/45',
      fill: 'bg-violet-500 dark:bg-violet-400',
      text: 'text-violet-800 dark:text-violet-200',
    },
    devam: {
      track: 'bg-sky-200/70 dark:bg-sky-950/45',
      fill: 'bg-sky-500 dark:bg-sky-400',
      text: 'text-sky-900 dark:text-sky-200',
    },
    riskli: {
      track: 'bg-rose-200/70 dark:bg-rose-950/45',
      fill: 'bg-rose-500 dark:bg-rose-400',
      text: 'text-rose-900 dark:text-rose-200',
    },
    beklemede: {
      track: 'bg-amber-200/70 dark:bg-amber-950/45',
      fill: 'bg-amber-500 dark:bg-amber-400',
      text: 'text-amber-900 dark:text-amber-200',
    },
    tamamlandi: {
      track: 'bg-emerald-200/70 dark:bg-emerald-950/45',
      fill: 'bg-emerald-500 dark:bg-emerald-400',
      text: 'text-emerald-900 dark:text-emerald-200',
    },
  }
  return map[status]
}

type DetailTabId = 'ozet' | 'elemanlar' | 'urunler'

export function ElementIdentityProjectListView() {
  const { t } = useI18n()
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const location = useLocation()
  const neutralShell = activeModuleIdFromPathname(location.pathname) === 'element-identity'
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    projectElements,
    projectProducts,
  } = useElementIdentity()

  const splitRef = useRef<HTMLDivElement | null>(null)
  const detailPanelRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  const [splitRatio, setSplitRatio] = useState(() => {
    try {
      const raw = sessionStorage.getItem(VIEW_STATE_KEY)
      if (!raw) return 40
      const v = JSON.parse(raw) as { splitRatio?: number }
      return typeof v.splitRatio === 'number' ? Math.min(55, Math.max(30, v.splitRatio)) : 40
    } catch {
      return 40
    }
  })
  const [isResizing, setIsResizing] = useState(false)
  const [isResizerHover, setIsResizerHover] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [listPage, setListPage] = useState(() => {
    try {
      const raw = sessionStorage.getItem(VIEW_STATE_KEY)
      if (!raw) return 1
      const v = JSON.parse(raw) as { listPage?: number }
      return typeof v.listPage === 'number' && v.listPage > 0 ? v.listPage : 1
    } catch {
      return 1
    }
  })
  const [pageSize, setPageSize] = useState(() => {
    try {
      const raw = sessionStorage.getItem(VIEW_STATE_KEY)
      if (!raw) return 4
      const v = JSON.parse(raw) as { pageSize?: number }
      const n = Number(v.pageSize)
      return [4, 6, 8, 10, 15].includes(n) ? n : 4
    } catch {
      return 4
    }
  })
  const [detailTab, setDetailTab] = useState<DetailTabId>(() => {
    try {
      const raw = sessionStorage.getItem(VIEW_STATE_KEY)
      if (!raw) return 'ozet'
      const v = JSON.parse(raw) as { detailTab?: DetailTabId }
      return v.detailTab ?? 'ozet'
    } catch {
      return 'ozet'
    }
  })

  const selectedId = activeProjectId

  const enriched = useMemo(() => {
    return projects.map((p) => {
      const card = projectManagementCardsMock.find((c) => c.id === p.id)
      return { lite: p, card: card ?? null }
    })
  }, [projects])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('tr-TR')
    if (!q) return enriched
    return enriched.filter(({ lite, card }) => {
      const name = (card?.name ?? lite.name ?? '').toLocaleLowerCase('tr-TR')
      const code = lite.code.toLocaleLowerCase('tr-TR')
      const customer = (card?.customer ?? lite.customer ?? '').toLocaleLowerCase('tr-TR')
      return name.includes(q) || code.includes(q) || customer.includes(q)
    })
  }, [enriched, searchQuery])

  const listPageCount = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / pageSize)),
    [filtered.length, pageSize],
  )
  const safeListPage = Math.min(listPage, listPageCount)
  const visibleProjects = useMemo(() => {
    const start = (safeListPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, pageSize, safeListPage])
  const listPageStart = filtered.length === 0 ? 0 : (safeListPage - 1) * pageSize + 1
  const listPageEnd = Math.min(filtered.length, safeListPage * pageSize)

  const selected = useMemo(() => {
    return filtered.find((x) => x.lite.id === selectedId)?.lite ?? filtered[0]?.lite ?? projects[0]
  }, [filtered, selectedId, projects])

  useEffect(() => {
    if (filtered.length === 0) return
    if (!filtered.some((x) => x.lite.id === activeProjectId)) {
      setActiveProjectId(filtered[0]!.lite.id)
    }
  }, [filtered, activeProjectId, setActiveProjectId])

  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }, [safeListPage, pageSize])

  const selectedCard = useMemo(
    () => projectManagementCardsMock.find((c) => c.id === selected?.id) ?? null,
    [selected?.id],
  )

  const counts = useMemo(() => {
    const el = new Map<string, number>()
    const pr = new Map<string, number>()
    for (const e of projectElements) el.set(e.projectId, (el.get(e.projectId) ?? 0) + 1)
    for (const p of projectProducts) pr.set(p.projectId, (pr.get(p.projectId) ?? 0) + 1)
    return { el, pr }
  }, [projectElements, projectProducts])

  const elsForSelected = useMemo(
    () => projectElements.filter((e) => e.projectId === selected?.id).slice(-8).reverse(),
    [projectElements, selected?.id],
  )
  const prdForSelected = useMemo(
    () =>
      projectProducts
        .filter((p) => p.projectId === selected?.id && p.status === 'active')
        .slice(-8)
        .reverse(),
    [projectProducts, selected?.id],
  )

  const activitiesForSelected = useMemo(
    () => projectManagementActivitiesMock.filter((a) => a.projectId === selected?.id).slice(0, 5),
    [selected?.id],
  )

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

  useEffect(() => {
    if (!filtersOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [filtersOpen])

  useEffect(() => {
    if (!detailPanelRef.current) return
    detailPanelRef.current.scrollTo({ top: 0, behavior: 'auto' })
  }, [detailTab, selectedId])

  useEffect(() => {
    try {
      sessionStorage.setItem(
        VIEW_STATE_KEY,
        JSON.stringify({
          splitRatio,
          detailTab,
          selectedId: activeProjectId,
          listPage: safeListPage,
          pageSize,
        }),
      )
    } catch {
      /* ignore */
    }
  }, [splitRatio, detailTab, activeProjectId, safeListPage, pageSize])

  const activeFilterCount = searchQuery.trim() ? 1 : 0

  return (
    <div
      className="project-mgmt-glass-light flex min-h-0 flex-1 flex-col gap-0 overflow-hidden rounded-3xl"
      data-neutral-shell={neutralShell ? 'true' : undefined}
    >
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-1">
        <div className="px-[0.6875rem] pt-0 pb-0.5">
          <nav aria-label={t('project.breadcrumbAria')} className="mb-0">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-black/60 dark:text-white/65">
              <li>
                <Link
                  to="/tanimlar"
                  className="font-medium text-black/75 underline-offset-2 transition hover:text-black hover:underline dark:text-white/75 dark:hover:text-white"
                >
                  {t('elementIdentity.detail.breadcrumbHub')}
                </Link>
              </li>
              <li className="flex items-center gap-1" aria-hidden>
                <ChevronRight className="size-3.5 shrink-0 opacity-70" />
              </li>
              <li className="font-semibold text-black dark:text-white" aria-current="page">
                {t('nav.elementIdentity')}
              </li>
            </ol>
          </nav>
        </div>

        <div
          className={[
            'min-h-0 overflow-hidden',
            gl
              ? 'flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-3xl bg-transparent p-1 md:p-1.5'
              : 'rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5',
          ].join(' ')}
        >
          <div
            ref={splitRef}
            data-split-dragging={isResizing ? 'true' : undefined}
            className={[
              'relative flex h-full min-h-0 min-w-0 overflow-hidden',
              gl ? 'gap-3 rounded-3xl lg:gap-4' : 'gap-0',
            ].join(' ')}
          >
            <section
              className={[
                'okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden',
                gl
                  ? 'glass-card glass-card--static project-mgmt-split-panel min-h-0'
                  : 'p-3',
              ].join(' ')}
              style={{ width: `calc(${splitRatio}% - 5px)` }}
            >
              <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
                <h2 className="min-w-0 shrink-0 text-sm font-semibold text-black dark:text-white sm:text-base">
                  {t('elementIdentity.list.title')}
                </h2>
                <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                  <FilterToolbarSearch
                    id="ei-project-list-search"
                    value={searchQuery}
                    onValueChange={(v) => {
                      setSearchQuery(v)
                      setListPage(1)
                    }}
                    placeholder="Proje adı, kod, müşteri..."
                    ariaLabel={t('elementIdentity.list.searchAria')}
                    className={gl ? 'project-mgmt-toolbar-search' : ''}
                    inputClassName={gl ? 'glass-input' : ''}
                  />
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFiltersOpen((v) => !v)}
                      aria-expanded={filtersOpen}
                      className={
                        gl
                          ? [
                              'glass-btn',
                              'small',
                              'inline-flex',
                              'items-center',
                              'gap-1.5',
                              filtersOpen ? 'outline' : 'secondary',
                            ].join(' ')
                          : [
                              'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25',
                              filtersOpen
                                ? neutralShell
                                  ? 'border-black/35 bg-black/10 text-black dark:border-white/20 dark:bg-black/50 dark:text-white'
                                  : 'border-black/25 bg-black/8 text-black dark:border-white/20 dark:bg-black/45 dark:text-white'
                                : 'border-black/18 bg-white/70 text-black dark:border-white/12 dark:bg-black/40 dark:text-white/90',
                            ].join(' ')
                      }
                    >
                      <Filter className="size-3.5 shrink-0" aria-hidden />
                      Filtrele
                      {activeFilterCount > 0 ? (
                        <span
                          className={
                            gl
                              ? 'rounded-full bg-black/8 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-black'
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

              <div className="flex min-h-0 flex-1 flex-col">
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
                      <h4 className="text-sm font-semibold text-black dark:text-white">Filtreler</h4>
                      <p className="mt-1 text-[11px] text-black/60 dark:text-white/65">Arama</p>
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
                      {gl ? <X className="size-3.5" aria-hidden /> : <span className="text-lg leading-none">×</span>}
                    </button>
                  </div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">
                    Arama
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setListPage(1)
                    }}
                    placeholder="Proje adı, kod, müşteri..."
                    className={
                      gl
                        ? 'glass-input mt-2 w-full'
                        : 'mt-2 w-full rounded-lg border border-black/22 bg-white px-3 py-2.5 text-sm dark:border-white/15 dark:bg-black/80'
                    }
                  />
                  <div className="mt-3 flex items-center justify-between border-t border-black/15 pt-2 dark:border-white/12">
                    <span className="text-[11px] text-black/75 dark:text-white/80">
                      Sonuç: <span className="font-semibold tabular-nums">{filtered.length}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setListPage(1)
                        setFiltersOpen(false)
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
                  aria-label={t('elementIdentity.list.title')}
                >
                  {filtered.length > 0 ? (
                    visibleProjects.map(({ lite, card }) => {
                      const row = card ?? {
                        id: lite.id,
                        code: lite.code,
                        name: lite.name ?? lite.code,
                        customer: lite.customer ?? '—',
                        owner: '—',
                        status: 'planlama' as ProjectStatus,
                        priority: 'normal' as const,
                        updatedAt: '—',
                        startDate: '—',
                        dueDate: '—',
                        progress: 0,
                        note: '',
                      }
                      const typeMeta = getProjectTypeMeta(row)
                      const TypeIcon = typeMeta.icon
                      const statusPct = card ? row.progress : Math.min(100, (counts.el.get(lite.id) ?? 0) * 5)
                      const statusUi = card
                        ? getProjectStatusBarClasses(row.status)
                        : {
                            track: 'bg-slate-200/70 dark:bg-slate-800/60',
                            fill: 'bg-slate-500 dark:bg-slate-400',
                            text: 'text-slate-700 dark:text-slate-200',
                          }
                      const statusText = card ? statusLabel(row.status) : 'Özet'
                      const rowActive = selectedId === lite.id
                      return (
                        <li key={lite.id}>
                          <div className={eiSplitListRowShell(rowActive)}>
                          <div className="flex min-h-0 items-stretch gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveProjectId(lite.id)}
                            aria-current={rowActive ? 'true' : undefined}
                            className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
                          >
                            <p className="truncate text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">
                              {row.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{row.customer}</p>
                            <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-100/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                              <TypeIcon className="size-3" aria-hidden />
                              {typeMeta.label}
                            </p>
                          </button>
                          <div className="flex w-[7.5rem] shrink-0 flex-col justify-center gap-1">
                            <Link
                              to={`/eleman-kimlik/${lite.id}`}
                              state={{ fromElementIdentityList: true }}
                              title={t('elementIdentity.list.detailCta')}
                              className={
                                gl
                                  ? ['glass-btn', 'secondary', 'small', 'ml-auto', 'inline-flex', 'items-center', 'gap-0.5', 'no-underline'].join(' ')
                                  : 'inline-flex items-center justify-end gap-0.5 rounded-lg border border-slate-300 bg-white px-1.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 no-underline dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                              }
                            >
                              {t('elementIdentity.list.detailCta')}
                              <ChevronRight className="size-3 opacity-70" strokeWidth={2} aria-hidden />
                            </Link>
                            {gl ? (
                              <>
                                <div className="progress-header text-[11px] leading-tight">
                                  <span className="min-w-0 truncate">{statusText}</span>
                                  <span className="shrink-0 tabular-nums">{statusPct}%</span>
                                </div>
                                <div
                                  role="progressbar"
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-valuenow={statusPct}
                                  aria-valuetext={statusText}
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
                                  className={['h-1.5 w-full overflow-hidden rounded-full', statusUi.track].join(' ')}
                                >
                                  <span
                                    className={['block h-full rounded-full transition-all', statusUi.fill].join(' ')}
                                    style={{ width: `${statusPct}%` }}
                                  />
                                </div>
                                <span className={['text-right text-[11px] font-semibold leading-none', statusUi.text].join(' ')}>
                                  {statusText}
                                </span>
                              </>
                            )}
                          </div>
                          </div>
                          </div>
                        </li>
                      )
                    })
                  ) : (
                    <li className="rounded-lg border border-dashed border-slate-300/60 bg-white/30 px-3 py-8 text-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/20">
                      Filtreye uygun proje bulunamadı.
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
                          <span className="tabular-nums font-semibold text-black dark:text-white">{listPageEnd}</span>{' '}
                          / <span className="tabular-nums font-semibold text-black dark:text-white">{filtered.length}</span>{' '}
                          sonuç
                        </>
                      ) : (
                        'Sonuç yok'
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {filtered.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={safeListPage <= 1}
                            onClick={() => setListPage((p) => Math.max(1, p - 1))}
                            className={[
                              'glass-btn',
                              'secondary',
                              'small',
                              'disabled:pointer-events-none disabled:opacity-35',
                            ].join(' ')}
                          >
                            Önceki
                          </button>
                          <span className="tabular-nums text-black/80 dark:text-white/75">
                            Sayfa {safeListPage}/{listPageCount}
                          </span>
                          <button
                            type="button"
                            disabled={safeListPage >= listPageCount}
                            onClick={() => setListPage((p) => Math.min(listPageCount, p + 1))}
                            className={[
                              'glass-btn',
                              'secondary',
                              'small',
                              'disabled:pointer-events-none disabled:opacity-35',
                            ].join(' ')}
                          >
                            Sonraki
                          </button>
                        </div>
                      ) : null}
                      <label className="flex items-center gap-1 text-black dark:text-white/80">
                        <span>Sayfa boyutu</span>
                        <select
                          value={pageSize}
                          onChange={(event) => {
                            setPageSize(Number(event.target.value))
                            setListPage(1)
                            requestAnimationFrame(() => {
                              listRef.current?.scrollTo({ top: 0, behavior: 'auto' })
                            })
                          }}
                          className="glass-input px-2 py-1 text-xs"
                        >
                          {[4, 6, 8, 10, 15].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
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
                          <span className="tabular-nums font-semibold text-black dark:text-white">{listPageEnd}</span>{' '}
                          / <span className="tabular-nums font-semibold text-black dark:text-white">{filtered.length}</span>{' '}
                          sonuç
                        </>
                      ) : (
                        'Sonuç yok'
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {filtered.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={safeListPage <= 1}
                            onClick={() => setListPage((p) => Math.max(1, p - 1))}
                            className="rounded-md border border-black/22 bg-white px-2 py-1 text-[11px] font-semibold text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/15 dark:bg-black/80 dark:text-white dark:hover:bg-white/10"
                          >
                            Önceki
                          </button>
                          <span className="tabular-nums text-black/70 dark:text-white/75">
                            Sayfa {safeListPage}/{listPageCount}
                          </span>
                          <button
                            type="button"
                            disabled={safeListPage >= listPageCount}
                            onClick={() => setListPage((p) => Math.min(listPageCount, p + 1))}
                            className="rounded-md border border-black/22 bg-white px-2 py-1 text-[11px] font-semibold text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/15 dark:bg-black/80 dark:text-white dark:hover:bg-white/10"
                          >
                            Sonraki
                          </button>
                        </div>
                      ) : null}
                      <label className="flex items-center gap-1 text-black/75 dark:text-white/80">
                        <span>Sayfa boyutu</span>
                        <select
                          value={pageSize}
                          onChange={(event) => {
                            setPageSize(Number(event.target.value))
                            setListPage(1)
                            requestAnimationFrame(() => {
                              listRef.current?.scrollTo({ top: 0, behavior: 'auto' })
                            })
                          }}
                          className="rounded-md border border-black/22 bg-white px-1.5 py-1 text-xs text-black dark:border-white/15 dark:bg-black/80 dark:text-white"
                        >
                          {[4, 6, 8, 10, 15].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              </div>
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
                  setSplitRatio(40)
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
              ref={detailPanelRef}
              className={
                gl
                  ? 'okan-project-split-aside glass-card glass-card--static project-mgmt-split-panel flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
                  : 'okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2'
              }
            >
              {selected ? (
                <div key={selected.id} className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
                  <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-2xl flex-1 flex-col gap-3 sm:gap-4 lg:max-w-3xl">
                    <header className="flex shrink-0 flex-col items-center border-b border-black/12 pb-3 text-center dark:border-white/10">
                      <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                        Seçili proje
                      </p>
                      <h3 className="mt-1.5 max-w-full px-1 text-xl font-semibold leading-tight text-black dark:text-white">
                        {selectedCard?.name ?? selected.name ?? selected.code}
                      </h3>
                      <p className="mt-1 max-w-full px-1 text-sm leading-snug text-black/75 dark:text-white/80">
                        {(selectedCard?.customer ?? selected.customer) ?? '—'} · {selected.code}
                        {selectedCard ? ` · Sorumlu ${selectedCard.owner}` : ''}
                      </p>
                      <Link
                        to={`/eleman-kimlik/${selected.id}`}
                        state={{ fromElementIdentityList: true }}
                        className={
                          gl
                            ? 'glass-btn secondary small mt-2 inline-flex w-fit max-w-[calc(100%-1rem)] shrink-0 items-center justify-center gap-1'
                            : 'mt-2 inline-flex w-fit max-w-[calc(100%-1rem)] items-center justify-center rounded-md border border-black/22 px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10'
                        }
                      >
                        {t('elementIdentity.list.detailCta')} (tam sayfa)
                      </Link>
                    </header>

                    <div className="sticky top-0 z-10 flex w-full min-w-0 shrink-0 justify-center bg-transparent pt-3">
                      <div
                        className="flex max-w-full gap-1 overflow-x-auto"
                        role="tablist"
                        aria-label="Önizleme sekmeleri"
                        aria-orientation="horizontal"
                      >
                        {(
                          [
                            ['ozet', 'Özet'],
                            ['elemanlar', 'Elemanlar'],
                            ['urunler', 'Ürünler'],
                          ] as const
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={detailTab === id}
                            onClick={() => setDetailTab(id)}
                            className={eiTabPill(detailTab === id)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      key={detailTab}
                      role="tabpanel"
                      className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-1 text-center sm:px-2"
                    >
                      {detailTab === 'ozet' ? (
                        <div className="flex flex-col divide-y divide-black/12 dark:divide-white/10">
                          <div className="pb-4 pt-0">
                            <dl className="mx-auto grid max-w-sm grid-cols-2 justify-items-center gap-x-6 gap-y-4 text-base sm:max-w-md sm:gap-x-10">
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-black/60 dark:text-white/65">
                                  {t('elementIdentity.list.elementsCount')}
                                </dt>
                                <dd className="mt-0.5 font-semibold leading-snug text-black dark:text-white">
                                  {counts.el.get(selected.id) ?? 0}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-black/60 dark:text-white/65">
                                  {t('elementIdentity.list.productsCount')}
                                </dt>
                                <dd className="mt-0.5 font-semibold leading-snug text-black dark:text-white">
                                  {counts.pr.get(selected.id) ?? 0}
                                </dd>
                              </div>
                              {selectedCard ? (
                                <>
                                  <div className="min-w-0">
                                    <dt className="text-xs font-medium text-black/60 dark:text-white/65">Durum</dt>
                                    <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">
                                      {statusLabel(selectedCard.status)}
                                    </dd>
                                  </div>
                                  <div className="min-w-0">
                                    <dt className="text-xs font-medium text-black/60 dark:text-white/65">İlerleme</dt>
                                    <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">
                                      %{selectedCard.progress}
                                    </dd>
                                  </div>
                                </>
                              ) : null}
                            </dl>
                          </div>
                          {selectedCard?.note ? (
                            <p className="py-4 text-base leading-relaxed text-black/90 dark:text-white/90">{selectedCard.note}</p>
                          ) : (
                            <p className="py-4 text-sm text-black/75 dark:text-white/80">
                              Kısa özet için proje kartı kullanılır.
                            </p>
                          )}
                          {activitiesForSelected.length > 0 ? (
                            <div className="pt-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                                Son aktiviteler
                              </p>
                              <ul className="mx-auto mt-3 max-w-lg divide-y divide-black/12 text-left dark:divide-white/10">
                                {activitiesForSelected.map((a) => (
                                  <li
                                    key={a.id}
                                    className="flex justify-center gap-3 py-2.5 text-sm leading-snug text-black/90 first:pt-0 dark:text-white/90 sm:justify-start"
                                  >
                                    <span className="w-14 shrink-0 tabular-nums text-black/60 dark:text-white/65">{a.at}</span>
                                    <span className="min-w-0 flex-1">{a.text}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {detailTab === 'elemanlar' ? (
                        <div className="mx-auto flex w-full max-w-lg flex-col px-0.5 text-left sm:px-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                            Kayıtlı elemanlar (son)
                          </p>
                          {elsForSelected.length === 0 ? (
                            <p className="mt-3 text-sm text-black/75 dark:text-white/80">Henüz eleman yok.</p>
                          ) : (
                            <ul className="mt-3 w-full divide-y divide-black/12 dark:divide-white/10">
                              {elsForSelected.map((el) => (
                                <li key={el.id} className="break-all py-2.5 font-mono text-xs text-black dark:text-white">
                                  {el.instanceMark || el.id}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : null}

                      {detailTab === 'urunler' ? (
                        <div className="mx-auto flex w-full max-w-lg flex-col px-0.5 text-left sm:px-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                            Ürünler (son)
                          </p>
                          {prdForSelected.length === 0 ? (
                            <p className="mt-3 text-sm text-black/75 dark:text-white/80">{t('elementIdentity.products.empty')}</p>
                          ) : (
                            <ul className="mt-3 w-full divide-y divide-black/12 dark:divide-white/10">
                              {prdForSelected.map((p) => (
                                <li key={p.id} className="flex flex-col gap-0.5 py-2.5 text-left text-sm">
                                  <span className="break-all font-mono text-xs font-semibold text-black dark:text-white">
                                    {p.code}
                                  </span>
                                  <span className="text-black/90 dark:text-white/90">{p.name}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
