import { ChevronsLeftRight, Filter, GripVertical, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useThemeMode } from '../../theme/ThemeProvider'
import { FilterToolbarSearch } from './FilterToolbarSearch'
import {
  DOCUMENT_TYPE_ORDER,
  type DetailDocType,
  type ExplorerDocument,
  documentIcon,
} from './documentExplorerTypes'
import '../proje/projectManagementGlassLight.css'
import { eiSplitFilterToggleClass } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { SplitListPaginationNav } from './SplitListPaginationNav'
import {
  clampSplitPaneRatio,
  splitDetailHeaderClass,
  splitListCardClass,
  splitTabPill,
  useSplitPaneDrag,
  useSplitPaneRatio,
  writeSplitPaneRatio,
} from './splitModuleStyles'

export type DocumentExplorerProjectContext = {
  name: string
  code: string
  customer: string
  owner: string
}

type DocDetailTabId = 'gecmis' | 'onizleme'

const DOC_LIST_PAGE_SIZE = 6

type PersistShape = {
  docDetailTab?: DocDetailTabId
  selectedDocId?: string
  isDocFilterOpen?: boolean
  docQuery?: string
  docTypeFilter?: 'all' | DetailDocType
  docExtFilter?: 'all' | 'PDF' | 'IFC' | 'XLSX' | 'DOCX' | 'ZIP' | 'DWG'
  docSort?: 'date-desc' | 'date-asc' | 'name-asc'
  docPage?: number
  docPageSize?: number
  /** @deprecated split-pane anahtarına taşındı */
  docSplitRatio?: number
}

