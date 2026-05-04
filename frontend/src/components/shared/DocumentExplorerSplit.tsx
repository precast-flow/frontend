import { ChevronsLeftRight, Filter, GripVertical, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DOCUMENT_TYPE_ORDER,
  type DetailDocType,
  type ExplorerDocument,
  documentIcon,
} from './documentExplorerTypes'
import { FilterToolbarSearch } from './FilterToolbarSearch'

type DocDetailTabId = 'gecmis' | 'onizleme'

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
}

export function DocumentExplorerSplit({ documents, persistKey, listAriaLabel = 'Döküman listesi' }: Props) {
  const [docDetailTab, setDocDetailTab] = useState<DocDetailTabId>('gecmis')
  const [isDocFilterOpen, setIsDocFilterOpen] = useState(false)
  const [docQuery, setDocQuery] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | DetailDocType>('all')
  const [docExtFilter, setDocExtFilter] = useState<'all' | 'PDF' | 'IFC' | 'XLSX' | 'DOCX' | 'ZIP' | 'DWG'>('all')
  const [docSort, setDocSort] = useState<'date-desc' | 'date-asc' | 'name-asc'>('date-desc')
  const [docPage, setDocPage] = useState(1)
  const [docPageSize, setDocPageSize] = useState(6)
  const [docSplitRatio, setDocSplitRatio] = useState(40)
  const [isDocResizing, setIsDocResizing] = useState(false)
  const [isDocResizerHover, setIsDocResizerHover] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState(() => documents[0]?.id ?? '')
  const [hydrated, setHydrated] = useState(false)

  const docSplitRef = useRef<HTMLDivElement | null>(null)
  const docListRef = useRef<HTMLUListElement | null>(null)
  const docSentinelRef = useRef<HTMLLIElement | null>(null)

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
      if (typeof parsed.docPageSize === 'number' && parsed.docPageSize > 0) setDocPageSize(parsed.docPageSize)
      if (typeof parsed.docSplitRatio === 'number')
        setDocSplitRatio(Math.min(55, Math.max(30, parsed.docSplitRatio)))
      if (typeof parsed.selectedDocId === 'string' && documents.some((d) => d.id === parsed.selectedDocId)) {
        setSelectedDocId(parsed.selectedDocId)
      }
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [persistKey, documents])

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
      docPageSize,
      docSplitRatio,
    }
    sessionStorage.setItem(persistKey, JSON.stringify(next))
  }, [
    docDetailTab,
    docExtFilter,
    docPageSize,
    docQuery,
    docSort,
    docSplitRatio,
    docTypeFilter,
    hydrated,
    isDocFilterOpen,
    persistKey,
    safeDocPage,
    selectedDocId,
  ])

  if (documents.length === 0) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Henüz döküman yok (mock).</p>
  }

  return (
    <div ref={docSplitRef} className="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden gap-0">
      <section
        className="okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden p-3"
        style={{ width: `calc(${docSplitRatio}% - 5px)` }}
      >
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
          <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {listAriaLabel}
          </p>
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
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Döküman filtreleri</p>
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
                    setDocTypeFilter(event.target.value as 'all' | DetailDocType)
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
                    setDocExtFilter(event.target.value as 'all' | 'PDF' | 'IFC' | 'XLSX' | 'DOCX' | 'ZIP' | 'DWG')
                    setDocPage(1)
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-950"
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
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Seçili döküman</p>
              <h3 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-50">{selectedDoc.name}</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Rev {selectedDoc.revision} · {selectedDoc.uploadedBy}
              </p>
            </header>
            <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
              <div className="flex max-w-full gap-1 overflow-x-auto">
                {(
                  [
                    ['gecmis', 'Döküman geçmişi'],
                    ['onizleme', 'Önizleme'],
                  ] as const
                ).map(([id, label]) => (
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
                      <li>
                        Rev {selectedDoc.revision} · {selectedDoc.uploadedAt} · {selectedDoc.uploadedBy}
                      </li>
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
  )
}
