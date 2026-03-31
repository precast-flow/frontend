import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import { yardGridCells } from '../../data/yardMock'

type Props = {
  open: boolean
  elementLabel: string
  /** Mevcut kayıt fabrikası */
  sourceFactoryCode: string
  onClose: () => void
  onConfirm: (payload: { targetFactoryCode: string; targetCell: string }) => void
}

/** P1 — Aynı şirket içi fabrikalar arası transfer talebi (mock) */
export function YardTransferModal({ open, elementLabel, sourceFactoryCode, onClose, onConfirm }: Props) {
  const { factories } = useFactoryContext()
  const titleId = useId()
  const [targetFactory, setTargetFactory] = useState('')
  const [targetCell, setTargetCell] = useState('')

  useEffect(() => {
    if (open) {
      setTargetFactory('')
      setTargetCell('')
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

  const sourceName = factories.find((f) => f.code === sourceFactoryCode)?.name ?? sourceFactoryCode

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
            Transfer talebi
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
        </p>
        <div className="mt-4 space-y-3 rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/90">
          <div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Kaynak fabrika</span>
            <p className="mt-1 rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 shadow-neo-in dark:bg-gray-900 dark:text-gray-50">
              {sourceName} <span className="font-mono text-xs text-gray-500">({sourceFactoryCode})</span>
            </p>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Hedef fabrika</span>
            <select
              value={targetFactory}
              onChange={(e) => setTargetFactory(e.target.value)}
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-800 shadow-neo-in dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">Seçin…</option>
              {factories.filter((f) => f.code !== sourceFactoryCode).map((f) => (
                <option key={f.code} value={f.code}>
                  {f.name} ({f.city})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Hedef yard hücresi</span>
            <select
              value={targetCell}
              onChange={(e) => setTargetCell(e.target.value)}
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
          <label className="block">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Not (isteğe bağlı)</span>
            <textarea
              rows={2}
              placeholder="Vinç, güzergâh, ETA…"
              className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-800 shadow-neo-in placeholder:text-gray-500 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400"
            />
          </label>
        </div>
        <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
          Aynı şirket içi stok transferi — onay akışı entegrasyonda (mock).
        </p>
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
            disabled={!targetFactory || !targetCell}
            onClick={() => {
              onConfirm({ targetFactoryCode: targetFactory, targetCell })
              onClose()
            }}
            className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Talebi oluştur
          </button>
        </div>
      </div>
    </div>
  )
}
