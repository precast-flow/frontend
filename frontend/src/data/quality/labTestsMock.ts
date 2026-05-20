import { findCatalogTest } from '../qualityTestCatalogMock'
import type { LabTest } from './qualityManagementTypes'

function catalogResults(testTypeId: string): LabTest['results'] {
  const cat = findCatalogTest(testTypeId)
  if (!cat) return []
  return cat.fields.map((f) => ({
    fieldId: f.id,
    label: f.labelKey,
    value: f.demoValue,
    unit: f.unitKey,
  }))
}

export const MOCK_LAB_TESTS: LabTest[] = [
  {
    id: 'lt-001',
    testCode: 'LT-2026-0142',
    testTypeId: 'air_entrained',
    testDate: '2026-04-10',
    laboratory: 'IST-HAD Merkez Lab',
    responsible: 'Ayşe Yılmaz',
    resultStatus: 'pass',
    validityStartDate: '2026-04-10',
    validityEndDate: '2026-10-10',
    notes: 'C30 reçete doğrulama',
    certificateRef: 'LAB-CERT-4421',
    links: { recipeId: 'RC-C30-01', sampleId: 's1' },
    results: catalogResults('air_entrained'),
    createdAt: '2026-04-10T14:00:00.000Z',
    updatedAt: '2026-04-10T14:00:00.000Z',
  },
  {
    id: 'lt-002',
    testCode: 'LT-2026-0141',
    testTypeId: 'fresh_density',
    testDate: '2026-04-08',
    laboratory: 'IST-HAD Merkez Lab',
    responsible: 'Burak Demir',
    resultStatus: 'pass',
    validityStartDate: '2026-04-08',
    validityEndDate: '2026-07-08',
    links: { materialId: 'im-001', workOrderId: 'wq-qc-demo-full' },
    results: catalogResults('fresh_density'),
    createdAt: '2026-04-08T11:00:00.000Z',
    updatedAt: '2026-04-08T11:00:00.000Z',
  },
  {
    id: 'lt-003',
    testCode: 'LT-2026-0140',
    testTypeId: 'air_entrained',
    testDate: '2026-05-01',
    laboratory: 'KOC-01 Saha Lab',
    responsible: 'Ayşe Yılmaz',
    resultStatus: 'pending',
    validityStartDate: '2026-05-20',
    validityEndDate: '2026-11-20',
    links: { recipeId: 'RC-DRAFT-01' },
    results: [],
    createdAt: '2026-04-15T09:00:00.000Z',
    updatedAt: '2026-04-15T09:00:00.000Z',
  },
  {
    id: 'lt-004',
    testCode: 'LT-2025-0999',
    testTypeId: 'fresh_density',
    testDate: '2025-06-01',
    laboratory: 'IST-HAD',
    responsible: 'Burak Demir',
    resultStatus: 'pass',
    validityStartDate: '2025-06-01',
    validityEndDate: '2025-12-01',
    links: { materialId: 'im-003', projectId: 'prj-metro' },
    results: catalogResults('fresh_density'),
    createdAt: '2025-06-01T10:00:00.000Z',
    updatedAt: '2025-06-01T10:00:00.000Z',
  },
]
