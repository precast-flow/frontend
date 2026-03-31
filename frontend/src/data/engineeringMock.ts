export type PackageStatus =
  | 'taslak'
  | 'inceleniyor'
  | 'uretime_hazir'
  | 'uretimde'
  | 'superseded'

export type EngFile = {
  id: string
  name: string
  /** PDF, DWG, IFC, XLSX … */
  fileType: string
  size: string
  uploadedBy: string
  uploadedAt: string
  locked: boolean
  lockReason?: string
  /** P2 — IFC / entegrasyon satırı */
  integrationStatus?: 'islenmedi' | 'hazir'
}

export type EngPackage = {
  id: string
  name: string
  projectCode: string
  /** Rev A, Rev B mock */
  version: string
  status: PackageStatus
  supersededBy?: string
  files: EngFile[]
}

/** MOCK: Proje X — Rev A / Rev B; Rev B’de 5 dosya, 1 kilitli */
export const engPackages: EngPackage[] = [
  {
    id: 'ep1',
    name: 'PRJ-2026-014 — Çıkış paketi',
    projectCode: 'PRJ-2026-014',
    version: 'Rev B',
    status: 'inceleniyor',
    files: [
      {
        id: 'f1',
        name: 'Assembly_IFC_v2.ifc',
        fileType: 'IFC',
        size: '42 MB',
        uploadedBy: 'Can D.',
        uploadedAt: '18.03.2026',
        locked: false,
        integrationStatus: 'islenmedi',
      },
      {
        id: 'f2',
        name: 'BOM_revC.xlsx',
        fileType: 'XLSX',
        size: '120 KB',
        uploadedBy: 'Ayşe K.',
        uploadedAt: '17.03.2026',
        locked: false,
      },
      {
        id: 'f3',
        name: 'Kesit_DW_v2.dwg',
        fileType: 'DWG',
        size: '8 MB',
        uploadedBy: 'Can D.',
        uploadedAt: '18.03.2026',
        locked: false,
      },
      {
        id: 'f4',
        name: 'Genel_plan_v2.pdf',
        fileType: 'PDF',
        size: '3,2 MB',
        uploadedBy: 'Ayşe K.',
        uploadedAt: '16.03.2026',
        locked: false,
      },
      {
        id: 'f5',
        name: 'Kaynak_detay_B.pdf',
        fileType: 'PDF',
        size: '1,1 MB',
        uploadedBy: 'Mehmet Ö.',
        uploadedAt: '15.03.2026',
        locked: true,
        lockReason: 'Üretim emri WO-884 referansı — değişiklik için revizyon',
      },
    ],
  },
  {
    id: 'ep2',
    name: 'PRJ-2026-014 — Çıkış paketi',
    projectCode: 'PRJ-2026-014',
    version: 'Rev A',
    status: 'superseded',
    supersededBy: 'Rev B',
    files: [
      {
        id: 'a1',
        name: 'Assembly_IFC_v1.ifc',
        fileType: 'IFC',
        size: '40 MB',
        uploadedBy: 'Can D.',
        uploadedAt: '02.02.2026',
        locked: true,
        lockReason: 'Arşiv; yalnızca referans',
        integrationStatus: 'hazir',
      },
    ],
  },
  {
    id: 'ep3',
    name: 'PRJ-2025-088 — Taslak paket',
    projectCode: 'PRJ-2025-088',
    version: 'v0.3',
    status: 'taslak',
    files: [
      {
        id: 't1',
        name: 'Concept_r0.3.pdf',
        fileType: 'PDF',
        size: '2 MB',
        uploadedBy: 'Zeynep A.',
        uploadedAt: '10.03.2026',
        locked: false,
      },
    ],
  },
]

export function packageStatusLabel(s: PackageStatus): string {
  switch (s) {
    case 'taslak':
      return 'Taslak'
    case 'inceleniyor':
      return 'İnceleniyor'
    case 'uretime_hazir':
      return 'Üretime hazır'
    case 'uretimde':
      return 'Üretimde'
    case 'superseded':
      return 'Geçersiz (üst rev.)'
  }
}

export function packageStatusPill(s: PackageStatus) {
  const base = 'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1'
  switch (s) {
    case 'taslak':
      return `${base} bg-gray-100 text-gray-700 ring-gray-300/90 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-600`
    case 'inceleniyor':
      return `${base} bg-gray-200/90 text-gray-900 ring-gray-400/80 dark:bg-gray-700 dark:text-gray-100`
    case 'uretime_hazir':
      return `${base} bg-gray-300/70 text-gray-900 ring-gray-500/70 dark:bg-gray-600 dark:text-gray-50`
    case 'uretimde':
      return `${base} bg-gray-800 text-white ring-gray-700 dark:bg-gray-200 dark:text-gray-900`
    case 'superseded':
      return `${base} bg-gray-50 text-gray-600 ring-gray-300/80 dark:bg-gray-950 dark:text-gray-400`
  }
}
