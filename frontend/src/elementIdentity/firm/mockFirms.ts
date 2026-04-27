import type { FirmCodeOverride, FirmNamingTemplate, FirmProfile } from '../types'

const NOW = '2026-04-01T00:00:00.000Z'

/** 3 mock firma profili — promt paketi 09-firma-override-veri-modeli.md */
export const MOCK_FIRMS: FirmProfile[] = [
  {
    id: 'firm-xy',
    name: 'XY Prefab',
    slug: 'xy-prefab',
    unitSystem: 'metric',
    firmCodePrefix: 'XY',
    defaultTemplateId: 'tmpl-xy-default',
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'firm-acme',
    name: 'ACME Precast',
    slug: 'acme-precast',
    unitSystem: 'imperial',
    firmCodePrefix: 'ACME',
    defaultTemplateId: 'tmpl-acme-default',
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'firm-cemre',
    name: 'Cemre Beton',
    slug: 'cemre-beton',
    unitSystem: 'metric',
    firmCodePrefix: '',
    defaultTemplateId: 'tmpl-cemre-kompakt',
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
]

export const MOCK_TEMPLATES: FirmNamingTemplate[] = [
  {
    id: 'tmpl-xy-default',
    firmId: 'firm-xy',
    name: 'Varsayılan',
    tokens: [
      { token: 'FIRM_CODE', enabled: true, order: 1 },
      { token: 'FAMILY_CODE', enabled: true, order: 2 },
      { token: 'SIZE', enabled: true, order: 3 },
      { token: 'SEQUENCE', enabled: true, order: 4, padding: 3 },
    ],
    separator: '-',
    sizeConcat: false,
    sequencePadding: 3,
    revisionPrefix: 'R',
    revisionZeroSuffix: false,
    uppercaseEnforce: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'tmpl-acme-default',
    firmId: 'firm-acme',
    name: 'ACME Tam Detaylı',
    tokens: [
      { token: 'PROJECT_CODE', enabled: true, order: 1 },
      { token: 'FAMILY_CODE', enabled: true, order: 2 },
      { token: 'TYPOLOGY_CODE', enabled: true, order: 3 },
      { token: 'SIZE', enabled: true, order: 4 },
      { token: 'SEQUENCE', enabled: true, order: 5, padding: 4 },
      { token: 'REVISION', enabled: true, order: 6 },
    ],
    separator: '-',
    sizeConcat: false,
    sequencePadding: 4,
    revisionPrefix: 'R',
    revisionZeroSuffix: true,
    uppercaseEnforce: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'tmpl-cemre-kompakt',
    firmId: 'firm-cemre',
    name: 'Saha Kısa (Sektörel)',
    tokens: [
      { token: 'FAMILY_CODE', enabled: true, order: 1 },
      { token: 'SIZE', enabled: true, order: 2 },
      { token: 'SEQUENCE', enabled: true, order: 3, padding: 3 },
    ],
    separator: '-',
    sizeConcat: true,
    sequencePadding: 3,
    revisionPrefix: 'R',
    revisionZeroSuffix: false,
    uppercaseEnforce: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
]

export const MOCK_OVERRIDES: FirmCodeOverride[] = [
  // XY Prefab — override yok.
  // ACME — 4 aktif override
  {
    id: 'ov-acme-1',
    firmId: 'firm-acme',
    scope: 'element_type',
    refId: 'col',
    customCode: 'COL',
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
    notes: 'ACME global konvansiyon',
  },
  {
    id: 'ov-acme-2',
    firmId: 'firm-acme',
    scope: 'element_type',
    refId: 'beam',
    customCode: 'BM',
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'ov-acme-3',
    firmId: 'firm-acme',
    scope: 'typology',
    refId: 'col-rect',
    customCode: 'R',
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'ov-acme-4',
    firmId: 'firm-acme',
    scope: 'size_format',
    refId: 'slab-dt',
    customSizeFormatId: 'dt_us_format',
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
    notes: 'US PCI formatı',
  },
  // Cemre — override yok (sadece template farklı)
]

export const MOCK_PROJECTS = [
  { id: 'prj-2026-014', code: 'PRJ-2026-014', name: 'Sanayi Yapısı 14' },
  { id: 'prj-2026-007', code: 'PRJ-2026-007', name: 'Lojistik Depo' },
  { id: 'prj-2025-122', code: 'PRJ-2025-122', name: 'Otopark Kompleksi' },
]
