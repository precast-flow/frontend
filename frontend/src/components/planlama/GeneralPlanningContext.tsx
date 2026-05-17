import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  INITIAL_GENERAL_PLAN_ITEMS,
  type GeneralPlanItem,
  type PlanningUnitKey,
} from '../../data/generalPlanningMock'
import { mondayOfWeekUtc } from '../../data/planningDesignMock'

const MAX_PLAN_CHECKPOINTS = 48

export type GeneralPlanCheckpoint = {
  id: string
  items: GeneralPlanItem[]
  label: string
  note?: string
  atMs: number
}

type PlanHistoryState = {
  checkpoints: GeneralPlanCheckpoint[]
  cursor: number
}

function cloneItems(xs: GeneralPlanItem[]): GeneralPlanItem[] {
  return xs.map((x) => ({ ...x }))
}

function initialItems(lockUnit?: PlanningUnitKey): GeneralPlanItem[] {
  const all = cloneItems(INITIAL_GENERAL_PLAN_ITEMS)
  return lockUnit ? all.filter((x) => x.unit === lockUnit) : all
}

function createInitialHistory(items: GeneralPlanItem[]): PlanHistoryState {
  return {
    checkpoints: [
      {
        id: 'gp-cp-init',
        items: cloneItems(items),
        label: 'Başlangıç',
        atMs: Date.now(),
      },
    ],
    cursor: 0,
  }
}

type GeneralPlanningContextValue = {
  activeUnit: PlanningUnitKey
  setActiveUnit: (u: PlanningUnitKey) => void
  items: GeneralPlanItem[]
  setItems: React.Dispatch<React.SetStateAction<GeneralPlanItem[]>>
  draftState: 'draft' | 'published'
  setDraftState: React.Dispatch<React.SetStateAction<'draft' | 'published'>>
  planHistory: PlanHistoryState
  setPlanHistory: React.Dispatch<React.SetStateAction<PlanHistoryState>>
  appendCheckpoint: (nextItems: GeneralPlanItem[], label: string, note?: string) => void
  restoreCheckpoint: (index: number) => void
  updateCheckpointNote: (index: number, note: string) => void
  weekStartMonday: Date
  setWeekStartMonday: React.Dispatch<React.SetStateAction<Date>>
}

const GeneralPlanningContext = createContext<GeneralPlanningContextValue | null>(null)

export function GeneralPlanningProvider({
  children,
  lockUnit,
}: {
  children: ReactNode
  /** Sabit birim (ör. üretim planlama sayfası); birim seçici gizlenir. */
  lockUnit?: PlanningUnitKey
}) {
  const [activeUnitState, setActiveUnitState] = useState<PlanningUnitKey>(lockUnit ?? 'production')
  const activeUnit = lockUnit ?? activeUnitState
  const setActiveUnit = useCallback(
    (u: PlanningUnitKey) => {
      if (lockUnit) return
      setActiveUnitState(u)
    },
    [lockUnit],
  )

  const [items, setItems] = useState<GeneralPlanItem[]>(() => initialItems(lockUnit))
  const [draftState, setDraftState] = useState<'draft' | 'published'>('draft')
  const [weekStartMonday, setWeekStartMonday] = useState(() =>
    mondayOfWeekUtc(new Date('2026-03-24T12:00:00.000Z')),
  )

  const [planHistory, setPlanHistory] = useState<PlanHistoryState>(() =>
    createInitialHistory(initialItems(lockUnit)),
  )

  const appendCheckpoint = useCallback(
    (nextItems: GeneralPlanItem[], label: string, note?: string) => {
      const cloned = cloneItems(nextItems)
      setPlanHistory((ph) => {
        const trimmed = ph.checkpoints.slice(0, ph.cursor + 1)
        const cp: GeneralPlanCheckpoint = {
          id: `gp-cp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          items: cloneItems(cloned),
          label,
          note,
          atMs: Date.now(),
        }
        let checkpoints = [...trimmed, cp]
        if (checkpoints.length > MAX_PLAN_CHECKPOINTS) {
          checkpoints = checkpoints.slice(-MAX_PLAN_CHECKPOINTS)
        }
        return { checkpoints, cursor: checkpoints.length - 1 }
      })
      setItems(cloned)
    },
    [],
  )

  const restoreCheckpoint = useCallback((index: number) => {
    setPlanHistory((ph) => {
      if (index < 0 || index >= ph.checkpoints.length) return ph
      const nextItems = cloneItems(ph.checkpoints[index].items)
      setItems(nextItems)
      return { ...ph, cursor: index }
    })
  }, [])

  const updateCheckpointNote = useCallback((index: number, note: string) => {
    const trimmed = note.trim()
    setPlanHistory((ph) => {
      if (index < 0 || index >= ph.checkpoints.length) return ph
      const checkpoints = ph.checkpoints.map((c, i) =>
        i === index ? { ...c, note: trimmed || undefined } : c,
      )
      return { ...ph, checkpoints }
    })
  }, [])

  const value = useMemo(
    () => ({
      activeUnit,
      setActiveUnit,
      items,
      setItems,
      draftState,
      setDraftState,
      planHistory,
      setPlanHistory,
      appendCheckpoint,
      restoreCheckpoint,
      updateCheckpointNote,
      weekStartMonday,
      setWeekStartMonday,
    }),
    [
      activeUnit,
      items,
      draftState,
      planHistory,
      appendCheckpoint,
      restoreCheckpoint,
      updateCheckpointNote,
      weekStartMonday,
    ],
  )

  return <GeneralPlanningContext.Provider value={value}>{children}</GeneralPlanningContext.Provider>
}

export function useGeneralPlanning() {
  const ctx = useContext(GeneralPlanningContext)
  if (!ctx) throw new Error('useGeneralPlanning must be used within GeneralPlanningProvider')
  return ctx
}

export function useGeneralPlanningOptional() {
  return useContext(GeneralPlanningContext)
}
