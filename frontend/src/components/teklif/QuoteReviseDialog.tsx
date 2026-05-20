import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { lineTotal, type Quote, type QuoteLine } from '../../data/quotesMock'
import { PmStyleDialog } from '../shared/PmStyleDialog'
import { eiSplitHeaderButtonPassive } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950'

type Props = {
  open: boolean
  quote: Quote | null
  onSave: (quote: Quote) => void
  onClose: () => void
}

function sumLines(lines: QuoteLine[]): number {
  let s = 0
  for (const l of lines) {
    const t = lineTotal(l)
    if (t != null) s += t
  }
  return s
}

export function QuoteReviseDialog({ open, quote, onSave, onClose }: Props) {
  const [lines, setLines] = useState<QuoteLine[]>([])
  const [versionNote, setVersionNote] = useState('')

  useEffect(() => {
    if (!open || !quote) return
    setLines(quote.lines.length ? quote.lines.map((l) => ({ ...l })) : [])
    setVersionNote(quote.versionNote ?? '')
  }, [open, quote])

  if (!open || !quote) return null

  const total = sumLines(lines)

  const updateLine = (id: string, patch: Partial<QuoteLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `ln-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: '',
        description: '',
        qty: 1,
        unit: 'ad',
        unitPrice: 0,
      },
    ])
  }

  const removeLine = (id: string) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.id !== id)))
  }

  const save = () => {
    const snap = { total, lines, versionNote: versionNote.trim() || 'Revizyon' }
    const next: Quote = {
      ...quote,
      lines,
      total,
      version: 'v2',
      versionNote: snap.versionNote,
      versionSnapshots: {
        v1: quote.versionSnapshots.v1,
        v2: snap,
      },
      trackingOutcome: 'revize',
      status: 'taslak',
    }
    onSave(next)
  }

  return (
    <PmStyleDialog
      variant="glass"
      title="Teklif revize"
      subtitle={`${quote.number} · ürün ve fiyat kalemleri`}
      closeLabel="Kapat"
      onClose={onClose}
      maxWidthClass="max-w-3xl"
      footer={
        <div className="flex w-full justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
          >
            Vazgeç
          </button>
          <button type="button" onClick={save} className={`${eiSplitHeaderButtonPassive} px-3 py-2 text-sm`}>
            Revizyonu kaydet
          </button>
        </div>
      }
    >
      <div className="max-h-[min(50vh,24rem)] space-y-3 overflow-y-auto px-1">
        <label className="block">
          <span className="text-xs font-medium text-black/70 dark:text-white/75">Revizyon notu</span>
          <input
            type="text"
            value={versionNote}
            onChange={(e) => setVersionNote(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase text-black/55 dark:text-white/60">Kalemler</p>
          <button type="button" onClick={addLine} className={`${eiSplitHeaderButtonPassive} px-2 py-1 text-xs`}>
            <Plus className="mr-1 inline size-3.5" aria-hidden />
            Kalem ekle
          </button>
        </div>
        <div className="space-y-2">
          {lines.map((line) => (
            <div
              key={line.id}
              className="grid gap-2 rounded-xl border border-slate-200/70 bg-white/50 p-2 dark:border-slate-700 dark:bg-slate-900/40 sm:grid-cols-[1fr_2fr_4rem_4rem_6rem_auto]"
            >
              <input
                type="text"
                placeholder="Kod"
                value={line.code}
                onChange={(e) => updateLine(line.id, { code: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Açıklama"
                value={line.description}
                onChange={(e) => updateLine(line.id, { description: e.target.value })}
                className={inputClass}
              />
              <input
                type="number"
                min={0}
                placeholder="Miktar"
                value={line.qty ?? ''}
                onChange={(e) =>
                  updateLine(line.id, { qty: e.target.value === '' ? null : Number(e.target.value) })
                }
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Birim"
                value={line.unit}
                onChange={(e) => updateLine(line.id, { unit: e.target.value })}
                className={inputClass}
              />
              <input
                type="number"
                min={0}
                placeholder="Birim fiyat"
                value={line.unitPrice}
                onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) || 0 })}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeLine(line.id)}
                className="inline-flex size-9 items-center justify-center text-slate-400 hover:text-rose-600"
                aria-label="Kalemi sil"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-right text-sm font-semibold tabular-nums text-black dark:text-white">
          Toplam: ₺{total.toLocaleString('tr-TR')}
        </p>
      </div>
    </PmStyleDialog>
  )
}
