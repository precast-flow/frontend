import type { ProjectProduct } from '../types'

const NOW = '2026-04-01T10:00:00.000Z'

/** Eleman kimlik — demo proje ürünleri (localStorage boşken seed). */
export const DEFAULT_PROJECT_PRODUCTS: ProjectProduct[] = [
  {
    id: 'prd-pm1-001',
    projectId: 'pm-1',
    code: 'DW-210',
    name: 'Duvar paneli A1',
    elementTypeId: 'wall',
    typologyId: 'wall-sol',
    source: 'MANUAL',
    revision: 1,
    status: 'active',
    note: 'Köprü ayağı lot-2',
    createdAt: NOW,
    lifecycleStatus: 'tasarim',
    volumeM3: 12.4,
    definition: 'Dış cephe duvar paneli, C30.',
  },
  {
    id: 'prd-pm1-002',
    projectId: 'pm-1',
    code: 'PR-08',
    name: 'Perde P1',
    elementTypeId: 'wall',
    typologyId: 'wall-swp',
    source: 'IFC',
    revision: 1,
    status: 'active',
    createdAt: NOW,
    lifecycleStatus: 'uretim',
    volumeM3: 24.7,
  },
  {
    id: 'prd-pm1-003',
    projectId: 'pm-1',
    code: 'K-40',
    name: 'Kiriş K40',
    elementTypeId: 'beam',
    typologyId: 'beam-rect',
    source: 'MANUAL',
    revision: 1,
    status: 'active',
    createdAt: NOW,
    volumeM3: 9.2,
  },
  {
    id: 'prd-pm1-004',
    projectId: 'pm-1',
    code: 'PL-200',
    name: 'Döşeme PL200',
    elementTypeId: 'slab',
    typologyId: 'slab-hc',
    source: 'CAD',
    revision: 1,
    status: 'active',
    createdAt: NOW,
    volumeM3: 18.8,
  },
  {
    id: 'prd-pm1-005',
    projectId: 'pm-1',
    code: 'DW-211',
    name: 'Duvar paneli revizyon',
    elementTypeId: 'wall',
    typologyId: 'wall-sol',
    source: 'STANDARD_LIBRARY',
    revision: 2,
    status: 'active',
    createdAt: NOW,
    volumeM3: 11.1,
  },
  {
    id: 'prd-pm2-001',
    projectId: 'pm-2',
    code: 'PR-METRO-01',
    name: 'Metro perde seti — blok A',
    elementTypeId: 'wall',
    typologyId: 'wall-swp',
    source: 'IFC',
    revision: 1,
    status: 'active',
    note: 'Riskli proje — öncelikli hat',
    createdAt: NOW,
    volumeM3: 32.5,
  },
  {
    id: 'prd-pm2-002',
    projectId: 'pm-2',
    code: 'PR-METRO-02',
    name: 'Metro perde seti — blok B',
    elementTypeId: 'wall',
    typologyId: 'wall-swp',
    source: 'MANUAL',
    revision: 1,
    status: 'active',
    createdAt: NOW,
    volumeM3: 28.0,
  },
  {
    id: 'prd-pm2-003',
    projectId: 'pm-2',
    code: 'COL-12',
    name: 'Kolon K12',
    elementTypeId: 'col',
    typologyId: 'col-rect',
    source: 'MANUAL',
    revision: 1,
    status: 'active',
    createdAt: NOW,
    volumeM3: 6.4,
  },
  {
    id: 'prd-pm3-001',
    projectId: 'pm-3',
    code: 'VYD-S01',
    name: 'Viyadük segment S01',
    elementTypeId: 'beam',
    typologyId: 'beam-rect',
    source: 'MANUAL',
    revision: 1,
    status: 'active',
    createdAt: NOW,
    volumeM3: 45.2,
  },
  {
    id: 'prd-pm3-002',
    projectId: 'pm-3',
    code: 'VYD-S02',
    name: 'Viyadük segment S02',
    elementTypeId: 'beam',
    typologyId: 'beam-rect',
    source: 'CAD',
    revision: 1,
    status: 'active',
    createdAt: NOW,
    volumeM3: 42.8,
  },
  {
    id: 'prd-pm4-001',
    projectId: 'pm-4',
    code: 'OSB-P01',
    name: 'OSB perde paneli',
    elementTypeId: 'wall',
    typologyId: 'wall-sol',
    source: 'MANUAL',
    revision: 1,
    status: 'active',
    createdAt: NOW,
    volumeM3: 14.0,
  },
]

/** Proje bazında aktif ürün yoksa seed ekle (localStorage boş/eksik kaldığında). */
export function ensureDefaultProjectProducts(stored: ProjectProduct[]): ProjectProduct[] {
  const existingIds = new Set(stored.map((p) => p.id))
  const projectIdsInSeed = [...new Set(DEFAULT_PROJECT_PRODUCTS.map((p) => p.projectId))]
  const result = [...stored]

  for (const projectId of projectIdsInSeed) {
    const hasActive = stored.some((p) => p.projectId === projectId && p.status === 'active')
    if (hasActive) continue
    for (const seed of DEFAULT_PROJECT_PRODUCTS) {
      if (seed.projectId === projectId && !existingIds.has(seed.id)) {
        result.push({ ...seed })
        existingIds.add(seed.id)
      }
    }
  }

  if (result.length === 0) {
    return DEFAULT_PROJECT_PRODUCTS.map((p) => ({ ...p }))
  }
  return result
}
