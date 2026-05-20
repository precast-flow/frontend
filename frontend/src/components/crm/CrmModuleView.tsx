import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import {
  crmCustomers,
  statusLabel,
  type CrmCustomer,
  type CrmDocRow,
  type CrmIletisimKisi,
  type CrmLocationRow,
} from '../../data/crmCustomers'
import { useFactoryContext } from '../../context/FactoryContext'
import { CrmNewCustomerModal, type CustomerDraft } from './CrmNewCustomerModal'
import { useCrmReminderWatcher } from './useCrmReminderWatcher'
import { CRM_TARGET_AUDIENCES } from '../../data/crmFormOptions'
import { removeCrmReminder, upsertCrmReminder } from '../../data/crmReminders'
import { NeoSwitch } from '../NeoSwitch'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import { SplitListPaginationNav } from '../shared/SplitListPaginationNav'
import {
  eiSplitFilterToggleClass,
  eiSplitHeaderButtonPassive,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import {
  ManagementModuleShell,
  useManagementModulePage,
  managementModuleDetailPanelClass,
  managementModuleListPanelClass,
  managementModuleListTitleClass,
  managementModuleListToolbarClass,
  managementModuleSplitRowClass,
  splitDetailHeaderClass,
  splitListCardClass,
  splitTabPill,
  useSplitPaneDrag,
  useSplitPaneRatio,
} from '../shared/splitModuleStyles'
import { SplitListCollapseToggle } from '../shared/layout/SplitListCollapseToggle'
import { SPLIT_LIST_RAIL_PX, useSplitListCollapsed } from '../shared/layout/useSplitListCollapsed'
import { AppDialog, AppDialogButton, appDialogFieldClass, appDialogLabelClass } from '../shared/AppDialog'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'

type Props = {
  onNavigate: (moduleId: string) => void
}

const CRM_LIST_PAGE_SIZE = 6

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

function generateCandidateCode(name: string, existingCodes: string[]): string {
  const base = name
    .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X')
  let attempt = `A-${base}`
  let n = 1
  while (existingCodes.some((c) => c.toUpperCase() === attempt)) {
    attempt = `A-${base}${n}`
    n += 1
  }
  return attempt.slice(0, 8)
}

function mapContactsFromDraft(persons: CustomerDraft['contactPersons']): CrmIletisimKisi[] {
  return persons
    .filter((p) => p.adSoyad.trim() && p.telefon.trim())
    .map((p, index) => ({
      id: p.id,
      adSoyad: p.adSoyad.trim(),
      gorev: p.unvan.trim(),
      cep: p.telefon.trim(),
      email: p.email.trim(),
      notlar: p.notlar.trim() || undefined,
      birincil: index === 0,
    }))
}

function mapDocsFromDraft(docs: CustomerDraft['pendingDocs']): CrmDocRow[] {
  const now = new Date().toLocaleDateString('tr-TR')
  return docs.map((d) => ({
    id: d.id,
    type: 'Rapor',
    name: d.name,
    size: d.size,
    ext: d.name.includes('.') ? (d.name.split('.').pop() ?? 'dosya') : 'dosya',
    uploadedAt: now,
    uploadedBy: 'CRM',
    revision: 'A',
    note: 'Aday müşteri oluşturma',
    previewUrl: '',
  }))
}

function buildCustomerFromDraft(
  payload: CustomerDraft,
  existing: Partial<CrmCustomer> & { id: string; code: string },
  existingCodes: string[],
): CrmCustomer {
  const contacts = mapContactsFromDraft(payload.contactPersons)
  const primary = contacts.find((c) => c.birincil) ?? contacts[0]
  const audienceLabels = CRM_TARGET_AUDIENCES.filter((a) => payload.targetAudienceIds.includes(a.id)).map(
    (a) => a.label,
  )
  const fullAddress = `${payload.openAddress.trim()}, ${payload.district}, ${payload.province}`

  return {
    id: existing.id,
    name: payload.name.trim(),
    code: existing.code || generateCandidateCode(payload.name, existingCodes),
    sector: existing.sector ?? '—',
    lastActivity: 'Az önce',
    status: existing.status ?? 'potansiyel',
    openQuotes: existing.openQuotes ?? 0,
    taxId: payload.taxId.trim(),
    createdAt: existing.createdAt ?? new Date().toLocaleDateString('tr-TR'),
    owner: existing.owner ?? 'Ayşe K.',
    city: payload.province,
    notes: payload.meetingNotes.trim(),
    contactPerson: primary?.adSoyad ?? 'Tanımlanmadı',
    lastQuoteDate: existing.lastQuoteDate ?? '—',
    iletisim: {
      sabitHat: primary?.cep ?? '-',
      infoEmail: primary?.email ?? '-',
      adresNotu: fullAddress,
      kisiler: contacts,
    },
    tags: [...new Set([...(existing.tags ?? []), 'Aday', ...audienceLabels.slice(0, 2)])],
    factories: existing.factories ?? [],
    projeler: existing.projeler ?? [],
    teklifler: existing.teklifler ?? [],
    dokumanlar: [...(existing.dokumanlar ?? []), ...mapDocsFromDraft(payload.pendingDocs)],
    locations: existing.locations,
    province: payload.province,
    district: payload.district,
    openAddress: payload.openAddress.trim(),
    stampImageUrl: payload.stampImageUrl,
    customerPotential: payload.customerPotential || undefined,
    targetAudienceIds: payload.targetAudienceIds,
    meetingMethod: payload.meetingMethod,
    meetingNotes: payload.meetingNotes.trim(),
    reminder: payload.reminderEnabled
      ? { enabled: true, note: payload.reminderNote.trim(), date: payload.reminderDate }
      : undefined,
  }
}

export function CrmModuleView({ onNavigate: _onNavigate }: Props) {
  void _onNavigate
  useCrmReminderWatcher(true)
  const { gl, neutralShell } = useManagementModulePage('crm')
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
  const pageSize = CRM_LIST_PAGE_SIZE
  const {
    isResizing,
    setIsResizing,
    resetRatio,
    leftWidthStyle,
    setRatioFromPointer,
  } = useSplitPaneRatio('crm-module')
  const [isResizerHover, setIsResizerHover] = useState(false)
  const [newLocationName, setNewLocationName] = useState('')
  const [newLocationInfo, setNewLocationInfo] = useState('')
  const [locationAddOpen, setLocationAddOpen] = useState(false)
  const newLocationNameInputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const splitRef = useRef<HTMLDivElement | null>(null)
  useSplitPaneDrag(splitRef, { isResizing, setIsResizing, setRatioFromPointer })
  const { collapsed: listCollapsed, toggle: toggleListCollapsed } = useSplitListCollapsed('crm-module')
  const listPanelStyle = listCollapsed
    ? { width: SPLIT_LIST_RAIL_PX, minWidth: SPLIT_LIST_RAIL_PX, maxWidth: SPLIT_LIST_RAIL_PX }
    : leftWidthStyle

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
    const start = (safeListPage - 1) * pageSize
    return list.slice(start, start + pageSize)
  }, [list, safeListPage, pageSize])
  const listPageStart = list.length === 0 ? 0 : (safeListPage - 1) * pageSize + 1
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

  const cancelLocationAdd = useCallback(() => {
    setLocationAddOpen(false)
    setNewLocationName('')
    setNewLocationInfo('')
  }, [])

  useEffect(() => {
    if (!filtersOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [filtersOpen])

  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }, [safeListPage, pageSize])

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

  const syncReminder = (customerId: string, customerName: string, payload: CustomerDraft) => {
    if (payload.reminderEnabled && payload.reminderDate) {
      upsertCrmReminder({
        id: `rem-${customerId}`,
        customerId,
        customerName,
        note: payload.reminderNote.trim(),
        dueDate: payload.reminderDate,
        notified: false,
      })
    } else {
      removeCrmReminder(customerId)
    }
  }

  const saveCustomer = (payload: CustomerDraft) => {
    const codes = rows.map((row) => row.code)
    if (customerDialogMode === 'edit' && selected) {
      const updated = buildCustomerFromDraft(payload, selected, codes)
      setRows((prev) => prev.map((row) => (row.id === selected.id ? updated : row)))
      syncReminder(updated.id, updated.name, payload)
    } else {
      const newId = `c-${Date.now()}`
      const newCustomer = buildCustomerFromDraft(
        payload,
        {
          id: newId,
          code: generateCandidateCode(payload.name, codes),
          factories: selectedCodes.length ? [...selectedCodes] : ['IST-HAD'],
          tags: ['Yeni'],
        },
        codes,
      )
      setRows((prev) => [newCustomer, ...prev])
      setSelectedId(newId)
      syncReminder(newId, newCustomer.name, payload)
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
    <>
    <ManagementModuleShell neutralShell={neutralShell} gl={gl}>
          <div
            ref={splitRef}
            data-split-dragging={isResizing ? 'true' : undefined}
            className={managementModuleSplitRowClass(gl)}
          >
            <section
              className={managementModuleListPanelClass(gl)}
              style={listPanelStyle}
            >
              {listCollapsed ? (
                <div className="flex h-full flex-col items-center gap-2 py-2">
                  <SplitListCollapseToggle collapsed={listCollapsed} onToggle={toggleListCollapsed} />
                </div>
              ) : (
              <>
              <div className={managementModuleListToolbarClass}>
                <div className="flex min-w-0 items-center gap-1.5">
                  <SplitListCollapseToggle collapsed={listCollapsed} onToggle={toggleListCollapsed} />
                  <h2 className={managementModuleListTitleClass}>
                    Müşteriler
                  </h2>
                </div>
                <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                  <FilterToolbarSearch
                    id="crm-list-inline-search"
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Ünvan, kod, vergi no, şehir, kişi…"
                    ariaLabel="Müşterilerde ara"
                    className={gl ? 'project-mgmt-toolbar-search' : ''}
                    inputClassName={gl ? 'glass-input' : ''}
                  />
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFiltersOpen((v) => !v)}
                      aria-expanded={filtersOpen}
                      className={eiSplitFilterToggleClass(filtersOpen)}
                    >
                      <Filter className="size-3.5 shrink-0" aria-hidden />
                      <span>Filtrele</span>
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
                    <button
                      type="button"
                      onClick={openCreateCustomerDialog}
                      className={eiSplitHeaderButtonPassive}
                    >
                      <Plus className="size-3.5 shrink-0" aria-hidden />
                      <span>Aday müşteri</span>
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
                      <h4 className="text-sm font-semibold text-black dark:text-white">Müşteri filtreleri</h4>
                      <p className="mt-1 text-[11px] text-black/60 dark:text-white/65">Arama, durum, sektör</p>
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
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">
                        Ara
                      </span>
                      <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Ünvan, kod, vergi no, şehir, kişi…"
                        className={
                          gl
                            ? 'glass-input mt-2 w-full'
                            : 'okan-liquid-input mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none'
                        }
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">
                          Durum
                        </span>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className={
                            gl
                              ? 'glass-input mt-2 w-full'
                              : 'okan-liquid-select mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none'
                          }
                        >
                          <option value="all">Tümü</option>
                          <option value="aktif">Aktif</option>
                          <option value="beklemede">Beklemede</option>
                          <option value="pasif">Pasif</option>
                          <option value="potansiyel">Potansiyel</option>
                        </select>
                      </label>
                      <label>
                        <span className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">
                          Sektör (P1)
                        </span>
                        <select
                          value={filterSector}
                          onChange={(e) => setFilterSector(e.target.value)}
                          className={
                            gl
                              ? 'glass-input mt-2 w-full'
                              : 'okan-liquid-select mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none'
                          }
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
                    <p className="text-[11px] text-black/60 dark:text-white/65">
                      P1 — Üst seçici fabrika ile müşteri fabrika listesinin kesişimi (mock).
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className={
                        gl
                          ? ['glass-btn', 'secondary', 'small', 'w-full', 'sm:w-auto'].join(' ')
                          : 'okan-liquid-btn-secondary w-full px-4 py-2.5 text-sm font-semibold sm:w-auto'
                      }
                    >
                      Sıfırla
                    </button>
                  </div>
                </aside>

                {list.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-6 text-center">
                    <p
                      className={
                        gl
                          ? 'text-sm text-black dark:text-white/80'
                          : 'text-sm text-black/80 dark:text-white/80'
                      }
                    >
                      Filtreye uygun müşteri bulunamadı.
                    </p>
                    <button
                      type="button"
                      onClick={openCreateCustomerDialog}
                      className={eiSplitHeaderButtonPassive}
                    >
                      Aday müşteri
                    </button>
                  </div>
                ) : (
                  <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                    <ul
                      ref={listRef}
                      className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1 transition-[padding] duration-100 ease-out"
                      style={{ paddingLeft: filtersOpen ? '18.5rem' : '0' }}
                    >
                      {listPageSlice.map((row) => (
                      <li
                        key={row.id}
                        className={splitListCardClass(selected?.id === row.id, 'flex min-h-0 shrink-0 items-stretch gap-1.5 px-2 py-1.5')}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedId(row.id)}
                          aria-current={selected?.id === row.id ? 'true' : undefined}
                          className="min-w-0 flex-1 rounded-md px-0.5 py-0.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                        >
                          <p className="truncate text-sm font-semibold leading-snug text-black dark:text-white">
                            {row.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-black/70 dark:text-white/70">
                            {row.code} · {row.city}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className={statusPill(row.status)}>{statusLabel(row.status)}</span>
                            {row.openQuotes > 0 ? (
                              <span className="text-[10px] font-medium tabular-nums text-black/55 dark:text-white/65">
                                {row.openQuotes} açık teklif
                              </span>
                            ) : null}
                          </p>
                        </button>
                        <button
                          type="button"
                          title="Tam müşteri detay sayfası"
                          onClick={() => navigate(`/musteri-detay/${row.id}`, { state: { fromCrmList: true } })}
                          className={`${eiSplitHeaderButtonPassive} ml-auto shrink-0 self-center py-1 pl-2 pr-2 text-[11px]`}
                        >
                          Detay
                          <ChevronRight className="size-3 opacity-70" strokeWidth={2} aria-hidden />
                        </button>
                      </li>
                      ))}
                    </ul>
                    {gl ? (
                      <div className="glass-card glass-card--static project-mgmt-footer-panel sticky bottom-0 z-10 mt-2 shrink-0 text-xs">
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                          <p className="text-black dark:text-white/80">
                            <span className="tabular-nums font-semibold text-black dark:text-white">
                              {listPageStart}
                            </span>
                            -
                            <span className="tabular-nums font-semibold text-black dark:text-white">
                              {listPageEnd}
                            </span>{' '}
                            /{' '}
                            <span className="tabular-nums font-semibold text-black dark:text-white">
                              {list.length}
                            </span>{' '}
                            sonuç
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <SplitListPaginationNav
                              safePage={safeListPage}
                              pageCount={listTotalPages}
                              onPrev={() => setListPage((p) => Math.max(1, p - 1))}
                              onNext={() => setListPage((p) => Math.min(listTotalPages, p + 1))}
                              gl
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                    <div className="mt-1.5 flex shrink-0 flex-col gap-2 border-t border-black/15 pt-2.5 text-[11px] dark:border-white/12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                      <span className="text-black/75 dark:text-white/80">
                        {listPageStart}-{listPageEnd} / {list.length} sonuç
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <SplitListPaginationNav
                          safePage={safeListPage}
                          pageCount={listTotalPages}
                          onPrev={() => setListPage((p) => Math.max(1, p - 1))}
                          onNext={() => setListPage((p) => Math.min(listTotalPages, p + 1))}
                          buttonStyle="legacy"
                          pageIndicatorClassName="tabular-nums text-black/70 dark:text-white/75"
                        />
                      </div>
                    </div>
                    )}
                  </div>
                )}
              </div>
              </>
              )}
            </section>

            {!listCollapsed ? (
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
                  {isResizing || isResizerHover ? <ChevronsLeftRight className="size-3.5" /> : <GripVertical className="size-3.5" />}
                </span>
              </button>
            </div>
            ) : null}

            <aside
              ref={detailPanelRef}
              className={managementModuleDetailPanelClass(gl)}
            >
              {selected ? (
                <div key={selected.id} className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
                  <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 lg:max-w-3xl">
                    <header className={splitDetailHeaderClass}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                        Seçili müşteri
                      </p>
                      <h3 className="mt-1.5 text-xl font-semibold leading-tight text-black dark:text-white">
                        {selected.name}
                      </h3>
                      <p className="mt-1 text-sm leading-snug text-black/75 dark:text-white/80">
                        {selected.code} · {selected.city} · Satış: {selected.owner}
                      </p>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={openEditCustomerDialog}
                          className={`${eiSplitHeaderButtonPassive} mt-2`}
                        >
                          Müşteriyi düzenle
                        </button>
                      </div>
                    </header>

                    <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
                      <div
                        className="flex max-w-full gap-1 overflow-x-auto"
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
                            className={splitTabPill(detailTab === tab.id)}
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
                              type="button"
                              onClick={() => setLocationAddOpen(true)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white/90 dark:border-slate-600/60 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-900/60"
                            >
                              <Plus className="size-4 shrink-0" aria-hidden />
                              Lokasyon ekle
                            </button>
                          </div>

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
                <p className="text-sm text-black/80 dark:text-white/80">Müşteri seçin veya listeyi yükleyin.</p>
              )}
            </aside>
          </div>
    </ManagementModuleShell>
    <AppDialog
      open={locationAddOpen}
      size="sm"
      title="Yeni lokasyon"
      closeLabel="Kapat"
      onClose={cancelLocationAdd}
      footer={
        <>
          <AppDialogButton variant="secondary" onClick={cancelLocationAdd}>
            Vazgeç
          </AppDialogButton>
          <AppDialogButton variant="primary" onClick={() => addLocationToSelected()}>
            Kaydet
          </AppDialogButton>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <label className="block min-w-0">
          <span className={appDialogLabelClass}>Lokasyon adı</span>
          <input
            ref={newLocationNameInputRef}
            type="text"
            value={newLocationName}
            onChange={(event) => setNewLocationName(event.target.value)}
            placeholder="Örn. İstanbul şantiyesi"
            className={appDialogFieldClass}
          />
        </label>
        <label className="block min-w-0">
          <span className={appDialogLabelClass}>Adres / konum</span>
          <input
            type="text"
            value={newLocationInfo}
            onChange={(event) => setNewLocationInfo(event.target.value)}
            placeholder="İl, ilçe, açık adres…"
            className={appDialogFieldClass}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addLocationToSelected()
              }
            }}
          />
        </label>
      </div>
    </AppDialog>
    <CrmNewCustomerModal
      open={newOpen}
      mode={customerDialogMode}
      initialCustomer={customerDialogMode === 'edit' ? selected : null}
      onSave={saveCustomer}
      onClose={() => setNewOpen(false)}
    />
    </>
  )
}
