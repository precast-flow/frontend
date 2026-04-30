import { ChevronsLeftRight, Filter, GripVertical, Package, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TYPOLOGIES_BY_ID } from '../../elementIdentity/catalog/typologies'
import { useI18n } from '../../i18n/I18nProvider'
import {
  getPartLifecycleBarStyles,
  getPartLifecycleLabel,
  getPartLifecycleProgressPercent,
  projectDetailPartCodesMock,
  projectDetailPartFamilyOrder,
  type PartDrawingRevision,
  type PartLifecycleStatus,
  type RebarShapeType,
} from './projectDetailPartCodesMock'
import { resolveTypologyDimensionRows } from './projectDetailPartDimensionUtils'

type PartDetailTabId = 'genel' | 'boyutlar' | 'materyaller' | 'donati' | 'pdf' | 'aktivite'

function buildEmbeddedPdfUrl(pdfUrl: string): string {
  // Use pdf.js viewer and keep side panels hidden to save horizontal space.
  return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}#pagemode=none&zoom=page-width`
}

function rebarShapeLabel(shape: RebarShapeType, locale: 'tr' | 'en'): string {
  if (locale === 'en') {
    return shape === 'straight' ? 'Straight bar' : 'Bent bar (stirrup / hook etc.)'
  }
  return shape === 'straight' ? 'Düz donatı' : 'Bükülmüş donatı (etriye / kanca vb.)'
}

