import { TYPOLOGIES_BY_ID } from '../../elementIdentity/catalog/typologies'
import { DIMENSIONS_BY_ID } from '../../elementIdentity/catalog/identifyingDimensions'
import type { ProjectProduct } from '../../elementIdentity/types'
import { useI18n } from '../../i18n/I18nProvider'

type Props = {
  product: ProjectProduct
  onPatch: (partial: Partial<ProjectProduct>) => void
}

export function ProductDimensionsTab({ product, onPatch }: Props) {
  const { locale } = useI18n()
  const ty = product.typologyId ? TYPOLOGIES_BY_ID[product.typologyId] : undefined
  const dims = product.dimensions ?? {}

  if (!ty) {
    return (
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {locale === 'en' ? 'Select a typology in the General tab to edit dimensions.' : 'Boyutları düzenlemek için Genel sekmesinde tipoloji seçin.'}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        {locale === 'en'
          ? 'Values are stored in mm (or count for count-type dimensions).'
          : 'Değerler mm olarak saklanır (adet tipi boyutlar için sayı).'}
      </p>
      <div className="space-y-2">
        {ty.identifyingDimensions.map((dimId) => {
          const def = DIMENSIONS_BY_ID[dimId]
          const label = def ? (locale === 'en' ? def.nameEn : def.nameTr) : dimId
          const isCount =
            dimId === 'coreCount' ||
            dimId === 'stepCount' ||
            dimId === 'stemCount' ||
            dimId === 'ribCount' ||
            dimId === 'corbelLevel'
          const val = dims[dimId] ?? 0
          return (
            <label key={dimId} className="block text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  value={Number.isFinite(val) ? val : 0}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    onPatch({
                      dimensions: { ...dims, [dimId]: Number.isFinite(n) ? n : 0 },
                    })
                  }}
                  className="w-full max-w-[12rem] rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-sm tabular-nums dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                />
                <span className="text-[11px] text-slate-500">{isCount ? (locale === 'en' ? 'count' : 'adet') : 'mm'}</span>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
