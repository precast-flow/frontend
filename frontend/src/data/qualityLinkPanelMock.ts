/**
 * qual-06 — Numune / test paketi ilişki paneli mock.
 */

export type QualityLinkPackage = {
  id: string
  sampleCode: string
  /** Firma — salt okunur */
  companyName: string
  factoryCode: string
  factoryName: string
  project: string
  /** P1 — müşteri (projeden) */
  customerName: string
  /** Ürün / parça kodları */
  partCodes: string[]
  /** Numune üzerindeki reçete referansı */
  sampleRecipeCode: string
  /** Emirdeki onaylı reçete — farklıysa çelişki */
  orderRecipeCode: string
  orderNo: string
  pourBatchId: string
  /** P2 — harici doküman */
  externalDocLabel: string
  externalDocUrl: string
}

export const QUALITY_LINK_PACKAGES: QualityLinkPackage[] = [
  {
    id: 'lp1',
    sampleCode: 'NUM-2025-0142',
    companyName: 'Acme Prefabrik A.Ş.',
    factoryCode: 'IST-HAD',
    factoryName: 'İstanbul Hadımköy',
    project: 'Metro L4',
    customerName: 'İBB Raylı Sistemler',
    partCodes: ['P-4402', 'P-4402-B', 'KR-12'],
    sampleRecipeCode: 'C35/45-XF2',
    orderRecipeCode: 'C35/45-XF2',
    orderNo: 'MES-24088',
    pourBatchId: 'BP-2025-0320-01',
    externalDocLabel: 'Müşteri teknik şartnamesi (PDF)',
    externalDocUrl: 'https://example.com/mock/tech-spec-metro-l4.pdf',
  },
  {
    id: 'lp2',
    sampleCode: 'NUM-2025-0139',
    companyName: 'Acme Prefabrik A.Ş.',
    factoryCode: 'ANK-01',
    factoryName: 'Ankara Fabrika',
    project: 'Depo D1',
    customerName: 'Lojistik A.Ş.',
    partCodes: ['KOL-88', 'D1-RP-01'],
    sampleRecipeCode: 'C25/30-STD',
    /** Emir farklı sınıfa güncellenmiş — çelişki */
    orderRecipeCode: 'C30/37-S4',
    orderNo: 'MES-24040',
    pourBatchId: 'BP-2025-0317-04',
    externalDocLabel: 'Beton sınıf değişiklik yazısı (mock)',
    externalDocUrl: 'https://example.com/mock/change-order-24040.pdf',
  },
]

export function recipeMismatch(pkg: QualityLinkPackage): boolean {
  return pkg.sampleRecipeCode !== pkg.orderRecipeCode
}
