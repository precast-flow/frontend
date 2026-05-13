import { ChevronsLeftRight, Filter, GripVertical, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useThemeMode } from '../../theme/ThemeProvider'

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
  /**
   * Proje / CRM ile aynı cam kabuk (`project-mgmt-glass-light` üst sarmalayıcı + `projectManagementGlassLight.css` gerekir).
   */
  visualVariant?: 'legacy' | 'project-mgmt'
  /** Açık temada nötr (siyah) filtre düğmesi vurgusu — `ProjectManagementModuleView` `neutralShell` ile aynı rol */
  neutralChrome?: boolean
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
  visualVariant = 'legacy',
  neutralChrome = false,
}: ElementIdentityPieceCodesLikeSplitProps) {
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const isPm = visualVariant === 'project-mgmt'
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
    let rafId = 0
    const onMouseMove = (event: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const host = splitRef.current
        if (!host) return
        const rect = host.getBoundingClientRect()
        if (rect.width <= 0) return
        const next = ((event.clientX - rect.left) / rect.width) * 100
        setSplitRatio(Math.min(55, Math.max(30, Number(next.toFixed(2)))))
      })
    }
    const onMouseUp = () => {
      cancelAnimationFrame(rafId)
      setIsResizing(false)
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      cancelAnimationFrame(rafId)
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
    if (isResizing) return
    try {
      sessionStorage.setItem(SPLIT_KEY(persistKey), JSON.stringify({ splitRatio }))
    } catch {
      /* ignore */
    }
  }, [isResizing, persistKey, splitRatio])

  const filterBtnClass =
    isPm && gl
      ? [
          'glass-btn',
          'small',
          'inline-flex',
          'items-center',
          'gap-1.5',
          isFilterOpen ? 'outline' : 'secondary',
        ].join(' ')
      : isPm && !gl
        ? [
            'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25',
            isFilterOpen
              ? neutralChrome
                ? 'border-black/35 bg-black/10 text-black dark:border-white/20 dark:bg-black/50 dark:text-white'
                : 'border-black/25 bg-black/8 text-black dark:border-white/20 dark:bg-black/45 dark:text-white'
              : 'border-black/18 bg-white/70 text-black dark:border-white/12 dark:bg-black/40 dark:text-white/90',
          ].join(' ')
        : isFilterOpen
          ? eiSplitHeaderButtonActive
          : eiSplitHeaderButtonPassive

  const sectionClass =
    isPm && gl
      ? 'okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden glass-card glass-card--static project-mgmt-split-panel min-h-0'
      : 'okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden p-3'

  const filterAsideClass = [
    'absolute inset-y-0 left-0 z-20 overflow-y-auto shadow-xl backdrop-blur-sm',
    isPm && gl
      ? 'w-72 transition-transform duration-150 ease-out glass-card glass-card--static project-mgmt-split-panel project-mgmt-filter-drawer'
      : isPm && !gl
        ? 'w-72 rounded-xl border border-black/15 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-transform duration-150 ease-out dark:border-white/12 dark:bg-black/70'
        : 'w-64 rounded-xl border border-slate-200/70 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-transform dark:border-slate-700/70 dark:bg-slate-900/95',
    isFilterOpen ? 'translate-x-0' : '-translate-x-[105%]',
  ].join(' ')

  const ulPadClass = isPm
    ? 'flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto pr-1 transition-[padding] duration-100 ease-out'
    : 'flex h-full min-h-0 flex-col gap-1 overflow-y-auto pr-1 transition-[padding] duration-300'

  const splitRow = (
    <>
      <section className={sectionClass} style={{ width: `calc(${splitRatio}% - 5px)` }}>
        <div className="mb-2 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
          <h3
            className={
              isPm
                ? 'shrink-0 text-sm font-semibold text-black dark:text-white'
                : 'shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-50'
            }
          >
            {listTitle}
          </h3>
          <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
            {filterToolbarSearch}
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {headerActions}
              <button
                type="button"
                onClick={() => onFilterOpenChange(!isFilterOpen)}
                aria-expanded={isFilterOpen}
                className={filterBtnClass}
              >
                <Filter className="size-3.5" aria-hidden />
                Filtrele
              </button>
            </div>
          </div>
        </div>
        {!isPm ? <div className="mb-3 shrink-0" /> : null}

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <aside className={filterAsideClass} aria-hidden={!isFilterOpen}>
            {filterAside}
          </aside>
          <ul
            ref={ulRef}
            className={ulPadClass}
            style={{ paddingLeft: isFilterOpen ? listIndentWhenFilterOpen : '0' }}
            onScroll={onListScroll}
            role="list"
            aria-label={listTitle}
          >
            {listBody}
          </ul>
        </div>

        {footer ? (
          isPm && gl ? (
            <div className="glass-card glass-card--static project-mgmt-footer-panel sticky bottom-0 z-10 mt-2 shrink-0 text-xs">
              {footer}
            </div>
          ) : (
            <div className="sticky bottom-0 z-10 mt-1 shrink-0 border-t border-slate-200/60 bg-white/90 pt-2 text-xs backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/85">
              {footer}
            </div>
          )
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
              ? isPm
                ? gl
                  ? 'w-6 border-black/35 bg-black/12 dark:border-white/18 dark:bg-black/60'
                  : neutralChrome
                    ? 'w-6 border-black/35 bg-black/12 dark:border-white/18 dark:bg-black/60'
                    : 'w-6 border-black/25 bg-black/8 dark:border-white/20 dark:bg-black/50'
                : 'w-6 border-sky-300/70 bg-sky-100/70 dark:border-sky-500/60 dark:bg-sky-900/40'
              : isPm
                ? 'w-3 border-black/18 bg-white/70 dark:border-white/12 dark:bg-black/55'
                : 'w-3 border-slate-200/80 bg-white/70 dark:border-slate-700/80 dark:bg-slate-900/60',
          ].join(' ')}
        >
          <span
            className={
              isPm
                ? 'pointer-events-none flex h-full items-center justify-center text-black/55 dark:text-white/70'
                : 'pointer-events-none flex h-full items-center justify-center text-slate-500 dark:text-slate-300'
            }
          >
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
        className={
          isPm && gl
            ? 'okan-project-split-aside glass-card glass-card--static project-mgmt-split-panel flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
            : 'okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2'
        }
      >
        {rightAside}
      </aside>
    </>
  )

  if (isPm) {
    return (
      <div
        className={[
          'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden h-full w-full',
          gl
            ? 'gap-2 overflow-hidden rounded-3xl bg-transparent p-1 md:p-1.5'
            : 'rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5',
        ].join(' ')}
      >
        <div
          ref={splitRef}
          data-split-dragging={isResizing ? 'true' : undefined}
          className={[
            'relative flex min-h-0 min-w-0 flex-1 items-stretch overflow-hidden h-full w-full',
            gl ? 'gap-3 rounded-3xl lg:gap-4' : 'gap-0',
          ].join(' ')}
        >
          {splitRow}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={splitRef}
      className="relative flex h-[calc(100vh-11.5rem)] max-h-[calc(100vh-11.5rem)] min-h-[560px] min-w-0 overflow-hidden gap-0"
    >
      {splitRow}
    </div>
  )
}

export function ElementIdentityFilterSheetHeader({
  title,
  subtitle,
  onClose,
  glass = false,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  /** `project-mgmt-glass-light` içinde cam kapatma düğmesi */
  glass?: boolean
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-2">
      <div>
        <h4
          className={
            glass
              ? 'text-sm font-semibold text-black dark:text-white'
              : 'text-sm font-semibold text-slate-900 dark:text-slate-50'
          }
        >
          {title}
        </h4>
        {subtitle ? (
          <p
            className={
              glass
                ? 'mt-1 text-[11px] text-black/60 dark:text-white/65'
                : 'mt-1 text-[11px] text-slate-500 dark:text-slate-400'
            }
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className={
          glass
            ? 'card-button inline-flex size-7 items-center justify-center p-0'
            : 'inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
        }
        aria-label="Filtreyi kapat"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  )
}
