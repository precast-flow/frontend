/**
 * firm-06 — Kaydet öncesi değişiklik özeti (mock).
 */

export type ChangeRow = {
  id: string
  fieldKey: string
  before: string
  after: string
}

export type FactoryChangeRow = {
  id: string
  summaryKey: string
}

/** Örnek diff — vardiya satırı dahil (uyarı bandı tetiklenir) */
export const MOCK_PENDING_CHANGES: ChangeRow[] = [
  {
    id: 'c1',
    fieldKey: 'firmChange.field.shiftPolicy',
    before: 'İki vardiya',
    after: 'Üç vardiya',
  },
  {
    id: 'c2',
    fieldKey: 'firmChange.field.defaultFactory',
    before: 'IST-HAD',
    after: 'KOC-01',
  },
  {
    id: 'c3',
    fieldKey: 'firmChange.field.weekend',
    before: 'Kapalı',
    after: 'Açık',
  },
]

export const MOCK_FACTORY_CHANGES: FactoryChangeRow[] = [
  { id: 'f1', summaryKey: 'firmChange.factorySummary.shiftIst' },
  { id: 'f2', summaryKey: 'firmChange.factorySummary.moldK9' },
  { id: 'f3', summaryKey: 'firmChange.factorySummary.workerEmre' },
]

export function changesIncludeShiftPolicy(rows: ChangeRow[]): boolean {
  return rows.some((r) => r.fieldKey === 'firmChange.field.shiftPolicy' && r.before !== r.after)
}
