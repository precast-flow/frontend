import type { ProjectProduct } from '../elementIdentity/types'
import {
  ASSEMBLY_RESOURCES,
  DISPATCH_MAX_PRODUCTS_PER_TRIP,
  DISPATCH_RESOURCES,
  PRODUCTION_RESOURCES,
  type GeneralPlanItem,
  type PlanningUnitKey,
} from '../data/generalPlanningMock'
import {
  buildNDays,
  isoFromSlotVisibleForMode,
  mondayOfWeekUtc,
  spanSlotsFromDurationForMode,
  type PlanningDay,
} from '../data/planningDesignMock'

const DEFAULT_DURATION_HOURS = 8
const DEFAULT_RECIPE = 'RC-C30-01'

export type ProjectPlanWizardKind = 'project-production' | 'project-dispatch' | 'project-assembly'

export type ProductionPreviewInput = {
  kind: 'project-production'
  products: ProjectProduct[]
  projectCode: string
  factoryByProductId: Record<string, string>
  startDayIso: string
  weekStartMonday: Date
  visibleDayCount?: number
}

export type DispatchPreviewInput = {
  kind: 'project-dispatch'
  products: ProjectProduct[]
  projectCode: string
  startDayIso: string
  weekStartMonday: Date
  maxProductsPerTrip?: number
  visibleDayCount?: number
}

export type AssemblyPreviewInput = {
  kind: 'project-assembly'
  products: ProjectProduct[]
  projectCode: string
  startDayIso: string
  weekStartMonday: Date
  visibleDayCount?: number
}

export type PlanPreviewInput = ProductionPreviewInput | DispatchPreviewInput | AssemblyPreviewInput

function buildVisibleDays(weekStartMonday: Date, count: number): PlanningDay[] {
  return buildNDays(weekStartMonday, count)
}

function dayIndexFromIso(visibleDays: PlanningDay[], dayIso: string): number {
  const idx = visibleDays.findIndex((d) => d.date === dayIso)
  return idx >= 0 ? idx : 0
}

function slotForDayShift(dayIdx: number, shiftIndex = 0): number {
  return dayIdx * 3 + shiftIndex
}

function coordinatorTitle(product: ProjectProduct, projectCode: string): string {
  return `${product.code} — ${product.name} · ${projectCode}`
}

function baseItemFields(
  product: ProjectProduct,
  projectCode: string,
  unit: PlanningUnitKey,
  resourceId: string,
  startAt: string,
  endAt: string,
): Omit<GeneralPlanItem, 'id'> {
  const vol = product.volumeM3 ?? 8
  return {
    unit,
    resourceId,
    linkedProductId: product.id,
    title: coordinatorTitle(product, projectCode),
    productId: product.id,
    imageUrl: null,
    startAt,
    endAt,
    durationHours: DEFAULT_DURATION_HOURS,
    status: 'PLANNED',
    priority: 2,
    concreteRecipeId: DEFAULT_RECIPE,
    estimatedVolumeM3: vol,
    estimatedSteelKg: Math.round(vol * 85),
    projectId: projectCode,
    orderId: `SO-${product.code}`,
    tags: ['preview', 'from-project'],
    warnings: [],
    visualTone: 'preview',
  }
}

export function buildProductionPreviewItems(input: ProductionPreviewInput): GeneralPlanItem[] {
  const dayCount = input.visibleDayCount ?? 14
  const visibleDays = buildVisibleDays(input.weekStartMonday, dayCount)
  const useShifts = true
  const startDayIdx = dayIndexFromIso(visibleDays, input.startDayIso)
  const resources = PRODUCTION_RESOURCES

  return input.products.map((product, index) => {
    const dayOffset = Math.floor(index / resources.length)
    const resource = resources[(startDayIdx + dayOffset) % resources.length]!
    const slot = slotForDayShift(Math.min(startDayIdx + dayOffset, visibleDays.length - 1), index % 3)
    const { startAt, endAt } = isoFromSlotVisibleForMode(visibleDays, slot, useShifts)
    const factoryCode = input.factoryByProductId[product.id] ?? 'FAB-01'
    return {
      id: `preview-prod-${product.id}-${index}`,
      ...baseItemFields(product, input.projectCode, 'production', resource.resourceId, startAt, endAt),
      title: `${coordinatorTitle(product, input.projectCode)} · ${factoryCode}`,
    }
  })
}

