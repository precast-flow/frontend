/**
 * Planlama / Tasarım — mock şema (plan-01…plan-08 ile uyumlu)
 */

export type PlanStatusKey =
  | 'PLANNED'
  | 'ORDERED_DESIGN'
  | 'IN_PROGRESS'
  | 'PRODUCED_OK'
  | 'HOLD_UNCERTAIN'
  | 'ISSUE_REWORK'
  | 'CANCELLED'
  | 'SCRAP'

export type PlanningDay = {
  id: string
  date: string
  weekdayShort: string
  isNonProduction: boolean
}

export type PlanningShift = { id: string; label: string; order: number }

export type PlanningMold = {
  moldId: string
  name: string
  lineHint: string
  hatNo: number
  maxConcurrent: number
}

export type PlanItem = {
  id: string
  title: string
  productId: string
  imageUrl: string | null
  moldId: string
  startAt: string
  endAt: string
  durationHours: number
  status: PlanStatusKey
  priority: number
  concreteRecipeId: string
  estimatedVolumeM3: number
  estimatedSteelKg: number
  projectId?: string
  orderId?: string
  tags: string[]
  warnings: string[]
}

export type QueueItem = {
  queueId: string
  title: string
  priority: number
  risk: 'düşük' | 'orta' | 'yüksek'
}

export const PLANNING_SHIFTS: PlanningShift[] = [
  { id: 'v1', label: 'Sabah', order: 1 },
  { id: 'v2', label: 'Öğle', order: 2 },
  { id: 'v3', label: 'Gece', order: 3 },
]

export const PLANNING_MOLDS: PlanningMold[] = [
  { moldId: 'M-01', name: 'Duvar A1', lineHint: 'eşzamanlı 1', hatNo: 1, maxConcurrent: 1 },
  { moldId: 'M-02', name: 'Duvar A2', lineHint: 'eşzamanlı 1', hatNo: 1, maxConcurrent: 1 },
  { moldId: 'M-03', name: 'Perde P1', lineHint: 'eşzamanlı 1', hatNo: 2, maxConcurrent: 1 },
  { moldId: 'M-04', name: 'Perde P2', lineHint: 'eşzamanlı 1', hatNo: 2, maxConcurrent: 1 },
  { moldId: 'M-05', name: 'Kiriş K1', lineHint: 'eşzamanlı 1', hatNo: 3, maxConcurrent: 1 },
  { moldId: 'M-06', name: 'Kiriş K2', lineHint: 'eşzamanlı 1', hatNo: 3, maxConcurrent: 1 },
  { moldId: 'M-07', name: 'Panel PL1', lineHint: 'eşzamanlı 1', hatNo: 4, maxConcurrent: 1 },
  { moldId: 'M-08', name: 'Panel PL2', lineHint: 'eşzamanlı 1', hatNo: 4, maxConcurrent: 1 },
]

const TR_WD = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

