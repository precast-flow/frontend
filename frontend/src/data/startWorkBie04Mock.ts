/**
 * bie-04 — iş başlatma / mühendisliğe devir (mock).
 * Önizleme satırı bie-05 birim kuyruğu ile uyumlu alanlar içerir.
 */

export type StartWorkPreviewRow = {
  workOrderNo: string
  projectCode: string
  projectName: string
  kind: 'pre_eng'
  assigneeUnitLabel: string
}

export const DEFAULT_START_WORK = {
  refQuoteNo: 'T-2026-0144',
  contractRef: 'SZL-2026-0144-A',
  quoteTotal: 2_253_600,
  closingPrice: 2_198_000,
  currency: '₺',
  deadline: '30 Haziran 2026',
  specialTerms:
    'Ödeme: %40 avans, kalan sevkiyat partileriyle eşleşen faturalar. Beton sınıfı C35/45; alternatif C40/50 için ek fiyat tablosu.',
  riskNote: 'Şantiye vinç penceresi hafta içi 09:00–16:00; gecikmede termin kayması müşteri kaynaklı sayılır (mock).',
}

export const PREVIEW_AFTER_SUBMIT: StartWorkPreviewRow = {
  workOrderNo: 'IE-MUH-2026-104',
  projectCode: 'PRJ-2026-014',
  projectName: 'Köprü Ayağı Lot-2',
  kind: 'pre_eng',
  assigneeUnitLabel: 'Mühendislik',
}