export function buildDispatchPreviewItems(input: DispatchPreviewInput): GeneralPlanItem[] {
  const dayCount = input.visibleDayCount ?? 14
  const visibleDays = buildVisibleDays(input.weekStartMonday, dayCount)
  const useShifts = false
  const maxPerTrip = input.maxProductsPerTrip ?? DISPATCH_MAX_PRODUCTS_PER_TRIP
  const startDayIdx = dayIndexFromIso(visibleDays, input.startDayIso)
  const vehicles = DISPATCH_RESOURCES
  const out: GeneralPlanItem[] = []

  const trips: ProjectProduct[][] = []
  for (let i = 0; i < input.products.length; i += maxPerTrip) {
    trips.push(input.products.slice(i, i + maxPerTrip))
  }

  trips.forEach((tripProducts, tripIndex) => {
    const vehicle = vehicles[tripIndex % vehicles.length]!
    const dayIdx = Math.min(startDayIdx + tripIndex, visibleDays.length - 1)
    const slot = slotForDayShift(dayIdx, 0)
    const { startAt, endAt } = isoFromSlotVisibleForMode(visibleDays, slot, useShifts)
    tripProducts.forEach((product, productIndex) => {
      out.push({
        id: `preview-dispatch-${product.id}-${tripIndex}-${productIndex}`,
        ...baseItemFields(product, input.projectCode, 'dispatch', vehicle.resourceId, startAt, endAt),
      })
    })
  })

  return out
}

export function buildAssemblyPreviewItems(input: AssemblyPreviewInput): GeneralPlanItem[] {
  const dayCount = input.visibleDayCount ?? 14
  const visibleDays = buildVisibleDays(input.weekStartMonday, dayCount)
  const useShifts = true
  const startDayIdx = dayIndexFromIso(visibleDays, input.startDayIso)
  const lines = ASSEMBLY_RESOURCES

  return input.products.map((product, index) => {
    const dayOffset = Math.floor(index / lines.length)
    const line = lines[(index + startDayIdx) % lines.length]!
    const slot = slotForDayShift(Math.min(startDayIdx + dayOffset, visibleDays.length - 1), index % 3)
    const { startAt, endAt } = isoFromSlotVisibleForMode(visibleDays, slot, useShifts)
    return {
      id: `preview-asm-${product.id}-${index}`,
      ...baseItemFields(product, input.projectCode, 'assembly', line.resourceId, startAt, endAt),
    }
  })
}

export function buildPlanPreviewItems(input: PlanPreviewInput): GeneralPlanItem[] {
  switch (input.kind) {
    case 'project-production':
      return buildProductionPreviewItems(input)
    case 'project-dispatch':
      return buildDispatchPreviewItems(input)
    case 'project-assembly':
      return buildAssemblyPreviewItems(input)
    default:
      return []
  }
}

export function weekStartForDayIso(dayIso: string): Date {
  const d = new Date(`${dayIso}T12:00:00.000Z`)
  return mondayOfWeekUtc(d)
}

export function unitForWizardKind(kind: ProjectPlanWizardKind): PlanningUnitKey {
  switch (kind) {
    case 'project-production':
      return 'production'
    case 'project-dispatch':
      return 'dispatch'
    case 'project-assembly':
      return 'assembly'
    default:
      return 'production'
  }
}

export function moduleIdForWizardKind(kind: ProjectPlanWizardKind): string {
  switch (kind) {
    case 'project-production':
      return 'production-planning'
    case 'project-dispatch':
      return 'dispatch-planning'
    case 'project-assembly':
      return 'general-planning'
    default:
      return 'general-planning'
  }
}

export function spanSlotsForPreview(durationHours: number, timelineUsesShifts: boolean): number {
  return spanSlotsFromDurationForMode(durationHours, timelineUsesShifts)
}
