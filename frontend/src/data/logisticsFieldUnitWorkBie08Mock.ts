/**
 * bie-08 — Lojistik ve saha birim iş kuyrukları (bie-05 görsel dil).
 *
 * Karar notu (MVP): Üretim emri / yard çıkışı tamamlandığında tetikleyici **üretim/Yard tarafı** kuralı
 * ile lojistik iş emri oluşur; lojistik birimi işi **yürütür**, tetikleyici olarak etiketlenmez.
 * (Tek cümle — ürün politikası özeti mock bilgi kutusunda.)
 */

export type Bie08TriggerSource = 'otomatik_plan' | 'manuel'

export type LogisticsUnitRowBie08 = {
  id: string
  factoryCode: string
  workOrderNo: string
  projectCode: string
  projectName: string
  /** MES üretim emri ref — varsa */
  productionRef: string | null
  loadWindow: string
  status: 'planlandi' | 'yukleme' | 'yolda' | 'tamamlandi' | 'beklemede'
  targetSite: string
  triggerSource: Bie08TriggerSource
  address: string
  /** Üretim–lojistik ilişkisi */
  chainNote: string
  mapPlaceholder: string
}

export type FieldActivityBie08 = 'teslim' | 'montaj' | 'kontrol'

export type FieldUnitRowBie08 = {
  id: string
  factoryCode: string
  workOrderNo: string
  projectCode: string
  projectName: string
  activity: FieldActivityBie08
  status: 'beklemede' | 'islemde' | 'tamamlandi' | 'bloke'
  dateLabel: string
  triggerSource: Bie08TriggerSource
  address: string
  chainNote: string
  /** İlgili lojistik iş emri no (zincir) */
  logisticsRef: string | null
  mapPlaceholder: string
}

export const initialLogisticsRowsBie08: LogisticsUnitRowBie08[] = [
  {
    id: 'ls-auto-1',
    factoryCode: 'IST-HAD',
    workOrderNo: 'IE-LOJ-2025-601',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    productionRef: 'WO-884',
    loadWindow: '26.03.2026 06:00–10:00',
    status: 'planlandi',
    targetSite: 'Kartal saha — Alan B',
    triggerSource: 'otomatik_plan',
    address: 'İstanbul / Kartal — Sahil yolu km 12+400',
    chainNote:
      'Üretim WO-884 tamamlandı (MES) → plan tetikli yükleme penceresi oluşturuldu; lojistik birimi sevk öncesi kontrol.',
    mapPlaceholder: '41.02°N · 29.12°E — mock pin',
  },
  {
    id: 'ls-auto-2',
    factoryCode: 'IST-HAD',
    workOrderNo: 'IE-LOJ-2025-602',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    productionRef: 'WO-885',
    loadWindow: '27.03.2026 14:00–18:00',
    status: 'yukleme',
    targetSite: 'Kartal saha — Alan B',
    triggerSource: 'otomatik_plan',
    address: 'İstanbul / Kartal — Sahil yolu km 12+400',
    chainNote: 'Panel P-40 QC onayı sonrası otomatik sevk planı (mock).',
    mapPlaceholder: 'Yükleme rampası R2 — mock',
  },
  {
    id: 'ls-auto-3',
    factoryCode: 'KOC-01',
    workOrderNo: 'IE-LOJ-2025-603',
    projectCode: 'PRJ-2025-088',
    projectName: 'Viyadük segmentleri',
    productionRef: 'WO-870',
    loadWindow: '28.03.2026 08:00–12:00',
    status: 'yolda',
    targetSite: 'Ankara çevre yolu — İstasyon 4',
    triggerSource: 'otomatik_plan',
    address: 'Ankara — Çevre yolu viyadük güzergâhı',
    chainNote: 'Segment üretim kapanışı → lojistik rota önerisi (otomatik).',
    mapPlaceholder: 'Ankara — mock rota çizgisi',
  },
  {
    id: 'ls-man-1',
    factoryCode: 'IST-HAD',
    workOrderNo: 'IE-LOJ-2025-610',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    productionRef: null,
    loadWindow: '30.03.2026 09:00–11:00',
    status: 'beklemede',
    targetSite: 'Kartal saha — Ek teslim',
    triggerSource: 'manuel',
    address: 'İstanbul / Kartal',
    chainNote: 'Müşteri ek parti talebi — manuel lojistik iş emri (istisna).',
    mapPlaceholder: 'Harita — manuel nokta',
  },
  {
    id: 'ls-man-2',
    factoryCode: 'ANK-01',
    workOrderNo: 'IE-LOJ-2025-611',
    projectCode: 'PRJ-2025-0201',
    projectName: 'OSB perde seti',
    productionRef: null,
    loadWindow: '05.04.2026 07:00–09:00',
    status: 'planlandi',
    targetSite: 'OSB şantiye girişi',
    triggerSource: 'manuel',
    address: 'Ankara OSB — Kapı 2',
    chainNote: 'Şantiye koordinasyonundan gelen manuel yükleme penceresi.',
    mapPlaceholder: 'OSB — mock',
  },
]

