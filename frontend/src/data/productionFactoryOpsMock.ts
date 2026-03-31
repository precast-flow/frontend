export type FactoryShiftModel = '2x12' | '3x8'

export type FactoryOpsSummary = {
  id: string
  code: string
  name: string
  shiftModel: FactoryShiftModel
  defaultCompanyModel: FactoryShiftModel
  activeMolds: number
  activeWorkers: number
  pendingJobs: number
}

export type MoldRow = {
  id: string
  factoryId: string
  code: string
  status: 'active' | 'maintenance' | 'passive'
  lastMaintenance: string
}

export type WorkerRow = {
  id: string
  factoryId: string
  name: string
  role: string
  shift: 'A' | 'B' | 'C'
  active: boolean
}

export type MoldMaintenancePlanRow = {
  moldCode: string
  planDate: string
  note: string
}

export const FACTORY_OPS_SUMMARY: FactoryOpsSummary[] = [
  {
    id: 'f-ist-had',
    code: 'IST-HAD',
    name: 'Hadimkoy Fabrika',
    shiftModel: '3x8',
    defaultCompanyModel: '2x12',
    activeMolds: 6,
    activeWorkers: 5,
    pendingJobs: 12,
  },
  {
    id: 'f-koc-01',
    code: 'KOC-01',
    name: 'Kocaeli Fabrika',
    shiftModel: '2x12',
    defaultCompanyModel: '2x12',
    activeMolds: 5,
    activeWorkers: 4,
    pendingJobs: 7,
  },
]

export const MOLD_ROWS: MoldRow[] = [
  { id: 'm1', factoryId: 'f-ist-had', code: 'M-001', status: 'active', lastMaintenance: '2026-03-12' },
  { id: 'm2', factoryId: 'f-ist-had', code: 'M-002', status: 'maintenance', lastMaintenance: '2026-03-18' },
  { id: 'm3', factoryId: 'f-ist-had', code: 'M-003', status: 'active', lastMaintenance: '2026-03-09' },
  { id: 'm4', factoryId: 'f-ist-had', code: 'M-004', status: 'passive', lastMaintenance: '2026-02-25' },
  { id: 'm5', factoryId: 'f-ist-had', code: 'M-005', status: 'active', lastMaintenance: '2026-03-05' },
  { id: 'm6', factoryId: 'f-koc-01', code: 'K-101', status: 'active', lastMaintenance: '2026-03-11' },
  { id: 'm7', factoryId: 'f-koc-01', code: 'K-102', status: 'active', lastMaintenance: '2026-03-15' },
  { id: 'm8', factoryId: 'f-koc-01', code: 'K-103', status: 'maintenance', lastMaintenance: '2026-03-17' },
  { id: 'm9', factoryId: 'f-koc-01', code: 'K-104', status: 'active', lastMaintenance: '2026-03-08' },
  { id: 'm10', factoryId: 'f-koc-01', code: 'K-105', status: 'passive', lastMaintenance: '2026-02-21' },
]

export const WORKER_ROWS: WorkerRow[] = [
  { id: 'w1', factoryId: 'f-ist-had', name: 'Ahmet Can', role: 'Vardiya amiri', shift: 'A', active: true },
  { id: 'w2', factoryId: 'f-ist-had', name: 'Elif Nur', role: 'Kalıp ustası', shift: 'B', active: true },
  { id: 'w3', factoryId: 'f-ist-had', name: 'Mert Deniz', role: 'Operatör', shift: 'C', active: true },
  { id: 'w4', factoryId: 'f-ist-had', name: 'Seda K.', role: 'Operatör', shift: 'A', active: false },
  { id: 'w5', factoryId: 'f-koc-01', name: 'Burak Y.', role: 'Vardiya amiri', shift: 'A', active: true },
  { id: 'w6', factoryId: 'f-koc-01', name: 'Gizem A.', role: 'Kalıp ustası', shift: 'B', active: true },
  { id: 'w7', factoryId: 'f-koc-01', name: 'Onur T.', role: 'Operatör', shift: 'A', active: true },
  { id: 'w8', factoryId: 'f-koc-01', name: 'Duygu E.', role: 'Operatör', shift: 'B', active: false },
]

export const MOLD_PLAN_ROWS: MoldMaintenancePlanRow[] = [
  { moldCode: 'M-002', planDate: '2026-03-22', note: 'Hidrolik kontrol' },
  { moldCode: 'M-005', planDate: '2026-03-23', note: 'Kilit pim değişimi' },
  { moldCode: 'K-103', planDate: '2026-03-24', note: 'Yuzey temizligi ve yaglama' },
]
