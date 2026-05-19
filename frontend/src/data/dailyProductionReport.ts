import {
  buildManufacturedProduct,
  computeEligibleShipAt,
  type ManufacturedProduct,
} from './manufacturedProduct'
import {
  isProductionFlowComplete,
  type ProductionWorkOrderFlowState,
} from './productionWorkOrderFlow'
import { MOCK_WORK_QUEUE_VIEWER_ID, type WorkQueueItem } from './workQueueMock'

export type DailyProductionReportLine = {
  productionWorkQueueId: string
  productionOrderNo: string
  productCode: string
  productName: string
  projectCode: string
  projectName: string
  shiftLabel: string
  warehouseLabel: string
  productionCompletedAt: string
  eligibleShipAt: string
}

export type DailyReportProjectSummary = {
  projectCode: string
  projectName: string
  count: number
}

export function summarizeLinesByProject(
  lines: readonly DailyProductionReportLine[],
): DailyReportProjectSummary[] {
  const map = new Map<string, DailyReportProjectSummary>()
  for (const line of lines) {
    const existing = map.get(line.projectCode)
    if (existing) {
      existing.count += 1
    } else {
      map.set(line.projectCode, {
        projectCode: line.projectCode,
        projectName: line.projectName,
        count: 1,
      })
    }
  }
  return [...map.values()].sort((a, b) => a.projectCode.localeCompare(b.projectCode))
}

export type DailyProductionReport = {
  id: string
  reportNo: string
  reportDayIso: string
  factoryCode: string
  createdAt: string
  createdByUserId: string
  lines: DailyProductionReportLine[]
}

export type GenerateDailyReportResult =
  | { ok: true; report: DailyProductionReport; manufactured: ManufacturedProduct[] }
  | { ok: false; reason: 'duplicate_day' | 'empty'; existingReportId?: string }

export function productionCompletedDayIso(iso: string): string {
  return iso.slice(0, 10)
}

export function dailyReportIdForDay(factoryCode: string, reportDayIso: string): string {
  return `dpr-${factoryCode}-${reportDayIso}`
}

function factorySuffix(factoryCode: string): string {
  const part = factoryCode.split('-').pop() ?? factoryCode
  return part.slice(0, 6).toUpperCase()
}

export function buildDailyReportNo(reportDayIso: string, factoryCode: string): string {
  const compact = reportDayIso.replace(/-/g, '')
  return `GUR-${compact}-${factorySuffix(factoryCode)}`
}

export function formatDailyReportDateTime(iso: string, locale = 'tr-TR'): string {
  return new Date(iso).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDailyReportDay(iso: string, locale = 'tr-TR'): string {
  return new Date(`${iso}T12:00:00.000Z`).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  })
}

function lineFromItem(
  item: WorkQueueItem,
  flow: ProductionWorkOrderFlowState,
): DailyProductionReportLine | null {
  const completedAt = flow.postPour.productionCompletedAt
  const warehouse = flow.postPour.warehouseTransfer
  if (!completedAt || !warehouse) return null

  return {
    productionWorkQueueId: item.id,
    productionOrderNo: item.orderNo,
    productCode: item.productCode ?? '—',
    productName: item.productName ?? item.title,
    projectCode: item.projectCode,
    projectName: item.projectName,
    shiftLabel: item.shiftLabel ?? '—',
    warehouseLabel: warehouse.warehouseLabel,
    productionCompletedAt: completedAt,
    eligibleShipAt: computeEligibleShipAt(completedAt),
  }
}

export function listEligibleProductionOrders(
  items: readonly WorkQueueItem[],
  flowById: Record<string, ProductionWorkOrderFlowState>,
  factoryCode: string,
  reportDayIso: string,
): { item: WorkQueueItem; line: DailyProductionReportLine }[] {
  const out: { item: WorkQueueItem; line: DailyProductionReportLine }[] = []

  for (const item of items) {
    if (item.kind !== 'production' || item.factoryCode !== factoryCode) continue
    const flow = flowById[item.id]
    if (!flow || !isProductionFlowComplete(flow)) continue
    if (flow.postPour.dailyProductionReportId) continue

    const completedAt = flow.postPour.productionCompletedAt
    if (!completedAt || productionCompletedDayIso(completedAt) !== reportDayIso) continue

    if (!flow.postPour.labelingDone || !flow.postPour.surfaceCleaningDone) continue

    const line = lineFromItem(item, flow)
    if (line) out.push({ item, line })
  }

  out.sort((a, b) => a.item.orderNo.localeCompare(b.item.orderNo))
  return out
}

export function findDailyReportForDay(
  reportsById: Record<string, DailyProductionReport>,
  factoryCode: string,
  reportDayIso: string,
): DailyProductionReport | undefined {
  const id = dailyReportIdForDay(factoryCode, reportDayIso)
  const direct = reportsById[id]
  if (direct) return direct
  return Object.values(reportsById).find(
    (r) => r.factoryCode === factoryCode && r.reportDayIso === reportDayIso,
  )
}

export function buildDailyProductionReport(
  eligible: { item: WorkQueueItem; line: DailyProductionReportLine }[],
  reportDayIso: string,
  factoryCode: string,
  createdByUserId: string = MOCK_WORK_QUEUE_VIEWER_ID,
): { report: DailyProductionReport; manufactured: ManufacturedProduct[] } {
  const id = dailyReportIdForDay(factoryCode, reportDayIso)
  const report: DailyProductionReport = {
    id,
    reportNo: buildDailyReportNo(reportDayIso, factoryCode),
    reportDayIso,
    factoryCode,
    createdAt: new Date().toISOString(),
    createdByUserId,
    lines: eligible.map((e) => e.line),
  }

  const manufactured = eligible.map((e) =>
    buildManufacturedProduct({
      productionWorkQueueId: e.item.id,
      dailyReportId: report.id,
      reportNo: report.reportNo,
      factoryCode: e.item.factoryCode,
      projectCode: e.item.projectCode,
      projectName: e.item.projectName,
      productCode: e.line.productCode,
      productName: e.line.productName,
      productionOrderNo: e.item.orderNo,
      productionCompletedAt: e.line.productionCompletedAt,
      warehouseLabel: e.line.warehouseLabel,
    }),
  )

  return { report, manufactured }
}
