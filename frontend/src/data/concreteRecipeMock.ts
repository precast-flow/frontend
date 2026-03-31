/**
 * prod-05 — Emirde onaylı beton / reçete havuzu (mock).
 * Kalite laboratuvarı yok; sadece seçilebilir onaylı tanımlar.
 */

export type ConcreteAdditive = {
  name: string
  dosageLabel: string
}

export type ConcreteRecipe = {
  id: string
  code: string
  strengthClass: string
  /** Havuzdaki tüm satırlar onaylı mock */
  approved: true
  criticalNotes: string[]
  additives: ConcreteAdditive[]
  /** P1 — parça ile uyumsuzluk uyarısı (örnek satırda dolu) */
  mismatchWarning?: string
}

/** 6 mock reçete satırı */
export const CONCRETE_RECIPE_SEED: ConcreteRecipe[] = [
  {
    id: 'cr-01',
    code: 'BT-C30-STD',
    strengthClass: 'C30/37',
    approved: true,
    criticalNotes: [
      'Slump 120±20 mm; sıcak havada retansiyon takibi.',
      'Klinker ≤ 350 kg/m³ (proje şartnamesi).',
    ],
    additives: [
      { name: 'PCE süperakışkan', dosageLabel: '4,2 L/m³' },
      { name: 'Hava sürükleyici', dosageLabel: '15 ml/m³' },
    ],
  },
  {
    id: 'cr-02',
    code: 'BT-C35-P1',
    strengthClass: 'C35/45',
    approved: true,
    criticalNotes: ['Min. kürlenme 48 saat önce vibrasyon kontrolü.', 'Klorür içermeyen katkı zorunlu.'],
    additives: [
      { name: 'PCE süperakışkan', dosageLabel: '4,8 L/m³' },
      { name: 'Korozyon inhibitörü', dosageLabel: '8 kg/m³' },
    ],
  },
  {
    id: 'cr-03',
    code: 'BT-C40-HPC',
    strengthClass: 'C40/50',
    approved: true,
    criticalNotes: ['HPC — karıştırma süresi +90 sn uzatılmış.', 'Su/binder oranı değişmez; su ayarı yok.'],
    additives: [
      { name: 'PCE yüksek aralık', dosageLabel: '5,1 L/m³' },
      { name: 'Silis dumanı', dosageLabel: '35 kg/m³' },
    ],
  },
  {
    id: 'cr-04',
    code: 'BT-C25-ELF',
    strengthClass: 'C25/30',
    approved: true,
    criticalNotes: ['Erken yüksek dayanım — demir sıkışıklığına dikkat.'],
    additives: [{ name: 'Erken dayanım katkısı', dosageLabel: '12 kg/m³' }],
  },
  {
    id: 'cr-05',
    code: 'BT-C50-BRIDGE',
    strengthClass: 'C50/60',
    approved: true,
    criticalNotes: ['Köprü sınıfı — tane dağılımı sabit; elek analizi günlük.'],
    additives: [
      { name: 'PCE', dosageLabel: '5,4 L/m³' },
      { name: 'İnce agrega düzenleyici', dosageLabel: '1,2 kg/m³' },
    ],
  },
  {
    id: 'cr-06',
    code: 'BT-C30-LOW',
    strengthClass: 'C30/37',
    approved: true,
    criticalNotes: ['Düşük karbon — alternatif bağlayıcı oranı artırılmış.'],
    mismatchWarning:
      'Parça PP-KIR-210 için mühendislikte C35/45 öngörülmüş; C30/37 seçimi sapma oluşturabilir (mock).',
    additives: [
      { name: 'PCE', dosageLabel: '3,9 L/m³' },
      { name: 'Uçucu kül', dosageLabel: '40 kg/m³' },
    ],
  },
]

/** Emir bağlamı (salt metin önizleme) */
export const MOCK_ORDER_CONTEXT = {
  orderNo: 'UE-2025-1842',
  lineRef: 'Satır 3',
  m3Target: '12,5',
  partRef: 'PP-KIR-210',
} as const

/** P1 — Reçete değişim geçmişi (kim, ne zaman) */
export type RecipeChangeLogEntry = {
  id: string
  atDisplay: string
  actor: string
  fromCode: string
  toCode: string
}

export const MOCK_RECIPE_CHANGE_LOG: RecipeChangeLogEntry[] = [
  {
    id: 'log-1',
    atDisplay: '18.03.2025 09:12',
    actor: 'Ayşe Yılmaz',
    fromCode: '—',
    toCode: 'BT-C25-ELF',
  },
  {
    id: 'log-2',
    atDisplay: '18.03.2025 09:14',
    actor: 'Sistem (MES)',
    fromCode: 'BT-C25-ELF',
    toCode: 'BT-C30-STD',
  },
  {
    id: 'log-3',
    atDisplay: '19.03.2025 07:40',
    actor: 'Mehmet Kaya',
    fromCode: 'BT-C30-STD',
    toCode: 'BT-C35-P1',
  },
]
