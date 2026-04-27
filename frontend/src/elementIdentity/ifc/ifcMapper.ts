import { IFC_MAPPING_RULES } from '../catalog/ifcMappingRules'
import type { IfcMappingRule } from '../types'
import type { RawIfcRecord } from './mockIfcData'

export type MappedIfcResult = {
  record: RawIfcRecord
  matched: boolean
  elementTypeId: string | null
  typologyId: string | null
  confidence: 'high' | 'medium' | 'low' | 'unmapped'
  matchedRuleId: string | null
  reason: string
}

/** Kural önceliği: daha yüksek priority kazanır; ObjectType eşleşmesi her zaman tercih edilir. */
function findRule(record: RawIfcRecord): IfcMappingRule | null {
  const candidates = IFC_MAPPING_RULES.filter((r) => r.ifcClass === record.ifcClass)
  const exact = candidates.filter(
    (r) =>
      r.ifcPredefinedType === record.ifcPredefinedType &&
      (r.ifcObjectType == null || r.ifcObjectType === record.ifcObjectType),
  )
  if (exact.length === 0) return null
  // ObjectType eşleşen daha yüksek öncelik
  exact.sort((a, b) => b.priority - a.priority)
  // Prefer exact ObjectType
  const withObj = exact.find((r) => r.ifcObjectType && r.ifcObjectType === record.ifcObjectType)
  return withObj ?? exact[0]
}

export function mapIfcRecord(record: RawIfcRecord): MappedIfcResult {
  const rule = findRule(record)
  if (!rule) {
    return {
      record,
      matched: false,
      elementTypeId: null,
      typologyId: null,
      confidence: 'unmapped',
      matchedRuleId: null,
      reason: `${record.ifcClass}/${record.ifcPredefinedType}${record.ifcObjectType ? `:${record.ifcObjectType}` : ''} için kural bulunamadı.`,
    }
  }

  // Confidence: USERDEFINED + ObjectType veya spesifik PredefinedType → high,
  // FLOOR/SOLIDWALL/BEAM gibi default heuristik gerektirenler → medium
  let confidence: MappedIfcResult['confidence'] = 'high'
  if (rule.heuristic) confidence = 'medium'
  if (record.ifcPredefinedType === 'NOTDEFINED') confidence = 'low'

  return {
    record,
    matched: true,
    elementTypeId: rule.systemElementTypeId,
    typologyId: rule.systemTypologyId ?? null,
    confidence,
    matchedRuleId: rule.id,
    reason: rule.heuristic
      ? `Heuristik ${rule.heuristic} ile eşlendi (kullanıcı doğrulaması önerilir).`
      : 'Doğrudan IFC kuralı ile eşlendi.',
  }
}

export function mapIfcBatch(records: RawIfcRecord[]): MappedIfcResult[] {
  return records.map(mapIfcRecord)
}
