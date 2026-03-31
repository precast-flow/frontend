export type YardItem = {
  id: string
  elementId: string
  type: string
  project: string
  location: string
  readyForShipment: boolean
  /** mockFactories.code */
  factoryCode: string
}

/** Harita hücre kodları A1…D4 (mvp-10) */
export const yardGridCells = [
  'A1',
  'A2',
  'A3',
  'A4',
  'B1',
  'B2',
  'B3',
  'B4',
  'C1',
  'C2',
  'C3',
  'C4',
  'D1',
  'D2',
  'D3',
  'D4',
] as const

export type YardCellCode = (typeof yardGridCells)[number]

/** 12 satır, 4 farklı lokasyon (B3, A2, C1, D2) */
export const yardInventory: YardItem[] = [
  { id: 'y1', elementId: 'E-1001', type: 'T kiriş 12m', project: 'PRJ-2026-014', location: 'B3', readyForShipment: true, factoryCode: 'IST-HAD' },
  { id: 'y2', elementId: 'E-1002', type: 'Panel P-40', project: 'PRJ-2026-014', location: 'B3', readyForShipment: false, factoryCode: 'IST-HAD' },
  { id: 'y3', elementId: 'E-1003', type: 'Kolon C1', project: 'PRJ-2026-014', location: 'B3', readyForShipment: false, factoryCode: 'IST-HAD' },
  { id: 'y4', elementId: 'E-0990', type: 'Konsol K-02', project: 'PRJ-2026-014', location: 'A2', readyForShipment: false, factoryCode: 'IST-HAD' },
  { id: 'y5', elementId: 'E-0991', type: 'Panel P-22', project: 'PRJ-2026-018', location: 'A2', readyForShipment: true, factoryCode: 'KOC-01' },
  { id: 'y6', elementId: 'E-0992', type: 'Tırım T-08', project: 'PRJ-2026-018', location: 'A2', readyForShipment: false, factoryCode: 'KOC-01' },
  { id: 'y7', elementId: 'E-0880', type: 'Segment M', project: 'PRJ-2025-088', location: 'C1', readyForShipment: true, factoryCode: 'IST-HAD' },
  { id: 'y8', elementId: 'E-0881', type: 'Kiriş K-08', project: 'PRJ-2025-088', location: 'C1', readyForShipment: false, factoryCode: 'IST-HAD' },
  { id: 'y9', elementId: 'E-0882', type: 'Panel P-40', project: 'PRJ-2025-088', location: 'C1', readyForShipment: false, factoryCode: 'IST-HAD' },
  { id: 'y10', elementId: 'E-0750', type: 'Bağlantı plakası', project: 'PRJ-2025-060', location: 'D2', readyForShipment: false, factoryCode: 'KOC-01' },
  { id: 'y11', elementId: 'E-0751', type: 'Konsol K-01', project: 'PRJ-2025-060', location: 'D2', readyForShipment: true, factoryCode: 'KOC-01' },
  { id: 'y12', elementId: 'E-0752', type: 'Kolon 40×40', project: 'PRJ-2025-060', location: 'D2', readyForShipment: false, factoryCode: 'KOC-01' },
]

/** Hücrede kaç kayıt var (harita yoğunluğu) */
export function countInCell(cell: YardCellCode, items: YardItem[]): number {
  return items.filter((i) => i.location === cell).length
}
