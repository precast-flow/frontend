import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  title: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  widthClass?: string
}

/**
 * Cam / liquid üst öğelerde `backdrop-filter` veya `transform` varken `position: fixed`
 * görünüm alanına hapsolabiliyor; içerik `overflow-hidden` ile kesiliyor — portal `body` kullanılır.
 *
 * `okan-liquid-root` aynı düğümde `fixed` ile kullanılmamalı: root CSS `position: relative`
 * tanımlı; stylesheet sırası yüzünde `fixed` ezilip overlay görünmez olabiliyor.
 * Tema değişkenleri diyalog panelinde (`okan-liquid-root` + `okan-liquid-modal-panel`) verilir.
 */
export function MptsModal({ open, title, children, footer, onClose, widthClass = 'max-w-3xl' }: Props) {
  if (!open) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="okan-liquid-modal-backdrop absolute inset-0"
        aria-label="Close modal backdrop"
        onClick={onClose}
      />
      <div
        className={`okan-liquid-root okan-liquid-modal-panel relative z-10 flex max-h-[90vh] w-full flex-col text-slate-900 dark:text-slate-100 ${widthClass}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/15 px-5 py-4 dark:border-white/10">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-white/35 dark:text-slate-400 dark:hover:bg-white/10"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-white/15 px-5 py-4 dark:border-white/10">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
