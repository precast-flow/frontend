import { ELEMENT_TYPES_BY_ID } from '../catalog/elementTypes'
import { TYPOLOGIES_BY_ID } from '../catalog/typologies'
import type { FirmCodeOverride, FirmCodeOverrideScope } from '../types'

/**
 * Precedence zinciri (promt 09):
 *   ProjectLevelOverride (faz 2) → FirmLevelOverride (active) → SystemDefault
 */
export function resolveCode(
  scope: FirmCodeOverrideScope,
  refId: string,
  firmId: string,
  overrides: FirmCodeOverride[],
): string | null {
  if (scope !== 'size_format') {
    const firmOv = overrides.find(
      (o) => o.firmId === firmId && o.scope === scope && o.refId === refId && o.active,
    )
    if (firmOv?.customCode) return firmOv.customCode
  }

  if (scope === 'element_type') {
    return ELEMENT_TYPES_BY_ID[refId]?.defaultCode ?? null
  }
  if (scope === 'typology') {
    return TYPOLOGIES_BY_ID[refId]?.defaultCode ?? null
  }
  if (scope === 'separator') return null
  return null
}

/** size_format scope için: typology için hangi format id kullanılır. */
export function resolveSizeFormatId(
  typologyId: string,
  firmId: string,
  overrides: FirmCodeOverride[],
): string | null {
  const firmOv = overrides.find(
    (o) =>
      o.firmId === firmId &&
      o.scope === 'size_format' &&
      o.refId === typologyId &&
      o.active,
  )
  if (firmOv?.customSizeFormatId) return firmOv.customSizeFormatId
  return TYPOLOGIES_BY_ID[typologyId]?.defaultSizeFormatId ?? null
}

export function hasActiveOverride(
  scope: FirmCodeOverrideScope,
  refId: string,
  firmId: string,
  overrides: FirmCodeOverride[],
): boolean {
  return overrides.some(
    (o) => o.firmId === firmId && o.scope === scope && o.refId === refId && o.active,
  )
}
