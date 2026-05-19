import type { ControlPhase, NonconformanceRecord, NonconformanceStatus } from './productionQualityControl'
import { resolveWorkQueueName } from './workQueueMock'

/** Yazdırılabilir uygunsuzluk raporu — backend’de ayrı tablo/endpoint ile 1:1 eşlenebilir */
export type NonconformanceReport = {
  id: string
  reportNo: string
  ncOrderNo: string
  workQueueId: string
  productionWorkQueueId: string
  markerId: string
  phase: ControlPhase
  description: string
  responsibleUnit: NonconformanceRecord['responsibleUnit']
  photos: NonconformanceRecord['photos']
  markerXPct: number
  markerYPct: number
  status: NonconformanceStatus
  createdAt: string
  createdByUserId: string
  assigneeUserId: string
  projectCode: string
  projectName: string
  productCode: string
  productName: string
  productionOrderNo: string
  factoryCode: string
  shiftLabel: string
  routingInstruction: string | null
  routedAt: string | null
  routedByUserId: string | null
  routedToTarget: 'project' | 'production' | null
}

export function buildNonconformanceReportNo(productionOrderNo: string, stamp: number): string {
  return `UR-${productionOrderNo}-${String(stamp).slice(-6)}`
}

export function buildNcOrderNo(productionOrderNo: string, stamp: number): string {
  return `NC-${productionOrderNo}-${String(stamp).slice(-6)}`
}

export function formatNcReportDateTime(iso: string, locale = 'tr-TR'): string {
  return new Date(iso).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function recordToNonconformanceReport(record: NonconformanceRecord): NonconformanceReport {
  return {
    id: record.id,
    reportNo: record.reportNo,
    ncOrderNo: record.ncOrderNo,
    workQueueId: record.workQueueId,
    productionWorkQueueId: record.productionWorkQueueId,
    markerId: record.markerId,
    phase: record.phase,
    description: record.description,
    responsibleUnit: record.responsibleUnit,
    photos: record.photos,
    markerXPct: record.markerXPct,
    markerYPct: record.markerYPct,
    status: record.status,
    createdAt: record.createdAt,
    createdByUserId: record.createdByUserId,
    assigneeUserId: record.assigneeUserId,
    projectCode: record.projectCode,
    projectName: record.projectName,
    productCode: record.productCode,
    productName: record.productName,
    productionOrderNo: record.productionOrderNo,
    factoryCode: record.factoryCode,
    shiftLabel: record.shiftLabel,
    routingInstruction: record.routingInstruction,
    routedAt: record.routedAt,
    routedByUserId: record.routedByUserId,
    routedToTarget: record.routedToTarget,
  }
}

export function ncReportPeople(report: NonconformanceReport) {
  return {
    creator: resolveWorkQueueName(report.createdByUserId),
    assignee: resolveWorkQueueName(report.assigneeUserId),
    router: report.routedByUserId ? resolveWorkQueueName(report.routedByUserId) : null,
  }
}
