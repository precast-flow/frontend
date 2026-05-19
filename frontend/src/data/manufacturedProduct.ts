import type { QueueItem } from './planningDesignMock'

export const MANUFACTURED_PRODUCT_WAIT_DAYS = 3

export type ManufacturedProduct = {
  id: string
  productionWorkQueueId: string
  dailyReportId: string
  reportNo: string
  factoryCode: string
  projectCode: string
  projectName: string
  productCode: string
  productName: string
  productionOrderNo: string
  productionCompletedAt: string
  eligibleShipAt: string
  warehouseLabel: string
  queueTitle: string
}

export function manufacturedProductId(productionWorkQueueId: string): string {
  return `mp-${productionWorkQueueId}`
}

export function addCalendarDaysUtc(iso: string, days: number): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString()
}

export function computeEligibleShipAt(productionCompletedAt: string): string {
  return addCalendarDaysUtc(productionCompletedAt, MANUFACTURED_PRODUCT_WAIT_DAYS)
}

export function isManufacturedProductReady(
  product: ManufacturedProduct,
  now: Date = new Date(),
): boolean {
  return now.getTime() >= Date.parse(product.eligibleShipAt)
}

export function buildManufacturedProduct(input: {
  productionWorkQueueId: string
  dailyReportId: string
  reportNo: string
  factoryCode: string
  projectCode: string
  projectName: string
  productCode: string
  productName: string
  productionOrderNo: string
  productionCompletedAt: string
  warehouseLabel: string
}): ManufacturedProduct {
  const title = `${input.productCode} — ${input.productName} · ${input.reportNo}`
  return {
    id: manufacturedProductId(input.productionWorkQueueId),
    productionWorkQueueId: input.productionWorkQueueId,
    dailyReportId: input.dailyReportId,
    reportNo: input.reportNo,
    factoryCode: input.factoryCode,
    projectCode: input.projectCode,
    projectName: input.projectName,
    productCode: input.productCode,
    productName: input.productName,
    productionOrderNo: input.productionOrderNo,
    productionCompletedAt: input.productionCompletedAt,
    eligibleShipAt: computeEligibleShipAt(input.productionCompletedAt),
    warehouseLabel: input.warehouseLabel,
    queueTitle: title,
  }
}

export function manufacturedProductToQueueItem(
  product: ManufacturedProduct,
  unit: 'dispatch' | 'assembly',
): QueueItem & {
  manufacturedProductId: string
  reportNo: string
  eligibleShipAt: string
  ready: boolean
} {
  const ready = isManufacturedProductReady(product)
  const suffix =
    unit === 'dispatch'
      ? ready
        ? ' — sevkiyata hazır'
        : ' — üretilmiş ürün (bekleme)'
      : ready
        ? ' — montaj planına alınabilir'
        : ' — montaj bekliyor (3 gün)'
  return {
    queueId: `mfg:${product.id}`,
    title: `${product.queueTitle}${suffix}`,
    priority: ready ? 1 : 2,
    risk: ready ? 'düşük' : 'orta',
    manufacturedProductId: product.id,
    reportNo: product.reportNo,
    eligibleShipAt: product.eligibleShipAt,
    ready,
  }
}

export function parseManufacturedQueueId(queueId: string): string | null {
  if (!queueId.startsWith('mfg:')) return null
  return queueId.slice('mfg:'.length)
}
