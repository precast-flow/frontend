import { DIMENSIONS_BY_ID } from '../../elementIdentity/catalog/identifyingDimensions'
import { TYPOLOGIES_BY_ID } from '../../elementIdentity/catalog/typologies'
import type { Locale } from '../../i18n/I18nProvider'

export type ResolvedPartDimensionRow = {
  dimensionId: string
  label: string
  /** Ham değer (mm); sayım tipi boyutlar için birim etiketi ayrı */
  rawValue: number
  display: string
}

/** Katalogdaki tipolojinin identifyingDimensions sırasına göre satırlar üretir. */
export function resolveTypologyDimensionRows(
  typologyId: string,
  values: Record<string, number>,
  locale: Locale,
): ResolvedPartDimensionRow[] {
  const ty = TYPOLOGIES_BY_ID[typologyId]
  if (!ty) return []

  return ty.identifyingDimensions.map((dimId) => {
    const def = DIMENSIONS_BY_ID[dimId]
    const label = def ? (locale === 'en' ? def.nameEn : def.nameTr) : dimId
    const raw = values[dimId] ?? 0
    let display: string
    if (dimId === 'coreCount' || dimId === 'stepCount' || dimId === 'stemCount' || dimId === 'ribCount') {
      display = `${raw} ad`
    } else if (dimId === 'corbelLevel') {
      display = `${raw} seviye`
    } else {
      display = `${raw.toLocaleString(locale === 'en' ? 'en-US' : 'tr-TR')} mm`
    }
    return { dimensionId: dimId, label, rawValue: raw, display }
  })
}
