/**
 * Genel planlama — genişletilmiş mock plan öğeleri (üretici).
 * Tüm proje kartları için çok sayıda ürün + birim planı üretilir.
 */
import { spanSlotsFromDurationForMode, type PlanStatusKey } from './planningDesignMock'
import {
  DISPATCH_MAX_PRODUCTS_PER_TRIP,
  type GeneralPlanItem,
  type PlanningUnitKey,
} from './generalPlanningMock'
import { projectManagementCardsMock } from './projectManagementCardsMock'

const ANCHOR = new Date('2026-03-24T00:00:00.000Z')

const PROD_MOLDS = ['M-01', 'M-02', 'M-03', 'M-04', 'M-05', 'M-06', 'M-07', 'M-08'] as const
const DISPATCH_VEHICLES = ['V-01', 'V-02', 'V-03', 'V-04', 'V-05', 'V-06', 'V-07', 'V-08'] as const
const ASSEMBLY_LINES = ['L-01', 'L-02', 'L-03', 'L-04', 'L-05', 'L-06'] as const

const PROD_STATUSES: PlanStatusKey[] = [
  'PLANNED',
  'ORDERED_DESIGN',
  'IN_PROGRESS',
  'PRODUCED_OK',
  'HOLD_UNCERTAIN',
  'ISSUE_REWORK',
]
const DISPATCH_STATUSES: PlanStatusKey[] = ['PLANNED', 'IN_PROGRESS', 'PRODUCED_OK', 'HOLD_UNCERTAIN']
const ASM_STATUSES: PlanStatusKey[] = ['PLANNED', 'IN_PROGRESS', 'PRODUCED_OK', 'HOLD_UNCERTAIN', 'ISSUE_REWORK']

const ELEMENT_DEFS = [
  { prefix: 'DW', label: 'duvar' },
  { prefix: 'PR', label: 'perde' },
  { prefix: 'K', label: 'kiriş' },
  { prefix: 'PL', label: 'döşeme' },
  { prefix: 'MR', label: 'merdiven' },
  { prefix: 'KL', label: 'kolon' },
  { prefix: 'PN', label: 'panel' },
  { prefix: 'OS', label: 'özel eleman' },
] as const

const RECIPES = ['RC-C30-01', 'RC-C35-02', 'RC-C40-01'] as const

/** Görünür hafta uzunluğu (PlanningTimelineView ile uyumlu). */
const VISIBLE_DAYS = 14
const SHIFTS_PER_DAY = 3

export type ProductSeed = {
  linkedProductId: string
  productId: string
  title: string
  projectId: string
  orderId: string
  volume: number
  steel: number
  recipe: string
}

function addDaysUtc(base: Date, days: number): Date {
  const d = new Date(base)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

function shiftSlot(
  dayOffset: number,
  shift: 0 | 1 | 2,
  durationHours = 8,
): Pick<GeneralPlanItem, 'startAt' | 'endAt' | 'durationHours'> {
  const start = addDaysUtc(ANCHOR, dayOffset)
  start.setUTCHours(shift === 0 ? 6 : shift === 1 ? 14 : 22, 0, 0, 0)
  const end = new Date(start.getTime() + durationHours * 3600000)
  return { startAt: start.toISOString(), endAt: end.toISOString(), durationHours }
}

function daySlot(
  dayOffset: number,
  durationHours = 24,
): Pick<GeneralPlanItem, 'startAt' | 'endAt' | 'durationHours'> {
  const start = addDaysUtc(ANCHOR, dayOffset)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start.getTime() + durationHours * 3600000)
  return { startAt: start.toISOString(), endAt: end.toISOString(), durationHours }
}

function item(
  partial: Omit<GeneralPlanItem, 'imageUrl' | 'tags' | 'warnings'> & {
    tags?: string[]
    warnings?: string[]
  },
): GeneralPlanItem {
  return {
    imageUrl: null,
    tags: [],
    warnings: [],
    ...partial,
  }
}

/** Proje başına ürün sayısı (mock — orta yoğunluk). */
function productCountForProject(projectIndex: number, status: string): number {
  const base = 4 + (projectIndex % 2)
  if (status === 'devam' || status === 'riskli') return base + 2
  if (status === 'tamamlandi') return base + 1
  return base
}

