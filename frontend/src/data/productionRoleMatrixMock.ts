/**
 * prod-07 — Üretim rol × ekran matrisi (mock).
 * prod-01…prod-06 ekran anahtarları üretim alt menü id’leri ile eşlenir.
 */

import type { NavGroup } from './navigation'
import { navGroups } from './navigation'

export type ProdScreenKey = 'prod01' | 'prod02' | 'prod03' | 'prod04' | 'prod05' | 'prod06'

export const PROD_SCREEN_KEYS: ProdScreenKey[] = ['prod01', 'prod02', 'prod03', 'prod04', 'prod05', 'prod06']

export type RoleMatrixRow = {
  id: string
  labelKey: string
  /** Üretim grubunda görünen modül id’leri */
  menuIds: string[]
  /** menuIds içinde düzenlenebilir olanlar */
  editIds: string[]
}

/** Mock roller — menü + düzenleme kapsamı */
export const ROLE_MATRIX_ROWS: RoleMatrixRow[] = [
  {
    id: 'chief',
    labelKey: 'rolePreview.role.chief',
    menuIds: [
      'production-summary',
      'mes',
      'planning-design',
      'mold-board',
      'pending-priority',
      'concrete-recipe',
      'batch-plant',
      'production-factory-ops',
      'quality',
      'yard',
    ],
    editIds: [
      'production-summary',
      'mes',
      'planning-design',
      'mold-board',
      'pending-priority',
      'concrete-recipe',
      'production-factory-ops',
    ],
  },
  {
    id: 'shift',
    labelKey: 'rolePreview.role.shift',
    menuIds: [
      'production-summary',
      'mes',
      'planning-design',
      'mold-board',
      'pending-priority',
      'production-factory-ops',
      'quality',
      'yard',
    ],
    editIds: ['production-summary', 'mes', 'planning-design', 'mold-board', 'production-factory-ops'],
  },
  {
    id: 'batch_op',
    labelKey: 'rolePreview.role.batchOp',
    menuIds: ['mes', 'concrete-recipe', 'batch-plant', 'quality'],
    editIds: ['batch-plant'],
  },
  {
    id: 'quality_ro',
    labelKey: 'rolePreview.role.qualityRo',
    menuIds: ['production-summary', 'mes', 'planning-design', 'mold-board', 'quality', 'yard'],
    editIds: [],
  },
  {
    id: 'viewer',
    labelKey: 'rolePreview.role.viewer',
    menuIds: [
      'production-summary',
      'mes',
      'planning-design',
      'mold-board',
      'pending-priority',
      'concrete-recipe',
      'batch-plant',
      'production-factory-ops',
    ],
    editIds: [],
  },
]

export function getRoleMatrixRow(id: string): RoleMatrixRow | undefined {
  return ROLE_MATRIX_ROWS.find((r) => r.id === id)
}

export function readOnlyIdsFor(row: RoleMatrixRow): string[] {
  return row.menuIds.filter((id) => !row.editIds.includes(id))
}

const ROLE_PREVIEW_NAV_ID = 'production-role-preview'

/** Önizleme matrisi ekranı her zaman üretim menüsünde kalır (çıkış için erişilebilir). */
export function filterNavGroupsForPreview(groups: NavGroup[], previewRoleId: string | null): NavGroup[] {
  if (!previewRoleId) return groups
  const row = getRoleMatrixRow(previewRoleId)
  if (!row) return groups

  const metaItem = navGroups.flatMap((g) => g.items).find((i) => i.id === ROLE_PREVIEW_NAV_ID)

  return groups.map((g) => {
    if (g.id !== 'production') return g
    let items = g.items.filter((item) => row.menuIds.includes(item.id))
    if (metaItem && !items.some((i) => i.id === ROLE_PREVIEW_NAV_ID)) {
      items = [...items, metaItem]
    }
    return { ...g, items }
  })
}

/**
 * P1 — Her rol için prod-01…06’da gizlenen sekmeler / alanlar (metin mock).
 * Anahtar: rol id → prod ekranı → gizli öğe listesi
 */
export const PROD_TAB_HIDDEN_MOCK: Record<string, Partial<Record<ProdScreenKey, string[]>>> = {
  chief: {
    prod02: ['Mühendislik sekmesi (mock)'],
    prod03: ['Kalite alt panosu (mock)'],
  },
  shift: {
    prod01: ['Ast özet satırları (mock)'],
    prod04: ['Toplu öncelik (mock)'],
    prod06: ['Vardiya notu (mock)'],
  },
  batch_op: {
    prod02: ['Emir oluştur', 'Hat ataması'],
    prod05: ['Geçmiş tablosu'],
    prod06: ['Sorun bildir (mock kısıt)'],
  },
  quality_ro: {
    prod02: ['Üretim düzenle'],
    prod03: ['Taşı / sürükle'],
    prod04: ['Sıra değiştir'],
    prod05: ['Reçete seç (salt)'],
    prod06: ['Tüm düğmeler salt'],
  },
  viewer: {
    prod01: ['Vardiya filtresi'],
    prod02: ['Tüm sekmeler salt'],
    prod03: ['Tüm sekmeler salt'],
    prod04: ['Tüm sekmeler salt'],
    prod05: ['Tüm sekmeler salt'],
    prod06: ['Tüm sekmeler salt'],
  },
}
