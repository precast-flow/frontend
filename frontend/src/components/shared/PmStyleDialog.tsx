import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import '../proje/projectManagementGlassLight.css'

type PmStyleDialogProps = {
  title: string
  subtitle?: string
  /** Kapat arka planı için (aria) */
  closeLabel: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  /** Örn. max-w-2xl, max-w-3xl */
  maxWidthClass?: string
  /** aria-label; yoksa title kullanılır */
  ariaLabel?: string
  /** Proje yönetimi glass-card kabuğu (project-mgmt-glass-light) */
  variant?: 'default' | 'glass'
}

/**
 * Proje yönetimi modülündeki proje oluştur / düzenle diyalogları ile aynı kabuk:
 * backdrop, kart, başlık satırı, X, gövde kaydırma, isteğe bağlı alt çubuk.
 */
export function PmStyleDialog({
  title,
  subtitle,
  closeLabel,
  onClose,
  children,
  footer,
  maxWidthClass = 'max-w-2xl',
  ariaLabel,
  variant = 'default',
}: PmStyleDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const glass = variant === 'glass'

  const dialog = glass ? (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[2px] dark:bg-black/60"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div className={`project-mgmt-glass-light relative z-10 w-full ${maxWidthClass}`}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel ?? title}
          className="glass-card glass-card--static flex max-h-[min(90vh,calc(100vh-2rem))] w-full flex-col overflow-hidden"
        >
          <div className="flex shrink-0 items-start justify-between gap-2 p-4 pb-3 sm:p-5 sm:pb-4">
            <div className="min-w-0 pr-2">
              <h3 className="text-base font-semibold text-black dark:text-white">{title}</h3>
              {subtitle ? <p className="mt-1 text-xs text-black/60 dark:text-white/65">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="card-button inline-flex size-8 shrink-0 items-center justify-center p-0 text-black shadow-sm ring-1 ring-black/15 dark:text-white dark:ring-white/20"
            >
              <X className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
          {footer ? <div className="shrink-0 px-4 pb-4 pt-0 sm:px-5 sm:pb-5">{footer}</div> : null}
        </div>
      </div>
    </div>
  ) : (
    <div className="fixed inset-0 z-[95] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        className={`relative z-10 flex max-h-[min(90vh,calc(100vh-2rem))] w-full ${maxWidthClass} flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-xl dark:border-slate-700/70 dark:bg-slate-900`}
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-200/70 p-4 dark:border-slate-700/60">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
            {subtitle ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={closeLabel}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-slate-200/70 p-4 dark:border-slate-700/60">{footer}</div>
        ) : null}
      </div>
    </div>
  )

  if (glass) {
    return createPortal(dialog, document.body)
  }

  return dialog
}
