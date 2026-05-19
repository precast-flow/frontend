import { yardGridCells } from './yardMock'

export type ProductionWarehouseOption = {
  id: string
  label: string
  factoryCode: string
  cellCode: string
}

const FACTORY_LABELS: Record<string, string> = {
  'IST-HAD': 'Hadımköy',
  'KOC-01': 'Kocaeli',
}

function buildWarehousesForFactory(factoryCode: string): ProductionWarehouseOption[] {
  const factoryLabel = FACTORY_LABELS[factoryCode] ?? factoryCode
  return yardGridCells.map((cell) => ({
    id: `WH-${factoryCode}-${cell}`,
    label: `${factoryLabel} — Depo ${cell}`,
    factoryCode,
    cellCode: cell,
  }))
}

const ALL_WAREHOUSES: ProductionWarehouseOption[] = [
  ...buildWarehousesForFactory('IST-HAD'),
  ...buildWarehousesForFactory('KOC-01'),
]

export function getWarehousesForFactory(factoryCode: string): ProductionWarehouseOption[] {
  const filtered = ALL_WAREHOUSES.filter((w) => w.factoryCode === factoryCode)
  return filtered.length > 0 ? filtered : ALL_WAREHOUSES
}

export function getWarehouseById(id: string): ProductionWarehouseOption | undefined {
  return ALL_WAREHOUSES.find((w) => w.id === id)
}
