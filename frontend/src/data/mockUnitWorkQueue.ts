/**
 * Adım 21 / bie-05 — birim iş kuyruğu mock verisi.
 * Her birim aynı şablonu görür; seçilen birime göre satırlar filtrelenir (mock).
 */

export type UnitWorkAssignmentKind =
  | 'metraj'
  | 'pre_eng'
  | 'production'
  | 'quality'
  | 'logistics'
  | 'field'
  /** bie-07 — ARGE / beton deneyi talebi */
  | 'arge'

/** bie-07 — üretim amirinden Kalite / ARGE’ye açılan alt iş emri meta */
export type Bie07SpawnMeta = {
  /** Kaynak MES üretim emri kodu (WO-###) */
  parentMesCode: string
  requestType: 'kalite_kontrol' | 'numune' | 'arge_deney'
  /** Standart şablon kodu (ARGE) */
  templateId?: string
  /** P1 — yalnız Kalite hedefli satırlarda */
  qualityProgress?: 'bekliyor' | 'devam' | 'tamam'
}

export type UnitWorkStatus = 'beklemede' | 'islemde' | 'bloke' | 'tamamlandi'

export type UnitWorkPriority = 'dusuk' | 'normal' | 'yuksek' | 'acil'

/** `dialog` = kısa özet modal; `panel` = yan panel + alt sekmeler */
export type UnitWorkDetailPresentation = 'dialog' | 'panel'

export type MockUnitDef = {
  id: string
  name: string
}

export const MOCK_UNITS: MockUnitDef[] = [
  { id: 'u-satis', name: 'Satış' },
  { id: 'u-proje', name: 'Proje ofisi' },
  { id: 'u-muh', name: 'Mühendislik' },
  { id: 'u-uretim', name: 'Üretim amiri' },
  { id: 'u-kalite', name: 'Kalite' },
  { id: 'u-arge', name: 'ARGE / Beton laboratuvarı' },
  { id: 'u-lojistik', name: 'Lojistik' },
  { id: 'u-saha', name: 'Saha koordinasyonu' },
]

export type MockUnitWorkRow = {
  id: string
  factoryCode: string
  /** İşi yapması beklenen birim (üzerime atanan) */
  assigneeUnitId: string
  /** İşi oluşturan / yönlendiren birim */
  assignerUnitId: string
  workOrderNo: string
  projectCode: string
  projectName: string
  kind: UnitWorkAssignmentKind
  status: UnitWorkStatus
  priority: UnitWorkPriority
  daysOnDesk: number
  lastUpdate: string
  detailPresentation: UnitWorkDetailPresentation
  /** Panel modunda ek bağlam */
  summaryNote: string
  /** bie-07 — üretim → Kalite / ARGE alt emri */
  bie07?: Bie07SpawnMeta
}

