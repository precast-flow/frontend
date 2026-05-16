/**
 * Genel planlama — genişletilmiş mock plan öğeleri (üretici).
 */
import type { PlanStatusKey } from './planningDesignMock'
import type { GeneralPlanItem, PlanningUnitKey } from './generalPlanningMock'

const ANCHOR = new Date('2026-03-24T00:00:00.000Z')

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

type ProductSeed = {
  linkedProductId: string
  productId: string
  title: string
  projectId: string
  orderId: string
  volume: number
  steel: number
  recipe: string
}

const PRODUCTS: ProductSeed[] = [
  {
    linkedProductId: 'PROD-DW-120',
    productId: 'PROD-DW-120',
    title: 'DW-210 duvar',
    projectId: 'PRJ-2026-014',
    orderId: 'SO-88421',
    volume: 12.4,
    steel: 840,
    recipe: 'RC-C30-01',
  },
  {
    linkedProductId: 'PROD-PR-008',
    productId: 'PROD-PR-008',
    title: 'PR-08 perde',
    projectId: 'PRJ-2026-021',
    orderId: 'SO-88422',
    volume: 24.7,
    steel: 1620,
    recipe: 'RC-C35-02',
  },
  {
    linkedProductId: 'PROD-K-040',
    productId: 'PROD-K-040',
    title: 'K-40 kiriş',
    projectId: 'PRJ-2026-014',
    orderId: 'SO-88423',
    volume: 9.2,
    steel: 1110,
    recipe: 'RC-C30-01',
  },
  {
    linkedProductId: 'PROD-DW-121',
    productId: 'PROD-DW-121',
    title: 'DW-121 duvar',
    projectId: 'PRJ-2026-014',
    orderId: 'SO-88434',
    volume: 6.0,
    steel: 410,
    recipe: 'RC-C30-01',
  },
  {
    linkedProductId: 'PROD-PL-200',
    productId: 'PROD-PL-200',
    title: 'PL-200 döşeme',
    projectId: 'PRJ-2026-033',
    orderId: 'SO-88425',
    volume: 18.8,
    steel: 980,
    recipe: 'RC-C35-02',
  },
  {
    linkedProductId: 'PROD-OS-001',
    productId: 'PROD-OS-001',
    title: 'ÖZ-01 özel',
    projectId: 'PRJ-2026-055',
    orderId: 'SO-88428',
    volume: 7.6,
    steel: 680,
    recipe: 'RC-C40-01',
  },
  {
    linkedProductId: 'PROD-DW-122',
    productId: 'PROD-DW-122',
    title: 'DW-122 duvar',
    projectId: 'PRJ-2026-014',
    orderId: 'SO-88443',
    volume: 10.1,
    steel: 780,
    recipe: 'RC-C30-01',
  },
  {
    linkedProductId: 'PROD-PR-009',
    productId: 'PROD-PR-009',
    title: 'PR-09 perde',
    projectId: 'PRJ-2026-021',
    orderId: 'SO-88426',
    volume: 10.3,
    steel: 700,
    recipe: 'RC-C30-01',
  },
  {
    linkedProductId: 'PROD-K-055',
    productId: 'PROD-K-055',
    title: 'K-55 kiriş seti',
    projectId: 'PRJ-2026-018',
    orderId: 'SO-88431',
    volume: 14.2,
    steel: 1250,
    recipe: 'RC-C35-02',
  },
  {
    linkedProductId: 'PROD-PL-088',
    productId: 'PROD-PL-088',
    title: 'PL-088 döşeme',
    projectId: 'PRJ-2026-040',
    orderId: 'SO-88437',
    volume: 16.5,
    steel: 890,
    recipe: 'RC-C35-02',
  },
  {
    linkedProductId: 'PROD-DW-130',
    productId: 'PROD-DW-130',
    title: 'DW-130 duvar',
    projectId: 'PRJ-2026-062',
    orderId: 'SO-88451',
    volume: 11.0,
    steel: 720,
    recipe: 'RC-C30-01',
  },
  {
    linkedProductId: 'PROD-PR-015',
    productId: 'PROD-PR-015',
    title: 'PR-15 perde',
    projectId: 'PRJ-2026-068',
    orderId: 'SO-88455',
    volume: 22.1,
    steel: 1480,
    recipe: 'RC-C35-02',
  },
]

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

