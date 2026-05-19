import type { WorkQueueItem } from './workQueueMock'
import { MOCK_WORK_QUEUE_VIEWER_ID } from './workQueueMock'

export type ControlPhase = 'pre_pour' | 'post_pour'

export type MarkerKind = 'pass' | 'warning' | 'error'

/** Uyarı/uygunsuzluk — modal onayından önce çizime konmaz */
export type PendingMarkerPlacement = {
  kind: 'warning' | 'error'
  phase: ControlPhase
  xPct: number
  yPct: number
}

export function pendingPlacementToDialogMarker(
  placement: PendingMarkerPlacement,
  productionWorkQueueId: string,
): QualityMarker {
  return {
    id: '__pending__',
    productionWorkQueueId,
    phase: placement.phase,
    kind: placement.kind,
    xPct: placement.xPct,
    yPct: placement.yPct,
    createdAt: '',
    createdByUserId: '',
  }
}

export type MarkerNotePhoto = {
  id: string
  objectUrl: string
  fileName: string
}

export type QualityMarker = {
  id: string
  productionWorkQueueId: string
  phase: ControlPhase
  kind: MarkerKind
  xPct: number
  yPct: number
  createdAt: string
  createdByUserId: string
  nonconformanceId?: string
  /** Uyarı veya uygunsuzluk açıklaması */
  note?: string
  notePhotos?: MarkerNotePhoto[]
  /** Çizimde işaretlenen bölgenin rapor görseli (data URL) */
  spotSnapshotUrl?: string
}

export type NonconformanceStatus =
  | 'detected'
  | 'manager_review'
  | 'routed_project'
  | 'routed_production'
  | 'awaiting_resolution'
  | 'resolved'
  | 'closed'

/** Çözüm süreci — durum bazlı takip adımları (sıralı gösterim) */
export const NONCONFORMANCE_STATUS_TRACKING_STEPS: readonly {
  id: NonconformanceStatus
  /** Proje / üretim yönlendirmesi — yalnızca biri tamamlanır */
  routingBranch?: true
}[] = [
  { id: 'detected' },
  { id: 'manager_review' },
  { id: 'routed_project', routingBranch: true },
  { id: 'routed_production', routingBranch: true },
  { id: 'awaiting_resolution' },
  { id: 'resolved' },
  { id: 'closed' },
] as const

export type NonconformanceStatusHistoryEntry = {
  status: NonconformanceStatus
  at: string
  byUserId?: string
  note?: string
}

export type ResponsibleUnit =
  | 'project'
  | 'production'
  | 'quality'
  | 'warehouse'
  | 'batch_plant'
  | 'curing'

export const RESPONSIBLE_UNIT_OPTIONS: readonly {
  id: ResponsibleUnit
  labelKey: string
}[] = [
  { id: 'project', labelKey: 'unitWorkQueue.nonconformance.unit.project' },
  { id: 'production', labelKey: 'unitWorkQueue.nonconformance.unit.production' },
  { id: 'quality', labelKey: 'unitWorkQueue.nonconformance.unit.quality' },
  { id: 'warehouse', labelKey: 'unitWorkQueue.nonconformance.unit.warehouse' },
  { id: 'batch_plant', labelKey: 'unitWorkQueue.nonconformance.unit.batch_plant' },
  { id: 'curing', labelKey: 'unitWorkQueue.nonconformance.unit.curing' },
] as const

export type NonconformancePhoto = {
  id: string
  objectUrl: string
  fileName: string
}

export type NonconformanceRecord = {
  id: string
  /** Yazdırılabilir rapor numarası (UR-…) */
  reportNo: string
  /** İş emri numarası (NC-…) */
  ncOrderNo: string
  workQueueId: string
  productionWorkQueueId: string
  markerId: string
  phase: ControlPhase
  description: string
  responsibleUnit: ResponsibleUnit
  photos: NonconformancePhoto[]
  markerXPct: number
  markerYPct: number
  status: NonconformanceStatus
  /** Durum geçişleri (tespit → inceleme → yönlendirme → çözüm → kapanış) */
  statusHistory: NonconformanceStatusHistoryEntry[]
  createdAt: string
  createdByUserId: string
  assigneeUserId: string
  routingInstruction: string | null
  routedAt: string | null
  routedByUserId: string | null
  routedToTarget: 'project' | 'production' | null
  projectCode: string
  projectName: string
  productCode: string
  productName: string
  productionOrderNo: string
  factoryCode: string
  shiftLabel: string
}

