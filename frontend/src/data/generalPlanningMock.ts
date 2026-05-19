/**
 * Genel Planlama — çok birimli mock şema (ortak store)
 */
import {
  PLANNING_MOLDS,
  PLANNING_SHIFTS,
  type PlanStatusKey,
  type QueueItem,
} from './planningDesignMock'
import { buildExpandedGeneralPlanItems } from './generalPlanningMockItems'
import type { DispatchVehicleType } from './dispatchVehicleStyles'

export type PlanningUnitKey = 'planning' | 'production' | 'dispatch' | 'assembly'

export type PlanningResource = {
  resourceId: string
  name: string
  lineHint: string
  hatNo: number
  maxConcurrent: number
  /** Sevkiyat araç tipi (özet görünüm renkleri). */
  vehicleType?: DispatchVehicleType
}

export type PlanVisualTone = 'committed' | 'preview'

export type GeneralPlanItem = {
  id: string
  unit: PlanningUnitKey
  resourceId: string
  linkedProductId: string
  title: string
  productId: string
  imageUrl: string | null
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
  visualTone?: PlanVisualTone
}

/** Aynı kamyon + gün hücresinde üst üste planlanabilecek ürün sayısı üst sınırı. */
export const DISPATCH_MAX_PRODUCTS_PER_TRIP = 8

export const DISPATCH_RESOURCES: PlanningResource[] = [
  {
    resourceId: 'V-01',
    name: 'Tır 01 — Mamak',
    lineHint: 'ramp A',
    hatNo: 1,
    maxConcurrent: DISPATCH_MAX_PRODUCTS_PER_TRIP,
    vehicleType: 'tir',
  },
  {
    resourceId: 'V-02',
    name: 'Tır 02 — Mamak',
    lineHint: 'ramp A',
    hatNo: 1,
    maxConcurrent: DISPATCH_MAX_PRODUCTS_PER_TRIP,
    vehicleType: 'tir',
  },
  {
    resourceId: 'V-03',
    name: 'Kamyon 03',
    lineHint: 'ramp B',
    hatNo: 2,
    maxConcurrent: DISPATCH_MAX_PRODUCTS_PER_TRIP,
    vehicleType: 'kamyon',
  },
  {
    resourceId: 'V-04',
    name: 'Kamyon 04',
    lineHint: 'ramp B',
    hatNo: 2,
    maxConcurrent: DISPATCH_MAX_PRODUCTS_PER_TRIP,
    vehicleType: 'kamyon',
  },
  {
    resourceId: 'V-05',
    name: 'Lowbed 05',
    lineHint: 'ağır yük',
    hatNo: 3,
    maxConcurrent: DISPATCH_MAX_PRODUCTS_PER_TRIP,
    vehicleType: 'lowbed',
  },
  {
    resourceId: 'V-06',
    name: 'Tır 06 — Sincan',
    lineHint: 'ramp C',
    hatNo: 3,
    maxConcurrent: DISPATCH_MAX_PRODUCTS_PER_TRIP,
    vehicleType: 'tir',
  },
  {
    resourceId: 'V-07',
    name: 'Kamyon 07',
    lineHint: 'şehir içi',
    hatNo: 4,
    maxConcurrent: DISPATCH_MAX_PRODUCTS_PER_TRIP,
    vehicleType: 'kamyon',
  },
  {
    resourceId: 'V-08',
    name: 'Lowbed 08',
    lineHint: 'ağır yük',
    hatNo: 4,
    maxConcurrent: DISPATCH_MAX_PRODUCTS_PER_TRIP,
    vehicleType: 'lowbed',
  },
]

export const ASSEMBLY_RESOURCES: PlanningResource[] = [
  { resourceId: 'L-01', name: 'Montaj ekibi A', lineHint: 'şantiye 1', hatNo: 1, maxConcurrent: 2 },
  { resourceId: 'L-02', name: 'Montaj ekibi B', lineHint: 'şantiye 1', hatNo: 1, maxConcurrent: 2 },
  { resourceId: 'L-03', name: 'Vinç + ekip C', lineHint: 'şantiye 2', hatNo: 2, maxConcurrent: 1 },
  { resourceId: 'L-04', name: 'Vinç + ekip D', lineHint: 'şantiye 2', hatNo: 2, maxConcurrent: 1 },
  { resourceId: 'L-05', name: 'Montaj ekibi E', lineHint: 'şantiye 3', hatNo: 3, maxConcurrent: 2 },
  { resourceId: 'L-06', name: 'Vinç + ekip F', lineHint: 'şantiye 3', hatNo: 3, maxConcurrent: 1 },
]

export const PLANNING_COORD_RESOURCES: PlanningResource[] = PLANNING_MOLDS.map((m) => ({
  resourceId: m.moldId,
  name: m.name,
  lineHint: m.lineHint,
  hatNo: m.hatNo,
  maxConcurrent: m.maxConcurrent,
}))

export const PRODUCTION_RESOURCES: PlanningResource[] = PLANNING_COORD_RESOURCES

export function resourcesForUnit(unit: PlanningUnitKey): PlanningResource[] {
  switch (unit) {
    case 'planning':
      return PLANNING_COORD_RESOURCES
    case 'production':
      return PRODUCTION_RESOURCES
    case 'dispatch':
      return DISPATCH_RESOURCES
    case 'assembly':
      return ASSEMBLY_RESOURCES
    default:
      return PLANNING_COORD_RESOURCES
  }
}

