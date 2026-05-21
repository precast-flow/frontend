import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/** Ortak dialog boyutları — yalnızca genişlik / yükseklik farkı. */
export type AppDialogSize = 'sm' | 'md' | 'lg' | 'fullscreen'

const SIZE_CLASS: Record<AppDialogSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  fullscreen: 'max-w-[min(100vw-1.5rem,100%)] h-[min(100vh-1.5rem,100%)]',
}

const Z_INDEX = 110

/** Tam ekran scrim — cam temada glassmorphism.css ile blur korunur (`gm-app-dialog-backdrop`). */
const BACKDROP_CLASS =
  'gm-app-dialog-backdrop fixed inset-0 z-0 cursor-default border-0 bg-slate-900/40 p-0 backdrop-blur-md'

/** Okunabilirlik için her zaman beyaz panel. */
const PANEL_CLASS =
  'relative z-10 flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-2xl'

const HEADER_CLASS =
  'flex shrink-0 items-start justify-between gap-3 border-b border-slate-200/80 px-4 py-4 sm:px-5 sm:py-4'

const BODY_CLASS = 'min-h-0 flex-1 overflow-y-auto px-4 py-4 text-sm leading-relaxed text-slate-700 sm:px-5 sm:py-5'

const FOOTER_CLASS =
  'flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200/80 px-4 py-4 sm:px-5 sm:py-4'

/** Form alanları — beyaz zemin üzerinde okunaklı. */
export const appDialogInputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/25'

export const appDialogFieldClass = `mt-1 ${appDialogInputClass}`

export const appDialogLabelClass = 'text-xs font-medium text-slate-600'

export type AppDialogProps = {
  open?: boolean
  title: string
  subtitle?: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: AppDialogSize
  /** @deprecated `size` kullanın */
  maxWidthClass?: string
  /** @deprecated Tek tasarım; yok sayılır */
  variant?: 'default' | 'glass' | 'planning'
  ariaLabel?: string
}

export function AppDialog({
  open = true,
  title,
  subtitle,
  closeLabel,
  onClose,
  children,
  footer,
  size = 'md',
  maxWidthClass,
  ariaLabel,
}: AppDialogProps) {
  const widthClass = maxWidthClass ?? SIZE_CLASS[size]
  const isFullscreen = size === 'fullscreen' || widthClass.includes('100vh')

  const panelMaxH = isFullscreen
    ? 'max-h-[calc(100vh-1.5rem)] min-h-[calc(100vh-1.5rem)]'
    : 'max-h-[min(90vh,calc(100vh-2rem))]'

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose, open])

  if (!open) return null

  const dialog = (
    <div
      className="gm-glass-modal-shell pointer-events-none fixed inset-0 flex items-end justify-center p-3 sm:items-center sm:p-6"
      style={{ zIndex: Z_INDEX }}
    >
      <button
        type="button"
        className={`${BACKDROP_CLASS} pointer-events-auto`}
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        className={`${PANEL_CLASS} pointer-events-auto relative z-10 ${panelMaxH} ${widthClass}`}
      >
        <DialogHeader title={title} subtitle={subtitle} closeLabel={closeLabel} onClose={onClose} />
        <div className={BODY_CLASS}>{children}</div>
        {footer ? <div className={FOOTER_CLASS}>{footer}</div> : null}
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}

function DialogHeader({
  title,
  subtitle,
  closeLabel,
  onClose,
}: {
  title: string
  subtitle?: string
  closeLabel: string
  onClose: () => void
}) {
  return (
    <div className={HEADER_CLASS}>
      <div className="min-w-0 pr-2">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
      >
        <X className="size-4 shrink-0" strokeWidth={2} aria-hidden />
      </button>
    </div>
  )
}

/** Standart footer düzeni — sağa hizalı aksiyonlar. */
export function AppDialogFooter({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
}

export function AppDialogButton({
  children,
  variant = 'secondary',
  type = 'button',
  onClick,
  disabled,
  className = '',
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 disabled:cursor-not-allowed disabled:opacity-50'
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`.trim()}
    >
      {children}
    </button>
  )
}
