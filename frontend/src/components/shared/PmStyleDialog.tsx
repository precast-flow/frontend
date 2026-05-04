import { X } from 'lucide-react'
import type { ReactNode } from 'react'

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
}: PmStyleDialogProps) {
  return (
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
}
