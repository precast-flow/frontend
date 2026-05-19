import {
  CURING_COMPLETE_DELAY_MS,
  CURING_STEAM_OFF_DELAY_MS,
} from './productionWorkOrderFlowConstants'
import { MOCK_WORK_QUEUE_VIEWER_ID, type WorkQueueItem } from './workQueueMock'

export const PRE_POUR_CHECKS = [
  { id: 'mold_ready', labelKey: 'unitWorkQueue.productionFlow.check.moldReady' },
  { id: 'reinforcement', labelKey: 'unitWorkQueue.productionFlow.check.reinforcement' },
  { id: 'embeds', labelKey: 'unitWorkQueue.productionFlow.check.embeds' },
  { id: 'lifting', labelKey: 'unitWorkQueue.productionFlow.check.lifting' },
  { id: 'recipe', labelKey: 'unitWorkQueue.productionFlow.check.recipe' },
  { id: 'mixer', labelKey: 'unitWorkQueue.productionFlow.check.mixer' },
  { id: 'safety', labelKey: 'unitWorkQueue.productionFlow.check.safety' },
  { id: 'qc_sign', labelKey: 'unitWorkQueue.productionFlow.check.qcSign' },
] as const

export type PrePourCheckId = (typeof PRE_POUR_CHECKS)[number]['id']

export type WarehouseTransferRecord = {
  warehouseId: string
  warehouseLabel: string
  approvedAt: string
  approvedByUserId: string
}

export type PostPourFlowState = {
  labelingDone: boolean
  surfaceCleaningDone: boolean
  warehouseTransfer: WarehouseTransferRecord | null
  productionCompletedAt: string | null
  /** Günlük üretim raporuna dahil edildiyse rapor kimliği */
  dailyProductionReportId: string | null
}

export type ProductionWorkOrderFlowState = {
  checklist: Record<PrePourCheckId, boolean>
  pourApprovedAt: string | null
  spawnedChildIds: string[]
  postPour: PostPourFlowState
}

export type PostPourMissingStep = 'labeling' | 'surface_cleaning' | 'curing_report'

export function createInitialPostPourState(): PostPourFlowState {
  return {
    labelingDone: false,
    surfaceCleaningDone: false,
    warehouseTransfer: null,
    productionCompletedAt: null,
    dailyProductionReportId: null,
  }
}

export type CuringFlowStatus =
  | 'beklemede'
  | 'kurleme_basladi'
  | 'buhar_kapatma_bekleniyor'
  | 'bekleme_suresi'
  | 'tamamlandi'

export type CuringFlowState = {
  status: CuringFlowStatus
  startedAt: number | null
  steamOffDueAt: number | null
  /** Buhar kapatma uyarısının verildiği an (planlanan veya fiili geçiş). */
  steamWarningAt: number | null
  completeDueAt: number | null
  steamAcknowledgedAt: number | null
  completedAt: number | null
}

export function createInitialProductionFlowState(): ProductionWorkOrderFlowState {
  return {
    checklist: Object.fromEntries(PRE_POUR_CHECKS.map((c) => [c.id, false])) as Record<
      PrePourCheckId,
      boolean
    >,
    pourApprovedAt: null,
    spawnedChildIds: [],
    postPour: createInitialPostPourState(),
  }
}

export function canInteractPostPour(state: ProductionWorkOrderFlowState): boolean {
  return alreadyPourApproved(state)
}

export function hasCuringReportForFlow(hasReport: boolean): boolean {
  return hasReport
}

export function canApproveWarehouseTransfer(
  state: ProductionWorkOrderFlowState,
  hasCuringReport: boolean,
): boolean {
  if (!canInteractPostPour(state)) return false
  if (state.postPour.warehouseTransfer !== null) return false
  if (!state.postPour.labelingDone || !state.postPour.surfaceCleaningDone) return false
  return hasCuringReport
}

export function missingPostPourSteps(
  state: ProductionWorkOrderFlowState,
  hasCuringReport: boolean,
): PostPourMissingStep[] {
  const missing: PostPourMissingStep[] = []
  if (!state.postPour.labelingDone) missing.push('labeling')
  if (!state.postPour.surfaceCleaningDone) missing.push('surface_cleaning')
  if (!hasCuringReport) missing.push('curing_report')
  return missing
}

export function isProductionFlowComplete(state: ProductionWorkOrderFlowState): boolean {
  return state.postPour.productionCompletedAt !== null
}

export function alreadyWarehouseApproved(state: ProductionWorkOrderFlowState): boolean {
  return state.postPour.warehouseTransfer !== null
}

export function createInitialCuringFlowState(): CuringFlowState {
  return {
    status: 'beklemede',
    startedAt: null,
    steamOffDueAt: null,
    steamWarningAt: null,
    completeDueAt: null,
    steamAcknowledgedAt: null,
    completedAt: null,
  }
}

export function allChecksComplete(state: ProductionWorkOrderFlowState): boolean {
  return PRE_POUR_CHECKS.every((c) => state.checklist[c.id])
}

export function canApprovePour(state: ProductionWorkOrderFlowState): boolean {
  return allChecksComplete(state) && state.pourApprovedAt === null
}

export function alreadyPourApproved(state: ProductionWorkOrderFlowState): boolean {
  return state.pourApprovedAt !== null
}

