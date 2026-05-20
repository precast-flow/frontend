import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { getCatalogDrag } from './catalogDragState'

/** Üst nav altında — karartma / blur yok, yalnızca sağ panel */
export const DASHBOARD_DRAWER_TOP =
  'top-[calc(env(safe-area-inset-top,0px)+3.5rem)] md:top-[calc(env(safe-area-inset-top,0px)+4rem)]'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  titleId: string
  closeLabel: string
  maxWidthClass?: string
  /** false: panoya tıklayınca kapanmaz (widget kataloğu) */
  closeOnOutsideClick?: boolean
  children: ReactNode
}

export function DashboardSideDrawer({
  open,
  onClose,
  title,
  titleId,
  closeLabel,
  maxWidthClass = 'max-w-md',
  closeOnOutsideClick = true,
  children,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !closeOnOutsideClick) return
    const onMouseDown = (e: MouseEvent) => {
      if (getCatalogDrag()) return
      const panel = panelRef.current
      if (!panel || panel.contains(e.target as Node)) return
      onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open, onClose, closeOnOutsideClick])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[200] pointer-events-none" role="presentation">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          'gm-glass-panel-l3 pointer-events-auto fixed right-0 bottom-0 z-[201] flex w-full flex-col',
          'border-l border-slate-200/80 shadow-2xl dark:border-white/10',
          DASHBOARD_DRAWER_TOP,
          maxWidthClass,
        ].join(' ')}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200/60 px-4 py-3 dark:border-white/10">
          <h2 id={titleId} className="text-sm font-semibold text-[var(--glass-text-primary)]">
            {title}
          </h2>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/10"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X className="size-5" />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  )
}
