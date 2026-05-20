/**
 * Dashboard — Kalıp durumu widget mock (üretim bantları × kalıplar × anlık/planlı işlem).
 */

export type MoldOperationKey =
  | 'idle'
  | 'pouring'
  | 'curing'
  | 'mold_cleaning'
  | 'demolding'
  | 'qc_hold'
  | 'maintenance'
  | 'blocked'
  | 'scheduled'

export type ProductionBand = {
  id: string
  label: string
  factoryCode: string
}

export type MoldCell = {
  id: string
  label: string
  bandId: string
}

export type MoldOccupancy = {
  moldId: string
  operation: MoldOperationKey
  productCode?: string
  productName?: string
  orderNo?: string
  projectCode?: string
  /** Anlık görünüm — işlem başlangıç etiketi */
  sinceLabel?: string
  /** Planlı görünüm — vardiya slotu */
  slotLabel?: string
}

export type MoldStatusBandView = {
  band: ProductionBand
  molds: Array<MoldCell & { state: MoldOccupancy }>
}

export const PRODUCTION_BANDS: ProductionBand[] = [
  { id: 'L1', label: 'Hat A — Kalıphane', factoryCode: 'IST-HAD' },
  { id: 'L2', label: 'Hat B — Demir & panel', factoryCode: 'IST-HAD' },
  { id: 'L3', label: 'Hat C — Ağır eleman', factoryCode: 'KOC-01' },
]

export const MOLD_CELLS: MoldCell[] = [
  { id: 'm-a01', label: 'K-A01', bandId: 'L1' },
  { id: 'm-a02', label: 'K-A02', bandId: 'L1' },
  { id: 'm-a03', label: 'K-A03', bandId: 'L1' },
  { id: 'm-a04', label: 'K-A04', bandId: 'L1' },
  { id: 'm-b01', label: 'K-B01', bandId: 'L2' },
  { id: 'm-b02', label: 'K-B02', bandId: 'L2' },
  { id: 'm-b03', label: 'K-B03', bandId: 'L2' },
  { id: 'm-b04', label: 'K-B04', bandId: 'L2' },
  { id: 'm-c01', label: 'K-C01', bandId: 'L3' },
  { id: 'm-c02', label: 'K-C02', bandId: 'L3' },
  { id: 'm-c03', label: 'K-C03', bandId: 'L3' },
]

/** Anlık durum — bugün (mock sabit saat). */
const LIVE_BY_MOLD: Record<string, MoldOccupancy> = {
  'm-a01': {
    moldId: 'm-a01',
    operation: 'pouring',
    productCode: 'T12-KIRIS',
    productName: 'T kiriş 12m',
    orderNo: 'WO-884',
    projectCode: 'PRJ-2026-014',
    sinceLabel: '09:40',
  },
  'm-a02': {
    moldId: 'm-a02',
    operation: 'idle',
  },
  'm-a03': {
    moldId: 'm-a03',
    operation: 'curing',
    productCode: 'P40-PANEL',
    productName: 'Panel P-40',
    orderNo: 'WO-885',
    projectCode: 'PRJ-2026-014',
    sinceLabel: '10:15',
  },
  'm-a04': {
    moldId: 'm-a04',
    operation: 'mold_cleaning',
    productCode: 'SEG-M',
    productName: 'Segment M (son parça)',
    orderNo: 'WO-870',
    projectCode: 'PRJ-2025-088',
    sinceLabel: '11:20',
  },
  'm-b01': {
    moldId: 'm-b01',
    operation: 'demolding',
    productCode: 'D90-DUVAR',
    productName: 'Duvar D-90',
    orderNo: 'WO-890',
    projectCode: 'PRJ-2026-020',
    sinceLabel: '08:55',
  },
  'm-b02': {
    moldId: 'm-b02',
    operation: 'blocked',
    productCode: 'D90-DUVAR',
    productName: 'Duvar D-90 (yarım)',
    orderNo: 'WO-890',
    projectCode: 'PRJ-2026-020',
    sinceLabel: '08:12',
  },
  'm-b03': {
    moldId: 'm-b03',
    operation: 'qc_hold',
    productCode: 'P40-KOPYA',
    productName: 'Panel P-40 kopya',
    orderNo: 'WO-894',
    projectCode: 'PRJ-2026-011',
    sinceLabel: '07:30',
  },
  'm-b04': {
    moldId: 'm-b04',
    operation: 'idle',
  },
  'm-c01': {
    moldId: 'm-c01',
    operation: 'curing',
    productCode: 'K40-STD',
    productName: 'Kiriş K40 standart',
    orderNo: 'WO-892',
    projectCode: 'PRJ-2026-018',
    sinceLabel: '06:50',
  },
  'm-c02': {
    moldId: 'm-c02',
    operation: 'maintenance',
    sinceLabel: 'Dün 16:00',
  },
  'm-c03': {
    moldId: 'm-c03',
    operation: 'pouring',
    productCode: 'H12-HAT',
    productName: 'Hat elemanı H12',
    orderNo: 'WO-891',
    projectCode: 'PRJ-2026-014',
    sinceLabel: '11:05',
  },
}

