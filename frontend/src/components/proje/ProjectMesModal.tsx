import { useEffect, useId } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  projectName: string
}

/**
 * Üretim emrine aktar öncesi doğrulama — kabuk protrude, form alanları inset (Prompt 06).
 */
export function ProjectMesModal({ open, onClose, onConfirm, projectName }: Props) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="gm-glass-modal-shell fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/25 backdrop-blur-[2px]"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-3xl bg-gray-100 dark:bg-gray-900 p-5 shadow-neo-out"
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Üretim emrine aktar
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 shadow-neo-out-sm hover:text-gray-900 dark:text-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong className="text-gray-900 dark:text-gray-50">{projectName}</strong> için seçili elemanlar MES’e
          aktarılacak. Aşağıdaki kontrolleri onaylayın.
        </p>
        <div className="mt-4 space-y-3 rounded-2xl bg-gray-50 dark:bg-gray-950/90/90 p-4 shadow-neo-in">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-800 dark:text-gray-100">
            <input type="checkbox" defaultChecked className="mt-1 size-4 rounded border-gray-400" />
            <span>Mühendislik revizyonu imzalı (son rev.)</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-800 dark:text-gray-100">
            <input type="checkbox" defaultChecked className="mt-1 size-4 rounded border-gray-400" />
            <span>BOM ve rota eşleşmesi doğrulandı</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-800 dark:text-gray-100">
            <input type="checkbox" className="mt-1 size-4 rounded border-gray-400" />
            <span>Müşteri ek onayı (varsa)</span>
          </label>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-neo-out-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900"
          >
            Onayla ve aktar
          </button>
        </div>
      </div>
    </div>
  )
}