export const MOCK_UNIT_WORK_ASSIGNED_TO: MockUnitWorkRow[] = [
  {
    id: 'WO-2025-441',
    factoryCode: 'IST-HAD',
    assigneeUnitId: 'u-uretim',
    assignerUnitId: 'u-muh',
    workOrderNo: 'IE-MUH-2025-089',
    projectCode: 'PRJ-2025-0142',
    projectName: 'Kartal Konut P42',
    kind: 'pre_eng',
    status: 'islemde',
    priority: 'yuksek',
    daysOnDesk: 3,
    lastUpdate: '23.03.2025 08:40',
    detailPresentation: 'panel',
    summaryNote: 'Kalıp listesi onayı bekleniyor; üretim öncesi mühendislik çıktısı.',
  },
  {
    id: 'WO-2025-442',
    factoryCode: 'IST-HAD',
    assigneeUnitId: 'u-uretim',
    assignerUnitId: 'u-proje',
    workOrderNo: 'IE-PRJ-2025-031',
    projectCode: 'PRJ-2025-0118',
    projectName: 'Haliç Köprü Yaklaşımı',
    kind: 'production',
    status: 'beklemede',
    priority: 'normal',
    daysOnDesk: 1,
    lastUpdate: '24.03.2025 06:15',
    detailPresentation: 'dialog',
    summaryNote: 'Vardiya 1 bandına yerleştirme onayı.',
  },
  {
    id: 'WO-2025-443',
    factoryCode: 'KOC-01',
    assigneeUnitId: 'u-uretim',
    assignerUnitId: 'u-uretim',
    workOrderNo: 'IE-URE-2025-112',
    projectCode: 'PRJ-2025-0099',
    projectName: 'Depo genişletme',
    kind: 'metraj',
    status: 'bloke',
    priority: 'acil',
    daysOnDesk: 6,
    lastUpdate: '22.03.2025 17:02',
    detailPresentation: 'panel',
    summaryNote: 'Bloke: beton sınıfı netleşmedi (satış onayı).',
  },
  {
    id: 'WO-2025-444',
    factoryCode: 'ANK-01',
    assigneeUnitId: 'u-uretim',
    assignerUnitId: 'u-kalite',
    workOrderNo: 'IE-KAL-2025-045',
    projectCode: 'PRJ-2025-0201',
    projectName: 'OSB perde seti',
    kind: 'quality',
    status: 'islemde',
    priority: 'normal',
    daysOnDesk: 2,
    lastUpdate: '23.03.2025 14:30',
    detailPresentation: 'dialog',
    summaryNote: 'İlk parça numune onayı — üretim hattı bekliyor.',
  },
  {
    id: 'WO-2025-445',
    factoryCode: 'IST-HAD',
    assigneeUnitId: 'u-uretim',
    assignerUnitId: 'u-lojistik',
    workOrderNo: 'IE-LOJ-2025-018',
    projectCode: 'PRJ-2025-0142',
    projectName: 'Kartal Konut P42',
    kind: 'logistics',
    status: 'beklemede',
    priority: 'dusuk',
    daysOnDesk: 0,
    lastUpdate: '24.03.2025 09:00',
    detailPresentation: 'panel',
    summaryNote: 'Sevk penceresi — palet etiketi üretimden sonra.',
  },
  {
    id: 'WO-2025-445b',
    factoryCode: 'IST-HAD',
    assigneeUnitId: 'u-uretim',
    assignerUnitId: 'u-muh',
    workOrderNo: 'IE-MUH-2025-091',
    projectCode: 'PRJ-2025-0118',
    projectName: 'Haliç Köprü Yaklaşımı',
    kind: 'production',
    status: 'islemde',
    priority: 'normal',
    daysOnDesk: 2,
    lastUpdate: '24.03.2025 10:20',
    detailPresentation: 'dialog',
    summaryNote: 'İkinci hat paralel iş — mühendislik çıkışı onaylı (üretim amiri eşzamanlı iş örneği).',
  },
  {
    id: 'WO-2025-446',
    factoryCode: 'IST-HAD',
    assigneeUnitId: 'u-satis',
    assignerUnitId: 'u-proje',
    workOrderNo: 'IE-PRJ-2025-032',
    projectCode: 'PRJ-2025-0166',
    projectName: 'Ofis çekirdek revizyon',
    kind: 'metraj',
    status: 'islemde',
    priority: 'yuksek',
    daysOnDesk: 4,
    lastUpdate: '21.03.2025 11:18',
    detailPresentation: 'dialog',
    summaryNote: 'Metraj çıkışı — teklif öncesi.',
  },
  {
    id: 'WO-2025-447',
    factoryCode: 'KOC-01',
    assigneeUnitId: 'u-proje',
    assignerUnitId: 'u-satis',
    workOrderNo: 'IE-SAT-2025-077',
    projectCode: 'PRJ-2025-0220',
    projectName: 'Lojistik merkezi',
    kind: 'field',
    status: 'beklemede',
    priority: 'normal',
    daysOnDesk: 2,
    lastUpdate: '23.03.2025 10:05',
    detailPresentation: 'panel',
    summaryNote: 'Saha ölçü teyidi — proje ofisi koordinasyonu.',
  },
]

