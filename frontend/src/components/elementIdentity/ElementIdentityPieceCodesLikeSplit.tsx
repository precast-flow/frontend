import { ChevronsLeftRight, Filter, GripVertical, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

const SPLIT_KEY = (persistKey: string) => `ei-piece-split:${persistKey}`

/** Liste başlığı sağı — «Filtrele» kapalıyken (ve aynı görünümlü aksiyonlar). */
export const eiSplitHeaderButtonPassive =
  'inline-flex items-center gap-1.5 rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-900'

/** «Filtrele» açıkken. */
export const eiSplitHeaderButtonActive =
  'inline-flex items-center gap-1.5 rounded-lg border border-sky-300/70 bg-sky-100/70 px-2 py-1.5 text-xs font-semibold text-sky-900 transition hover:bg-sky-100 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100 dark:hover:bg-sky-900/45'

export type ElementIdentityPieceCodesLikeSplitProps = {
  persistKey: string
  listTitle: string
  /** Filtrele düğmesinin solunda — çekmece araması ile aynı state */
  filterToolbarSearch?: ReactNode
  headerActions?: ReactNode
  isFilterOpen: boolean
  onFilterOpenChange: (open: boolean) => void
  filterAside: ReactNode
  /** Sol liste `padding-left` (ProjectDetailPieceCodesPanel ile aynı) */
  listIndentWhenFilterOpen?: string
  listRef?: React.RefObject<HTMLUListElement | null>
  onListScroll?: () => void
  listBody: ReactNode
  footer?: ReactNode
  rightAside: ReactNode
  rightPanelRef?: React.RefObject<HTMLDivElement | null>
  /** Sol liste genişliği (%) — session’da değer yokken kullanılır (ör. etiket listesi %30) */
  defaultSplitRatio?: number
}

/**
 * Proje yönetimi → Ürün listesi (`ProjectDetailPieceCodesPanel`) ile aynı split düzeni:
 * sabit yükseklik, sol filtre çekmecesi, liste alt bandı, sürükleyici, sağ `okan-project-split-aside`.
 */
export function ElementIdentityPieceCodesLikeSplit({
  persistKey,
  listTitle,
  filterToolbarSearch,
  headerActions,
  isFilterOpen,
  onFilterOpenChange,
  filterAside,
  listIndentWhenFilterOpen = '15.75rem',
  listRef,
  onListScroll,
  listBody,
  footer,
  rightAside,
  rightPanelRef,
  defaultSplitRatio = 40,
}: ElementIdentityPieceCodesLikeSplitProps) {
  const splitRef = useRef<HTMLDivElement | null>(null)
  const internalListRef = useRef<HTMLUListElement | null>(null)
  const ulRef = listRef ?? internalListRef

  const [splitRatio, setSplitRatio] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SPLIT_KEY(persistKey))
      if (!raw) return defaultSplitRatio
      const v = JSON.parse(raw) as { splitRatio?: number }
      return typeof v.splitRatio === 'number'
        ? Math.min(55, Math.max(30, v.splitRatio))
        : defaultSplitRatio
    } catch {
      return defaultSplitRatio
    }
  })
  const [isResizing, setIsResizing] = useState(false)
  const [isResizerHover, setIsResizerHover] = useState(false)

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
    if (!isFilterOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onFilterOpenChange(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isFilterOpen, onFilterOpenChange])

  useEffect(() => {
    try {
      sessionStorage.setItem(SPLIT_KEY(persistKey), JSON.stringify({ splitRatio }))
    } catch {
      /* ignore */
    }
  }, [persistKey, splitRatio])

  return (
    <div
      ref={splitRef}
      className="relative flex h-[calc(100vh-11.5rem)] max-h-[calc(100vh-11.5rem)] min-h-[560px] min-w-0 overflow-hidden gap-0"
    >
      <section
        className="okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden p-3"
        style={{ width: `calc(${splitRatio}% - 5px)` }}
      >
        <div className="mb-2 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
          <h3 className="shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-50">{listTitle}</h3>
          <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
            {filterToolbarSearch}
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {headerActions}
              <button
                type="button"
                onClick={() => onFilterOpenChange(!isFilterOpen)}
                aria-expanded={isFilterOpen}
                className={isFilterOpen ? eiSplitHeaderButtonActive : eiSplitHeaderButtonPassive}
              >
                <Filter className="size-3.5" aria-hidden />
                Filtrele
              </button>
            </div>
          </div>
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
            {filterAside}
          </aside>
          <ul
            ref={ulRef}
            className="flex h-full min-h-0 flex-col gap-1 overflow-y-auto pr-1 transition-[padding] duration-300"
            style={{ paddingLeft: isFilterOpen ? listIndentWhenFilterOpen : '0' }}
            onScroll={onListScroll}
            role="list"
            aria-label={listTitle}
          >
            {listBody}
          </ul>
        </div>

        {footer ? (
          <div className="sticky bottom-0 z-10 mt-1 shrink-0 border-t border-slate-200/60 bg-white/90 pt-2 text-xs backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/85">
            {footer}
          </div>
        ) : null}
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
        ref={rightPanelRef}
        className="okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2"
      >
        {rightAside}
      </aside>
    </div>
  )
}

export function ElementIdentityFilterSheetHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle?: string
  onClose: () => void
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-2">
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</h4>
        {subtitle ? <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Filtreyi kapat"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  )
}