/** Tüm proje kartları için ürün tohumları. */
export function buildAllProductSeeds(): ProductSeed[] {
  const out: ProductSeed[] = []

  projectManagementCardsMock.forEach((project, projectIndex) => {
    const count = productCountForProject(projectIndex, project.status)
    for (let i = 0; i < count; i++) {
      const def = ELEMENT_DEFS[i % ELEMENT_DEFS.length]
      const serial = 100 + projectIndex * 30 + i
      const code = `${def.prefix}-${serial}`
      const vol = 5.5 + ((projectIndex * 7 + i * 3) % 20) * 0.85
      const steel = 380 + ((projectIndex + i) % 12) * 95
      out.push({
        linkedProductId: `PROD-${code}`,
        productId: `PROD-${code}`,
        title: `${code} ${def.label}`,
        projectId: project.code,
        orderId: `SO-${88400 + projectIndex * 100 + i}`,
        volume: Math.round(vol * 10) / 10,
        steel,
        recipe: RECIPES[(projectIndex + i) % RECIPES.length],
      })
    }
  })

  return out
}

const PRODUCTS: ProductSeed[] = buildAllProductSeeds()

type ShiftAllocation = {
  resourceId: string
  dayOffset: number
  shift: 0 | 1 | 2
  durationHours: number
}

type DayAllocation = {
  resourceId: string
  dayOffset: number
  durationHours: number
}

type ShiftSlotAllocator = {
  occupiedSlotCount: () => number
  totalCapacity: () => number
  allocate: (durationHours: number) => ShiftAllocation | null
}

type DaySlotAllocator = {
  occupiedSlotCount: () => number
  totalCapacity: () => number
  allocate: (durationHours: number) => DayAllocation | null
}

/** Vardiya modunda kaynak × slot çakışması olmadan yerleşim. */
function createShiftSlotAllocator(resourceIds: readonly string[]): ShiftSlotAllocator {
  const occupied = new Map<string, Set<number>>()

  const slotSpan = (durationHours: number) => spanSlotsFromDurationForMode(durationHours, true)

  const canPlace = (resourceId: string, start: number, span: number): boolean => {
    const used = occupied.get(resourceId)
    if (!used) return true
    for (let s = start; s < start + span; s++) {
      if (used.has(s)) return false
    }
    return true
  }

  const mark = (resourceId: string, start: number, span: number): void => {
    let used = occupied.get(resourceId)
    if (!used) {
      used = new Set()
      occupied.set(resourceId, used)
    }
    for (let s = start; s < start + span; s++) used.add(s)
  }

  return {
    occupiedSlotCount: () => {
      let n = 0
      for (const used of occupied.values()) n += used.size
      return n
    },
    totalCapacity: () => resourceIds.length * VISIBLE_DAYS * SHIFTS_PER_DAY,
    allocate: (durationHours: number): ShiftAllocation | null => {
      const span = slotSpan(durationHours)
      const maxStart = VISIBLE_DAYS * SHIFTS_PER_DAY - span
      if (maxStart < 0) return null

      for (let day = 0; day < VISIBLE_DAYS; day++) {
        for (let shift = 0; shift < SHIFTS_PER_DAY; shift++) {
          const start = day * SHIFTS_PER_DAY + shift
          if (start > maxStart) continue
          for (const resourceId of resourceIds) {
            if (!canPlace(resourceId, start, span)) continue
            mark(resourceId, start, span)
            return {
              resourceId,
              dayOffset: day,
              shift: shift as 0 | 1 | 2,
              durationHours,
            }
          }
        }
      }
      return null
    },
  }
}

/**
 * Sevkiyat: aynı kamyon + gün hücresine birden fazla ürün (karışmadan, yalnızca aynı araçta).
 * Yeni sefer yalnızca kapasite dolduğunda veya boş gün/araç bulunduğunda açılır.
 */
