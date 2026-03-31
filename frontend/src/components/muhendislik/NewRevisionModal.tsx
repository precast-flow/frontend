import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  packageLabel: string
  onClose: () => void
  onConfirm: (note: string) => void
}

/** P1 — Revizyon oluştur (not alanı) */
export function NewRevisionModal({ open, packageLabel, onClose, onConfirm }: Props) {
  const titleId = useId()
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) setNote('')
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
        className="relative z-10 w-full max-w-md rounded-3xl bg-gray-100 p-5 shadow-neo-out dark:bg-gray-900"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Revizyon oluştur
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 shadow-neo-out-sm hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{packageLabel}</p>
        <label className="mt-4 block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Revizyon notu</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
            placeholder="Kapsam değişikliği, referans çizim no…"
          />
        </label>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(note)
              onClose()
            }}
            className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
          >
            Oluştur (mock)
          </button>
        </div>
      </div>
    </div>
  )
}
