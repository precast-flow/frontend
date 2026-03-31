/**
 * firm-01 — Firma admin kabuğu (mock tenant).
 * Ortak blok: tek firma bağlamı; kodlar üretim modülü ile uyumlu (IST-HAD vb.).
 */

export const FIRM_ADMIN_TENANT = {
  fullLegalName: 'Acme Prefabrik A.Ş.',
  shortName: 'Acme',
  /** P1 — logo yok banner */
  logoMissing: true,
  /** Mock fabrika kodları (04 analiz ile uyumlu etiket hissi) */
  factoryCodesPreview: ['IST-HAD', 'ANK-ÜR', 'IZM-LIM'] as const,
} as const
