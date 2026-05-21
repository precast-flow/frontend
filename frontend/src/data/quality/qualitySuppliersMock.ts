import type { QualitySupplierOption } from './qualityManagementTypes'

/** Kalite modülü tedarikçi firmaları — CRM müşterilerinden bağımsız (mock). */
export const MOCK_QUALITY_SUPPLIERS: QualitySupplierOption[] = [
  {
    id: 'qs-yurtici-demir',
    code: 'TD-YURT',
    name: 'Yurtiçi Demir Çelik A.Ş.',
  },
  {
    id: 'qs-kardesler',
    code: 'TD-KRD',
    name: 'Kardeşler İnşaat Demiri Ltd.',
  },
  {
    id: 'qs-anadolu-agrega',
    code: 'TD-AGR',
    name: 'Anadolu Agrega ve Kum San.',
  },
  {
    id: 'qs-ege-cimento',
    code: 'TD-EGE',
    name: 'Ege Çimento ve Yapı Kimyasalları',
  },
  {
    id: 'qs-marmara-katki',
    code: 'TD-KAT',
    name: 'Marmara Kimyasal Katkı Tic.',
  },
  {
    id: 'qs-istanbul-hasir',
    code: 'TD-HAS',
    name: 'İstanbul Hasır Çelik Ürünleri',
  },
]

export function findQualitySupplier(id: string): QualitySupplierOption | undefined {
  return MOCK_QUALITY_SUPPLIERS.find((s) => s.id === id)
}

export function findQualitySupplierByCode(code: string): QualitySupplierOption | undefined {
  const key = code.trim().toLowerCase()
  return MOCK_QUALITY_SUPPLIERS.find((s) => s.code.toLowerCase() === key)
}
