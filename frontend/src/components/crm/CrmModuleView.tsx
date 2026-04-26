import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  StickyNote,
  User,
} from 'lucide-react'
import { crmCustomers, statusLabel, type CrmCustomer } from '../../data/crmCustomers'
import { useFactoryContext } from '../../context/FactoryContext'
import { useI18n } from '../../i18n/I18nProvider'
import { CrmNewCustomerModal } from './CrmNewCustomerModal'
import { NeoSwitch } from '../NeoSwitch'
import '../muhendislikOkan/engineeringOkanLiquid.css'

type Props = {
  onNavigate: (moduleId: string) => void
}

const CRM_LIST_PAGE_SIZE = 8

const detailTabDefs = [
  { id: 'genel', label: 'Genel' },
  { id: 'iletisim', label: 'İletişim' },
  { id: 'projeler', label: 'Projeler' },
  { id: 'teklifler', label: 'Teklifler' },
  { id: 'notlar', label: 'Notlar' },
  { id: 'dokumanlar', label: 'Dokümanlar' },
] as const

type DetailTabId = (typeof detailTabDefs)[number]['id']

function statusPill(status: CrmCustomer['status']) {
  const base =
    'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-gray-300/90 dark:ring-gray-600/80'
  if (status === 'aktif') return `${base} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100`
  if (status === 'beklemede') return `${base} bg-gray-50 text-gray-700 dark:bg-gray-950/90 dark:text-gray-200`
  if (status === 'potansiyel')
    return `${base} bg-amber-50 text-amber-900 ring-amber-200/90 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800/80`
  return `${base} bg-gray-200/80 text-gray-700 dark:bg-gray-700/80 dark:text-gray-200`
}