/** Tarih bazlı plan — YYYY-MM-DD → kalıp doluluk */
const SCHEDULED_BY_DATE: Record<string, Record<string, MoldOccupancy>> = {
  '2026-05-20': LIVE_BY_MOLD,
  '2026-05-21': {
    'm-a01': {
      moldId: 'm-a01',
      operation: 'scheduled',
      productCode: 'T12-KIRIS',
      productName: 'T kiriş 12m',
      orderNo: 'WO-901',
      projectCode: 'PRJ-2026-014',
      slotLabel: '08–10',
    },
    'm-a02': {
      moldId: 'm-a02',
      operation: 'scheduled',
      productCode: 'K02-KONSOL',
      productName: 'Konsol K-02',
      orderNo: 'WO-902',
      projectCode: 'PRJ-2026-018',
      slotLabel: '10–12',
    },
    'm-a03': { moldId: 'm-a03', operation: 'idle' },
    'm-a04': {
      moldId: 'm-a04',
      operation: 'scheduled',
      productCode: 'P40-PANEL',
      productName: 'Panel P-40',
      orderNo: 'WO-903',
      projectCode: 'PRJ-2026-014',
      slotLabel: '14–16',
    },
    'm-b01': { moldId: 'm-b01', operation: 'idle' },
    'm-b02': {
      moldId: 'm-b02',
      operation: 'scheduled',
      productCode: 'D90-DUVAR',
      productName: 'Duvar D-90',
      orderNo: 'WO-904',
      projectCode: 'PRJ-2026-020',
      slotLabel: '08–10',
    },
    'm-b03': { moldId: 'm-b03', operation: 'idle' },
    'm-b04': {
      moldId: 'm-b04',
      operation: 'scheduled',
      productCode: 'P40-KOPYA',
      productName: 'Panel P-40 kopya',
      orderNo: 'WO-905',
      projectCode: 'PRJ-2026-011',
      slotLabel: '12–14',
    },
    'm-c01': {
      moldId: 'm-c01',
      operation: 'scheduled',
      productCode: 'K40-STD',
      productName: 'Kiriş K40',
      orderNo: 'WO-906',
      projectCode: 'PRJ-2026-018',
      slotLabel: '06–08',
    },
    'm-c02': { moldId: 'm-c02', operation: 'maintenance', sinceLabel: 'Planlı bakım' },
    'm-c03': {
      moldId: 'm-c03',
      operation: 'scheduled',
      productCode: 'H12-HAT',
      productName: 'Hat H12',
      orderNo: 'WO-907',
      projectCode: 'PRJ-2026-014',
      slotLabel: '10–12',
    },
  },
  '2026-05-22': {
    'm-a01': { moldId: 'm-a01', operation: 'idle' },
    'm-a02': {
      moldId: 'm-a02',
      operation: 'scheduled',
      productCode: 'SEG-M',
      productName: 'Segment M',
      orderNo: 'WO-910',
      projectCode: 'PRJ-2025-088',
      slotLabel: '08–10',
    },
    'm-a03': {
      moldId: 'm-a03',
      operation: 'scheduled',
      productCode: 'T12-KIRIS',
      productName: 'T kiriş 12m v2',
      orderNo: 'WO-911',
      projectCode: 'PRJ-2026-014',
      slotLabel: '10–12',
    },
    'm-a04': { moldId: 'm-a04', operation: 'idle' },
    'm-b01': {
      moldId: 'm-b01',
      operation: 'scheduled',
      productCode: 'P40-PANEL',
      productName: 'Panel P-40',
      orderNo: 'WO-912',
      projectCode: 'PRJ-2026-014',
      slotLabel: '14–16',
    },
    'm-b02': { moldId: 'm-b02', operation: 'idle' },
    'm-b03': { moldId: 'm-b03', operation: 'idle' },
    'm-b04': { moldId: 'm-b04', operation: 'idle' },
    'm-c01': { moldId: 'm-c01', operation: 'idle' },
    'm-c02': { moldId: 'm-c02', operation: 'idle' },
    'm-c03': {
      moldId: 'm-c03',
      operation: 'scheduled',
      productCode: 'K40-STD',
      productName: 'Kiriş K40',
      orderNo: 'WO-913',
      projectCode: 'PRJ-2026-018',
      slotLabel: '08–10',
    },
  },
}

