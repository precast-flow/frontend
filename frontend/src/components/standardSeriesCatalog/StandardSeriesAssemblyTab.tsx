import { Plus, Trash2 } from 'lucide-react'
import type { AssemblyComponentLine } from '../../elementIdentity/types'
import { useI18n } from '../../i18n/I18nProvider'
import { newRowId } from '../elementIdentity/productEditorUtils'

type Props = {
  rows: AssemblyComponentLine[]
  onChange: (next: AssemblyComponentLine[]) => void
}

export function StandardSeriesAssemblyTab({ rows, onChange }: Props) {
  const { locale } = useI18n()

  const addRow = () => {
    onChange([
      ...rows,
      {
        id: newRowId('ac'),
        label: locale === 'en' ? 'Component' : 'Bileşen',
        quantity: 1,
        unit: locale === 'en' ? 'ea' : 'adet',
        notes: '',
      },
    ])
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={addRow}
        className="inline-flex w-fit items-center gap-1 rounded-lg border border-slate-200/80 bg-white/70 px-2 py-1.5 text-xs font-semibold dark:border-slate-600 dark:bg-slate-900/40"
      >
        <Plus className="size-3.5" />
        {locale === 'en' ? 'Add line' : 'Satır ekle'}
      </button>
      <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-600/40">
        <table className="w-full min-w-[28rem] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/60 bg-white/50 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-400">
              <th className="px-2 py-2">{locale === 'en' ? 'Label' : 'Tanım'}</th>
              <th className="w-20 px-2 py-2">{locale === 'en' ? 'Qty' : 'Miktar'}</th>
              <th className="w-24 px-2 py-2">{locale === 'en' ? 'Unit' : 'Birim'}</th>
              <th className="min-w-[6rem] px-2 py-2">{locale === 'en' ? 'Notes' : 'Not'}</th>
              <th className="w-10 px-1 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                  {locale === 'en' ? 'No assembly lines yet.' : 'Henüz assembly satırı yok.'}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100/80 dark:border-slate-800/80">
                  <td className="px-1 py-1">
                    <input
                      value={r.label}
                      onChange={(e) =>
                        onChange(rows.map((x) => (x.id === r.id ? { ...x, label: e.target.value } : x)))
                      }
                      className="w-full rounded border border-slate-300/70 bg-white px-1.5 py-1 dark:border-slate-600 dark:bg-slate-950"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={r.quantity}
                      onChange={(e) =>
                        onChange(
                          rows.map((x) =>
                            x.id === r.id ? { ...x, quantity: Math.max(0, Number(e.target.value) || 0) } : x,
                          ),
                        )
                      }
                      className="w-full rounded border border-slate-300/70 bg-white px-1.5 py-1 tabular-nums dark:border-slate-600 dark:bg-slate-950"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      value={r.unit}
                      onChange={(e) =>
                        onChange(rows.map((x) => (x.id === r.id ? { ...x, unit: e.target.value } : x)))
                      }
                      className="w-full rounded border border-slate-300/70 bg-white px-1.5 py-1 dark:border-slate-600 dark:bg-slate-950"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      value={r.notes ?? ''}
                      onChange={(e) =>
                        onChange(rows.map((x) => (x.id === r.id ? { ...x, notes: e.target.value } : x)))
                      }
                      className="w-full rounded border border-slate-300/70 bg-white px-1.5 py-1 dark:border-slate-600 dark:bg-slate-950"
                    />
                  </td>
                  <td className="px-0 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => onChange(rows.filter((x) => x.id !== r.id))}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      aria-label="remove"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
