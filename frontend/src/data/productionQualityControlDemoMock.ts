import { buildCuringReport } from './curingReport'
import { buildNonconformanceReportNo, buildNcOrderNo } from './nonconformanceReport'
import { S2_KOLON_DRAWING_PDF } from './productionDrawingMock'
import {
  PRE_POUR_CHECKS,
  buildSpawnedWorkOrders,
  createInitialCuringFlowState,
  createInitialPostPourState,
  type CuringFlowState,
  type ProductionWorkOrderFlowState,
} from './productionWorkOrderFlow'
import {
  buildNonconformanceWorkOrder,
  createNonconformanceRecord,
  type NonconformanceRecord,
  type QualityMarker,
} from './productionQualityControl'
import {
  buildQualityControlReport,
  type QualityControlReport,
} from './qualityControlReport'
import { getWarehouseById } from './productionWarehouseMock'
import {
  MOCK_WORK_QUEUE_VIEWER_ID,
  type WorkQueueItem,
} from './workQueueMock'

/** Birim iş kuyruğunda doğrudan açılacak demo üretim emri */
export const QUALITY_CONTROL_DEMO_PRODUCTION_ID = 'wq-qc-demo-full'

const DEMO_STAMP = 990_001
const DEMO_CREATED_AT = '2025-05-06T08:30:00.000Z'
const DEMO_POUR_AT = '2025-05-06T09:15:00.000Z'
const DEMO_SPOT_SNAPSHOT = S2_KOLON_DRAWING_PDF

type MarkerSeed = {
  id: string
  phase: QualityMarker['phase']
  kind: QualityMarker['kind']
  xPct: number
  yPct: number
  note?: string
  nc?: boolean
}

const MARKER_SEEDS: MarkerSeed[] = [
  { id: 'mk-demo-pp-pass-1', phase: 'pre_pour', kind: 'pass', xPct: 14, yPct: 22 },
  { id: 'mk-demo-pp-pass-2', phase: 'pre_pour', kind: 'pass', xPct: 32, yPct: 28 },
  { id: 'mk-demo-pp-pass-3', phase: 'pre_pour', kind: 'pass', xPct: 52, yPct: 34 },
  { id: 'mk-demo-pp-pass-4', phase: 'pre_pour', kind: 'pass', xPct: 72, yPct: 38 },
  { id: 'mk-demo-pp-pass-5', phase: 'pre_pour', kind: 'pass', xPct: 46, yPct: 52 },
  {
    id: 'mk-demo-pp-warn-1',
    phase: 'pre_pour',
    kind: 'warning',
    xPct: 24,
    yPct: 64,
    note: 'Donatı aralığında hafif sapma — şantiye şefi bilgilendirildi.',
  },
  {
    id: 'mk-demo-pp-warn-2',
    phase: 'pre_pour',
    kind: 'warning',
    xPct: 58,
    yPct: 72,
    note: 'Lifting ankraj bölgesinde yüzey kırığı riski; foto ile kayıt altında.',
  },
  {
    id: 'mk-demo-pp-err-1',
    phase: 'pre_pour',
    kind: 'error',
    xPct: 38,
    yPct: 82,
    note: 'Yerleşim toleransı dışı boşluk — uygunsuzluk iş emri açıldı.',
    nc: true,
  },
  {
    id: 'mk-demo-pp-err-2',
    phase: 'pre_pour',
    kind: 'error',
    xPct: 78,
    yPct: 18,
    note: 'Kalıp içi yabancı cisim — döküm öncesi temizlik tekrarlandı.',
    nc: true,
  },
  { id: 'mk-demo-post-pass-1', phase: 'post_pour', kind: 'pass', xPct: 20, yPct: 44 },
  { id: 'mk-demo-post-pass-2', phase: 'post_pour', kind: 'pass', xPct: 62, yPct: 48 },
  {
    id: 'mk-demo-post-warn-1',
    phase: 'post_pour',
    kind: 'warning',
    xPct: 44,
    yPct: 66,
    note: 'Yüzeyde hava kabarcığı izi — kürleme öncesi kontrol edilecek.',
  },
  {
    id: 'mk-demo-post-err-1',
    phase: 'post_pour',
    kind: 'error',
    xPct: 84,
    yPct: 58,
    note: 'Köşe çapak fazlası — taşlama planlandı.',
    nc: true,
  },
]