export const GENERAL_PLAN_QUEUE: Record<PlanningUnitKey, QueueItem[]> = {
  planning: [
    { queueId: 'GQ-P-01', title: 'DW-210 — koordinasyon onayı', priority: 1, risk: 'orta' },
    { queueId: 'GQ-P-02', title: 'PR-15 — slot rezervasyonu', priority: 2, risk: 'düşük' },
    { queueId: 'GQ-P-03', title: 'PL-088 döşeme — hat 4', priority: 2, risk: 'düşük' },
    { queueId: 'GQ-P-04', title: 'K-55 kiriş — çelik onayı', priority: 1, risk: 'yüksek' },
    { queueId: 'GQ-P-05', title: 'DW-130 — yeni proje slotu', priority: 3, risk: 'orta' },
    { queueId: 'GQ-P-06', title: 'ÖZ-01 özel — mühendislik', priority: 4, risk: 'yüksek' },
  ],
  production: [
    { queueId: 'GQ-U-01', title: 'K-40 kiriş — hat 3', priority: 2, risk: 'düşük' },
    { queueId: 'GQ-U-02', title: 'PL-200 döşeme', priority: 3, risk: 'orta' },
    { queueId: 'GQ-U-03', title: 'DW-122 duvar — revizyon', priority: 2, risk: 'orta' },
    { queueId: 'GQ-U-04', title: 'PR-09 perde — öncelik', priority: 1, risk: 'yüksek' },
    { queueId: 'GQ-U-05', title: 'M-07 panel — uzun döküm', priority: 2, risk: 'düşük' },
    { queueId: 'GQ-U-06', title: 'K-55 kiriş seti', priority: 3, risk: 'orta' },
    { queueId: 'GQ-U-07', title: 'DW-130 duvar — hat 1', priority: 2, risk: 'düşük' },
    { queueId: 'GQ-U-08', title: 'PR-15 perde — C35', priority: 1, risk: 'yüksek' },
  ],
  dispatch: [
    { queueId: 'GQ-S-01', title: 'DW-210 sevkiyat paketi', priority: 1, risk: 'yüksek' },
    { queueId: 'GQ-S-02', title: 'PR-08 perde yükleme', priority: 2, risk: 'orta' },
    { queueId: 'GQ-S-03', title: 'PL-088 döşeme — lowbed', priority: 2, risk: 'orta' },
    { queueId: 'GQ-S-04', title: 'K-55 kiriş seti — tır', priority: 3, risk: 'düşük' },
    { queueId: 'GQ-S-05', title: 'DW-130 şantiye A', priority: 2, risk: 'düşük' },
    { queueId: 'GQ-S-06', title: 'ÖZ-01 özel — rampa B', priority: 1, risk: 'yüksek' },
    { queueId: 'GQ-S-07', title: 'PR-15 perde — gece çıkışı', priority: 2, risk: 'orta' },
  ],
  assembly: [
    { queueId: 'GQ-M-01', title: 'DW-210 montaj seti', priority: 2, risk: 'düşük' },
    { queueId: 'GQ-M-02', title: 'ÖZ-01 özel montaj', priority: 1, risk: 'yüksek' },
    { queueId: 'GQ-M-03', title: 'PL-200 döşeme — vinç', priority: 2, risk: 'orta' },
    { queueId: 'GQ-M-04', title: 'PR-08 perde — ekip C', priority: 2, risk: 'orta' },
    { queueId: 'GQ-M-05', title: 'K-40 kiriş — şantiye 2', priority: 3, risk: 'düşük' },
    { queueId: 'GQ-M-06', title: 'DW-122 montaj — revizyon', priority: 1, risk: 'yüksek' },
    { queueId: 'GQ-M-07', title: 'PR-15 montaj hattı', priority: 2, risk: 'orta' },
  ],
}

export const INITIAL_GENERAL_PLAN_ITEMS: GeneralPlanItem[] = buildExpandedGeneralPlanItems()

export const PLANNING_UNIT_LABEL_KEYS: Record<PlanningUnitKey, string> = {
  planning: 'generalPlanning.unit.planning',
  production: 'generalPlanning.unit.production',
  dispatch: 'generalPlanning.unit.dispatch',
  assembly: 'generalPlanning.unit.assembly',
}

export function linkedPlansForProduct(
  items: GeneralPlanItem[],
  linkedProductId: string,
): GeneralPlanItem[] {
  return items.filter((it) => it.linkedProductId === linkedProductId)
}

/** Sevkiyat, üretim bitişinden önce mi? (uyarı) */
export function crossUnitConsistencyWarnings(
  items: GeneralPlanItem[],
  linkedProductId: string,
): string[] {
  const related = linkedPlansForProduct(items, linkedProductId)
  const prod = related.find((x) => x.unit === 'production')
  const ship = related.find((x) => x.unit === 'dispatch')
  const out: string[] = []
  if (prod && ship && new Date(ship.startAt) < new Date(prod.endAt)) {
    out.push('Sevkiyat, üretim bitişinden önce planlanmış.')
  }
  const asm = related.find((x) => x.unit === 'assembly')
  if (ship && asm && new Date(asm.startAt) < new Date(ship.endAt)) {
    out.push('Montaj, sevkiyat bitişinden önce planlanmış.')
  }
  return out
}

export { PLANNING_SHIFTS }
