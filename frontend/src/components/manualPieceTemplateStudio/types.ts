export type MaterialCategory =
  | 'Rebar'
  | 'Strand'
  | 'Insert'
  | 'Lifting Loop'
  | 'Miscellaneous Items'
  | 'Assembly Kit'

export type MaterialItem = {
  id: string
  category: MaterialCategory
  materialNum: string
  embedLabel: string
  description: string
  bendType: string
  materialCost: number
  matWeight: number
  glCode: string
  bomUnit: string
  purchaseUnit: string
  unitConversion: number
  materialWaste: number
  orderBy: number
  dimLength: number
  fileName: string | null
  customFields: string[]
  advanceOrder: boolean
  active: boolean
  production: boolean
  cip: boolean
  erection: boolean
}

export type AssemblyLine = {
  id: string
  category: MaterialCategory
  itemId: string
  materialNum: string
  orderBy: number
  qty: number
  dimLength: number
  bendType: string
  dimA: number
  dimB: number
  dimC: number
  dimD: number
  dimE: number
  dimF: number
}

export type MaterialAssembly = {
  id: string
  category: MaterialCategory
  materialNum: string
  embedLabel: string
  description: string
  bendType: string
  glCode: string
  bomUnit: string
  purchaseUnit: string
  unitConversion: number
  materialWaste: number
  orderBy: number
  materialCost: number
  matWeight: number
  fileName: string | null
  advanceOrder: boolean
  active: boolean
  production: boolean
  cip: boolean
  erection: boolean
  lines: AssemblyLine[]
}

export type TemplateMaterialRow = {
  id: string
  category: MaterialCategory
  materialNum: string
  embedLabel: string
  description: string
  qty: number
  cost: number
  weight: number
  unit: string
  bendType: string
  dimLength: number
}

export type TemplateAssemblyRow = {
  id: string
  category: MaterialCategory
  materialNum: string
  embedLabel: string
  description: string
  qty: number
  cost: number
  weight: number
  unit: string
  bendType: string
  dimLength: number
}

export type CostRow = {
  id: string
  costType: string
  section: string
  qty: number
  unit: string
  cost: number
  calcType: 'Manual' | 'Rollup' | 'Formula'
  overhead: number
  profit: number
  margin: number
  useTax: boolean
  salesTax: boolean
}

export type PieceMarkTemplate = {
  id: string
  location: string
  pieceMark: string
  description: string
  productCategory: string
  productCode: string
  crossSection: string
  active: boolean
  header: {
    description: string
    pieceMark: string
    active: boolean
    fileName: string | null
    location: string
    productCategory: string
    productCode: string
    crossSection: string
    note: string
    rev: string
    revText: string
    revDate: string
    returnLegs: number
    lengthFt: number
    lengthIn: number
    lengthFrac: string
    widthFt: number
    widthIn: number
    widthFrac: string
    depthFt: number
    depthIn: number
    depthFrac: string
    weight: number
    structCy: number
    archCy: number
    releaseStr: string
    structSf: number
    archSf: number
    day28Release: string
    braceType: string
    braceQty: number
    addWork: boolean[]
  }
  materialItems: TemplateMaterialRow[]
  materialAssemblies: TemplateAssemblyRow[]
  costs: CostRow[]
}

export type ProductionInstanceRow = {
  id: string
  status: string
  ctrlNum: string
  pieceSn: string
  guid: string
  yardLoc: string
  castDate: string
  bedName: string
  pos: string
  loadDate: string
  loadNo: string
  qcCheck: string
  prePour: string
  postPour: string
  shipping: string
  countCy: number
  countSf: number
  aw: boolean[]
}

export type StandardMaterialRow = {
  id: string
  category: MaterialCategory
  materialNum: string
  embedLabel: string
  description: string
  qty: number
  prevQty: number
  actualQty: number
  prevActualQty: number
  weight: number
  unit: string
  bendType: string
  dimLength: number
  fromTemplate: boolean
}

export type JobSpecificMaterialRow = {
  id: string
  category: MaterialCategory
  materialNum: string
  description: string
  qty: number
  actualQty: number
  weight: number
  unit: string
}

export type ProductionPiece = {
  id: string
  jobId: string
  templateId: string | null
  phase: string
  plant: string
  productCategory: string
  productCode: string
  crossSection: string
  pieceMark: string
  qty: number
  drawingStatus: string
  header: {
    jobId: string
    location: string
    phase: string
    productCategory: string
    productType: string
    crossSection: string
    pieceMark: string
    qty: number
    drawingStatus: string
    dateIssued: string
    lengthFt: number
    lengthIn: number
    lengthFrac: string
    widthFt: number
    widthIn: number
    widthFrac: string
    depthFt: number
    depthIn: number
    depthFrac: string
    weight: number
    note: string
    rev: string
    revText: string
    revDate: string
    returnLegs: number
    structCy: number
    archCy: number
    totalCy: number
    releaseStr: string
    day28Release: string
    structSf: number
    archSf: number
    totalSf: number
    braceType: string
    braceQty: number
    drawnBy: string
    dateDrawn: string
    checkedBy: string
    dateChecked: string
    addWork: boolean[]
  }
  instances: ProductionInstanceRow[]
  standardMaterial: StandardMaterialRow[]
  jobSpecificMaterial: JobSpecificMaterialRow[]
}

export type JobContext = {
  id: string
  phases: string[]
  plants: string[]
  products: string[]
}
