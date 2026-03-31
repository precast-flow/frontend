import { useEffect, useId } from 'react'
import { X } from 'lucide-react'

type AltSlot = { lineLabel: string; slotLabel: string; key: string }

type Props = {
  open: boolean
  onClose: () => void
  onPick: (key: string) => void
  alternatives: AltSlot[]
}

export function SlotConflictModal({ open, onClose, onPick, alternatives }: Props) {
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
            Slot çakışması
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
        <div className="rounded-xl bg-gray-50 dark:bg-gray-950/90/90 p-3 text-sm text-gray-700 dark:text-gray-200 shadow-neo-in">
          <p className="font-semibold text-red-800">Seçilen slot dolu</p>
          <p className="mt-2 text-gray-700 dark:text-gray-200">
            Aşağıdaki boş alternatiflerden birini seçin veya iptal edin.
          </p>
        </div>
        <ul className="mt-4 space-y-2">
          {alternatives.map((a) => (
            <li key={a.key}>
              <button
                type="button"
                onClick={() => {
                  onPick(a.key)
                  onClose()
                }}
                className="w-full rounded-xl bg-gray-100 dark:bg-gray-900 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-50 shadow-neo-out-sm transition hover:shadow-neo-out active:shadow-neo-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                {a.lineLabel} · {a.slotLabel}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-gray-100 dark:bg-gray-900 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-neo-in"
        >
          İptal
        </button>
      </div>
    </div>
  )
}