/** Üretim amiri mock ataması */
export const PRODUCTION_MANAGER_USER_ID = 'u-emre'

export function controlPhaseLabelKey(phase: ControlPhase): string {
  return phase === 'pre_pour'
    ? 'unitWorkQueue.nonconformance.phase.prePour'
    : 'unitWorkQueue.nonconformance.phase.postPour'
}

export function nonconformanceStatusLabelKey(status: NonconformanceStatus): string {
  return `unitWorkQueue.nonconformance.status.${status}`
}

const NC_STATUS_RANK: Record<NonconformanceStatus, number> = {
  detected: 0,
  manager_review: 1,
  routed_project: 2,
  routed_production: 2,
  awaiting_resolution: 3,
  resolved: 4,
  closed: 5,
}

export function nonconformanceStatusRank(status: NonconformanceStatus): number {
  return NC_STATUS_RANK[status]
}

export function createNonconformanceStatusHistoryEntry(
  status: NonconformanceStatus,
  at: string,
  byUserId?: string,
  note?: string,
): NonconformanceStatusHistoryEntry {
  return { status, at, ...(byUserId ? { byUserId } : {}), ...(note ? { note } : {}) }
}

export function appendNonconformanceStatus(
  record: NonconformanceRecord,
  status: NonconformanceStatus,
  at: string,
  byUserId?: string,
  note?: string,
): NonconformanceRecord {
  const entry = createNonconformanceStatusHistoryEntry(status, at, byUserId, note)
  const last = record.statusHistory[record.statusHistory.length - 1]
  if (last?.status === status) {
    return { ...record, status }
  }
  return {
    ...record,
    status,
    statusHistory: [...record.statusHistory, entry],
  }
}

/** Eski mock kayıtlar için geçmiş üretir */
export function ensureNonconformanceStatusHistory(
  record: NonconformanceRecord,
): NonconformanceRecord {
  if (record.statusHistory?.length) return record
  const at = record.createdAt
  const history: NonconformanceStatusHistoryEntry[] = [
    createNonconformanceStatusHistoryEntry('detected', at, record.createdByUserId),
  ]
  if (nonconformanceStatusRank(record.status) >= 1) {
    history.push(
      createNonconformanceStatusHistoryEntry('manager_review', at, record.assigneeUserId),
    )
  }
  if (record.status === 'routed_project' || record.routedToTarget === 'project') {
    history.push(
      createNonconformanceStatusHistoryEntry(
        'routed_project',
        record.routedAt ?? at,
        record.routedByUserId ?? undefined,
        record.routingInstruction ?? undefined,
      ),
    )
  } else if (record.status === 'routed_production' || record.routedToTarget === 'production') {
    history.push(
      createNonconformanceStatusHistoryEntry(
        'routed_production',
        record.routedAt ?? at,
        record.routedByUserId ?? undefined,
        record.routingInstruction ?? undefined,
      ),
    )
  }
  if (
    record.status === 'awaiting_resolution' ||
    nonconformanceStatusRank(record.status) >= NC_STATUS_RANK.awaiting_resolution
  ) {
    if (
      record.status !== 'routed_project' &&
      record.status !== 'routed_production' &&
      record.routedToTarget
    ) {
      history.push(
        createNonconformanceStatusHistoryEntry(
          record.routedToTarget === 'project' ? 'routed_project' : 'routed_production',
          record.routedAt ?? at,
          record.routedByUserId ?? undefined,
        ),
      )
    }
    if (nonconformanceStatusRank(record.status) >= NC_STATUS_RANK.awaiting_resolution) {
      history.push(
        createNonconformanceStatusHistoryEntry('awaiting_resolution', record.routedAt ?? at),
      )
    }
  }
  if (nonconformanceStatusRank(record.status) >= NC_STATUS_RANK.resolved) {
    history.push(createNonconformanceStatusHistoryEntry('resolved', at))
  }
  if (record.status === 'closed') {
    history.push(createNonconformanceStatusHistoryEntry('closed', at))
  }
  return { ...record, statusHistory: history }
}

export function isNonconformanceStepCompleted(
  record: NonconformanceRecord,
  stepId: NonconformanceStatus,
): boolean {
  const ensured = ensureNonconformanceStatusHistory(record)
  if (stepId === 'routed_project' || stepId === 'routed_production') {
    return ensured.statusHistory.some((e) => e.status === stepId)
  }
  const targetRank = NC_STATUS_RANK[stepId]
  return (
    nonconformanceStatusRank(ensured.status) > targetRank ||
    (nonconformanceStatusRank(ensured.status) === targetRank &&
      ensured.statusHistory.some((e) => e.status === stepId))
  )
}