function startOfDayUtc(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function addDaysUtc(d: Date, n: number): Date {
  const x = new Date(d)
  x.setUTCDate(x.getUTCDate() + n)
  return x
}

/** Pazartesi ile hizalı hafta başlangıcı (UTC). */
export function mondayOfWeekUtc(d: Date): Date {
  const s = startOfDayUtc(d)
  const dow = s.getUTCDay() // 0 Sun .. 6 Sat
  const delta = dow === 0 ? -6 : 1 - dow
  return addDaysUtc(s, delta)
}

export function buildWeekDays(weekStartMonday: Date): PlanningDay[] {
  return buildNDays(weekStartMonday, 7)
}

/** Ardışık N gün (plan-09: uzun ufuk). */
export function buildNDays(weekStartMonday: Date, n: number): PlanningDay[] {
  const out: PlanningDay[] = []
  for (let i = 0; i < n; i++) {
    const d = addDaysUtc(weekStartMonday, i)
    const iso = d.toISOString().slice(0, 10)
    const wd = d.getUTCDay()
    const isWeekend = wd === 0 || wd === 6
    const isHoliday = iso === '2026-03-25'
    out.push({
      id: `day-${iso}`,
      date: iso,
      weekdayShort: TR_WD[wd] ?? '',
      isNonProduction: isWeekend || isHoliday,
    })
  }
  return out
}

/** plan-09 — zoom presetleri (mock tablo ile uyumlu). */
export const ZOOM_PRESETS = [
  {
    presetId: 'near',
    label: 'Yakın',
    approxVisibleDays: 7,
    minShiftColumnPx: 52,
    dayCount: 7,
    zoom: 78,
    notes: 'Tek hafta, geniş hücre',
  },
  {
    presetId: 'standard',
    label: 'Standart',
    approxVisibleDays: 14,
    minShiftColumnPx: 40,
    dayCount: 14,
    zoom: 55,
    notes: '~2 hafta',
  },
  {
    presetId: 'wide',
    label: 'Geniş',
    approxVisibleDays: 21,
    minShiftColumnPx: 36,
    dayCount: 21,
    zoom: 42,
    notes: '~3 hafta',
  },
  {
    presetId: 'month',
    label: 'Çok geniş (ay)',
    approxVisibleDays: 45,
    minShiftColumnPx: 28,
    dayCount: 45,
    zoom: 28,
    notes: 'Kompakt sütun, uzun ufuk',
  },
  {
    presetId: 'ultra',
    label: 'Ultra kompakt',
    approxVisibleDays: 60,
    minShiftColumnPx: 24,
    dayCount: 60,
    zoom: 22,
    notes: '60 güne kadar (mock)',
  },
] as const

/** 06–14 → 0, 14–22 → 1, diğer → 2 (UTC). */
export function hourToShiftIndexUtc(h: number): number {
  if (h >= 6 && h < 14) return 0
  if (h >= 14 && h < 22) return 1
  return 2
}

export function slotIndexFromIso(iso: string, weekStartMonday: Date, numDays: number): number {
  const t = new Date(iso)
  const ws = startOfDayUtc(weekStartMonday)
  const ts = startOfDayUtc(t)
  const dayIdx = Math.round((ts.getTime() - ws.getTime()) / 86400000)
  if (dayIdx < 0 || dayIdx >= numDays) return -1
  const shift = hourToShiftIndexUtc(t.getUTCHours())
  return dayIdx * PLANNING_SHIFTS.length + shift
}

export function isoFromSlot(
  weekStartMonday: Date,
  slotIndex: number,
  numDays: number,
): { startAt: string; endAt: string; durationHours: number } {
  const shifts = PLANNING_SHIFTS.length
  const dayIdx = Math.floor(slotIndex / shifts)
  const shift = slotIndex % shifts
  if (dayIdx < 0 || dayIdx >= numDays) {
    const fallback = addDaysUtc(weekStartMonday, 0)
    const h = shift === 0 ? 6 : shift === 1 ? 14 : 22
    const start = new Date(
      Date.UTC(fallback.getUTCFullYear(), fallback.getUTCMonth(), fallback.getUTCDate(), h, 0, 0),
    )
    const end = new Date(start.getTime() + 8 * 3600000)
    return { startAt: start.toISOString(), endAt: end.toISOString(), durationHours: 8 }
  }
  const day = addDaysUtc(weekStartMonday, dayIdx)
  const h = shift === 0 ? 6 : shift === 1 ? 14 : 22
  const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, 0, 0))
  const end = new Date(start.getTime() + 8 * 3600000)
  return { startAt: start.toISOString(), endAt: end.toISOString(), durationHours: 8 }
}

/** Görünür gün listesi (iş günleri filtresi dahil) ile slot → ISO zaman. */
export function isoFromSlotVisible(
  visibleDays: PlanningDay[],
  slotIndex: number,
): { startAt: string; endAt: string; durationHours: number } {
  const shifts = PLANNING_SHIFTS.length
  const dayIdx = Math.floor(slotIndex / shifts)
  const shift = slotIndex % shifts
  const day = visibleDays[dayIdx]
  if (!day) {
    const now = new Date()
    return { startAt: now.toISOString(), endAt: now.toISOString(), durationHours: 8 }
  }
  const [y, m, dNum] = day.date.split('-').map(Number)
  const h = shift === 0 ? 6 : shift === 1 ? 14 : 22
  const start = new Date(Date.UTC(y, m - 1, dNum, h, 0, 0))
  const end = new Date(start.getTime() + 8 * 3600000)
  return { startAt: start.toISOString(), endAt: end.toISOString(), durationHours: 8 }
}

export function spanSlotsFromDuration(durationHours: number): number {
  return Math.max(1, Math.ceil(durationHours / 8))
}

export function itemsOverlapSlotRange(
  aStart: number,
  aSpan: number,
  bStart: number,
  bSpan: number,
): boolean {
  const aEnd = aStart + aSpan
  const bEnd = bStart + bSpan
  return aStart < bEnd && bStart < aEnd
}

/**
 * Aynı kalıpta **aynı başlangıç slotuna** (aynı hücreye) düşen birden fazla iş için dikey katman.
 * Slot aralığı örtüşmesi (uzun süreli iş) ile katman vermiyoruz: aksi halde çok günlük tek iş,
 * sonraki günlerdeki hücrelerle “örtüşüyor” sayılıp kartlar yan yana değil merdiven gibi düşüyordu.
 */
