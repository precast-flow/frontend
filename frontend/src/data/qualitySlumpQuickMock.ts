/**
 * qual-03 — Slump / çekme hızlı giriş — 3 döküm mock.
 */

export type MockPourQuick = {
  id: string
  /** Dropdown satırı */
  labelKey: string
  orderNo: string
  recipeCode: string
  slumpMinMm: number
  slumpMaxMm: number
  factoryCode: string
  batchId: string
}

export const MOCK_POUR_QUICK_OPTIONS: MockPourQuick[] = [
  {
    id: 'pq1',
    labelKey: 'qualitySlump.pour.opt1',
    orderNo: 'MES-24088',
    recipeCode: 'C35/45-XF2',
    slumpMinMm: 110,
    slumpMaxMm: 170,
    factoryCode: 'IST-HAD',
    batchId: 'BP-2025-0320-01',
  },
  {
    id: 'pq2',
    labelKey: 'qualitySlump.pour.opt2',
    orderNo: 'MES-24071',
    recipeCode: 'C40/50-CEM',
    slumpMinMm: 120,
    slumpMaxMm: 180,
    factoryCode: 'KOC-01',
    batchId: 'BP-2025-0320-02',
  },
  {
    id: 'pq3',
    labelKey: 'qualitySlump.pour.opt3',
    orderNo: 'MES-24055',
    recipeCode: 'C30/37-S4',
    slumpMinMm: 130,
    slumpMaxMm: 190,
    factoryCode: 'IST-HAD',
    batchId: 'BP-2025-0319-08',
  },
  {
    id: 'pq4',
    labelKey: 'qualitySlump.pour.opt4',
    orderNo: 'MES-23998',
    recipeCode: 'C30/37-S4',
    slumpMinMm: 125,
    slumpMaxMm: 185,
    factoryCode: 'ANK-01',
    batchId: 'BP-2025-0318-03',
  },
]
