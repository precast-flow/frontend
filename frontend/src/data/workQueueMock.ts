import { MOCK_MANAGED_USERS } from './mockUsers'

/** Demo: oturumdaki kullanıcı — atanmış / verdiği işler buna göre filtrelenir. */
export const MOCK_WORK_QUEUE_VIEWER_ID = 'u-sen'

export type WorkQueuePerspective = 'to_me' | 'by_me'

export type WorkQueueOrgUnit =
  | 'planning'
  | 'procurement'
  | 'drawing'
  | 'production'
  | 'quality'
  | 'logistics_field'
  | 'crm'

export type WorkQueueKind =
  | 'metraj'
  | 'pre_eng'
  | 'arge'
  | 'production'
  | 'quality'
  | 'logistics'
  | 'field'
  | 'procurement'

export type WorkQueueStatus = 'beklemede' | 'islemde' | 'bloke' | 'tamamlandi'

export type WorkQueuePriority = 'dusuk' | 'normal' | 'yuksek' | 'acil'

export type WorkQueueItem = {
  id: string
  orderNo: string
  title: string
  summary: string
  detailBody: string
  kind: WorkQueueKind
  status: WorkQueueStatus
  priority: WorkQueuePriority
  /** Filtre: işin düştüğü hedef birim */
  targetUnit: WorkQueueOrgUnit
  fromUnit: WorkQueueOrgUnit
  toUnit: WorkQueueOrgUnit
  assigneeUserId: string | null
  assignerUserId: string
  projectCode: string
  projectName: string
  /** Proje yönetimi detay route */
  projectRouteId: string | null
  factoryCode: string
  daysOnDesk: number
  lastUpdatedLabel: string
  dueToday?: boolean
}

/** Sol üst birim seçicide sıra — tüm birimleri demoda kapsamak için. */
export const WORK_QUEUE_ORG_SEQUENCE: readonly { id: WorkQueueOrgUnit; labelKey: string }[] = [
  { id: 'planning', labelKey: 'unitWorkQueue.org.planning' },
  { id: 'procurement', labelKey: 'unitWorkQueue.org.procurement' },
  { id: 'drawing', labelKey: 'unitWorkQueue.org.drawing' },
  { id: 'production', labelKey: 'unitWorkQueue.org.production' },
  { id: 'quality', labelKey: 'unitWorkQueue.org.quality' },
  { id: 'logistics_field', labelKey: 'unitWorkQueue.org.logisticsField' },
  { id: 'crm', labelKey: 'unitWorkQueue.org.crm' },
] as const