export function computeStackLayers(
  items: { id: string; slotStart: number; span: number }[],
): Map<string, number> {
  const bySlot = new Map<number, { id: string; slotStart: number; span: number }[]>()
  for (const it of items) {
    const list = bySlot.get(it.slotStart) ?? []
    list.push(it)
    bySlot.set(it.slotStart, list)
  }
  const layerOf = new Map<string, number>()
  for (const [, group] of bySlot) {
    const sorted = [...group].sort((a, b) => a.id.localeCompare(b.id))
    sorted.forEach((it, idx) => layerOf.set(it.id, idx))
  }
  return layerOf
}

export const STATUS_META: Record<
  PlanStatusKey,
  { label: string; borderClass: string; bgClass: string; icon: string }
> = {
  PLANNED: {
    label: 'Planlandı',
    borderClass: 'border-l-slate-500',
    bgClass: 'bg-slate-50/80 dark:bg-slate-950/40',
    icon: 'calendar',
  },
  ORDERED_DESIGN: {
    label: 'Emir / tasarım',
    borderClass: 'border-l-amber-400',
    bgClass: 'bg-amber-50/70 dark:bg-amber-950/30',
    icon: 'blueprint',
  },
  IN_PROGRESS: {
    label: 'Üretimde',
    borderClass: 'border-l-sky-600',
    bgClass: 'bg-sky-50/70 dark:bg-sky-950/30',
    icon: 'play',
  },
  PRODUCED_OK: {
    label: 'Tamamlandı',
    borderClass: 'border-l-emerald-600',
    bgClass: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    icon: 'check',
  },
  HOLD_UNCERTAIN: {
    label: 'Beklemede',
    borderClass: 'border-l-orange-500',
    bgClass: 'bg-orange-50/60 dark:bg-orange-950/25',
    icon: 'pause',
  },
  ISSUE_REWORK: {
    label: 'Sorun / rework',
    borderClass: 'border-l-gray-800 ring-1 ring-orange-400/50',
    bgClass: 'bg-gray-100 dark:bg-gray-900/80',
    icon: 'wrench',
  },
  CANCELLED: {
    label: 'İptal',
    borderClass: 'border-l-red-600',
    bgClass: 'bg-red-50/50 dark:bg-red-950/20',
    icon: 'x',
  },
  SCRAP: {
    label: 'Hurda',
    borderClass: 'border-l-red-700',
    bgClass: 'bg-red-50/60 dark:bg-red-950/25',
    icon: 'trash',
  },
}

