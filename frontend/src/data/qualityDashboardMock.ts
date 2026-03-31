/**
 * qual-01 — Kalite dashboard mock (firma + fabrika bağlamı üst bardan).
 */

export type QualityKpiKey = 'samplesToday' | 'pendingTests' | 'outOfLimit' | 'reportsPending'

export type QualityKpiRow = {
  key: QualityKpiKey
  value: number
  unit?: string
}

/** P0 — KPI değerleri (sabit mock) */
export const QUALITY_DASHBOARD_KPIS: QualityKpiRow[] = [
  { key: 'samplesToday', value: 14, unit: '' },
  { key: 'pendingTests', value: 6, unit: '' },
  { key: 'outOfLimit', value: 2, unit: '' },
  { key: 'reportsPending', value: 3, unit: '' },
]

export type UrgentSeverity = 'critical' | 'high' | 'normal'

export type UrgentActionRow = {
  id: string
  severity: UrgentSeverity
  titleKey: string
  ref: string
  metaKey: string
}

/** P0 — acil aksiyonlar (5 satır) */
export const MOCK_URGENT_ACTIONS: UrgentActionRow[] = [
  {
    id: 'a1',
    severity: 'critical',
    titleKey: 'qualityDashboard.action.t1',
    ref: 'SL-2044',
    metaKey: 'qualityDashboard.action.m1',
  },
  {
    id: 'a2',
    severity: 'high',
    titleKey: 'qualityDashboard.action.t2',
    ref: 'BC-118',
    metaKey: 'qualityDashboard.action.m2',
  },
  {
    id: 'a3',
    severity: 'high',
    titleKey: 'qualityDashboard.action.t3',
    ref: 'RAP-03',
    metaKey: 'qualityDashboard.action.m3',
  },
  {
    id: 'a4',
    severity: 'normal',
    titleKey: 'qualityDashboard.action.t4',
    ref: 'NUM-8821',
    metaKey: 'qualityDashboard.action.m4',
  },
  {
    id: 'a5',
    severity: 'normal',
    titleKey: 'qualityDashboard.action.t5',
    ref: 'MES-KB',
    metaKey: 'qualityDashboard.action.m5',
  },
]

/** P2 — mini grafik yükseklikleri (%), 7 gün */
export const QUALITY_TREND_BARS_PCT = [42, 55, 48, 62, 58, 71, 65] as const