export function ProjectDetailPieceCodesPanel() {
  const { locale } = useI18n()
  const parts = projectDetailPartCodesMock
  const [selectedId, setSelectedId] = useState<string>(() => parts[0]?.id ?? '')
  const [detailTab, setDetailTab] = useState<PartDetailTabId>('genel')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<PartLifecycleStatus | 'all'>('all')
  const [filterFamily, setFilterFamily] = useState<string>('all')
  const [filterSort, setFilterSort] = useState<
    'production-asc' | 'production-desc' | 'code-asc' | 'family-asc'
  >('production-asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [splitRatio, setSplitRatio] = useState(40)
  const [isResizing, setIsResizing] = useState(false)
  const [isResizerHover, setIsResizerHover] = useState(false)
  const [selectedDrawingRevisionId, setSelectedDrawingRevisionId] = useState<string>('')
  const [isDrawingHistoryOpen, setIsDrawingHistoryOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const splitRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const loadMoreSentinelRef = useRef<HTMLLIElement | null>(null)

  const selected = useMemo(() => parts.find((p) => p.id === selectedId) ?? null, [parts, selectedId])

  const dimensionRows = useMemo(() => {
    if (!selected) return []
    return resolveTypologyDimensionRows(selected.typologyId, selected.dimensionValues, locale)
  }, [selected, locale])

  const typologyName = useMemo(() => {
    if (!selected) return ''
    const ty = TYPOLOGIES_BY_ID[selected.typologyId]
    if (!ty) return selected.typologyId
    return locale === 'en' ? ty.nameEn : ty.nameTr
  }, [selected, locale])

  const partLifecycleUi = useMemo(
    () => (selected ? getPartLifecycleBarStyles(selected.lifecycleStatus) : null),
    [selected],
  )
  const drawingRevisions = useMemo<PartDrawingRevision[]>(() => {
    if (!selected) return []
    if (selected.drawingRevisions?.length) return selected.drawingRevisions
    return [
      {
        id: `${selected.id}-dr-latest`,
        revision: selected.rev,
        title: `${selected.code} kalıp-donatı çizimi`,
        updatedAt: selected.activities[0]?.at ?? '14.04 09:10',
        updatedBy: 'Mühendislik',
        changeNote:
          selected.activities[0]?.text ?? 'Son revizyonda bağlantı ve donatı koordinasyonu güncellendi.',
        pdfUrl: selected.pdfPreviewUrl,
      },
      {
        id: `${selected.id}-dr-prev1`,
        revision: `R${Math.max(0, Number(selected.rev.replace(/\D/g, '')) - 1) || 1}`,
        title: `${selected.code} kalıp çizimi`,
        updatedAt: selected.activities[1]?.at ?? '12.04 16:40',
        updatedBy: 'Planlama',
        changeNote: selected.activities[1]?.text ?? 'Üretim sırası ve etiket notları güncellendi.',
        pdfUrl: selected.pdfPreviewUrl,
      },
      {
        id: `${selected.id}-dr-prev2`,
        revision: `R${Math.max(0, Number(selected.rev.replace(/\D/g, '')) - 2) || 0}`,
        title: `${selected.code} ilk yayın`,
        updatedAt: selected.activities[2]?.at ?? '10.04 11:05',
        updatedBy: 'Statik',
        changeNote: selected.activities[2]?.text ?? 'İlk çizim seti yayımlandı.',
        pdfUrl: selected.pdfPreviewUrl,
      },
    ]
  }, [selected])
  const activeDrawingRevision = useMemo(() => {
    if (!drawingRevisions.length) return null
    return drawingRevisions.find((rev) => rev.id === selectedDrawingRevisionId) ?? drawingRevisions[0]
  }, [drawingRevisions, selectedDrawingRevisionId])

  const filteredParts = useMemo(() => {
    const q = filterQuery.trim().toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR')
    const lifecycleOrder: Record<PartLifecycleStatus, number> = {
      tasarim: 1,
      uretim: 2,
      saha: 3,
      montaj: 4,
      tamamlandi: 5,
    }

    return parts
      .filter((p) => {
        if (filterStatus !== 'all' && p.lifecycleStatus !== filterStatus) return false
        if (filterFamily !== 'all' && p.familyId !== filterFamily) return false
        if (!q) return true

        return (
          p.code.toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR').includes(q) ||
          p.productType.toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR').includes(q) ||
          p.familyLabel.toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR').includes(q)
        )
      })
      .toSorted((a, b) => {
        if (filterSort === 'family-asc') {
          const byFamily = a.familyLabel.localeCompare(b.familyLabel, locale === 'en' ? 'en' : 'tr')
          if (byFamily !== 0) return byFamily
          return a.code.localeCompare(b.code, locale === 'en' ? 'en' : 'tr')
        }
        if (filterSort === 'code-asc') return a.code.localeCompare(b.code, locale === 'en' ? 'en' : 'tr')
        const sign = filterSort === 'production-asc' ? 1 : -1
        const byProduction = (a.productionOrder - b.productionOrder) * sign
        if (byProduction !== 0) return byProduction
        return (lifecycleOrder[a.lifecycleStatus] - lifecycleOrder[b.lifecycleStatus]) * sign
      })
  }, [parts, filterFamily, filterQuery, filterSort, filterStatus, locale])

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(filteredParts.length / pageSize)),
    [filteredParts.length, pageSize],
  )

  const safePage = Math.min(page, pageCount)

  const visibleParts = useMemo(() => {
    return filteredParts.slice(0, safePage * pageSize)
  }, [filteredParts, pageSize, safePage])

  const pageStart = filteredParts.length === 0 ? 0 : 1
  const pageEnd = Math.min(filteredParts.length, safePage * pageSize)

  useEffect(() => {
    if (!isFilterOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFilterOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isFilterOpen])

  useEffect(() => {
    if (!isDrawingHistoryOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDrawingHistoryOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isDrawingHistoryOpen])

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
    setSelectedDrawingRevisionId(drawingRevisions[0]?.id ?? '')
  }, [selectedId, drawingRevisions])

  const scrollPanelTop = () => {
    requestAnimationFrame(() => {
      panelRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    })
  }

  const selectPart = (id: string) => {
    setSelectedId(id)
    scrollPanelTop()
  }

  const onListScroll = () => {
    const el = listRef.current
    if (!el) return
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 64
    if (!nearBottom) return
    if (safePage >= pageCount) return
    setPage((prev) => Math.min(pageCount, prev + 1))
  }

  useEffect(() => {
    const root = listRef.current
    const target = loadMoreSentinelRef.current
    if (!root || !target || safePage >= pageCount) return

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setPage((prev) => Math.min(pageCount, prev + 1))
      },
      { root, rootMargin: '0px 0px 80px 0px', threshold: 0 },
    )
    io.observe(target)
    return () => io.disconnect()
  }, [pageCount, safePage, visibleParts.length, isFilterOpen, filteredParts.length])

  return (
    <div
      ref={splitRef}
      className="relative flex h-[calc(100vh-11.5rem)] max-h-[calc(100vh-11.5rem)] min-h-[560px] min-w-0 overflow-hidden gap-0"
    >
      <section
        className="okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden p-3"
        style={{ width: `calc(${splitRatio}% - 5px)` }}
      >
        <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Ürün listesi</h3>
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            aria-expanded={isFilterOpen}
            className={[
              'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition',
              isFilterOpen
                ? 'border-sky-300/70 bg-sky-100/70 text-sky-900 hover:bg-sky-100 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100 dark:hover:bg-sky-900/45'
                : 'border-slate-200/70 bg-white/70 text-slate-700 hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-900',
            ].join(' ')}
          >
            <Filter className="size-3.5" aria-hidden />
            Filtrele
          </button>
        </div>
        <div className="mb-3 shrink-0" />
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <aside
            className={[
              'absolute inset-y-0 left-0 z-20 w-64 overflow-y-auto rounded-xl border border-slate-200/70 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-transform dark:border-slate-700/70 dark:bg-slate-900/95',
              isFilterOpen ? 'translate-x-0' : '-translate-x-[105%]',
            ].join(' ')}
            aria-hidden={!isFilterOpen}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Parça filtreleri</h4>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Arama, durum, aile ve sıralama</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Filtreyi kapat"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
            <div className="grid gap-2.5">
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Ürün ara</span>
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(event) => {
                    setFilterQuery(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Kod, tip, aile..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Durum</span>
                <select
                  value={filterStatus}
                  onChange={(event) => {
                    setFilterStatus(event.target.value as PartLifecycleStatus | 'all')
                    setPage(1)
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="all">Tümü</option>
                  {(['tasarim', 'uretim', 'saha', 'montaj', 'tamamlandi'] as const).map((status) => (
                    <option key={status} value={status}>
                      {getPartLifecycleLabel(status, locale)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Aile</span>
                <select
                  value={filterFamily}
                  onChange={(event) => {
                    setFilterFamily(event.target.value)
                    setPage(1)
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="all">Tümü</option>
                  {projectDetailPartFamilyOrder.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Sıralama</span>
                <select
                  value={filterSort}
                  onChange={(event) => {
                    setFilterSort(
                      event.target.value as 'production-asc' | 'production-desc' | 'code-asc' | 'family-asc',
                    )
                    setPage(1)
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="production-asc">Üretim sırası (artan)</option>
                  <option value="production-desc">Üretim sırası (azalan)</option>
                  <option value="code-asc">Parça kodu (A-Z)</option>
                  <option value="family-asc">Aile (A-Z)</option>
                </select>
              </label>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                Sonuç: <span className="tabular-nums font-semibold">{filteredParts.length}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setFilterQuery('')
                  setFilterStatus('all')
                  setFilterFamily('all')
                  setFilterSort('production-asc')
                  setPage(1)
                  requestAnimationFrame(() => {
                    listRef.current?.scrollTo({ top: 0, behavior: 'auto' })
                  })
                }}
                className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Temizle
              </button>
            </div>
          </aside>
          <ul
            ref={listRef}
            className="flex h-full min-h-0 flex-col gap-1 overflow-y-auto pr-1 transition-[padding] duration-300"
            style={{
              paddingLeft: isFilterOpen ? '15.75rem' : '0',
            }}
            onScroll={onListScroll}
            role="tree"
            aria-label="Ürün listesi"
          >
            {visibleParts.map((p) => {
              const lifePct = getPartLifecycleProgressPercent(p.lifecycleStatus)
              const lifeStyles = getPartLifecycleBarStyles(p.lifecycleStatus)
              const lifeLabel = getPartLifecycleLabel(p.lifecycleStatus, locale)
              return (
                <li
                  key={p.id}
                  className="rounded-lg border border-slate-200/50 bg-white/50 dark:border-slate-700/50 dark:bg-slate-900/25"
                >
                  <button
                    type="button"
                    onClick={() => selectPart(p.id)}
                    aria-current={selectedId === p.id ? 'true' : undefined}
                    aria-label={`${p.code}, ${lifeLabel}, ${lifePct}%`}
                    className={[
                      'flex w-full items-stretch gap-2.5 px-3 py-2 text-left text-sm transition',
                      selectedId === p.id
                        ? 'okan-project-list-row--active bg-sky-500/10 dark:bg-sky-400/10'
                        : 'hover:bg-white/50 dark:hover:bg-slate-900/35',
                    ].join(' ')}
                  >
                    <div className="flex min-w-0 flex-1 gap-2">
                      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/60">
                        <Package className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1 flex-col gap-0.5">
                        <span className="inline-flex w-fit rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {p.familyLabel}
                        </span>
                        <p className="mt-1 font-mono font-semibold text-slate-900 dark:text-slate-50">{p.code}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {p.qty} {locale === 'en' ? 'pcs' : 'adet'}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {locale === 'en' ? 'Production order' : 'Üretim sırası'} #{p.productionOrder}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-[min(38%,7.5rem)] max-w-[7.5rem] shrink-0 flex-col justify-center gap-1">
                      <div
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={lifePct}
                        aria-valuetext={lifeLabel}
                        className={['h-1.5 w-full overflow-hidden rounded-full', lifeStyles.track].join(' ')}
                      >
                        <div
                          className={['h-full rounded-full transition-[width]', lifeStyles.fill].join(' ')}
                          style={{ width: `${lifePct}%` }}
                        />
                      </div>
                      <span
                        className={['line-clamp-2 text-[10px] font-semibold leading-tight', lifeStyles.label].join(
                          ' ',
                        )}
                      >
                        {lifeLabel}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
            {safePage < pageCount ? (
              <li
                ref={loadMoreSentinelRef}
                className="h-1 w-full shrink-0 list-none"
                aria-hidden
              />
            ) : null}
          </ul>
        </div>
        <div className="sticky bottom-0 z-10 mt-1 shrink-0 border-t border-slate-200/60 bg-white/90 pt-2 text-xs backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/85">
          <div className="flex items-center justify-between gap-2">
            <p className="text-slate-600 dark:text-slate-300">
              {filteredParts.length > 0 ? (
                <>
                  <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">{pageStart}</span>
                  -
                  <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">{pageEnd}</span> /{' '}
                  <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">
                    {filteredParts.length}
                  </span>{' '}
                  sonuç
                </>
              ) : (
                'Sonuç yok'
              )}
            </p>
            <label className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span>Sayfa boyutu</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
                  setPage(1)
                  requestAnimationFrame(() => {
                    listRef.current?.scrollTo({ top: 0, behavior: 'auto' })
                  })
                }}
                className="rounded-md border border-slate-300 bg-white px-1.5 py-1 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {[6, 10, 15, 20].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-slate-500 dark:text-slate-400">
              Sayfa <span className="tabular-nums font-semibold">{safePage}</span> /{' '}
              <span className="tabular-nums font-semibold">{pageCount}</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {safePage < pageCount
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
            {isResizing || isResizerHover ? <ChevronsLeftRight className="size-3.5" /> : <GripVertical className="size-3.5" />}
          </span>
        </button>
      </div>

      <aside
        ref={panelRef}
        className="okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2"
      >
        {selected ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Seçili parça
              </p>
              <h3 className="mt-1.5 font-mono text-xl font-semibold text-slate-900 dark:text-slate-50">
                {selected.code}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {selected.familyLabel} · {selected.productType}
              </p>
            </header>

            <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
              <div
                className="flex max-w-full gap-1 overflow-x-auto"
                role="tablist"
                aria-label="Parça detay sekmeleri"
              >
                {(
                  [
                    ['genel', locale === 'en' ? 'Properties' : 'Ürün özellikleri'],
                    ['boyutlar', locale === 'en' ? 'Dimensions' : 'Boyut bilgileri'],
                    ['materyaller', locale === 'en' ? 'Materials' : 'Ürün materyalleri'],
                    ['donati', locale === 'en' ? 'Reinforcement' : 'Donatı'],
                    ['pdf', locale === 'en' ? 'Drawings' : 'Çizimler'],
                    ['aktivite', locale === 'en' ? 'Activity' : 'Aktivite geçmişi'],
                  ] as const satisfies readonly (readonly [PartDetailTabId, string])[]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === id}
                    onClick={() => {
                      setDetailTab(id)
                      scrollPanelTop()
                    }}
                    className={`shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                      detailTab === id
                        ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
                        : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div
              role="tabpanel"
              className="okan-project-tab-panel mt-3 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-center sm:px-1"
            >
              {detailTab === 'genel' ? (
                <div className="flex flex-col gap-6 text-left">
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {locale === 'en' ? 'Product properties' : 'Ürün özellikleri'}
                    </h4>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {locale === 'en' ? 'Definition' : 'Tanım'}
                        </dt>
                        <dd className="mt-1 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                          {selected.definition}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {locale === 'en' ? 'Current status' : 'Şu anki durum'}
                        </dt>
                        <dd className="mt-1">
                          <span
                            className={[
                              'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                              partLifecycleUi?.badge ?? '',
                              partLifecycleUi?.label ?? 'text-slate-800 dark:text-slate-200',
                            ].join(' ')}
                          >
                            {getPartLifecycleLabel(selected.lifecycleStatus, locale)}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {locale === 'en' ? 'Typology (catalog)' : 'Tipoloji (katalog)'}
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">{typologyName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {locale === 'en' ? 'Drawing status' : 'Çizim durumu'}
                        </dt>
                        <dd className="mt-1 text-sm text-slate-800 dark:text-slate-100">{selected.drawingStatus}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {locale === 'en' ? 'Production order' : 'Üretim sırası'}
                        </dt>
                        <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                          #{selected.productionOrder}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  <section className="border-t border-slate-200/25 pt-4 dark:border-white/10">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {locale === 'en' ? 'Total volume (one piece)' : 'Toplam hacim (tek parça)'}
                    </h4>
                    <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                      {selected.volumeM3.toLocaleString(locale === 'en' ? 'en-US' : 'tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      m³
                    </p>
                  </section>

                  <section className="border-t border-slate-200/25 pt-4 dark:border-white/10">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {locale === 'en' ? 'Order & revision' : 'Sipariş ve revizyon'}
                    </h4>
                    <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">{locale === 'en' ? 'Code' : 'Kod'}</dt>
                        <dd className="mt-0.5 font-mono font-medium text-slate-900 dark:text-slate-50">{selected.code}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">{locale === 'en' ? 'Revision' : 'Rev'}</dt>
                        <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">{selected.rev}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">{locale === 'en' ? 'Qty' : 'Adet'}</dt>
                        <dd className="mt-0.5 tabular-nums font-medium text-slate-900 dark:text-slate-50">{selected.qty}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">
                          {locale === 'en' ? 'Weight (total)' : 'Ağırlık (toplam)'}
                        </dt>
                        <dd className="mt-0.5 tabular-nums font-medium text-slate-900 dark:text-slate-50">
                          {(selected.weightKg / 1000).toFixed(1)} t
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">{selected.description}</p>
                  </section>
                </div>
              ) : null}

              {detailTab === 'boyutlar' ? (
                <div className="flex flex-col gap-4 text-left">
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {locale === 'en' ? 'Dimensions' : 'Boyut bilgileri'}
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {locale === 'en'
                        ? 'Rows follow the element-identity typology identifying dimensions (catalog order).'
                        : 'Satırlar eleman kimlik kataloğundaki tipolojinin tanımlayıcı boyut sırasına göredir.'}
                    </p>
                    <table className="mt-3 w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200/40 text-xs text-slate-500 dark:border-slate-600/40 dark:text-slate-400">
                          <th className="py-2 pr-2 font-medium">{locale === 'en' ? 'Dimension' : 'Boyut'}</th>
                          <th className="py-2 font-mono font-medium tabular-nums">
                            {locale === 'en' ? 'Value' : 'Değer'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dimensionRows.map((row) => (
                          <tr
                            key={row.dimensionId}
                            className="border-b border-slate-200/25 last:border-b-0 dark:border-white/10"
                          >
                            <td className="py-2 pr-2 text-slate-700 dark:text-slate-200">{row.label}</td>
                            <td className="py-2 font-mono text-xs tabular-nums text-slate-900 dark:text-slate-50">
                              {row.display}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                </div>
              ) : null}

              {detailTab === 'materyaller' ? (
                <div className="flex flex-col gap-4 text-left">
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {locale === 'en' ? 'Embedded / accessory materials' : 'Ürün materyalleri'}
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {locale === 'en'
                        ? 'PVC sleeves, anchors, plates, etc. (mock BOM).'
                        : 'PVC geçiş, ankraj, plaka vb. (mock BOM).'}
                    </p>
                    <table className="mt-3 w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200/40 text-xs text-slate-500 dark:border-slate-600/40 dark:text-slate-400">
                          <th className="py-2 pr-2 font-medium">{locale === 'en' ? 'Category' : 'Kategori'}</th>
                          <th className="py-2 pr-2 font-medium">{locale === 'en' ? 'Item' : 'Malzeme'}</th>
                          <th className="py-2 pr-2 font-medium">{locale === 'en' ? 'Spec' : 'Özellik'}</th>
                          <th className="py-2 text-right font-medium">{locale === 'en' ? 'Qty' : 'Miktar'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.materials.map((m) => (
                          <tr
                            key={m.id}
                            className="border-b border-slate-200/25 last:border-b-0 dark:border-white/10"
                          >
                            <td className="py-2 pr-2 text-slate-600 dark:text-slate-300">{m.category}</td>
                            <td className="py-2 pr-2 font-medium text-slate-900 dark:text-slate-50">{m.name}</td>
                            <td className="py-2 pr-2 text-xs text-slate-600 dark:text-slate-400">{m.specification}</td>
                            <td className="py-2 text-right font-mono tabular-nums text-slate-900 dark:text-slate-50">
                              {m.quantity} {m.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                </div>
              ) : null}

              {detailTab === 'donati' ? (
                <div className="flex flex-col gap-4 text-left">
                  <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-600/40">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead>
                        <tr className="border-b border-slate-200/50 bg-slate-100/50 text-xs dark:border-slate-600/50 dark:bg-slate-900/40">
                          <th className="px-2 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                            {locale === 'en' ? 'Mark' : 'Poz'}
                          </th>
                          <th className="px-2 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">Ø (mm)</th>
                          <th className="px-2 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                            {locale === 'en' ? 'Grade' : 'Sınıf'}
                          </th>
                          <th className="px-2 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                            {locale === 'en' ? 'Shape' : 'Şekil'}
                          </th>
                          <th className="px-2 py-2 text-right font-semibold text-slate-600 dark:text-slate-300">
                            {locale === 'en' ? 'Dev. len. (mm)' : 'Boy (mm)'}
                          </th>
                          <th className="px-2 py-2 text-right font-semibold text-slate-600 dark:text-slate-300">
                            {locale === 'en' ? 'Qty' : 'Adet'}
                          </th>
                          <th className="px-2 py-2 text-right font-semibold text-slate-600 dark:text-slate-300">kg</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.rebarSchedule.map((row) => (
                          <tr
                            key={row.id}
                            className="border-b border-slate-200/30 last:border-b-0 dark:border-white/10"
                          >
                            <td className="px-2 py-2 font-mono font-medium text-slate-900 dark:text-slate-50">
                              {row.position}
                            </td>
                            <td className="px-2 py-2 tabular-nums text-slate-800 dark:text-slate-100">{row.diameterMm}</td>
                            <td className="px-2 py-2 text-slate-700 dark:text-slate-200">{row.steelGrade}</td>
                            <td className="px-2 py-2 text-xs text-slate-700 dark:text-slate-200">
                              {rebarShapeLabel(row.shape, locale)}
                            </td>
                            <td className="px-2 py-2 text-right font-mono text-xs tabular-nums text-slate-800 dark:text-slate-100">
                              {row.developedLengthMm.toLocaleString(locale === 'en' ? 'en-US' : 'tr-TR')}
                            </td>
                            <td className="px-2 py-2 text-right tabular-nums text-slate-800 dark:text-slate-100">
                              {row.count}
                            </td>
                            <td className="px-2 py-2 text-right font-mono tabular-nums text-slate-900 dark:text-slate-50">
                              {row.totalWeightKg.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-slate-300/60 bg-slate-100/70 font-semibold dark:border-slate-500/50 dark:bg-slate-900/60">
                          <td colSpan={4} className="px-2 py-2 text-slate-700 dark:text-slate-200">
                            {locale === 'en' ? 'Totals' : 'Toplam'}
                          </td>
                          <td className="px-2 py-2 text-right font-mono text-xs text-slate-800 dark:text-slate-100">
                            {selected.rebarSummary.totalDevelopedLengthM.toFixed(1)} m
                          </td>
                          <td className="px-2 py-2 text-right text-xs text-slate-600 dark:text-slate-400">
                            {locale === 'en' ? 'bars' : 'çubuk'}{' '}
                            <span className="tabular-nums">
                              {selected.rebarSummary.straightBarCount + selected.rebarSummary.bentBarCount}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right font-mono tabular-nums text-slate-900 dark:text-slate-50">
                            {selected.rebarSummary.totalWeightKg.toFixed(1)} kg
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="rounded-xl border border-slate-200/40 bg-slate-50/50 px-3 py-3 text-xs leading-relaxed text-slate-700 dark:border-slate-600/40 dark:bg-slate-900/35 dark:text-slate-300">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {locale === 'en' ? 'Glossary' : 'Terimler'}
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-2">
                      <li>
                        <span className="font-medium">Rebar (reinforcement bar)</span> —{' '}
                        {locale === 'en'
                          ? 'Reinforcement steel in concrete; in Turkish: donatı / inşaat demiri / donatı çeliği (general term for bars in concrete).'
                          : 'Donatı / inşaat demiri / donatı çeliği — genel ad; betonun içine konan çelik çubukların tümü.'}
                      </li>
                      <li>
                        <span className="font-medium">Straight bar</span> —{' '}
                        {locale === 'en'
                          ? 'Unbent bar used as-is.'
                          : 'Düz donatı / düz çubuk — bükülmeden kullanılan demir.'}
                      </li>
                      <li>
                        <span className="font-medium">Bent bar</span> —{' '}
                        {locale === 'en'
                          ? 'Shaped rebar (L, U, stirrups, hooks per detailing).'
                          : 'Bükülmüş donatı — etriye, kanca veya L/U vb. şekil verilmiş demir (projeye göre).'}
                      </li>
                    </ul>
                    <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                      {locale === 'en'
                        ? `Straight pieces: ${selected.rebarSummary.straightBarCount} · Bent pieces: ${selected.rebarSummary.bentBarCount}`
                        : `Düz parça sayısı: ${selected.rebarSummary.straightBarCount} · Bükülmüş parça sayısı: ${selected.rebarSummary.bentBarCount}`}
                    </p>
                  </div>
                </div>
              ) : null}

              {detailTab === 'pdf' ? (
                <div className="flex flex-col gap-3 text-left">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setIsDrawingHistoryOpen((prev) => !prev)}
                      aria-expanded={isDrawingHistoryOpen}
                      className={[
                        'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition',
                        isDrawingHistoryOpen
                          ? 'border-sky-300/70 bg-sky-100/70 text-sky-900 hover:bg-sky-100 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100 dark:hover:bg-sky-900/45'
                          : 'border-slate-200/70 bg-white/70 text-slate-700 hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-900',
                      ].join(' ')}
                    >
                      <Filter className="size-3.5" aria-hidden />
                      {locale === 'en' ? 'Revisions' : 'Revizyonlar'}
                    </button>
                  </div>
                  <div className="relative min-h-0 overflow-hidden rounded-xl border border-slate-200/60 bg-slate-100/80 dark:border-slate-600/50 dark:bg-slate-900/50">
                    <aside
                      className={[
                        'absolute inset-y-0 right-0 z-20 w-72 overflow-y-auto rounded-l-xl border-l border-slate-200/70 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-transform dark:border-slate-700/70 dark:bg-slate-900/95',
                        isDrawingHistoryOpen ? 'translate-x-0' : 'translate-x-[105%]',
                      ].join(' ')}
                      aria-hidden={!isDrawingHistoryOpen}
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {locale === 'en' ? 'Drawing revisions' : 'Çizim revizyon geçmişi'}
                          </h4>
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {locale === 'en' ? 'Select a revision to open its PDF.' : 'Açmak için bir revizyon seçin.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsDrawingHistoryOpen(false)}
                          className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          aria-label={locale === 'en' ? 'Close revision history' : 'Revizyon geçmişini kapat'}
                        >
                          <X className="size-3.5" aria-hidden />
                        </button>
                      </div>
                      <ul className="divide-y divide-slate-200/30 dark:divide-white/10">
                        {drawingRevisions.map((rev, idx) => (
                          <li key={rev.id} className="py-2 text-sm">
                            <button
                              type="button"
                              onClick={() => setSelectedDrawingRevisionId(rev.id)}
                              className={`w-full rounded-lg border px-2.5 py-2 text-left transition ${
                                activeDrawingRevision?.id === rev.id
                                  ? 'border-sky-300/70 bg-sky-100/60 dark:border-sky-500/45 dark:bg-sky-900/25'
                                  : 'border-transparent hover:border-slate-200/70 hover:bg-slate-100/60 dark:hover:border-slate-700/60 dark:hover:bg-slate-800/45'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-slate-900 dark:text-slate-50">
                                  Rev {rev.revision} · {rev.title}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  {idx === 0 ? (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-200">
                                      {locale === 'en' ? 'Latest' : 'En güncel'}
                                    </span>
                                  ) : null}
                                  {activeDrawingRevision?.id === rev.id ? (
                                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:bg-sky-900/35 dark:text-sky-200">
                                      {locale === 'en' ? 'Open' : 'Açık'}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {rev.updatedAt} · {rev.updatedBy}
                              </p>
                              <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">{rev.changeNote}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </aside>
                    <iframe
                      title={`${selected.code} çizim önizleme`}
                      src={buildEmbeddedPdfUrl(activeDrawingRevision?.pdfUrl ?? selected.pdfPreviewUrl)}
                      className="h-[min(64vh,560px)] w-full transition-[padding] duration-300"
                      style={{ paddingRight: isDrawingHistoryOpen ? '18rem' : 0 }}
                    />
                  </div>
                </div>
              ) : null}

              {detailTab === 'aktivite' ? (
                <div className="flex flex-col text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {locale === 'en' ? 'Activities for this part' : 'Bu parçaya ait aktiviteler'}
                  </p>
                  <ul className="mx-auto mt-3 max-w-lg divide-y divide-slate-200/25 dark:divide-white/10">
                    {selected.activities.length ? (
                      selected.activities.map((a) => (
                        <li
                          key={a.id}
                          className="flex gap-3 py-2.5 text-sm leading-snug text-slate-700 first:pt-0 dark:text-slate-200"
                        >
                          <span className="w-16 shrink-0 tabular-nums text-slate-500 dark:text-slate-400">{a.at}</span>
                          <span className="min-w-0 flex-1">{a.text}</span>
                        </li>
                      ))
                    ) : (
                      <li className="py-2 text-sm text-slate-600 dark:text-slate-300">Kayıt yok.</li>
                    )}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-slate-600 dark:text-slate-300">Listeden bir parça seçin.</p>
        )}
      </aside>
    </div>
  )
}
