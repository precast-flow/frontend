import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { yardGridCells } from '../../data/yardMock'

type Props = {
  open: boolean
  elementLabel: string
  currentLocation: string
  onClose: () => void
  onConfirm: (toCell: string) => void
}

/** P0 — Lokasyon ata: hedef hücre seçimi */
export function YardLocationAssignModal({
  open,
  elementLabel,
  currentLocation,
  onClose,
  onConfirm,
}: Props) {
  const titleId = useId()
  const [target, setTarget] = useState('')

  useEffect(() => {
    if (open) setTarget('')
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
        <div className="mb-4 flex items-start justify-between gap-2">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Lokasyon ata
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 shadow-neo-out-sm hover:text-gray-900 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-gray-50"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-200">
          <strong className="text-gray-900 dark:text-gray-50">{elementLabel}</strong>
          <br />
          <span className="text-gray-600 dark:text-gray-300">Mevcut:</span>{' '}
          <span className="font-mono font-semibold text-gray-900 dark:text-gray-50">{currentLocation}</span>
        </p>
        <div className="mt-4 rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/90">
          <label className="block">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Hedef hücre</span>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-800 shadow-neo-in dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">Seçin…</option>
              {yardGridCells.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-100"
          >
            İptal
          </button>
          <button
            type="button"
            disabled={!target || target === currentLocation}
            onClick={() => {
              onConfirm(target)
              onClose()
            }}
            className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Ata
          </button>
        </div>
      </div>
    </div>
  )
}
