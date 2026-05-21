/**
 * Laboratuvar test kataloğu — KK-PL-01 girdi malzeme kalite planı ve 16/02 uyumlu tipler.
 */

export type CatalogField = {
  id: string
  labelKey: string
  unitKey: string
  min: number
  max: number
  demoValue: string
}

export type CatalogTestType = {
  id: string
  /** Katalog / plan referansı */
  catalogRef: string
  labelKey: string
  /** KK-PL-01 malzeme grubu (opsiyonel) */
  planMaterialCategory?: string
  fields: CatalogField[]
}

export const QUALITY_TEST_CATALOG: CatalogTestType[] = [
  {
    id: 'rebar_safety_stress',
    catalogRef: 'KK-PL-01-DEMIR-EG',
    planMaterialCategory: 'rebar',
    labelKey: 'qualityTestForm.catalog.rebarSafety',
    fields: [
      {
        id: 'yieldMPa',
        labelKey: 'qualityTestForm.field.yieldMPa',
        unitKey: 'qualityTestForm.unit.mpa',
        min: 420,
        max: 550,
        demoValue: '500',
      },
    ],
  },
  {
    id: 'rebar_unit_weight',
    catalogRef: 'KK-PL-01-DEMIR-AG',
    planMaterialCategory: 'rebar',
    labelKey: 'qualityTestForm.catalog.rebarWeight',
    fields: [
      {
        id: 'kgPerM',
        labelKey: 'qualityTestForm.field.kgPerM',
        unitKey: 'qualityTestForm.unit.kgM',
        min: 0.5,
        max: 8,
        demoValue: '1.12',
      },
    ],
  },
  {
    id: 'aggregate_sieve',
    catalogRef: 'KK-PL-01-AGREGA',
    planMaterialCategory: 'aggregate',
    labelKey: 'qualityTestForm.catalog.aggregateSieve',
    fields: [
      {
        id: 'finenessModulus',
        labelKey: 'qualityTestForm.field.fineness',
        unitKey: 'qualityTestForm.unit.dimensionless',
        min: 2,
        max: 4,
        demoValue: '2.85',
      },
    ],
  },
  {
    id: 'cement_chemical',
    catalogRef: 'KK-PL-01-CIMENTO',
    planMaterialCategory: 'cement',
    labelKey: 'qualityTestForm.catalog.cementChemical',
    fields: [
      {
        id: 'compressive28d',
        labelKey: 'qualityTestForm.field.compressive28',
        unitKey: 'qualityTestForm.unit.mpa',
        min: 40,
        max: 55,
        demoValue: '47',
      },
    ],
  },
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
