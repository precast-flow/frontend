/** Önceden tanımlı hedef kitle listeleri (ayarlardan yönetilebilir mock). */
export type CrmTargetAudience = {
  id: string
  label: string
  description?: string
}

export const CRM_TARGET_AUDIENCES: CrmTargetAudience[] = [
  { id: 'ta-muteahhit', label: 'Müteahhit', description: 'Genel ve özel inşaat firmaları' },
  { id: 'ta-kamu', label: 'Kamu / Belediye', description: 'İdari yapılar ve kamu ihalesi' },
  { id: 'ta-yatirimci', label: 'Yatırımcı / Geliştirici', description: 'Proje geliştirme ve yatırım' },
  { id: 'ta-endustriyel', label: 'Endüstriyel tesis', description: 'Fabrika, depo, sanayi yapıları' },
  { id: 'ta-altyapi', label: 'Altyapı / Ulaşım', description: 'Köprü, yol, raylı sistem' },
  { id: 'ta-bayi', label: 'Bayi / Aracı', description: 'Distribütör ve aracı kanal' },
]

export const CRM_CUSTOMER_POTENTIAL_OPTIONS = [
  { value: 'dusuk', label: 'Düşük' },
  { value: 'orta', label: 'Orta' },
  { value: 'yuksek', label: 'Yüksek' },
  { value: 'cok-yuksek', label: 'Çok yüksek' },
] as const

export const CRM_MEETING_METHOD_OPTIONS = [
  'Fuar / etkinlik',
  'Referans / tavsiye',
  'Soğuk arama',
  'Web sitesi / form',
  'Sosyal medya',
  'Mevcut müşteri',
  'Saha ziyareti',
  'Diğer',
] as const

export type CrmCustomerPotential = (typeof CRM_CUSTOMER_POTENTIAL_OPTIONS)[number]['value']
