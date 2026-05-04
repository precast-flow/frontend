import { useEffect, useMemo, useRef, useState } from 'react'
import { Building2, ChevronsLeftRight, ChevronRight, Factory, Filter, GripVertical, Home, Route } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  projectManagementActivitiesMock,
  projectManagementCardsMock,
  type ProjectCardItem,
  type ProjectStatus,
} from '../../data/projectManagementCardsMock'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import { useI18n } from '../../i18n/I18nProvider'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
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

  const selected = useMemo(() => {
    return filtered.find((x) => x.lite.id === selectedId)?.lite ?? filtered[0]?.lite ?? projects[0]
  }, [filtered, selectedId, projects])

  useEffect(() => {
    if (filtered.length === 0) return
    if (!filtered.some((x) => x.lite.id === activeProjectId)) {
      setActiveProjectId(filtered[0]!.lite.id)
    }
  }, [filtered, activeProjectId, setActiveProjectId])

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
        JSON.stringify({ splitRatio, detailTab, selectedId: activeProjectId }),
      )
    } catch {
      /* ignore */
    }
  }, [splitRatio, detailTab, activeProjectId])

  const activeFilterCount = searchQuery.trim() ? 1 : 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[1.25rem]">
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2">
        <div className="px-[0.6875rem] py-1">
          <nav aria-label="Breadcrumb" className="mb-0">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link
                  to="/tanimlar"
                  className="font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400"
                >
                  {t('elementIdentity.detail.breadcrumbHub')}
                </Link>
              </li>
              <li className="flex items-center gap-1" aria-hidden>
                <ChevronRight className="size-3.5 shrink-0 opacity-70" />
              </li>
              <li className="font-semibold text-slate-800 dark:text-slate-100" aria-current="page">
                {t('nav.elementIdentity')}
              </li>
            </ol>
          </nav>
        </div>

        <div className="min-h-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div ref={splitRef} className="relative flex h-full min-h-0 min-w-0 overflow-hidden gap-0">
            <section
              className="okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden p-3"
              style={{ width: `calc(${splitRatio}% - 5px)` }}
            >
              <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
                <h2 className="min-w-0 shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
                  {t('elementIdentity.list.title')}
                </h2>
                <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                  <FilterToolbarSearch
                    id="ei-project-list-search"
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder="Proje adı, kod, müşteri..."
                    ariaLabel={t('elementIdentity.list.searchAria')}
                  />
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFiltersOpen((v) => !v)}
                      aria-expanded={filtersOpen}
                      className={[
                        'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40',
                        filtersOpen
                          ? 'border-sky-300/70 bg-sky-100/70 text-sky-900 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100'
                          : 'border-slate-200/70 bg-white/70 text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200',
                      ].join(' ')}
                    >
                      <Filter className="size-3.5 shrink-0" aria-hidden />
                      Filtrele
                      {activeFilterCount > 0 ? (
                        <span className="rounded-full bg-sky-500/25 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-sky-900 dark:bg-sky-400/20 dark:text-sky-100">
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
                    'absolute inset-y-0 left-0 z-20 w-72 overflow-y-auto rounded-xl border border-slate-200/70 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-transform dark:border-slate-700/70 dark:bg-slate-900/95',
                    filtersOpen ? 'translate-x-0' : '-translate-x-[105%]',
                  ].join(' ')}
                  aria-hidden={!filtersOpen}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Filtreler</h4>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Arama</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiltersOpen(false)}
                      className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      aria-label="Filtreyi kapat"
                    >
                      <span className="text-lg leading-none">×</span>
                    </button>
                  </div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Arama
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Proje adı, kod, müşteri..."
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950"
                  />
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      Sonuç: <span className="font-semibold tabular-nums">{filtered.length}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setFiltersOpen(false)
                      }}
                      className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Temizle
                    </button>
                  </div>
                </aside>

                <ul
                  ref={listRef}
                  className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto pr-1 transition-[padding] duration-300"
                  style={{ paddingLeft: filtersOpen ? '18.5rem' : '0' }}
                  role="list"
                  aria-label={t('elementIdentity.list.title')}
                >
                  {filtered.length > 0 ? (
                    filtered.map(({ lite, card }) => {
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
                      return (
                        <li
                          key={lite.id}
                          className={[
                            'flex min-h-0 shrink-0 items-stretch gap-1.5 rounded-lg border border-slate-200/50 bg-white/70 px-2 py-1.5 dark:border-slate-700/50 dark:bg-slate-900/35',
                            selectedId === lite.id ? 'okan-project-list-row--active' : '',
                          ].join(' ')}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveProjectId(lite.id)}
                            aria-current={selectedId === lite.id ? 'true' : undefined}
                            className="min-w-0 flex-1 rounded-md px-0.5 py-0.5 text-left transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:hover:bg-slate-900/40"
                          >
                            <p className="truncate text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">
                              {row.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400">{row.customer}</p>
                            <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              <TypeIcon className="size-3" aria-hidden />
                              {typeMeta.label}
                            </p>
                          </button>
                          <div className="flex w-[7.5rem] shrink-0 flex-col justify-center gap-1">
                            <Link
                              to={`/eleman-kimlik/${lite.id}`}
                              state={{ fromElementIdentityList: true }}
                              title={t('elementIdentity.list.detailCta')}
                              className="inline-flex items-center justify-end gap-0.5 rounded-md px-1.5 py-1 text-[11px] font-medium leading-none text-slate-500 transition hover:bg-slate-500/10 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                            >
                              {t('elementIdentity.list.detailCta')}
                              <ChevronRight className="size-3 opacity-70" strokeWidth={2} aria-hidden />
                            </Link>
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
                          </div>
                        </li>
                      )
                    })
                  ) : (
                    <li className="rounded-lg border border-slate-200/50 bg-white/50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700/50 dark:bg-slate-900/35 dark:text-slate-300">
                      Filtreye uygun proje bulunamadı.
                    </li>
                  )}
                </ul>
              </div>
            </section>

            <div className="relative z-10 mx-1 hidden w-2 shrink-0 cursor-col-resize lg:flex">
              <button
                type="button"
                aria-label="Paneller arası genişliği ayarla"
                onMouseDown={() => setIsResizing(true)}
                onMouseEnter={() => setIsResizerHover(true)}
                onMouseLeave={() => setIsResizerHover(false)}
                className={[
                  'group absolute inset-y-3 left-1/2 -translate-x-1/2 rounded-full border transition',
                  isResizing || isResizerHover
                    ? 'w-6 border-sky-300/70 bg-sky-100/70 dark:border-sky-500/60 dark:bg-sky-900/40'
                    : 'w-3 border-slate-200/80 bg-white/70 dark:border-slate-700/80 dark:bg-slate-900/60',
                ].join(' ')}
              >
                <span className="pointer-events-none flex h-full items-center justify-center text-slate-500 dark:text-slate-300">
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
              className="okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2"
            >
              {selected ? (
                <div key={selected.id} className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
                  <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 lg:max-w-3xl">
                    <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Seçili proje
                      </p>
                      <h3 className="mt-1.5 text-xl font-semibold leading-tight text-slate-900 dark:text-slate-50">
                        {selectedCard?.name ?? selected.name ?? selected.code}
                      </h3>
                      <p className="mt-1 text-sm leading-snug text-slate-600 dark:text-slate-300">
                        {(selectedCard?.customer ?? selected.customer) ?? '—'} · {selected.code}
                        {selectedCard ? ` · Sorumlu ${selectedCard.owner}` : ''}
                      </p>
                      <Link
                        to={`/eleman-kimlik/${selected.id}`}
                        state={{ fromElementIdentityList: true }}
                        className="mt-2 inline-flex items-center justify-center rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {t('elementIdentity.list.detailCta')} (tam sayfa)
                      </Link>
                    </header>

                    <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-0.5">
                      <div
                        className="okan-liquid-pill-track flex max-w-full gap-1 overflow-x-auto rounded-full p-1"
                        role="tablist"
                        aria-label="Önizleme sekmeleri"
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
                            className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                              detailTab === id
                                ? 'okan-liquid-pill-active okan-project-tab-active text-slate-900 dark:text-slate-50'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      key={detailTab}
                      role="tabpanel"
                      className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-center sm:px-1"
                    >
                      {detailTab === 'ozet' ? (
                        <div className="flex flex-col gap-4 divide-y divide-slate-200/25 dark:divide-white/10">
                          <dl className="mx-auto grid max-w-sm grid-cols-2 justify-items-center gap-x-6 gap-y-4 pt-0 text-base sm:max-w-md">
                            <div>
                              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {t('elementIdentity.list.elementsCount')}
                              </dt>
                              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-50">
                                {counts.el.get(selected.id) ?? 0}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {t('elementIdentity.list.productsCount')}
                              </dt>
                              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-50">
                                {counts.pr.get(selected.id) ?? 0}
                              </dd>
                            </div>
                            {selectedCard ? (
                              <>
                                <div>
                                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Durum</dt>
                                  <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">
                                    {statusLabel(selectedCard.status)}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">İlerleme</dt>
                                  <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">%{selectedCard.progress}</dd>
                                </div>
                              </>
                            ) : null}
                          </dl>
                          {selectedCard?.note ? (
                            <p className="py-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{selectedCard.note}</p>
                          ) : (
                            <p className="py-4 text-sm text-slate-500 dark:text-slate-400">Kısa özet için proje kartı kullanılır.</p>
                          )}
                          {activitiesForSelected.length > 0 ? (
                            <div className="pt-4 text-left">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Son aktiviteler
                              </p>
                              <ul className="mx-auto mt-3 max-w-lg divide-y divide-slate-200/20 dark:divide-white/10">
                                {activitiesForSelected.map((a) => (
                                  <li key={a.id} className="flex gap-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                                    <span className="w-14 shrink-0 tabular-nums text-slate-500">{a.at}</span>
                                    <span className="min-w-0 flex-1">{a.text}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {detailTab === 'elemanlar' ? (
                        <div className="text-left">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Kayıtlı elemanlar (son)
                          </p>
                          {elsForSelected.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Henüz eleman yok.</p>
                          ) : (
                            <ul className="mx-auto mt-3 max-w-lg divide-y divide-slate-200/25 dark:divide-white/10">
                              {elsForSelected.map((el) => (
                                <li key={el.id} className="py-2 font-mono text-xs text-slate-800 dark:text-slate-100">
                                  {el.instanceMark || el.id}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : null}

                      {detailTab === 'urunler' ? (
                        <div className="text-left">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Ürünler (son)
                          </p>
                          {prdForSelected.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t('elementIdentity.products.empty')}</p>
                          ) : (
                            <ul className="mx-auto mt-3 max-w-lg divide-y divide-slate-200/25 dark:divide-white/10">
                              {prdForSelected.map((p) => (
                                <li key={p.id} className="flex flex-col gap-0.5 py-2 text-sm">
                                  <span className="font-mono text-xs font-semibold">{p.code}</span>
                                  <span className="text-slate-700 dark:text-slate-200">{p.name}</span>
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
