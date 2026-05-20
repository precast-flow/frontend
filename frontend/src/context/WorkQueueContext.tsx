import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  acknowledgeSteamOff,
  advanceCuringByTime,
  alreadyPourApproved,
  buildSpawnedWorkOrders,
  canApprovePour,
  canApproveWarehouseTransfer,
  canCompleteCuring,
  completeCuringFlow,
  createInitialCuringFlowState,
  createInitialPourFlowState,
  createInitialPostPourState,
  createInitialProductionFlowState,
  createInitialSampleFlowState,
  pauseCuringFlow,
  resumeCuringFlow,
  shouldAutoCompleteCuring,
  normalizeCuringFlowState,
  startCuringFlow,
  type CuringFlowState,
  type PourOrderFlowState,
  type PrePourCheckId,
  type ProductionWorkOrderFlowState,
  type SampleOrderFlowState,
} from '../data/productionWorkOrderFlow'
import { buildCuringReport, type CuringReport } from '../data/curingReport'
import { buildNcOrderNo, buildNonconformanceReportNo } from '../data/nonconformanceReport'
import {
  buildQualityControlReport,
  type QualityControlReport,
  type QualityReportIncludeKinds,
} from '../data/qualityControlReport'
import {
  appendNonconformanceStatus,
  buildNonconformanceWorkOrder,
  createNonconformanceRecord,
  ensureNonconformanceStatusHistory,
  type ControlPhase,
  type MarkerKind,
  type NonconformanceRecord,
  type QualityMarker,
  type ResponsibleUnit,
} from '../data/productionQualityControl'
import { getWarehouseById } from '../data/productionWarehouseMock'
import { enrichMarkersWithSpotSnapshots } from '../utils/enrichMarkersWithSpotSnapshots'
import { captureMarkerSpotSnapshot } from '../utils/drawingMarkerSnapshot'
import { resolveProductionDrawingUrl } from '../data/productionDrawingMock'
import {
  buildDailyProductionReport,
  findDailyReportForDay,
  listEligibleProductionOrders,
  type DailyProductionReport,
  type GenerateDailyReportResult,
} from '../data/dailyProductionReport'
import { buildDailyProductionReportDemoSeed } from '../data/dailyProductionReportDemoMock'
import { BLANK_PRODUCTION_WORK_ORDER } from '../data/productionWorkOrderBlankDemo'
import type { ManufacturedProduct } from '../data/manufacturedProduct'
import { buildQualityControlDemoSeed } from '../data/productionQualityControlDemoMock'
import {
  MOCK_WORK_QUEUE_VIEWER_ID,
  WORK_QUEUE_ITEMS,
  type WorkQueueItem,
} from '../data/workQueueMock'
import { NotificationFeedProvider, useNotificationFeed } from './NotificationFeedContext'

type SaveNonconformanceInput = {
  productionWorkQueueId: string
  phase: ControlPhase
  markerXPct: number
  markerYPct: number
  description: string
  responsibleUnit: ResponsibleUnit
  photos: { objectUrl: string; fileName: string }[]
}

type WorkQueueContextValue = {
  items: WorkQueueItem[]
  appendItems: (rows: WorkQueueItem[]) => void
  patchWorkQueueItem: (id: string, patch: Partial<WorkQueueItem>) => void
  getProductionFlowState: (workQueueId: string) => ProductionWorkOrderFlowState
  togglePrePourCheck: (workQueueId: string, checkId: PrePourCheckId) => void
  approvePourSpawn: (parent: WorkQueueItem) => boolean
  togglePostPourLabeling: (workQueueId: string) => void
  togglePostPourSurfaceCleaning: (workQueueId: string) => void
  approveWarehouseTransfer: (parent: WorkQueueItem, warehouseId: string) => boolean
  getCuringFlowState: (workQueueId: string) => CuringFlowState
  startCuring: (workQueueId: string) => void
  pauseCuring: (workQueueId: string, reason: string) => boolean
  resumeCuring: (workQueueId: string) => void
  acknowledgeCuringSteamOff: (workQueueId: string) => void
  completeCuringWithReport: (curingItem: WorkQueueItem) => CuringReport | null
  getPourFlowState: (workQueueId: string) => PourOrderFlowState
  approvePourOrder: (pourItem: WorkQueueItem) => boolean
  reportPourDelay: (pourItem: WorkQueueItem, note: string) => boolean
  cancelPourOrder: (pourItem: WorkQueueItem, note: string) => boolean
  getSampleFlowState: (workQueueId: string) => SampleOrderFlowState
  printSampleLabel: (sampleItem: WorkQueueItem) => string | null
  linkExistingSample: (sampleItem: WorkQueueItem, sampleId: string) => boolean
  completeSampleOrder: (sampleItem: WorkQueueItem) => boolean
  getCuringReport: (curingWorkQueueId: string) => CuringReport | undefined
  getCuringReportsForProductionOrder: (productionWorkQueueId: string) => CuringReport[]
  getCuringReportsForProduct: (productCode: string) => CuringReport[]
  getSpawnedChildren: (parentId: string) => WorkQueueItem[]
  getMarkers: (productionWorkQueueId: string, phase: ControlPhase) => QualityMarker[]
  addMarker: (
    productionWorkQueueId: string,
    phase: ControlPhase,
    kind: MarkerKind,
    xPct: number,
    yPct: number,
  ) => QualityMarker
  updateMarkerPosition: (productionWorkQueueId: string, markerId: string, xPct: number, yPct: number) => void
  updateMarkerNote: (productionWorkQueueId: string, markerId: string, note: string) => void
  deleteMarker: (productionWorkQueueId: string, markerId: string) => void
  saveWarningMarkerNote: (
    productionWorkQueueId: string,
    markerId: string,
    input: { description: string; photos: { objectUrl: string; fileName: string }[] },
  ) => void
  saveNonconformanceFromMarker: (
    parent: WorkQueueItem,
    marker: QualityMarker,
    input: Omit<SaveNonconformanceInput, 'productionWorkQueueId' | 'phase' | 'markerXPct' | 'markerYPct'>,
  ) => NonconformanceRecord | null
  getNonconformance: (id: string) => NonconformanceRecord | undefined
  getNonconformanceByWorkQueueId: (workQueueId: string) => NonconformanceRecord | undefined
  getNonconformanceByMarkerId: (
    productionWorkQueueId: string,
    markerId: string,
  ) => NonconformanceRecord | undefined
  getNonconformancesForProductionOrder: (productionWorkQueueId: string) => NonconformanceRecord[]
  getAllMarkersForProduction: (productionWorkQueueId: string) => QualityMarker[]
  getMarkerCountsForProduction: (productionWorkQueueId: string) => {
    pass: number
    warning: number
    error: number
  }
  getQualityControlReport: (productionWorkQueueId: string) => QualityControlReport | undefined
  generateQualityControlReport: (
    parent: WorkQueueItem,
    include: QualityReportIncludeKinds,
  ) => Promise<QualityControlReport | null>
  listEligibleForDailyReport: (reportDayIso: string, factoryCode: string) => ReturnType<
    typeof listEligibleProductionOrders
  >
  getDailyReportForDay: (factoryCode: string, reportDayIso: string) => DailyProductionReport | undefined
  getDailyProductionReport: (reportId: string) => DailyProductionReport | undefined
  listDailyReports: (factoryCode?: string) => DailyProductionReport[]
  generateDailyProductionReport: (
    reportDayIso: string,
    factoryCode: string,
  ) => GenerateDailyReportResult
  getManufacturedProducts: (factoryCode?: string) => ManufacturedProduct[]
  getManufacturedProductById: (id: string) => ManufacturedProduct | undefined
  isProductionOrderReported: (productionWorkQueueId: string) => boolean
  workQueueNavRequest: {
    workQueueId?: string
    openNcReportId?: string
    openQualityReportProductionId?: string
    openDailyReportId?: string
  } | null
  requestWorkQueueNav: (
    req: {
      workQueueId?: string
      openNcReportId?: string
      openQualityReportProductionId?: string
      openDailyReportId?: string
    } | null,
  ) => void
  routeNonconformance: (
    nonconformanceId: string,
    target: 'project' | 'production',
    instruction: string,
  ) => boolean
  advanceNonconformanceToAwaitingResolution: (nonconformanceId: string) => boolean
  resolveNonconformance: (nonconformanceId: string) => boolean
  closeNonconformance: (nonconformanceId: string) => boolean
}

