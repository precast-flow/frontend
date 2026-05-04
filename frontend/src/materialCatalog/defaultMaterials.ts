import type { CatalogRebarShapeType, MaterialDef } from './types'

const now = () => new Date().toISOString()

const REBAR_SHAPE_LABELS: { value: CatalogRebarShapeType; label: string }[] = [
  { value: 'straight', label: 'Düz çubuk' },
  { value: 'stirrup', label: 'Etriye' },
  { value: 'hook', label: 'Kancalı' },
  { value: 'l_bar', label: 'L çubuk' },
  { value: 'u_bar', label: 'U çubuk' },
  { value: 'crank', label: 'Kırımlı' },
  { value: 'custom', label: 'Özel şekil' },
]

function rebarShapeOptions(): string[] {
  return REBAR_SHAPE_LABELS.map((x) => `${x.value}:${x.label}`)
}

export function createDefaultMaterialCatalog(): MaterialDef[] {
  const t = now()
  return [
    {
      id: 'mat-def-rebar-b500c',
      name: 'B500C Donatı çeliği',
      code: 'REBAR-B500C',
      category: 'rebar',
      description: 'Betonarme donatı çubuğu — çap, şekil, sınıf, gelişmiş boy ve adet.',
      readonly: true,
      createdAt: t,
      updatedAt: t,
      fields: [
        { id: 'diameterMm', label: 'Çap (mm)', type: 'number', unit: 'mm', required: true, order: 0 },
        {
          id: 'shape',
          label: 'Şekil',
          type: 'select',
          required: true,
          order: 1,
          options: rebarShapeOptions(),
        },
        { id: 'steelGrade', label: 'Çelik sınıfı', type: 'text', required: true, order: 2 },
        { id: 'developedLengthMm', label: 'Gelişmiş boy (mm)', type: 'number', unit: 'mm', required: true, order: 3 },
        { id: 'count', label: 'Adet', type: 'number', required: true, order: 4 },
      ],
    },
    {
      id: 'mat-def-concrete-c35',
      name: 'Beton (C35/45 örnek)',
      code: 'CONC-C35',
      category: 'concrete',
      description: 'Hazır / yerinde beton — sınıf, hacim, çevre sınıfı.',
      readonly: true,
      createdAt: t,
      updatedAt: t,
      fields: [
        { id: 'concreteClass', label: 'Beton sınıfı', type: 'text', required: true, order: 0 },
        { id: 'volumeM3', label: 'Hacim (m³)', type: 'number', unit: 'm³', required: false, order: 1 },
        { id: 'exposureClass', label: 'Çevre sınıfı', type: 'text', required: false, order: 2 },
      ],
    },
    {
      id: 'mat-def-anchor-set',
      name: 'Ankraj seti',
      code: 'HW-ANCHOR',
      category: 'hardware',
      description: 'Bağlantı ankrajı — tip, boyut, adet.',
      readonly: true,
      createdAt: t,
      updatedAt: t,
      fields: [
        { id: 'anchorType', label: 'Tip', type: 'text', required: true, order: 0 },
        { id: 'sizeSpec', label: 'Boyut / özellik', type: 'text', required: true, order: 1 },
        { id: 'count', label: 'Adet', type: 'number', required: true, order: 2 },
      ],
    },
    {
      id: 'mat-def-pvc-sleeve',
      name: 'PVC geçiş',
      code: 'SLV-PVC',
      category: 'sleeve',
      description: 'Geçiş borusu / manşon.',
      readonly: true,
      createdAt: t,
      updatedAt: t,
      fields: [
        { id: 'diameterMm', label: 'Çap (mm)', type: 'number', unit: 'mm', required: true, order: 0 },
        { id: 'lengthMm', label: 'Uzunluk (mm)', type: 'number', unit: 'mm', required: false, order: 1 },
        { id: 'count', label: 'Adet', type: 'number', required: true, order: 2 },
      ],
    },
    {
      id: 'mat-def-connection-plate',
      name: 'Bağlantı plakası',
      code: 'PLT-CONN',
      category: 'plate',
      description: 'Kaynaklı / cıvatalı bağlantı levhası.',
      readonly: true,
      createdAt: t,
      updatedAt: t,
      fields: [
        { id: 'steelGrade', label: 'Malzeme sınıfı', type: 'text', required: true, order: 0 },
        { id: 'dimensions', label: 'Boyutlar (WxHxT)', type: 'text', required: true, order: 1 },
        { id: 'weightKg', label: 'Ağırlık (kg)', type: 'number', unit: 'kg', required: false, order: 2 },
      ],
    },
    {
      id: 'mat-def-epdm-profile',
      name: 'EPDM profil',
      code: 'PRF-EPDM',
      category: 'profile',
      description: 'Conta / köşe profili.',
      readonly: true,
      createdAt: t,
      updatedAt: t,
      fields: [
        { id: 'section', label: 'Kesit / tip', type: 'text', required: true, order: 0 },
        { id: 'lengthM', label: 'Uzunluk (m)', type: 'number', unit: 'm', required: true, order: 1 },
      ],
    },
    {
      id: 'mat-def-prestress-wire',
      name: 'Ön gerilme teli',
      code: 'PST-WIRE',
      category: 'prestress',
      description: 'Öngerilme çeliği — çap, mukavemet, adet.',
      readonly: true,
      createdAt: t,
      updatedAt: t,
      fields: [
        { id: 'diameterMm', label: 'Çap (mm)', type: 'number', unit: 'mm', required: true, order: 0 },
        { id: 'tensileStrengthMpa', label: 'Rs (MPa)', type: 'number', unit: 'MPa', required: false, order: 1 },
        { id: 'count', label: 'Adet', type: 'number', required: true, order: 2 },
      ],
    },
  ]
}
