import { BarChart3, ChevronsLeftRight, ChevronRight, FileCode2, FileSpreadsheet, FileText, Filter, GripVertical, ScrollText, Search, ShieldCheck, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { projectManagementActivitiesMock, projectManagementCardsMock } from '../../data/projectManagementCardsMock'
import { useI18n } from '../../i18n/I18nProvider'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import { ProjectDetailPieceCodesPanel } from './ProjectDetailPieceCodesPanel'

type ProjectDetailTabId =
  | 'ozet'
  | 'bilgi'
  | 'urun-listesi'
  | 'takip'
  | 'mesajlar'
  | 'dokumanlar'
type DocumentDetailTabId = 'gecmis' | 'onizleme'

const PROJECT_DETAIL_TABS: { id: ProjectDetailTabId; label: string }[] = [
  { id: 'ozet', label: 'Genel' },
  { id: 'bilgi', label: 'Bilgi' },
  { id: 'urun-listesi', label: 'Ürün listesi' },
  { id: 'takip', label: 'Proje takibi' },
  { id: 'mesajlar', label: 'Mesajlar & notlar' },
  { id: 'dokumanlar', label: 'Dökümanlar' },
]

const DOCUMENT_TYPE_ORDER = ['Sözleşme', 'Çizim', 'Model', 'Kalite', 'Rapor'] as const
type ProjectDetailDocType = (typeof DOCUMENT_TYPE_ORDER)[number]
type ProjectDetailDocument = {
  id: string
  type: ProjectDetailDocType
  name: string
  size: string
  ext: string
  uploadedAt: string
  uploadedBy: string
  revision: string
  note: string
  previewUrl: string
}

function parseTurkishDate(input: string): Date {
  const [day, month, year] = input.split('.').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

function documentIcon(type: (typeof DOCUMENT_TYPE_ORDER)[number], ext: string) {
  if (ext === 'XLSX') return <FileSpreadsheet className="size-4" aria-hidden />
  if (type === 'Model') return <FileCode2 className="size-4" aria-hidden />
  if (type === 'Kalite') return <ShieldCheck className="size-4" aria-hidden />
  if (type === 'Rapor') return <BarChart3 className="size-4" aria-hidden />
  if (type === 'Sözleşme') return <ScrollText className="size-4" aria-hidden />
  return <FileText className="size-4" aria-hidden />
}

export function ProjectManagementDetailPage() {
  const { t } = useI18n()
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
  const [docDetailTab, setDocDetailTab] = useState<DocumentDetailTabId>(() => {
    try {
      const raw = sessionStorage.getItem(detailStateKey)
      if (!raw) return 'gecmis'
      const parsed = JSON.parse(raw) as { docDetailTab?: DocumentDetailTabId }
      return parsed.docDetailTab ?? 'gecmis'
    } catch {
      return 'gecmis'
    }
  })
  const [isDocFilterOpen, setIsDocFilterOpen] = useState(() => {
    try {
      const raw = sessionStorage.getItem(detailStateKey)
      if (!raw) return false
      const parsed = JSON.parse(raw) as { isDocFilterOpen?: boolean }
      return Boolean(parsed.isDocFilterOpen)
    } catch {
      return false
    }
  })
  const [docQuery, setDocQuery] = useState(() => {
    try {
      const raw = sessionStorage.getItem(detailStateKey)
      if (!raw) return ''
      const parsed = JSON.parse(raw) as { docQuery?: string }
      return parsed.docQuery ?? ''
    } catch {
      return ''
    }
  })
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | (typeof DOCUMENT_TYPE_ORDER)[number]>(() => {
    try {
      const raw = sessionStorage.getItem(detailStateKey)
      if (!raw) return 'all'
      const parsed = JSON.parse(raw) as { docTypeFilter?: 'all' | (typeof DOCUMENT_TYPE_ORDER)[number] }
      return parsed.docTypeFilter ?? 'all'
    } catch {
      return 'all'
    }
  })
  const [docExtFilter, setDocExtFilter] = useState<'all' | 'PDF' | 'IFC' | 'XLSX'>(() => {
    try {
      const raw = sessionStorage.getItem(detailStateKey)
      if (!raw) return 'all'
      const parsed = JSON.parse(raw) as { docExtFilter?: 'all' | 'PDF' | 'IFC' | 'XLSX' }
      return parsed.docExtFilter ?? 'all'
    } catch {
      return 'all'
    }
  })
  const [docSort, setDocSort] = useState<'date-desc' | 'date-asc' | 'name-asc'>(() => {
    try {
      const raw = sessionStorage.getItem(detailStateKey)
      if (!raw) return 'date-desc'
      const parsed = JSON.parse(raw) as { docSort?: 'date-desc' | 'date-asc' | 'name-asc' }
      return parsed.docSort ?? 'date-desc'
    } catch {
      return 'date-desc'
    }
  })
  const [docPage, setDocPage] = useState(() => {
    try {
      const raw = sessionStorage.getItem(detailStateKey)
      if (!raw) return 1
      const parsed = JSON.parse(raw) as { docPage?: number }
      return typeof parsed.docPage === 'number' && parsed.docPage > 0 ? parsed.docPage : 1
    } catch {
      return 1
    }
  })
  const [docPageSize, setDocPageSize] = useState(() => {
    try {
      const raw = sessionStorage.getItem(detailStateKey)
      if (!raw) return 6
      const parsed = JSON.parse(raw) as { docPageSize?: number }
      return typeof parsed.docPageSize === 'number' && parsed.docPageSize > 0 ? parsed.docPageSize : 6
    } catch {
      return 6
    }
  })
  const [docSplitRatio, setDocSplitRatio] = useState(() => {
    try {
      const raw = sessionStorage.getItem(detailStateKey)
      if (!raw) return 40
      const parsed = JSON.parse(raw) as { docSplitRatio?: number }
      return typeof parsed.docSplitRatio === 'number' ? Math.min(55, Math.max(30, parsed.docSplitRatio)) : 40
    } catch {
      return 40
    }
  })
  const [isDocResizing, setIsDocResizing] = useState(false)
  const [isDocResizerHover, setIsDocResizerHover] = useState(false)
  const docSplitRef = useRef<HTMLDivElement | null>(null)
  const docListRef = useRef<HTMLUListElement | null>(null)
  const docSentinelRef = useRef<HTMLLIElement | null>(null)

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
  const messageRows = useMemo(
    () => [
      { id: 'm1', pinned: true, by: 'Selin Güler', at: '14.04 08:30', text: 'Montaj sırası değişiklikleri sahaya iletildi. Bu not pinned.', kind: 'not' },
      { id: 'm2', pinned: true, by: 'Murat Kaya', at: '13.04 17:00', text: 'B Blok için vinç müsaitliği 18 Nisan sabahı net.', kind: 'mesaj' },
      { id: 'm3', pinned: false, by: 'Ayşe Yıldız', at: '13.04 11:10', text: 'Dış panel yüzey kalite formu sisteme yüklendi.', kind: 'mesaj' },
      { id: 'm4', pinned: false, by: 'Onur Demir', at: '12.04 15:35', text: 'Model koordinasyon raporu paylaşıldı.', kind: 'not' },
    ],
    [],
  )
  const documents = useMemo<ProjectDetailDocument[]>(
    () => [
      { id: 'd1', type: 'Sözleşme', name: 'Sozlesme_RevB.pdf', size: '3.2 MB', ext: 'PDF', uploadedAt: '10.04.2026 09:15', uploadedBy: 'Selin Güler', revision: 'B', note: 'Ek protokol eklendi.', previewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf' },
      { id: 'd2', type: 'Model', name: 'Koordinasyon_Model.ifc', size: '18.4 MB', ext: 'IFC', uploadedAt: '12.04.2026 14:20', uploadedBy: 'Onur Demir', revision: 'C', note: 'Şaft aksı güncellendi.', previewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf' },
      { id: 'd3', type: 'Çizim', name: 'Cephe_Panel_Detay_R3.pdf', size: '6.9 MB', ext: 'PDF', uploadedAt: '14.04.2026 08:40', uploadedBy: 'Mühendislik', revision: 'R3', note: 'Bağlantı plakası revizyonu.', previewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf' },
      { id: 'd4', type: 'Kalite', name: 'Kalite_Kontrol_Formu.xlsx', size: '1.1 MB', ext: 'XLSX', uploadedAt: '13.04.2026 16:05', uploadedBy: 'Ayşe Yıldız', revision: 'A', note: 'Yeni kontrol alanları eklendi.', previewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf' },
      { id: 'd5', type: 'Rapor', name: 'Haftalik_Proje_Raporu_15.pdf', size: '2.6 MB', ext: 'PDF', uploadedAt: '15.04.2026 07:50', uploadedBy: 'Planlama', revision: '1', note: 'İlerleme ve risk özeti.', previewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf' },
    ],
    [],
  )
  const [selectedDocId, setSelectedDocId] = useState<string>(() => {
    const fallback = documents[0]?.id ?? ''
    try {
      const raw = sessionStorage.getItem(detailStateKey)
      if (!raw) return fallback
      const parsed = JSON.parse(raw) as { selectedDocId?: string }
      return parsed.selectedDocId ?? fallback
    } catch {
      return fallback
    }
  })
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
  const filteredDocuments = useMemo(() => {
    const q = docQuery.trim().toLocaleLowerCase('tr-TR')
    return documents
      .filter((doc) => {
        if (docTypeFilter !== 'all' && doc.type !== docTypeFilter) return false
        if (docExtFilter !== 'all' && doc.ext !== docExtFilter) return false
        if (!q) return true
        return (
          doc.name.toLocaleLowerCase('tr-TR').includes(q) ||
          doc.uploadedBy.toLocaleLowerCase('tr-TR').includes(q) ||
          doc.note.toLocaleLowerCase('tr-TR').includes(q)
        )
      })
      .toSorted((a, b) => {
        if (docSort === 'name-asc') return a.name.localeCompare(b.name, 'tr')
        const ad = parseTurkishDate(a.uploadedAt.split(' ')[0]).getTime()
        const bd = parseTurkishDate(b.uploadedAt.split(' ')[0]).getTime()
        return docSort === 'date-asc' ? ad - bd : bd - ad
      })
  }, [docExtFilter, docQuery, docSort, docTypeFilter, documents])
  const docPageCount = useMemo(
    () => Math.max(1, Math.ceil(filteredDocuments.length / docPageSize)),
    [docPageSize, filteredDocuments.length],
  )
  const safeDocPage = Math.min(docPage, docPageCount)
  const visibleDocuments = useMemo(
    () => filteredDocuments.slice(0, safeDocPage * docPageSize),
    [docPageSize, filteredDocuments, safeDocPage],
  )
  const selectedDoc = useMemo(
    () => visibleDocuments.find((doc) => doc.id === selectedDocId) ?? filteredDocuments[0] ?? null,
    [filteredDocuments, selectedDocId, visibleDocuments],
  )
  const docPageStart = filteredDocuments.length === 0 ? 0 : 1
  const docPageEnd = Math.min(filteredDocuments.length, safeDocPage * docPageSize)
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
    if (!isDocFilterOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDocFilterOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isDocFilterOpen])

  useEffect(() => {
    const root = docListRef.current
    const target = docSentinelRef.current
    if (!root || !target || safeDocPage >= docPageCount) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setDocPage((prev) => Math.min(docPageCount, prev + 1))
      },
      { root, rootMargin: '0px 0px 80px 0px', threshold: 0 },
    )
    io.observe(target)
    return () => io.disconnect()
  }, [docPageCount, safeDocPage, visibleDocuments.length])

  useEffect(() => {
    if (!isDocResizing) return
    const onMouseMove = (event: MouseEvent) => {
      const host = docSplitRef.current
      if (!host) return
      const rect = host.getBoundingClientRect()
      if (rect.width <= 0) return
      const next = ((event.clientX - rect.left) / rect.width) * 100
      setDocSplitRatio(Math.min(55, Math.max(30, Number(next.toFixed(2)))))
    }
    const onMouseUp = () => setIsDocResizing(false)
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
  }, [isDocResizing])

  useEffect(() => {
    const next = {
      activeTab,
      docDetailTab,
      selectedDocId,
      isDocFilterOpen,
      docQuery,
      docTypeFilter,
      docExtFilter,
      docSort,
      docPage: safeDocPage,
      docPageSize,
      docSplitRatio,
    }
    sessionStorage.setItem(detailStateKey, JSON.stringify(next))
  }, [
    activeTab,
    detailStateKey,
    docDetailTab,
    docExtFilter,
    docPageSize,
    docQuery,
    docSort,
    docSplitRatio,
    docTypeFilter,
    isDocFilterOpen,
    safeDocPage,
    selectedDocId,
  ])

  if (!cameFromList) return <Navigate to="/proje" replace />
  if (!project) return <Navigate to="/proje" replace />

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[1.25rem]">
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2">
        <div className="px-[0.6875rem] py-1">
          <div className="mb-2 pb-2">
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-2xl">
              {project.name} Proje Detayı
            </h1>
          </div>
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
              <li>
            <button
              type="button"
              onClick={() => navigate('/proje')}
                  className="font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400"
            >
                  {t('nav.project')}
            </button>
              </li>
              <li className="flex items-center gap-1" aria-hidden>
                <ChevronRight className="size-3.5 shrink-0 opacity-70" />
              </li>
              <li className="max-w-[40ch] truncate font-semibold text-slate-800 dark:text-slate-100" aria-current="page">
                {project.name} Proje Detayı
              </li>
            </ol>
          </nav>
        </div>

        <div className="min-h-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex h-full min-h-0 flex-col gap-3 px-1 sm:px-2">
            <div
              className="flex shrink-0 gap-1 overflow-x-auto"
          role="tablist"
          aria-label="Proje detay sekmeleri"
        >
          {PROJECT_DETAIL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                activeTab === tab.id
                      ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
                      : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

            <div className={`min-h-0 flex-1 ${activeTab === 'urun-listesi' || activeTab === 'dokumanlar' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
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
                <div className="space-y-5">
                  <section className="pb-4 border-b border-slate-200/25 dark:border-white/10">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Temel bilgiler
                    </p>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        ['Proje adı', project.name],
                        ['Kod', project.code],
                        ['Müşteri', project.customer],
                        ['Sorumlu', project.owner],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
                          <dd className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-50">{value}</dd>
                </div>
              ))}
                    </dl>
                  </section>
                  <section className="pb-4 border-b border-slate-200/25 dark:border-white/10">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Takvim & ilerleme
                    </p>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ['Durum', project.status],
                        ['Öncelik', project.priority],
                        ['Başlangıç', project.startDate],
                        ['Termin', project.dueDate],
                        ['İlerleme', `%${project.progress}`],
                        ['Güncelleme', project.updatedAt],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
                          <dd className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-50">{value}</dd>
                </div>
              ))}
                    </dl>
                  </section>
                  <section>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Operasyon notları
                    </p>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">Bütçe</dt>
                        <dd className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-50">
                          Henüz tanımlanmadı
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-slate-500 dark:text-slate-400">Açıklama</dt>
                        <dd className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-50">{project.note}</dd>
                  </div>
                    </dl>
                  </section>
                </div>
              ) : null}

              {activeTab === 'urun-listesi' ? <ProjectDetailPieceCodesPanel /> : null}

              {activeTab === 'takip' ? (
                <ul className="divide-y divide-slate-200/30 dark:divide-white/10">
                  {followUpRows.map((row) => (
                    <li key={row.id} className="py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{row.title}</p>
                        <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">{row.at}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{row.detail}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sorumlu ekip: {row.owner}</p>
                    </li>
                  ))}
                  {activities.length ? (
                    <li className="py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Aktivite logları
                      </p>
                      <ul className="mt-2 divide-y divide-slate-200/30 dark:divide-white/10">
                        {activities.slice(0, 6).map((a) => (
                          <li key={a.id} className="flex gap-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                            <span className="w-20 shrink-0 tabular-nums text-slate-500 dark:text-slate-400">{a.at}</span>
                            <span className="min-w-0 flex-1">{a.text}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : null}
                </ul>
          ) : null}

              {activeTab === 'mesajlar' ? (
                <div className="space-y-4">
                  <section>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Pinlenen notlar
                    </p>
                    <ul className="mt-2 divide-y divide-slate-200/30 dark:divide-white/10">
                      {messageRows
                        .filter((row) => row.pinned)
                        .map((row) => (
                          <li key={row.id} className="py-2 text-sm">
                            <p className="font-medium text-slate-900 dark:text-slate-50">{row.text}</p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {row.by} · {row.at}
                            </p>
                          </li>
                        ))}
                    </ul>
                  </section>
                  <section>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Mesaj akışı
                    </p>
                    <ul className="mt-2 divide-y divide-slate-200/30 dark:divide-white/10">
                      {messageRows.map((row) => (
                        <li key={row.id} className="py-2 text-sm">
                          <p className="text-slate-800 dark:text-slate-100">{row.text}</p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {row.kind === 'not' ? 'Not' : 'Mesaj'} · {row.by} · {row.at}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <textarea
                      rows={3}
                      placeholder="Yeni mesaj / not ekle... (mock)"
                      className="okan-liquid-input mt-3 w-full resize-none border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none"
                    />
                  </section>
            </div>
          ) : null}

              {activeTab === 'dokumanlar' ? (
                <div
                  ref={docSplitRef}
                  className="relative flex h-full min-h-0 min-w-0 overflow-hidden gap-0"
                >
                  <section
                    className="okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden p-3"
                    style={{ width: `calc(${docSplitRatio}% - 5px)` }}
                  >
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
                      <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Döküman listesi
                      </p>
                      <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                        <FilterToolbarSearch
                          id="project-detail-doc-inline-search"
                          value={docQuery}
                          onValueChange={(v) => {
                            setDocQuery(v)
                            setDocPage(1)
                          }}
                          placeholder="ad, yükleyen, not..."
                          ariaLabel="Dökümanlarda ara"
                          className="min-w-0 sm:max-w-[14rem]"
                        />
                        <button
                          type="button"
                          onClick={() => setIsDocFilterOpen((prev) => !prev)}
                          className={[
                            'inline-flex shrink-0 items-center gap-1 self-center rounded-lg border px-2 py-1 text-[11px] font-semibold transition',
                            isDocFilterOpen
                              ? 'border-sky-300/70 bg-sky-100/70 text-sky-900 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100'
                              : 'border-slate-200/70 bg-white/70 text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200',
                          ].join(' ')}
                        >
                          <Filter className="size-3" aria-hidden />
                          Filtrele
                        </button>
                      </div>
                    </div>
                    <div className="relative min-h-0 flex-1 overflow-hidden">
                      <aside
                        className={[
                          'absolute inset-y-0 left-0 z-20 w-60 overflow-y-auto rounded-xl border border-slate-200/70 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-transform dark:border-slate-700/70 dark:bg-slate-900/95',
                          isDocFilterOpen ? 'translate-x-0' : '-translate-x-[105%]',
                        ].join(' ')}
                        aria-hidden={!isDocFilterOpen}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Döküman filtreleri
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsDocFilterOpen(false)}
                            className="inline-flex size-6 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <X className="size-3.5" aria-hidden />
                          </button>
                        </div>
            <div className="space-y-2">
                          <label className="block">
                            <span className="text-[11px] text-slate-600 dark:text-slate-300">Ara</span>
                            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-600 dark:bg-slate-950">
                              <Search className="size-3 text-slate-500" aria-hidden />
                              <input
                                value={docQuery}
                                onChange={(event) => {
                                  setDocQuery(event.target.value)
                                  setDocPage(1)
                                }}
                                className="w-full bg-transparent py-1.5 text-xs outline-none"
                                placeholder="ad, yükleyen, not..."
                              />
                            </div>
                          </label>
                          <label className="block">
                            <span className="text-[11px] text-slate-600 dark:text-slate-300">Tür</span>
                            <select
                              value={docTypeFilter}
                              onChange={(event) => {
                                setDocTypeFilter(event.target.value as 'all' | (typeof DOCUMENT_TYPE_ORDER)[number])
                                setDocPage(1)
                              }}
                              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-950"
                            >
                              <option value="all">Tümü</option>
                              {DOCUMENT_TYPE_ORDER.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-[11px] text-slate-600 dark:text-slate-300">Uzantı</span>
                            <select
                              value={docExtFilter}
                              onChange={(event) => {
                                setDocExtFilter(event.target.value as 'all' | 'PDF' | 'IFC' | 'XLSX')
                                setDocPage(1)
                              }}
                              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-950"
                            >
                              <option value="all">Tümü</option>
                              <option value="PDF">PDF</option>
                              <option value="IFC">IFC</option>
                              <option value="XLSX">XLSX</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-[11px] text-slate-600 dark:text-slate-300">Sıralama</span>
                            <select
                              value={docSort}
                              onChange={(event) => {
                                setDocSort(event.target.value as 'date-desc' | 'date-asc' | 'name-asc')
                                setDocPage(1)
                              }}
                              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-950"
                            >
                              <option value="date-desc">Tarih (yeni-eski)</option>
                              <option value="date-asc">Tarih (eski-yeni)</option>
                              <option value="name-asc">Ad (A-Z)</option>
                            </select>
                          </label>
                        </div>
                      </aside>
                      <ul
                        ref={docListRef}
                        className="h-full space-y-1.5 overflow-y-auto pr-1 transition-[padding] duration-300"
                        style={{ paddingLeft: isDocFilterOpen ? '15.5rem' : '0' }}
                      >
                        {visibleDocuments.map((doc) => (
                          <li key={doc.id} className="rounded-lg border border-slate-200/50 bg-white/60 dark:border-slate-700/50 dark:bg-slate-900/35">
                            <button
                              type="button"
                              onClick={() => setSelectedDocId(doc.id)}
                              className={[
                                'flex w-full items-start gap-2.5 px-2.5 py-2 text-left text-xs transition',
                                selectedDoc?.id === doc.id
                                  ? 'bg-sky-500/10 dark:bg-sky-400/10'
                                  : 'hover:bg-white/80 dark:hover:bg-slate-900/50',
                              ].join(' ')}
                            >
                              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/60">
                                {documentIcon(doc.type, doc.ext)}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                  {doc.type}
                                </span>
                                <p className="mt-1 truncate font-semibold text-slate-900 dark:text-slate-50">{doc.name}</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                  {doc.ext} · {doc.size}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.uploadedAt}</p>
                              </span>
                            </button>
                          </li>
                        ))}
                        {safeDocPage < docPageCount ? (
                          <li ref={docSentinelRef} className="h-1 w-full shrink-0 list-none" aria-hidden />
                        ) : null}
                        {visibleDocuments.length === 0 ? (
                          <li className="rounded-lg border border-slate-200/50 bg-white/60 px-3 py-2 text-xs text-slate-600 dark:border-slate-700/50 dark:bg-slate-900/35 dark:text-slate-300">
                            Filtreye uygun döküman bulunamadı.
                          </li>
                        ) : null}
                      </ul>
                    </div>
                    <div className="mt-1 border-t border-slate-200/60 pt-2 text-xs dark:border-slate-700/60">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-slate-600 dark:text-slate-300">
                          {docPageStart}-{docPageEnd} / {filteredDocuments.length} sonuç
                        </p>
                        <label className="flex items-center gap-1">
                          <span className="text-slate-600 dark:text-slate-300">Sayfa boyutu</span>
                          <select
                            value={docPageSize}
                            onChange={(event) => {
                              setDocPageSize(Number(event.target.value))
                              setDocPage(1)
                              requestAnimationFrame(() => {
                                docListRef.current?.scrollTo({ top: 0, behavior: 'auto' })
                              })
                            }}
                            className="rounded-md border border-slate-300 bg-white px-1.5 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                          >
                            {[4, 6, 8, 12].map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  </section>
                  <div className="relative z-10 mx-1 hidden w-2 shrink-0 cursor-col-resize lg:flex">
                    <button
                      type="button"
                      aria-label="Paneller arası genişliği ayarla"
                      onMouseDown={() => setIsDocResizing(true)}
                      onMouseEnter={() => setIsDocResizerHover(true)}
                      onMouseLeave={() => setIsDocResizerHover(false)}
                      className={[
                        'group absolute inset-y-3 left-1/2 -translate-x-1/2 rounded-full border transition',
                        isDocResizing || isDocResizerHover
                          ? 'w-6 border-sky-300/70 bg-sky-100/70 dark:border-sky-500/60 dark:bg-sky-900/40'
                          : 'w-3 border-slate-200/80 bg-white/70 dark:border-slate-700/80 dark:bg-slate-900/60',
                      ].join(' ')}
                    >
                      <span className="pointer-events-none flex h-full items-center justify-center text-slate-500 dark:text-slate-300">
                        {isDocResizing || isDocResizerHover ? (
                          <ChevronsLeftRight className="size-3.5" />
                        ) : (
                          <GripVertical className="size-3.5" />
                        )}
                      </span>
                    </button>
                  </div>
                  <section className="okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2">
                    {selectedDoc ? (
                      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Seçili döküman
                          </p>
                          <h3 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-50">{selectedDoc.name}</h3>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Rev {selectedDoc.revision} · {selectedDoc.uploadedBy}
                          </p>
                        </header>
                        <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
                          <div className="flex max-w-full gap-1 overflow-x-auto">
                          {([
                            ['gecmis', 'Döküman geçmişi'],
                            ['onizleme', 'Önizleme'],
                          ] as const).map(([id, label]) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setDocDetailTab(id)}
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                docDetailTab === id
                                  ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
                                  : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                          </div>
                        </div>
                        <div className="okan-project-tab-panel mt-3 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-left sm:px-1">
                          {docDetailTab === 'gecmis' ? (
                            <div className="space-y-3 text-sm">
                              <div className="rounded-lg border border-slate-200/45 bg-white/65 p-3 dark:border-slate-700/50 dark:bg-slate-900/35">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Yükleyen</p>
                                <p className="font-medium text-slate-900 dark:text-slate-50">{selectedDoc.uploadedBy}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  Yüklenme: {selectedDoc.uploadedAt} · Boyut: {selectedDoc.size}
                                </p>
                              </div>
                              <div className="rounded-lg border border-slate-200/45 bg-white/65 p-3 dark:border-slate-700/50 dark:bg-slate-900/35">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Notlar</p>
                                <p className="font-medium text-slate-900 dark:text-slate-50">{selectedDoc.note}</p>
                              </div>
                              <div className="rounded-lg border border-slate-200/45 bg-white/65 p-3 dark:border-slate-700/50 dark:bg-slate-900/35">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Revizyon geçmişi</p>
                                <ul className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-200">
                                  <li>Rev {selectedDoc.revision} · {selectedDoc.uploadedAt} · {selectedDoc.uploadedBy}</li>
                                  <li>Önceki revizyon · 08.04.2026 17:10 · Sistem içe aktarma</li>
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-slate-100/80 dark:border-slate-600/50 dark:bg-slate-900/50">
                              <iframe
                                title={`${selectedDoc.name} önizleme`}
                                src={selectedDoc.previewUrl}
                                className="h-[min(56vh,460px)] w-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-slate-300">Döküman seçin.</p>
                    )}
                  </section>
                </div>
              ) : null}
            </div>
              </div>
            </div>
      </div>
    </div>
  )
}
