import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { loadMaterialCatalog } from '../../materialCatalog/storage'
import type { MaterialDef } from '../../materialCatalog/types'
import type { ProductMaterialEntry, ProjectProduct } from '../../elementIdentity/types'
import { useI18n } from '../../i18n/I18nProvider'
import { newRowId } from './productEditorUtils'

function categoryLabelKey(c: string): string {
  return `materialCatalog.category.${c}`
}

type Props = {
  product: ProjectProduct
  onPatch: (partial: Partial<ProjectProduct>) => void
}

export function ProductMaterialsTab({ product, onPatch }: Props) {
  const { t, locale } = useI18n()
  const rows = product.materials ?? []
  const [pickerOpen, setPickerOpen] = useState(false)

  const catalog = useMemo(() => loadMaterialCatalog(), [pickerOpen])

  const setRows = (next: ProductMaterialEntry[]) => {
    onPatch({ materials: next })
  }

  const addFromCatalog = (def: MaterialDef) => {
    const row: ProductMaterialEntry = {
      id: newRowId('mat'),
      materialDefId: def.id,
      category: t(categoryLabelKey(def.category)),
      name: def.name,
      specification: '',
      quantity: 1,
      unit: locale === 'en' ? 'ea' : 'ad',
    }
    setRows([...rows, row])
    setPickerOpen(false)
  }

  const addBlank = () => {
    setRows([
      ...rows,
      {
        id: newRowId('mat'),
        category: locale === 'en' ? 'Other' : 'Diğer',
        name: '',
        specification: '',
        quantity: 1,
        unit: locale === 'en' ? 'ea' : 'ad',
      },
    ])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setPickerOpen((o) => !o)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white/70 px-2 py-1.5 text-xs font-semibold dark:border-slate-600 dark:bg-slate-900/40">
          <Plus className="size-3.5" />
          {locale === 'en' ? 'From catalog' : 'Katalogdan'}
        </button>
        <button type="button" onClick={addBlank} className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white/70 px-2 py-1.5 text-xs font-semibold dark:border-slate-600 dark:bg-slate-900/40">
          <Plus className="size-3.5" />
          {locale === 'en' ? 'Blank row' : 'Boş satır'}
        </button>
      </div>
      {pickerOpen ? (
        <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200/60 bg-white/50 p-2 dark:border-slate-600/50 dark:bg-slate-900/30">
          <ul className="space-y-1">
            {catalog.map((def) => (
              <li key={def.id}>
                <button
                  type="button"
                  onClick={() => addFromCatalog(def)}
                  className="w-full rounded-lg px-2 py-1.5 text-left text-xs hover:bg-sky-500/10 dark:hover:bg-sky-400/10"
                >
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{def.code}</span>
                  <span className="ms-2 text-slate-600 dark:text-slate-300">{def.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/50 text-slate-500 dark:border-white/10 dark:text-slate-400">
              <th className="py-2 pr-2 font-medium">{locale === 'en' ? 'Category' : 'Kategori'}</th>
              <th className="py-2 pr-2 font-medium">{locale === 'en' ? 'Item' : 'Malzeme'}</th>
              <th className="py-2 pr-2 font-medium">{locale === 'en' ? 'Spec' : 'Özellik'}</th>
              <th className="py-2 pr-2 font-medium text-right">{locale === 'en' ? 'Qty' : 'Miktar'}</th>
              <th className="py-2 pr-2 font-medium">{locale === 'en' ? 'Unit' : 'Birim'}</th>
              <th className="w-10 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((m, idx) => (
              <tr key={m.id} className="border-b border-slate-200/30 dark:border-white/10">
                <td className="py-1.5 pr-1">
                  <input
                    value={m.category}
                    onChange={(e) => {
                      const copy = [...rows]
                      copy[idx] = { ...m, category: e.target.value }
                      setRows(copy)
                    }}
                    className="w-full min-w-[6rem] rounded border border-slate-300/80 bg-white px-1 py-1 dark:border-slate-600 dark:bg-slate-950"
                  />
                </td>
                <td className="py-1.5 pr-1">
                  <input
                    value={m.name}
                    onChange={(e) => {
                      const copy = [...rows]
                      copy[idx] = { ...m, name: e.target.value }
                      setRows(copy)
                    }}
                    className="w-full min-w-[7rem] rounded border border-slate-300/80 bg-white px-1 py-1 dark:border-slate-600 dark:bg-slate-950"
                  />
                </td>
                <td className="py-1.5 pr-1">
                  <input
                    value={m.specification}
                    onChange={(e) => {
                      const copy = [...rows]
                      copy[idx] = { ...m, specification: e.target.value }
                      setRows(copy)
                    }}
                    className="w-full min-w-[8rem] rounded border border-slate-300/80 bg-white px-1 py-1 dark:border-slate-600 dark:bg-slate-950"
                  />
                </td>
                <td className="py-1.5 pr-1 text-right">
                  <input
                    type="number"
                    value={m.quantity}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      const copy = [...rows]
                      copy[idx] = { ...m, quantity: Number.isFinite(n) ? n : 0 }
                      setRows(copy)
                    }}
                    className="w-16 rounded border border-slate-300/80 bg-white px-1 py-1 text-right font-mono dark:border-slate-600 dark:bg-slate-950"
                  />
                </td>
                <td className="py-1.5 pr-1">
                  <input
                    value={m.unit}
                    onChange={(e) => {
                      const copy = [...rows]
                      copy[idx] = { ...m, unit: e.target.value }
                      setRows(copy)
                    }}
                    className="w-14 rounded border border-slate-300/80 bg-white px-1 py-1 dark:border-slate-600 dark:bg-slate-950"
                  />
                </td>
                <td className="py-1.5">
                  <button
                    type="button"
                    onClick={() => setRows(rows.filter((r) => r.id !== m.id))}
                    className="rounded p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-600"
                    aria-label="remove"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">{locale === 'en' ? 'No material lines yet.' : 'Henüz malzeme satırı yok.'}</p>
        ) : null}
      </div>
    </div>
  )
}
