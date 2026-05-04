import { Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import type { ProductRebarEntry, ProjectProduct, RebarShapeType } from '../../elementIdentity/types'
import { useI18n } from '../../i18n/I18nProvider'
import { computeRebarSummary, newRowId } from './productEditorUtils'

const SHAPES: RebarShapeType[] = ['straight', 'stirrup', 'hook', 'l_bar', 'u_bar', 'crank', 'custom']

function shapeLabel(shape: RebarShapeType, locale: 'tr' | 'en'): string {
  const tr: Record<RebarShapeType, string> = {
    straight: 'Düz',
    stirrup: 'Etriye',
    hook: 'Kancalı',
    l_bar: 'L',
    u_bar: 'U',
    crank: 'Kırımlı',
    custom: 'Özel',
  }
  const en: Record<RebarShapeType, string> = {
    straight: 'Straight',
    stirrup: 'Stirrup',
    hook: 'Hook',
    l_bar: 'L-bar',
    u_bar: 'U-bar',
    crank: 'Crank',
    custom: 'Custom',
  }
  return locale === 'en' ? en[shape] : tr[shape]
}

type Props = {
  product: ProjectProduct
  onPatch: (partial: Partial<ProjectProduct>) => void
}

export function ProductRebarTab({ product, onPatch }: Props) {
  const { locale } = useI18n()
  const loc = locale === 'en' ? 'en' : 'tr'
  const rows = product.rebarSchedule ?? []

  const summary = useMemo(() => computeRebarSummary(rows), [rows])

  const setRows = (next: ProductRebarEntry[]) => {
    onPatch({ rebarSchedule: next, rebarSummary: computeRebarSummary(next) })
  }

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: newRowId('rb'),
        position: '',
        diameterMm: 12,
        steelGrade: 'B500C',
        shape: 'straight',
        developedLengthMm: 1000,
        count: 1,
        totalWeightKg: 0,
      },
    ])
  }

  return (
    <div className="flex flex-col gap-3">
      <button type="button" onClick={addRow} className="self-start rounded-lg border border-slate-200/80 bg-white/70 px-2 py-1.5 text-xs font-semibold dark:border-slate-600 dark:bg-slate-900/40">
        <span className="inline-flex items-center gap-1">
          <Plus className="size-3.5" />
          {locale === 'en' ? 'Add row' : 'Satır ekle'}
        </span>
      </button>
      <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-600/40">
        <table className="w-full min-w-[640px] text-xs">
          <thead>
            <tr className="border-b border-slate-200/50 bg-slate-100/50 text-slate-600 dark:border-slate-600/50 dark:bg-slate-900/40 dark:text-slate-300">
              <th className="px-1 py-2 text-left font-semibold">{locale === 'en' ? 'Mark' : 'Poz'}</th>
              <th className="px-1 py-2 text-left font-semibold">Ø</th>
              <th className="px-1 py-2 text-left font-semibold">{locale === 'en' ? 'Grade' : 'Sınıf'}</th>
              <th className="px-1 py-2 text-left font-semibold">{locale === 'en' ? 'Shape' : 'Şekil'}</th>
              <th className="px-1 py-2 text-right font-semibold">{locale === 'en' ? 'Len mm' : 'Boy mm'}</th>
              <th className="px-1 py-2 text-right font-semibold">{locale === 'en' ? 'Qty' : 'Adet'}</th>
              <th className="px-1 py-2 text-right font-semibold">kg</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className="border-b border-slate-200/25 dark:border-white/10">
                <td className="px-1 py-1">
                  <input
                    value={r.position}
                    onChange={(e) => {
                      const c = [...rows]
                      c[idx] = { ...r, position: e.target.value }
                      setRows(c)
                    }}
                    className="w-full min-w-[3rem] rounded border border-slate-300/80 bg-white px-1 py-0.5 font-mono dark:border-slate-600 dark:bg-slate-950"
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    value={r.diameterMm}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      const c = [...rows]
                      c[idx] = { ...r, diameterMm: Number.isFinite(n) ? n : 0 }
                      setRows(c)
                    }}
                    className="w-14 rounded border border-slate-300/80 bg-white px-1 py-0.5 dark:border-slate-600 dark:bg-slate-950"
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    value={r.steelGrade}
                    onChange={(e) => {
                      const c = [...rows]
                      c[idx] = { ...r, steelGrade: e.target.value }
                      setRows(c)
                    }}
                    className="w-full min-w-[4rem] rounded border border-slate-300/80 bg-white px-1 py-0.5 dark:border-slate-600 dark:bg-slate-950"
                  />
                </td>
                <td className="px-1 py-1">
                  <select
                    value={r.shape}
                    onChange={(e) => {
                      const c = [...rows]
                      c[idx] = { ...r, shape: e.target.value as RebarShapeType }
                      setRows(c)
                    }}
                    className="max-w-[7rem] rounded border border-slate-300/80 bg-white px-1 py-0.5 dark:border-slate-600 dark:bg-slate-950"
                  >
                    {SHAPES.map((s) => (
                      <option key={s} value={s}>
                        {shapeLabel(s, loc)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-1 py-1 text-right">
                  <input
                    type="number"
                    value={r.developedLengthMm}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      const c = [...rows]
                      c[idx] = { ...r, developedLengthMm: Number.isFinite(n) ? n : 0 }
                      setRows(c)
                    }}
                    className="w-20 rounded border border-slate-300/80 bg-white px-1 py-0.5 text-right font-mono dark:border-slate-600 dark:bg-slate-950"
                  />
                </td>
                <td className="px-1 py-1 text-right">
                  <input
                    type="number"
                    value={r.count}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      const c = [...rows]
                      c[idx] = { ...r, count: Number.isFinite(n) ? Math.max(0, n) : 0 }
                      setRows(c)
                    }}
                    className="w-14 rounded border border-slate-300/80 bg-white px-1 py-0.5 text-right dark:border-slate-600 dark:bg-slate-950"
                  />
                </td>
                <td className="px-1 py-1 text-right">
                  <input
                    type="number"
                    step="0.1"
                    value={r.totalWeightKg}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      const c = [...rows]
                      c[idx] = { ...r, totalWeightKg: Number.isFinite(n) ? n : 0 }
                      setRows(c)
                    }}
                    className="w-16 rounded border border-slate-300/80 bg-white px-1 py-0.5 text-right font-mono dark:border-slate-600 dark:bg-slate-950"
                  />
                </td>
                <td className="px-1 py-1">
                  <button
                    type="button"
                    onClick={() => setRows(rows.filter((x) => x.id !== r.id))}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300/60 bg-slate-100/70 font-semibold dark:border-slate-500/50 dark:bg-slate-900/60">
              <td colSpan={4} className="px-1 py-2 text-slate-700 dark:text-slate-200">
                {locale === 'en' ? 'Totals' : 'Toplam'}
              </td>
              <td className="px-1 py-2 text-right font-mono text-[11px] text-slate-800 dark:text-slate-100">
                {summary.totalDevelopedLengthM.toFixed(1)} m
              </td>
              <td className="px-1 py-2 text-right text-[11px] text-slate-600 dark:text-slate-400">
                {summary.straightBarCount + summary.shapedBarCount}
              </td>
              <td className="px-1 py-2 text-right font-mono text-slate-900 dark:text-slate-50">
                {summary.totalWeightKg.toFixed(1)} kg
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
