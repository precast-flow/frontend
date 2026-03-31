/**
 * qual-05 — Test kataloğu (16/02 ile uyumlu isimler, mock).
 */

export type CatalogField = {
  id: string
  labelKey: string
  unitKey: string
  min: number
  max: number
  /** Varsayılan örnek değer (form ön doldurma) */
  demoValue: string
}

export type CatalogTestType = {
  id: string
  /** Katalog referansı — ürün dokümanı 16/02 */
  catalogRef: string
  labelKey: string
  fields: CatalogField[]
}

/** İki örnek tip: Hava % ve yoğunluk (ayrı test tipleri) */
export const QUALITY_TEST_CATALOG: CatalogTestType[] = [
  {
    id: 'air_entrained',
    catalogRef: '16/02-TS-HAVA',
    labelKey: 'qualityTestForm.catalog.air',
    fields: [
      {
        id: 'airPct',
        labelKey: 'qualityTestForm.field.airPct',
        unitKey: 'qualityTestForm.unit.percent',
        min: 4.0,
        max: 7.5,
        demoValue: '5,2',
      },
    ],
  },
  {
    id: 'fresh_density',
    catalogRef: '16/02-TS-YOG',
    labelKey: 'qualityTestForm.catalog.density',
    fields: [
      {
        id: 'densityKgM3',
        labelKey: 'qualityTestForm.field.density',
        unitKey: 'qualityTestForm.unit.kgM3',
        min: 2360,
        max: 2420,
        demoValue: '2395',
      },
    ],
  },
]

export function findCatalogTest(id: string): CatalogTestType | undefined {
  return QUALITY_TEST_CATALOG.find((t) => t.id === id)
}
