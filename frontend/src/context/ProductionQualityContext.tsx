import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { initialWorkOrders, type WorkOrder, type WorkOrderStatus } from '../data/mesMock'
import type { MockUnitWorkRow } from '../data/mockUnitWorkQueue'

type Ctx = {
  orders: WorkOrder[]
  patchOrder: (id: string, patch: Partial<WorkOrder>) => void
  setOrderStatus: (id: string, status: WorkOrderStatus) => void
  /** Üretimde → Kalite bekliyor */
  sendToQuality: (id: string) => void
  /** Kalite onayı */
  completeQuality: (id: string) => void
  /** Ret sonrası yeniden üretim (mock) */
  rejectQuality: (id: string) => void
  updateSlot: (id: string, lineId: string, slotIndex: number) => void
  /** bie-07 — MES’ten gönderilen birim iş emirleri (Atadığım’da birleşir) */
  extraUnitWorkAssignedBy: MockUnitWorkRow[]
  appendUnitWorkFromMes: (row: MockUnitWorkRow) => void
}

const ProductionQualityContext = createContext<Ctx | null>(null)

export function ProductionQualityProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<WorkOrder[]>(() => initialWorkOrders.map((o) => ({ ...o })))
  const [extraUnitWorkAssignedBy, setExtraUnitWorkAssignedBy] = useState<MockUnitWorkRow[]>([])

  const patchOrder = useCallback((id: string, patch: Partial<WorkOrder>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }, [])

  const setOrderStatus = useCallback((id: string, status: WorkOrderStatus) => {
    patchOrder(id, { status })
  }, [patchOrder])

  const sendToQuality = useCallback(
    (id: string) => {
      patchOrder(id, {
        status: 'kalite_bekliyor',
        transitionNote: 'Üretim hattı tamamlandı — otomatik kalite kuyruğu (mock).',
        qualityInspection: {
          lengthMm: '',
          widthMm: '',
          visualNote: '',
          slumpCm: '',
          pressureMpa: '',
        },
      })
    },
    [patchOrder],
  )

  const completeQuality = useCallback(
    (id: string) => {
      patchOrder(id, {
        status: 'tamamlandi',
        transitionNote: 'Kalite onayı — emir kapatıldı (mock).',
      })
    },
    [patchOrder],
  )

  const rejectQuality = useCallback(
    (id: string) => {
      patchOrder(id, {
        status: 'uretimde',
        transitionNote: 'Ret — yeniden üretim / düzeltme (mock).',
      })
    },
    [patchOrder],
  )

  const updateSlot = useCallback((id: string, lineId: string, slotIndex: number) => {
    patchOrder(id, { lineId, slotIndex })
  }, [patchOrder])

  const appendUnitWorkFromMes = useCallback((row: MockUnitWorkRow) => {
    setExtraUnitWorkAssignedBy((prev) => [...prev, row])
  }, [])

  const value = useMemo(
    () => ({
      orders,
      patchOrder,
      setOrderStatus,
      sendToQuality,
      completeQuality,
      rejectQuality,
      updateSlot,
      extraUnitWorkAssignedBy,
      appendUnitWorkFromMes,
    }),
    [
      orders,
      patchOrder,
      setOrderStatus,
      sendToQuality,
      completeQuality,
      rejectQuality,
      updateSlot,
      extraUnitWorkAssignedBy,
      appendUnitWorkFromMes,
    ],
  )

  return <ProductionQualityContext.Provider value={value}>{children}</ProductionQualityContext.Provider>
}

export function useProductionQuality() {
  const ctx = useContext(ProductionQualityContext)
  if (!ctx) throw new Error('useProductionQuality requires ProductionQualityProvider')
  return ctx
}
