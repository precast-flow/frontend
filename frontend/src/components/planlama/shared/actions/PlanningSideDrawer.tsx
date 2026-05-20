import { X } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  hint?: string
  children: ReactNode
  id?: string
  placement?: 'inline' | 'fixed'
}

export function PlanningSideDrawer({
  open,
  onClose,
  title,
  hint,
  children,
  id,
  placement = 'inline',
}: Props) {
  const gl =
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-ui-template') === 'glass'

  return (
    <aside
      id={id}
      className={[
        placement === 'fixed'
          ? 'fixed inset-y-0 left-0 z-[90]'
          : 'absolute inset-y-0 left-0 z-[25]',
        'w-80 overflow-y-auto shadow-xl backdrop-blur-sm transition-transform duration-200 ease-out will-change-transform',
        gl
          ? 'glass-card glass-card--static project-mgmt-split-panel project-mgmt-filter-drawer'
          : 'rounded-r-xl border border-black/15 bg-white/95 p-3 dark:border-white/12 dark:bg-black/70',
        open ? 'translate-x-0' : '-translate-x-[105%] pointer-events-none',
      ].join(' ')}
      aria-hidden={!open}
    >
      <div className="mb-3 flex items-start justify-between gap-2 px-3 pt-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-black dark:text-white">{title}</h4>
          {hint ? (
            <p className="mt-1 text-[11px] text-black/60 dark:text-white/65">{hint}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className={
            gl
              ? 'card-button inline-flex size-7 items-center justify-center p-0'
              : 'inline-flex size-7 items-center justify-center rounded-lg border border-black/20 text-black/80 hover:bg-black/5 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/10'
          }
          aria-label="Kapat"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
      <div className="px-3 pb-4">{children}</div>
    </aside>
  )
}
