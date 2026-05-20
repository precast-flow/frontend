import { ChevronsLeftRight, Filter, GripVertical, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useThemeMode } from '../../theme/ThemeProvider'
import { managementModuleSplitRowClass } from '../shared/layout/ManagementModuleShell'
import { useSplitPaneDrag } from '../shared/layout/useSplitPaneDrag'
import { useSplitPaneRatio } from '../shared/layout/useSplitPaneRatio'

const LEGACY_SPLIT_KEY = (persistKey: string) => `ei-piece-split:${persistKey}`

/** Liste başlığı sağı — «Filtrele» kapalıyken (ve aynı görünümlü aksiyonlar). */
export const eiSplitHeaderButtonPassive =
  'inline-flex items-center gap-1.5 rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-900'

/** «Filtrele» açıkken. */
export const eiSplitHeaderButtonActive =
  'inline-flex items-center gap-1.5 rounded-lg border border-sky-300/70 bg-sky-100/70 px-2 py-1.5 text-xs font-semibold text-sky-900 transition hover:bg-sky-100 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100 dark:hover:bg-sky-900/45'

/** Filtre çipi — seçili. */
export const eiSplitFilterPillActive =
  'border border-sky-300/70 bg-sky-100/70 text-sky-900 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100'

/** Filtre çipi — seçili değil. */
export const eiSplitFilterPillIdle =
  'bg-white text-slate-700 ring-1 ring-slate-300/70 dark:bg-slate-900/50 dark:text-slate-200 dark:ring-slate-600/60'

