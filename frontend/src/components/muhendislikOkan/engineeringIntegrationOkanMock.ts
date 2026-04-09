/**
 * Mühendislik Entegrasyonu-okan — yerel mock (mevcut bie-06 verisinden bağımsız).
 */

export type WorkflowStateOkan = 'draft' | 'in_review' | 'approved' | 'production_created'

export type OkanFile = {
  id: string
  name: string
  fileType: string
  size: string
  uploadedBy: string
  uploadedAt: string
  locked: boolean
  lockReason?: string
  /** IFC — P2 gelecek entegrasyon */
  integrationStatus?: 'islenmedi' | 'hazir'
}

export type OkanRevision = {
  id: string
  rev: string
  at: string
  actor: string
  note: string
}

export type OkanEngJob = {
  id: string
  woCode: string
  projectName: string
  projectCode: string
  kind: 'A' | 'B'
  revisionLabel: string
  workflow: WorkflowStateOkan
  productionOrderId?: string
  updatedAt: string
  files: OkanFile[]
  manual: {
    concrete: string
    toleranceNote: string
    warnAnchorage: boolean
    warnFatigue: boolean
  }
  /** checklist item id → checked */
  checklist: Record<string, boolean>
  /** Revizyon geçmişi (mock) */
  revisions: OkanRevision[]
}

export const CHECKLIST_ITEMS_OKAN = [
  { id: 'bom', critical: true },
  { id: 'pdf_set', critical: true },
  { id: 'dwg_detail', critical: true },
  { id: 'qc_dims', critical: true },
  { id: 'signature', critical: true },
  { id: 'concrete_note', critical: true },
  { id: 'ifc_validate', critical: false },
  { id: 'assembly_notes', critical: false },
  { id: 'logistics_dims', critical: false },
  { id: 'bim_coord', critical: false },
] as const

export const MOCK_OKAN_FACTORIES = [
  { id: 'IST-HAD', label: 'IST-HAD · Hadımköy' },
  { id: 'ANK-01', label: 'ANK-01 · Ostim' },
  { id: 'KOC-01', label: 'KOC-01 · Gebze' },
] as const

const baseChecklist = (partial: Partial<Record<string, boolean>>): Record<string, boolean> => {
  const o: Record<string, boolean> = {}
  for (const c of CHECKLIST_ITEMS_OKAN) {
    o[c.id] = partial[c.id] ?? false
  }
  return o
}

export const initialOkanEngJobs: OkanEngJob[] = [
  {
    id: 'okan-wo-a1',
    woCode: 'IE-MUH-2026-501',
    projectName: 'Köprü ayağı Lot-2',
    projectCode: 'PRJ-2026-014',
    kind: 'A',
    revisionLabel: 'Rev A',
    workflow: 'draft',
    updatedAt: '08.04.2026 09:12',
    files: [
      {
        id: 'f-a1',
        name: 'Metraj_cikti_v1.xlsx',
        fileType: 'XLSX',
        size: '120 KB',
        uploadedBy: 'Ayşe K.',
        uploadedAt: '07.04.2026',
        locked: false,
      },
    ],
    manual: {
      concrete: '',
      toleranceNote: '',
      warnAnchorage: false,
      warnFatigue: false,
    },
    checklist: baseChecklist({ bom: true, pdf_set: false }),
    revisions: [
      {
        id: 'rev-a1',
        rev: 'Rev A',
        at: '05.04.2026 14:00',
        actor: 'Ayşe K.',
        note: 'İlk metraj çıktısı',
      },
    ],
  },
  {
    id: 'okan-wo-b1',
    woCode: 'IE-MUH-2026-512',
    projectName: 'Prefab perde paketi Blok C',
    projectCode: 'PRJ-2026-028',
    kind: 'B',
    revisionLabel: 'Rev B',
    workflow: 'in_review',
    updatedAt: '08.04.2026 11:40',
    files: [
      {
        id: 'f-b1',
        name: 'Cizim_seti_C.pdf',
        fileType: 'PDF',
        size: '2.1 MB',
        uploadedBy: 'Mehmet D.',
        uploadedAt: '05.04.2026',
        locked: false,
      },
      {
        id: 'f-b2',
        name: 'Detay_DW-12.dwg',
        fileType: 'DWG',
        size: '890 KB',
        uploadedBy: 'Mehmet D.',
        uploadedAt: '05.04.2026',
        locked: false,
      },
      {
        id: 'f-b3',
        name: 'Koordinasyon.ifc',
        fileType: 'IFC',
        size: '14.2 MB',
        uploadedBy: 'Mehmet D.',
        uploadedAt: '06.04.2026',
        locked: false,
        integrationStatus: 'islenmedi',
      },
    ],
    manual: {
      concrete: 'C35/45',
      toleranceNote: 'EN 206 toleransları',
      warnAnchorage: true,
      warnFatigue: false,
    },
    checklist: baseChecklist({
      bom: true,
      pdf_set: true,
      dwg_detail: true,
      qc_dims: true,
      signature: false,
      concrete_note: true,
    }),
    revisions: [
      {
        id: 'rev-b1',
        rev: 'Rev B',
        at: '08.04.2026 10:15',
        actor: 'Mehmet D.',
        note: 'IFC eklendi; imza bekleniyor',
      },
      {
        id: 'rev-b0',
        rev: 'Rev A',
        at: '04.04.2026 09:30',
        actor: 'Mehmet D.',
        note: 'PDF/DWG ilk teslim',
      },
    ],
  },
  {
    id: 'okan-wo-b2',
    woCode: 'IE-MUH-2026-520',
    projectName: 'Menfez üniteleri Faz 2',
    projectCode: 'PRJ-2026-031',
    kind: 'B',
    revisionLabel: 'Rev A',
    workflow: 'approved',
    updatedAt: '07.04.2026 18:02',
    files: [
      {
        id: 'f-c1',
        name: 'Assembly_revA.pdf',
        fileType: 'PDF',
        size: '1.4 MB',
        uploadedBy: 'Zeynep A.',
        uploadedAt: '06.04.2026',
        locked: false,
      },
      {
        id: 'f-c2',
        name: 'Uretimde_kullanilan_cephe.dwg',
        fileType: 'DWG',
        size: '600 KB',
        uploadedBy: 'Zeynep A.',
        uploadedAt: '01.04.2026',
        locked: true,
        lockReason: 'Üretim hattında referans — revizyon kilidi',
      },
    ],
    manual: {
      concrete: 'C40/50',
      toleranceNote: '±2 mm cephe düzlemi',
      warnAnchorage: false,
      warnFatigue: false,
    },
    checklist: baseChecklist({
      bom: true,
      pdf_set: true,
      dwg_detail: true,
      qc_dims: true,
      signature: true,
      concrete_note: true,
      ifc_validate: false,
      assembly_notes: true,
      logistics_dims: true,
      bim_coord: false,
    }),
    revisions: [
      {
        id: 'rev-c2',
        rev: 'Rev A',
        at: '06.04.2026 17:45',
        actor: 'Zeynep A.',
        note: 'Cephe DWG kilitlendi — üretim referansı',
      },
      {
        id: 'rev-c1',
        rev: 'Taslak',
        at: '02.04.2026 11:20',
        actor: 'Zeynep A.',
        note: 'İlk assembly PDF',
      },
    ],
  },
]
