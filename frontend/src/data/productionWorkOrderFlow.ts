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

export type RebarMaterialScan = {
  scanId: string
  inputMaterialId: string
  workQueueId: string
  productCode?: string
  elementLabel?: string
  scannedAt: string
  scannedByUserId?: string
  manualEntry?: boolean
}

export type ProductionWorkOrderFlowState = {
  checklist: Record<PrePourCheckId, boolean>
  rebarScans: RebarMaterialScan[]
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
  | 'duraklatildi'
  | 'tamamlandi'

export type CuringPauseEntry = {
  at: number
  reason: string
  resumedAt?: number
}

export type CuringProcessHistoryEntry = {
  at: number
  key: string
  note?: string
}

export type CuringFlowState = {
  status: CuringFlowStatus
  startedAt: number | null
  steamOffDueAt: number | null
  steamWarningAt: number | null
  completeDueAt: number | null
  steamAcknowledgedAt: number | null
  completedAt: number | null
  plannedCuringStartAt: number | null
  expectedCuringEndAt: number | null
  pauseHistory: CuringPauseEntry[]
  processHistory: CuringProcessHistoryEntry[]
  earlySteamShutdownAt: number | null
  earlySteamShutdownWarning: boolean
}

export type PourOrderFlowStatus = 'beklemede' | 'onaylandi' | 'gecikme' | 'iptal' | 'tamamlandi'

export type PourOrderFlowState = {
  status: PourOrderFlowStatus
  note?: string
  actionAt?: number
}

export type SampleOrderFlowStatus =
  | 'beklemede'
  | 'etiket_yazdirildi'
  | 'mevcut_numune_baglandi'
  | 'tamamlandi'

export type SampleOrderFlowState = {
  status: SampleOrderFlowStatus
  sampleLabelCode?: string
  linkedSampleId?: string
  actionAt?: number
}

export function createInitialProductionFlowState(): ProductionWorkOrderFlowState {
  return {
    checklist: Object.fromEntries(PRE_POUR_CHECKS.map((c) => [c.id, false])) as Record<
      PrePourCheckId,
      boolean
    >,
    rebarScans: [],
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

export function normalizeCuringFlowState(state: Partial<CuringFlowState>): CuringFlowState {
  const base = createInitialCuringFlowState(state.plannedCuringStartAt)
  return {
    ...base,
    ...state,
    pauseHistory: state.pauseHistory ?? base.pauseHistory,
    processHistory: state.processHistory ?? base.processHistory,
  }
}

export function createInitialCuringFlowState(plannedStartAt?: number | null): CuringFlowState {
  const planned = plannedStartAt ?? null
  return {
    status: 'beklemede',
    startedAt: null,
    steamOffDueAt: null,
    steamWarningAt: null,
    completeDueAt: null,
    steamAcknowledgedAt: null,
    completedAt: null,
    plannedCuringStartAt: planned,
    expectedCuringEndAt:
      planned != null
        ? planned + CURING_STEAM_OFF_DELAY_MS + CURING_COMPLETE_DELAY_MS
        : null,
    pauseHistory: [],
    processHistory: [],
    earlySteamShutdownAt: null,
    earlySteamShutdownWarning: false,
  }
}

export function createInitialPourFlowState(): PourOrderFlowState {
  return { status: 'beklemede' }
}

export function createInitialSampleFlowState(): SampleOrderFlowState {
  return { status: 'beklemede' }
}

function pushCuringHistory(
  state: CuringFlowState,
  key: string,
  note?: string,
  at = Date.now(),
): CuringFlowState {
  return {
    ...state,
    processHistory: [...state.processHistory, { at, key, note }],
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
  if (state.status === 'duraklatildi' || state.status === 'tamamlandi') return state
  if (state.status === 'kurleme_basladi' && state.steamOffDueAt !== null && now >= state.steamOffDueAt) {
    return pushCuringHistory(
      {
        ...state,
        status: 'buhar_kapatma_bekleniyor',
        steamWarningAt: state.steamWarningAt ?? state.steamOffDueAt,
      },
      'steam_off_due',
    )
  }
  return state
}

export function shouldAutoCompleteCuring(state: CuringFlowState, now = Date.now()): boolean {
  return (
    state.status === 'bekleme_suresi' &&
    state.completeDueAt !== null &&
    now >= state.completeDueAt
  )
}

export function startCuringFlow(state: CuringFlowState, now = Date.now()): CuringFlowState {
  if (state.status !== 'beklemede' && state.status !== 'duraklatildi') return state
  const base = pushCuringHistory(
    {
      ...state,
      status: 'kurleme_basladi',
      startedAt: state.startedAt ?? now,
      steamOffDueAt: now + CURING_STEAM_OFF_DELAY_MS,
      steamWarningAt: null,
      steamAcknowledgedAt: null,
      completeDueAt: null,
      completedAt: null,
      expectedCuringEndAt: now + CURING_STEAM_OFF_DELAY_MS + CURING_COMPLETE_DELAY_MS,
    },
    'curing_started',
  )
  return base
}

export function pauseCuringFlow(state: CuringFlowState, reason: string, now = Date.now()): CuringFlowState {
  if (state.status === 'tamamlandi' || state.status === 'beklemede') return state
  const trimmed = reason.trim()
  return pushCuringHistory(
    {
      ...state,
      status: 'duraklatildi',
      pauseHistory: [...state.pauseHistory, { at: now, reason: trimmed }],
    },
    'curing_paused',
    trimmed || undefined,
    now,
  )
}

export function resumeCuringFlow(state: CuringFlowState, now = Date.now()): CuringFlowState {
  if (state.status !== 'duraklatildi') return state
  const pauseHistory = state.pauseHistory.map((entry, i, arr) =>
    i === arr.length - 1 && entry.resumedAt == null ? { ...entry, resumedAt: now } : entry,
  )
  const resumedStatus: CuringFlowStatus =
    state.steamAcknowledgedAt != null
      ? 'bekleme_suresi'
      : state.steamOffDueAt != null && now >= state.steamOffDueAt
        ? 'buhar_kapatma_bekleniyor'
        : 'kurleme_basladi'
  return pushCuringHistory(
    {
      ...state,
      status: resumedStatus,
      pauseHistory,
    },
    'curing_resumed',
    undefined,
    now,
  )
}

export function acknowledgeSteamOff(state: CuringFlowState, now = Date.now()): CuringFlowState {
  if (state.status !== 'buhar_kapatma_bekleniyor' && state.status !== 'kurleme_basladi') return state
  const early =
    state.steamOffDueAt != null && now < state.steamOffDueAt
  return pushCuringHistory(
    {
      ...state,
      status: 'bekleme_suresi',
      steamAcknowledgedAt: now,
      completeDueAt: now + CURING_COMPLETE_DELAY_MS,
      earlySteamShutdownAt: early ? now : state.earlySteamShutdownAt,
      earlySteamShutdownWarning: early || state.earlySteamShutdownWarning,
      expectedCuringEndAt: now + CURING_COMPLETE_DELAY_MS,
    },
    early ? 'steam_off_early' : 'steam_off_ack',
    early ? 'Erken buhar kapatma' : undefined,
    now,
  )
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
