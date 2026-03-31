import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { rejectReasonCodes } from '../../data/kaliteMock'

type Props = {
  open: boolean
  inspectionCode: string
  onClose: () => void
  onConfirm: () => void
}

export function QualityRejectModal({ open, inspectionCode, onClose, onConfirm }: Props) {
  const titleId = useId()
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')

  useEffect(() => {
    if (!open) {
      setReason('')
      setDetail('')
    }
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
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-red-800">
              Ret
            </h2>
            <p className="mt-1 font-mono text-sm text-gray-800 dark:text-gray-100">{inspectionCode}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 shadow-neo-out-sm hover:text-gray-900 dark:text-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Sebep kodu</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              <option value="">Seçin…</option>
              {rejectReasonCodes.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Açıklama</span>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
              placeholder="Detaylı ret gerekçesi…"
              className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in placeholder:text-gray-500 dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            />
          </label>
          <div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Fotoğraf</span>
            <div className="mt-1 flex min-h-[88px] items-center justify-center rounded-xl border border-dashed border-gray-400/80 bg-gray-50 dark:bg-gray-950/90/80 text-center text-xs font-medium text-gray-600 dark:text-gray-300 shadow-neo-in">
              Sürükleyip bırakın veya tıklayın (yer tutucu)
            </div>
          </div>
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
            className="rounded-xl bg-gray-100 dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-red-800 shadow-neo-out-sm ring-1 ring-red-300/80 transition hover:bg-red-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900"
          >
            Reti onayla
          </button>
        </div>
      </div>
    </div>
  )
}
