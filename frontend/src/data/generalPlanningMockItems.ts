/**
 * Genel planlama — genişletilmiş mock plan öğeleri (üretici).
 * Tüm proje kartları için çok sayıda ürün + birim planı üretilir.
 */
import type { PlanStatusKey } from './planningDesignMock'
import type { GeneralPlanItem, PlanningUnitKey } from './generalPlanningMock'
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

const ASM_EXTRA_SUFFIXES = [
  ' — blok A',
  ' — blok B',
  ' — blok C',
  ' — vinç seti',
  ' — gece vardiyası',
  ' — revizyon',
  ' — saha 2',
  ' — tamamlayıcı',
  ' — öncelikli',
  ' — ikinci montaj',
  ' — cephe hattı',
  ' — iç avlu',
] as const

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

/** Proje başına ürün sayısı — duruma göre ağırlıklı. */
function productCountForProject(projectIndex: number, status: string): number {
  const base = 14 + (projectIndex % 4)
  if (status === 'devam' || status === 'riskli') return base + 6
  if (status === 'planlama') return base + 2
  if (status === 'tamamlandi') return base + 4
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

/** Genişletilmiş genel plan mock listesi */
export function buildExpandedGeneralPlanItems(): GeneralPlanItem[] {
  const out: GeneralPlanItem[] = []
  let seq = 600

  const push = (row: GeneralPlanItem) => {
    out.push(row)
  }

  // —— Üretim: her ürün + ek yük ——
  PRODUCTS.forEach((p, pi) => {
    const mold = PROD_MOLDS[pi % PROD_MOLDS.length]
    const dayOffset = pi % 12
    const shift = (pi % 3) as 0 | 1 | 2
    const dur = pi % 5 === 0 ? 16 : pi % 7 === 0 ? 24 : 8
    push(
      item({
        id: `GP-${seq++}-U`,
        unit: 'production',
        resourceId: mold,
        linkedProductId: p.linkedProductId,
        title: p.title,
        productId: p.productId,
        ...shiftSlot(dayOffset, shift, dur),
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

  // Proje bazlı ek üretim slotları
  projectManagementCardsMock.forEach((project, projectIndex) => {
    const projectProducts = PRODUCTS.filter((p) => p.projectId === project.code)
    const extraCount = 6 + (projectIndex % 5)
    for (let e = 0; e < extraCount; e++) {
      const p = projectProducts[e % projectProducts.length]
      if (!p) continue
      const mold = PROD_MOLDS[(projectIndex + e) % PROD_MOLDS.length]
      push(
        item({
          id: `GP-${seq++}-U`,
          unit: 'production',
          resourceId: mold,
          linkedProductId: p.linkedProductId,
          title: `${p.title} — ek döküm`,
          productId: p.productId,
          ...shiftSlot(1 + ((projectIndex + e) % 11), ((e + projectIndex) % 3) as 0 | 1 | 2, e % 4 === 0 ? 16 : 8),
          status: PROD_STATUSES[(projectIndex + e) % PROD_STATUSES.length],
          priority: ((projectIndex + e) % 3) + 1,
          concreteRecipeId: p.recipe,
          estimatedVolumeM3: p.volume * 0.85,
          estimatedSteelKg: p.steel,
          projectId: p.projectId,
          orderId: p.orderId,
          tags: ['ek-uretim'],
        }),
      )
    }
  })

  // —— Koordinasyon (planlama birimi): proje başına tüm ürünlerin ilk 10'u ——
  projectManagementCardsMock.forEach((project, projectIndex) => {
    const projectProducts = PRODUCTS.filter((p) => p.projectId === project.code)
    projectProducts.slice(0, 10).forEach((p, i) => {
      push(
        item({
          id: `GP-${seq++}-P`,
          unit: 'planning',
          resourceId: PROD_MOLDS[(projectIndex + i) % PROD_MOLDS.length],
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
  })

  // —— Sevkiyat: her ürün + proje başına ek sevkiyat ——
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

  projectManagementCardsMock.forEach((project, projectIndex) => {
    const projectProducts = PRODUCTS.filter((p) => p.projectId === project.code)
    const extraShip = 4 + (projectIndex % 4)
    for (let e = 0; e < extraShip; e++) {
      const p = projectProducts[e % projectProducts.length]
      if (!p) continue
      push(
        item({
          id: `GP-${seq++}-S`,
          unit: 'dispatch',
          resourceId: DISPATCH_VEHICLES[(projectIndex + e) % DISPATCH_VEHICLES.length],
          linkedProductId: p.linkedProductId,
          title: `${p.title} — ek sevkiyat`,
          productId: p.productId,
          ...daySlot(2 + ((projectIndex + e * 2) % 10), e % 2 === 0 ? 48 : 24),
          status: DISPATCH_STATUSES[(projectIndex + e) % DISPATCH_STATUSES.length],
          priority: ((projectIndex + e) % 4) + 1,
          concreteRecipeId: p.recipe,
          estimatedVolumeM3: p.volume,
          estimatedSteelKg: 0,
          projectId: p.projectId,
          orderId: p.orderId,
          tags: ['dispatch', 'ek-sevkiyat'],
          warnings: e % 3 === 0 ? ['Gece yükleme — rampa rezervasyonu'] : [],
        }),
      )
    }
  })

  // —— Montaj: her ürün için temel plan ——
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

  // —— Montaj: proje başına yoğun ek planlar (montaj planlama ekranı için) ——
  projectManagementCardsMock.forEach((project, projectIndex) => {
    const projectProducts = PRODUCTS.filter((p) => p.projectId === project.code)
    if (!projectProducts.length) return

    const statusBoost =
      project.status === 'devam' || project.status === 'riskli' ? 14 : project.status === 'tamamlandi' ? 8 : 10
    const extraAsm = statusBoost + (projectIndex % 5)

    for (let e = 0; e < extraAsm; e++) {
      const p = projectProducts[e % projectProducts.length]
      const suffix = ASM_EXTRA_SUFFIXES[e % ASM_EXTRA_SUFFIXES.length]
      const line = ASSEMBLY_LINES[(projectIndex + e) % ASSEMBLY_LINES.length]
      const dayOffset = (projectIndex % 3) + (e % 11)
      const shift = ((projectIndex + e) % 3) as 0 | 1 | 2
      const dur = e % 4 === 0 ? 16 : e % 6 === 0 ? 12 : 8
      const warnings: string[] = []
      if (project.status === 'riskli' && e % 4 === 0) {
        warnings.push('Hava koşulu — vinç penceresi dar')
      }
      if (e % 7 === 0) {
        warnings.push('Şantiye erişim onayı bekleniyor')
      }
      if (project.priority === 'kritik' && e % 5 === 0) {
        warnings.push('Kritik proje — öncelikli montaj')
      }

      push(
        item({
          id: `GP-${seq++}-M`,
          unit: 'assembly',
          resourceId: line,
          linkedProductId: `${p.linkedProductId}-ASM-${e}`,
          title: `${p.title}${suffix} — montaj`,
          productId: p.productId,
          ...shiftSlot(dayOffset, shift, dur),
          status: ASM_STATUSES[(projectIndex + e) % ASM_STATUSES.length],
          priority: project.priority === 'kritik' ? 1 : ((projectIndex + e) % 4) + 1,
          concreteRecipeId: p.recipe,
          estimatedVolumeM3: p.volume * (0.7 + (e % 5) * 0.06),
          estimatedSteelKg: 0,
          projectId: p.projectId,
          orderId: p.orderId,
          tags: ['assembly', 'ek-montaj'],
          warnings,
        }),
      )
    }

    // Aynı hatta üst üste binen ikinci vardiya (kapasite testi)
    for (let h = 0; h < 4; h++) {
      const p = projectProducts[(h * 3) % projectProducts.length]
      const line = ASSEMBLY_LINES[h % ASSEMBLY_LINES.length]
      push(
        item({
          id: `GP-${seq++}-M`,
          unit: 'assembly',
          resourceId: line,
          linkedProductId: `${p.linkedProductId}-HAT-${h}`,
          title: `${p.title} — hat ${h + 1} yoğunluk`,
          productId: p.productId,
          ...shiftSlot(3 + h, (h % 3) as 0 | 1 | 2, 8),
          status: 'IN_PROGRESS',
          priority: 2,
          concreteRecipeId: p.recipe,
          estimatedVolumeM3: p.volume,
          estimatedSteelKg: 0,
          projectId: p.projectId,
          orderId: p.orderId,
          tags: ['assembly', 'hat-yogun'],
        }),
      )
    }
  })

  return out
}

export function unitItems(items: GeneralPlanItem[], unit: PlanningUnitKey): GeneralPlanItem[] {
  return items.filter((x) => x.unit === unit)
}