const WorkQueueContext = createContext<WorkQueueContextValue | null>(null)

function normalizeFlowState(state: ProductionWorkOrderFlowState): ProductionWorkOrderFlowState {
  return {
    ...createInitialProductionFlowState(),
    ...state,
    checklist: { ...createInitialProductionFlowState().checklist, ...state.checklist },
    postPour: { ...createInitialPostPourState(), ...state.postPour },
  }
}

const QUALITY_CONTROL_DEMO_SEED = buildQualityControlDemoSeed()
const DAILY_REPORT_DEMO_SEED = buildDailyProductionReportDemoSeed()

function WorkQueueProviderInner({ children }: { children: ReactNode }) {
  const { prependNotification } = useNotificationFeed()
  const [items, setItems] = useState<WorkQueueItem[]>(() => [
    BLANK_PRODUCTION_WORK_ORDER,
    QUALITY_CONTROL_DEMO_SEED.productionItem,
    ...QUALITY_CONTROL_DEMO_SEED.extraItems,
    ...DAILY_REPORT_DEMO_SEED.items,
    ...WORK_QUEUE_ITEMS,
  ])
  const [flowById, setFlowById] = useState<Record<string, ProductionWorkOrderFlowState>>(() => ({
    ...QUALITY_CONTROL_DEMO_SEED.flowById,
    ...DAILY_REPORT_DEMO_SEED.flowById,
  }))
  const [curingById, setCuringById] = useState<Record<string, CuringFlowState>>(() => ({
    ...QUALITY_CONTROL_DEMO_SEED.curingById,
  }))
  const [pourById, setPourById] = useState<Record<string, PourOrderFlowState>>({})
  const [sampleById, setSampleById] = useState<Record<string, SampleOrderFlowState>>({})
  const [reportsByCuringId, setReportsByCuringId] = useState<Record<string, CuringReport>>(() => {
    const next: Record<string, CuringReport> = {}
    for (const [id, report] of Object.entries(QUALITY_CONTROL_DEMO_SEED.reportsByCuringId)) {
      if (report) next[id] = report
    }
    return next
  })
  const [markersByProductionId, setMarkersByProductionId] = useState<
    Record<string, QualityMarker[]>
  >(() => ({ ...QUALITY_CONTROL_DEMO_SEED.markersByProductionId }))
  const [nonconformancesById, setNonconformancesById] = useState<
    Record<string, NonconformanceRecord>
  >(() => ({ ...QUALITY_CONTROL_DEMO_SEED.nonconformancesById }))
  const [qualityReportsByProductionId, setQualityReportsByProductionId] = useState<
    Record<string, QualityControlReport>
  >(() => ({ ...QUALITY_CONTROL_DEMO_SEED.qualityReportsByProductionId }))
  const [dailyReportsById, setDailyReportsById] = useState<Record<string, DailyProductionReport>>(
    () => ({}),
  )
  const [manufacturedByProductionId, setManufacturedByProductionId] = useState<
    Record<string, ManufacturedProduct>
  >(() => ({}))
  const [workQueueNavRequest, setWorkQueueNavRequest] = useState<{
    workQueueId?: string
    openNcReportId?: string
    openQualityReportProductionId?: string
    openDailyReportId?: string
  } | null>(null)

  const requestWorkQueueNav = useCallback(
    (
      req: {
        workQueueId?: string
        openNcReportId?: string
        openQualityReportProductionId?: string
        openDailyReportId?: string
      } | null,
    ) => {
      setWorkQueueNavRequest(req)
    },
    [],
  )

  const listEligibleForDailyReport = useCallback(
    (reportDayIso: string, factoryCode: string) => {
      return listEligibleProductionOrders(items, flowById, factoryCode, reportDayIso)
    },
    [items, flowById],
  )

  const getDailyReportForDay = useCallback(
    (factoryCode: string, reportDayIso: string) => {
      return findDailyReportForDay(dailyReportsById, factoryCode, reportDayIso)
    },
    [dailyReportsById],
  )

  const getDailyProductionReport = useCallback(
    (reportId: string) => dailyReportsById[reportId],
    [dailyReportsById],
  )

  const listDailyReports = useCallback(
    (factoryCode?: string) => {
      let reports = Object.values(dailyReportsById)
      if (factoryCode) {
        reports = reports.filter((r) => r.factoryCode === factoryCode)
      }
      return reports.sort((a, b) => {
        const dayCmp = b.reportDayIso.localeCompare(a.reportDayIso)
        if (dayCmp !== 0) return dayCmp
        return b.createdAt.localeCompare(a.createdAt)
      })
    },
    [dailyReportsById],
  )

  const getManufacturedProducts = useCallback(
    (factoryCode?: string) => {
      const all = Object.values(manufacturedByProductionId)
      if (!factoryCode) return all
      return all.filter((p) => p.factoryCode === factoryCode)
    },
    [manufacturedByProductionId],
  )

  const getManufacturedProductById = useCallback(
    (id: string) => {
      const direct = Object.values(manufacturedByProductionId).find((p) => p.id === id)
      if (direct) return direct
      if (id.startsWith('mp-')) {
        const productionId = id.slice('mp-'.length)
        return manufacturedByProductionId[productionId]
      }
      return manufacturedByProductionId[id]
    },
    [manufacturedByProductionId],
  )

  const isProductionOrderReported = useCallback(
    (productionWorkQueueId: string) => {
      const flow = flowById[productionWorkQueueId]
      return Boolean(flow?.postPour.dailyProductionReportId ?? manufacturedByProductionId[productionWorkQueueId])
    },
    [flowById, manufacturedByProductionId],
  )

  const generateDailyProductionReport = useCallback(
    (reportDayIso: string, factoryCode: string): GenerateDailyReportResult => {
      const existing = findDailyReportForDay(dailyReportsById, factoryCode, reportDayIso)
      if (existing) {
        return { ok: false, reason: 'duplicate_day', existingReportId: existing.id }
      }

      const eligible = listEligibleProductionOrders(items, flowById, factoryCode, reportDayIso)
      if (eligible.length === 0) {
        return { ok: false, reason: 'empty' }
      }

      const { report, manufactured } = buildDailyProductionReport(
        eligible,
        reportDayIso,
        factoryCode,
      )

      setDailyReportsById((prev) => ({ ...prev, [report.id]: report }))
      setManufacturedByProductionId((prev) => {
        const next = { ...prev }
        for (const mp of manufactured) {
          next[mp.productionWorkQueueId] = mp
        }
        return next
      })
      setFlowById((prev) => {
        const next = { ...prev }
        for (const { item } of eligible) {
          const current = normalizeFlowState(next[item.id] ?? createInitialProductionFlowState())
          next[item.id] = {
            ...current,
            postPour: {
              ...current.postPour,
              dailyProductionReportId: report.id,
            },
          }
        }
        return next
      })

      prependNotification({
        id: `n-dpr-${report.id}-${Date.now()}`,
        title: 'Günlük üretim raporu oluşturuldu',
        detail: `${report.reportNo} · ${report.lines.length} ürün`,
        time: 'şimdi',
        moduleId: 'production-planning',
        openDailyReportId: report.id,
      })

      return { ok: true, report, manufactured }
    },
    [dailyReportsById, flowById, items, prependNotification],
  )

  const appendItems = useCallback((rows: WorkQueueItem[]) => {
    if (rows.length === 0) return
    setItems((prev) => [...rows, ...prev])
    setCuringById((prev) => {
      const next = { ...prev }
      for (const row of rows) {
        if (row.kind === 'curing_order' && !next[row.id]) {
          next[row.id] = createInitialCuringFlowState(Date.now())
        }
      }
      return next
    })
    setPourById((prev) => {
      const next = { ...prev }
      for (const row of rows) {
        if (row.kind === 'pour_order' && !next[row.id]) next[row.id] = createInitialPourFlowState()
      }
      return next
    })
    setSampleById((prev) => {
      const next = { ...prev }
      for (const row of rows) {
        if (row.kind === 'sample_order' && !next[row.id]) next[row.id] = createInitialSampleFlowState()
      }
      return next
    })
  }, [])

  const patchWorkQueueItem = useCallback((id: string, patch: Partial<WorkQueueItem>) => {
    setItems((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }, [])

  const getProductionFlowState = useCallback(
    (workQueueId: string): ProductionWorkOrderFlowState => {
      const raw = flowById[workQueueId]
      return raw ? normalizeFlowState(raw) : createInitialProductionFlowState()
    },
    [flowById],
  )

  const updateFlow = useCallback(
    (
      workQueueId: string,
      updater: (current: ProductionWorkOrderFlowState) => ProductionWorkOrderFlowState,
    ) => {
      setFlowById((prev) => {
        const current = normalizeFlowState(prev[workQueueId] ?? createInitialProductionFlowState())
        return { ...prev, [workQueueId]: updater(current) }
      })
    },
    [],
  )

  const togglePrePourCheck = useCallback((workQueueId: string, checkId: PrePourCheckId) => {
    updateFlow(workQueueId, (current) => {
      if (alreadyPourApproved(current)) return current
      return {
        ...current,
        checklist: {
          ...current.checklist,
          [checkId]: !current.checklist[checkId],
        },
      }
    })
  }, [updateFlow])

  const approvePourSpawn = useCallback(
    (parent: WorkQueueItem): boolean => {
      const current = normalizeFlowState(flowById[parent.id] ?? createInitialProductionFlowState())
      if (!canApprovePour(current)) return false

      const stamp = Date.now()
      const spawned = buildSpawnedWorkOrders(parent, stamp, {
        assignerUserId: MOCK_WORK_QUEUE_VIEWER_ID,
      })
      const pourApprovedAt = new Date().toISOString()

      setFlowById((prev) => ({
        ...prev,
        [parent.id]: {
          ...current,
          pourApprovedAt,
          spawnedChildIds: spawned.map((s) => s.id),
        },
      }))
      appendItems(spawned)

      prependNotification({
        id: `n-curing-${stamp}`,
        title: 'Kürleme emri oluşturuldu',
        detail: `${spawned[2]?.orderNo ?? parent.orderNo} · buhar kapatma takibi`,
        time: 'şimdi',
        moduleId: 'unit-work-queue',
      })

      return true
    },
    [flowById, appendItems, prependNotification],
  )

  const togglePostPourLabeling = useCallback(
    (workQueueId: string) => {
      updateFlow(workQueueId, (current) => {
        if (!alreadyPourApproved(current) || current.postPour.warehouseTransfer) return current
        return {
          ...current,
          postPour: {
            ...current.postPour,
            labelingDone: !current.postPour.labelingDone,
          },
        }
      })
    },
    [updateFlow],
  )

  const togglePostPourSurfaceCleaning = useCallback(
    (workQueueId: string) => {
      updateFlow(workQueueId, (current) => {
        if (!alreadyPourApproved(current) || current.postPour.warehouseTransfer) return current
        return {
          ...current,
          postPour: {
            ...current.postPour,
            surfaceCleaningDone: !current.postPour.surfaceCleaningDone,
          },
        }
      })
    },
    [updateFlow],
  )

  const getCuringReportsForProductionOrder = useCallback(
    (productionWorkQueueId: string) => {
      const childIds = new Set(
        items
          .filter((r) => r.parentWorkQueueId === productionWorkQueueId && r.kind === 'curing_order')
          .map((r) => r.id),
      )
      return Object.values(reportsByCuringId).filter((r) => childIds.has(r.curingWorkQueueId))
    },
    [items, reportsByCuringId],
  )

  const approveWarehouseTransfer = useCallback(
    (parent: WorkQueueItem, warehouseId: string): boolean => {
      const warehouse = getWarehouseById(warehouseId)
      if (!warehouse) return false

      const reports = (() => {
        const childIds = new Set(
          items
            .filter((r) => r.parentWorkQueueId === parent.id && r.kind === 'curing_order')
            .map((r) => r.id),
        )
        return Object.values(reportsByCuringId).filter((r) => childIds.has(r.curingWorkQueueId))
      })()

      const current = normalizeFlowState(flowById[parent.id] ?? createInitialProductionFlowState())
      if (!canApproveWarehouseTransfer(current, reports.length > 0)) return false

      const approvedAt = new Date().toISOString()
      setFlowById((prev) => ({
        ...prev,
        [parent.id]: {
          ...current,
          postPour: {
            ...current.postPour,
            warehouseTransfer: {
              warehouseId: warehouse.id,
              warehouseLabel: warehouse.label,
              approvedAt,
              approvedByUserId: MOCK_WORK_QUEUE_VIEWER_ID,
            },
            productionCompletedAt: approvedAt,
          },
        },
      }))
      setItems((prev) =>
        prev.map((row) =>
          row.id === parent.id ? { ...row, status: 'tamamlandi' as const } : row,
        ),
      )
      prependNotification({
        id: `n-warehouse-${parent.id}-${Date.now()}`,
        title: 'Depoya taşıma onayı',
        detail: `${parent.orderNo} → ${warehouse.label}`,
        time: 'şimdi',
        moduleId: 'unit-work-queue',
      })
      return true
    },
    [flowById, items, reportsByCuringId, prependNotification],
  )

  const getCuringFlowState = useCallback(
    (workQueueId: string): CuringFlowState => {
      const raw = curingById[workQueueId]
      return raw ? normalizeCuringFlowState(raw) : createInitialCuringFlowState()
    },
    [curingById],
  )

  const startCuring = useCallback((workQueueId: string) => {
    setCuringById((prev) => {
      const current = prev[workQueueId] ?? createInitialCuringFlowState()
      return { ...prev, [workQueueId]: startCuringFlow(current) }
    })
    setItems((prev) =>
      prev.map((row) =>
        row.id === workQueueId && row.status === 'beklemede'
          ? { ...row, status: 'islemde' as const }
          : row,
      ),
    )
  }, [])

  const pauseCuring = useCallback((workQueueId: string, reason: string): boolean => {
    let ok = false
    setCuringById((prev) => {
      const current = prev[workQueueId] ?? createInitialCuringFlowState()
      const next = pauseCuringFlow(current, reason.trim())
      ok = next !== current
      return { ...prev, [workQueueId]: next }
    })
    return ok
  }, [])

  const resumeCuring = useCallback((workQueueId: string) => {
    setCuringById((prev) => {
      const current = prev[workQueueId] ?? createInitialCuringFlowState()
      return { ...prev, [workQueueId]: resumeCuringFlow(current) }
    })
  }, [])

  const getPourFlowState = useCallback(
    (workQueueId: string) => pourById[workQueueId] ?? createInitialPourFlowState(),
    [pourById],
  )

  const getSampleFlowState = useCallback(
    (workQueueId: string) => sampleById[workQueueId] ?? createInitialSampleFlowState(),
    [sampleById],
  )

  const approvePourOrder = useCallback((pourItem: WorkQueueItem): boolean => {
    if (pourItem.kind !== 'pour_order') return false
    setPourById((prev) => ({
      ...prev,
      [pourItem.id]: { status: 'onaylandi', actionAt: Date.now() },
    }))
    setItems((prev) =>
      prev.map((row) =>
        row.id === pourItem.id ? { ...row, status: 'tamamlandi' as const } : row,
      ),
    )
    return true
  }, [])

  const reportPourDelay = useCallback((pourItem: WorkQueueItem, note: string): boolean => {
    const trimmed = note.trim()
    if (!trimmed || pourItem.kind !== 'pour_order') return false
    setPourById((prev) => ({
      ...prev,
      [pourItem.id]: { status: 'gecikme', note: trimmed, actionAt: Date.now() },
    }))
    setItems((prev) =>
      prev.map((row) =>
        row.id === pourItem.id ? { ...row, status: 'bloke' as const } : row,
      ),
    )
    return true
  }, [])

  const cancelPourOrder = useCallback((pourItem: WorkQueueItem, note: string): boolean => {
    const trimmed = note.trim()
    if (!trimmed || pourItem.kind !== 'pour_order') return false
    setPourById((prev) => ({
      ...prev,
      [pourItem.id]: { status: 'iptal', note: trimmed, actionAt: Date.now() },
    }))
    setItems((prev) =>
      prev.map((row) =>
        row.id === pourItem.id ? { ...row, status: 'bloke' as const } : row,
      ),
    )
    return true
  }, [])

  const printSampleLabel = useCallback((sampleItem: WorkQueueItem): string | null => {
    if (sampleItem.kind !== 'sample_order') return null
    const code = `NM-${sampleItem.orderNo.replace(/[^A-Z0-9]/gi, '')}-${String(Date.now()).slice(-4)}`
    setSampleById((prev) => ({
      ...prev,
      [sampleItem.id]: {
        status: 'etiket_yazdirildi',
        sampleLabelCode: code,
        actionAt: Date.now(),
      },
    }))
    setItems((prev) =>
      prev.map((row) =>
        row.id === sampleItem.id && row.status === 'beklemede'
          ? { ...row, status: 'islemde' as const }
          : row,
      ),
    )
    return code
  }, [])

  const linkExistingSample = useCallback((sampleItem: WorkQueueItem, sampleId: string): boolean => {
    if (!sampleId.trim() || sampleItem.kind !== 'sample_order') return false
    setSampleById((prev) => ({
      ...prev,
      [sampleItem.id]: {
        status: 'mevcut_numune_baglandi',
        linkedSampleId: sampleId.trim(),
        actionAt: Date.now(),
      },
    }))
    return true
  }, [])

  const completeSampleOrder = useCallback((sampleItem: WorkQueueItem): boolean => {
    if (sampleItem.kind !== 'sample_order') return false
    setSampleById((prev) => ({
      ...prev,
      [sampleItem.id]: {
        ...(prev[sampleItem.id] ?? createInitialSampleFlowState()),
        status: 'tamamlandi',
        actionAt: Date.now(),
      },
    }))
    setItems((prev) =>
      prev.map((row) =>
        row.id === sampleItem.id ? { ...row, status: 'tamamlandi' as const } : row,
      ),
    )
    return true
  }, [])

  const acknowledgeCuringSteamOff = useCallback((workQueueId: string) => {
    setCuringById((prev) => {
      const current = prev[workQueueId] ?? createInitialCuringFlowState()
      const next = acknowledgeSteamOff(current)
      if (next.status === 'bekleme_suresi') {
        prependNotification({
          id: `n-steam-${Date.now()}`,
          title: 'Buhar kapatıldı',
          detail: `Kürleme ${workQueueId} · bekleme süresi başladı`,
          time: 'şimdi',
          moduleId: 'unit-work-queue',
        })
      }
      return { ...prev, [workQueueId]: next }
    })
  }, [prependNotification])

  const getCuringReport = useCallback(
    (curingWorkQueueId: string) => reportsByCuringId[curingWorkQueueId],
    [reportsByCuringId],
  )

  const getCuringReportsForProduct = useCallback(
    (productCode: string) =>
      Object.values(reportsByCuringId).filter((r) => r.productCode === productCode),
    [reportsByCuringId],
  )

  const completeCuringWithReport = useCallback(
    (curingItem: WorkQueueItem): CuringReport | null => {
      const existing = reportsByCuringId[curingItem.id]
      if (existing) return existing

      const flow = curingById[curingItem.id] ?? createInitialCuringFlowState()
      if (!canCompleteCuring(flow)) return null

      const now = Date.now()
      const report = buildCuringReport(curingItem, flow, now)
      if (!report) return null

      setReportsByCuringId((prev) => ({ ...prev, [curingItem.id]: report }))
      setCuringById((prev) => ({
        ...prev,
        [curingItem.id]: completeCuringFlow(flow, now),
      }))
      setItems((prev) =>
        prev.map((row) =>
          row.id === curingItem.id ? { ...row, status: 'tamamlandi' as const } : row,
        ),
      )
      prependNotification({
        id: `n-curing-report-${report.id}`,
        title: 'Kürleme raporu oluşturuldu',
        detail: `${report.reportNo} · ${report.productName}`,
        time: 'şimdi',
        moduleId: 'unit-work-queue',
      })
      return report
    },
    [curingById, reportsByCuringId, prependNotification],
  )

  const getSpawnedChildren = useCallback(
    (parentId: string) => items.filter((row) => row.parentWorkQueueId === parentId),
    [items],
  )

  const getMarkers = useCallback(
    (productionWorkQueueId: string, phase: ControlPhase) => {
      const all = markersByProductionId[productionWorkQueueId] ?? []
      return all.filter((m) => m.phase === phase)
    },
    [markersByProductionId],
  )

  const attachMarkerSpotSnapshot = useCallback(
    async (parent: WorkQueueItem, markerId: string) => {
      const list = markersByProductionId[parent.id] ?? []
      const marker = list.find((m) => m.id === markerId)
      if (!marker || marker.spotSnapshotUrl) return
      try {
        const spotSnapshotUrl = await captureMarkerSpotSnapshot(
          resolveProductionDrawingUrl(parent),
          marker.xPct,
          marker.yPct,
          marker.kind,
        )
        setMarkersByProductionId((prev) => {
          const current = prev[parent.id] ?? []
          return {
            ...prev,
            [parent.id]: current.map((m) =>
              m.id === markerId ? { ...m, spotSnapshotUrl } : m,
            ),
          }
        })
      } catch {
        /* mock çizim yüklenemezse rapor oluşturma sırasında yeniden denenir */
      }
    },
    [markersByProductionId],
  )

  const addMarker = useCallback(
    (
      productionWorkQueueId: string,
      phase: ControlPhase,
      kind: MarkerKind,
      xPct: number,
      yPct: number,
    ): QualityMarker => {
      const marker: QualityMarker = {
        id: `mk-${productionWorkQueueId}-${Date.now()}`,
        productionWorkQueueId,
        phase,
        kind,
        xPct,
        yPct,
        createdAt: new Date().toISOString(),
        createdByUserId: MOCK_WORK_QUEUE_VIEWER_ID,
      }
      setMarkersByProductionId((prev) => {
        const list = prev[productionWorkQueueId] ?? []
        return { ...prev, [productionWorkQueueId]: [...list, marker] }
      })
      const parent = items.find((row) => row.id === productionWorkQueueId)
      if (parent) void attachMarkerSpotSnapshot(parent, marker.id)
      return marker
    },
    [items, attachMarkerSpotSnapshot],
  )

  const updateMarkerPosition = useCallback(
    (productionWorkQueueId: string, markerId: string, xPct: number, yPct: number) => {
      setMarkersByProductionId((prev) => {
        const list = prev[productionWorkQueueId] ?? []
        return {
          ...prev,
          [productionWorkQueueId]: list.map((m) =>
            m.id === markerId ? { ...m, xPct, yPct } : m,
          ),
        }
      })
    },
    [],
  )

  const updateMarkerNote = useCallback(
    (productionWorkQueueId: string, markerId: string, note: string) => {
      setMarkersByProductionId((prev) => {
        const list = prev[productionWorkQueueId] ?? []
        return {
          ...prev,
          [productionWorkQueueId]: list.map((m) =>
            m.id === markerId ? { ...m, note: note.trim() || undefined } : m,
          ),
        }
      })
    },
    [],
  )

  const deleteMarker = useCallback((productionWorkQueueId: string, markerId: string) => {
    setMarkersByProductionId((prev) => {
      const list = prev[productionWorkQueueId] ?? []
      return {
        ...prev,
        [productionWorkQueueId]: list.filter((m) => m.id !== markerId),
      }
    })
  }, [])

  const saveWarningMarkerNote = useCallback(
    (
      productionWorkQueueId: string,
      markerId: string,
      input: { description: string; photos: { objectUrl: string; fileName: string }[] },
    ) => {
      const stamp = Date.now()
      setMarkersByProductionId((prev) => {
        const list = prev[productionWorkQueueId] ?? []
        return {
          ...prev,
          [productionWorkQueueId]: list.map((m) =>
            m.id === markerId
              ? {
                  ...m,
                  note: input.description,
                  notePhotos: input.photos.map((p, i) => ({
                    id: `ph-w-${stamp}-${i}`,
                    objectUrl: p.objectUrl,
                    fileName: p.fileName,
                  })),
                }
              : m,
          ),
        }
      })
    },
    [],
  )

  const saveNonconformanceFromMarker = useCallback(
    (
      parent: WorkQueueItem,
      marker: QualityMarker,
      input: Omit<
        SaveNonconformanceInput,
        'productionWorkQueueId' | 'phase' | 'markerXPct' | 'markerYPct'
      >,
    ): NonconformanceRecord | null => {
      if (marker.kind !== 'error') return null

      if (marker.nonconformanceId) {
        const existing = nonconformancesById[marker.nonconformanceId]
        if (existing) return existing
      }

      const existingByMarker = Object.values(nonconformancesById).find(
        (r) => r.productionWorkQueueId === parent.id && r.markerId === marker.id,
      )
      if (existingByMarker) return existingByMarker

      const stamp = Date.now()
      const ncId = `nc-${stamp}`
      const wqId = `wq-nc-${parent.id}-${String(stamp).slice(-6)}`
      const record = createNonconformanceRecord({
        id: ncId,
        reportNo: buildNonconformanceReportNo(parent.orderNo, stamp),
        ncOrderNo: buildNcOrderNo(parent.orderNo, stamp),
        workQueueId: wqId,
        productionWorkQueueId: parent.id,
        markerId: marker.id,
        phase: marker.phase,
        description: input.description,
        responsibleUnit: input.responsibleUnit,
        photos: input.photos.map((p, i) => ({
          id: `ph-${stamp}-${i}`,
          objectUrl: p.objectUrl,
          fileName: p.fileName,
        })),
        markerXPct: marker.xPct,
        markerYPct: marker.yPct,
        parent,
      })

      const workOrder = buildNonconformanceWorkOrder(parent, record, stamp)

      setMarkersByProductionId((prev) => {
        const list = prev[parent.id] ?? []
        return {
          ...prev,
          [parent.id]: list.map((m) =>
            m.id === marker.id
              ? {
                  ...m,
                  nonconformanceId: ncId,
                  note: input.description,
                  notePhotos: input.photos.map((p, i) => ({
                    id: `ph-${stamp}-${i}`,
                    objectUrl: p.objectUrl,
                    fileName: p.fileName,
                  })),
                }
              : m,
          ),
        }
      })
      setNonconformancesById((prev) => ({ ...prev, [ncId]: record }))
      appendItems([workOrder])

      prependNotification({
        id: `n-nc-${ncId}`,
        title: 'Uygunsuzluk tespiti',
        detail: `${parent.orderNo} · üretim amiri incelemesinde`,
        time: 'şimdi',
        moduleId: 'unit-work-queue',
        workQueueId: wqId,
        nonconformanceId: ncId,
      })

      return record
    },
    [appendItems, prependNotification, nonconformancesById],
  )

  const getNonconformance = useCallback(
    (id: string) => {
      const row = nonconformancesById[id]
      return row ? ensureNonconformanceStatusHistory(row) : undefined
    },
    [nonconformancesById],
  )

  const getNonconformanceByWorkQueueId = useCallback(
    (workQueueId: string) => {
      const row = Object.values(nonconformancesById).find((r) => r.workQueueId === workQueueId)
      return row ? ensureNonconformanceStatusHistory(row) : undefined
    },
    [nonconformancesById],
  )

  const getNonconformanceByMarkerId = useCallback(
    (productionWorkQueueId: string, markerId: string) =>
      Object.values(nonconformancesById).find(
        (r) => r.productionWorkQueueId === productionWorkQueueId && r.markerId === markerId,
      ),
    [nonconformancesById],
  )

  const getNonconformancesForProductionOrder = useCallback(
    (productionWorkQueueId: string) =>
      Object.values(nonconformancesById)
        .filter((r) => r.productionWorkQueueId === productionWorkQueueId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [nonconformancesById],
  )

  const getAllMarkersForProduction = useCallback(
    (productionWorkQueueId: string) => markersByProductionId[productionWorkQueueId] ?? [],
    [markersByProductionId],
  )

  const getMarkerCountsForProduction = useCallback(
    (productionWorkQueueId: string) => {
      const list = markersByProductionId[productionWorkQueueId] ?? []
      return {
        pass: list.filter((m) => m.kind === 'pass').length,
        warning: list.filter((m) => m.kind === 'warning').length,
        error: list.filter((m) => m.kind === 'error').length,
      }
    },
    [markersByProductionId],
  )

  const getQualityControlReport = useCallback(
    (productionWorkQueueId: string) => qualityReportsByProductionId[productionWorkQueueId],
    [qualityReportsByProductionId],
  )

  const generateQualityControlReport = useCallback(
    async (
      parent: WorkQueueItem,
      include: QualityReportIncludeKinds,
    ): Promise<QualityControlReport | null> => {
      const rawMarkers = markersByProductionId[parent.id] ?? []
      const includedIds = new Set(
        rawMarkers
          .filter((m) => {
            if (m.kind === 'pass') return include.pass
            if (m.kind === 'warning') return include.warning
            return include.error
          })
          .map((m) => m.id),
      )
      const enriched = await enrichMarkersWithSpotSnapshots(parent, rawMarkers, includedIds)
      setMarkersByProductionId((prev) => ({ ...prev, [parent.id]: enriched }))

      const report = buildQualityControlReport(
        parent,
        enriched,
        include,
        MOCK_WORK_QUEUE_VIEWER_ID,
        (marker) => {
          if (marker.kind !== 'error' || !marker.nonconformanceId) return undefined
          return nonconformancesById[marker.nonconformanceId]?.responsibleUnit
        },
      )
      if (!report) return null

      setQualityReportsByProductionId((prev) => ({ ...prev, [parent.id]: report }))

      prependNotification({
        id: `n-qcr-${parent.id}-${Date.now()}`,
        title: 'Kalite kontrol raporu',
        detail: `${report.reportNo} · ${report.entries.length} işaret`,
        time: 'şimdi',
        moduleId: 'unit-work-queue',
        workQueueId: parent.id,
        openQualityReportProductionId: parent.id,
      })

      return report
    },
    [markersByProductionId, nonconformancesById, prependNotification],
  )

  const routeNonconformance = useCallback(
    (nonconformanceId: string, target: 'project' | 'production', instruction: string): boolean => {
      const record = nonconformancesById[nonconformanceId]
      if (!record || record.status !== 'manager_review') return false
      if (!instruction.trim()) return false

      const routedAt = new Date().toISOString()
      const targetUnit = target === 'project' ? 'drawing' : 'production'
      const assigneeUserId = target === 'project' ? 'u5' : 'u-emre'
      const routedStatus = target === 'project' ? 'routed_project' : 'routed_production'

      setNonconformancesById((prev) => {
        const current = prev[nonconformanceId]
        if (!current) return prev
        const next = appendNonconformanceStatus(
          current,
          routedStatus,
          routedAt,
          MOCK_WORK_QUEUE_VIEWER_ID,
          instruction.trim(),
        )
        return {
          ...prev,
          [nonconformanceId]: {
            ...next,
            routingInstruction: instruction.trim(),
            routedAt,
            routedByUserId: MOCK_WORK_QUEUE_VIEWER_ID,
            routedToTarget: target,
          },
        }
      })

      setItems((prev) =>
        prev.map((row) =>
          row.id === record.workQueueId
            ? {
                ...row,
                targetUnit,
                toUnit: targetUnit,
                assigneeUserId,
                status: 'islemde' as const,
                lastUpdatedLabel: routedAt,
              }
            : row,
        ),
      )

      prependNotification({
        id: `n-nc-route-${nonconformanceId}`,
        title: 'Uygunsuzluk yönlendirildi',
        detail: target === 'project' ? 'Proje birimi' : 'Üretim birimi',
        time: 'şimdi',
        moduleId: 'unit-work-queue',
      })

      return true
    },
    [nonconformancesById, prependNotification],
  )

  const advanceNonconformanceToAwaitingResolution = useCallback(
    (nonconformanceId: string): boolean => {
      const record = nonconformancesById[nonconformanceId]
      if (
        !record ||
        (record.status !== 'routed_project' && record.status !== 'routed_production')
      ) {
        return false
      }
      const at = new Date().toISOString()
      setNonconformancesById((prev) => ({
        ...prev,
        [nonconformanceId]: appendNonconformanceStatus(
          record,
          'awaiting_resolution',
          at,
          MOCK_WORK_QUEUE_VIEWER_ID,
        ),
      }))
      return true
    },
    [nonconformancesById],
  )

  const resolveNonconformance = useCallback((nonconformanceId: string): boolean => {
    const record = nonconformancesById[nonconformanceId]
    if (!record || record.status !== 'awaiting_resolution') return false
    const at = new Date().toISOString()
    setNonconformancesById((prev) => ({
      ...prev,
      [nonconformanceId]: appendNonconformanceStatus(
        record,
        'resolved',
        at,
        MOCK_WORK_QUEUE_VIEWER_ID,
      ),
    }))
    return true
  }, [nonconformancesById])

  const closeNonconformance = useCallback((nonconformanceId: string): boolean => {
    const record = nonconformancesById[nonconformanceId]
    if (!record || record.status !== 'resolved') return false
    const at = new Date().toISOString()
    setNonconformancesById((prev) => ({
      ...prev,
      [nonconformanceId]: appendNonconformanceStatus(
        record,
        'closed',
        at,
        MOCK_WORK_QUEUE_VIEWER_ID,
      ),
    }))
    setItems((prev) =>
      prev.map((row) =>
        row.id === record.workQueueId ? { ...row, status: 'tamamlandi' as const } : row,
      ),
    )
    return true
  }, [nonconformancesById])

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      setCuringById((prev) => {
        let changed = false
        const next: Record<string, CuringFlowState> = { ...prev }
        for (const [id, state] of Object.entries(prev)) {
          const advanced = advanceCuringByTime(state, now)
          if (advanced !== state) {
            next[id] = advanced
            changed = true
            if (
              advanced.status === 'buhar_kapatma_bekleniyor' &&
              state.status === 'kurleme_basladi'
            ) {
              prependNotification({
                id: `n-steam-warn-${id}-${now}`,
                title: 'Buhar makinesini kapatın',
                detail: `Kürleme emri · buhar kapatma zamanı geldi`,
                time: 'şimdi',
                moduleId: 'unit-work-queue',
              })
            }
          }
        }
        return changed ? next : prev
      })

      for (const row of items) {
        if (row.kind !== 'curing_order') continue
        const flow = curingById[row.id]
        if (!flow || !shouldAutoCompleteCuring(flow, now)) continue
        if (reportsByCuringId[row.id]) continue
        completeCuringWithReport(row)
      }
    }
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [prependNotification, items, curingById, reportsByCuringId, completeCuringWithReport])

  const value = useMemo(
    () => ({
      items,
      appendItems,
      patchWorkQueueItem,
      getProductionFlowState,
      togglePrePourCheck,
      approvePourSpawn,
      togglePostPourLabeling,
      togglePostPourSurfaceCleaning,
      approveWarehouseTransfer,
      getCuringFlowState,
      startCuring,
      pauseCuring,
      resumeCuring,
      acknowledgeCuringSteamOff,
      completeCuringWithReport,
      getPourFlowState,
      approvePourOrder,
      reportPourDelay,
      cancelPourOrder,
      getSampleFlowState,
      printSampleLabel,
      linkExistingSample,
      completeSampleOrder,
      getCuringReport,
      getCuringReportsForProductionOrder,
      getCuringReportsForProduct,
      getSpawnedChildren,
      getMarkers,
      addMarker,
      updateMarkerPosition,
      updateMarkerNote,
      deleteMarker,
      saveWarningMarkerNote,
      saveNonconformanceFromMarker,
      getNonconformance,
      getNonconformanceByWorkQueueId,
      getNonconformanceByMarkerId,
      getNonconformancesForProductionOrder,
      getAllMarkersForProduction,
      getMarkerCountsForProduction,
      getQualityControlReport,
      generateQualityControlReport,
      listEligibleForDailyReport,
      getDailyReportForDay,
      getDailyProductionReport,
      listDailyReports,
      generateDailyProductionReport,
      getManufacturedProducts,
      getManufacturedProductById,
      isProductionOrderReported,
      workQueueNavRequest,
      requestWorkQueueNav,
      routeNonconformance,
      advanceNonconformanceToAwaitingResolution,
      resolveNonconformance,
      closeNonconformance,
    }),
    [
      items,
      appendItems,
      patchWorkQueueItem,
      getProductionFlowState,
      togglePrePourCheck,
      approvePourSpawn,
      togglePostPourLabeling,
      togglePostPourSurfaceCleaning,
      approveWarehouseTransfer,
      getCuringFlowState,
      startCuring,
      pauseCuring,
      resumeCuring,
      acknowledgeCuringSteamOff,
      completeCuringWithReport,
      getPourFlowState,
      approvePourOrder,
      reportPourDelay,
      cancelPourOrder,
      getSampleFlowState,
      printSampleLabel,
      linkExistingSample,
      completeSampleOrder,
      getCuringReport,
      getCuringReportsForProductionOrder,
      getCuringReportsForProduct,
      getSpawnedChildren,
      getMarkers,
      addMarker,
      updateMarkerPosition,
      updateMarkerNote,
      deleteMarker,
      saveWarningMarkerNote,
      saveNonconformanceFromMarker,
      getNonconformance,
      getNonconformanceByWorkQueueId,
      getNonconformanceByMarkerId,
      getNonconformancesForProductionOrder,
      getAllMarkersForProduction,
      getMarkerCountsForProduction,
      getQualityControlReport,
      generateQualityControlReport,
      listEligibleForDailyReport,
      getDailyReportForDay,
      getDailyProductionReport,
      listDailyReports,
      generateDailyProductionReport,
      getManufacturedProducts,
      getManufacturedProductById,
      isProductionOrderReported,
      workQueueNavRequest,
      requestWorkQueueNav,
      routeNonconformance,
      advanceNonconformanceToAwaitingResolution,
      resolveNonconformance,
      closeNonconformance,
    ],
  )

  return <WorkQueueContext.Provider value={value}>{children}</WorkQueueContext.Provider>
}

export function WorkQueueProvider({ children }: { children: ReactNode }) {
  return (
    <NotificationFeedProvider>
      <WorkQueueProviderInner>{children}</WorkQueueProviderInner>
    </NotificationFeedProvider>
  )
}

export function useWorkQueue(): WorkQueueContextValue {
  const ctx = useContext(WorkQueueContext)
  if (!ctx) {
    throw new Error('useWorkQueue must be used within WorkQueueProvider')
  }
  return ctx
}

export function useWorkQueueOptional(): WorkQueueContextValue | null {
  return useContext(WorkQueueContext)
}