/** «Filtrele» açık/kapalı — kapalıyken Detay ile aynı; açıkken sky vurgusu. */
export function eiSplitFilterToggleClass(isOpen: boolean): string {
  return isOpen ? eiSplitHeaderButtonActive : eiSplitHeaderButtonPassive
}

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
  /** Sol liste genişliği (%) — session’da değer yokken kullanılır (varsayılan %40) */
  defaultSplitRatio?: number
  /**
   * `useSplitPaneRatio` persist anahtarı; verilmezse `ei-piece-split:{persistKey}` kullanılır.
   * Örn. görev yönetimi: `unit-work-queue` → `split-pane:unit-work-queue`
   */
  splitPanePersistKey?: string
  /**
   * Proje / CRM ile aynı cam kabuk (`project-mgmt-glass-light` üst sarmalayıcı + `projectManagementGlassLight.css` gerekir).
   */
  visualVariant?: 'legacy' | 'project-mgmt'
  /** Açık temada nötr (siyah) filtre düğmesi vurgusu — `ProjectManagementModuleView` `neutralShell` ile aynı rol */
  neutralChrome?: boolean
  /**
   * `project-mgmt` variant'inde her iki panelin ebeveynin tüm yüksekliğini doldurmasını ister.
   * Varsayılan davranışta (false) sol panelin doğal yüksekliği ölçülür ve sağ panel buna eşitlenir;
   * liste kısa olduğunda kartlar da kısa kalır. Profil gibi kısa içerikli sayfalarda `true` verin.
   */
  fillParentHeight?: boolean
  /** Üst kabuk zaten cam kart içindeyse (proje / eleman kimlik detay) ekstra sarmalayıcı kullanma */
  embedded?: boolean
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
  splitPanePersistKey,
  visualVariant = 'legacy',
  neutralChrome = false,
  fillParentHeight = false,
  embedded = false,
}: ElementIdentityPieceCodesLikeSplitProps) {
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const isPm = visualVariant === 'project-mgmt'
  const fillFull = isPm && fillParentHeight
  const splitRef = useRef<HTMLDivElement | null>(null)
  const internalListRef = useRef<HTMLUListElement | null>(null)
  const ulRef = listRef ?? internalListRef

  const {
    isResizing,
    setIsResizing,
    setRatioFromPointer,
    resetRatio,
    leftWidthStyle,
  } = useSplitPaneRatio(splitPanePersistKey ?? `ei-piece-split:${persistKey}`, defaultSplitRatio, {
    legacyViewStateKey: LEGACY_SPLIT_KEY(persistKey),
    legacySplitPanePersistKey:
      splitPanePersistKey && splitPanePersistKey !== `ei-piece-split:${persistKey}`
        ? `ei-piece-split:${persistKey}`
        : undefined,
  })
  const [isResizerHover, setIsResizerHover] = useState(false)
  useSplitPaneDrag(splitRef, { isResizing, setIsResizing, setRatioFromPointer })
  const leftColumnRef = useRef<HTMLElement | null>(null)
  const [rightPanelHeightPx, setRightPanelHeightPx] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (!isPm || fillFull) {
      setRightPanelHeightPx(null)
      return
    }
    const el = leftColumnRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      const h = el.getBoundingClientRect().height
      setRightPanelHeightPx(h > 0 ? h : null)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isPm, fillFull])

  useEffect(() => {
    if (!isFilterOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onFilterOpenChange(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isFilterOpen, onFilterOpenChange])

  const filterBtnClass = eiSplitFilterToggleClass(isFilterOpen)

  const sectionClass = !isPm
    ? 'okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden p-3'
    : 'okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 self-stretch flex-col overflow-hidden glass-card glass-card--static project-mgmt-split-panel min-h-0'

  const filterAsideClass = [
    'absolute inset-y-0 left-0 z-20 overflow-y-auto shadow-xl backdrop-blur-sm',
    isPm
      ? 'w-72 transition-transform duration-150 ease-out glass-card glass-card--static project-mgmt-split-panel project-mgmt-filter-drawer'
      : 'w-64 rounded-xl border border-slate-200/70 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-transform dark:border-slate-700/70 dark:bg-slate-900/95',
    isFilterOpen ? 'translate-x-0' : '-translate-x-[105%]',
  ].join(' ')

  const ulPadClass = isPm
    ? 'flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1 transition-[padding] duration-100 ease-out'
    : 'flex h-full min-h-0 flex-col gap-1 overflow-y-auto pr-1 transition-[padding] duration-300'

  const splitRow = (
    <>
      <section
        ref={leftColumnRef}
        className={sectionClass}
        style={leftWidthStyle}
      >
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
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
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
        </div>

        {footer ? (
          isPm && gl ? (
            <div className="glass-card glass-card--static project-mgmt-footer-panel mt-2 shrink-0 text-xs">
              {footer}
            </div>
          ) : (
            <div className="mt-1 shrink-0 border-t border-slate-200/60 bg-white/90 pt-2 text-xs backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/85">
              {footer}
            </div>
          )
        ) : null}
      </section>

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
            isPm
              ? 'group absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-full border transition'
              : 'group absolute inset-y-3 left-1/2 -translate-x-1/2 rounded-full border transition',
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
            ? [
                'okan-project-split-aside glass-card glass-card--static project-mgmt-split-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
                rightPanelHeightPx == null ? 'h-full self-stretch' : 'self-start',
              ].join(' ')
            : isPm
              ? [
                  'okan-project-split-aside flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2',
                  rightPanelHeightPx == null ? 'h-full self-stretch' : 'self-start',
                ].join(' ')
              : 'okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2'
        }
        style={
          isPm && rightPanelHeightPx != null
            ? { height: rightPanelHeightPx, minHeight: rightPanelHeightPx, maxHeight: rightPanelHeightPx }
            : undefined
        }
      >
        {rightAside}
      </aside>
    </>
  )

  if (isPm) {
    const splitHostClass = managementModuleSplitRowClass(gl)

    if (embedded) {
      return (
        <div ref={splitRef} data-split-dragging={isResizing ? 'true' : undefined} className={splitHostClass}>
          {splitRow}
        </div>
      )
    }

    const paddedShell = gl
      ? 'flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-3xl bg-transparent p-1 md:p-1.5'
      : 'flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5'

    return (
      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
        <div className={['min-h-0 w-full overflow-hidden', paddedShell].join(' ')}>
          <div ref={splitRef} data-split-dragging={isResizing ? 'true' : undefined} className={splitHostClass}>
            {splitRow}
          </div>
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
        className={`${eiSplitHeaderButtonPassive} inline-flex size-7 items-center justify-center p-0`}
        aria-label="Filtreyi kapat"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  )
}