export const initialFieldRowsBie08: FieldUnitRowBie08[] = [
  {
    id: 'sf-auto-1',
    factoryCode: 'IST-HAD',
    workOrderNo: 'IE-SAH-2025-701',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    activity: 'teslim',
    status: 'beklemede',
    dateLabel: '26.03.2026',
    triggerSource: 'otomatik_plan',
    address: 'Kartal saha — Alan B, koordinat mock',
    chainNote: 'Lojistik IE-LOJ-2025-601 ile bağlı — üretim kapandı → lojistik oluştu → saha teslim bekliyor.',
    logisticsRef: 'IE-LOJ-2025-601',
    mapPlaceholder: 'Saha teslim alanı — pin mock',
  },
  {
    id: 'sf-auto-2',
    factoryCode: 'IST-HAD',
    workOrderNo: 'IE-SAH-2025-702',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    activity: 'montaj',
    status: 'islemde',
    dateLabel: '27.03.2026',
    triggerSource: 'otomatik_plan',
    address: 'Kartal saha — Montaj hattı 1',
    chainNote: 'Panel P-40 sevkiyatı sonrası otomatik montaj aktivitesi (plan tetikli).',
    logisticsRef: 'IE-LOJ-2025-602',
    mapPlaceholder: 'Montaj alanı — mock',
  },
  {
    id: 'sf-auto-3',
    factoryCode: 'KOC-01',
    workOrderNo: 'IE-SAH-2025-703',
    projectCode: 'PRJ-2025-088',
    projectName: 'Viyadük segmentleri',
    activity: 'kontrol',
    status: 'beklemede',
    dateLabel: '29.03.2026',
    triggerSource: 'otomatik_plan',
    address: 'Ankara — Viyadük ayakları',
    chainNote: 'Segment teslim sonrası otomatik kontrol görevi.',
    logisticsRef: 'IE-LOJ-2025-603',
    mapPlaceholder: 'Kontrol noktası — mock',
  },
  {
    id: 'sf-man-1',
    factoryCode: 'IST-HAD',
    workOrderNo: 'IE-SAH-2025-710',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    activity: 'teslim',
    status: 'beklemede',
    dateLabel: '31.03.2026',
    triggerSource: 'manuel',
    address: 'Kartal — Ek teslim noktası',
    chainNote: 'Proje ofisi manuel saha görevi — lojistik ref yok (istisna).',
    logisticsRef: null,
    mapPlaceholder: 'Manuel adres',
  },
  {
    id: 'sf-man-2',
    factoryCode: 'ANK-01',
    workOrderNo: 'IE-SAH-2025-711',
    projectCode: 'PRJ-2025-0201',
    projectName: 'OSB perde seti',
    activity: 'montaj',
    status: 'islemde',
    dateLabel: '06.04.2026',
    triggerSource: 'manuel',
    address: 'OSB — Montaj sahası',
    chainNote: 'Şantiye şefinden gelen manuel montaj emri.',
    logisticsRef: 'IE-LOJ-2025-611',
    mapPlaceholder: 'OSB montaj — mock',
  },
]

