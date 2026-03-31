import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  planCode: string
  onClose: () => void
  onConfirm: () => void
}

export function DispatchCancelModal({ open, planCode, onClose, onConfirm }: Props) {
  const titleId = useId()
  const [postpone, setPostpone] = useState(false)

  useEffect(() => {
    if (!open) setPostpone(false)
  }, [open])

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
          <h2 id={titleId} className="text-lg font-semibold text-red-800">
            {postpone ? 'Sevkiyatı ertele' : 'Sevkiyatı iptal et'}
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
        <p className="font-mono text-sm text-gray-800 dark:text-gray-100">{planCode}</p>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
          Bu işlem planı <strong className="text-gray-900 dark:text-gray-50">iptal / ertelenmiş</strong> olarak işaretler.
          İlgili yükler yard’da kalır veya yeniden planlanır.
        </p>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
          <input
            type="checkbox"
            checked={postpone}
            onChange={(e) => setPostpone(e.target.checked)}
            className="size-4 rounded border-gray-400"
          />
          Ertele (iptal değil)
        </label>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-neo-out-sm"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="rounded-xl bg-gray-100 dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-red-800 shadow-neo-out-sm ring-1 ring-red-300/80 hover:bg-red-50/40"
          >
            Onayla
          </button>
        </div>
      </div>
    </div>
  )
}