function createDispatchLoadAllocator(
  resourceIds: readonly string[],
  maxProductsPerTrip: number,
): DaySlotAllocator {
  const occupied = new Map<string, Set<number>>()
  const tripLoad = new Map<string, number>()

  const slotSpan = (durationHours: number) => spanSlotsFromDurationForMode(durationHours, false)
  const tripKey = (resourceId: string, dayStart: number) => `${resourceId}:${dayStart}`

  const canPlace = (resourceId: string, start: number, span: number): boolean => {
    const used = occupied.get(resourceId)
    if (!used) return true
    for (let s = start; s < start + span; s++) {
      if (used.has(s)) return false
    }
    return true
  }

  const mark = (resourceId: string, start: number, span: number): void => {
    let used = occupied.get(resourceId)
    if (!used) {
      used = new Set()
      occupied.set(resourceId, used)
    }
    for (let s = start; s < start + span; s++) used.add(s)
  }

  return {
    occupiedSlotCount: () => {
      let n = 0
      for (const used of occupied.values()) n += used.size
      return n
    },
    totalCapacity: () => resourceIds.length * VISIBLE_DAYS * SHIFTS_PER_DAY,
    allocate: (durationHours: number): DayAllocation | null => {
      const span = slotSpan(durationHours)
      const maxStart = VISIBLE_DAYS * SHIFTS_PER_DAY - span
      if (maxStart < 0) return null

      for (const [key, count] of tripLoad) {
        if (count >= maxProductsPerTrip) continue
        const colon = key.indexOf(':')
        const resourceId = key.slice(0, colon)
        const dayStart = Number(key.slice(colon + 1))
        const dayOffset = Math.floor(dayStart / SHIFTS_PER_DAY)
        tripLoad.set(key, count + 1)
        return { resourceId, dayOffset, durationHours }
      }

      for (let day = 0; day < VISIBLE_DAYS; day++) {
        const start = day * SHIFTS_PER_DAY
        if (start > maxStart) continue
        for (const resourceId of resourceIds) {
          if (!canPlace(resourceId, start, span)) continue
          mark(resourceId, start, span)
          tripLoad.set(tripKey(resourceId, start), 1)
          return { resourceId, dayOffset: day, durationHours }
        }
      }
      return null
    },
  }
}

/** Takvim doluluk hedefi — çok dolu / çok seyrek arasında denge. */
const FILL_RATIO_PRODUCTION = 0.44
const FILL_RATIO_SECONDARY = 0.38
const MAX_FILLER_PRODUCTION = 16
const MAX_FILLER_SECONDARY = 10

/** Üretimde tüm ürünler; diğer birimlerde her 2. ürün. */
const SCHEDULE_EVERY_NTH_SECONDARY = 2

function fillShiftSlots(
  alloc: ShiftSlotAllocator,
  targetRatio: number,
  pushRow: (row: GeneralPlanItem) => void,
  build: (slot: ShiftAllocation, fillerIndex: number) => GeneralPlanItem,
  maxFillers: number,
): void {
  const target = Math.floor(alloc.totalCapacity() * targetRatio)
  let fillerIndex = 0
  while (alloc.occupiedSlotCount() < target && fillerIndex < maxFillers) {
    const slot = alloc.allocate(8)
    if (!slot) break
    pushRow(build(slot, fillerIndex++))
  }
}

function fillDaySlots(
  alloc: DaySlotAllocator,
  targetRatio: number,
  pushRow: (row: GeneralPlanItem) => void,
  build: (slot: DayAllocation, fillerIndex: number) => GeneralPlanItem,
  maxFillers: number,
): void {
  const target = Math.floor(alloc.totalCapacity() * targetRatio)
  let fillerIndex = 0
  while (alloc.occupiedSlotCount() < target && fillerIndex < maxFillers) {
    const slot = alloc.allocate(24)
    if (!slot) break
    pushRow(build(slot, fillerIndex++))
  }
}

function productionDurationHours(index: number): number {
  return index % 8 === 0 ? 16 : 8
}

function dispatchDurationHours(index: number): number {
  return index % 10 === 0 ? 48 : 24
}

