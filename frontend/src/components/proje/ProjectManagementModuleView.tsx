import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Building2,
  ChevronsLeftRight,
  ChevronRight,
  Factory,
  Filter,
  GripVertical,
  Home,
  Plus,
  Route,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  projectManagementActivitiesMock,
  projectManagementCardsMock,
  type ProjectCardItem,
  type ProjectPriority,
  type ProjectStatus,
} from '../../data/projectManagementCardsMock'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import { useI18n } from '../../i18n/I18nProvider'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'

function statusLabel(status: ProjectStatus) {
  if (status === 'planlama') return 'Planlama'
  if (status === 'devam') return 'Devam ediyor'
  if (status === 'riskli') return 'Riskli'
  if (status === 'beklemede') return 'Beklemede'
  return 'Tamamlandi'
}

function priorityLabel(priority: ProjectPriority) {
  if (priority === 'dusuk') return 'Dusuk'
  if (priority === 'normal') return 'Normal'
  if (priority === 'yuksek') return 'Yuksek'
  return 'Kritik'
}

type ProjectTypeMeta = {
  label: string
  icon: typeof Home
}

function getProjectTypeMeta(row: Pick<ProjectCardItem, 'name' | 'customer'>): ProjectTypeMeta {
  const haystack = `${row.name} ${row.customer}`.toLocaleLowerCase('tr-TR')
  if (haystack.includes('köprü') || haystack.includes('viyaduk')) return { label: 'Köprü / Viyadük', icon: Route }
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

type Props = {
  onNavigate: (moduleId: string) => void
}

type DetailTabId = 'ozet' | 'dosyalar' | 'aktivite' | 'hizli-islemler' | 'hizli-ayarlar' | 'notlar'
type ProjectSortMode = 'updated-desc' | 'due-asc' | 'progress-desc' | 'name-asc'
type ProjectDialogMode = 'create' | 'edit'
type ProjectDialogDraft = {
  customer: string
  location: string
  name: string
  shortCode: string
  status: ProjectStatus
  startDate: string
  dueDate: string
}
type ProjectRow = ProjectCardItem & { location: string; shortCode: string }
const PROJECT_MANAGEMENT_VIEW_STATE_KEY = 'project-management:view-state'

const CUSTOMER_LOCATIONS: Record<string, string[]> = {
  'Acme Altyapi': ['Merkez Kampüs', 'Saha-1', 'Saha-2'],
  'Metropol Yapi': ['İstanbul Avrupa', 'İstanbul Anadolu'],
  'Delta Insaat': ['Ankara Batı', 'İzmir Güney'],
  'Kuzey Yapi': ['Kocaeli Gebze', 'Samsun Lojistik'],
  'Yildiz Endustri': ['Bursa Organize', 'Eskişehir Endüstri'],
  'LojistikPark A.S.': ['Depo Kuzey', 'Depo Güney'],
  'Metro Su': ['Hat-12', 'Hat-18'],
}

function toIsoDate(trDate: string): string {
  const [day, month, year] = trDate.split('.').map(Number)
  const d = new Date(year, (month ?? 1) - 1, day ?? 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toTrDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}.${month}.${year}`
}

export function ProjectManagementModuleView({ onNavigate }: Props) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const detailPanelRef = useRef<HTMLElement | null>(null)
  const splitRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const loadMoreSentinelRef = useRef<HTMLLIElement | null>(null)
  const [rows, setRows] = useState<ProjectRow[]>(
    projectManagementCardsMock.map((row) => ({
      ...row,
      location: CUSTOMER_LOCATIONS[row.customer]?.[0] ?? 'Merkez',
      shortCode: row.code.split('-').at(-1)?.slice(0, 4) ?? 'P01',
    })),
  )
  const [selectedId, setSelectedId] = useState(() => {
    const fallback = projectManagementCardsMock[0]?.id ?? ''
    try {
      const raw = sessionStorage.getItem(PROJECT_MANAGEMENT_VIEW_STATE_KEY)
      if (!raw) return fallback
      const parsed = JSON.parse(raw) as { selectedId?: string }
      if (!parsed.selectedId) return fallback
      return projectManagementCardsMock.some((row) => row.id === parsed.selectedId) ? parsed.selectedId : fallback
    } catch {
      return fallback
    }
  })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus[]>(() => {
    try {
      const raw = sessionStorage.getItem(PROJECT_MANAGEMENT_VIEW_STATE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as { statusFilter?: ProjectStatus[] }
      return Array.isArray(parsed.statusFilter) ? parsed.statusFilter : []
    } catch {
      return []
    }
  })
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      const raw = sessionStorage.getItem(PROJECT_MANAGEMENT_VIEW_STATE_KEY)
      if (!raw) return ''
      const parsed = JSON.parse(raw) as { searchQuery?: string }
      return parsed.searchQuery ?? ''
    } catch {
      return ''
    }
  })
  const [sortMode, setSortMode] = useState<ProjectSortMode>(() => {
    try {
      const raw = sessionStorage.getItem(PROJECT_MANAGEMENT_VIEW_STATE_KEY)
      if (!raw) return 'updated-desc'
      const parsed = JSON.parse(raw) as { sortMode?: ProjectSortMode }
      return parsed.sortMode ?? 'updated-desc'
    } catch {
      return 'updated-desc'
    }
  })
  const [ownerFilter, setOwnerFilter] = useState<string[]>(() => {
    try {
      const raw = sessionStorage.getItem(PROJECT_MANAGEMENT_VIEW_STATE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as { ownerFilter?: string[] }
      return Array.isArray(parsed.ownerFilter) ? parsed.ownerFilter : []
    } catch {
      return []
    }
  })
  const [dateRange, setDateRange] = useState<'all' | '7' | '30'>(() => {
    try {
      const raw = sessionStorage.getItem(PROJECT_MANAGEMENT_VIEW_STATE_KEY)
      if (!raw) return 'all'
      const parsed = JSON.parse(raw) as { dateRange?: 'all' | '7' | '30' }
      return parsed.dateRange === '7' || parsed.dateRange === '30' ? parsed.dateRange : 'all'
    } catch {
      return 'all'
    }
  })
  const [detailTab, setDetailTab] = useState<DetailTabId>(() => {
    try {
      const raw = sessionStorage.getItem(PROJECT_MANAGEMENT_VIEW_STATE_KEY)
      if (!raw) return 'ozet'
      const parsed = JSON.parse(raw) as { detailTab?: DetailTabId }
      return parsed.detailTab ?? 'ozet'
    } catch {
      return 'ozet'
    }
  })
  const [listPage, setListPage] = useState(() => {
    try {
      const raw = sessionStorage.getItem(PROJECT_MANAGEMENT_VIEW_STATE_KEY)
      if (!raw) return 1
      const parsed = JSON.parse(raw) as { listPage?: number }
      return typeof parsed.listPage === 'number' && parsed.listPage > 0 ? parsed.listPage : 1
    } catch {
      return 1
    }
  })
  const [pageSize, setPageSize] = useState(() => {
    try {
      const raw = sessionStorage.getItem(PROJECT_MANAGEMENT_VIEW_STATE_KEY)
      if (!raw) return 8
      const parsed = JSON.parse(raw) as { pageSize?: number }
      return typeof parsed.pageSize === 'number' && parsed.pageSize > 0 ? parsed.pageSize : 8
    } catch {
      return 8
    }
  })
  const [splitRatio, setSplitRatio] = useState(() => {
    try {
      const raw = sessionStorage.getItem(PROJECT_MANAGEMENT_VIEW_STATE_KEY)
      if (!raw) return 40
      const parsed = JSON.parse(raw) as { splitRatio?: number }
      return typeof parsed.splitRatio === 'number' ? Math.min(55, Math.max(30, parsed.splitRatio)) : 40
    } catch {
      return 40
    }
  })
  const [isResizing, setIsResizing] = useState(false)
  const [isResizerHover, setIsResizerHover] = useState(false)
  const [dialogMode, setDialogMode] = useState<ProjectDialogMode>('create')
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [dialogDraft, setDialogDraft] = useState<ProjectDialogDraft>(() => {
    const customer = projectManagementCardsMock[0]?.customer ?? ''
    return {
      customer,
      location: CUSTOMER_LOCATIONS[customer]?.[0] ?? 'Merkez',
      name: '',
      shortCode: '',
      status: 'planlama',
      startDate: '2026-04-15',
      dueDate: '2026-05-15',
    }
  })

  const owners = useMemo(() => [...new Set(rows.map((r) => r.owner))], [rows])
  const customerOptions = useMemo(() => [...new Set(rows.map((r) => r.customer))], [rows])
  const locationOptions = CUSTOMER_LOCATIONS[dialogDraft.customer] ?? []

  const activeFilterCount = useMemo(
    () =>
      statusFilter.length +
      ownerFilter.length +
      (dateRange !== 'all' ? 1 : 0) +
      (searchQuery.trim() ? 1 : 0) +
      (sortMode !== 'updated-desc' ? 1 : 0),
    [statusFilter, ownerFilter, dateRange, searchQuery, sortMode],
  )

  const filtered = useMemo(() => {
    const now = new Date('2026-04-14')
    const q = searchQuery.trim().toLocaleLowerCase('tr-TR')
    return rows
      .filter((r) => {
        if (statusFilter.length && !statusFilter.includes(r.status)) return false
        if (ownerFilter.length && !ownerFilter.includes(r.owner)) return false
        if (q) {
          const haystack = `${r.name} ${r.customer} ${r.code} ${r.owner} ${r.location}`.toLocaleLowerCase('tr-TR')
          if (!haystack.includes(q)) return false
        }
        if (dateRange !== 'all') {
          const due = new Date(r.dueDate.split('.').reverse().join('-'))
          const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (diff > Number(dateRange)) return false
        }
        return true
      })
      .toSorted((a, b) => {
        if (sortMode === 'name-asc') return a.name.localeCompare(b.name, 'tr')
        if (sortMode === 'progress-desc') return b.progress - a.progress
        if (sortMode === 'due-asc') {
          const ad = new Date(a.dueDate.split('.').reverse().join('-')).getTime()
          const bd = new Date(b.dueDate.split('.').reverse().join('-')).getTime()
          return ad - bd
        }
        const au = new Date(a.updatedAt.split(' ')[0].split('.').reverse().join('-')).getTime()
        const bu = new Date(b.updatedAt.split(' ')[0].split('.').reverse().join('-')).getTime()
        return bu - au
      })
  }, [rows, statusFilter, ownerFilter, dateRange, searchQuery, sortMode])

  const listPageCount = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / pageSize)),
    [filtered.length, pageSize],
  )

  const safeListPage = Math.min(listPage, listPageCount)

  const visibleProjects = useMemo(() => {
    return filtered.slice(0, safeListPage * pageSize)
  }, [filtered, pageSize, safeListPage])

  const listPageStart = filtered.length === 0 ? 0 : 1
  const listPageEnd = Math.min(filtered.length, safeListPage * pageSize)

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null
  const selectedActivities = projectManagementActivitiesMock.filter((a) => a.projectId === selected?.id).slice(0, 3)

  const toggleStatus = (status: ProjectStatus) => {
    setListPage(1)
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const toggleOwner = (owner: string) => {
    setListPage(1)
    setOwnerFilter((prev) => (prev.includes(owner) ? prev.filter((s) => s !== owner) : [...prev, owner]))
  }

  const clearListFilters = () => {
    setStatusFilter([])
    setOwnerFilter([])
    setDateRange('all')
    setSearchQuery('')
    setSortMode('updated-desc')
    setListPage(1)
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    })
  }

  const openCreateDialog = () => {
    const customer = customerOptions[0] ?? rows[0]?.customer ?? ''
    setDialogMode('create')
    setDialogError(null)
    setDialogDraft({
      customer,
      location: CUSTOMER_LOCATIONS[customer]?.[0] ?? 'Merkez',
      name: '',
      shortCode: '',
      status: 'planlama',
      startDate: '2026-04-15',
      dueDate: '2026-05-15',
    })
    setIsProjectDialogOpen(true)
  }

  const openEditDialog = () => {
    if (!selected) return
    setDialogMode('edit')
    setDialogError(null)
    setDialogDraft({
      customer: selected.customer,
      location: selected.location,
      name: selected.name,
      shortCode: selected.shortCode,
      status: selected.status,
      startDate: toIsoDate(selected.startDate),
      dueDate: toIsoDate(selected.dueDate),
    })
    setIsProjectDialogOpen(true)
  }

  const saveProjectDialog = () => {
    const code = dialogDraft.shortCode.trim().toUpperCase()
    if (code.length < 2 || code.length > 4) {
      setDialogError('Proje kısa kodu 2-4 karakter olmalı.')
      return
    }
    if (!dialogDraft.name.trim()) {
      setDialogError('Proje adı zorunludur.')
      return
    }
    if (!dialogDraft.startDate || !dialogDraft.dueDate) {
      setDialogError('Başlangıç ve termin tarihi zorunludur.')
      return
    }
    if (dialogDraft.dueDate < dialogDraft.startDate) {
      setDialogError('Termin tarihi başlangıç tarihinden önce olamaz.')
      return
    }
    const duplicate = rows.find(
      (row) =>
        row.customer === dialogDraft.customer &&
        row.shortCode.toUpperCase() === code &&
        (dialogMode === 'create' || row.id !== selected?.id),
    )
    if (duplicate) {
      setDialogError('Aynı müşteride aynı kısa kod ile başka proje olamaz.')
      return
    }

    if (dialogMode === 'edit' && selected) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === selected.id
            ? {
                ...row,
                customer: dialogDraft.customer,
                location: dialogDraft.location,
                name: dialogDraft.name.trim(),
                shortCode: code,
                code: `PRJ-${new Date().getFullYear()}-${code}`,
                status: dialogDraft.status,
                startDate: toTrDate(dialogDraft.startDate),
                dueDate: toTrDate(dialogDraft.dueDate),
                updatedAt: '30.04.2026 22:30',
              }
            : row,
        ),
      )
    } else {
      const newId = `pm-${Date.now()}`
      const newRow: ProjectRow = {
        id: newId,
        code: `PRJ-${new Date().getFullYear()}-${code}`,
        shortCode: code,
        name: dialogDraft.name.trim(),
        customer: dialogDraft.customer,
        location: dialogDraft.location,
        owner: rows[0]?.owner ?? 'SG',
        status: dialogDraft.status,
        priority: 'normal',
        updatedAt: '30.04.2026 22:30',
        startDate: toTrDate(dialogDraft.startDate),
        dueDate: toTrDate(dialogDraft.dueDate),
        progress: 0,
        note: 'Yeni proje kaydı oluşturuldu.',
      }
      setRows((prev) => [newRow, ...prev])
      setSelectedId(newId)
    }
    setIsProjectDialogOpen(false)
  }

  const onProjectListScroll = () => {
    const el = listRef.current
    if (!el) return
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 64
    if (!nearBottom) return
    if (safeListPage >= listPageCount) return
    setListPage((prev) => Math.min(listPageCount, prev + 1))
  }

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

  useEffect(() => {
    const root = listRef.current
    const target = loadMoreSentinelRef.current
    if (!root || !target || safeListPage >= listPageCount) return

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setListPage((prev) => Math.min(listPageCount, prev + 1))
      },
      { root, rootMargin: '0px 0px 80px 0px', threshold: 0 },
    )
    io.observe(target)
    return () => io.disconnect()
  }, [filtersOpen, filtered.length, listPageCount, safeListPage, visibleProjects.length])

  const applyMockStatusChange = () => {
    if (!selected) return
    setRows((prev) =>
      prev.map((row) =>
        row.id === selected.id
          ? {
              ...row,
              status: row.status === 'devam' ? 'riskli' : 'devam',
              updatedAt: '14.04.2026 11:45',
            }
          : row,
      ),
    )
  }

  useEffect(() => {
    if (!detailPanelRef.current) return
    detailPanelRef.current.scrollTo({ top: 0, behavior: 'auto' })
  }, [detailTab, selectedId])

  useEffect(() => {
    const next = {
      selectedId,
      statusFilter,
      ownerFilter,
      dateRange,
      searchQuery,
      sortMode,
      detailTab,
      listPage: safeListPage,
      pageSize,
      splitRatio,
    }
    sessionStorage.setItem(PROJECT_MANAGEMENT_VIEW_STATE_KEY, JSON.stringify(next))
  }, [dateRange, detailTab, ownerFilter, pageSize, safeListPage, searchQuery, selectedId, sortMode, splitRatio, statusFilter])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[1.25rem]">
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2">
        <div className="px-[0.6875rem] py-1">
          <nav
            aria-label={t('project.breadcrumbAria')}
            className="mb-0"
          >
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
                {t('nav.project')}
              </li>
            </ol>
          </nav>
        </div>

        <div className="min-h-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div
            ref={splitRef}
            className="relative flex h-full min-h-0 min-w-0 overflow-hidden gap-0"
          >
            <section
              className="okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden p-3"
              style={{ width: `calc(${splitRatio}% - 5px)` }}
            >
              <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
                <h2 className="min-w-0 shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
                  Projeler
                </h2>
                <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                  <FilterToolbarSearch
                    id="project-list-inline-search"
                    value={searchQuery}
                    onValueChange={(v) => {
                      setSearchQuery(v)
                      setListPage(1)
                    }}
                    placeholder="Proje adı, kod, müşteri..."
                    ariaLabel="Projelerde ara"
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
                    <button
                      type="button"
                      onClick={openCreateDialog}
                      className={[
                        'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40',
                        'border-slate-200/70 bg-white/70 text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200',
                      ].join(' ')}
                    >
                      <Plus className="size-3.5 shrink-0" aria-hidden />
                      <span>Proje oluştur</span>
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
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Proje filtreleri</h4>
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Durum, sorumlu, tarih</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFiltersOpen(false)}
                          className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          aria-label="Filtreyi kapat"
                        >
                          <X className="size-3.5" aria-hidden />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="project-list-panel-search"
                            className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                          >
                            Arama
                          </label>
                          <input
                            id="project-list-panel-search"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value)
                              setListPage(1)
                            }}
                            placeholder="Proje adı, kod, müşteri..."
                            autoComplete="off"
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-950"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="project-list-sort-mode"
                            className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                          >
                            Sıralama
                          </label>
                          <select
                            id="project-list-sort-mode"
                            value={sortMode}
                            onChange={(e) => {
                              setSortMode(e.target.value as ProjectSortMode)
                              setListPage(1)
                            }}
                            className="okan-liquid-select mt-2 w-full rounded-lg border-0 px-3 py-2.5 text-sm shadow-none"
                          >
                            <option value="updated-desc">Son güncelleme (yeni-eski)</option>
                            <option value="due-asc">Termin (yakın-uzak)</option>
                            <option value="progress-desc">İlerleme (yüksek-düşük)</option>
                            <option value="name-asc">Proje adı (A-Z)</option>
                          </select>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                            Durum
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(['planlama', 'devam', 'riskli', 'beklemede', 'tamamlandi'] as ProjectStatus[]).map(
                              (s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => toggleStatus(s)}
                                  className={[
                                    'rounded-full px-3 py-2 text-left text-sm font-semibold leading-snug transition',
                                    statusFilter.includes(s)
                                      ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
                                      : 'okan-liquid-btn-secondary',
                                  ].join(' ')}
                                >
                                  {statusLabel(s)}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                            Sorumlu
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {owners.map((o) => (
                              <button
                                key={o}
                                type="button"
                                onClick={() => toggleOwner(o)}
                                className={[
                                  'max-w-full truncate rounded-full px-3 py-2 text-sm font-semibold transition',
                                  ownerFilter.includes(o)
                                    ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
                                    : 'okan-liquid-btn-secondary',
                                ].join(' ')}
                                title={o}
                              >
                                {o}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="project-list-date-range"
                            className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                          >
                            Tarih araligi
                          </label>
                          <select
                            id="project-list-date-range"
                            value={dateRange}
                            onChange={(e) => {
                              setDateRange(e.target.value as 'all' | '7' | '30')
                              setListPage(1)
                            }}
                            className="okan-liquid-select mt-2 w-full rounded-lg border-0 px-3 py-2.5 text-sm shadow-none"
                          >
                            <option value="all">Tum tarihler</option>
                            <option value="7">7 gun icinde teslim</option>
                            <option value="30">30 gun icinde teslim</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                        <span className="text-[11px] text-slate-600 dark:text-slate-300">
                          Sonuc:{' '}
                          <span className="tabular-nums font-semibold">{filtered.length}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            clearListFilters()
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
                      onScroll={onProjectListScroll}
                      role="list"
                      aria-label="Proje listesi"
                    >
                      {visibleProjects.length > 0 ? (
                        visibleProjects.map((row) => (
                          (() => {
                            const typeMeta = getProjectTypeMeta(row)
                            const TypeIcon = typeMeta.icon
                            const statusPct = getProjectStatusProgress(row.status)
                            const statusUi = getProjectStatusBarClasses(row.status)
                            return (
                          <li
                            key={row.id}
                            className={[
                              'flex min-h-0 shrink-0 items-stretch gap-1.5 rounded-lg border border-slate-200/50 bg-white/70 px-2 py-1.5 dark:border-slate-700/50 dark:bg-slate-900/35',
                              selected?.id === row.id ? 'okan-project-list-row--active' : '',
                            ].join(' ')}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedId(row.id)}
                              aria-current={selected?.id === row.id ? 'true' : undefined}
                              className="min-w-0 flex-1 rounded-md px-0.5 py-0.5 text-left transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:hover:bg-slate-900/40"
                            >
                              <p className="truncate text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">
                                {row.name}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400">
                                {row.customer}
                              </p>
                              <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                <TypeIcon className="size-3" aria-hidden />
                                {typeMeta.label}
                              </p>
                            </button>
                            <div className="flex w-[7.5rem] shrink-0 flex-col justify-center gap-1">
                              <button
                                type="button"
                                title="Proje detayini gor"
                                onClick={() =>
                                  navigate(`/proje-detay/${row.id}`, {
                                    state: {
                                      fromProjectList: true,
                                      projectName: row.name,
                                    },
                                  })
                                }
                                className="inline-flex items-center justify-end gap-0.5 rounded-md px-1.5 py-1 text-[11px] font-medium leading-none text-slate-500 transition hover:bg-slate-500/10 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                              >
                                Detay
                                <ChevronRight className="size-3 opacity-70" strokeWidth={2} aria-hidden />
                              </button>
                              <div
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={statusPct}
                                aria-valuetext={statusLabel(row.status)}
                                className={['h-1.5 w-full overflow-hidden rounded-full', statusUi.track].join(' ')}
                              >
                                <span
                                  className={['block h-full rounded-full transition-all', statusUi.fill].join(' ')}
                                  style={{ width: `${statusPct}%` }}
                                />
                              </div>
                              <span className={['text-right text-[11px] font-semibold leading-none', statusUi.text].join(' ')}>
                                {statusLabel(row.status)}
                              </span>
                            </div>
                          </li>
                            )
                          })()
                        ))
                      ) : (
                        <li className="rounded-lg border border-slate-200/50 bg-white/50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700/50 dark:bg-slate-900/35 dark:text-slate-300">
                          Filtreye uygun proje bulunamadi.
                        </li>
                      )}
                      {safeListPage < listPageCount ? (
                        <li ref={loadMoreSentinelRef} className="h-1 w-full shrink-0 list-none" aria-hidden />
                      ) : null}
                    </ul>
                  </div>
                  <div className="sticky bottom-0 z-10 mt-1 shrink-0 border-t border-slate-200/60 bg-white/90 pt-2 text-xs backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/85">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-slate-600 dark:text-slate-300">
                        {filtered.length > 0 ? (
                          <>
                            <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">
                              {listPageStart}
                            </span>
                            -
                            <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">
                              {listPageEnd}
                            </span>{' '}
                            /{' '}
                            <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">
                              {filtered.length}
                            </span>{' '}
                            sonuc
                          </>
                        ) : (
                          'Sonuc yok'
                        )}
                      </p>
                      <label className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
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
                          className="rounded-md border border-slate-300 bg-white px-1.5 py-1 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                        >
                          {[6, 8, 10, 15].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-slate-500 dark:text-slate-400">
                        Yüklenen grup{' '}
                        <span className="tabular-nums font-semibold">{safeListPage}</span> /{' '}
                        <span className="tabular-nums font-semibold">{listPageCount}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {safeListPage < listPageCount
                          ? 'Liste sonuna gelince veya alan dolunca yeni kayıtlar yüklenir'
                          : 'Tüm kayıtlar yüklendi'}
                      </p>
                    </div>
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
              <div key={selectedId} className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 lg:max-w-3xl">
                <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Secili proje
                  </p>
                  <h3 className="mt-1.5 text-xl font-semibold leading-tight text-slate-900 dark:text-slate-50">
                    {selected.name}
                  </h3>
                  <p className="mt-1 text-sm leading-snug text-slate-600 dark:text-slate-300">
                    {selected.customer} · Sorumlu {selected.owner}
                  </p>
                  <button
                    type="button"
                    onClick={openEditDialog}
                    className="mt-2 rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Projeyi düzenle
                  </button>
                </header>

                <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-0.5">
                  <div
                    className="okan-liquid-pill-track flex max-w-full gap-1 overflow-x-auto rounded-full p-1"
                    role="tablist"
                    aria-label="Secili proje panel tablari"
                    aria-orientation="horizontal"
                  >
                  {(
                    [
                      ['ozet', 'Ozet'],
                      ['dosyalar', 'Dosyalar'],
                      ['aktivite', 'Aktivite Gecmisi'],
                      ['notlar', 'Notlar'],
                      ['hizli-islemler', 'Hizli Islemler'],
                      ['hizli-ayarlar', 'Hizli Ayarlar'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      id={`project-detail-tab-${id}`}
                      aria-selected={detailTab === id}
                      aria-controls="project-detail-panel"
                      tabIndex={detailTab === id ? 0 : -1}
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
                  id="project-detail-panel"
                  role="tabpanel"
                  aria-labelledby={`project-detail-tab-${detailTab}`}
                  className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-center sm:px-1"
                >

                {detailTab === 'ozet' ? (
                  <div className="flex flex-col divide-y divide-slate-200/25 dark:divide-white/10">
                    <div className="pb-4 pt-0">
                      <dl className="mx-auto grid max-w-sm grid-cols-2 justify-items-center gap-x-6 gap-y-4 text-base sm:max-w-md sm:gap-x-10">
                        <div className="min-w-0">
                          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Durum</dt>
                          <dd className="mt-0.5 font-medium leading-snug text-slate-900 dark:text-slate-50">
                            {statusLabel(selected.status)}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Oncelik</dt>
                          <dd className="mt-0.5 font-medium leading-snug text-slate-900 dark:text-slate-50">
                            {priorityLabel(selected.priority)}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Baslangic</dt>
                          <dd className="mt-0.5 font-medium leading-snug text-slate-900 dark:text-slate-50">{selected.startDate}</dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Termin</dt>
                          <dd className="mt-0.5 font-medium leading-snug text-slate-900 dark:text-slate-50">{selected.dueDate}</dd>
                        </div>
                      </dl>
                    </div>

                    <p className="py-4 text-base leading-relaxed text-slate-700 dark:text-slate-200">{selected.note}</p>

                    <div className="pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Son 3 aktivite
                      </p>
                      <ul className="mx-auto mt-3 max-w-lg divide-y divide-slate-200/20 text-left dark:divide-white/10">
                        {selectedActivities.length ? (
                          selectedActivities.map((a) => (
                            <li
                              key={a.id}
                              className="flex justify-center gap-3 py-2.5 text-sm leading-snug text-slate-700 first:pt-0 dark:text-slate-200 sm:justify-start"
                            >
                              <span className="w-14 shrink-0 tabular-nums text-slate-500 dark:text-slate-400">{a.at}</span>
                              <span className="min-w-0 flex-1">{a.text}</span>
                            </li>
                          ))
                        ) : (
                          <li className="py-2 text-sm text-slate-600 dark:text-slate-300">Aktivite kaydi yok.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : null}

                {detailTab === 'dosyalar' ? (
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Proje dosyalari (mock)
                    </p>
                    <ul className="mx-auto mt-3 max-w-lg divide-y divide-slate-200/25 text-left dark:divide-white/10" role="list">
                      {['Vaziyet_Plani_RevC.pdf', 'Kalip_Seti_2026-04.ifc', 'Montaj_Notlari_v2.docx'].map((f) => (
                        <li
                          key={f}
                          className="flex flex-col items-center gap-2 py-3 text-sm first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                        >
                          <span className="min-w-0 max-w-full flex-1 truncate text-center font-medium text-slate-800 sm:text-left dark:text-slate-100">
                            {f}
                          </span>
                          <button type="button" className="okan-liquid-btn-secondary shrink-0 px-2.5 py-1.5 text-xs font-semibold">
                            Ac
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'aktivite' ? (
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Aktivite gecmisi
                    </p>
                    <ul className="mx-auto mt-3 max-w-lg divide-y divide-slate-200/25 text-left dark:divide-white/10">
                      {(projectManagementActivitiesMock.filter((a) => a.projectId === selected.id)).map((a) => (
                        <li
                          key={a.id}
                          className="flex justify-center gap-3 py-2.5 text-sm leading-snug text-slate-700 first:pt-0 dark:text-slate-200 sm:justify-start"
                        >
                          <span className="w-14 shrink-0 tabular-nums text-slate-500 dark:text-slate-400">{a.at}</span>
                          <span className="min-w-0 flex-1">{a.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'hizli-islemler' ? (
                  <div className="mx-auto flex w-full max-w-md flex-col gap-2.5">
                    <button type="button" onClick={applyMockStatusChange} className="okan-liquid-btn-primary w-full px-4 py-2.5 text-sm font-semibold">
                      Durum guncelle (mock)
                    </button>
                    <button type="button" onClick={() => onNavigate('project')} className="okan-liquid-btn-secondary w-full px-4 py-2.5 text-sm font-semibold">
                      Not ekle (mock)
                    </button>
                    <button type="button" onClick={() => onNavigate('planning-hub')} className="okan-liquid-btn-secondary w-full px-4 py-2.5 text-sm font-semibold">
                      Sorumlu ata (mock)
                    </button>
                  </div>
                ) : null}

                {detailTab === 'hizli-ayarlar' ? (
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Hizli ayarlar (mock)
                    </p>
                    <div className="mx-auto mt-3 max-w-md divide-y divide-slate-200/25 text-left dark:divide-white/10">
                      <label className="flex cursor-pointer items-center justify-between gap-4 py-3 text-sm first:pt-0">
                        <span className="min-w-0 text-slate-800 dark:text-slate-100">Bildirimleri ac</span>
                        <input type="checkbox" defaultChecked className="size-4 shrink-0 accent-indigo-500" />
                      </label>
                      <label className="flex cursor-pointer items-center justify-between gap-4 py-3 text-sm">
                        <span className="min-w-0 text-slate-800 dark:text-slate-100">Gecikme uyarisi</span>
                        <input type="checkbox" defaultChecked className="size-4 shrink-0 accent-indigo-500" />
                      </label>
                      <label className="flex cursor-pointer items-center justify-between gap-4 py-3 text-sm">
                        <span className="min-w-0 text-slate-800 dark:text-slate-100">Haftalik ozet maili</span>
                        <input type="checkbox" className="size-4 shrink-0 accent-indigo-500" />
                      </label>
                    </div>
                  </div>
                ) : null}

                {detailTab === 'notlar' ? (
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Proje notlari (mock)
                    </p>
                    <ul className="mx-auto mt-3 max-w-lg divide-y divide-slate-200/25 text-left dark:divide-white/10">
                      {[
                        'Kalip teslim takvimi saha ekibiyle yeniden dogrulanacak.',
                        'Musteri tarafi revizyon R3 dokumani yarin bekleniyor.',
                        'Lojistik kapasite planina gore sevkiyat penceresi 2 gun kayabilir.',
                      ].map((note, i) => (
                        <li
                          key={note}
                          className="flex justify-center gap-3 py-2.5 text-sm leading-snug first:pt-0 dark:text-slate-200 sm:justify-start"
                        >
                          <span className="w-7 shrink-0 tabular-nums text-slate-500 dark:text-slate-400">#{i + 1}</span>
                          <span className="min-w-0 flex-1 text-slate-700 dark:text-slate-200">{note}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mx-auto mt-6 max-w-lg border-t border-slate-200/25 pt-4 text-left dark:border-white/10">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Yeni not ekle
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Kisa proje notu yazin... (mock)"
                        className="okan-liquid-input mt-2 w-full resize-none border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none"
                      />
                      <button type="button" className="okan-liquid-btn-secondary mt-2 px-3 py-2 text-sm font-semibold">
                        Notu kaydet (mock)
                      </button>
                    </div>
                  </div>
                ) : null}

                </div>
              </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Proje secin.</p>
            )}
            </aside>
          </div>
        </div>
      </div>
      {isProjectDialogOpen ? (
        <div className="fixed inset-0 z-[95] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
            aria-label="Proje dialog kapat"
            onClick={() => setIsProjectDialogOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={dialogMode === 'create' ? 'Proje oluştur' : 'Proje düzenle'}
            className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xl dark:border-slate-700/70 dark:bg-slate-900"
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  {dialogMode === 'create' ? 'Proje oluştur' : 'Proje düzenle'}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Genel bilgiler alanını doldurun.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectDialogOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Müşteri</span>
                <select
                  value={dialogDraft.customer}
                  onChange={(event) => {
                    const customer = event.target.value
                    setDialogDraft((prev) => ({
                      ...prev,
                      customer,
                      location: CUSTOMER_LOCATIONS[customer]?.[0] ?? 'Merkez',
                    }))
                    setDialogError(null)
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                >
                  {customerOptions.map((customer) => (
                    <option key={customer} value={customer}>
                      {customer}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Lokasyon</span>
                <select
                  value={dialogDraft.location}
                  onChange={(event) => {
                    setDialogDraft((prev) => ({ ...prev, location: event.target.value }))
                    setDialogError(null)
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                >
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Durum</span>
                <select
                  value={dialogDraft.status}
                  onChange={(event) => {
                    setDialogDraft((prev) => ({ ...prev, status: event.target.value as ProjectStatus }))
                    setDialogError(null)
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                >
                  {(['planlama', 'devam', 'riskli', 'beklemede', 'tamamlandi'] as const).map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Proje adı</span>
                <input
                  value={dialogDraft.name}
                  onChange={(event) => {
                    setDialogDraft((prev) => ({ ...prev, name: event.target.value }))
                    setDialogError(null)
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
              </label>

              <label>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Proje kısa kodu</span>
                <input
                  value={dialogDraft.shortCode}
                  maxLength={4}
                  onChange={(event) => {
                    setDialogDraft((prev) => ({ ...prev, shortCode: event.target.value.toUpperCase() }))
                    setDialogError(null)
                  }}
                  placeholder="2-4 karakter"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm uppercase dark:border-slate-600 dark:bg-slate-950"
                />
              </label>

              <label>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Başlangıç tarihi</span>
                <input
                  type="date"
                  value={dialogDraft.startDate}
                  onChange={(event) => {
                    setDialogDraft((prev) => ({ ...prev, startDate: event.target.value }))
                    setDialogError(null)
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
              </label>

              <label>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Termin tarihi</span>
                <input
                  type="date"
                  value={dialogDraft.dueDate}
                  onChange={(event) => {
                    setDialogDraft((prev) => ({ ...prev, dueDate: event.target.value }))
                    setDialogError(null)
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
              </label>
            </div>

            {dialogError ? (
              <p className="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-300">{dialogError}</p>
            ) : null}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsProjectDialogOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={saveProjectDialog}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                {dialogMode === 'create' ? 'Projeyi oluştur' : 'Değişiklikleri kaydet'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
