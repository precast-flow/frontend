export type MockFactory = {
  code: string
  name: string
  city: string
  active: boolean
  address: string
  shiftCount: number
  siteManager: string
}

/** Adım 11 mvp-01 — mock fabrika tablosu (tek şirket: Acme Prefabrik A.Ş.) */
export const MOCK_FACTORIES: MockFactory[] = [
  {
    code: 'IST-HAD',
    name: 'İstanbul Hadımköy',
    city: 'İstanbul',
    active: true,
    address: 'Hadımköy OSB Mah. Üretim Cad. No: 12, Başakşehir',
    shiftCount: 3,
    siteManager: 'Mehmet Öz',
  },
  {
    code: 'KOC-01',
    name: 'Kocaeli Üretim',
    city: 'Kocaeli',
    active: true,
    address: 'Gebze TOSB 1. Cad. No: 4',
    shiftCount: 2,
    siteManager: 'Elif Korkmaz',
  },
  {
    code: 'ANK-01',
    name: 'Ankara Fabrika',
    city: 'Ankara',
    active: true,
    address: 'Sincan OSB 7. Sok. No: 9',
    shiftCount: 2,
    siteManager: 'Can Arslan',
  },
]

export const DEFAULT_FACTORY_CODE = 'IST-HAD'

export function cloneFactories(list: MockFactory[]): MockFactory[] {
  return list.map((f) => ({ ...f }))
}

/** `list` verilmezse yalnızca mock tohum — bağlamdaki liste için `factories` ile çağırın */
export function findFactoryByCode(code: string, list: MockFactory[] = MOCK_FACTORIES): MockFactory | undefined {
  return list.find((f) => f.code === code)
}