function formatNowLabel(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

/** Santral / kalite / kürleme alt iş emirleri. */
export function buildSpawnedWorkOrders(
  parent: WorkQueueItem,
  stamp: number,
  opts?: { assignerUserId?: string },
): WorkQueueItem[] {
  const suffix = String(stamp).slice(-6)
  const productLabel = parent.productName ?? parent.title
  /** Onaylayan (demo oturum) — “Atadığım işler” filtresinde görünür. */
  const assignerUserId = opts?.assignerUserId ?? MOCK_WORK_QUEUE_VIEWER_ID
  const shared = {
    parentWorkQueueId: parent.id,
    sourceProductionOrderNo: parent.orderNo,
    projectCode: parent.projectCode,
    projectName: parent.projectName,
    projectRouteId: parent.projectRouteId,
    factoryCode: parent.factoryCode,
    assignerUserId,
    status: 'beklemede' as const,
    priority: parent.priority,
    daysOnDesk: 0,
    lastUpdatedLabel: formatNowLabel(),
    dueToday: parent.dueToday,
    productCode: parent.productCode,
    productName: parent.productName,
    moldId: parent.moldId,
    moldName: parent.moldName,
    shiftLabel: parent.shiftLabel,
    volumeM3: parent.volumeM3,
    recipeId: parent.recipeId,
    planDayIso: parent.planDayIso,
  }

  return [
    {
      ...shared,
      id: `wq-pour-${parent.id}-${suffix}`,
      orderNo: `${parent.orderNo}-P`,
      title: `Beton döküm — ${productLabel}`,
      summary: `Santral · ${parent.projectCode} · ana emir ${parent.orderNo}`,
      detailBody: `Beton döküm emri (üretim onayı sonrası).\nAna emir: ${parent.orderNo}\nProje: ${parent.projectName}`,
      kind: 'pour_order',
      targetUnit: 'batch_plant',
      fromUnit: 'production',
      toUnit: 'batch_plant',
      assigneeUserId: 'u-emre',
    },
    {
      ...shared,
      id: `wq-sample-${parent.id}-${suffix}`,
      orderNo: `${parent.orderNo}-S`,
      title: `Numune alma — ${productLabel}`,
      summary: `Kalite · ${parent.projectCode} · ana emir ${parent.orderNo}`,
      detailBody: `Numune alma emri (üretim onayı sonrası).\nAna emir: ${parent.orderNo}`,
      kind: 'sample_order',
      targetUnit: 'quality',
      fromUnit: 'production',
      toUnit: 'quality',
      assigneeUserId: 'u6',
    },
    {
      ...shared,
      id: `wq-curing-${parent.id}-${suffix}`,
      orderNo: `${parent.orderNo}-C`,
      title: `Kürleme — ${productLabel}`,
      summary: `Kürleme hattı · ${parent.projectCode} · ana emir ${parent.orderNo}`,
      detailBody: `Kürleme emri (üretim onayı sonrası).\nAna emir: ${parent.orderNo}`,
      kind: 'curing_order',
      targetUnit: 'curing',
      fromUnit: 'production',
      toUnit: 'curing',
      /** Demo: kürleme akışı oturum kullanıcısıyla test edilir (Bana atanan + Kürleme birimi). */
      assigneeUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    },
  ]
}

export function advanceCuringByTime(
  state: CuringFlowState,
  now = Date.now(),
): CuringFlowState {
  if (state.status === 'kurleme_basladi' && state.steamOffDueAt !== null && now >= state.steamOffDueAt) {
    return {
      ...state,
      status: 'buhar_kapatma_bekleniyor',
      steamWarningAt: state.steamWarningAt ?? state.steamOffDueAt,
    }
  }
  if (
    state.status === 'bekleme_suresi' &&
    state.completeDueAt !== null &&
    now >= state.completeDueAt
  ) {
    return state
  }
  return state
}

export function startCuringFlow(state: CuringFlowState, now = Date.now()): CuringFlowState {
  if (state.status !== 'beklemede') return state
  return {
    ...state,
    status: 'kurleme_basladi',
    startedAt: now,
    steamOffDueAt: now + CURING_STEAM_OFF_DELAY_MS,
    steamWarningAt: null,
    steamAcknowledgedAt: null,
    completeDueAt: null,
    completedAt: null,
  }
}

export function acknowledgeSteamOff(state: CuringFlowState, now = Date.now()): CuringFlowState {
  if (state.status !== 'buhar_kapatma_bekleniyor') return state
  return {
    ...state,
    status: 'bekleme_suresi',
    steamAcknowledgedAt: now,
    completeDueAt: now + CURING_COMPLETE_DELAY_MS,
  }
}

export function completeCuringFlow(state: CuringFlowState, now = Date.now()): CuringFlowState {
  if (state.status !== 'bekleme_suresi') return state
  if (state.completeDueAt !== null && now < state.completeDueAt) return state
  return {
    ...state,
    status: 'tamamlandi',
    completedAt: now,
  }
}

export function canCompleteCuring(state: CuringFlowState, now = Date.now()): boolean {
  return (
    state.status === 'bekleme_suresi' &&
    state.completeDueAt !== null &&
    now >= state.completeDueAt
  )
}

export function isProductionParentOrder(item: WorkQueueItem): boolean {
  return item.kind === 'production' && !item.parentWorkQueueId
}

export function isProductionChildOrder(item: WorkQueueItem): boolean {
  return (
    item.kind === 'pour_order' ||
    item.kind === 'sample_order' ||
    item.kind === 'curing_order'
  )
}

export function childOrderRoleLabelKey(kind: WorkQueueItem['kind']): string {
  if (kind === 'pour_order') return 'unitWorkQueue.productionFlow.spawn.pour'
  if (kind === 'sample_order') return 'unitWorkQueue.productionFlow.spawn.sample'
  if (kind === 'curing_order') return 'unitWorkQueue.productionFlow.spawn.curing'
  if (kind === 'nonconformance') return 'unitWorkQueue.kind.nonconformance'
  return 'unitWorkQueue.kind.production'
}
