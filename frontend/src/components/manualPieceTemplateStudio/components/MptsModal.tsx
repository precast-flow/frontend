import { X } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  widthClass?: string
}

export function MptsModal({ open, title, children, footer, onClose, widthClass = 'max-w-3xl' }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close modal backdrop"
        onClick={onClose}
      />
      <div
        className={`relative flex max-h-[90vh] w-full flex-col rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-900 ${widthClass}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          <button
            type="button"
            className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
        {footer ? <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-700">{footer}</div> : null}
      </div>
    </div>
  )
}
