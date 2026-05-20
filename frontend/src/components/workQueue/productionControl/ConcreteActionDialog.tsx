import { useState } from 'react'
import { PmStyleDialog } from '../../shared/PmStyleDialog'

type ActionKind = 'delay' | 'cancel'

type Props = {
  open: boolean
  kind: ActionKind
  title: string
  subtitle: string
  noteLabel: string
  noteRequiredHint: string
  confirmLabel: string
  cancelLabel: string
  closeLabel: string
  onClose: () => void
  onConfirm: (note: string) => void
}

export function ConcreteActionDialog({
  open,
  kind,
  title,
  subtitle,
  noteLabel,
  noteRequiredHint,
  confirmLabel,
  cancelLabel,
  closeLabel,
  onClose,
  onConfirm,
}: Props) {
  const [note, setNote] = useState('')

  if (!open) return null

  const handleConfirm = () => {
    const trimmed = note.trim()
    if (!trimmed) return
    onConfirm(trimmed)
    setNote('')
    onClose()
  }

  return (
    <PmStyleDialog title={title} subtitle={subtitle} closeLabel={closeLabel} onClose={onClose} size="sm">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">{noteLabel}</label>
      <textarea
        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950"
        rows={4}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {!note.trim() ? (
        <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-200">{noteRequiredHint}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-600"
          onClick={onClose}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={!note.trim()}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-45 ${
            kind === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
          }`}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </PmStyleDialog>
  )
}
