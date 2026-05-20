import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { crmCustomers } from '../data/crmCustomers'
import { MOCK_CONCRETE_RECIPES } from '../data/quality/concreteRecipesMock'
import { MOCK_INPUT_MATERIALS } from '../data/quality/inputMaterialsMock'
import { MOCK_LAB_TESTS } from '../data/quality/labTestsMock'
import { parseInputMaterialQrPayload } from '../data/quality/qualityQrPayload'
import type {
  ConcreteRecipe,
  LabTest,
  QualityInputMaterial,
  QualitySupplierOption,
  RecipeTrial,
} from '../data/quality/qualityManagementTypes'

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export type InputMaterialDraft = Omit<
  QualityInputMaterial,
  'id' | 'createdAt' | 'updatedAt'
>

export type ConcreteRecipeDraft = Omit<
  ConcreteRecipe,
  'id' | 'createdAt' | 'updatedAt' | 'trials' | 'version' | 'approvedAt' | 'approvedBy'
> & { id?: string }

export type LabTestDraft = Omit<LabTest, 'id' | 'testCode' | 'createdAt' | 'updatedAt'>

type QualityManagementContextValue = {
  inputMaterials: QualityInputMaterial[]
  recipes: ConcreteRecipe[]
  labTests: LabTest[]
  suppliers: QualitySupplierOption[]
  addInputMaterial: (draft: InputMaterialDraft) => QualityInputMaterial
  updateInputMaterial: (id: string, patch: Partial<InputMaterialDraft>) => void
  findInputMaterial: (id: string) => QualityInputMaterial | undefined
  findInputMaterialByQr: (raw: string) => QualityInputMaterial | undefined
  addRecipe: (draft: ConcreteRecipeDraft) => ConcreteRecipe
  updateRecipe: (id: string, patch: Partial<ConcreteRecipeDraft>) => void
  publishRecipe: (id: string, approvedBy?: string) => boolean
  submitRecipeForApproval: (id: string) => void
  addRecipeTrial: (recipeId: string, trial: Omit<RecipeTrial, 'id'>) => void
  findRecipe: (id: string) => ConcreteRecipe | undefined
  getPublishedRecipes: () => ConcreteRecipe[]
  isRecipePublished: (recipeId: string) => boolean
  addLabTest: (draft: LabTestDraft) => LabTest
  updateLabTest: (id: string, patch: Partial<LabTestDraft>) => void
  findLabTest: (id: string) => LabTest | undefined
  labTestsForSample: (sampleId: string) => LabTest[]
  labTestsForWorkOrder: (workOrderId: string) => LabTest[]
  supplierName: (supplierId: string) => string
}

const QualityManagementContext = createContext<QualityManagementContextValue | null>(null)

