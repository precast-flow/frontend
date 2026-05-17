import { eiSplitHeaderButtonPassive } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'

export type SplitListPaginationNavProps = {
  safePage: number
  pageCount: number
  onPrev: () => void
  onNext: () => void
  /** Cam tema (`glass-btn`) */
  gl?: boolean
  locale?: string
  /** Ortada «Sayfa 2/5» */
  showPageIndicator?: boolean
  pageIndicatorClassName?: string
  className?: string
  /** `legacy`: siyah kenarlık (CRM liste altı); `legacy-slate`: gri kenarlık */
  buttonStyle?: 'passive' | 'glass' | 'legacy' | 'legacy-slate'
}

const passiveBtn = `${eiSplitHeaderButtonPassive} inline-flex size-7 shrink-0 items-center justify-center p-0 text-base leading-none disabled:pointer-events-none disabled:opacity-40`

const glassBtn =
  'glass-btn secondary small inline-flex size-7 shrink-0 items-center justify-center p-0 text-base leading-none disabled:pointer-events-none disabled:opacity-35'

const legacyBtn =
  'inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-black/22 bg-white p-0 text-base font-semibold leading-none text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/15 dark:bg-black/80 dark:text-white dark:hover:bg-white/10'

const legacySlateBtn =
  'inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-slate-300/90 bg-white p-0 text-base font-semibold leading-none text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'

function resolveButtonClass(gl: boolean, buttonStyle: SplitListPaginationNavProps['buttonStyle']) {
  if (buttonStyle === 'glass' || (buttonStyle === undefined && gl)) return glassBtn
  if (buttonStyle === 'legacy') return legacyBtn
  if (buttonStyle === 'legacy-slate') return legacySlateBtn
  return passiveBtn
}

/** Minimal sayfa gezgini — ‹ › (erişilebilirlik için aria-label). */
export function SplitListPaginationNav({
  safePage,
  pageCount,
  onPrev,
  onNext,
  gl = false,
  locale = 'tr',
  showPageIndicator = true,
  pageIndicatorClassName = '',
  className = '',
  buttonStyle,
}: SplitListPaginationNavProps) {
  if (pageCount <= 1) return null

  const en = locale === 'en'
  const btnCls = resolveButtonClass(gl, buttonStyle)
  const indicatorCls =
    pageIndicatorClassName ||
    (gl ? 'tabular-nums text-black/80 dark:text-white/75' : 'tabular-nums text-slate-600 dark:text-slate-300')

  return (
    <div
      className={`flex items-center gap-1 ${className}`.trim()}
      role="navigation"
      aria-label={en ? 'Pagination' : 'Sayfalama'}
    >
      <button
        type="button"
        disabled={safePage <= 1}
        onClick={onPrev}
        className={btnCls}
        aria-label={en ? 'Previous page' : 'Önceki sayfa'}
      >
        <span aria-hidden>&lt;</span>
      </button>
      {showPageIndicator ? (
        <span className={indicatorCls}>
          {en ? 'Page' : 'Sayfa'} {safePage}/{pageCount}
        </span>
      ) : null}
      <button
        type="button"
        disabled={safePage >= pageCount}
        onClick={onNext}
        className={btnCls}
        aria-label={en ? 'Next page' : 'Sonraki sayfa'}
      >
        <span aria-hidden>&gt;</span>
      </button>
    </div>
  )
}
