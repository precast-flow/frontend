import { previousBusinessDayIso } from '../planlama/previousBusinessDay'
import {
  PRE_POUR_CHECKS,
  buildSpawnedWorkOrders,
  createInitialPostPourState,
  type ProductionWorkOrderFlowState,
} from './productionWorkOrderFlow'
import { getWarehouseById } from './productionWarehouseMock'
import {
  MOCK_WORK_QUEUE_VIEWER_ID,
  type WorkQueueItem,
  type WorkQueuePriority,
} from './workQueueMock'

export type DailyProductionReportDemoSeed = {
  items: WorkQueueItem[]
  flowById: Record<string, ProductionWorkOrderFlowState>
  curingById: Record<string, never>
  reportsByCuringId: Record<string, never>
}

function completionAtOnDay(dayIso: string, hourUtc: number): string {
  return `${dayIso}T${String(hourUtc).padStart(2, '0')}:30:00.000Z`
}

function buildCompletedFlow(
  spawnedIds: string[],
  completedAt: string,
  warehouseId: string,
): ProductionWorkOrderFlowState {
  const warehouse = getWarehouseById(warehouseId)
  const checklist = Object.fromEntries(PRE_POUR_CHECKS.map((c) => [c.id, true])) as ProductionWorkOrderFlowState['checklist']
  const postPour = createInitialPostPourState()
  postPour.labelingDone = true
  postPour.surfaceCleaningDone = true
  if (warehouse) {
    postPour.warehouseTransfer = {
      warehouseId: warehouse.id,
      warehouseLabel: warehouse.label,
      approvedAt: completedAt,
      approvedByUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    }
  }
  postPour.productionCompletedAt = completedAt
  return {
    checklist,
    rebarScans: [],
    pourApprovedAt: completionAtOnDay(completedAt.slice(0, 10), 6),
    spawnedChildIds: spawnedIds,
    postPour,
  }
}

function productionItem(
  partial: Omit<
    WorkQueueItem,
    | 'kind'
    | 'status'
    | 'targetUnit'
    | 'fromUnit'
    | 'toUnit'
    | 'assigneeUserId'
    | 'assignerUserId'
    | 'daysOnDesk'
    | 'lastUpdatedLabel'
    | 'detailBody'
    | 'summary'
    | 'priority'
  > & {
    priority?: WorkQueuePriority
    summary?: string
    detailBody?: string
  },
): WorkQueueItem {
  return {
    kind: 'production',
    status: 'tamamlandi',
    targetUnit: 'production',
    fromUnit: 'planning',
    toUnit: 'production',
    assigneeUserId: 'u5',
    assignerUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    daysOnDesk: 1,
    lastUpdatedLabel: 'bugün',
    ...partial,
    summary: partial.summary ?? 'Günlük rapor demo — üretim tamamlandı.',
    detailBody: partial.detailBody ?? 'Depo onayı alındı; günlük üretim raporu için uygun.',
    priority: partial.priority ?? 'normal',
  }
}

export function buildDailyProductionReportDemoSeed(): DailyProductionReportDemoSeed {
  const reportDay = previousBusinessDayIso()
  const completedMorning = completionAtOnDay(reportDay, 10)
  const completedAfternoon = completionAtOnDay(reportDay, 15)

  const item1 = productionItem({
    id: 'wq-dpr-demo-1',
    orderNo: 'WO-DPR-901',
    title: 'Kolon K-42 — günlük rapor demo',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    projectRouteId: null,
    factoryCode: 'IST-HAD',
    productCode: 'K-42',
    productName: 'Kolon K-42',
    moldId: 'M-10',
    moldName: 'Kolon KL1',
    shiftLabel: 'Sabah',
    volumeM3: 4.2,
    steelKg: 620,
    recipeId: 'RC-C35-02',
    planDayIso: reportDay,
  })

  const item2 = productionItem({
    id: 'wq-dpr-demo-2',
    orderNo: 'WO-DPR-902',
    title: 'Panel P-55 — günlük rapor demo',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    projectRouteId: null,
    factoryCode: 'IST-HAD',
    productCode: 'P-55',
    productName: 'Panel P-55',
    moldId: 'M-07',
    moldName: 'Panel PL1',
    shiftLabel: 'Öğle',
    volumeM3: 6.8,
    steelKg: 410,
    recipeId: 'RC-C35-02',
    planDayIso: reportDay,
  })

  const spawned1 = buildSpawnedWorkOrders(item1, 880_901, {
    assignerUserId: MOCK_WORK_QUEUE_VIEWER_ID,
  })
  const spawned2 = buildSpawnedWorkOrders(item2, 880_902, {
    assignerUserId: MOCK_WORK_QUEUE_VIEWER_ID,
  })

  const flowById: Record<string, ProductionWorkOrderFlowState> = {
    [item1.id]: buildCompletedFlow(
      spawned1.map((r) => r.id),
      completedMorning,
      'WH-IST-HAD-A1',
    ),
    [item2.id]: buildCompletedFlow(
      spawned2.map((r) => r.id),
      completedAfternoon,
      'WH-IST-HAD-A2',
    ),
  }

  return {
    items: [item1, item2, ...spawned1, ...spawned2],
    flowById,
    curingById: {},
    reportsByCuringId: {},
  }
}