export function CrmModuleView({ onNavigate }: Props) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { selectedCodes } = useFactoryContext()
  const filterId = 'crm-fabrika-filtre'
  const detailPanelRef = useRef<HTMLElement | null>(null)

  const [newOpen, setNewOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSector, setFilterSector] = useState<string>('all')
  const [filterByFactoryContext, setFilterByFactoryContext] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(crmCustomers[0]!.id)
  const [detailTab, setDetailTab] = useState<DetailTabId>('genel')
  const [listPage, setListPage] = useState(1)

  const list = useMemo(() => {
    let rows = [...crmCustomers]

    const q = search.trim().toLowerCase()
    if (q) {
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.taxId.includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q),
      )
    }
    if (filterStatus !== 'all') {
      rows = rows.filter((c) => c.status === filterStatus)
    }
    if (filterSector !== 'all') {
      rows = rows.filter((c) => c.sector === filterSector)
    }
    if (filterByFactoryContext) {
      rows = rows.filter((c) => selectedCodes.some((code) => c.factories.includes(code)))
    }

    return rows
  }, [search, filterStatus, filterSector, filterByFactoryContext, selectedCodes])

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (search.trim()) n += 1
    if (filterStatus !== 'all') n += 1
    if (filterSector !== 'all') n += 1
    if (!filterByFactoryContext) n += 1
    return n
  }, [search, filterStatus, filterSector, filterByFactoryContext])

  const listTotalPages = Math.max(1, Math.ceil(list.length / CRM_LIST_PAGE_SIZE))
  const listPageSlice = useMemo(() => {
    const start = (listPage - 1) * CRM_LIST_PAGE_SIZE
    return list.slice(start, start + CRM_LIST_PAGE_SIZE)
  }, [list, listPage])

  useEffect(() => {
    setListPage(1)
  }, [search, filterStatus, filterSector, filterByFactoryContext])

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

  useEffect(() => {
    if (!detailPanelRef.current) return
    detailPanelRef.current.scrollTo({ top: 0, behavior: 'auto' })
  }, [detailTab, selected?.id])

  const clearFilters = () => {
    setSearch('')
    setFilterStatus('all')
    setFilterSector('all')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[1.25rem]">
      <CrmNewCustomerModal open={newOpen} onClose={() => setNewOpen(false)} />

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

        <div className="min-h-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="okan-project-split-grid grid h-full min-h-0 gap-2.5 lg:grid-cols-2">
            <section className="okan-project-split-list okan-split-list-active-lift flex min-h-0 flex-col overflow-hidden p-3">
              <div className="mb-3 flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-2">
                <h2 className="min-w-0 text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
                  Müşteriler
                </h2>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((v) => !v)}
                    aria-expanded={filtersOpen}
                    className="okan-liquid-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                  >
                    <Filter className="size-4 shrink-0 opacity-80" aria-hidden />
                    <span>Filtrele</span>
                    {activeFilterCount > 0 ? (
                      <span className="rounded-full bg-sky-500/25 px-1.5 py-0.5 text-xs font-bold tabular-nums text-sky-900 dark:bg-sky-400/20 dark:text-sky-100">
                        {activeFilterCount}
                      </span>
                    ) : null}
                    <ChevronDown
                      className={`size-4 shrink-0 opacity-70 transition ${filtersOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOpen(true)}
                    className="okan-liquid-btn-secondary inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                  >
                    <Plus className="size-4 shrink-0 opacity-80" aria-hidden />
                    <span className="max-w-[7rem] truncate sm:max-w-none">Yeni müşteri</span>
                  </button>
                </div>
              </div>

              {filtersOpen ? (
                <div
                  className="mb-4 shrink-0 space-y-4 rounded-xl border border-slate-200/50 bg-white/45 p-3.5 dark:border-slate-600/40 dark:bg-slate-900/35"
                  role="region"
                  aria-label="CRM filtreleri"
                >
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
              ) : null}

              {list.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Filtreye uygun müşteri bulunamadı.</p>
                  <button
                    type="button"
                    onClick={() => setNewOpen(true)}
                    className="okan-liquid-btn-primary px-5 py-2.5 text-sm font-semibold"
                  >
                    Yeni müşteri
                  </button>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
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
                          onClick={() => navigate(`/musteri-detay/${row.id}`)}
                          className="inline-flex shrink-0 items-center gap-0.5 self-center rounded-md px-1.5 py-1 text-[11px] font-medium leading-none text-slate-500 transition hover:bg-slate-500/10 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                        >
                          Detay
                          <ChevronRight className="size-3 opacity-70" strokeWidth={2} aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                  {list.length > CRM_LIST_PAGE_SIZE ? (
                    <nav
                      aria-label="Müşteri listesi sayfaları"
                      className="mt-1 flex shrink-0 items-center justify-between gap-2 border-t border-slate-200/35 pt-2.5 dark:border-slate-600/35"
                    >
                      <button
                        type="button"
                        disabled={listPage <= 1}
                        onClick={() => setListPage((p) => Math.max(1, p - 1))}
                        className="okan-liquid-btn-secondary inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold disabled:pointer-events-none disabled:opacity-40"
                      >
                        <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
                        Önceki
                      </button>
                      <span className="min-w-0 truncate text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                        Sayfa {listPage} / {listTotalPages}
                        <span className="text-slate-500 dark:text-slate-400"> ({list.length})</span>
                      </span>
                      <button
                        type="button"
                        disabled={listPage >= listTotalPages}
                        onClick={() => setListPage((p) => Math.min(listTotalPages, p + 1))}
                        className="okan-liquid-btn-secondary inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold disabled:pointer-events-none disabled:opacity-40"
                      >
                        Sonraki
                        <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                      </button>
                    </nav>
                  ) : null}
                </div>
              )}
            </section>

            <aside
              ref={detailPanelRef}
              className="okan-project-split-aside flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-3 lg:pl-2"
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
                            onClick={() => onNavigate('quote')}
                            className="mt-4 text-center text-sm font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-400"
                          >
                            Teklif modülüne git
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
                                      {d.size} · {d.date}
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
