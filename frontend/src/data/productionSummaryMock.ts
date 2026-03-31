/**
 * prod-01 — Üretim özet dashboard mock (8 KPI tutarlı tablo + kritik liste + haftalık seri).
 * Fabrika kapsamı UI’da FactoryContext ile süzülür (sayılar yer tutucu).
 */

export type ProductionKpiKey =
  | 'plannedToday'
  | 'inProduction'
  | 'delayed'
  | 'batchingQueue'
  | 'qcPending'
  | 'completedToday'
  | 'carryOverYesterday'
  | 'lineLoadPct'

export type ProductionKpiRow = {
  key: ProductionKpiKey
  label: string
  value: number
  unit: string
  hint: string
}

/** Vardiyaya göre çarpan (mock — sabah taban). */
export const SHIFT_FACTORS: Record<'morning' | 'evening' | 'night', number> = {
  morning: 1,
  evening: 0.92,
  night: 0.78,
}

/** Taban KPI — 8 satır tutarlı tablo (prod-01 MOCK). */
export const PRODUCTION_KPI_BASE: ProductionKpiRow[] = [
  {
    key: 'plannedToday',
    label: 'Bugün planlı emir',
    value: 14,
    unit: 'adet',
    hint: 'MES’e düşen günlük plan',
  },
  {
    key: 'inProduction',
    label: 'Üretimde',
    value: 6,
    unit: 'adet',
    hint: 'Hat üzerinde aktif',
  },
  {
    key: 'delayed',
    label: 'Geciken',
    value: 3,
    unit: 'adet',
    hint: 'Plan tarihi geçmiş',
  },
  {
    key: 'batchingQueue',
    label: 'Santralde bekleyen döküm',
    value: 2,
    unit: 'kuyruk',
    hint: 'Beton santral sırası',
  },
  {
    key: 'qcPending',
    label: 'Kalite bekleyen',
    value: 4,
    unit: 'adet',
    hint: 'Son kontrol kuyruğu (mock onaylı reçete)',
  },
  {
    key: 'completedToday',
    label: 'Bugün tamamlanan (şu ana)',
    value: 2,
    unit: 'adet',
    hint: 'Tamamlandı statüsü',
  },
  {
    key: 'carryOverYesterday',
    label: 'Dün tamamlanmayan',
    value: 2,
    unit: 'adet',
    hint: 'Gece vardiyasına devreden',
  },
  {
    key: 'lineLoadPct',
    label: 'Hat yükü (plan)',
    value: 87,
    unit: '%',
    hint: 'Kapasite kullanımı tahmini',
  },
]

export type CriticalRow = {
  id: string
  orderNo: string
  partName: string
  delayDays: number
  tag: 'dün kalan' | 'bugün kritik'
}

/** Dün tamamlanmayan + bugün kritik — en fazla 5 satır listesi. */
export const PRODUCTION_CRITICAL_ROWS: CriticalRow[] = [
  { id: 'c1', orderNo: 'WO-2025-1042', partName: 'Kiriş K-40/12', delayDays: 2, tag: 'dün kalan' },
  { id: 'c2', orderNo: 'WO-2025-1038', partName: 'Kolon C-50', delayDays: 1, tag: 'bugün kritik' },
  { id: 'c3', orderNo: 'WO-2025-1051', partName: 'Duvar paneli P-90', delayDays: 0, tag: 'bugün kritik' },
  { id: 'c4', orderNo: 'WO-2025-1029', partName: 'Trepez döşeme T-12', delayDays: 3, tag: 'dün kalan' },
  { id: 'c5', orderNo: 'WO-2025-1048', partName: 'İnce işçilik IM-2', delayDays: 1, tag: 'bugün kritik' },
]

/** P2 — Haftalık üretim (adet) sparkline için 7 nokta (mock). */
export const WEEKLY_OUTPUT_SERIES: number[] = [118, 132, 124, 140, 128, 135, 129]

/** P1 — Astların açık emir özeti (salt okunur, rapor hattı). */
export const MOCK_DIRECT_REPORTS_OPEN_ORDERS = {
  count: 4,
  note: 'Rapor zincirindeki astlara atanmış, henüz kapanmamış emirler (üst için izleme).',
}
