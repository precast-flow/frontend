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
  canCompleteCuring,
  completeCuringFlow,
  createInitialCuringFlowState,
  createInitialProductionFlowState,
  startCuringFlow,
  type CuringFlowState,
  type PrePourCheckId,
  type ProductionWorkOrderFlowState,
} from '../data/productionWorkOrderFlow'
import { buildCuringReport, type CuringReport } from '../data/curingReport'
import {
  MOCK_WORK_QUEUE_VIEWER_ID,
  WORK_QUEUE_ITEMS,
  type WorkQueueItem,
} from '../data/workQueueMock'
import { NotificationFeedProvider, useNotificationFeed } from './NotificationFeedContext'

type WorkQueueContextValue = {
  items: WorkQueueItem[]
  appendItems: (rows: WorkQueueItem[]) => void
  getProductionFlowState: (workQueueId: string) => ProductionWorkOrderFlowState
  togglePrePourCheck: (workQueueId: string, checkId: PrePourCheckId) => void
  approvePourSpawn: (parent: WorkQueueItem) => boolean
  getCuringFlowState: (workQueueId: string) => CuringFlowState
  startCuring: (workQueueId: string) => void
  acknowledgeCuringSteamOff: (workQueueId: string) => void
  completeCuringWithReport: (curingItem: WorkQueueItem) => CuringReport | null
  getCuringReport: (curingWorkQueueId: string) => CuringReport | undefined
  getCuringReportsForProductionOrder: (productionWorkQueueId: string) => CuringReport[]
  getCuringReportsForProduct: (productCode: string) => CuringReport[]
  getSpawnedChildren: (parentId: string) => WorkQueueItem[]
}

const WorkQueueContext = createContext<WorkQueueContextValue | null>(null)

function WorkQueueProviderInner({ children }: { children: ReactNode }) {
  const { prependNotification } = useNotificationFeed()
  const [items, setItems] = useState<WorkQueueItem[]>(() => [...WORK_QUEUE_ITEMS])
  const [flowById, setFlowById] = useState<Record<string, ProductionWorkOrderFlowState>>({})
  const [curingById, setCuringById] = useState<Record<string, CuringFlowState>>({})
  const [reportsByCuringId, setReportsByCuringId] = useState<Record<string, CuringReport>>({})

  const appendItems = useCallback((rows: WorkQueueItem[]) => {
    if (rows.length === 0) return
    setItems((prev) => [...rows, ...prev])
    setCuringById((prev) => {
      const next = { ...prev }
      for (const row of rows) {
        if (row.kind === 'curing_order' && !next[row.id]) {
          next[row.id] = createInitialCuringFlowState()
        }
      }
      return next
    })
  }, [])

  const getProductionFlowState = useCallback(
    (workQueueId: string): ProductionWorkOrderFlowState => {
      return flowById[workQueueId] ?? createInitialProductionFlowState()
    },
    [flowById],
  )

  const togglePrePourCheck = useCallback((workQueueId: string, checkId: PrePourCheckId) => {
    setFlowById((prev) => {
      const current = prev[workQueueId] ?? createInitialProductionFlowState()
      if (alreadyPourApproved(current)) return prev
      return {
        ...prev,
        [workQueueId]: {
          ...current,
          checklist: {
            ...current.checklist,
            [checkId]: !current.checklist[checkId],
          },
        },
      }
    })
  }, [])

  const approvePourSpawn = useCallback(
    (parent: WorkQueueItem): boolean => {
      const current = flowById[parent.id] ?? createInitialProductionFlowState()
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

  const getCuringFlowState = useCallback(
    (workQueueId: string): CuringFlowState => {
      return curingById[workQueueId] ?? createInitialCuringFlowState()
    },
    [curingById],
  )

  const startCuring = useCallback((workQueueId: string) => {
    setCuringById((prev) => {
      const current = prev[workQueueId] ?? createInitialCuringFlowState()
      return { ...prev, [workQueueId]: startCuringFlow(current) }
    })
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
    }
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [prependNotification])

  const value = useMemo(
    () => ({
      items,
      appendItems,
      getProductionFlowState,
      togglePrePourCheck,
      approvePourSpawn,
      getCuringFlowState,
      startCuring,
      acknowledgeCuringSteamOff,
      completeCuringWithReport,
      getCuringReport,
      getCuringReportsForProductionOrder,
      getCuringReportsForProduct,
      getSpawnedChildren,
    }),
    [
      items,
      appendItems,
      getProductionFlowState,
      togglePrePourCheck,
      approvePourSpawn,
      getCuringFlowState,
      startCuring,
      acknowledgeCuringSteamOff,
      completeCuringWithReport,
      getCuringReport,
      getCuringReportsForProductionOrder,
      getCuringReportsForProduct,
      getSpawnedChildren,
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