export const INITIAL_PLAN_ITEMS: PlanItem[] = [
  {
    id: 'P-501',
    title: 'DW-210 duvar paneli',
    productId: 'PROD-DW-120',
    imageUrl: null,
    moldId: 'M-01',
    startAt: '2026-03-24T06:00:00.000Z',
    endAt: '2026-03-24T14:00:00.000Z',
    durationHours: 8,
    status: 'PLANNED',
    priority: 2,
    concreteRecipeId: 'RC-C30-01',
    estimatedVolumeM3: 12.4,
    estimatedSteelKg: 840,
    projectId: 'PRJ-2026-014',
    orderId: 'SO-88421',
    tags: ['vibration', 'QC-A'],
    warnings: [],
  },
  {
    id: 'P-502',
    title: 'PR-08 perde',
    productId: 'PROD-PR-008',
    imageUrl: null,
    moldId: 'M-03',
    startAt: '2026-03-24T06:00:00.000Z',
    endAt: '2026-03-25T14:00:00.000Z',
    durationHours: 32,
    status: 'ORDERED_DESIGN',
    priority: 1,
    concreteRecipeId: 'RC-C35-02',
    estimatedVolumeM3: 24.7,
    estimatedSteelKg: 1620,
    projectId: 'PRJ-2026-021',
    orderId: 'SO-88422',
    tags: ['priority-low'],
    warnings: [],
  },
  {
    id: 'P-503',
    title: 'K-40 kiriş',
    productId: 'PROD-K-040',
    imageUrl: null,
    moldId: 'M-05',
    startAt: '2026-03-24T14:00:00.000Z',
    endAt: '2026-03-24T22:00:00.000Z',
    durationHours: 8,
    status: 'IN_PROGRESS',
    priority: 3,
    concreteRecipeId: 'RC-C30-01',
    estimatedVolumeM3: 9.2,
    estimatedSteelKg: 1110,
    projectId: 'PRJ-2026-014',
    orderId: 'SO-88423',
    tags: ['steel-intensive'],
    warnings: [],
  },
  {
    id: 'P-504',
    title: 'DW-121 duvar',
    productId: 'PROD-DW-121',
    imageUrl: null,
    moldId: 'M-01',
    startAt: '2026-03-24T14:00:00.000Z',
    endAt: '2026-03-24T18:00:00.000Z',
    durationHours: 4,
    status: 'PLANNED',
    priority: 2,
    concreteRecipeId: 'RC-C30-01',
    estimatedVolumeM3: 6.0,
    estimatedSteelKg: 410,
    projectId: 'PRJ-2026-014',
    orderId: 'SO-88434',
    tags: [],
    warnings: ['Kalıp çakışması (mock)'],
  },
  {
    id: 'P-505',
    title: 'PL-200 döşeme',
    productId: 'PROD-PL-200',
    imageUrl: null,
    moldId: 'M-07',
    startAt: '2026-03-25T06:00:00.000Z',
    endAt: '2026-03-26T06:00:00.000Z',
    durationHours: 24,
    status: 'PLANNED',
    priority: 2,
    concreteRecipeId: 'RC-C35-02',
    estimatedVolumeM3: 18.8,
    estimatedSteelKg: 980,
    projectId: 'PRJ-2026-033',
    orderId: 'SO-88425',
    tags: ['floor'],
    warnings: [],
  },
  {
    id: 'P-506',
    title: 'ÖZ-01 özel',
    productId: 'PROD-OS-001',
    imageUrl: null,
    moldId: 'M-08',
    startAt: '2026-03-27T06:00:00.000Z',
    endAt: '2026-03-27T18:00:00.000Z',
    durationHours: 12,
    status: 'HOLD_UNCERTAIN',
    priority: 4,
    concreteRecipeId: 'RC-C40-01',
    estimatedVolumeM3: 7.6,
    estimatedSteelKg: 680,
    projectId: 'PRJ-2026-055',
    orderId: 'SO-88428',
    tags: ['special'],
    warnings: [],
  },
  {
    id: 'P-507',
    title: 'DW-122 duvar',
    productId: 'PROD-DW-122',
    imageUrl: null,
    moldId: 'M-02',
    startAt: '2026-03-28T06:00:00.000Z',
    endAt: '2026-03-28T14:00:00.000Z',
    durationHours: 8,
    status: 'ISSUE_REWORK',
    priority: 4,
    concreteRecipeId: 'RC-C30-01',
    estimatedVolumeM3: 10.1,
    estimatedSteelKg: 780,
    projectId: 'PRJ-2026-014',
    orderId: 'SO-88443',
    tags: ['rework'],
    warnings: [],
  },
  {
    id: 'P-508',
    title: 'PR-09 perde',
    productId: 'PROD-PR-009',
    imageUrl: null,
    moldId: 'M-04',
    startAt: '2026-03-25T14:00:00.000Z',
    endAt: '2026-03-25T22:00:00.000Z',
    durationHours: 8,
    status: 'PRODUCED_OK',
    priority: 2,
    concreteRecipeId: 'RC-C30-01',
    estimatedVolumeM3: 10.3,
    estimatedSteelKg: 700,
    projectId: 'PRJ-2026-021',
    orderId: 'SO-88426',
    tags: [],
    warnings: [],
  },
]

export const QUEUE_MOCK: QueueItem[] = [
  { queueId: 'Q-001', title: 'DW-210 duvar — hat A', priority: 2, risk: 'düşük' },
  { queueId: 'Q-002', title: 'PR-15 perde — öncelikli', priority: 1, risk: 'yüksek' },
  { queueId: 'Q-003', title: 'K-55 kiriş seti', priority: 3, risk: 'orta' },
  { queueId: 'Q-004', title: 'PL-88 döşeme — müşteri X', priority: 2, risk: 'düşük' },
  { queueId: 'Q-005', title: 'ÖZ-12 özel eleman', priority: 4, risk: 'yüksek' },
  { queueId: 'Q-006', title: 'DW-211 duvar — revizyon', priority: 2, risk: 'orta' },
  { queueId: 'Q-007', title: 'D-40 döşeme tipi B', priority: 3, risk: 'düşük' },
  { queueId: 'Q-008', title: 'PR-16 perde — çelik yoğun', priority: 1, risk: 'yüksek' },
]

export const CONCRETE_RECIPES_MOCK = [
  { recipeId: 'RC-C25-01', label: 'C25 Hazır', strengthClass: 'C25' },
  { recipeId: 'RC-C30-01', label: 'C30 Standart', strengthClass: 'C30' },
  { recipeId: 'RC-C35-02', label: 'C35 Hızlı', strengthClass: 'C35' },
  { recipeId: 'RC-C40-01', label: 'C40 Yüksek', strengthClass: 'C40' },
  { recipeId: 'RC-PL-50-01', label: 'Perde özel', strengthClass: 'C50' },
  { recipeId: 'RC-QC-01', label: 'QC onaylı', strengthClass: 'C30' },
]
