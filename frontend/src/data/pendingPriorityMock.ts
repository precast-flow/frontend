/**
 * prod-04 — Bekleyen iş / öncelik kuyruğu mock (15 satır).
 */

export type TermRisk = 'high' | 'med' | 'low'

export type Urgency = 'normal' | 'acil' | 'kritik'

export type DelayReasonCode =
  | ''
  | 'malzeme'
  | 'kalip'
  | 'personel'
  | 'santral'
  | 'qc'
  | 'diger'

export type PendingPriorityRow = {
  id: string
  rank: number
  orderNo: string
  part: string
  waitingDays: number
  termRisk: TermRisk
  /** 0–100 mock öncelik skoru */
  suggestedScore: number
  lineLabel: string
  project: string
  urgency: Urgency
  delayReason: DelayReasonCode
}

export const DELAY_REASON_OPTIONS: { value: DelayReasonCode; label: string }[] = [
  { value: '', label: '— Seçilmedi —' },
  { value: 'malzeme', label: 'Malzeme gecikmesi' },
  { value: 'kalip', label: 'Kalıp / hat' },
  { value: 'personel', label: 'Personel / vardiya' },
  { value: 'santral', label: 'Santral / beton' },
  { value: 'qc', label: 'Kalite bekleme' },
  { value: 'diger', label: 'Diğer' },
]

/** 15 satır — tutarlı örnek set */
export const PENDING_PRIORITY_SEED: PendingPriorityRow[] = [
  { id: 'p1', rank: 1, orderNo: 'WO-901', part: 'K-40 gövde', waitingDays: 0, termRisk: 'high', suggestedScore: 94, lineLabel: 'Hat A', project: 'PRJ-2026-014', urgency: 'kritik', delayReason: '' },
  { id: 'p2', rank: 2, orderNo: 'WO-898', part: 'Panel P-90', waitingDays: 1, termRisk: 'high', suggestedScore: 91, lineLabel: 'Hat A', project: 'PRJ-2026-014', urgency: 'acil', delayReason: 'kalip' },
  { id: 'p3', rank: 3, orderNo: 'WO-885', part: 'Panel P-40', waitingDays: 2, termRisk: 'med', suggestedScore: 88, lineLabel: 'Hat A', project: 'PRJ-2026-014', urgency: 'acil', delayReason: 'qc' },
  { id: 'p4', rank: 4, orderNo: 'WO-892', part: 'Kiriş K-40', waitingDays: 1, termRisk: 'med', suggestedScore: 82, lineLabel: 'Hat B', project: 'PRJ-2026-022', urgency: 'normal', delayReason: '' },
  { id: 'p5', rank: 5, orderNo: 'WO-894', part: 'P40 kopya', waitingDays: 3, termRisk: 'high', suggestedScore: 80, lineLabel: 'Hat A', project: 'PRJ-2026-014', urgency: 'normal', delayReason: 'qc' },
  { id: 'p6', rank: 6, orderNo: 'WO-891', part: 'Hat H-12', waitingDays: 4, termRisk: 'med', suggestedScore: 76, lineLabel: 'Hat A', project: 'PRJ-2026-014', urgency: 'acil', delayReason: 'malzeme' },
  { id: 'p7', rank: 7, orderNo: 'WO-887', part: 'Segment S-02', waitingDays: 2, termRisk: 'low', suggestedScore: 71, lineLabel: 'Hat B', project: 'PRJ-2026-019', urgency: 'normal', delayReason: '' },
  { id: 'p8', rank: 8, orderNo: 'WO-888', part: 'Konsol mini', waitingDays: 5, termRisk: 'med', suggestedScore: 68, lineLabel: 'Hat B', project: 'PRJ-2026-018', urgency: 'normal', delayReason: 'personel' },
  { id: 'p9', rank: 9, orderNo: 'WO-889', part: 'Trepez T-08', waitingDays: 1, termRisk: 'low', suggestedScore: 65, lineLabel: 'Hat B', project: 'PRJ-2026-019', urgency: 'normal', delayReason: '' },
  { id: 'p10', rank: 10, orderNo: 'WO-890', part: 'Duvar D-90', waitingDays: 6, termRisk: 'high', suggestedScore: 62, lineLabel: 'Hat A', project: 'PRJ-2026-020', urgency: 'kritik', delayReason: 'kalip' },
  { id: 'p11', rank: 11, orderNo: 'WO-895', part: 'PS-1 özel', waitingDays: 2, termRisk: 'med', suggestedScore: 58, lineLabel: 'Hat B', project: 'PRJ-2026-025', urgency: 'acil', delayReason: 'santral' },
  { id: 'p12', rank: 12, orderNo: 'WO-896', part: 'Panel P-20', waitingDays: 3, termRisk: 'low', suggestedScore: 52, lineLabel: 'Hat A', project: 'PRJ-2026-021', urgency: 'normal', delayReason: '' },
  { id: 'p13', rank: 13, orderNo: 'WO-897', part: 'Kolon C-50', waitingDays: 4, termRisk: 'low', suggestedScore: 48, lineLabel: 'Hat B', project: 'PRJ-2026-021', urgency: 'normal', delayReason: 'diger' },
  { id: 'p14', rank: 14, orderNo: 'WO-899', part: 'Döşeme D-12', waitingDays: 7, termRisk: 'med', suggestedScore: 44, lineLabel: 'Hat A', project: 'PRJ-2025-088', urgency: 'normal', delayReason: 'malzeme' },
  { id: 'p15', rank: 15, orderNo: 'WO-900', part: 'Yard ön iz', waitingDays: 8, termRisk: 'low', suggestedScore: 38, lineLabel: 'Hat B', project: 'PRJ-2025-088', urgency: 'normal', delayReason: '' },
]

export function termRiskLabel(tr: TermRisk): string {
  if (tr === 'high') return 'Yüksek'
  if (tr === 'med') return 'Orta'
  return 'Düşük'
}

export function termRiskClass(tr: TermRisk): string {
  if (tr === 'high') return 'bg-gray-700 text-gray-50 dark:bg-gray-600'
  if (tr === 'med') return 'bg-gray-400 text-gray-900 dark:bg-gray-500 dark:text-gray-50'
  return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
}

export function urgencyLabel(u: Urgency): string {
  if (u === 'kritik') return 'Kritik'
  if (u === 'acil') return 'Acil'
  return 'Normal'
}
