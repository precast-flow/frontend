import { useEffect, useId } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  packageName: string
  onClose: () => void
  onConfirm: () => void
}

export function ReadyForProductionModal({ open, packageName, onClose, onConfirm }: Props) {
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
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Üretime hazır onayı
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
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{packageName}</p>
        <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-950/90/90 p-3 text-sm text-gray-700 dark:text-gray-200 shadow-neo-in">
          <p className="font-semibold text-red-800">Dikkat</p>
          <p className="mt-2 text-gray-700 dark:text-gray-200">
            Bu işlem paketi <strong className="text-gray-900 dark:text-gray-50">üretime hazır</strong> olarak işaretler.
            Onay sonrası kilitli dosyalar MES tarafından referans alınabilir; geri alma için yeni revizyon
            oluşturmanız gerekir.
          </p>
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
            Onaylıyorum
          </button>
        </div>
      </div>
    </div>
  )
}
