/** Kalite yönetimi — girdi malzeme, beton reçete, laboratuvar testleri (mock / backend-ready). */

export type InputMaterialType = 'rebar' | 'mesh' | 'prestress' | 'accessory' | 'other'

export type InputMaterialStatus = 'active' | 'quarantine' | 'consumed' | 'rejected'

export type QualityInputMaterial = {
  id: string
  materialType: InputMaterialType
  name: string
  systemMaterialCode: string
  supplierId: string
  /** Firmanın malzemeye özel ürün kodu — zorunlu */
  supplierMaterialCode: string
  diameterOrSize: string
  qualityClass: string
  lotNo: string
  certificateNo: string
  entryDate: string
  quantity: number
  unit: string
  description?: string
  status: InputMaterialStatus
  specValues?: Record<string, string>
  createdAt: string
  updatedAt: string
}

export type RecipeAggregate = {
  id: string
  name: string
  grainSize?: string
  quantityKg: number
}

export type RecipeAdmixture = {
  id: string
  name: string
  dosagePerM3: number
  unit: string
}

export type RecipeTrialResult = {
  fieldId: string
  label: string
  value: string
  unit?: string
}

export type RecipeTrial = {
  id: string
  trialDate: string
  summary: string
  results: RecipeTrialResult[]
  notes?: string
}

export type ConcreteRecipeStatus = 'draft' | 'pending_approval' | 'published' | 'superseded'

export type ConcreteRecipe = {
  id: string
  recipeCode: string
  strengthClass: string
  usagePurpose: string
  targetStrength: string
  slump: string
  cementType: string
  cementKg: number
  aggregates: RecipeAggregate[]
  waterKg: number
  admixtures: RecipeAdmixture[]
  waterCementRatio: number
  description?: string
  status: ConcreteRecipeStatus
  version: number
  approvedAt?: string
  approvedBy?: string
  trials: RecipeTrial[]
  createdAt: string
  updatedAt: string
}

export type LabTestResultStatus = 'pass' | 'fail' | 'pending' | 'inconclusive'

export type LabTestValidityStatus = 'active' | 'expired' | 'planned'

export type LabTestLinks = {
  materialId?: string
  recipeId?: string
  sampleId?: string
  workOrderId?: string
  projectId?: string
}

export type LabTestResultField = {
  fieldId: string
  label: string
  value: string
  unit?: string
}

export type LabTest = {
  id: string
  testCode: string
  testTypeId: string
  testDate: string
  laboratory: string
  responsible: string
  resultStatus: LabTestResultStatus
  validityStartDate: string
  validityEndDate: string
  notes?: string
  certificateRef?: string
  links: LabTestLinks
  results: LabTestResultField[]
  createdAt: string
  updatedAt: string
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

export type QualitySupplierOption = {
  id: string
  name: string
  code: string
}

export function computeValidityStatus(
  startDate: string,
  endDate: string,
  todayIso = new Date().toISOString().slice(0, 10),
): LabTestValidityStatus {
  if (startDate > todayIso) return 'planned'
  if (endDate < todayIso) return 'expired'
  return 'active'
}

export function isRebarMaterialType(type: InputMaterialType): boolean {
  return type === 'rebar' || type === 'mesh' || type === 'prestress'
}
