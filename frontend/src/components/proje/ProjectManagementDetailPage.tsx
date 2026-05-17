import { ChevronRight, Filter, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { projectManagementActivitiesMock, projectManagementCardsMock } from '../../data/projectManagementCardsMock'
import { useI18n } from '../../i18n/I18nProvider'
import { useThemeMode } from '../../theme/ThemeProvider'
import { DocumentExplorerSplit } from '../shared/DocumentExplorerSplit'
import type { ExplorerDocument } from '../shared/documentExplorerTypes'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import './projectManagementGlassLight.css'
import { eiSplitFilterToggleClass } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { splitTabPill } from '../shared/splitModuleStyles'
import { ProjectDetailPieceCodesPanel } from './ProjectDetailPieceCodesPanel'

type ProjectDetailTabId =
  | 'ozet'
  | 'bilgi'
  | 'urun-listesi'
  | 'takip'
  | 'mesajlar'
  | 'dokumanlar'

const PROJECT_DETAIL_TABS: { id: ProjectDetailTabId; label: string }[] = [
  { id: 'ozet', label: 'Genel' },
  { id: 'bilgi', label: 'Bilgi' },
  { id: 'urun-listesi', label: 'Ürün listesi' },
  { id: 'takip', label: 'Proje takibi' },
  { id: 'mesajlar', label: 'Mesajlar & notlar' },
  { id: 'dokumanlar', label: 'Dökümanlar' },
]

function parseTurkishDate(input: string): Date {
  const [day, month, year] = input.split('.').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export function ProjectManagementDetailPage() {
  const { t } = useI18n()
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const navigate = useNavigate()
  const location = useLocation()
  const { projectId } = useParams()
  const detailStateKey = `project-management:detail:${projectId ?? 'unknown'}`
  const [activeTab, setActiveTab] = useState<ProjectDetailTabId>(() => {
    try {
      const raw = sessionStorage.getItem(detailStateKey)
      if (!raw) return 'ozet'
      const parsed = JSON.parse(raw) as { activeTab?: ProjectDetailTabId }
      return parsed.activeTab ?? 'ozet'
    } catch {
      return 'ozet'
    }
  })
  const takipListRef = useRef<HTMLUListElement | null>(null)
  const [takipSearch, setTakipSearch] = useState('')
  const [takipFiltersOpen, setTakipFiltersOpen] = useState(false)
  const [takipOwnerFilter, setTakipOwnerFilter] = useState<string>('all')
  const [selectedTakipId, setSelectedTakipId] = useState('f1')
  const mesajListRef = useRef<HTMLUListElement | null>(null)
  const [mesajSearch, setMesajSearch] = useState('')
  const [mesajFiltersOpen, setMesajFiltersOpen] = useState(false)
  const [mesajKindFilter, setMesajKindFilter] = useState<'all' | 'not' | 'mesaj'>('all')
  const [mesajPinFilter, setMesajPinFilter] = useState<'all' | 'pinned'>('all')
  const [mesajByFilter, setMesajByFilter] = useState<string>('all')
  const [selectedMesajId, setSelectedMesajId] = useState('m1')

  const cameFromList = Boolean((location.state as { fromProjectList?: boolean } | null)?.fromProjectList)
  const project = projectManagementCardsMock.find((x) => x.id === projectId)
  const activities = useMemo(() => (project ? projectManagementActivitiesMock.filter((a) => a.projectId === project.id) : []), [project])
  const progressRows = useMemo(
    () => [
      { id: 'p1', title: 'Tasarım ve koordinasyon', value: 82 },
      { id: 'p2', title: 'Üretim hazırlık', value: 68 },
      { id: 'p3', title: 'Üretim', value: 59 },
      { id: 'p4', title: 'Sevkiyat ve montaj', value: 34 },
    ],
    [],
  )
  const followUpRows = useMemo(
    () => [
      { id: 'f1', at: '14.04 10:15', title: 'Müşteri revizyonu işlendi', detail: 'Cephe panel bağlantı plakası detayı revize edildi.', owner: 'Mühendislik' },
      { id: 'f2', at: '13.04 16:50', title: 'Üretim planı güncellendi', detail: 'Aks B kolonları 1 gün öne çekildi.', owner: 'Planlama' },
      { id: 'f3', at: '12.04 09:20', title: 'Saha koordinasyon toplantısı', detail: 'Sevkiyat penceresi için yeni saat dilimi onaylandı.', owner: 'Saha' },
      { id: 'f4', at: '11.04 14:05', title: 'Kalite checklist güncellemesi', detail: 'Ankraj kontrol adımı zorunluya alındı.', owner: 'Kalite' },
    ],
    [],
  )
  const takipOwnerOptions = useMemo(() => [...new Set(followUpRows.map((r) => r.owner))], [followUpRows])
  const takipFilteredRows = useMemo(() => {
    const q = takipSearch.trim().toLocaleLowerCase('tr-TR')
    return followUpRows.filter((row) => {
      if (takipOwnerFilter !== 'all' && row.owner !== takipOwnerFilter) return false
      if (!q) return true
      return (
        row.title.toLocaleLowerCase('tr-TR').includes(q) ||
        row.detail.toLocaleLowerCase('tr-TR').includes(q) ||
        row.owner.toLocaleLowerCase('tr-TR').includes(q) ||
        row.at.toLocaleLowerCase('tr-TR').includes(q)
      )
    })
  }, [followUpRows, takipOwnerFilter, takipSearch])
  const takipActiveFilterCount = (takipSearch.trim() ? 1 : 0) + (takipOwnerFilter !== 'all' ? 1 : 0)
  const messageRows = useMemo(
    () => [
      { id: 'm1', pinned: true, by: 'Selin Güler', at: '14.04 08:30', text: 'Montaj sırası değişiklikleri sahaya iletildi. Bu not pinned.', kind: 'not' },
      { id: 'm2', pinned: true, by: 'Murat Kaya', at: '13.04 17:00', text: 'B Blok için vinç müsaitliği 18 Nisan sabahı net.', kind: 'mesaj' },
      { id: 'm3', pinned: false, by: 'Ayşe Yıldız', at: '13.04 11:10', text: 'Dış panel yüzey kalite formu sisteme yüklendi.', kind: 'mesaj' },
      { id: 'm4', pinned: false, by: 'Onur Demir', at: '12.04 15:35', text: 'Model koordinasyon raporu paylaşıldı.', kind: 'not' },
    ],
    [],
  )
  const mesajByOptions = useMemo(() => [...new Set(messageRows.map((r) => r.by))], [messageRows])
  const mesajFilteredRows = useMemo(() => {
    const q = mesajSearch.trim().toLocaleLowerCase('tr-TR')
    const filtered = messageRows.filter((row) => {
      if (mesajKindFilter !== 'all' && row.kind !== mesajKindFilter) return false
      if (mesajPinFilter === 'pinned' && !row.pinned) return false
      if (mesajByFilter !== 'all' && row.by !== mesajByFilter) return false
      if (!q) return true
      const kindLabel = row.kind === 'not' ? 'not' : 'mesaj'
      return (
        row.text.toLocaleLowerCase('tr-TR').includes(q) ||
        row.by.toLocaleLowerCase('tr-TR').includes(q) ||
        row.at.toLocaleLowerCase('tr-TR').includes(q) ||
        kindLabel.includes(q)
      )
    })
    const pin = filtered.filter((r) => r.pinned)
    const rest = filtered.filter((r) => !r.pinned)
    return [...pin, ...rest]
  }, [messageRows, mesajByFilter, mesajKindFilter, mesajPinFilter, mesajSearch])
  const mesajActiveFilterCount =
    (mesajSearch.trim() ? 1 : 0) +
    (mesajKindFilter !== 'all' ? 1 : 0) +
    (mesajPinFilter !== 'all' ? 1 : 0) +
    (mesajByFilter !== 'all' ? 1 : 0)
  const documents = useMemo<ExplorerDocument[]>(
    () => [
      { id: 'd1', type: 'Sözleşme', name: 'Sozlesme_RevB.pdf', size: '3.2 MB', ext: 'PDF', uploadedAt: '10.04.2026 09:15', uploadedBy: 'Selin Güler', revision: 'B', note: 'Ek protokol eklendi.', previewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf' },
      { id: 'd2', type: 'Model', name: 'Koordinasyon_Model.ifc', size: '18.4 MB', ext: 'IFC', uploadedAt: '12.04.2026 14:20', uploadedBy: 'Onur Demir', revision: 'C', note: 'Şaft aksı güncellendi.', previewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf' },
      { id: 'd3', type: 'Çizim', name: 'Cephe_Panel_Detay_R3.pdf', size: '6.9 MB', ext: 'PDF', uploadedAt: '14.04.2026 08:40', uploadedBy: 'Mühendislik', revision: 'R3', note: 'Bağlantı plakası revizyonu.', previewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf' },
      { id: 'd4', type: 'Kalite', name: 'Kalite_Kontrol_Formu.xlsx', size: '1.1 MB', ext: 'XLSX', uploadedAt: '13.04.2026 16:05', uploadedBy: 'Ayşe Yıldız', revision: 'A', note: 'Yeni kontrol alanları eklendi.', previewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf' },
      { id: 'd5', type: 'Rapor', name: 'Haftalik_Proje_Raporu_15.pdf', size: '2.6 MB', ext: 'PDF', uploadedAt: '15.04.2026 07:50', uploadedBy: 'Planlama', revision: '1', note: 'İlerleme ve risk özeti.', previewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf' },
    ],
    [],
  )
  const qualityTrendRows = useMemo(
    () => [
      { week: 'W-4', nonConformity: 14, producedQty: 112 },
      { week: 'W-3', nonConformity: 11, producedQty: 128 },
      { week: 'W-2', nonConformity: 9, producedQty: 136 },
      { week: 'W-1', nonConformity: 7, producedQty: 142 },
    ],
    [],
  )
  const resourceLoadRows = useMemo(
    () => [
      { team: 'Mühendislik', plannedHours: 220, actualHours: 208 },
      { team: 'Üretim', plannedHours: 460, actualHours: 495 },
      { team: 'Saha', plannedHours: 280, actualHours: 262 },
      { team: 'Kalite', plannedHours: 160, actualHours: 154 },
    ],
    [],
  )
  const shipmentAssemblyRows = useMemo(
    () => [
      { label: 'Üretim tamam', count: 148, color: 'bg-emerald-500/85' },
      { label: 'Sevke hazır', count: 121, color: 'bg-sky-500/85' },
      { label: 'Montaja hazır', count: 96, color: 'bg-indigo-500/85' },
    ],
    [],
  )
  const projectProgress = project?.progress ?? 0
  const startDate = parseTurkishDate(project?.startDate ?? '01.01.2026')
  const dueDate = parseTurkishDate(project?.dueDate ?? '01.01.2027')
  const now = new Date('2026-04-14')
  const elapsedPercent = Math.max(
    0,
    Math.min(100, Math.round(((now.getTime() - startDate.getTime()) / Math.max(1, dueDate.getTime() - startDate.getTime())) * 100)),
  )
  const scheduleDelta = projectProgress - elapsedPercent
  const qualityMaxNc = useMemo(
    () => Math.max(1, ...qualityTrendRows.map((row) => row.nonConformity)),
    [qualityTrendRows],
  )
  const qualityMaxQty = useMemo(
    () => Math.max(1, ...qualityTrendRows.map((row) => row.producedQty)),
    [qualityTrendRows],
  )
  const resourceMaxHours = useMemo(
    () => Math.max(1, ...resourceLoadRows.flatMap((row) => [row.plannedHours, row.actualHours])),
    [resourceLoadRows],
  )
  const shipmentMax = useMemo(
    () => Math.max(1, ...shipmentAssemblyRows.map((row) => row.count)),
    [shipmentAssemblyRows],
  )

  useEffect(() => {
    if (!takipFiltersOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTakipFiltersOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [takipFiltersOpen])

  useEffect(() => {
    if (takipFilteredRows.length === 0) return
    if (takipFilteredRows.some((r) => r.id === selectedTakipId)) return
    setSelectedTakipId(takipFilteredRows[0]!.id)
  }, [takipFilteredRows, selectedTakipId])

  useEffect(() => {
    if (!mesajFiltersOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMesajFiltersOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mesajFiltersOpen])

  useEffect(() => {
    if (mesajFilteredRows.length === 0) return
    if (mesajFilteredRows.some((r) => r.id === selectedMesajId)) return
    setSelectedMesajId(mesajFilteredRows[0]!.id)
  }, [mesajFilteredRows, selectedMesajId])

  useEffect(() => {
    sessionStorage.setItem(detailStateKey, JSON.stringify({ activeTab }))
  }, [activeTab, detailStateKey])

  if (!cameFromList) return <Navigate to="/proje" replace />
  if (!project) return <Navigate to="/proje" replace />

  const crumbMuted = gl ? 'text-black/60 dark:text-white/65' : 'text-slate-500 dark:text-slate-400'
  const crumbLink = gl
    ? 'font-medium text-black/75 underline-offset-2 transition hover:text-black hover:underline dark:text-white/75 dark:hover:text-white'
    : 'font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400'
  const crumbCurrent = gl ? 'max-w-[40ch] truncate font-semibold text-black dark:text-white' : 'max-w-[40ch] truncate font-semibold text-slate-800 dark:text-slate-100'
  const infoSectionTitle = gl
    ? 'text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
    : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
  const infoSectionCard = gl
    ? 'rounded-xl border border-black/10 bg-white/45 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.48)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none'
    : 'rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5'
  const infoFieldCell = gl
    ? 'rounded-lg border border-black/8 bg-white/55 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900/40'
    : 'rounded-lg border border-slate-200/45 bg-white/60 px-3 py-2.5 dark:border-slate-700/50 dark:bg-slate-900/35'
  const infoDt = gl ? 'text-[11px] font-medium text-black/50 dark:text-white/55' : 'text-xs text-slate-500 dark:text-slate-400'
  const infoDd = gl ? 'mt-1 text-sm font-semibold leading-snug text-black dark:text-slate-50' : 'mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-50'

  return (
    <div
      className="project-mgmt-glass-light flex min-h-0 flex-1 flex-col gap-1 overflow-hidden rounded-3xl"
      data-neutral-shell="true"
    >
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-1">
        <div className="px-[0.6875rem] pt-0 pb-0.5">
          <div className="mb-1.5 pb-1.5">
            <h1
              className={`text-xl font-semibold tracking-tight md:text-2xl ${gl ? 'text-black dark:text-white' : 'text-gray-900 dark:text-gray-50'}`}
            >
              {project.name} Proje Detayı
            </h1>
          </div>
          <nav aria-label={t('project.breadcrumbAria')} className="mb-0">
            <ol className={`flex flex-wrap items-center gap-1 text-xs ${crumbMuted}`}>
              <li>
                <Link to="/planlama" className={crumbLink}>
                  {t('nav.sidebar.section.planning')}
                </Link>
              </li>
              <li className="flex items-center gap-1" aria-hidden>
                <ChevronRight className="size-3.5 shrink-0 opacity-70" />
              </li>
              <li>
                <button type="button" onClick={() => navigate('/proje')} className={crumbLink}>
                  {t('nav.project')}
                </button>
              </li>
              <li className="flex items-center gap-1" aria-hidden>
                <ChevronRight className="size-3.5 shrink-0 opacity-70" />
              </li>
              <li className={crumbCurrent} aria-current="page">
                {project.name} Proje Detayı
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
            className={[
              'flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
              gl ? 'glass-card glass-card--static project-mgmt-split-panel gap-3' : 'gap-3 px-1 sm:px-2',
            ].join(' ')}
          >
            <div className="flex shrink-0 gap-1 overflow-x-auto px-0.5 sm:px-0" role="tablist" aria-label="Proje detay sekmeleri">
              {PROJECT_DETAIL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={splitTabPill(activeTab === tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              className={`min-h-0 flex-1 overflow-x-hidden ${activeTab === 'urun-listesi' || activeTab === 'dokumanlar' || activeTab === 'takip' || activeTab === 'mesajlar' ? 'flex min-h-0 flex-col overflow-hidden' : 'overflow-y-auto overscroll-y-contain'} ${gl ? 'px-0.5 sm:px-1' : ''}`}
            >
              {activeTab === 'ozet' ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Proje ilerleyişi
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <div
                        className="grid size-28 place-items-center rounded-full"
                        style={{
                          background: `conic-gradient(rgb(14 165 233) 0 ${projectProgress * 3.6}deg, rgba(148,163,184,.22) ${projectProgress * 3.6}deg 360deg)`,
                        }}
                      >
                        <div className="grid size-20 place-items-center rounded-full bg-white/90 text-sm font-semibold text-slate-900 dark:bg-slate-900/90 dark:text-slate-50">
                          %{projectProgress}
              </div>
              </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        {progressRows.map((row) => (
                          <div key={row.id}>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600 dark:text-slate-300">{row.title}</span>
                              <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">%{row.value}</span>
              </div>
                            <div className="mt-1 h-1.5 rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                              <div className="h-1.5 rounded-full bg-sky-500/80" style={{ width: `${row.value}%` }} />
              </div>
                </div>
              ))}
            </div>
                    </div>
                  </section>
                  <section className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Termin analizi
                    </p>
                    <div className="mt-4 space-y-3">
                  <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300">Takvimde geçen süre</span>
                          <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">%{elapsedPercent}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                          <div className="h-2 rounded-full bg-amber-500/80" style={{ width: `${elapsedPercent}%` }} />
                        </div>
                  </div>
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300">Gerçekleşen ilerleme</span>
                          <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">%{projectProgress}</span>
                </div>
                        <div className="mt-1 h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                          <div className="h-2 rounded-full bg-emerald-500/80" style={{ width: `${projectProgress}%` }} />
            </div>
                  </div>
                      <div className="rounded-lg border border-slate-200/50 bg-slate-50/60 px-3 py-2 text-sm dark:border-slate-700/50 dark:bg-slate-900/40">
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {scheduleDelta >= 0 ? 'Takvime göre önde' : 'Takvime göre geride'}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                          Başlangıç: {project.startDate} · Termin: {project.dueDate} · Fark: %{Math.abs(scheduleDelta)}
                        </p>
            </div>
                  </div>
                  </section>
                  <section className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Kalite trendi (son 4 hafta)
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Uygunsuzluk adedi (bar) ve üretilen adet (line/alan) birlikte gösterilir.
                    </p>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {qualityTrendRows.map((row) => (
                        <div key={row.week} className="rounded-lg border border-slate-200/45 bg-white/60 px-2 py-2 dark:border-slate-700/50 dark:bg-slate-900/35">
                          <p className="text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400">{row.week}</p>
                          <div className="mt-1 h-16 rounded-md bg-slate-100/70 p-1 dark:bg-slate-800/50">
                            <div className="flex h-full items-end justify-center">
                              <div
                                className="w-3 rounded-sm bg-rose-500/85"
                                style={{ height: `${Math.max(8, (row.nonConformity / qualityMaxNc) * 100)}%` }}
                              />
                  </div>
                </div>
                          <div className="mt-1">
                            <div className="h-1.5 rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                              <div
                                className="h-1.5 rounded-full bg-teal-500/80"
                                style={{ width: `${(row.producedQty / qualityMaxQty) * 100}%` }}
                              />
                            </div>
            </div>
                          <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-300">
                            NC: <span className="font-semibold tabular-nums">{row.nonConformity}</span> · Adet:{' '}
                            <span className="font-semibold tabular-nums">{row.producedQty}</span>
                  </p>
                </div>
              ))}
            </div>
                  </section>
                  <section className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Kaynak yükü (planlanan / gerçekleşen saat)
                    </p>
                    <div className="mt-3 space-y-3">
                      {resourceLoadRows.map((row) => (
                        <div key={row.team} className="rounded-lg border border-slate-200/45 bg-white/60 px-3 py-2 dark:border-slate-700/50 dark:bg-slate-900/35">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-800 dark:text-slate-100">{row.team}</span>
                            <span className="tabular-nums text-slate-600 dark:text-slate-300">
                              {row.actualHours}/{row.plannedHours} s
                            </span>
                  </div>
                          <div className="mt-2 space-y-1.5">
                            <div className="h-1.5 rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                              <div
                                className="h-1.5 rounded-full bg-slate-500/70"
                                style={{ width: `${(row.plannedHours / resourceMaxHours) * 100}%` }}
                              />
                </div>
                            <div className="h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                              <div
                                className={`h-2 rounded-full ${
                                  row.actualHours <= row.plannedHours ? 'bg-emerald-500/80' : 'bg-amber-500/85'
                                }`}
                                style={{ width: `${(row.actualHours / resourceMaxHours) * 100}%` }}
              />
            </div>
                          </div>
                </div>
              ))}
            </div>
                  </section>
                  <section className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5 lg:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Sevkiyat & montaj hazırlık
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {shipmentAssemblyRows.map((row) => (
                        <div key={row.label} className="rounded-lg border border-slate-200/45 bg-white/60 px-3 py-3 dark:border-slate-700/50 dark:bg-slate-900/35">
                          <p className="text-xs text-slate-600 dark:text-slate-300">{row.label}</p>
                          <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                            {row.count}
                          </p>
                          <div className="mt-2 h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                            <div
                              className={`h-2 rounded-full ${row.color}`}
                              style={{ width: `${(row.count / shipmentMax) * 100}%` }}
                            />
                  </div>
                </div>
              ))}
            </div>
                  </section>
            </div>
          ) : null}

              {activeTab === 'bilgi' ? (
                <div className="space-y-4">
                  <section className={infoSectionCard}>
                    <p className={infoSectionTitle}>Temel bilgiler</p>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        ['Proje adı', project.name],
                        ['Kod', project.code],
                        ['Müşteri', project.customer],
                        ['Sorumlu', project.owner],
                      ].map(([label, value]) => (
                        <div key={label} className={infoFieldCell}>
                          <dt className={infoDt}>{label}</dt>
                          <dd className={infoDd}>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                  <section className={infoSectionCard}>
                    <p className={infoSectionTitle}>Takvim & ilerleme</p>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        ['Durum', project.status],
                        ['Öncelik', project.priority],
                        ['Başlangıç', project.startDate],
                        ['Termin', project.dueDate],
                        ['İlerleme', `%${project.progress}`],
                        ['Güncelleme', project.updatedAt],
                      ].map(([label, value]) => (
                        <div key={label} className={infoFieldCell}>
                          <dt className={infoDt}>{label}</dt>
                          <dd className={infoDd}>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                  <section className={infoSectionCard}>
                    <p className={infoSectionTitle}>Operasyon notları</p>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className={infoFieldCell}>
                        <dt className={infoDt}>Bütçe</dt>
                        <dd className={infoDd}>Henüz tanımlanmadı</dd>
                      </div>
                      <div className={`sm:col-span-2 ${infoFieldCell}`}>
                        <dt className={infoDt}>Açıklama</dt>
                        <dd
                          className={
                            gl
                              ? 'mt-1 text-sm font-medium leading-relaxed text-black dark:text-slate-100'
                              : 'mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-50'
                          }
                        >
                          {project.note}
                        </dd>
                      </div>
                    </dl>
                  </section>
                </div>
              ) : null}

              {activeTab === 'urun-listesi' ? (
                <ProjectDetailPieceCodesPanel
                  project={{
                    name: project.name,
                    code: project.code,
                    customer: project.customer,
                    owner: project.owner,
                  }}
                />
              ) : null}

              {activeTab === 'takip' ? (
                <div
                  className={[
                    'relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden',
                    gl ? 'gap-3 rounded-3xl lg:gap-4' : 'gap-0',
                  ].join(' ')}
                >
                  <section
                    className={[
                      'okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
                      gl ? 'glass-card glass-card--static project-mgmt-split-panel min-h-0' : 'p-3',
                    ].join(' ')}
                  >
                    <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
                      <h2 className="min-w-0 shrink-0 text-sm font-semibold text-black dark:text-white sm:text-base">
                        Proje takibi
                      </h2>
                      <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                        <FilterToolbarSearch
                          id="project-takip-inline-search"
                          value={takipSearch}
                          onValueChange={setTakipSearch}
                          placeholder="Başlık, açıklama, ekip, tarih…"
                          ariaLabel="Takip kayıtlarında ara"
                          className={gl ? 'project-mgmt-toolbar-search' : ''}
                          inputClassName={gl ? 'glass-input' : ''}
                        />
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTakipFiltersOpen((v) => !v)}
                            aria-expanded={takipFiltersOpen}
                            className={eiSplitFilterToggleClass(takipFiltersOpen)}
                          >
                            <Filter className="size-3.5 shrink-0" aria-hidden />
                            <span>Filtrele</span>
                            {takipActiveFilterCount > 0 ? (
                              <span
                                className={
                                  gl
                                    ? 'rounded-full bg-black/8 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-black dark:bg-white/10 dark:text-white'
                                    : 'rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-black dark:bg-white/10 dark:text-white'
                                }
                              >
                                {takipActiveFilterCount}
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
                          takipFiltersOpen ? 'translate-x-0' : '-translate-x-[105%]',
                        ].join(' ')}
                        aria-hidden={!takipFiltersOpen}
                      >
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold text-black dark:text-white">Takip filtreleri</h4>
                            <p className="mt-1 text-[11px] text-black/60 dark:text-white/65">Arama ve sorumlu ekip</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTakipFiltersOpen(false)}
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
                              value={takipSearch}
                              onChange={(e) => setTakipSearch(e.target.value)}
                              placeholder="Başlık, açıklama, ekip, tarih…"
                              className={
                                gl
                                  ? 'glass-input mt-2 w-full'
                                  : 'okan-liquid-input mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none'
                              }
                            />
                          </label>
                          <label>
                            <span className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">
                              Sorumlu ekip
                            </span>
                            <select
                              value={takipOwnerFilter}
                              onChange={(e) => setTakipOwnerFilter(e.target.value)}
                              className={
                                gl
                                  ? 'glass-input mt-2 w-full'
                                  : 'okan-liquid-select mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none'
                              }
                            >
                              <option value="all">Tümü</option>
                              {takipOwnerOptions.map((owner) => (
                                <option key={owner} value={owner}>
                                  {owner}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setTakipSearch('')
                              setTakipOwnerFilter('all')
                              setTakipFiltersOpen(false)
                              requestAnimationFrame(() => {
                                takipListRef.current?.scrollTo({ top: 0, behavior: 'auto' })
                              })
                            }}
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

                      {takipFilteredRows.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3 py-6 text-center">
                          <p
                            className={
                              gl
                                ? 'text-sm text-black dark:text-white/80'
                                : 'text-sm text-black/80 dark:text-white/80'
                            }
                          >
                            Filtreye uygun takip kaydı bulunamadı.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setTakipSearch('')
                              setTakipOwnerFilter('all')
                            }}
                            className={
                              gl
                                ? ['glass-btn', 'secondary', 'small', 'px-5', 'py-2.5', 'text-sm', 'font-semibold'].join(' ')
                                : 'okan-liquid-btn-secondary px-5 py-2.5 text-sm font-semibold'
                            }
                          >
                            Filtreleri temizle
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                          <ul
                            ref={takipListRef}
                            className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1 transition-[padding] duration-100 ease-out"
                            style={{ paddingLeft: takipFiltersOpen ? '18.5rem' : '0' }}
                          >
                            {takipFilteredRows.map((row) => (
                              <li
                                key={row.id}
                                className={[
                                  gl
                                    ? [
                                        'glass-card',
                                        'glass-card--static',
                                        'project-mgmt-list-row-card',
                                        'flex',
                                        'min-h-0',
                                        'shrink-0',
                                        'items-stretch',
                                        'gap-1.5',
                                      ].join(' ')
                                    : 'flex min-h-0 shrink-0 items-stretch gap-1.5 rounded-lg border border-black/15 bg-white/70 px-2 py-1.5 dark:border-white/12 dark:bg-black/45',
                                  selectedTakipId === row.id ? 'okan-project-list-row--active' : '',
                                ].join(' ')}
                              >
                                <button
                                  type="button"
                                  onClick={() => setSelectedTakipId(row.id)}
                                  aria-current={selectedTakipId === row.id ? 'true' : undefined}
                                  className="min-w-0 flex-1 rounded-md px-0.5 py-0.5 text-left transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:hover:bg-white/8"
                                >
                                  <p className="truncate text-sm font-semibold leading-snug text-black dark:text-white">
                                    {row.title}
                                  </p>
                                  <p className="mt-0.5 line-clamp-2 text-xs text-black/70 dark:text-white/70">{row.detail}</p>
                                  <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-black/55 dark:text-white/65">
                                    <span className="tabular-nums">{row.at}</span>
                                    <span>·</span>
                                    <span>{row.owner}</span>
                                  </p>
                                </button>
                              </li>
                            ))}
                            {activities.length ? (
                              <li
                                className={[
                                  gl
                                    ? [
                                        'glass-card',
                                        'glass-card--static',
                                        'project-mgmt-list-row-card',
                                        'mt-1',
                                        'flex',
                                        'min-h-0',
                                        'shrink-0',
                                        'flex-col',
                                        'gap-1',
                                        'px-2',
                                        'py-2',
                                      ].join(' ')
                                    : 'mt-2 rounded-lg border border-black/15 bg-white/70 p-3 dark:border-white/12 dark:bg-black/45',
                                ].join(' ')}
                              >
                                <p
                                  className={
                                    gl
                                      ? 'text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80'
                                      : infoSectionTitle
                                  }
                                >
                                  Aktivite logları
                                </p>
                                <ul
                                  className={
                                    gl
                                      ? 'mt-1 divide-y divide-black/10 dark:divide-white/10'
                                      : 'mt-1 divide-y divide-slate-200/30 dark:divide-white/10'
                                  }
                                >
                                  {activities.slice(0, 6).map((a) => (
                                    <li
                                      key={a.id}
                                      className={
                                        gl
                                          ? 'flex gap-3 py-2 text-left text-sm text-black/85 dark:text-white/85'
                                          : 'flex gap-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200'
                                      }
                                    >
                                      <span
                                        className={
                                          gl
                                            ? 'w-20 shrink-0 tabular-nums text-black/55 dark:text-white/65'
                                            : 'w-20 shrink-0 tabular-nums text-slate-500 dark:text-slate-400'
                                        }
                                      >
                                        {a.at}
                                      </span>
                                      <span className="min-w-0 flex-1">{a.text}</span>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ) : null}
                          </ul>
                          {gl ? (
                            <div className="glass-card glass-card--static project-mgmt-footer-panel sticky bottom-0 z-10 mt-2 shrink-0 text-xs">
                              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                                <p className="text-black dark:text-white/80">
                                  <span className="tabular-nums font-semibold text-black dark:text-white">
                                    {takipFilteredRows.length}
                                  </span>{' '}
                                  kayıt
                                  {activities.length ? (
                                    <>
                                      {' '}
                                      ·{' '}
                                      <span className="tabular-nums font-semibold text-black dark:text-white">
                                        {activities.length}
                                      </span>{' '}
                                      aktivite
                                    </>
                                  ) : null}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1.5 flex shrink-0 flex-col gap-2 border-t border-slate-200/60 pt-2.5 text-[11px] text-slate-600 dark:border-slate-700/60 dark:text-slate-300 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                              <span>
                                {takipFilteredRows.length} kayıt
                                {activities.length ? ` · ${activities.length} aktivite` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              ) : null}

              {activeTab === 'mesajlar' ? (
                <div
                  className={[
                    'relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden',
                    gl ? 'gap-3 rounded-3xl lg:gap-4' : 'gap-0',
                  ].join(' ')}
                >
                  <section
                    className={[
                      'okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
                      gl ? 'glass-card glass-card--static project-mgmt-split-panel min-h-0' : 'p-3',
                    ].join(' ')}
                  >
                    <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
                      <h2
                        className={
                          gl
                            ? 'min-w-0 shrink-0 text-sm font-semibold text-black dark:text-white sm:text-base'
                            : 'min-w-0 shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base'
                        }
                      >
                        Mesajlar & notlar
                      </h2>
                      <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                        <FilterToolbarSearch
                          id="project-mesaj-inline-search"
                          value={mesajSearch}
                          onValueChange={setMesajSearch}
                          placeholder="Metin, gönderen, tarih…"
                          ariaLabel="Mesaj ve notlarda ara"
                          className={gl ? 'project-mgmt-toolbar-search' : ''}
                          inputClassName={gl ? 'glass-input' : ''}
                        />
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMesajFiltersOpen((v) => !v)}
                            aria-expanded={mesajFiltersOpen}
                            className={eiSplitFilterToggleClass(mesajFiltersOpen)}
                          >
                            <Filter className="size-3.5 shrink-0" aria-hidden />
                            <span>Filtrele</span>
                            {mesajActiveFilterCount > 0 ? (
                              <span
                                className={
                                  gl
                                    ? 'rounded-full bg-black/8 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-black dark:bg-white/10 dark:text-white'
                                    : 'rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-black dark:bg-white/10 dark:text-white'
                                }
                              >
                                {mesajActiveFilterCount}
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
                          mesajFiltersOpen ? 'translate-x-0' : '-translate-x-[105%]',
                        ].join(' ')}
                        aria-hidden={!mesajFiltersOpen}
                      >
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold text-black dark:text-white">Mesaj filtreleri</h4>
                            <p className="mt-1 text-[11px] text-black/60 dark:text-white/65">Arama, tür, pin ve gönderen</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMesajFiltersOpen(false)}
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
                              value={mesajSearch}
                              onChange={(e) => setMesajSearch(e.target.value)}
                              placeholder="Metin, gönderen, tarih…"
                              className={
                                gl
                                  ? 'glass-input mt-2 w-full'
                                  : 'okan-liquid-input mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none'
                              }
                            />
                          </label>
                          <label>
                            <span className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">
                              Tür
                            </span>
                            <select
                              value={mesajKindFilter}
                              onChange={(e) => setMesajKindFilter(e.target.value as 'all' | 'not' | 'mesaj')}
                              className={
                                gl
                                  ? 'glass-input mt-2 w-full'
                                  : 'okan-liquid-select mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none'
                              }
                            >
                              <option value="all">Tümü</option>
                              <option value="not">Not</option>
                              <option value="mesaj">Mesaj</option>
                            </select>
                          </label>
                          <label>
                            <span className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">
                              Pin
                            </span>
                            <select
                              value={mesajPinFilter}
                              onChange={(e) => setMesajPinFilter(e.target.value as 'all' | 'pinned')}
                              className={
                                gl
                                  ? 'glass-input mt-2 w-full'
                                  : 'okan-liquid-select mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none'
                              }
                            >
                              <option value="all">Tümü</option>
                              <option value="pinned">Yalnız pinli</option>
                            </select>
                          </label>
                          <label>
                            <span className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">
                              Gönderen
                            </span>
                            <select
                              value={mesajByFilter}
                              onChange={(e) => setMesajByFilter(e.target.value)}
                              className={
                                gl
                                  ? 'glass-input mt-2 w-full'
                                  : 'okan-liquid-select mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none'
                              }
                            >
                              <option value="all">Tümü</option>
                              {mesajByOptions.map((by) => (
                                <option key={by} value={by}>
                                  {by}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setMesajSearch('')
                              setMesajKindFilter('all')
                              setMesajPinFilter('all')
                              setMesajByFilter('all')
                              setMesajFiltersOpen(false)
                              requestAnimationFrame(() => {
                                mesajListRef.current?.scrollTo({ top: 0, behavior: 'auto' })
                              })
                            }}
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

                      {mesajFilteredRows.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3 py-6 text-center">
                          <p
                            className={
                              gl
                                ? 'text-sm text-black dark:text-white/80'
                                : 'text-sm text-black/80 dark:text-white/80'
                            }
                          >
                            Filtreye uygun kayıt bulunamadı.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setMesajSearch('')
                              setMesajKindFilter('all')
                              setMesajPinFilter('all')
                              setMesajByFilter('all')
                            }}
                            className={
                              gl
                                ? ['glass-btn', 'secondary', 'small', 'px-5', 'py-2.5', 'text-sm', 'font-semibold'].join(' ')
                                : 'okan-liquid-btn-secondary px-5 py-2.5 text-sm font-semibold'
                            }
                          >
                            Filtreleri temizle
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                          <ul
                            ref={mesajListRef}
                            className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1 transition-[padding] duration-100 ease-out"
                            style={{ paddingLeft: mesajFiltersOpen ? '18.5rem' : '0' }}
                          >
                            {mesajFilteredRows.map((row) => (
                              <li
                                key={row.id}
                                className={[
                                  gl
                                    ? [
                                        'glass-card',
                                        'glass-card--static',
                                        'project-mgmt-list-row-card',
                                        'flex',
                                        'min-h-0',
                                        'shrink-0',
                                        'items-stretch',
                                        'gap-1.5',
                                      ].join(' ')
                                    : 'flex min-h-0 shrink-0 items-stretch gap-1.5 rounded-lg border border-black/15 bg-white/70 px-2 py-1.5 dark:border-white/12 dark:bg-black/45',
                                  selectedMesajId === row.id ? 'okan-project-list-row--active' : '',
                                ].join(' ')}
                              >
                                <button
                                  type="button"
                                  onClick={() => setSelectedMesajId(row.id)}
                                  aria-current={selectedMesajId === row.id ? 'true' : undefined}
                                  className="min-w-0 flex-1 rounded-md px-0.5 py-0.5 text-left transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:hover:bg-white/8"
                                >
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span
                                      className={
                                        gl
                                          ? 'rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-semibold text-black dark:bg-white/15 dark:text-white'
                                          : 'rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-800 dark:bg-slate-700/80 dark:text-slate-100'
                                      }
                                    >
                                      {row.kind === 'not' ? 'Not' : 'Mesaj'}
                                    </span>
                                    {row.pinned ? (
                                      <span className="rounded-full bg-amber-500/25 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-400/20 dark:text-amber-100">
                                        Pinli
                                      </span>
                                    ) : null}
                                  </div>
                                  <p
                                    className={
                                      gl
                                        ? 'mt-1 line-clamp-3 text-sm font-medium leading-snug text-black dark:text-white'
                                        : 'mt-1 line-clamp-3 text-sm font-medium leading-snug text-slate-900 dark:text-slate-50'
                                    }
                                  >
                                    {row.text}
                                  </p>
                                  <p
                                    className={
                                      gl
                                        ? 'mt-0.5 truncate text-xs text-black/70 dark:text-white/70'
                                        : 'mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400'
                                    }
                                  >
                                    {row.by} · {row.at}
                                  </p>
                                </button>
                              </li>
                            ))}
                          </ul>
                          {gl ? (
                            <div className="glass-card glass-card--static project-mgmt-footer-panel sticky bottom-0 z-10 mt-2 shrink-0 text-xs">
                              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                                <p className="text-black dark:text-white/80">
                                  <span className="tabular-nums font-semibold text-black dark:text-white">
                                    {mesajFilteredRows.length}
                                  </span>{' '}
                                  kayıt
                                </p>
                              </div>
                              <label className="mt-2 block text-left">
                                <span className="text-[11px] font-medium text-black/60 dark:text-white/65">
                                  Yeni mesaj / not (mock)
                                </span>
                                <textarea
                                  rows={3}
                                  placeholder="Yeni mesaj / not ekle... (mock)"
                                  className="glass-input mt-1.5 w-full resize-none text-sm"
                                />
                              </label>
                            </div>
                          ) : (
                            <div className="mt-2 shrink-0 space-y-2 border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                                {mesajFilteredRows.length} kayıt
                              </span>
                              <textarea
                                rows={3}
                                placeholder="Yeni mesaj / not ekle... (mock)"
                                className="okan-liquid-input w-full resize-none border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              ) : null}

              {activeTab === 'dokumanlar' ? (
                <DocumentExplorerSplit
                  documents={documents}
                  persistKey={`${detailStateKey}:documents`}
                  listAriaLabel="Döküman listesi"
                  gl={gl}
                  projectContext={{
                    name: project.name,
                    code: project.code,
                    customer: project.customer,
                    owner: project.owner,
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
