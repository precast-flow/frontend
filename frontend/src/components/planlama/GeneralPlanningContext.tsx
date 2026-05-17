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
import {
  defaultAssemblyProjectCode,
  listAssemblyPlanningProjects,
  type AssemblyPlanningProjectOption,
} from '../../data/assemblyPlanningProjects'
import { mondayOfWeekUtc } from '../../data/planningDesignMock'

const MAX_PLAN_CHECKPOINTS = 48
const ASSEMBLY_PROJECT_STORAGE_KEY = 'assembly-planning-selected-project'

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

function readStoredProjectCode(): string | null {
  try {
    return sessionStorage.getItem(ASSEMBLY_PROJECT_STORAGE_KEY)
  } catch {
    return null
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
  /** Montaj planlama: yalnızca seçili projenin planları gösterilir / düzenlenir. */
  projectScoped: boolean
  selectedProjectCode: string | null
  setSelectedProjectCode: (code: string) => void
  assemblyProjectOptions: AssemblyPlanningProjectOption[]
}

const GeneralPlanningContext = createContext<GeneralPlanningContextValue | null>(null)

export function GeneralPlanningProvider({
  children,
  lockUnit,
  projectScoped = false,
  initialProjectCode,
}: {
  children: ReactNode
  /** Sabit birim (ör. üretim planlama sayfası); birim seçici gizlenir. */
  lockUnit?: PlanningUnitKey
  /** Montaj planlama: proje seçimi zorunlu. */
  projectScoped?: boolean
  initialProjectCode?: string | null
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

  const assemblyProjectOptions = useMemo(
    () => listAssemblyPlanningProjects(cloneItems(INITIAL_GENERAL_PLAN_ITEMS)),
    [],
  )

  const resolveInitialProjectCode = useCallback((): string | null => {
    const candidates = [
      initialProjectCode,
      readStoredProjectCode(),
      defaultAssemblyProjectCode(INITIAL_GENERAL_PLAN_ITEMS),
    ].filter(Boolean) as string[]
    for (const code of candidates) {
      if (assemblyProjectOptions.some((o) => o.code === code)) return code
    }
    return assemblyProjectOptions[0]?.code ?? null
  }, [assemblyProjectOptions, initialProjectCode])

  const [selectedProjectCode, setSelectedProjectCodeState] = useState<string | null>(() =>
    resolveInitialProjectCode(),
  )

  /** Montaj planlama sayfası veya genel planda Montaj sekmesi — proje bazlı filtre / geçmiş. */
  const assemblyProjectScoped =
    projectScoped || (!lockUnit && activeUnit === 'assembly')

  const [planHistory, setPlanHistory] = useState<PlanHistoryState>(() =>
    createInitialHistory(initialItems(lockUnit)),
  )

  const [planHistoryByProject, setPlanHistoryByProject] = useState<
    Record<string, PlanHistoryState>
  >(() => {
    const code = resolveInitialProjectCode()
    if (!code) return {}
    return { [code]: createInitialHistory(initialItems(lockUnit)) }
  })

  const activePlanHistory = useMemo(() => {
    if (!assemblyProjectScoped || !selectedProjectCode) return planHistory
    return planHistoryByProject[selectedProjectCode] ?? createInitialHistory(items)
  }, [assemblyProjectScoped, selectedProjectCode, planHistory, planHistoryByProject, items])

  const setActivePlanHistory = useCallback(
    (action: React.SetStateAction<PlanHistoryState>) => {
      if (!assemblyProjectScoped || !selectedProjectCode) {
        setPlanHistory(action)
        return
      }
      setPlanHistoryByProject((prev) => {
        const current = prev[selectedProjectCode] ?? createInitialHistory(items)
        const next = typeof action === 'function' ? action(current) : action
        return { ...prev, [selectedProjectCode]: next }
      })
    },
    [assemblyProjectScoped, selectedProjectCode, items],
  )

  const setSelectedProjectCode = useCallback((code: string) => {
    setSelectedProjectCodeState(code)
    try {
      sessionStorage.setItem(ASSEMBLY_PROJECT_STORAGE_KEY, code)
    } catch {
      /* ignore */
    }
  }, [])

  const appendCheckpoint = useCallback(
    (nextItems: GeneralPlanItem[], label: string, note?: string) => {
      const cloned = cloneItems(nextItems)
      const pushHistory = (ph: PlanHistoryState): PlanHistoryState => {
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
      }

      if (assemblyProjectScoped && selectedProjectCode) {
        setPlanHistoryByProject((prev) => ({
          ...prev,
          [selectedProjectCode]: pushHistory(
            prev[selectedProjectCode] ?? createInitialHistory(cloned),
          ),
        }))
      } else {
        setPlanHistory((ph) => pushHistory(ph))
      }
      setItems(cloned)
    },
    [assemblyProjectScoped, selectedProjectCode],
  )

  const restoreCheckpoint = useCallback(
    (index: number) => {
      const applyRestore = (ph: PlanHistoryState): PlanHistoryState => {
        if (index < 0 || index >= ph.checkpoints.length) return ph
        const nextItems = cloneItems(ph.checkpoints[index].items)
        setItems(nextItems)
        return { ...ph, cursor: index }
      }

      if (assemblyProjectScoped && selectedProjectCode) {
        setPlanHistoryByProject((prev) => ({
          ...prev,
          [selectedProjectCode]: applyRestore(
            prev[selectedProjectCode] ?? createInitialHistory(items),
          ),
        }))
      } else {
        setPlanHistory((ph) => applyRestore(ph))
      }
    },
    [assemblyProjectScoped, selectedProjectCode, items],
  )

  const updateCheckpointNote = useCallback(
    (index: number, note: string) => {
      const trimmed = note.trim()
      const patch = (ph: PlanHistoryState): PlanHistoryState => {
        if (index < 0 || index >= ph.checkpoints.length) return ph
        const checkpoints = ph.checkpoints.map((c, i) =>
          i === index ? { ...c, note: trimmed || undefined } : c,
        )
        return { ...ph, checkpoints }
      }

      if (assemblyProjectScoped && selectedProjectCode) {
        setPlanHistoryByProject((prev) => ({
          ...prev,
          [selectedProjectCode]: patch(
            prev[selectedProjectCode] ?? createInitialHistory(items),
          ),
        }))
      } else {
        setPlanHistory((ph) => patch(ph))
      }
    },
    [assemblyProjectScoped, selectedProjectCode, items],
  )

  const value = useMemo(
    () => ({
      activeUnit,
      setActiveUnit,
      items,
      setItems,
      draftState,
      setDraftState,
      planHistory: activePlanHistory,
      setPlanHistory: setActivePlanHistory,
      appendCheckpoint,
      restoreCheckpoint,
      updateCheckpointNote,
      weekStartMonday,
      setWeekStartMonday,
      projectScoped: assemblyProjectScoped,
      selectedProjectCode,
      setSelectedProjectCode,
      assemblyProjectOptions,
    }),
    [
      activeUnit,
      items,
      draftState,
      activePlanHistory,
      setActivePlanHistory,
      appendCheckpoint,
      restoreCheckpoint,
      updateCheckpointNote,
      weekStartMonday,
      assemblyProjectScoped,
      selectedProjectCode,
      setSelectedProjectCode,
      assemblyProjectOptions,
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
