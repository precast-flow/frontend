/**
 * qual-09 — Rapor arşivi mock (izlenebilirlik).
 */

export type ArchiveReportRow = {
  id: string
  reportNo: string
  typeKey: string
  period: string
  factoryCode: string
  createdBy: string
  version: string
  project: string
  orderNo: string
  createdAt: string
  sampleCode: string
  sampleRecipe: string
  orderRecipe: string
  pourBatchId: string
  customerName: string
}

export const MOCK_TENANT_COMPANY = 'Acme Prefabrik A.Ş.'

export const MOCK_ARCHIVE_REPORTS: ArchiveReportRow[] = [
  {
    id: 'ar1',
    reportNo: 'RAP-2025-04180',
    typeKey: 'qualityArchive.type.slump',
    period: '2025 · H11',
    factoryCode: 'IST-HAD',
    createdBy: 'Ayşe Yılmaz',
    version: 'v2',
    project: 'Metro L4',
    orderNo: 'MES-24088',
    createdAt: '2025-03-18',
    sampleCode: 'NUM-2025-0142',
    sampleRecipe: 'C35/45-XF2',
    orderRecipe: 'C35/45-XF2',
    pourBatchId: 'BP-2025-0320-01',
    customerName: 'İBB Raylı Sistemler',
  },
  {
    id: 'ar2',
    reportNo: 'RAP-2025-04165',
    typeKey: 'qualityArchive.type.compressive',
    period: '2025 · Mart',
    factoryCode: 'KOC-01',
    createdBy: 'Burak Demir',
    version: 'v1',
    project: 'OSB Köprü',
    orderNo: 'MES-24071',
    createdAt: '2025-03-17',
    sampleCode: 'NUM-2025-0141',
    sampleRecipe: 'C40/50-CEM',
    orderRecipe: 'C40/50-CEM',
    pourBatchId: 'BP-2025-0320-02',
    customerName: 'Karayolları',
  },
  {
    id: 'ar3',
    reportNo: 'RAP-2025-04140',
    typeKey: 'qualityArchive.type.pour',
    period: '2025 · H10',
    factoryCode: 'IST-HAD',
    createdBy: 'Mehmet Öz',
    version: 'v1',
    project: 'Konut A',
    orderNo: 'MES-24055',
    createdAt: '2025-03-12',
    sampleCode: 'NUM-2025-0140',
    sampleRecipe: 'C30/37-S4',
    orderRecipe: 'C30/37-S4',
    pourBatchId: 'BP-2025-0317-04',
    customerName: 'Yapı A.Ş.',
  },
  {
    id: 'ar4',
    reportNo: 'RAP-2025-04122',
    typeKey: 'qualityArchive.type.project',
    period: '2025 · Q1',
    factoryCode: 'ANK-01',
    createdBy: 'Can Arslan',
    version: 'v3',
    project: 'Depo D1',
    orderNo: 'MES-24040',
    createdAt: '2025-03-10',
    sampleCode: 'NUM-2025-0139',
    sampleRecipe: 'C25/30-STD',
    orderRecipe: 'C30/37-S4',
    pourBatchId: 'BP-2025-0317-04',
    customerName: 'Lojistik A.Ş.',
  },
  {
    id: 'ar5',
    reportNo: 'RAP-2025-04098',
    typeKey: 'qualityArchive.type.lab',
    period: '2025 · H9',
    factoryCode: 'IST-HAD',
    createdBy: 'Ayşe Yılmaz',
    version: 'v1',
    project: 'Metro L4',
    orderNo: 'MES-24022',
    createdAt: '2025-03-05',
    sampleCode: 'NUM-2025-0136',
    sampleRecipe: 'C35/45-XF2',
    orderRecipe: 'C35/45-XF2',
    pourBatchId: 'BP-2025-0315-02',
    customerName: 'İBB Raylı Sistemler',
  },
  {
    id: 'ar6',
    reportNo: 'RAP-2025-04077',
    typeKey: 'qualityArchive.type.slump',
    period: '2025 · H9',
    factoryCode: 'KOC-01',
    createdBy: 'Elif Korkmaz',
    version: 'v1',
    project: 'Liman revizyon',
    orderNo: 'MES-23980',
    createdAt: '2025-03-02',
    sampleCode: 'NUM-2025-0134',
    sampleRecipe: 'C32/40-MAR',
    orderRecipe: 'C32/40-MAR',
    pourBatchId: 'BP-2025-0314-09',
    customerName: 'Liman İşletmesi',
  },
  {
    id: 'ar7',
    reportNo: 'RAP-2025-04055',
    typeKey: 'qualityArchive.type.compressive',
    period: '2025 · Şubat',
    factoryCode: 'ANK-01',
    createdBy: 'Can Arslan',
    version: 'v2',
    project: 'YHT istasyonu',
    orderNo: 'MES-24010',
    createdAt: '2025-02-26',
    sampleCode: 'NUM-2025-0137',
    sampleRecipe: 'C45/55-HPC',
    orderRecipe: 'C45/55-HPC',
    pourBatchId: 'BP-2025-0315-02',
    customerName: 'TCDD',
  },
  {
    id: 'ar8',
    reportNo: 'RAP-2025-04030',
    typeKey: 'qualityArchive.type.pour',
    period: '2025 · H8',
    factoryCode: 'IST-HAD',
    createdBy: 'Burak Demir',
    version: 'v1',
    project: 'Konut A',
    orderNo: 'MES-23998',
    createdAt: '2025-02-20',
    sampleCode: 'NUM-2025-0135',
    sampleRecipe: 'C30/37-S4',
    orderRecipe: 'C30/37-S4',
    pourBatchId: 'BP-2025-0308-11',
    customerName: 'Yapı A.Ş.',
  },
  {
    id: 'ar9',
    reportNo: 'RAP-2025-04001',
    typeKey: 'qualityArchive.type.project',
    period: '2024 · Q4',
    factoryCode: 'KOC-01',
    createdBy: 'Elif Korkmaz',
    version: 'v4',
    project: 'OSB Köprü',
    orderNo: 'MES-23890',
    createdAt: '2025-01-15',
    sampleCode: 'NUM-2024-0991',
    sampleRecipe: 'C40/50-CEM',
    orderRecipe: 'C40/50-CEM',
    pourBatchId: 'BP-2024-1220-03',
    customerName: 'Karayolları',
  },
  {
    id: 'ar10',
    reportNo: 'RAP-2025-03988',
    typeKey: 'qualityArchive.type.lab',
    period: '2025 · H7',
    factoryCode: 'ANK-01',
    createdBy: 'Can Arslan',
    version: 'v1',
    project: 'Depo D1',
    orderNo: 'MES-23975',
    createdAt: '2025-02-08',
    sampleCode: 'NUM-2025-0133',
    sampleRecipe: 'C25/30-STD',
    orderRecipe: 'C25/30-STD',
    pourBatchId: 'BP-2025-0201-07',
    customerName: 'Lojistik A.Ş.',
  },
]

