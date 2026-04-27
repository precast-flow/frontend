import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Plus } from 'lucide-react'
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

type Props = {
  onNavigate: (moduleId: string) => void
}

type DetailTabId = 'ozet' | 'dosyalar' | 'aktivite' | 'hizli-islemler' | 'hizli-ayarlar' | 'notlar'

const PROJECT_LIST_PAGE_SIZE = 8

export function ProjectManagementModuleView({ onNavigate }: Props) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const detailPanelRef = useRef<HTMLElement | null>(null)
  const [rows, setRows] = useState<ProjectCardItem[]>(projectManagementCardsMock)
  const [selectedId, setSelectedId] = useState(projectManagementCardsMock[0]!.id)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus[]>([])
  const [ownerFilter, setOwnerFilter] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<'all' | '7' | '30'>('all')
  const [detailTab, setDetailTab] = useState<DetailTabId>('ozet')
  const [projectListPage, setProjectListPage] = useState(1)

  const owners = useMemo(() => [...new Set(rows.map((r) => r.owner))], [rows])

  const activeFilterCount = useMemo(
    () => statusFilter.length + ownerFilter.length + (dateRange !== 'all' ? 1 : 0),
    [statusFilter, ownerFilter, dateRange],
  )

  const filtered = useMemo(() => {
    const now = new Date('2026-04-14')
    return rows.filter((r) => {
      if (statusFilter.length && !statusFilter.includes(r.status)) return false
      if (ownerFilter.length && !ownerFilter.includes(r.owner)) return false
      if (dateRange === 'all') return true
      const due = new Date(r.dueDate.split('.').reverse().join('-'))
      const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diff <= Number(dateRange)
    })
  }, [rows, statusFilter, ownerFilter, dateRange])

  const projectListTotalPages = Math.max(1, Math.ceil(filtered.length / PROJECT_LIST_PAGE_SIZE))

  const filteredPageSlice = useMemo(() => {
    const start = (projectListPage - 1) * PROJECT_LIST_PAGE_SIZE
    return filtered.slice(start, start + PROJECT_LIST_PAGE_SIZE)
  }, [filtered, projectListPage])

  useEffect(() => {
    setProjectListPage(1)
  }, [statusFilter, ownerFilter, dateRange])

  useEffect(() => {
    setProjectListPage((p) => Math.min(p, projectListTotalPages))
  }, [projectListTotalPages])

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null
  const selectedActivities = projectManagementActivitiesMock.filter((a) => a.projectId === selected?.id).slice(0, 3)

  const toggleStatus = (status: ProjectStatus) => {
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const toggleOwner = (owner: string) => {
    setOwnerFilter((prev) => (prev.includes(owner) ? prev.filter((s) => s !== owner) : [...prev, owner]))
  }

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
          <div className="okan-project-split-grid grid h-full min-h-0 gap-2.5 lg:grid-cols-2">
            <section className="okan-project-split-list okan-split-list-active-lift flex min-h-0 flex-col overflow-hidden p-3">
            <div className="mb-3 flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-2">
              <h2 className="min-w-0 text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
                Projeler
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
                  onClick={() => navigate('/proje-olustur', { state: { fromProjectManagement: true } })}
                  className="okan-liquid-btn-secondary inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                >
                  <Plus className="size-4 shrink-0 opacity-80" aria-hidden />
                  <span className="max-w-[10rem] truncate sm:max-w-none">Proje olustur</span>
                </button>
              </div>
            </div>

            {filtersOpen ? (
              <div
                className="mb-4 shrink-0 space-y-4 rounded-xl border border-slate-200/50 bg-white/45 p-3.5 dark:border-slate-600/40 dark:bg-slate-900/35"
                role="region"
                aria-label="Proje filtreleri"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Durum
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(['planlama', 'devam', 'riskli', 'beklemede', 'tamamlandi'] as ProjectStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleStatus(s)}
                        className={[
                          'rounded-full px-3 py-2 text-left text-sm font-semibold leading-snug transition',
                          statusFilter.includes(s)
                            ? 'okan-liquid-pill-active text-slate-900'
                            : 'okan-liquid-btn-secondary',
                        ].join(' ')}
                      >
                        {statusLabel(s)}
                      </button>
                    ))}
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
                            ? 'okan-liquid-pill-active text-slate-900'
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
                    onChange={(e) => setDateRange(e.target.value as 'all' | '7' | '30')}
                    className="okan-liquid-select mt-2 w-full rounded-lg border-0 px-3 py-2.5 text-sm shadow-none"
                  >
                    <option value="all">Tum tarihler</option>
                    <option value="7">7 gun icinde teslim</option>
                    <option value="30">30 gun icinde teslim</option>
                  </select>
                </div>
              </div>
            ) : null}

            {filtered.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">Filtreye uygun proje bulunamadi.</p>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
                  {filteredPageSlice.map((row) => (
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
                        <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400">{row.customer}</p>
                      </button>
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
                        className="inline-flex shrink-0 items-center gap-0.5 self-center rounded-md px-1.5 py-1 text-[11px] font-medium leading-none text-slate-500 transition hover:bg-slate-500/10 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                      >
                        Detay
                        <ChevronRight className="size-3 opacity-70" strokeWidth={2} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
                {filtered.length > PROJECT_LIST_PAGE_SIZE ? (
                  <nav
                    aria-label="Proje listesi sayfalari"
                    className="mt-1 flex shrink-0 items-center justify-between gap-2 border-t border-slate-200/35 pt-2.5 dark:border-slate-600/35"
                  >
                    <button
                      type="button"
                      disabled={projectListPage <= 1}
                      onClick={() => setProjectListPage((p) => Math.max(1, p - 1))}
                      className="okan-liquid-btn-secondary inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
                      Onceki
                    </button>
                    <span className="min-w-0 truncate text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                      Sayfa {projectListPage} / {projectListTotalPages}
                      <span className="text-slate-500 dark:text-slate-400"> ({filtered.length})</span>
                    </span>
                    <button
                      type="button"
                      disabled={projectListPage >= projectListTotalPages}
                      onClick={() => setProjectListPage((p) => Math.min(projectListTotalPages, p + 1))}
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
                    <button type="button" onClick={() => onNavigate('dashboard')} className="okan-liquid-btn-secondary w-full px-4 py-2.5 text-sm font-semibold">
                      Not ekle (mock)
                    </button>
                    <button type="button" onClick={() => onNavigate('engineering')} className="okan-liquid-btn-secondary w-full px-4 py-2.5 text-sm font-semibold">
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
    </div>
  )
}