function parseTurkishDate(input: string): Date {
  const [day, month, year] = input.split('.').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

type Props = {
  documents: ExplorerDocument[]
  persistKey: string
  listAriaLabel?: string
  /** Cam tema; verilmezse `useThemeMode` kullanılır */
  gl?: boolean
  /** Proje detayında seçili proje bağlamı (CRM “Seçili müşteri” benzeri) */
  projectContext?: DocumentExplorerProjectContext
}

export function DocumentExplorerSplit({
  documents,
  persistKey,
  listAriaLabel = 'Döküman listesi',
  gl: glProp,
  projectContext,
}: Props) {
  const { mode } = useThemeMode()
  const gl = glProp ?? mode === 'light'

  const [docDetailTab, setDocDetailTab] = useState<DocDetailTabId>('gecmis')
  const [isDocFilterOpen, setIsDocFilterOpen] = useState(false)
  const [docQuery, setDocQuery] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | DetailDocType>('all')
  const [docExtFilter, setDocExtFilter] = useState<'all' | 'PDF' | 'IFC' | 'XLSX' | 'DOCX' | 'ZIP' | 'DWG'>('all')
  const [docSort, setDocSort] = useState<'date-desc' | 'date-asc' | 'name-asc'>('date-desc')
  const [docPage, setDocPage] = useState(1)
  const docPageSize = DOC_LIST_PAGE_SIZE
  const docSplitPaneKey = `document-explorer:${persistKey}`
  const {
    isResizing: isDocResizing,
    setIsResizing: setIsDocResizing,
    resetRatio: resetDocSplitRatio,
    leftWidthStyle: docLeftWidthStyle,
    setRatioFromPointer: setDocRatioFromPointer,
  } = useSplitPaneRatio(docSplitPaneKey)
  const [isDocResizerHover, setIsDocResizerHover] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState(() => documents[0]?.id ?? '')
  const [hydrated, setHydrated] = useState(false)

  const docSplitRef = useRef<HTMLDivElement | null>(null)
  const docListRef = useRef<HTMLUListElement | null>(null)
  useSplitPaneDrag(docSplitRef, {
    isResizing: isDocResizing,
    setIsResizing: setIsDocResizing,
    setRatioFromPointer: setDocRatioFromPointer,
  })

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(persistKey)
      if (!raw) {
        setHydrated(true)
        return
      }
      const parsed = JSON.parse(raw) as PersistShape
      if (parsed.docDetailTab === 'gecmis' || parsed.docDetailTab === 'onizleme') setDocDetailTab(parsed.docDetailTab)
      if (typeof parsed.isDocFilterOpen === 'boolean') setIsDocFilterOpen(parsed.isDocFilterOpen)
      if (typeof parsed.docQuery === 'string') setDocQuery(parsed.docQuery)
      if (parsed.docTypeFilter) setDocTypeFilter(parsed.docTypeFilter)
      if (parsed.docExtFilter) setDocExtFilter(parsed.docExtFilter)
      if (parsed.docSort) setDocSort(parsed.docSort)
      if (typeof parsed.docPage === 'number' && parsed.docPage > 0) setDocPage(parsed.docPage)
      if (typeof parsed.docSplitRatio === 'number') {
        writeSplitPaneRatio(docSplitPaneKey, clampSplitPaneRatio(parsed.docSplitRatio))
      }
      if (typeof parsed.selectedDocId === 'string' && documents.some((d) => d.id === parsed.selectedDocId)) {
        setSelectedDocId(parsed.selectedDocId)
      }
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [docSplitPaneKey, persistKey, documents])

  useEffect(() => {
    if (!documents.some((d) => d.id === selectedDocId) && documents[0]) {
      setSelectedDocId(documents[0].id)
    }
  }, [documents, selectedDocId])

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

  const docActiveFilterCount =
    (docQuery.trim() ? 1 : 0) + (docTypeFilter !== 'all' ? 1 : 0) + (docExtFilter !== 'all' ? 1 : 0)

  const docPageCount = useMemo(
    () => Math.max(1, Math.ceil(filteredDocuments.length / docPageSize)),
    [docPageSize, filteredDocuments.length],
  )
  const safeDocPage = Math.min(docPage, docPageCount)
  const visibleDocuments = useMemo(
    () => filteredDocuments.slice((safeDocPage - 1) * docPageSize, safeDocPage * docPageSize),
    [docPageSize, filteredDocuments, safeDocPage],
  )
  const selectedDoc = useMemo(
    () => filteredDocuments.find((doc) => doc.id === selectedDocId) ?? filteredDocuments[0] ?? null,
    [filteredDocuments, selectedDocId],
  )
  const docPageStart = filteredDocuments.length === 0 ? 0 : (safeDocPage - 1) * docPageSize + 1
  const docPageEnd = Math.min(filteredDocuments.length, safeDocPage * docPageSize)

  const infoSectionTitle = gl
    ? 'text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65'
    : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'

  useEffect(() => {
    setDocPage((p) => Math.min(p, docPageCount))
  }, [docPageCount])

  useEffect(() => {
    if (filteredDocuments.length === 0) return
    if (filteredDocuments.some((d) => d.id === selectedDocId)) return
    setSelectedDocId(filteredDocuments[0]!.id)
  }, [filteredDocuments, selectedDocId])

  useEffect(() => {
    if (!isDocFilterOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDocFilterOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isDocFilterOpen])

  useEffect(() => {
    if (!hydrated) return
    const next: PersistShape = {
      docDetailTab,
      selectedDocId,
      isDocFilterOpen,
      docQuery,
      docTypeFilter,
      docExtFilter,
      docSort,
      docPage: safeDocPage,
    }
    sessionStorage.setItem(persistKey, JSON.stringify(next))
  }, [
    docDetailTab,
    docExtFilter,
    docQuery,
    docSort,
    docTypeFilter,
    hydrated,
    isDocFilterOpen,
    persistKey,
    safeDocPage,
    selectedDocId,
  ])

  const clearDocFilters = () => {
    setDocQuery('')
    setDocTypeFilter('all')
    setDocExtFilter('all')
    setDocPage(1)
  }

  const projectHeader = projectContext ? (
    <header className={splitDetailHeaderClass}>
      <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">Seçili proje</p>
      <h3 className="mt-1.5 text-xl font-semibold leading-tight text-black dark:text-white">{projectContext.name}</h3>
      <p className="mt-1 text-sm leading-snug text-black/75 dark:text-white/80">
        {projectContext.code} · {projectContext.customer} · Sorumlu {projectContext.owner}
      </p>
    </header>
  ) : null

  if (documents.length === 0) {
    return (
      <p className={gl ? 'text-sm text-black/70 dark:text-white/75' : 'text-sm text-slate-600 dark:text-slate-300'}>
        Henüz döküman yok (mock).
      </p>
    )
  }

  return (
    <div
      ref={docSplitRef}
      data-split-dragging={isDocResizing ? 'true' : undefined}
      className={['relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden', gl ? 'gap-3 rounded-3xl lg:gap-4' : 'gap-0'].join(
        ' ',
      )}
    >
      <section
        className={[
          'okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden',
          gl ? 'glass-card glass-card--static project-mgmt-split-panel min-h-0' : 'p-3',
        ].join(' ')}
        style={docLeftWidthStyle}
      >
        <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
          <h2
            className={[
              'min-w-0 shrink-0 text-sm font-semibold sm:text-base',
              gl ? 'text-black dark:text-white' : 'text-slate-900 dark:text-slate-50',
            ].join(' ')}
          >
            {listAriaLabel}
          </h2>
          <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
            <FilterToolbarSearch
              id={`doc-explorer-inline-${persistKey}`}
              value={docQuery}
              onValueChange={(v) => {
                setDocQuery(v)
                setDocPage(1)
              }}
              placeholder="ad, yükleyen, not..."
              ariaLabel="Dökümanlarda ara"
              className={['min-w-0 sm:max-w-[14rem]', gl ? 'project-mgmt-toolbar-search' : ''].filter(Boolean).join(' ')}
              inputClassName={gl ? 'glass-input' : undefined}
            />
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDocFilterOpen((prev) => !prev)}
                aria-expanded={isDocFilterOpen}
                className={eiSplitFilterToggleClass(isDocFilterOpen)}
              >
                <Filter className="size-3.5 shrink-0" aria-hidden />
                Filtrele
                {docActiveFilterCount > 0 ? (
                  <span
                    className={
                      gl
                        ? 'rounded-full bg-black/8 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-black dark:bg-white/10 dark:text-white'
                        : 'rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-black dark:bg-white/10 dark:text-white'
                    }
                  >
                    {docActiveFilterCount}
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
              isDocFilterOpen ? 'translate-x-0' : '-translate-x-[105%]',
            ].join(' ')}
            aria-hidden={!isDocFilterOpen}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-black dark:text-white">Döküman filtreleri</h4>
                <p className="mt-1 text-[11px] text-black/60 dark:text-white/65">Arama, tür, uzantı ve sıralama</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDocFilterOpen(false)}
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
                <span className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">Ara</span>
                <input
                  type="search"
                  value={docQuery}
                  onChange={(event) => {
                    setDocQuery(event.target.value)
                    setDocPage(1)
                  }}
                  placeholder="ad, yükleyen, not..."
                  className={
                    gl
                      ? 'glass-input mt-2 w-full'
                      : 'mt-2 w-full rounded-lg border border-black/22 bg-white px-3 py-2.5 text-sm dark:border-white/15 dark:bg-black/80'
                  }
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">Tür</span>
                <select
                  value={docTypeFilter}
                  onChange={(event) => {
                    setDocTypeFilter(event.target.value as 'all' | DetailDocType)
                    setDocPage(1)
                  }}
                  className={
                    gl
                      ? 'glass-input mt-2 w-full'
                      : 'mt-2 w-full rounded-lg border border-black/22 bg-white px-2 py-1.5 text-xs dark:border-white/15 dark:bg-black/80'
                  }
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
                <span className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">Uzantı</span>
                <select
                  value={docExtFilter}
                  onChange={(event) => {
                    setDocExtFilter(event.target.value as 'all' | 'PDF' | 'IFC' | 'XLSX' | 'DOCX' | 'ZIP' | 'DWG')
                    setDocPage(1)
                  }}
                  className={
                    gl
                      ? 'glass-input mt-2 w-full'
                      : 'mt-2 w-full rounded-lg border border-black/22 bg-white px-2 py-1.5 text-xs dark:border-white/15 dark:bg-black/80'
                  }
                >
                  <option value="all">Tümü</option>
                  <option value="PDF">PDF</option>
                  <option value="IFC">IFC</option>
                  <option value="XLSX">XLSX</option>
                  <option value="DOCX">DOCX</option>
                  <option value="ZIP">ZIP</option>
                  <option value="DWG">DWG</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">Sıralama</span>
                <select
                  value={docSort}
                  onChange={(event) => {
                    setDocSort(event.target.value as 'date-desc' | 'date-asc' | 'name-asc')
                    setDocPage(1)
                  }}
                  className={
                    gl
                      ? 'glass-input mt-2 w-full'
                      : 'mt-2 w-full rounded-lg border border-black/22 bg-white px-2 py-1.5 text-xs dark:border-white/15 dark:bg-black/80'
                  }
                >
                  <option value="date-desc">Tarih (yeni-eski)</option>
                  <option value="date-asc">Tarih (eski-yeni)</option>
                  <option value="name-asc">Ad (A-Z)</option>
                </select>
              </label>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-black/15 pt-2 dark:border-white/12">
              <span className="text-[11px] text-black/75 dark:text-white/80">
                Sonuç: <span className="tabular-nums font-semibold">{filteredDocuments.length}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  clearDocFilters()
                  setIsDocFilterOpen(false)
                  requestAnimationFrame(() => {
                    docListRef.current?.scrollTo({ top: 0, behavior: 'auto' })
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
            ref={docListRef}
            className="flex h-full min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1 transition-[padding] duration-100 ease-out"
            style={{ paddingLeft: isDocFilterOpen ? '18.5rem' : '0' }}
            role="list"
            aria-label={listAriaLabel}
          >
            {visibleDocuments.length > 0 ? (
              visibleDocuments.map((doc) => {
                const rowActive = selectedDoc?.id === doc.id
                return (
                <li
                  key={doc.id}
                  className={splitListCardClass(
                    rowActive,
                    'list-none flex min-h-0 shrink-0 items-stretch gap-1.5 px-2 py-1.5',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDocId(doc.id)
                      setDocDetailTab('gecmis')
                    }}
                    aria-current={rowActive ? 'true' : undefined}
                    className="min-w-0 flex-1 rounded-md px-0.5 py-0.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                  >
                    <span className="flex items-start gap-2">
                      <span
                        className={
                          gl
                            ? 'mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-black/8 text-black ring-1 ring-inset ring-black/12 dark:bg-white/10 dark:text-white dark:ring-white/15'
                            : 'mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-black/10 text-black ring-1 ring-inset ring-black/20 dark:bg-white/10 dark:text-white dark:ring-white/15'
                        }
                      >
                        {documentIcon(doc.type, doc.ext)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <p
                          className={
                            gl
                              ? 'truncate text-sm font-semibold leading-snug text-black dark:text-white'
                              : 'truncate text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50'
                          }
                        >
                          {doc.name}
                        </p>
                        <p
                          className={
                            gl
                              ? 'mt-0.5 truncate text-xs text-black/70 dark:text-white/70'
                              : 'mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400'
                          }
                        >
                          {doc.uploadedBy} · {doc.uploadedAt}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-black/8 px-1.5 py-0.5 text-[10px] font-semibold text-black dark:bg-black/50 dark:text-white/90">
                          {doc.type}
                        </p>
                      </span>
                    </span>
                  </button>
                  <div className="flex w-[7.5rem] shrink-0 flex-col justify-center gap-1 text-right">
                    <span className="text-[11px] font-semibold tabular-nums text-black/75 dark:text-white/75">{doc.ext}</span>
                    <span className="text-[11px] leading-tight text-black/60 dark:text-white/65">{doc.size}</span>
                    <span className="text-[10px] leading-tight text-black/55 dark:text-white/60">Rev {doc.revision}</span>
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
                Filtreye uygun döküman bulunamadı.
              </li>
            )}
          </ul>
        </div>

        {gl ? (
          <div className="glass-card glass-card--static project-mgmt-footer-panel sticky bottom-0 z-10 mt-2 shrink-0 text-xs">
            <DocListFooter
              gl
              filteredCount={filteredDocuments.length}
              docPageStart={docPageStart}
              docPageEnd={docPageEnd}
              safeDocPage={safeDocPage}
              docPageCount={docPageCount}
              onPrev={() => setDocPage((p) => Math.max(1, p - 1))}
              onNext={() => setDocPage((p) => Math.min(docPageCount, p + 1))}
            />
          </div>
        ) : (
          <div className="sticky bottom-0 z-10 mt-1 shrink-0 border-t border-black/15 bg-white/90 pt-2 text-xs backdrop-blur dark:border-white/12 dark:bg-black/75">
            <DocListFooter
              gl={false}
              filteredCount={filteredDocuments.length}
              docPageStart={docPageStart}
              docPageEnd={docPageEnd}
              safeDocPage={safeDocPage}
              docPageCount={docPageCount}
              onPrev={() => setDocPage((p) => Math.max(1, p - 1))}
              onNext={() => setDocPage((p) => Math.min(docPageCount, p + 1))}
            />
          </div>
        )}
      </section>

      <div className="relative z-10 mx-1 hidden w-2 shrink-0 cursor-col-resize lg:flex">
        <button
          type="button"
          aria-label="Paneller arası genişliği ayarla"
          title="Çift tıklayarak varsayılan sütun genişliğine dön"
          onMouseDown={() => setIsDocResizing(true)}
          onDoubleClick={(e) => {
            e.preventDefault()
            setIsDocResizing(false)
            resetDocSplitRatio()
          }}
          onMouseEnter={() => setIsDocResizerHover(true)}
          onMouseLeave={() => setIsDocResizerHover(false)}
          className={[
            'group absolute inset-y-3 left-1/2 -translate-x-1/2 rounded-full border transition',
            isDocResizing || isDocResizerHover
              ? gl
                ? 'w-6 border-black/35 bg-black/12 dark:border-white/18 dark:bg-black/60'
                : 'w-6 border-black/25 bg-black/8 dark:border-white/20 dark:bg-black/50'
              : gl
                ? 'w-3 border-black/18 bg-white/70 dark:border-white/12 dark:bg-black/55'
                : 'w-3 border-slate-200/80 bg-white/70 dark:border-slate-700/80 dark:bg-slate-900/60',
          ].join(' ')}
        >
          <span
            className={
              gl
                ? 'pointer-events-none flex h-full items-center justify-center text-black/55 dark:text-white/70'
                : 'pointer-events-none flex h-full items-center justify-center text-slate-500 dark:text-slate-300'
            }
          >
            {isDocResizing || isDocResizerHover ? (
              <ChevronsLeftRight className="size-3.5" />
            ) : (
              <GripVertical className="size-3.5" />
            )}
          </span>
        </button>
      </div>

      <section
        className={
          gl
            ? 'okan-project-split-aside glass-card glass-card--static project-mgmt-split-panel flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
            : 'okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2'
        }
      >
        {selectedDoc ? (
          <div key={selectedDocId} className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 lg:max-w-3xl">
              {projectHeader}
              <header className={splitDetailHeaderClass}>
                <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                  Seçili döküman
                </p>
                <h3 className="mt-1.5 text-xl font-semibold leading-tight text-black dark:text-white">{selectedDoc.name}</h3>
                <p className="mt-1 text-sm leading-snug text-black/75 dark:text-white/80">
                  Rev {selectedDoc.revision} · {selectedDoc.uploadedBy}
                </p>
              </header>

              <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
                <div
                  className="flex max-w-full flex-wrap justify-center gap-1 overflow-x-auto"
                  role="tablist"
                  aria-label="Seçili döküman panel sekmeleri"
                  aria-orientation="horizontal"
                >
                  {(
                    [
                      ['gecmis', 'Döküman geçmişi'],
                      ['onizleme', 'Önizleme'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      id={`doc-explorer-tab-${id}`}
                      aria-selected={docDetailTab === id}
                      aria-controls="doc-explorer-panel"
                      tabIndex={docDetailTab === id ? 0 : -1}
                      onClick={() => setDocDetailTab(id)}
                      className={splitTabPill(docDetailTab === id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                id="doc-explorer-panel"
                role="tabpanel"
                aria-labelledby={`doc-explorer-tab-${docDetailTab}`}
                className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-left sm:px-1"
              >
                {docDetailTab === 'gecmis' ? (
                  <div
                    className={
                      gl
                        ? 'flex flex-col divide-y divide-black/12 text-sm dark:divide-white/10'
                        : 'flex flex-col divide-y divide-slate-200/70 text-sm dark:divide-slate-700/60'
                    }
                  >
                    <section className="py-4 first:pt-0">
                      <p className={infoSectionTitle}>Yükleyen ve meta</p>
                      <p className={gl ? 'mt-2 font-medium text-black dark:text-white' : 'mt-2 font-medium text-slate-900 dark:text-slate-50'}>
                        {selectedDoc.uploadedBy}
                      </p>
                      <p className={gl ? 'mt-1 text-xs text-black/65 dark:text-white/70' : 'mt-1 text-xs text-slate-500 dark:text-slate-400'}>
                        Yüklenme: {selectedDoc.uploadedAt} · Boyut: {selectedDoc.size}
                      </p>
                    </section>
                    <section className="py-4">
                      <p className={infoSectionTitle}>Notlar</p>
                      <p className={gl ? 'mt-2 font-medium text-black dark:text-white' : 'mt-2 font-medium text-slate-900 dark:text-slate-50'}>
                        {selectedDoc.note}
                      </p>
                    </section>
                    <section className="py-4">
                      <p className={infoSectionTitle}>Revizyon geçmişi</p>
                      <ul
                        className={
                          gl
                            ? 'mt-2 space-y-1.5 text-xs text-black/80 dark:text-white/80'
                            : 'mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-200'
                        }
                      >
                        <li>
                          Rev {selectedDoc.revision} · {selectedDoc.uploadedAt} · {selectedDoc.uploadedBy}
                        </li>
                        <li>Önceki revizyon · 08.04.2026 17:10 · Sistem içe aktarma</li>
                      </ul>
                    </section>
                  </div>
                ) : (
                  <div
                    className={
                      gl
                        ? 'overflow-hidden rounded-xl border border-black/12 dark:border-white/10'
                        : 'overflow-hidden rounded-xl border border-slate-200/60 bg-slate-100/80 dark:border-slate-600/50 dark:bg-slate-900/50'
                    }
                  >
                    <iframe
                      title={`${selectedDoc.name} önizleme`}
                      src={selectedDoc.previewUrl}
                      className="h-[min(56vh,460px)] w-full"
                    />
                  </div>
                )}
              </div>
              </div>
            </div>
        ) : (
          <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 lg:max-w-3xl">
            {projectHeader}
            <p className="text-center text-sm text-black/80 dark:text-white/80">Döküman seçin.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function DocListFooter({
  gl,
  filteredCount,
  docPageStart,
  docPageEnd,
  safeDocPage,
  docPageCount,
  onPrev,
  onNext,
}: {
  gl: boolean
  filteredCount: number
  docPageStart: number
  docPageEnd: number
  safeDocPage: number
  docPageCount: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className={gl ? 'text-black dark:text-white/80' : 'text-black/75 dark:text-white/80'}>
        {filteredCount > 0 ? (
          <>
            <span className="tabular-nums font-semibold text-black dark:text-white">{docPageStart}</span>-
            <span className="tabular-nums font-semibold text-black dark:text-white">{docPageEnd}</span> /{' '}
            <span className="tabular-nums font-semibold text-black dark:text-white">{filteredCount}</span> sonuç
          </>
        ) : (
          'Sonuç yok'
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {filteredCount > 0 ? (
          <SplitListPaginationNav
            safePage={safeDocPage}
            pageCount={docPageCount}
            onPrev={onPrev}
            onNext={onNext}
            gl={gl}
            buttonStyle={gl ? 'glass' : 'legacy'}
            pageIndicatorClassName={
              gl ? 'tabular-nums text-black/80 dark:text-white/75' : 'tabular-nums text-black/70 dark:text-white/75'
            }
          />
        ) : null}
      </div>
    </div>
  )
}