export type DownloadHistoryEntry = {
  at: string
  user: string
}

export const MOCK_ARCHIVE_DOWNLOADS: Record<string, DownloadHistoryEntry[]> = {
  ar1: [
    { at: '2025-03-19 09:12', user: 'musteri.portal@example.com' },
    { at: '2025-03-18 16:40', user: 'Ayşe Yılmaz' },
  ],
  ar2: [{ at: '2025-03-17 11:05', user: 'Burak Demir' }],
  ar4: [
    { at: '2025-03-11 08:00', user: 'audit.bot@example.com' },
    { at: '2025-03-10 14:22', user: 'Can Arslan' },
  ],
}

export const MOCK_ARCHIVE_HASH_NOTE =
  'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069 · blok zinciri notu (mock)'

export function filterArchiveRows(
  rows: ArchiveReportRow[],
  opts: {
    factoryCode: string
    project: string
    dateFrom: string
    dateTo: string
    reportNo: string
    orderNo: string
  },
): ArchiveReportRow[] {
  return rows.filter((r) => {
    if (opts.factoryCode && r.factoryCode !== opts.factoryCode) return false
    if (opts.project.trim() && !r.project.toLowerCase().includes(opts.project.trim().toLowerCase())) return false
    if (opts.reportNo.trim() && !r.reportNo.toLowerCase().includes(opts.reportNo.trim().toLowerCase())) return false
    if (opts.orderNo.trim() && !r.orderNo.toLowerCase().includes(opts.orderNo.trim().toLowerCase())) return false
    if (opts.dateFrom && r.createdAt < opts.dateFrom) return false
    if (opts.dateTo && r.createdAt > opts.dateTo) return false
    return true
  })
}