export const MOCK_UNIT_WORK_ASSIGNED_BY: MockUnitWorkRow[] = [
  {
    id: 'WO-2025-501',
    factoryCode: 'IST-HAD',
    assigneeUnitId: 'u-muh',
    assignerUnitId: 'u-uretim',
    workOrderNo: 'IE-URE-2025-120',
    projectCode: 'PRJ-2025-0142',
    projectName: 'Kartal Konut P42',
    kind: 'pre_eng',
    status: 'islemde',
    priority: 'yuksek',
    daysOnDesk: 2,
    lastUpdate: '23.03.2025 07:55',
    detailPresentation: 'panel',
    summaryNote: 'Statik soru — mühendisliğe iletildi.',
  },
  {
    id: 'WO-2025-502',
    factoryCode: 'IST-HAD',
    assigneeUnitId: 'u-kalite',
    assignerUnitId: 'u-uretim',
    workOrderNo: 'IE-URE-2025-121',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    kind: 'quality',
    status: 'beklemede',
    priority: 'normal',
    daysOnDesk: 1,
    lastUpdate: '24.03.2025 06:40',
    detailPresentation: 'dialog',
    summaryNote: 'Seri üretim öncesi ilk numune talebi.',
    bie07: {
      parentMesCode: 'WO-885',
      requestType: 'numune',
      qualityProgress: 'devam',
    },
  },
  {
    id: 'WO-2025-508',
    factoryCode: 'IST-HAD',
    assigneeUnitId: 'u-kalite',
    assignerUnitId: 'u-uretim',
    workOrderNo: 'IE-URE-2025-119',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    kind: 'quality',
    status: 'islemde',
    priority: 'yuksek',
    daysOnDesk: 0,
    lastUpdate: '24.03.2025 07:10',
    detailPresentation: 'panel',
    summaryNote: 'İlk parça ölçü uygunluğu — üretim amiri kalite kontrol talebi.',
    bie07: {
      parentMesCode: 'WO-884',
      requestType: 'kalite_kontrol',
      qualityProgress: 'bekliyor',
    },
  },
  {
    id: 'WO-2025-503',
    factoryCode: 'KOC-01',
    assigneeUnitId: 'u-lojistik',
    assignerUnitId: 'u-uretim',
    workOrderNo: 'IE-URE-2025-122',
    projectCode: 'PRJ-2025-0099',
    projectName: 'Depo genişletme',
    kind: 'logistics',
    status: 'islemde',
    priority: 'acil',
    daysOnDesk: 5,
    lastUpdate: '20.03.2025 16:12',
    detailPresentation: 'panel',
    summaryNote: 'Yükleme penceresi — üretim tamamlanma tarihine bağlı.',
  },
  {
    id: 'WO-2025-504',
    factoryCode: 'ANK-01',
    assigneeUnitId: 'u-saha',
    assignerUnitId: 'u-uretim',
    workOrderNo: 'IE-URE-2025-123',
    projectCode: 'PRJ-2025-0201',
    projectName: 'OSB perde seti',
    kind: 'field',
    status: 'bloke',
    priority: 'normal',
    daysOnDesk: 3,
    lastUpdate: '22.03.2025 09:20',
    detailPresentation: 'dialog',
    summaryNote: 'Saha montaj takvimi — hava koşulu notu.',
  },
  {
    id: 'WO-2025-505',
    factoryCode: 'IST-HAD',
    assigneeUnitId: 'u-proje',
    assignerUnitId: 'u-satis',
    workOrderNo: 'IE-SAT-2025-080',
    projectCode: 'PRJ-2025-0166',
    projectName: 'Ofis çekirdek revizyon',
    kind: 'metraj',
    status: 'beklemede',
    priority: 'dusuk',
    daysOnDesk: 1,
    lastUpdate: '24.03.2025 08:10',
    detailPresentation: 'panel',
    summaryNote: 'Satıştan gelen müşteri notu — proje incelemesi.',
  },
  {
    id: 'WO-2025-506',
    factoryCode: 'IST-HAD',
    assigneeUnitId: 'u-uretim',
    assignerUnitId: 'u-muh',
    workOrderNo: 'IE-MUH-2025-090',
    projectCode: 'PRJ-2025-0142',
    projectName: 'Kartal Konut P42',
    kind: 'production',
    status: 'islemde',
    priority: 'yuksek',
    daysOnDesk: 1,
    lastUpdate: '24.03.2025 09:30',
    detailPresentation: 'dialog',
    summaryNote: 'Üretim emrine köprü — mühendislikten dönüş.',
  },
  {
    id: 'WO-2025-507',
    factoryCode: 'IST-HAD',
    assigneeUnitId: 'u-muh',
    assignerUnitId: 'u-uretim',
    workOrderNo: 'IE-URE-2025-124',
    projectCode: 'PRJ-2025-0099',
    projectName: 'Depo genişletme',
    kind: 'metraj',
    status: 'beklemede',
    priority: 'normal',
    daysOnDesk: 0,
    lastUpdate: '24.03.2025 11:00',
    detailPresentation: 'panel',
    summaryNote: 'Metraj revizyonu — mühendislik incelemesi için gönderildi.',
  },
]

/** P2 — üst yönetim read-only birim özeti (mock) */
export type MockUnitExecSummary = {
  unitId: string
  openCount: number
  blockedCount: number
  dueTodayCount: number
}

export const MOCK_UNIT_EXEC_SUMMARY: MockUnitExecSummary[] = [
  { unitId: 'u-satis', openCount: 4, blockedCount: 0, dueTodayCount: 1 },
  { unitId: 'u-proje', openCount: 7, blockedCount: 1, dueTodayCount: 2 },
  { unitId: 'u-muh', openCount: 11, blockedCount: 2, dueTodayCount: 3 },
  { unitId: 'u-uretim', openCount: 14, blockedCount: 3, dueTodayCount: 4 },
  { unitId: 'u-kalite', openCount: 6, blockedCount: 1, dueTodayCount: 2 },
  { unitId: 'u-arge', openCount: 2, blockedCount: 0, dueTodayCount: 0 },
  { unitId: 'u-lojistik', openCount: 5, blockedCount: 0, dueTodayCount: 1 },
  { unitId: 'u-saha', openCount: 3, blockedCount: 1, dueTodayCount: 1 },
]

/**
 * bie-07 — üretim amiri senaryosu: aktif (tamamlanmamış) MES üretim emri örnekleri (5 adet).
 * `initialWorkOrders` içinde: wo1, wo2, wo3, wo5, wo6 (mock).
 */
export const BIE07_DEMO_ACTIVE_MES_IDS = ['wo1', 'wo2', 'wo3', 'wo5', 'wo6'] as const

export function unitNameById(id: string): string {
  return MOCK_UNITS.find((u) => u.id === id)?.name ?? id
}
