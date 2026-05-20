import { useEffect, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import type { QualityMarker } from '../../../data/productionQualityControl'

type Props = {
  marker: QualityMarker
  onSaveNote: (note: string) => void
  onClose: () => void
  onDelete?: () => void
  onOpenNc?: () => void
  readOnly?: boolean
  closeLabel: string
  saveLabel: string
  deleteLabel: string
  ncLabel: string
  dragHint?: string
}

export function MarkerEditPopover({
  marker,
  onSaveNote,
  onClose,
  onDelete,
  onOpenNc,
  readOnly = false,
  closeLabel,
  saveLabel,
  deleteLabel,
  ncLabel,
  dragHint,
}: Props) {
  const [note, setNote] = useState(marker.note ?? '')

  useEffect(() => {
    setNote(marker.note ?? '')
  }, [marker.id, marker.note])

  const kindLabel =
    marker.kind === 'pass' ? 'Onay' : marker.kind === 'warning' ? 'Uyarı' : 'Uygunsuzluk'

  const handleSave = () => {
    onSaveNote(note)
    onClose()
  }

  const handleDelete = () => {
    onDelete?.()
    onClose()
  }

  return (
    <div
      data-marker-popover
      className="pointer-events-auto w-56 rounded-lg border border-slate-200/90 bg-white p-2.5 shadow-xl ring-1 ring-black/5 dark:border-slate-600 dark:bg-slate-900 dark:ring-white/10"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {kindLabel}
        </p>
        <button
          type="button"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label={closeLabel}
          onClick={onClose}
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
      {readOnly ? (
        <p className="mt-1 max-h-24 overflow-y-auto text-xs text-slate-800 dark:text-slate-100">
          {marker.note?.trim() || '—'}
        </p>
      ) : (
        <>
          <textarea
            className="mt-1.5 w-full resize-none rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-950"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Not…"
          />
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              className="rounded bg-sky-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-sky-700"
              onClick={handleSave}
            >
              {saveLabel}
            </button>
            {marker.kind === 'error' && onOpenNc ? (
              <button
                type="button"
                className="rounded border border-red-300 px-2 py-1 text-[10px] font-semibold text-red-800 dark:border-red-600 dark:text-red-200"
                onClick={() => {
                  onOpenNc()
                  onClose()
                }}
              >
                {ncLabel}
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                className="inline-flex items-center gap-0.5 rounded border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={handleDelete}
              >
                <Trash2 className="size-3" aria-hidden />
                {deleteLabel}
              </button>
            ) : null}
          </div>
        </>
      )}
      {!readOnly && dragHint ? (
        <p className="mt-2 text-[9px] leading-snug text-slate-400 dark:text-slate-500">{dragHint}</p>
      ) : null}
    </div>
  )
}