export const WORK_QUEUE_ITEMS: WorkQueueItem[] = [
  {
    id: 'wq-01',
    orderNo: 'IW-2025-0143',
    title: 'Yeni proje kartı — disiplin kontrolü',
    summary: 'Proje satın alma Mamak AVM kaydını oluşturdu; planlama onayı bekleniyor.',
    detailBody:
      'Çizim ve keşif birimleri tetiklenmeden önce proje kartı üzerinde teklif disiplinlerinin doğrulanması gerekiyor. Eksik alanlar: taşıyıcı sistem notu, teslim adresi blok kodu.',
    kind: 'procurement',
    status: 'islemde',
    priority: 'yuksek',
    targetUnit: 'planning',
    fromUnit: 'procurement',
    toUnit: 'planning',
    assigneeUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    assignerUserId: 'u3',
    projectCode: 'PRJ-MMK-026',
    projectName: 'Mamak ticari blok',
    projectRouteId: 'pm-5',
    factoryCode: 'IST-HAD',
    daysOnDesk: 1,
    lastUpdatedLabel: '06.05.2025 07:42',
    dueToday: true,
  },
  {
    id: 'wq-02',
    orderNo: 'IW-2025-0140',
    title: 'Metraj ve keşif talebi (çizim)',
    summary: 'Planlama üzerinden çizim birimine iletildi — IFC ön revizyon.',
    detailBody:
      'Kalıp çıkış öncesi metraj doğrulanacak; keşif formu BIM koordinasyon notlarıyla birlikte yüklendi. Beklenen çıktı: keşif PDF + kritik yüzölçümleri tablosu.',
    kind: 'metraj',
    status: 'beklemede',
    priority: 'normal',
    targetUnit: 'drawing',
    fromUnit: 'planning',
    toUnit: 'drawing',
    assigneeUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    assignerUserId: 'u-emre',
    projectCode: 'PRJ-KYS-811',
    projectName: 'Kayasphere fabrika ek bina',
    projectRouteId: 'pm-1',
    factoryCode: 'IST-HAD',
    daysOnDesk: 2,
    lastUpdatedLabel: '05.05.2025 16:08',
  },
  {
    id: 'wq-03',
    orderNo: 'IW-2025-0138',
    title: 'Hat D — döküm serisi Öğleden sonra',
    summary: 'Çiftlik öncülü döküş; ön germe blokları ve bağlantılar.',
    detailBody:
      'Üretim vardiyasının günlük iş listesi. Kalıp uygunluk onayı sahada sabah verildi; mikser reçete no R-884 ile bağlantılı.',
    kind: 'production',
    status: 'islemde',
    priority: 'acil',
    targetUnit: 'production',
    fromUnit: 'planning',
    toUnit: 'production',
    assigneeUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    assignerUserId: 'u-emre',
    projectCode: 'PRJ-ATL-441',
    projectName: 'Atlı sanayi hattı',
    projectRouteId: 'pm-3',
    factoryCode: 'IST-HAD',
    daysOnDesk: 0,
    lastUpdatedLabel: 'Bugün 06:10',
    dueToday: true,
  },
  {
    id: 'wq-04',
    orderNo: 'IW-2025-0136',
    title: 'Çekilir numune — C30/37 yer döşemesi',
    summary: 'Numune labouratuvara bugün gidiyor; test çizelgesi kalite bekliyor.',
    detailBody:
      'Laboratuvara iki gövde + slump fotoğrafları eklendi. Sonuçlar MES parti kaydına bağlanacak; bloke aksiyonu üretimi durdurmadan bekleniyor.',
    kind: 'quality',
    status: 'bloke',
    priority: 'yuksek',
    targetUnit: 'quality',
    fromUnit: 'production',
    toUnit: 'quality',
    assigneeUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    assignerUserId: 'u5',
    projectCode: 'PRJ-ATL-441',
    projectName: 'Atlı sanayi hattı',
    projectRouteId: 'pm-3',
    factoryCode: 'IST-HAD',
    daysOnDesk: 3,
    lastUpdatedLabel: '04.05.2025 11:52',
    dueToday: true,
  },
  {
    id: 'wq-05',
    orderNo: 'IW-2025-0135',
    title: 'Sevkiyat penceresi — Ankara çıkışı',
    summary: '14:00 slot; vinç dahil nakliye güzergâh uygunluğu teyidi.',
    detailBody:
      'Lojistik & saha: şantiye sahasında boşaltma alanı rezervasyonu ve trafik kısıtlaması bildirildi. Çıkış listesi araç plakası + şoför doğrulanacak.',
    kind: 'logistics',
    status: 'beklemede',
    priority: 'normal',
    targetUnit: 'logistics_field',
    fromUnit: 'planning',
    toUnit: 'logistics_field',
    assigneeUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    assignerUserId: 'u1',
    projectCode: 'PRJ-KYS-811',
    projectName: 'Kayasphere fabrika ek bina',
    projectRouteId: 'pm-1',
    factoryCode: 'IST-HAD',
    daysOnDesk: 1,
    lastUpdatedLabel: 'Bugün 08:05',
    dueToday: true,
  },
  {
    id: 'wq-06',
    orderNo: 'IW-2025-0134',
    title: 'Teklif revizyonu — müşteri geri bildirimi',
    summary: 'CRM kartında son görüşme notu güncellenmedi; aksiyon sizde.',
    detailBody:
      'Müşteri “Kiriş cephe yüz paneli kalınlığı” için alternatif bekliyor; teklif modülünden revize satır seçilerek yanıt verilecek (mock bağlantı).',
    kind: 'pre_eng',
    status: 'islemde',
    priority: 'normal',
    targetUnit: 'crm',
    fromUnit: 'crm',
    toUnit: 'crm',
    assigneeUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    assignerUserId: 'u2',
    projectCode: 'PRJ-MMK-026',
    projectName: 'Mamak ticari blok',
    projectRouteId: 'pm-5',
    factoryCode: 'KOC-01',
    daysOnDesk: 4,
    lastUpdatedLabel: '02.05.2025 14:20',
  },
  {
    id: 'wq-07',
    orderNo: 'IW-2025-0129',
    title: 'Beton deneyi — yüksek dayanım serisi',
    summary: 'ARGE laboratuvarında 7 günlük kür takibi (üretim öncesi seri).',
    detailBody:
      'Deney numuneleri üretim hattına seri açılmadan önce onaylanmalı. Sonuç girişi laboratuvar terminalinden yapılacak (mock).',
    kind: 'arge',
    status: 'beklemede',
    priority: 'dusuk',
    targetUnit: 'quality',
    fromUnit: 'production',
    toUnit: 'quality',
    assigneeUserId: 'u6',
    assignerUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    projectCode: 'PRJ-ALT-220',
    projectName: 'Altınşehir konut etabı',
    projectRouteId: 'pm-7',
    factoryCode: 'ANK-01',
    daysOnDesk: 5,
    lastUpdatedLabel: '01.05.2025 09:00',
  },
  {
    id: 'wq-08',
    orderNo: 'IW-2025-0127',
    title: 'Saha montaj — tolerans ölçümü',
    summary: 'Şantiye koordinatörü kaynak çizgisi tolerans raporu istiyor.',
    detailBody:
      'Saha ekibi bugünkü dilimde ölçüm fotoğrafları yükleyecek; nötr şahit imzalı form mock veri olarak saklanır.',
    kind: 'field',
    status: 'islemde',
    priority: 'yuksek',
    targetUnit: 'logistics_field',
    fromUnit: 'drawing',
    toUnit: 'logistics_field',
    assigneeUserId: 'u4',
    assignerUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    projectCode: 'PRJ-KYS-811',
    projectName: 'Kayasphere fabrika ek bina',
    projectRouteId: 'pm-1',
    factoryCode: 'IST-HAD',
    daysOnDesk: 2,
    lastUpdatedLabel: '05.05.2025 18:30',
  },
  {
    id: 'wq-09',
    orderNo: 'IW-2025-0124',
    title: 'Metraj onayı — istinat duvarı revizyonu',
    summary: 'Çizim birimine planlama tarafından iletildi; hedef birim çizim.',
    detailBody:
      'Revizyon sonrası hacim farkı %4.2; keşif birimi senkronize edilecek. BIM referansı v3.1.',
    kind: 'metraj',
    status: 'tamamlandi',
    priority: 'normal',
    targetUnit: 'drawing',
    fromUnit: 'planning',
    toUnit: 'drawing',
    assigneeUserId: 'u4',
    assignerUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    projectCode: 'PRJ-ALT-220',
    projectName: 'Altınşehir konut etabı',
    projectRouteId: 'pm-7',
    factoryCode: 'IST-HAD',
    daysOnDesk: 6,
    lastUpdatedLabel: '28.04.2025 10:55',
  },
  {
    id: 'wq-10',
    orderNo: 'IW-2025-0122',
    title: 'Kalıp yüzey bakım rutini — C hattı',
    summary: 'Üretimin günlük operasyon kartı.',
    detailBody:
      'Rutin liste MES günlük temizlik kayıtlarına yazılır; kalite nöbet kontrolünde örneklenir.',
    kind: 'production',
    status: 'beklemede',
    priority: 'normal',
    targetUnit: 'production',
    fromUnit: 'production',
    toUnit: 'production',
    assigneeUserId: 'u5',
    assignerUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    projectCode: 'PRJ-ATL-441',
    projectName: 'Atlı sanayi hattı',
    projectRouteId: 'pm-3',
    factoryCode: 'IST-HAD',
    daysOnDesk: 1,
    lastUpdatedLabel: '05.05.2025 07:05',
  },
  {
    id: 'wq-11',
    orderNo: 'IW-2025-0119',
    title: 'Yeni ürün — satın alma koşulları',
    summary: 'Tedarikçi teklifi değerlendirmesi; proje kartı oluşturulacak.',
    detailBody:
      'Kalıp bağlantı seti için üç teklif toplandı; en uygun teklif onayından sonra proje oluşturma sürecine geçilir (demo).',
    kind: 'procurement',
    status: 'islemde',
    priority: 'normal',
    targetUnit: 'procurement',
    fromUnit: 'procurement',
    toUnit: 'procurement',
    assigneeUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    assignerUserId: 'u3',
    projectCode: 'PRJ-MMK-026',
    projectName: 'Mamak ticari blok',
    projectRouteId: 'pm-5',
    factoryCode: 'IST-HAD',
    daysOnDesk: 2,
    lastUpdatedLabel: '04.05.2025 13:12',
  },
  {
    id: 'wq-12',
    orderNo: 'IW-2025-0118',
    title: 'Numune rezervasyonu — laboratuvar',
    summary: 'Kalite birimi bugünkü sırayı onaylıyor.',
    detailBody:
      'Laboratuvar penceresi 11:30; numune kutusu IST-HAD kantarından çıkış yapılacak.',
    kind: 'quality',
    status: 'islemde',
    priority: 'normal',
    targetUnit: 'quality',
    fromUnit: 'quality',
    toUnit: 'quality',
    assigneeUserId: MOCK_WORK_QUEUE_VIEWER_ID,
    assignerUserId: 'u6',
    projectCode: 'PRJ-ATL-441',
    projectName: 'Atlı sanayi hattı',
    projectRouteId: 'pm-3',
    factoryCode: 'IST-HAD',
    daysOnDesk: 0,
    lastUpdatedLabel: 'Bugün 07:58',
    dueToday: true,
  },
]

export function resolveWorkQueueName(userId: string): string {
  return MOCK_MANAGED_USERS.find((u) => u.id === userId)?.name ?? userId
}

export function filterWorkQueueItems(
  rows: readonly WorkQueueItem[],
  opts: {
    perspective: WorkQueuePerspective
    unit: WorkQueueOrgUnit | 'all'
    viewerId: string
    search: string
    factoryRestricted: boolean
    factoryAllows: (code: string) => boolean
  },
): WorkQueueItem[] {
  const q = opts.search.trim().toLowerCase()
  return rows.filter((row) => {
    if (opts.perspective === 'to_me' && row.assigneeUserId !== opts.viewerId) return false
    if (opts.perspective === 'by_me' && row.assignerUserId !== opts.viewerId) return false
    if (opts.unit !== 'all' && row.targetUnit !== opts.unit) return false
    if (opts.factoryRestricted && !opts.factoryAllows(row.factoryCode)) return false
    if (!q) return true
    const hay = `${row.orderNo} ${row.title} ${row.summary} ${row.projectCode} ${row.projectName}`.toLowerCase()
    return hay.includes(q)
  })
}