export function todayIsoDate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isoAddDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Demo planlı günler — bugüne göre yarın ve öbür gün. */
const _today = todayIsoDate()
if (!SCHEDULED_BY_DATE[_today]) {
  SCHEDULED_BY_DATE[_today] = LIVE_BY_MOLD
}
const _tomorrow = isoAddDays(_today, 1)
const _dayAfter = isoAddDays(_today, 2)
if (!SCHEDULED_BY_DATE[_tomorrow] && SCHEDULED_BY_DATE['2026-05-21']) {
  SCHEDULED_BY_DATE[_tomorrow] = SCHEDULED_BY_DATE['2026-05-21']
}
if (!SCHEDULED_BY_DATE[_dayAfter] && SCHEDULED_BY_DATE['2026-05-22']) {
  SCHEDULED_BY_DATE[_dayAfter] = SCHEDULED_BY_DATE['2026-05-22']
}

export function isLiveDate(viewDate: string): boolean {
  return viewDate === todayIsoDate()
}

export function occupancyForDate(dateIso: string): Record<string, MoldOccupancy> {
  if (SCHEDULED_BY_DATE[dateIso]) return SCHEDULED_BY_DATE[dateIso]
  if (dateIso === todayIsoDate()) return LIVE_BY_MOLD
  return Object.fromEntries(
    MOLD_CELLS.map((m) => [m.id, { moldId: m.id, operation: 'idle' as const }]),
  )
}

export function buildMoldStatusView(options: {
  viewDate: string
  factoryCodes?: string[]
  bandFilter?: string
  showEmpty?: boolean
}): MoldStatusBandView[] {
  const { viewDate, factoryCodes, bandFilter, showEmpty = true } = options
  const occupancy = occupancyForDate(viewDate)
  const live = isLiveDate(viewDate)

  let bands = PRODUCTION_BANDS
  if (factoryCodes?.length) {
    bands = bands.filter((b) => factoryCodes.includes(b.factoryCode))
  }
  if (bandFilter && bandFilter !== 'all') {
    bands = bands.filter((b) => b.id === bandFilter)
  }

  return bands.map((band) => {
    const molds = MOLD_CELLS.filter((m) => m.bandId === band.id)
      .map((cell) => {
        const raw = occupancy[cell.id] ?? { moldId: cell.id, operation: 'idle' as const }
        const state: MoldOccupancy = live
          ? { ...raw, operation: raw.operation === 'scheduled' ? 'idle' : raw.operation }
          : raw.operation === 'idle' && raw.productCode
            ? { ...raw, operation: 'scheduled' }
            : raw
        return { ...cell, state }
      })
      .filter((m) => showEmpty || m.state.operation !== 'idle')

    return { band, molds }
  })
}