function buildDemoProductionItem(): WorkQueueItem {
  return {
    id: QUALITY_CONTROL_DEMO_PRODUCTION_ID,
    orderNo: 'IW-DEMO-QC-001',
    title: 'DEMO — Tam kalite kontrolü (hazır)',
    summary:
      'Döküm öncesi/sonrası tüm kontroller, işaretler ve kalite raporu dolu — doğrudan raporu inceleyin.',
    detailBody:
      'Bu kayıt yalnızca demo içindir.\n' +
      '• 8/8 döküm öncesi kontrol tamam\n' +
      '• Döküm onayı ve alt emirler oluşturuldu\n' +
      '• 5 uygun + 2 uyarı + 2 uygunsuz (ön) · 2 uygun + 1 uyarı + 1 uygunsuz (sonrası)\n' +
      '• Kalite kontrol raporu (KR) hazır\n' +
      '• Kürleme raporu tamamlandı',
    kind: 'production',
    status: 'islemde',
    priority: 'normal',
    targetUnit: 'production',
    fromUnit: 'planning',
    toUnit: 'production',
    assigneeUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    assignerUserId: 'u-emre',
    projectCode: 'PRJ-ATL-441',
    projectName: 'Atlı sanayi hattı (demo)',
    projectRouteId: 'pm-3',
    factoryCode: 'IST-HAD',
    daysOnDesk: 0,
    lastUpdatedLabel: '06.05.2025 09:45',
    dueToday: true,
    productCode: 'S2-KOLON',
    productName: 'S2 Kolon — demo',
    moldId: 'MOLD-D14',
    moldName: 'Hat D — demo kalıbı',
    shiftLabel: 'Öğle',
    volumeM3: 12.4,
    steelKg: 1840,
    recipeId: 'R-884',
    planDayIso: '2025-05-06',
    fieldNotes: 'Demo: tüm kalite akışı önceden doldurulmuştur.',
    drawingPreviewUrl: S2_KOLON_DRAWING_PDF,
  }
}

function buildMarkers(parentId: string): QualityMarker[] {
  return MARKER_SEEDS.map((seed) => ({
    id: seed.id,
    productionWorkQueueId: parentId,
    phase: seed.phase,
    kind: seed.kind,
    xPct: seed.xPct,
    yPct: seed.yPct,
    createdAt: DEMO_CREATED_AT,
    createdByUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    note: seed.note,
    spotSnapshotUrl: DEMO_SPOT_SNAPSHOT,
  }))
}

function attachNonconformances(
  parent: WorkQueueItem,
  markers: QualityMarker[],
): { records: Record<string, NonconformanceRecord>; markers: QualityMarker[]; ncItems: WorkQueueItem[] } {
  const records: Record<string, NonconformanceRecord> = {}
  const ncItems: WorkQueueItem[] = []
  let ncIndex = 0

  const nextMarkers = markers.map((marker) => {
    const seed = MARKER_SEEDS.find((s) => s.id === marker.id)
    if (!seed?.nc || marker.kind !== 'error') return marker

    ncIndex += 1
    const stamp = DEMO_STAMP + ncIndex
    const ncId = `nc-demo-${ncIndex}`
    const wqId = `wq-nc-demo-${ncIndex}`
    const record = createNonconformanceRecord({
      id: ncId,
      reportNo: buildNonconformanceReportNo(parent.orderNo, stamp),
      ncOrderNo: buildNcOrderNo(parent.orderNo, stamp),
      workQueueId: wqId,
      productionWorkQueueId: parent.id,
      markerId: marker.id,
      phase: marker.phase,
      description: marker.note ?? 'Demo uygunsuzluk',
      responsibleUnit: marker.phase === 'pre_pour' ? 'production' : 'quality',
      photos: [],
      markerXPct: marker.xPct,
      markerYPct: marker.yPct,
      parent,
      createdByUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    })
    records[ncId] = record
    ncItems.push(buildNonconformanceWorkOrder(parent, record, stamp))
    return { ...marker, nonconformanceId: ncId }
  })

  return { records, markers: nextMarkers, ncItems }
}