/** Genişletilmiş genel plan mock listesi */
export function buildExpandedGeneralPlanItems(): GeneralPlanItem[] {
  const out: GeneralPlanItem[] = []
  let seq = 600

  const push = (row: GeneralPlanItem) => {
    out.push(row)
  }

  // —— Üretim: kalıplar × günler ——
  PRODUCTS.forEach((p, pi) => {
    const mold = PROD_MOLDS[pi % PROD_MOLDS.length]
    const dayOffset = pi % 12
    const shift = (pi % 3) as 0 | 1 | 2
    const dur = pi % 5 === 0 ? 16 : pi % 7 === 0 ? 24 : 8
    const slot = shiftSlot(dayOffset, shift, dur)
    push(
      item({
        id: `GP-${seq++}-U`,
        unit: 'production',
        resourceId: mold,
        linkedProductId: p.linkedProductId,
        title: p.title,
        productId: p.productId,
        ...slot,
        status: PROD_STATUSES[pi % PROD_STATUSES.length],
        priority: (pi % 4) + 1,
        concreteRecipeId: p.recipe,
        estimatedVolumeM3: p.volume,
        estimatedSteelKg: p.steel,
        projectId: p.projectId,
        orderId: p.orderId,
        warnings: pi % 9 === 0 ? ['Kalıp yoğunluğu (mock)'] : [],
      }),
    )
  })

  // Ek üretim yükü (çakışmayan slotlar)
  const extraProd: Array<{
    mold: (typeof PROD_MOLDS)[number]
    day: number
    shift: 0 | 1 | 2
    p: ProductSeed
    status: PlanStatusKey
  }> = [
    { mold: 'M-01', day: 1, shift: 0, p: PRODUCTS[0], status: 'IN_PROGRESS' },
    { mold: 'M-02', day: 2, shift: 1, p: PRODUCTS[3], status: 'PLANNED' },
    { mold: 'M-03', day: 3, shift: 0, p: PRODUCTS[1], status: 'ORDERED_DESIGN' },
    { mold: 'M-04', day: 4, shift: 2, p: PRODUCTS[7], status: 'PRODUCED_OK' },
    { mold: 'M-05', day: 5, shift: 0, p: PRODUCTS[2], status: 'IN_PROGRESS' },
    { mold: 'M-06', day: 6, shift: 1, p: PRODUCTS[8], status: 'PLANNED' },
    { mold: 'M-07', day: 7, shift: 0, p: PRODUCTS[4], status: 'PLANNED' },
    { mold: 'M-08', day: 8, shift: 1, p: PRODUCTS[5], status: 'HOLD_UNCERTAIN' },
    { mold: 'M-01', day: 9, shift: 2, p: PRODUCTS[10], status: 'PLANNED' },
    { mold: 'M-03', day: 10, shift: 0, p: PRODUCTS[11], status: 'IN_PROGRESS' },
  ]
  extraProd.forEach((e, i) => {
    push(
      item({
        id: `GP-${seq++}-U`,
        unit: 'production',
        resourceId: e.mold,
        linkedProductId: e.p.linkedProductId,
        title: e.p.title,
        productId: e.p.productId,
        ...shiftSlot(e.day, e.shift, i % 3 === 0 ? 16 : 8),
        status: e.status,
        priority: (i % 3) + 1,
        concreteRecipeId: e.p.recipe,
        estimatedVolumeM3: e.p.volume,
        estimatedSteelKg: e.p.steel,
        projectId: e.p.projectId,
        orderId: e.p.orderId,
      }),
    )
  })

  // —— Koordinasyon (planlama birimi) ——
  PRODUCTS.slice(0, 8).forEach((p, i) => {
    push(
      item({
        id: `GP-${seq++}-P`,
        unit: 'planning',
        resourceId: PROD_MOLDS[i % PROD_MOLDS.length],
        linkedProductId: p.linkedProductId,
        title: `${p.title} — koordinasyon`,
        productId: p.productId,
        ...shiftSlot(i % 8, (i % 3) as 0 | 1 | 2),
        status: i % 2 === 0 ? 'PLANNED' : 'ORDERED_DESIGN',
        priority: (i % 4) + 1,
        concreteRecipeId: p.recipe,
        estimatedVolumeM3: p.volume,
        estimatedSteelKg: p.steel,
        projectId: p.projectId,
        orderId: p.orderId,
        tags: ['coord'],
      }),
    )
  })

  // —— Sevkiyat: gün bazlı ——
  PRODUCTS.forEach((p, pi) => {
    const vehicle = DISPATCH_VEHICLES[pi % DISPATCH_VEHICLES.length]
    const dayOffset = 1 + (pi % 11)
    const spanDays = pi % 4 === 0 ? 48 : 24
    push(
      item({
        id: `GP-${seq++}-S`,
        unit: 'dispatch',
        resourceId: vehicle,
        linkedProductId: p.linkedProductId,
        title: `${p.title} — sevkiyat`,
        productId: p.productId,
        ...daySlot(dayOffset, spanDays),
        status: DISPATCH_STATUSES[pi % DISPATCH_STATUSES.length],
        priority: (pi % 4) + 1,
        concreteRecipeId: p.recipe,
        estimatedVolumeM3: p.volume,
        estimatedSteelKg: 0,
        projectId: p.projectId,
        orderId: p.orderId,
        tags: ['dispatch'],
        warnings: pi % 6 === 0 ? ['Rampada bekleme riski'] : [],
      }),
    )
  })

  // —— Montaj ——
  PRODUCTS.forEach((p, pi) => {
    const line = ASSEMBLY_LINES[pi % ASSEMBLY_LINES.length]
    const dayOffset = 2 + (pi % 10)
    const shift = (pi % 3) as 0 | 1 | 2
    const dur = pi % 5 === 0 ? 16 : 8
    push(
      item({
        id: `GP-${seq++}-M`,
        unit: 'assembly',
        resourceId: line,
        linkedProductId: p.linkedProductId,
        title: `${p.title} — montaj`,
        productId: p.productId,
        ...shiftSlot(dayOffset, shift, dur),
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

  return out
}

export function unitItems(items: GeneralPlanItem[], unit: PlanningUnitKey): GeneralPlanItem[] {
  return items.filter((x) => x.unit === unit)
}