export function QualityManagementProvider({ children }: { children: ReactNode }) {
  const [inputMaterials, setInputMaterials] = useState<QualityInputMaterial[]>(MOCK_INPUT_MATERIALS)
  const [recipes, setRecipes] = useState<ConcreteRecipe[]>(MOCK_CONCRETE_RECIPES)
  const [labTests, setLabTests] = useState<LabTest[]>(MOCK_LAB_TESTS)

  const suppliers = useMemo<QualitySupplierOption[]>(
    () => crmCustomers.map((c) => ({ id: c.id, name: c.name, code: c.code })),
    [],
  )

  const supplierName = useCallback(
    (supplierId: string) => suppliers.find((s) => s.id === supplierId)?.name ?? supplierId,
    [suppliers],
  )

  const findInputMaterial = useCallback(
    (id: string) => inputMaterials.find((m) => m.id === id),
    [inputMaterials],
  )

  const findInputMaterialByQr = useCallback(
    (raw: string) => {
      const id = parseInputMaterialQrPayload(raw)
      if (!id) return undefined
      return inputMaterials.find((m) => m.id === id)
    },
    [inputMaterials],
  )

  const addInputMaterial = useCallback((draft: InputMaterialDraft) => {
    const now = new Date().toISOString()
    const row: QualityInputMaterial = {
      ...draft,
      id: newId('im'),
      createdAt: now,
      updatedAt: now,
    }
    setInputMaterials((prev) => [row, ...prev])
    return row
  }, [])

  const updateInputMaterial = useCallback((id: string, patch: Partial<InputMaterialDraft>) => {
    setInputMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m,
      ),
    )
  }, [])

  const findRecipe = useCallback((id: string) => recipes.find((r) => r.id === id), [recipes])

  const getPublishedRecipes = useCallback(
    () => recipes.filter((r) => r.status === 'published'),
    [recipes],
  )

  const isRecipePublished = useCallback(
    (recipeId: string) => recipes.some((r) => r.id === recipeId && r.status === 'published'),
    [recipes],
  )

  const addRecipe = useCallback((draft: ConcreteRecipeDraft) => {
    const now = new Date().toISOString()
    const id = draft.id ?? newId('RC')
    const row: ConcreteRecipe = {
      recipeCode: draft.recipeCode,
      strengthClass: draft.strengthClass,
      usagePurpose: draft.usagePurpose,
      targetStrength: draft.targetStrength,
      slump: draft.slump,
      cementType: draft.cementType,
      cementKg: draft.cementKg,
      aggregates: draft.aggregates,
      waterKg: draft.waterKg,
      admixtures: draft.admixtures,
      waterCementRatio: draft.waterCementRatio,
      description: draft.description,
      status: draft.status ?? 'draft',
      id,
      version: 1,
      trials: [],
      createdAt: now,
      updatedAt: now,
    }
    setRecipes((prev) => [row, ...prev])
    return row
  }, [])

  const updateRecipe = useCallback((id: string, patch: Partial<ConcreteRecipeDraft>) => {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === id && r.status !== 'published'
          ? { ...r, ...patch, updatedAt: new Date().toISOString() }
          : r.id === id && r.status === 'published' && patch.description !== undefined
            ? { ...r, description: patch.description, updatedAt: new Date().toISOString() }
            : r,
      ),
    )
  }, [])

  const submitRecipeForApproval = useCallback((id: string) => {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === id && r.status === 'draft'
          ? { ...r, status: 'pending_approval' as const, updatedAt: new Date().toISOString() }
          : r,
      ),
    )
  }, [])

  const publishRecipe = useCallback((id: string, approvedBy = 'Kalite Yöneticisi') => {
    let ok = false
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === id && (r.status === 'pending_approval' || r.status === 'draft')) {
          ok = true
          return {
            ...r,
            status: 'published' as const,
            approvedAt: new Date().toISOString(),
            approvedBy,
            updatedAt: new Date().toISOString(),
          }
        }
        return r
      }),
    )
    return ok
  }, [])

  const addRecipeTrial = useCallback((recipeId: string, trial: Omit<RecipeTrial, 'id'>) => {
    const trialRow: RecipeTrial = { ...trial, id: newId('tr') }
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === recipeId
          ? { ...r, trials: [trialRow, ...r.trials], updatedAt: new Date().toISOString() }
          : r,
      ),
    )
  }, [])

  const findLabTest = useCallback((id: string) => labTests.find((t) => t.id === id), [labTests])

  const addLabTest = useCallback((draft: LabTestDraft) => {
    const now = new Date().toISOString()
    const row: LabTest = {
      ...draft,
      id: newId('lt'),
      testCode: `LT-${new Date().getFullYear()}-${String(labTests.length + 1).padStart(4, '0')}`,
      createdAt: now,
      updatedAt: now,
    }
    setLabTests((prev) => [row, ...prev])
    return row
  }, [labTests.length])

  const updateLabTest = useCallback((id: string, patch: Partial<LabTestDraft>) => {
    setLabTests((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t,
      ),
    )
  }, [])

  const labTestsForSample = useCallback(
    (sampleId: string) => labTests.filter((t) => t.links.sampleId === sampleId),
    [labTests],
  )

  const labTestsForWorkOrder = useCallback(
    (workOrderId: string) => labTests.filter((t) => t.links.workOrderId === workOrderId),
    [labTests],
  )

  const value = useMemo<QualityManagementContextValue>(
    () => ({
      inputMaterials,
      recipes,
      labTests,
      suppliers,
      addInputMaterial,
      updateInputMaterial,
      findInputMaterial,
      findInputMaterialByQr,
      addRecipe,
      updateRecipe,
      publishRecipe,
      submitRecipeForApproval,
      addRecipeTrial,
      findRecipe,
      getPublishedRecipes,
      isRecipePublished,
      addLabTest,
      updateLabTest,
      findLabTest,
      labTestsForSample,
      labTestsForWorkOrder,
      supplierName,
    }),
    [
      inputMaterials,
      recipes,
      labTests,
      suppliers,
      addInputMaterial,
      updateInputMaterial,
      findInputMaterial,
      findInputMaterialByQr,
      addRecipe,
      updateRecipe,
      publishRecipe,
      submitRecipeForApproval,
      addRecipeTrial,
      findRecipe,
      getPublishedRecipes,
      isRecipePublished,
      addLabTest,
      updateLabTest,
      findLabTest,
      labTestsForSample,
      labTestsForWorkOrder,
      supplierName,
    ],
  )

  return (
    <QualityManagementContext.Provider value={value}>{children}</QualityManagementContext.Provider>
  )
}

export function useQualityManagement(): QualityManagementContextValue {
  const ctx = useContext(QualityManagementContext)
  if (!ctx) {
    throw new Error('useQualityManagement must be used within QualityManagementProvider')
  }
  return ctx
}
