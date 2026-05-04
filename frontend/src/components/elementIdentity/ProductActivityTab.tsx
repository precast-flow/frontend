import { useState } from 'react'
import type { ProductActivity, ProjectProduct } from '../../elementIdentity/types'
import { useI18n } from '../../i18n/I18nProvider'
import { newRowId } from './productEditorUtils'

type Props = {
  product: ProjectProduct
  onPatch: (partial: Partial<ProjectProduct>) => void
}

export function ProductActivityTab({ product, onPatch }: Props) {
  const { locale } = useI18n()
  const items = product.activities ?? []
  const [note, setNote] = useState('')

  const addNote = () => {
    const text = note.trim()
    if (!text) return
    const row: ProductActivity = {
      id: newRowId('act'),
      at: new Date().toLocaleString(locale === 'en' ? 'en-GB' : 'tr-TR'),
      text,
      by: locale === 'en' ? 'You' : 'Siz',
    }
    onPatch({ activities: [row, ...items] })
    setNote('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {locale === 'en' ? 'Add note' : 'Not ekle'}
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
        <button
          type="button"
          onClick={addNote}
          disabled={!note.trim()}
          className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
        >
          {locale === 'en' ? 'Append' : 'Ekle'}
        </button>
      </div>
      <ol className="space-y-3 border-l-2 border-slate-200/60 pl-4 dark:border-slate-600/60">
        {items.map((a) => (
          <li key={a.id} className="relative">
            <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-sky-500 ring-4 ring-sky-500/20 dark:ring-sky-400/20" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{a.text}</p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {a.at}
              {a.by ? ` · ${a.by}` : ''}
            </p>
          </li>
        ))}
      </ol>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">{locale === 'en' ? 'No activity yet.' : 'Henüz aktivite yok.'}</p>
      ) : null}
    </div>
  )
}
