import type {
  ControlPhase,
  MarkerKind,
  MarkerNotePhoto,
  QualityMarker,
  ResponsibleUnit,
} from './productionQualityControl'
import { MOCK_WORK_QUEUE_VIEWER_ID, resolveWorkQueueName, type WorkQueueItem } from './workQueueMock'

export type QualityReportIncludeKinds = {
  pass: boolean
  warning: boolean
  error: boolean
}

export type QualityReportMarkerEntry = {
  markerId: string
  phase: ControlPhase
  kind: MarkerKind
  xPct: number
  yPct: number
  note?: string
  notePhotos?: MarkerNotePhoto[]
  spotSnapshotUrl?: string
  responsibleUnit?: ResponsibleUnit
  nonconformanceId?: string
}

/** Üretim emri başına tek kalite kontrol raporu */
export type QualityReportMarkerTotals = {
  pass: number
  warning: number
  error: number
}

export type QualityControlReport = {
  id: string
  reportNo: string
  productionWorkQueueId: string
  createdAt: string
  createdByUserId: string
  includedKinds: QualityReportIncludeKinds
  /** Rapor oluşturulduğu andaki çizimdeki tüm işaret sayıları (özet şerit) */
  markerTotals: QualityReportMarkerTotals
  entries: QualityReportMarkerEntry[]
  projectCode: string
  projectName: string
  productCode: string
  productName: string
  productionOrderNo: string
  factoryCode: string
  shiftLabel: string
}

export function buildQualityReportNo(productionOrderNo: string): string {
  return `KR-${productionOrderNo}`
}

export function qualityReportIdForProduction(productionWorkQueueId: string): string {
  return `pqr-${productionWorkQueueId}`
}

export function formatQualityReportDateTime(iso: string, locale = 'tr-TR'): string {
  return new Date(iso).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function markerKindLabelKey(kind: MarkerKind): string {
  if (kind === 'pass') return 'unitWorkQueue.qualityMarker.pass'
  if (kind === 'warning') return 'unitWorkQueue.qualityMarker.warning'
  return 'unitWorkQueue.qualityMarker.error'
}

export function buildQualityControlReport(
  parent: WorkQueueItem,
  markers: QualityMarker[],
  include: QualityReportIncludeKinds,
  createdByUserId = MOCK_WORK_QUEUE_VIEWER_ID,
  getResponsibleUnit?: (marker: QualityMarker) => ResponsibleUnit | undefined,
): QualityControlReport | null {
  const entries: QualityReportMarkerEntry[] = markers
    .filter((m) => {
      if (m.kind === 'pass') return include.pass
      if (m.kind === 'warning') return include.warning
      return include.error
    })
    .map((m) => ({
      markerId: m.id,
      phase: m.phase,
      kind: m.kind,
      xPct: m.xPct,
      yPct: m.yPct,
      note: m.note,
      notePhotos: m.notePhotos,
      spotSnapshotUrl: m.spotSnapshotUrl,
      nonconformanceId: m.nonconformanceId,
      responsibleUnit: getResponsibleUnit?.(m),
    }))
    .sort((a, b) => a.phase.localeCompare(b.phase) || a.kind.localeCompare(b.kind))

  if (entries.length === 0) return null

  const markerTotals: QualityReportMarkerTotals = {
    pass: markers.filter((m) => m.kind === 'pass').length,
    warning: markers.filter((m) => m.kind === 'warning').length,
    error: markers.filter((m) => m.kind === 'error').length,
  }

  const now = new Date().toISOString()
  return {
    id: qualityReportIdForProduction(parent.id),
    reportNo: buildQualityReportNo(parent.orderNo),
    productionWorkQueueId: parent.id,
    createdAt: now,
    createdByUserId,
    includedKinds: { ...include },
    markerTotals,
    entries,
    projectCode: parent.projectCode,
    projectName: parent.projectName,
    productCode: parent.productCode ?? '—',
    productName: parent.productName ?? parent.title,
    productionOrderNo: parent.orderNo,
    factoryCode: parent.factoryCode,
    shiftLabel: parent.shiftLabel ?? '—',
  }
}

export function qualityReportCreatorName(report: QualityControlReport): string {
  return resolveWorkQueueName(report.createdByUserId)
}

/** Raporda yer alan işaret sayıları */
export function countEntriesByKind(report: QualityControlReport) {
  return {
    pass: report.entries.filter((e) => e.kind === 'pass').length,
    warning: report.entries.filter((e) => e.kind === 'warning').length,
    error: report.entries.filter((e) => e.kind === 'error').length,
  }
}

/** Üst özet şeridi — çizimdeki toplam işaretler */
export function reportSummaryCounts(report: QualityControlReport): QualityReportMarkerTotals {
  return report.markerTotals ?? countEntriesByKind(report)
}

export function defaultIncludeKindsFromCounts(counts: QualityReportMarkerTotals): QualityReportIncludeKinds {
  return {
    pass: counts.pass > 0,
    warning: counts.warning > 0,
    error: counts.error > 0,
  }
}
