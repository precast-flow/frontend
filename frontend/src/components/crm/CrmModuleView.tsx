import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronsLeftRight,
  ChevronRight,
  Filter,
  Globe,
  GripVertical,
  Mail,
  MapPin,
  Phone,
  Plus,
  StickyNote,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { crmCustomers, statusLabel, type CrmCustomer, type CrmLocationRow } from '../../data/crmCustomers'
import { useFactoryContext } from '../../context/FactoryContext'
import { useI18n } from '../../i18n/I18nProvider'
import { CrmNewCustomerModal } from './CrmNewCustomerModal'
import { NeoSwitch } from '../NeoSwitch'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import '../muhendislikOkan/engineeringOkanLiquid.css'

type Props = {
  onNavigate: (moduleId: string) => void
}

const CRM_LIST_PAGE_SIZE = 8

const detailTabDefs = [
  { id: 'genel', label: 'Genel' },
  { id: 'iletisim', label: 'İletişim' },
  { id: 'lokasyonlar', label: 'Lokasyonlar' },
  { id: 'projeler', label: 'Projeler' },
  { id: 'teklifler', label: 'Teklifler' },
  { id: 'notlar', label: 'Notlar' },
  { id: 'dokumanlar', label: 'Dokümanlar' },
] as const

type DetailTabId = (typeof detailTabDefs)[number]['id']

const crmLocationFieldInputClass =
  'min-h-[2.5rem] w-full min-w-0 rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/25 dark:border-slate-600/60 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-sky-500/50 dark:focus-visible:ring-sky-400/15'

function statusPill(status: CrmCustomer['status']) {
  const base =
    'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-gray-300/90 dark:ring-gray-600/80'
  if (status === 'aktif') return `${base} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100`
  if (status === 'beklemede') return `${base} bg-gray-50 text-gray-700 dark:bg-gray-950/90 dark:text-gray-200`
  if (status === 'potansiyel')
    return `${base} bg-amber-50 text-amber-900 ring-amber-200/90 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800/80`
  return `${base} bg-gray-200/80 text-gray-700 dark:bg-gray-700/80 dark:text-gray-200`
}

function resolveLocations(customer: CrmCustomer): CrmLocationRow[] {
  if (customer.locations?.length) return customer.locations
  return [
    {
      id: `${customer.id}-loc-main`,
      name: `${customer.city} Merkez`,
      locationInfo: customer.iletisim.adresNotu ?? customer.city,
    },
  ]
}

