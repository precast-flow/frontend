import type { PlanningUnitKey } from '../../../data/generalPlanningMock'
import { hourToShiftIndexUtc, PLANNING_SHIFTS, type PlanStatusKey } from '../../../data/planningDesignMock'
import type { PlanningProductionStage } from '../../../data/planningProductionStage'
import type { TimelineDisplayItem } from './planningTimelineTypes'

export type PlanningItemHoverPayload = {
  productCode: string
  productName: string
  projectName?: string
  planDate: string
  shiftLabel?: string
  statusKey: PlanStatusKey
  unit?: PlanningUnitKey
  productionStage?: PlanningProductionStage
  dispatchInfo?: string
  volumeM3?: number
  moldId?: string
  orderId?: string
  /** Çoklu ürün grubu (sevkiyat). */
  groupProducts?: { code: string; name: string }[]
}

function shiftLabelForItem(startAt: string): string | undefined {
  const hour = new Date(startAt).getUTCHours()
  const idx = hourToShiftIndexUtc(hour)
  return PLANNING_SHIFTS[idx]?.label
}

function formatPlanDate(iso: string, locale: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function buildPlanningItemHoverPayload(
  item: TimelineDisplayItem,
  locale: string,
  options?: {
    unit?: PlanningUnitKey
    groupItems?: TimelineDisplayItem[]
    moldName?: string
  },
): PlanningItemHoverPayload {
  const groupItems = options?.groupItems
  if (groupItems && groupItems.length > 1) {
    return {
      productCode: item.productId,
      productName: item.title,
      projectName: item.projectId,
      planDate: formatPlanDate(item.startAt, locale),
      shiftLabel: shiftLabelForItem(item.startAt),
      statusKey: item.status,
      unit: options?.unit ?? item.unit,
      dispatchInfo: options?.moldName ?? item.moldId,
      groupProducts: groupItems.map((g) => ({
        code: g.productId,
        name: g.title,
      })),
    }
  }

  return {
    productCode: item.productId,
    productName: item.title,
    projectName: item.projectId,
    planDate: formatPlanDate(item.startAt, locale),
    shiftLabel: shiftLabelForItem(item.startAt),
    statusKey: item.status,
    unit: options?.unit ?? item.unit,
    productionStage: item.productionStage,
    dispatchInfo:
      options?.unit === 'dispatch' || item.unit === 'dispatch'
        ? (options?.moldName ?? item.moldId)
        : undefined,
    volumeM3: item.estimatedVolumeM3,
    moldId: item.moldId,
    orderId: item.orderId,
  }
}
