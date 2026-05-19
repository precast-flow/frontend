import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { moduleIdToPath } from '../../data/navigation'
import type { GeneralPlanItem, PlanningUnitKey } from '../../data/generalPlanningMock'
import {
  moduleIdForWizardKind,
  weekStartForDayIso,
  type ProjectPlanWizardKind,
} from '../../planlama/planPreviewBuilder'
import { useGeneralPlanningOptional } from './GeneralPlanningContext'

export type PlanningWizardStep = 'project' | 'products' | 'config' | 'summary'

export type PlanningWizardState = {
  kind: ProjectPlanWizardKind
  step: PlanningWizardStep
  projectId: string
  projectCode: string
  projectName: string
  selectedProductIds: string[]
  startDayIso: string
  factoryByProductId: Record<string, string>
  maxProductsPerTrip: number
}

type PlanningWizardContextValue = {
  actionsDrawerOpen: boolean
  setActionsDrawerOpen: (open: boolean) => void
  activeWizard: PlanningWizardState | null
  previewItems: GeneralPlanItem[]
  openWizard: (kind: ProjectPlanWizardKind, opts?: { skipProject?: boolean }) => void
  closeWizard: () => void
  updateWizard: (patch: Partial<PlanningWizardState>) => void
  setPreview: (items: GeneralPlanItem[]) => void
  discardPreview: () => void
  commitPreview: () => boolean
  navigateToPreviewTarget: (kind: ProjectPlanWizardKind) => void
  pendingNavigateAfterPreview: boolean
  setPendingNavigateAfterPreview: (v: boolean) => void
}

const PlanningWizardContext = createContext<PlanningWizardContextValue | null>(null)

const initialWizard = (kind: ProjectPlanWizardKind): PlanningWizardState => ({
  kind,
  step: 'project',
  projectId: '',
  projectCode: '',
  projectName: '',
  selectedProductIds: [],
  startDayIso: new Date().toISOString().slice(0, 10),
  factoryByProductId: {},
  maxProductsPerTrip: 8,
})

export function PlanningWizardProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const gp = useGeneralPlanningOptional()
  const [actionsDrawerOpen, setActionsDrawerOpen] = useState(false)
  const [activeWizard, setActiveWizard] = useState<PlanningWizardState | null>(null)
  const [previewItems, setPreviewItems] = useState<GeneralPlanItem[]>([])
  const [pendingNavigateAfterPreview, setPendingNavigateAfterPreview] = useState(false)

  const openWizard = useCallback((kind: ProjectPlanWizardKind, opts?: { skipProject?: boolean }) => {
    const base = initialWizard(kind)
    if (opts?.skipProject) {
      setActiveWizard({ ...base, step: 'project' })
    } else {
      setActiveWizard(base)
    }
    setActionsDrawerOpen(false)
  }, [])

  const closeWizard = useCallback(() => {
    setActiveWizard(null)
  }, [])

  const updateWizard = useCallback((patch: Partial<PlanningWizardState>) => {
    setActiveWizard((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  const setPreview = useCallback(
    (items: GeneralPlanItem[]) => {
      setPreviewItems(items.map((x) => ({ ...x, visualTone: 'preview' as const })))
      if (gp && items.length > 0) {
        const dayIso = items[0]!.startAt.slice(0, 10)
        gp.setWeekStartMonday(weekStartForDayIso(dayIso))
        const targetUnit = items[0]!.unit
        gp.setActiveUnit(targetUnit)
      }
    },
    [gp],
  )

  const discardPreview = useCallback(() => {
    setPreviewItems([])
    setPendingNavigateAfterPreview(false)
  }, [])

  const commitPreview = useCallback(() => {
    if (!gp || previewItems.length === 0) return false
    const committed = previewItems.map((item) => ({
      ...item,
      id: item.id.startsWith('preview-')
        ? `gp-${item.unit}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        : item.id,
      visualTone: 'committed' as const,
      tags: item.tags.filter((t) => t !== 'preview'),
    }))
    gp.appendCheckpoint([...gp.items, ...committed], 'Projeden plan')
    setPreviewItems([])
    setActiveWizard(null)
    setPendingNavigateAfterPreview(false)
    return true
  }, [gp, previewItems])

  const navigateToPreviewTarget = useCallback(
    (kind: ProjectPlanWizardKind) => {
      const moduleId = moduleIdForWizardKind(kind)
      setPendingNavigateAfterPreview(true)
      navigate(moduleIdToPath(moduleId), {
        state: { planningWizardResume: kind },
      })
    },
    [navigate],
  )

  const value = useMemo(
    () => ({
      actionsDrawerOpen,
      setActionsDrawerOpen,
      activeWizard,
      previewItems,
      openWizard,
      closeWizard,
      updateWizard,
      setPreview,
      discardPreview,
      commitPreview,
      navigateToPreviewTarget,
      pendingNavigateAfterPreview,
      setPendingNavigateAfterPreview,
    }),
    [
      actionsDrawerOpen,
      activeWizard,
      previewItems,
      openWizard,
      closeWizard,
      updateWizard,
      setPreview,
      discardPreview,
      commitPreview,
      navigateToPreviewTarget,
      pendingNavigateAfterPreview,
    ],
  )

  return <PlanningWizardContext.Provider value={value}>{children}</PlanningWizardContext.Provider>
}

export function usePlanningWizard() {
  const ctx = useContext(PlanningWizardContext)
  if (!ctx) throw new Error('usePlanningWizard must be used within PlanningWizardProvider')
  return ctx
}

export function usePlanningWizardOptional() {
  return useContext(PlanningWizardContext)
}

export function previewItemsForUnit(
  previewItems: GeneralPlanItem[],
  unit: PlanningUnitKey,
): GeneralPlanItem[] {
  return previewItems.filter((p) => p.unit === unit)
}
