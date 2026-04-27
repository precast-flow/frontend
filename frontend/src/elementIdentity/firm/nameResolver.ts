import type {
  FirmCodeOverride,
  FirmNamingTemplate,
  FirmProfile,
  NameResolutionResult,
  NameResolutionTrace,
  NamingToken,
  NamingTokenConfig,
  ProjectElement,
  ProjectLike,
} from '../types'
import { hasActiveOverride, resolveCode, resolveSizeFormatId } from './codeResolver'
import { generateSize } from './sizeResolver'

export type ResolveInstanceArgs = {
  element: Pick<
    ProjectElement,
    'elementTypeId' | 'typologyId' | 'variantCode' | 'dimensions' | 'sequence' | 'revision'
  >
  template: FirmNamingTemplate
  firm: FirmProfile
  project: ProjectLike
  overrides: FirmCodeOverride[]
}

function padLeft(value: number, width: number): string {
  return String(value).padStart(Math.max(1, width), '0')
}

function resolveTokenValue(
  token: NamingToken,
  args: ResolveInstanceArgs,
): { raw: string | number | null; source: NameResolutionTrace['source'] } {
  const { element, firm, project, overrides } = args
  switch (token) {
    case 'FIRM_CODE':
      return { raw: firm.firmCodePrefix, source: 'system' }
    case 'PROJECT_CODE':
      return { raw: project.code, source: 'system' }
    case 'TYPOLOGY_CODE': {
      const v = resolveCode('typology', element.typologyId, firm.id, overrides)
      const isOv = hasActiveOverride('typology', element.typologyId, firm.id, overrides)
      return { raw: v, source: isOv ? 'firm-override' : 'system' }
    }
    case 'FAMILY_CODE': {
      const v = resolveCode('element_type', element.elementTypeId, firm.id, overrides)
      const isOv = hasActiveOverride('element_type', element.elementTypeId, firm.id, overrides)
      return { raw: v, source: isOv ? 'firm-override' : 'system' }
    }
    case 'VARIANT_CODE':
      return { raw: element.variantCode ?? null, source: 'system' }
    case 'SIZE': {
      const fid = resolveSizeFormatId(element.typologyId, firm.id, overrides)
      const value = generateSize(fid, element.dimensions)
      return { raw: value || null, source: 'dimension' }
    }
    case 'SEQUENCE':
      return { raw: element.sequence, source: 'sequence' }
    case 'REVISION':
      return { raw: element.revision, source: 'revision' }
    default:
      return { raw: null, source: 'system' }
  }
}

function formatToken(
  cfg: NamingTokenConfig,
  rawValue: string | number | null,
  template: FirmNamingTemplate,
): string | null {
  if (rawValue == null || rawValue === '') return null

  let formatted: string
  if (cfg.token === 'SEQUENCE') {
    const padding = cfg.padding ?? template.sequencePadding ?? 3
    formatted = padLeft(Number(rawValue), padding)
  } else if (cfg.token === 'REVISION') {
    const n = Number(rawValue)
    if (n === 0 && !template.revisionZeroSuffix) {
      // hide R0
      return null
    }
    formatted = `${template.revisionPrefix}${n}`
  } else {
    formatted = String(rawValue)
  }

  if (cfg.prefix) formatted = cfg.prefix + formatted
  if (cfg.suffix) formatted = formatted + cfg.suffix
  if (template.uppercaseEnforce) formatted = formatted.toUpperCase()
  return formatted
}

export function resolveInstanceMark(args: ResolveInstanceArgs): NameResolutionResult {
  const { template } = args
  const warnings: string[] = []
  const trace: NameResolutionTrace[] = []

  const sortedTokens = [...template.tokens]
    .filter((t) => t.enabled)
    .sort((a, b) => a.order - b.order)

  if (sortedTokens.length === 0) {
    warnings.push('Template boş — en az 2 token gerekli.')
    return { instanceMark: '', trace, warnings }
  }

  const enabledTokenSet = new Set(sortedTokens.map((t) => t.token))
  if (!enabledTokenSet.has('FAMILY_CODE')) {
    warnings.push('FAMILY_CODE eksik; benzersizlik garantisi zayıf.')
  }
  if (!enabledTokenSet.has('SEQUENCE')) {
    warnings.push('SEQUENCE eksik; aynı tipte çakışma riski.')
  }

  const pieces: Array<{ token: NamingToken; formatted: string | null }> = []

  for (const cfg of sortedTokens) {
    const { raw, source } = resolveTokenValue(cfg.token, args)
    const formatted = formatToken(cfg, raw, template)
    trace.push({
      token: cfg.token,
      rawValue: raw,
      formatted,
      source,
      skipped: formatted == null,
    })
    pieces.push({ token: cfg.token, formatted })
  }

  const filled = pieces.filter((p) => p.formatted != null) as Array<{
    token: NamingToken
    formatted: string
  }>

  // Size-concat mantığı: FAMILY_CODE SIZE ardarda ise ayraçsız birleştir.
  if (template.sizeConcat) {
    const merged: string[] = []
    for (let i = 0; i < filled.length; i++) {
      const cur = filled[i]
      const prev = merged[merged.length - 1]
      const lastAdded = filled[i - 1]
      if (
        cur.token === 'SIZE' &&
        lastAdded &&
        (lastAdded.token === 'FAMILY_CODE' || lastAdded.token === 'TYPOLOGY_CODE')
      ) {
        merged[merged.length - 1] = prev + cur.formatted
      } else {
        merged.push(cur.formatted)
      }
    }
    return {
      instanceMark: merged.join(template.separator || '-'),
      trace,
      warnings,
    }
  }

  return {
    instanceMark: filled.map((p) => p.formatted).join(template.separator || '-'),
    trace,
    warnings,
  }
}
