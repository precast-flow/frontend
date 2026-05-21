import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export type PlanningRightDrawerSize = 'md' | 'lg' | 'xl'

const SIZE_CLASS: Record<PlanningRightDrawerSize, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export type PlanningRightDrawerProps = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  size?: PlanningRightDrawerSize
  closeLabel?: string
  ariaLabel?: string
}

export function PlanningRightDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeLabel = 'Kapat',
  ariaLabel,
}: PlanningRightDrawerProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="gm-glass-drawer-root fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        className="gm-glass-drawer-backdrop absolute inset-0 z-0 cursor-default border-0 bg-slate-900/40 p-0 backdrop-blur-md"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <aside
        className={[
          'gm-glass-drawer-panel relative z-10 flex h-full min-h-0 w-full flex-col overflow-hidden',
          'rounded-l-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900',
          'md:m-3 md:max-h-[calc(100vh-1.5rem)] md:rounded-3xl',
          SIZE_CLASS[size],
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={ariaLabel}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200/80 px-5 py-4 dark:border-slate-700/70">
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="text-base font-semibold leading-snug text-slate-900 dark:text-slate-50 sm:text-lg"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={closeLabel}
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {children}
        </div>

        {footer ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200/80 px-5 py-4 dark:border-slate-700/70">
            {footer}
          </div>
        ) : null}
      </aside>
    </div>,
    document.body,
  )
}