function buildDemoFlow(spawnedIds: string[]): ProductionWorkOrderFlowState {
  const checklist = Object.fromEntries(PRE_POUR_CHECKS.map((c) => [c.id, true])) as ProductionWorkOrderFlowState['checklist']
  const warehouse =
    getWarehouseById('WH-IST-HAD-A1') ??
    getWarehouseById('WH-IST-HAD-A2')
  const postPour = createInitialPostPourState()
  postPour.labelingDone = true
  postPour.surfaceCleaningDone = true
  if (warehouse) {
    postPour.warehouseTransfer = {
      warehouseId: warehouse.id,
      warehouseLabel: warehouse.label,
      approvedAt: '2025-05-06T11:00:00.000Z',
      approvedByUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    }
  }
  postPour.productionCompletedAt = '2025-05-06T11:15:00.000Z'

  return {
    checklist,
    rebarScans: [],
    pourApprovedAt: DEMO_POUR_AT,
    spawnedChildIds: spawnedIds,
    postPour,
  }
}

function buildCompletedCuringFlow(): { flow: CuringFlowState; completedAt: number } {
  const completedAt = Date.parse('2025-05-06T10:45:00.000Z')
  const startedAt = completedAt - 120_000
  const steamOffDueAt = startedAt + 30_000
  const steamAcknowledgedAt = steamOffDueAt + 5_000
  const flow: CuringFlowState = {
    ...createInitialCuringFlowState(startedAt),
    status: 'tamamlandi',
    startedAt,
    steamOffDueAt,
    steamWarningAt: steamOffDueAt,
    steamAcknowledgedAt,
    completeDueAt: completedAt,
    completedAt,
    expectedCuringEndAt: completedAt,
  }
  return { flow, completedAt }
}

export type QualityControlDemoSeed = {
  productionItem: WorkQueueItem
  extraItems: WorkQueueItem[]
  flowById: Record<string, ProductionWorkOrderFlowState>
  markersByProductionId: Record<string, QualityMarker[]>
  nonconformancesById: Record<string, NonconformanceRecord>
  qualityReportsByProductionId: Record<string, QualityControlReport>
  curingById: Record<string, CuringFlowState>
  reportsByCuringId: Record<string, ReturnType<typeof buildCuringReport>>
}

export function buildQualityControlDemoSeed(): QualityControlDemoSeed {
  const productionItem = buildDemoProductionItem()
  const spawned = buildSpawnedWorkOrders(productionItem, DEMO_STAMP, {
    assignerUserId: MOCK_WORK_QUEUE_VIEWER_ID,
  })
  const spawnedIds = spawned.map((row) => row.id)

  let markers = buildMarkers(productionItem.id)
  const { records, markers: withNc, ncItems } = attachNonconformances(productionItem, markers)
  markers = withNc

  const qualityReport = buildQualityControlReport(
    productionItem,
    markers,
    { pass: true, warning: true, error: true },
    MOCK_WORK_QUEUE_VIEWER_ID,
    (marker) => {
      if (!marker.nonconformanceId) return undefined
      return records[marker.nonconformanceId]?.responsibleUnit
    },
  )
  if (!qualityReport) {
    throw new Error('Demo kalite raporu oluşturulamadı')
  }

  const curingItem = spawned.find((row) => row.kind === 'curing_order')
  const curingById: Record<string, CuringFlowState> = {}
  const reportsByCuringId: Record<string, ReturnType<typeof buildCuringReport>> = {}
  if (curingItem) {
    const { flow, completedAt } = buildCompletedCuringFlow()
    curingById[curingItem.id] = flow
    const curingReport = buildCuringReport(curingItem, flow, completedAt)
    if (curingReport) {
      reportsByCuringId[curingItem.id] = curingReport
      curingItem.status = 'tamamlandi'
    }
  }

  const flowById: Record<string, ProductionWorkOrderFlowState> = {
    [productionItem.id]: buildDemoFlow(spawnedIds),
  }

  return {
    productionItem,
    extraItems: [...spawned, ...ncItems],
    flowById,
    markersByProductionId: { [productionItem.id]: markers },
    nonconformancesById: records,
    qualityReportsByProductionId: { [productionItem.id]: qualityReport },
    curingById,
    reportsByCuringId,
  }
}