export function CrmModuleView({ onNavigate: _onNavigate }: Props) {
  void _onNavigate
  const { t } = useI18n()
  const navigate = useNavigate()
  const { selectedCodes } = useFactoryContext()
  const filterId = 'crm-fabrika-filtre'
  const detailPanelRef = useRef<HTMLElement | null>(null)
  const crmDetailTabPanelRef = useRef<HTMLDivElement | null>(null)
  const [rows, setRows] = useState<CrmCustomer[]>(crmCustomers)

  const [newOpen, setNewOpen] = useState(false)
  const [customerDialogMode, setCustomerDialogMode] = useState<'create' | 'edit'>('create')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSector, setFilterSector] = useState<string>('all')
  const [filterByFactoryContext, setFilterByFactoryContext] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(crmCustomers[0]!.id)
  const [detailTab, setDetailTab] = useState<DetailTabId>('genel')
  const [listPage, setListPage] = useState(1)
  const [pageSize, setPageSize] = useState(CRM_LIST_PAGE_SIZE)
  const [splitRatio, setSplitRatio] = useState(40)
  const [isResizing, setIsResizing] = useState(false)
  const [isResizerHover, setIsResizerHover] = useState(false)
  const [newLocationName, setNewLocationName] = useState('')
  const [newLocationInfo, setNewLocationInfo] = useState('')
  const [locationAddOpen, setLocationAddOpen] = useState(false)
  const [locationPopoverPlacement, setLocationPopoverPlacement] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const locationAddTriggerRef = useRef<HTMLButtonElement | null>(null)
  const locationPopoverPanelRef = useRef<HTMLDivElement | null>(null)
  const newLocationNameInputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const loadMoreSentinelRef = useRef<HTMLLIElement | null>(null)
  const splitRef = useRef<HTMLDivElement | null>(null)

  const list = useMemo(() => {
    let rowsView = [...rows]

    const q = search.trim().toLowerCase()
    if (q) {
      rowsView = rowsView.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.taxId.includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q),
      )
    }
    if (filterStatus !== 'all') {
      rowsView = rowsView.filter((c) => c.status === filterStatus)
    }
    if (filterSector !== 'all') {
      rowsView = rowsView.filter((c) => c.sector === filterSector)
    }
    if (filterByFactoryContext) {
      rowsView = rowsView.filter((c) => selectedCodes.some((code) => c.factories.includes(code)))
    }

    return rowsView
  }, [rows, search, filterStatus, filterSector, filterByFactoryContext, selectedCodes])

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (search.trim()) n += 1
    if (filterStatus !== 'all') n += 1
    if (filterSector !== 'all') n += 1
    if (!filterByFactoryContext) n += 1
    return n
  }, [search, filterStatus, filterSector, filterByFactoryContext])

  const listTotalPages = Math.max(1, Math.ceil(list.length / pageSize))
  const safeListPage = Math.min(listPage, listTotalPages)
  const listPageSlice = useMemo(() => {
    return list.slice(0, safeListPage * pageSize)
  }, [list, safeListPage, pageSize])
  const listPageStart = list.length === 0 ? 0 : 1
  const listPageEnd = Math.min(list.length, safeListPage * pageSize)

  useEffect(() => {
    setListPage(1)
  }, [search, filterStatus, filterSector, filterByFactoryContext, pageSize])

  useEffect(() => {
    setListPage((p) => Math.min(p, listTotalPages))
  }, [listTotalPages])

  useEffect(() => {
    if (list.length === 0) return
    if (!list.some((c) => c.id === selectedId)) {
      setSelectedId(list[0]!.id)
    }
  }, [list, selectedId])

  const selected = useMemo(
    () => (list.length ? (list.find((c) => c.id === selectedId) ?? list[0] ?? null) : null),
    [list, selectedId],
  )
  const selectedLocations = selected ? resolveLocations(selected) : []

  useEffect(() => {
    if (!detailPanelRef.current) return
    detailPanelRef.current.scrollTo({ top: 0, behavior: 'auto' })
  }, [detailTab, selected?.id])

  useEffect(() => {
    setNewLocationName('')
    setNewLocationInfo('')
    setLocationAddOpen(false)
  }, [selected?.id])

  useEffect(() => {
    setLocationAddOpen(false)
  }, [detailTab])

  useEffect(() => {
    if (!locationAddOpen) return
    newLocationNameInputRef.current?.focus()
  }, [locationAddOpen])

  const measureLocationPopover = useCallback(() => {
    const btn = locationAddTriggerRef.current
    if (!btn || !locationAddOpen) return
    const rect = btn.getBoundingClientRect()
    const width = Math.min(320, Math.max(240, window.innerWidth - 16))
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
    setLocationPopoverPlacement({ top: rect.top, left, width })
  }, [locationAddOpen])

  const cancelLocationAdd = useCallback(() => {
    setLocationAddOpen(false)
    setNewLocationName('')
    setNewLocationInfo('')
    setLocationPopoverPlacement(null)
  }, [])

  useLayoutEffect(() => {
    if (!locationAddOpen) {
      setLocationPopoverPlacement(null)
      return
    }
    measureLocationPopover()
    const scrollHost = crmDetailTabPanelRef.current
    const ro = new ResizeObserver(() => measureLocationPopover())
    ro.observe(document.documentElement)
    const onScrollOrResize = () => measureLocationPopover()
    window.addEventListener('resize', onScrollOrResize)
    window.addEventListener('scroll', onScrollOrResize, true)
    scrollHost?.addEventListener('scroll', onScrollOrResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
      scrollHost?.removeEventListener('scroll', onScrollOrResize)
    }
  }, [locationAddOpen, measureLocationPopover])

  useEffect(() => {
    if (!locationAddOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancelLocationAdd()
    }
    const onMouseDown = (event: MouseEvent) => {
      const t = event.target as Node
      if (locationAddTriggerRef.current?.contains(t)) return
      if (locationPopoverPanelRef.current?.contains(t)) return
      cancelLocationAdd()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [locationAddOpen, cancelLocationAdd])

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

  const onListScroll = () => {
    const el = listRef.current
    if (!el) return
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 64
    if (!nearBottom) return
    if (safeListPage >= listTotalPages) return
    setListPage((prev) => Math.min(listTotalPages, prev + 1))
  }

  useEffect(() => {
    const root = listRef.current
    const target = loadMoreSentinelRef.current
    if (!root || !target || safeListPage >= listTotalPages) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setListPage((prev) => Math.min(listTotalPages, prev + 1))
      },
      { root, rootMargin: '0px 0px 80px 0px', threshold: 0 },
    )
    io.observe(target)
    return () => io.disconnect()
  }, [safeListPage, listTotalPages, listPageSlice.length, filtersOpen])

  const clearFilters = () => {
    setSearch('')
    setFilterStatus('all')
    setFilterSector('all')
    setFilterByFactoryContext(true)
    setListPage(1)
  }

  const openCreateCustomerDialog = () => {
    setCustomerDialogMode('create')
    setNewOpen(true)
  }

  const openEditCustomerDialog = () => {
    if (!selected) return
    setCustomerDialogMode('edit')
    setNewOpen(true)
  }

  const saveCustomer = (payload: {
    name: string
    code: string
    sector: string
    taxId: string
    city: string
    billingAddress: string
    locations: CrmLocationRow[]
  }) => {
    if (customerDialogMode === 'edit' && selected) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === selected.id
            ? {
                ...row,
                name: payload.name.trim(),
                code: payload.code,
                sector: payload.sector,
                taxId: payload.taxId,
                city: payload.city,
                contactPerson: row.contactPerson || 'Tanımlanmadı',
                iletisim: {
                  ...row.iletisim,
                  adresNotu: payload.billingAddress,
                },
                locations: payload.locations,
              }
            : row,
        ),
      )
    } else {
      const newId = `c-${Date.now()}`
      const now = new Date().toLocaleDateString('tr-TR')
      const newCustomer: CrmCustomer = {
        id: newId,
        name: payload.name.trim(),
        code: payload.code,
        sector: payload.sector,
        lastActivity: 'Az önce',
        status: 'potansiyel',
        openQuotes: 0,
        taxId: payload.taxId,
        createdAt: now,
        owner: 'Ayşe K.',
        city: payload.city,
        notes: '',
        contactPerson: 'Tanımlanmadı',
        lastQuoteDate: '—',
        iletisim: {
          sabitHat: '-',
          infoEmail: '-',
          adresNotu: payload.billingAddress,
          kisiler: [],
        },
        tags: ['Yeni'],
        factories: selectedCodes.length ? [...selectedCodes] : ['IST-HAD'],
        projeler: [],
        teklifler: [],
        dokumanlar: [],
        locations: payload.locations,
      }
      setRows((prev) => [newCustomer, ...prev])
      setSelectedId(newId)
    }
    setNewOpen(false)
  }

  const addLocationToSelected = () => {
    if (!selected) return
    const name = newLocationName.trim()
    const info = newLocationInfo.trim()
    if (!name || !info) return
    const nextLocation: CrmLocationRow = {
      id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      locationInfo: info,
    }
    setRows((prev) =>
      prev.map((row) =>
        row.id === selected.id ? { ...row, locations: [...resolveLocations(row), nextLocation] } : row,
      ),
    )
    setNewLocationName('')
    setNewLocationInfo('')
    setLocationAddOpen(false)
    setLocationPopoverPlacement(null)
  }

  const updateSelectedLocation = (locationId: string, patch: Partial<CrmLocationRow>) => {
    if (!selected) return
    setRows((prev) =>
      prev.map((row) =>
        row.id === selected.id
          ? {
              ...row,
              locations: resolveLocations(row).map((loc) => (loc.id === locationId ? { ...loc, ...patch } : loc)),
            }
          : row,
      ),
    )
  }

  const deleteSelectedLocation = (locationId: string) => {
    if (!selected) return
    setRows((prev) =>
      prev.map((row) =>
        row.id === selected.id
          ? {
              ...row,
              locations: resolveLocations(row).filter((loc) => loc.id !== locationId),
            }
          : row,
      ),
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[1.25rem]">
      <CrmNewCustomerModal
        open={newOpen}
        mode={customerDialogMode}
        initialCustomer={customerDialogMode === 'edit' ? selected : null}
        existingCodes={rows.map((row) => row.code)}
        onSave={saveCustomer}
        onClose={() => setNewOpen(false)}
      />

      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2">
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
                {t('nav.crm')}
              </li>
            </ol>
          </nav>
        </div>

        <div ref={splitRef} className="min-h-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="relative flex h-full min-h-0 min-w-0 overflow-hidden gap-0">
            <section
              className="okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden p-3"
              style={{ width: `calc(${splitRatio}% - 5px)` }}
            >
              <div className="mb-3 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
                <h2 className="min-w-0 shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
                  Müşteriler
                </h2>
                <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                  <FilterToolbarSearch
                    id="crm-list-inline-search"
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Ünvan, kod, vergi no, şehir, kişi…"
                    ariaLabel="Müşterilerde ara"
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
                      <span>Filtrele</span>
                      {activeFilterCount > 0 ? (
                        <span className="rounded-full bg-sky-500/25 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-sky-900 dark:bg-sky-400/20 dark:text-sky-100">
                          {activeFilterCount}
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      onClick={openCreateCustomerDialog}
                      className={[
                        'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40',
                        'border-slate-200/70 bg-white/70 text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200',
                      ].join(' ')}
                    >
                      <Plus className="size-3.5 shrink-0" aria-hidden />
                      <span>Yeni müşteri</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative min-h-0 flex-1 overflow-hidden">
                <aside
                  className={[
                    'absolute inset-y-0 left-0 z-20 w-64 overflow-y-auto rounded-xl border border-slate-200/70 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-transform dark:border-slate-700/70 dark:bg-slate-900/95',
                    filtersOpen ? 'translate-x-0' : '-translate-x-[105%]',
                  ].join(' ')}
                  aria-hidden={!filtersOpen}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Müşteri filtreleri</h4>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Arama, durum, sektör</p>
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
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Ara
                      </span>
                      <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Ünvan, kod, vergi no, şehir, kişi…"
                        className="okan-liquid-input mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                          Durum
                        </span>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="okan-liquid-select mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none"
                        >
                          <option value="all">Tümü</option>
                          <option value="aktif">Aktif</option>
                          <option value="beklemede">Beklemede</option>
                          <option value="pasif">Pasif</option>
                          <option value="potansiyel">Potansiyel</option>
                        </select>
                      </label>
                      <label>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                          Sektör (P1)
                        </span>
                        <select
                          value={filterSector}
                          onChange={(e) => setFilterSector(e.target.value)}
                          className="okan-liquid-select mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none"
                        >
                          <option value="all">Tümü</option>
                          <option value="Konut">Konut</option>
                          <option value="Altyapı">Altyapi</option>
                          <option value="Endüstriyel">Endustriyel</option>
                        </select>
                      </label>
                    </div>
                    <NeoSwitch
                      id={filterId}
                      label={`Fabrika bağlamına göre daralt (${selectedCodes.join(', ')})`}
                      checked={filterByFactoryContext}
                      onChange={setFilterByFactoryContext}
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      P1 — Üst seçici fabrika ile müşteri fabrika listesinin kesişimi (mock).
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="okan-liquid-btn-secondary w-full px-4 py-2.5 text-sm font-semibold sm:w-auto"
                    >
                      Sıfırla
                    </button>
                  </div>
                </aside>

                {list.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-6 text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Filtreye uygun müşteri bulunamadı.</p>
                    <button
                      type="button"
                      onClick={openCreateCustomerDialog}
                      className="okan-liquid-btn-primary px-5 py-2.5 text-sm font-semibold"
                    >
                      Yeni müşteri
                    </button>
                  </div>
                ) : (
                  <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                    <ul
                      ref={listRef}
                      className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1 transition-[padding] duration-300"
                      style={{ paddingLeft: filtersOpen ? '15.75rem' : '0' }}
                      onScroll={onListScroll}
                    >
                      {listPageSlice.map((row) => (
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
                            {row.code} · {row.city}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className={statusPill(row.status)}>{statusLabel(row.status)}</span>
                            {row.openQuotes > 0 ? (
                              <span className="text-[10px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                                {row.openQuotes} açık teklif
                              </span>
                            ) : null}
                          </p>
                        </button>
                        <button
                          type="button"
                          title="Tam müşteri detay sayfası"
                          onClick={() => navigate(`/musteri-detay/${row.id}`, { state: { fromCrmList: true } })}
                          className="inline-flex shrink-0 items-center gap-0.5 self-center rounded-md px-1.5 py-1 text-[11px] font-medium leading-none text-slate-500 transition hover:bg-slate-500/10 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                        >
                          Detay
                          <ChevronRight className="size-3 opacity-70" strokeWidth={2} aria-hidden />
                        </button>
                      </li>
                      ))}
                      {safeListPage < listTotalPages ? <li ref={loadMoreSentinelRef} className="h-5" aria-hidden /> : null}
                    </ul>
                    <div className="mt-1.5 flex shrink-0 items-center justify-between gap-2 border-t border-slate-200/35 pt-2.5 text-[11px] dark:border-slate-600/35">
                      <span className="text-slate-600 dark:text-slate-300">
                        {listPageStart}-{listPageEnd} / {list.length} sonuç
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-slate-500 dark:text-slate-400">Sayfa boyutu:</label>
                        <select
                          value={pageSize}
                          onChange={(event) => setPageSize(Number(event.target.value))}
                          className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                        >
                          <option value={6}>6</option>
                          <option value={8}>8</option>
                          <option value={12}>12</option>
                          <option value={16}>16</option>
                        </select>
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
                  {isResizing || isResizerHover ? <ChevronsLeftRight className="size-3.5" /> : <GripVertical className="size-3.5" />}
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
                        Seçili müşteri
                      </p>
                      <h3 className="mt-1.5 text-xl font-semibold leading-tight text-slate-900 dark:text-slate-50">
                        {selected.name}
                      </h3>
                      <p className="mt-1 text-sm leading-snug text-slate-600 dark:text-slate-300">
                        {selected.code} · {selected.city} · Satış: {selected.owner}
                      </p>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={openEditCustomerDialog}
                          className="inline-flex items-center rounded-lg border border-slate-200/70 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Müşteriyi düzenle
                        </button>
                      </div>
                    </header>

                    <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-0.5">
                      <div
                        className="okan-liquid-pill-track flex max-w-full gap-1 overflow-x-auto rounded-full p-1"
                        role="tablist"
                        aria-label="Seçili müşteri detay sekmeleri"
                        aria-orientation="horizontal"
                      >
                        {detailTabDefs.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            id={`crm-detail-tab-${tab.id}`}
                            aria-selected={detailTab === tab.id}
                            aria-controls="crm-detail-panel"
                            tabIndex={detailTab === tab.id ? 0 : -1}
                            onClick={() => setDetailTab(tab.id)}
                            className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                              detailTab === tab.id
                                ? 'okan-liquid-pill-active okan-project-tab-active text-slate-900 dark:text-slate-50'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      ref={crmDetailTabPanelRef}
                      key={detailTab}
                      id="crm-detail-panel"
                      role="tabpanel"
                      aria-labelledby={`crm-detail-tab-${detailTab}`}
                      className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-center sm:px-1"
                    >
                      {detailTab === 'genel' ? (
                        <div className="flex flex-col divide-y divide-slate-200/25 dark:divide-white/10">
                          <div className="pb-4 pt-0">
                            {selected.tags.length > 0 ? (
                              <div className="mb-4 flex flex-wrap justify-center gap-1.5">
                                {selected.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800 dark:text-slate-100"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            <dl className="mx-auto grid max-w-sm grid-cols-2 justify-items-center gap-x-6 gap-y-4 text-base sm:max-w-md sm:gap-x-10">
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Durum</dt>
                                <dd className="mt-0.5 font-medium leading-snug text-slate-900 dark:text-slate-50">
                                  {statusLabel(selected.status)}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Sektör</dt>
                                <dd className="mt-0.5 font-medium leading-snug text-slate-900 dark:text-slate-50">
                                  {selected.sector}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Vergi no</dt>
                                <dd className="mt-0.5 font-mono text-sm font-medium leading-snug text-slate-900 dark:text-slate-50">
                                  {selected.taxId}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Açık teklif</dt>
                                <dd className="mt-0.5 font-medium tabular-nums leading-snug text-slate-900 dark:text-slate-50">
                                  {selected.openQuotes}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">İlgili kişi</dt>
                                <dd className="mt-0.5 font-medium leading-snug text-slate-900 dark:text-slate-50">
                                  {selected.contactPerson}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Kayıt</dt>
                                <dd className="mt-0.5 font-medium leading-snug text-slate-900 dark:text-slate-50">
                                  {selected.createdAt}
                                </dd>
                              </div>
                            </dl>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                              Son teklif: {selected.lastQuoteDate} · Son aktivite: {selected.lastActivity}
                            </p>
                          </div>
                          <div className="pt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Son 3 hareket (mock)
                            </p>
                            <ul className="mx-auto mt-3 max-w-lg divide-y divide-slate-200/20 text-left dark:divide-white/10">
                              <li className="flex justify-center gap-3 py-2.5 text-sm leading-snug text-slate-700 first:pt-0 dark:text-slate-200 sm:justify-start">
                                <span className="w-14 shrink-0 tabular-nums text-slate-500 dark:text-slate-400">Bugün</span>
                                <span className="min-w-0 flex-1">Teklif taslağı güncellendi (mock)</span>
                              </li>
                              <li className="flex justify-center gap-3 py-2.5 text-sm leading-snug text-slate-700 dark:text-slate-200 sm:justify-start">
                                <span className="w-14 shrink-0 tabular-nums text-slate-500 dark:text-slate-400">Dün</span>
                                <span className="min-w-0 flex-1">Arama kaydı (mock)</span>
                              </li>
                              <li className="flex justify-center gap-3 py-2.5 text-sm leading-snug text-slate-700 dark:text-slate-200 sm:justify-start">
                                <span className="w-14 shrink-0 tabular-nums text-slate-500 dark:text-slate-400">15 Mar</span>
                                <span className="min-w-0 flex-1">Toplantı notu (mock) · {selected.owner}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      ) : null}

                      {detailTab === 'iletisim' ? (
                        <div className="flex flex-col gap-6 text-left">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Şirket iletişim
                            </p>
                            <ul className="mx-auto mt-3 max-w-lg divide-y divide-slate-200/25 text-left dark:divide-white/10">
                              <li className="flex items-start justify-center gap-3 py-3 first:pt-0 sm:justify-start">
                                <MapPin className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
                                <div className="min-w-0 text-left">
                                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Şehir</p>
                                  <p className="font-medium text-slate-900 dark:text-slate-50">{selected.city}</p>
                                  {selected.iletisim.adresNotu ? (
                                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                      {selected.iletisim.adresNotu}
                                    </p>
                                  ) : null}
                                </div>
                              </li>
                              <li className="flex items-start justify-center gap-3 py-3 sm:justify-start">
                                <Phone className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
                                <div>
                                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sabit hat</p>
                                  <a
                                    href={`tel:${selected.iletisim.sabitHat.replace(/\s/g, '')}`}
                                    className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-50"
                                  >
                                    {selected.iletisim.sabitHat}
                                  </a>
                                </div>
                              </li>
                              {selected.iletisim.faks ? (
                                <li className="flex items-start justify-center gap-3 py-3 sm:justify-start">
                                  <Phone className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
                                  <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Faks</p>
                                    <p className="font-medium text-slate-900 dark:text-slate-50">{selected.iletisim.faks}</p>
                                  </div>
                                </li>
                              ) : null}
                              <li className="flex items-start justify-center gap-3 py-3 sm:justify-start">
                                <Mail className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">E-posta</p>
                                  <a
                                    href={`mailto:${selected.iletisim.infoEmail}`}
                                    className="break-all font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-50"
                                  >
                                    {selected.iletisim.infoEmail}
                                  </a>
                                </div>
                              </li>
                              {selected.iletisim.web ? (
                                <li className="flex items-start justify-center gap-3 py-3 sm:justify-start">
                                  <Globe className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Web</p>
                                    <a
                                      href={`https://${selected.iletisim.web.replace(/^https?:\/\//, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="break-all font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-50"
                                    >
                                      {selected.iletisim.web}
                                    </a>
                                  </div>
                                </li>
                              ) : null}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              İlgili kişiler
                            </p>
                            <ul className="mx-auto mt-3 max-w-lg divide-y divide-slate-200/25 text-left dark:divide-white/10">
                              {selected.iletisim.kisiler.map((k) => (
                                <li key={k.id} className="py-3 first:pt-0">
                                  <p className="font-medium text-slate-900 dark:text-slate-50">
                                    <User className="me-1 inline size-3.5 align-[-0.1em] text-slate-500" aria-hidden />
                                    {k.adSoyad}
                                    {k.birincil ? (
                                      <span className="ms-2 inline-flex rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-900 dark:bg-sky-400/15 dark:text-sky-100">
                                        Birincil
                                      </span>
                                    ) : null}
                                  </p>
                                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{k.gorev}</p>
                                  <p className="mt-1 text-sm">
                                    <a
                                      href={`tel:${k.cep.replace(/\s/g, '')}`}
                                      className="text-slate-800 underline-offset-2 hover:underline dark:text-slate-100"
                                    >
                                      {k.cep}
                                    </a>
                                    <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                                    <a
                                      href={`mailto:${k.email}`}
                                      className="break-all text-slate-800 underline-offset-2 hover:underline dark:text-slate-100"
                                    >
                                      {k.email}
                                    </a>
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : null}

                      {detailTab === 'lokasyonlar' ? (
                        <div className="mx-auto flex w-full max-w-xl flex-col gap-5 text-left">
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Lokasyonlar</p>
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Şantiye veya ofis kayıtlarını güncel tutun; proje oluştururken bu liste kullanılır.
                              </p>
                            </div>
                          </div>

                          <div className="self-start">
                            <button
                              ref={locationAddTriggerRef}
                              type="button"
                              onClick={() => setLocationAddOpen((open) => !open)}
                              aria-expanded={locationAddOpen}
                              aria-haspopup="dialog"
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white/90 dark:border-slate-600/60 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-900/60"
                            >
                              <Plus className="size-4 shrink-0" aria-hidden />
                              Lokasyon ekle
                            </button>
                          </div>

                          {locationAddOpen && locationPopoverPlacement
                            ? createPortal(
                                <>
                                  <button
                                    type="button"
                                    className="fixed inset-0 z-[96] cursor-default bg-slate-950/25 backdrop-blur-[2px] dark:bg-slate-950/40"
                                    aria-label="Kapat"
                                    onMouseDown={(event) => {
                                      event.preventDefault()
                                      cancelLocationAdd()
                                    }}
                                  />
                                  <div
                                    ref={locationPopoverPanelRef}
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="crm-location-add-title"
                                    style={{
                                      top: locationPopoverPlacement.top,
                                      left: locationPopoverPlacement.left,
                                      width: locationPopoverPlacement.width,
                                    }}
                                    className="fixed z-[100] -translate-y-[calc(100%+0.5rem)] rounded-2xl border border-white/20 bg-white/10 p-3 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-black/30 dark:ring-white/10"
                                  >
                                    <div className="flex items-start justify-between gap-2 border-b border-slate-200/40 pb-2.5 dark:border-white/10">
                                      <p
                                        id="crm-location-add-title"
                                        className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50"
                                      >
                                        Yeni lokasyon
                                      </p>
                                      <button
                                        type="button"
                                        onClick={cancelLocationAdd}
                                        className="rounded-lg p-1 text-slate-500 transition hover:bg-white/50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
                                        aria-label="Kapat"
                                      >
                                        <X className="size-4" aria-hidden />
                                      </button>
                                    </div>
                                    <div className="mt-3 flex flex-col gap-3">
                                      <label className="block min-w-0">
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                          Lokasyon adı
                                        </span>
                                        <input
                                          ref={newLocationNameInputRef}
                                          type="text"
                                          value={newLocationName}
                                          onChange={(event) => setNewLocationName(event.target.value)}
                                          placeholder="Örn. İstanbul şantiyesi"
                                          className={`mt-1 ${crmLocationFieldInputClass}`}
                                        />
                                      </label>
                                      <label className="block min-w-0">
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                          Adres / konum
                                        </span>
                                        <input
                                          type="text"
                                          value={newLocationInfo}
                                          onChange={(event) => setNewLocationInfo(event.target.value)}
                                          placeholder="İl, ilçe, açık adres…"
                                          className={`mt-1 ${crmLocationFieldInputClass}`}
                                          onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                              event.preventDefault()
                                              addLocationToSelected()
                                            }
                                          }}
                                        />
                                      </label>
                                      <div className="flex flex-wrap justify-end gap-2 pt-0.5">
                                        <button
                                          type="button"
                                          onClick={cancelLocationAdd}
                                          className="okan-liquid-btn-secondary rounded-full px-3 py-2 text-xs font-semibold"
                                        >
                                          Vazgeç
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => addLocationToSelected()}
                                          className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                                        >
                                          Kaydet
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </>,
                                document.body,
                              )
                            : null}

                          {selectedLocations.length > 0 ? (
                            <ul
                              className="divide-y divide-slate-200/30 dark:divide-white/10"
                              role="list"
                            >
                              {selectedLocations.map((location) => (
                                <li
                                  key={location.id}
                                  className="grid grid-cols-1 gap-2 py-3 first:pt-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-x-3"
                                >
                                  <input
                                    type="text"
                                    value={location.name}
                                    onChange={(event) =>
                                      updateSelectedLocation(location.id, { name: event.target.value })
                                    }
                                    aria-label="Lokasyon adı"
                                    className={crmLocationFieldInputClass}
                                  />
                                  <input
                                    type="text"
                                    value={location.locationInfo}
                                    onChange={(event) =>
                                      updateSelectedLocation(location.id, { locationInfo: event.target.value })
                                    }
                                    aria-label="Adres"
                                    className={crmLocationFieldInputClass}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => deleteSelectedLocation(location.id)}
                                    className="inline-flex size-9 shrink-0 items-center justify-self-end rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-600 sm:justify-self-center dark:hover:text-rose-400"
                                    aria-label="Lokasyonu kaldır"
                                  >
                                    <Trash2 className="size-4" aria-hidden />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="rounded-lg border border-dashed border-slate-200/60 px-3 py-6 text-center text-xs text-slate-500 dark:border-slate-600/50 dark:text-slate-400">
                              Henüz kayıtlı lokasyon yok. «Lokasyon ekle» ile ekleyin.
                            </p>
                          )}
                        </div>
                      ) : null}

                      {detailTab === 'projeler' ? (
                        <div className="flex flex-col text-left">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Bağlı projeler
                          </p>
                          <ul className="mx-auto mt-3 w-full max-w-lg divide-y divide-slate-200/25 dark:divide-white/10">
                            {selected.projeler.map((p) => (
                              <li
                                key={p.id}
                                className="flex flex-col items-center gap-1 py-3 text-sm first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <span className="min-w-0 max-w-full flex-1 text-center font-medium text-slate-800 dark:text-slate-100 sm:text-left">
                                  {p.name}
                                </span>
                                <span className="shrink-0 text-slate-600 dark:text-slate-300">{p.phase}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {detailTab === 'teklifler' ? (
                        <div className="flex flex-col text-left">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Teklifler
                          </p>
                          <ul className="mx-auto mt-3 w-full max-w-lg divide-y divide-slate-200/25 dark:divide-white/10" role="list">
                            {selected.teklifler.map((q) => (
                              <li
                                key={q.id}
                                className="flex flex-col items-stretch gap-1 py-3 text-sm first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                              >
                                <span className="min-w-0 flex-1 text-center font-mono text-xs font-medium text-slate-800 sm:text-left dark:text-slate-100">
                                  {q.no}
                                </span>
                                <span className="text-center text-slate-600 sm:text-left dark:text-slate-300">{q.date}</span>
                                <span className="text-center tabular-nums text-slate-800 dark:text-slate-100">{q.amount}</span>
                                <span className="text-center text-slate-700 dark:text-slate-200">{q.status}</span>
                              </li>
                            ))}
                          </ul>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/musteri-detay/${selected.id}`, { state: { fromCrmList: true } })
                            }
                            className="mt-4 text-center text-sm font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-400"
                          >
                            Müşteri detayında teklifleri aç
                          </button>
                        </div>
                      ) : null}

                      {detailTab === 'notlar' ? (
                        <div className="flex flex-col">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Notlar
                          </p>
                          <div className="mx-auto mt-4 flex max-w-lg items-start justify-center gap-2 text-left sm:justify-start">
                            <StickyNote className="mt-0.5 size-5 shrink-0 text-slate-500" aria-hidden />
                            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
                              {selected.notes || 'Not yok.'}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {detailTab === 'dokumanlar' ? (
                        <div className="flex flex-col text-left">
                          {selected.dokumanlar.length === 0 ? (
                            <p className="text-sm text-slate-600 dark:text-slate-300">Henüz doküman yok (mock).</p>
                          ) : (
                            <>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Dosyalar
                              </p>
                              <ul className="mx-auto mt-3 max-w-lg divide-y divide-slate-200/25 text-left dark:divide-white/10" role="list">
                                {selected.dokumanlar.map((d) => (
                                  <li
                                    key={d.id}
                                    className="flex flex-col items-center gap-2 py-3 text-sm first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                                  >
                                    <span className="min-w-0 max-w-full flex-1 truncate text-center font-medium text-slate-800 sm:text-left dark:text-slate-100">
                                      {d.name}
                                    </span>
                                    <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                                      {d.size} · {d.uploadedAt}
                                    </span>
                                    <button
                                      type="button"
                                      className="okan-liquid-btn-secondary shrink-0 px-2.5 py-1.5 text-xs font-semibold"
                                    >
                                      Aç
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400 sm:text-left">
                            P1 — indirme yok (prototip).
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">Müşteri seçin veya listeyi yükleyin.</p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