/** Genişletilmiş genel plan mock listesi — kaynak başına çakışmasız, dolu takvim. */
export function buildExpandedGeneralPlanItems(): GeneralPlanItem[] {
  const out: GeneralPlanItem[] = []
  let seq = 600

  const push = (row: GeneralPlanItem) => {
    out.push(row)
  }

  const productionAlloc = createShiftSlotAllocator(PROD_MOLDS)
  const planningAlloc = createShiftSlotAllocator(PROD_MOLDS)
  const dispatchAlloc = createDispatchLoadAllocator(
    DISPATCH_VEHICLES,
    DISPATCH_MAX_PRODUCTS_PER_TRIP,
  )
  const assemblyAlloc = createShiftSlotAllocator(ASSEMBLY_LINES)

  PRODUCTS.forEach((p, pi) => {
    const slot = productionAlloc.allocate(productionDurationHours(pi))
    if (!slot) return
    push(
      item({
        id: `GP-${seq++}-U`,
        unit: 'production',
        resourceId: slot.resourceId,
        linkedProductId: p.linkedProductId,
        title: p.title,
        productId: p.productId,
        ...shiftSlot(slot.dayOffset, slot.shift, slot.durationHours),
        status: PROD_STATUSES[pi % PROD_STATUSES.length],
        priority: (pi % 4) + 1,
        concreteRecipeId: p.recipe,
        estimatedVolumeM3: p.volume,
        estimatedSteelKg: p.steel,
        projectId: p.projectId,
        orderId: p.orderId,
        warnings: pi % 11 === 0 ? ['Kalıp rezervasyonu onaylandı (mock)'] : [],
      }),
    )
  })
  fillShiftSlots(productionAlloc, FILL_RATIO_PRODUCTION, push, (slot, fi) =>
    item({
      id: `GP-${seq++}-UF`,
      unit: 'production',
      resourceId: slot.resourceId,
      linkedProductId: `FILL-PROD-${fi}`,
      title: `Rezerve — ${slot.resourceId} G${slot.dayOffset + 1}`,
      productId: `FILL-PROD-${fi}`,
      ...shiftSlot(slot.dayOffset, slot.shift, slot.durationHours),
      status: 'PLANNED',
      priority: 3,
      concreteRecipeId: RECIPES[fi % RECIPES.length],
      estimatedVolumeM3: 8,
      estimatedSteelKg: 420,
      projectId: projectManagementCardsMock[fi % projectManagementCardsMock.length]?.code,
      orderId: `SO-FILL-${88000 + fi}`,
      tags: ['rezerve'],
    }),
    MAX_FILLER_PRODUCTION,
  )

  PRODUCTS.forEach((p, pi) => {
    if (pi % SCHEDULE_EVERY_NTH_SECONDARY !== 0) return
    const slot = planningAlloc.allocate(8)
    if (!slot) return
    push(
      item({
        id: `GP-${seq++}-P`,
        unit: 'planning',
        resourceId: slot.resourceId,
        linkedProductId: p.linkedProductId,
        title: `${p.title} — koordinasyon`,
        productId: p.productId,
        ...shiftSlot(slot.dayOffset, slot.shift, slot.durationHours),
        status: pi % 2 === 0 ? 'PLANNED' : 'ORDERED_DESIGN',
        priority: (pi % 4) + 1,
        concreteRecipeId: p.recipe,
        estimatedVolumeM3: p.volume,
        estimatedSteelKg: p.steel,
        projectId: p.projectId,
        orderId: p.orderId,
        tags: ['coord'],
      }),
    )
  })
  fillShiftSlots(planningAlloc, FILL_RATIO_SECONDARY, push, (slot, fi) =>
    item({
      id: `GP-${seq++}-PF`,
      unit: 'planning',
      resourceId: slot.resourceId,
      linkedProductId: `FILL-PLAN-${fi}`,
      title: `Slot rezervasyonu — ${slot.resourceId}`,
      productId: `FILL-PLAN-${fi}`,
      ...shiftSlot(slot.dayOffset, slot.shift, slot.durationHours),
      status: 'PLANNED',
      priority: 3,
      concreteRecipeId: RECIPES[fi % RECIPES.length],
      estimatedVolumeM3: 6,
      estimatedSteelKg: 300,
      projectId: projectManagementCardsMock[fi % projectManagementCardsMock.length]?.code,
      orderId: `SO-FILL-${88100 + fi}`,
      tags: ['coord', 'rezerve'],
    }),
    MAX_FILLER_SECONDARY,
  )

  PRODUCTS.forEach((p, pi) => {
    if (pi % SCHEDULE_EVERY_NTH_SECONDARY !== 0) return
    const dur = dispatchDurationHours(pi)
    const slot = dispatchAlloc.allocate(dur)
    if (!slot) return
    push(
      item({
        id: `GP-${seq++}-S`,
        unit: 'dispatch',
        resourceId: slot.resourceId,
        linkedProductId: p.linkedProductId,
        title: `${p.title} — sevkiyat`,
        productId: p.productId,
        ...daySlot(slot.dayOffset, slot.durationHours),
        status: DISPATCH_STATUSES[pi % DISPATCH_STATUSES.length],
        priority: (pi % 4) + 1,
        concreteRecipeId: p.recipe,
        estimatedVolumeM3: p.volume,
        estimatedSteelKg: 0,
        projectId: p.projectId,
        orderId: p.orderId,
        tags: ['dispatch'],
        warnings: pi % 7 === 0 ? ['Rampada bekleme riski'] : [],
      }),
    )
  })
  fillDaySlots(dispatchAlloc, FILL_RATIO_SECONDARY, push, (slot, fi) =>
    item({
      id: `GP-${seq++}-SF`,
      unit: 'dispatch',
      resourceId: slot.resourceId,
      linkedProductId: `FILL-SHIP-${fi}`,
      title: `Rampa rezervasyonu — ${slot.resourceId}`,
      productId: `FILL-SHIP-${fi}`,
      ...daySlot(slot.dayOffset, slot.durationHours),
      status: 'PLANNED',
      priority: 3,
      concreteRecipeId: RECIPES[fi % RECIPES.length],
      estimatedVolumeM3: 10,
      estimatedSteelKg: 0,
      projectId: projectManagementCardsMock[fi % projectManagementCardsMock.length]?.code,
      orderId: `SO-FILL-${88200 + fi}`,
      tags: ['dispatch', 'rezerve'],
    }),
    MAX_FILLER_SECONDARY,
  )

  PRODUCTS.forEach((p, pi) => {
    if (pi % SCHEDULE_EVERY_NTH_SECONDARY !== 0) return
    const dur = pi % 6 === 0 ? 16 : 8
    const slot = assemblyAlloc.allocate(dur)
    if (!slot) return
    push(
      item({
        id: `GP-${seq++}-M`,
        unit: 'assembly',
        resourceId: slot.resourceId,
        linkedProductId: p.linkedProductId,
        title: `${p.title} — montaj`,
        productId: p.productId,
        ...shiftSlot(slot.dayOffset, slot.shift, slot.durationHours),
        status: ASM_STATUSES[pi % ASM_STATUSES.length],
        priority: (pi % 4) + 1,
        concreteRecipeId: p.recipe,
        estimatedVolumeM3: p.volume,
        estimatedSteelKg: 0,
        projectId: p.projectId,
        orderId: p.orderId,
        tags: ['assembly'],
      }),
    )
  })
  fillShiftSlots(assemblyAlloc, FILL_RATIO_SECONDARY, push, (slot, fi) =>
    item({
      id: `GP-${seq++}-MF`,
      unit: 'assembly',
      resourceId: slot.resourceId,
      linkedProductId: `FILL-ASM-${fi}`,
      title: `Montaj penceresi — ${slot.resourceId}`,
      productId: `FILL-ASM-${fi}`,
      ...shiftSlot(slot.dayOffset, slot.shift, slot.durationHours),
      status: 'PLANNED',
      priority: 3,
      concreteRecipeId: RECIPES[fi % RECIPES.length],
      estimatedVolumeM3: 7,
      estimatedSteelKg: 0,
      projectId: projectManagementCardsMock[fi % projectManagementCardsMock.length]?.code,
      orderId: `SO-FILL-${88300 + fi}`,
      tags: ['assembly', 'rezerve'],
    }),
    MAX_FILLER_SECONDARY,
  )

  return out
}

export function unitItems(items: GeneralPlanItem[], unit: PlanningUnitKey): GeneralPlanItem[] {
  return items.filter((x) => x.unit === unit)
}