export function isNonconformanceRoutingStepSkipped(
  record: NonconformanceRecord,
  stepId: 'routed_project' | 'routed_production',
): boolean {
  const ensured = ensureNonconformanceStatusHistory(record)
  const tookProject = ensured.statusHistory.some((e) => e.status === 'routed_project')
  const tookProduction = ensured.statusHistory.some((e) => e.status === 'routed_production')
  if (stepId === 'routed_project') return tookProduction && !tookProject
  return tookProject && !tookProduction
}

function formatNowLabel(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

export function buildNonconformanceWorkOrder(
  parent: WorkQueueItem,
  record: NonconformanceRecord,
  _stamp: number,
): WorkQueueItem {
  const phaseLabel = record.phase === 'pre_pour' ? 'Ön kontrol' : 'Döküm sonrası'
  return {
    id: record.workQueueId,
    orderNo: record.ncOrderNo,
    title: `Uygunsuzluk tespiti — ${record.productName}`,
    summary: `${phaseLabel} · ${record.projectCode} · ${parent.orderNo}`,
    detailBody: record.description,
    kind: 'nonconformance',
    status: 'islemde',
    priority: 'yuksek',
    targetUnit: 'production',
    fromUnit: 'production',
    toUnit: 'production',
    assigneeUserId: record.assigneeUserId,
    assignerUserId: record.createdByUserId,
    projectCode: parent.projectCode,
    projectName: parent.projectName,
    projectRouteId: parent.projectRouteId,
    factoryCode: parent.factoryCode,
    daysOnDesk: 0,
    lastUpdatedLabel: formatNowLabel(),
    dueToday: true,
    parentWorkQueueId: parent.id,
    sourceProductionOrderNo: parent.orderNo,
    productCode: parent.productCode,
    productName: parent.productName,
    moldId: parent.moldId,
    moldName: parent.moldName,
    shiftLabel: parent.shiftLabel,
    volumeM3: parent.volumeM3,
    recipeId: parent.recipeId,
    planDayIso: parent.planDayIso,
    nonconformanceId: record.id,
    controlPhase: record.phase,
    sourceMarkerId: record.markerId,
  }
}

export function createNonconformanceRecord(input: {
  id: string
  reportNo: string
  ncOrderNo: string
  workQueueId: string
  productionWorkQueueId: string
  markerId: string
  phase: ControlPhase
  description: string
  responsibleUnit: ResponsibleUnit
  photos: NonconformancePhoto[]
  markerXPct: number
  markerYPct: number
  parent: WorkQueueItem
  createdByUserId?: string
  assigneeUserId?: string
}): NonconformanceRecord {
  const now = new Date().toISOString()
  return {
    id: input.id,
    reportNo: input.reportNo,
    ncOrderNo: input.ncOrderNo,
    workQueueId: input.workQueueId,
    productionWorkQueueId: input.productionWorkQueueId,
    markerId: input.markerId,
    phase: input.phase,
    description: input.description,
    responsibleUnit: input.responsibleUnit,
    photos: input.photos,
    markerXPct: input.markerXPct,
    markerYPct: input.markerYPct,
    status: 'manager_review',
    statusHistory: [
      createNonconformanceStatusHistoryEntry('detected', now, input.createdByUserId),
      createNonconformanceStatusHistoryEntry(
        'manager_review',
        now,
        input.assigneeUserId ?? PRODUCTION_MANAGER_USER_ID,
      ),
    ],
    createdAt: now,
    createdByUserId: input.createdByUserId ?? MOCK_WORK_QUEUE_VIEWER_ID,
    assigneeUserId: input.assigneeUserId ?? PRODUCTION_MANAGER_USER_ID,
    routingInstruction: null,
    routedAt: null,
    routedByUserId: null,
    routedToTarget: null,
    projectCode: input.parent.projectCode,
    projectName: input.parent.projectName,
    productCode: input.parent.productCode ?? '—',
    productName: input.parent.productName ?? input.parent.title,
    productionOrderNo: input.parent.orderNo,
    factoryCode: input.parent.factoryCode,
    shiftLabel: input.parent.shiftLabel ?? '—',
  }
}

export function isNonconformanceOrder(item: WorkQueueItem): boolean {
  return item.kind === 'nonconformance'
}
