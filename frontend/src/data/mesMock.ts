/** prod-02 — durum makinesi (mock) + gri tonları */
export type WorkOrderStatus =
  | 'planlandi'
  | 'uretimde'
  | 'beklemede'
  | 'kalite_bekliyor'
  | 'tamamlandi'
  | 'bloke'

export type LineEvent = { id: string; at: string; message: string }

export type QualityInspectionDraft = {
  lengthMm: string
  widthMm: string
  visualNote: string
  slumpCm: string
  pressureMpa: string
}

export type WorkOrderPart = { id: string; name: string; qty: number }

export type WorkOrderRevision = { id: string; at: string; message: string }

export type WorkOrderAttachment = { id: string; name: string; type: 'pdf' | 'dwg' }

export type WorkOrder = {
  id: string
  code: string
  project: string
  /** Parça özeti (liste kolonu) */
  element: string
  lineId: string
  slotIndex: number
  factoryCode: string
  mold: string
  concreteClass: string
  durationMin: number
  notes: string
  status: WorkOrderStatus
  transitionNote?: string
  lineEvents: LineEvent[]
  qualityInspection?: QualityInspectionDraft
  /** prod-02 — plan tarihi (YYYY-MM-DD) */
  plannedDate: string
  /** Sorumlu vardiya (mock) */
  shiftOwner: string
  parts: WorkOrderPart[]
  /** P1 — revizyon geçmişi */
  revisions: WorkOrderRevision[]
  /** P1 — bloke */
  blockReason?: string
  blockResolution?: string
  /** P2 — ekler */
  attachments?: WorkOrderAttachment[]
}

export const mesLines = [
  { id: 'L1', label: 'Hat A — Kalıphane' },
  { id: 'L2', label: 'Hat B — Demir' },
] as const

export const mesSlots = ['08–10', '10–12', '12–14', '14–16'] as const

/** 10 mock satır — prod-02 */
export const initialWorkOrders: WorkOrder[] = [
  {
    id: 'wo1',
    code: 'WO-884',
    project: 'PRJ-2026-014',
    element: 'T kiriş 12m',
    lineId: 'L1',
    slotIndex: 1,
    factoryCode: 'IST-HAD',
    mold: 'K-12T-A',
    concreteClass: 'C35/45',
    durationMin: 95,
    notes: 'Mühendislik paketi v2 referans.',
    status: 'uretimde',
    plannedDate: '2026-03-20',
    shiftOwner: 'Gündüz A',
    parts: [
      { id: 'p1', name: 'T kiriş gövde', qty: 1 },
      { id: 'p2', name: 'Çelik iskelet seti', qty: 1 },
    ],
    revisions: [{ id: 'r1', at: '19.03.2026 14:00', message: 'Rev A — ankraj aralığı güncellendi' }],
    attachments: [
      { id: 'a1', name: 'K-12T-A_çizim.pdf', type: 'pdf' },
      { id: 'a2', name: 'K-12T-A_plan.dwg', type: 'dwg' },
    ],
    lineEvents: [
      { id: 'e1', at: '08:12', message: 'Kalıp yerleşimi onaylandı' },
      { id: 'e2', at: '09:40', message: 'Döküm başladı' },
      { id: 'e3', at: '11:05', message: 'Vibrasyon döngüsü tamam' },
    ],
  },
  {
    id: 'wo2',
    code: 'WO-885',
    project: 'PRJ-2026-014',
    element: 'Panel P-40',
    lineId: 'L1',
    slotIndex: 3,
    factoryCode: 'IST-HAD',
    mold: 'P40-01',
    concreteClass: 'C30/37',
    durationMin: 120,
    notes: '',
    status: 'kalite_bekliyor',
    transitionNote: 'Üretim hattı tamamlandı — otomatik kalite kuyruğu (mock).',
    plannedDate: '2026-03-20',
    shiftOwner: 'Gündüz A',
    parts: [{ id: 'p1', name: 'Panel P-40 ana', qty: 4 }],
    revisions: [],
    attachments: [{ id: 'a1', name: 'P40_kesit.pdf', type: 'pdf' }],
    lineEvents: [
      { id: 'e1', at: '06:00', message: 'Emir slotu açıldı' },
      { id: 'e2', at: '10:15', message: 'Döküm tamamlandı' },
      { id: 'e3', at: '12:40', message: 'Kalıp ayırıldı — QC bekleniyor' },
    ],
    qualityInspection: {
      lengthMm: '12005',
      widthMm: '598',
      visualNote: 'Yüzey temiz; kalıp ayırıcı hizası uygun.',
      slumpCm: '12',
      pressureMpa: '38.5',
    },
  },
  {
    id: 'wo3',
    code: 'WO-886',
    project: 'PRJ-2026-018',
    element: 'Konsol K-02',
    lineId: 'L2',
    slotIndex: 0,
    factoryCode: 'IST-HAD',
    mold: 'K02-X',
    concreteClass: 'C40/50',
    durationMin: 60,
    notes: 'Öncelik düşük.',
    status: 'planlandi',
    plannedDate: '2026-03-21',
    shiftOwner: 'Gece B',
    parts: [{ id: 'p1', name: 'Konsol K-02', qty: 2 }],
    revisions: [],
    attachments: [],
    lineEvents: [],
  },
  {
    id: 'wo4',
    code: 'WO-870',
    project: 'PRJ-2025-088',
    element: 'Segment M',
    lineId: 'L1',
    slotIndex: 2,
    factoryCode: 'KOC-01',
    mold: 'SEG-M',
    concreteClass: 'C45/55',
    durationMin: 180,
    notes: 'Sevkiyat öncesi son kontrol tamam.',
    status: 'tamamlandi',
    plannedDate: '2026-03-18',
    shiftOwner: 'Gündüz A',
    parts: [{ id: 'p1', name: 'Segment M', qty: 1 }],
    revisions: [{ id: 'r1', at: '17.03.2026 09:00', message: 'Rev 0 — ilk onay' }],
    attachments: [{ id: 'a1', name: 'SEG-M_toplam.pdf', type: 'pdf' }],
    lineEvents: [
      { id: 'e1', at: 'Dün 16:20', message: 'QC onayı — ölçü ve beton uygun' },
      { id: 'e2', at: 'Dün 16:22', message: 'Yard’a aktarım hazır' },
    ],
    qualityInspection: {
      lengthMm: '8400',
      widthMm: '2200',
      visualNote: 'Onaylı.',
      slumpCm: '11',
      pressureMpa: '42',
    },
  },
  {
    id: 'wo5',
    code: 'WO-890',
    project: 'PRJ-2026-020',
    element: 'Duvar D-90',
    lineId: 'L2',
    slotIndex: 1,
    factoryCode: 'IST-HAD',
    mold: 'D90-02',
    concreteClass: 'C30/37',
    durationMin: 90,
    notes: 'Vibrasyon ünitesi arızası — üretim durdu.',
    status: 'bloke',
    blockReason: 'Vibrasyon motoru aşırı ısı — bakım bekleniyor.',
    blockResolution: '',
    plannedDate: '2026-03-20',
    shiftOwner: 'Gündüz A',
    parts: [{ id: 'p1', name: 'Panel D-90', qty: 3 }],
    revisions: [],
    attachments: [{ id: 'a1', name: 'D90_çizim.pdf', type: 'pdf' }],
    lineEvents: [
      { id: 'e1', at: '07:30', message: 'Hat başlatıldı' },
      { id: 'e2', at: '08:12', message: 'BLOKE — vibrasyon motoru hatası' },
    ],
  },
  {
    id: 'wo6',
    code: 'WO-891',
    project: 'PRJ-2026-014',
    element: 'Hat çıkışı H-12',
    lineId: 'L1',
    slotIndex: 0,
    factoryCode: 'IST-HAD',
    mold: 'H12',
    concreteClass: 'C35/45',
    durationMin: 45,
    notes: 'Çimento sevkiyatı gecikti.',
    status: 'beklemede',
    transitionNote: 'Malzeme beklemede (mock).',
    plannedDate: '2026-03-20',
    shiftOwner: 'Gündüz A',
    parts: [{ id: 'p1', name: 'Hat çıkış elemanı', qty: 1 }],
    revisions: [],
    attachments: [],
    lineEvents: [{ id: 'e1', at: '06:00', message: 'Emir slotu açıldı — bekleniyor' }],
  },
  {
    id: 'wo7',
    code: 'WO-892',
    project: 'PRJ-2026-022',
    element: 'Kiriş K-40',
    lineId: 'L1',
    slotIndex: 3,
    factoryCode: 'KOC-01',
    mold: 'K40-Std',
    concreteClass: 'C40/50',
    durationMin: 110,
    notes: '',
    status: 'uretimde',
    plannedDate: '2026-03-20',
    shiftOwner: 'Akşam C',
    parts: [
      { id: 'p1', name: 'K-40 gövde', qty: 1 },
      { id: 'p2', name: 'Alt bağlantı plakası', qty: 1 },
    ],
    revisions: [{ id: 'r1', at: '18.03.2026 11:00', message: 'Rev B — çelik revizyon' }],
    attachments: [
      { id: 'a1', name: 'K40_thumb.pdf', type: 'pdf' },
      { id: 'a2', name: 'K40_thumb.dwg', type: 'dwg' },
    ],
    lineEvents: [
      { id: 'e1', at: '14:00', message: 'Döküm başladı' },
      { id: 'e2', at: '15:20', message: 'Soğutma süreci' },
    ],
  },
  {
    id: 'wo8',
    code: 'WO-893',
    project: 'PRJ-2026-019',
    element: 'Trepez T-08',
    lineId: 'L2',
    slotIndex: 2,
    factoryCode: 'IST-HAD',
    mold: 'T08',
    concreteClass: 'C35/45',
    durationMin: 75,
    notes: 'Yarın sabah başlatılacak.',
    status: 'planlandi',
    plannedDate: '2026-03-21',
    shiftOwner: 'Gündüz A',
    parts: [{ id: 'p1', name: 'Trepez döşeme', qty: 1 }],
    revisions: [],
    attachments: [],
    lineEvents: [],
  },
  {
    id: 'wo9',
    code: 'WO-894',
    project: 'PRJ-2026-014',
    element: 'Panel P-40 (kopya)',
    lineId: 'L1',
    slotIndex: 1,
    factoryCode: 'IST-HAD',
    mold: 'P40-01',
    concreteClass: 'C30/37',
    durationMin: 120,
    notes: '',
    status: 'kalite_bekliyor',
    plannedDate: '2026-03-19',
    shiftOwner: 'Gece B',
    parts: [{ id: 'p1', name: 'Panel P-40', qty: 2 }],
    revisions: [],
    attachments: [{ id: 'a1', name: 'P40_plan.pdf', type: 'pdf' }],
    lineEvents: [
      { id: 'e1', at: '22:10', message: 'Döküm tamamlandı' },
      { id: 'e2', at: '23:05', message: 'QC kuyruğunda' },
    ],
    qualityInspection: {
      lengthMm: '6000',
      widthMm: '3000',
      visualNote: '',
      slumpCm: '',
      pressureMpa: '',
    },
  },
  {
    id: 'wo10',
    code: 'WO-895',
    project: 'PRJ-2026-025',
    element: 'Özel PS-1',
    lineId: 'L2',
    slotIndex: 3,
    factoryCode: 'KOC-01',
    mold: 'PS-1',
    concreteClass: 'C50/60',
    durationMin: 200,
    notes: 'PLC haberleşme kesintisi.',
    status: 'bloke',
    blockReason: 'Hat PLC ile santral arası kopuk — IT/OT müdahalesi.',
    blockResolution: 'Geçici çözüm: manuel döküm modu (test).',
    plannedDate: '2026-03-20',
    shiftOwner: 'Akşam C',
    parts: [{ id: 'p1', name: 'PS-1 monoblock', qty: 1 }],
    revisions: [{ id: 'r1', at: '20.03.2026 08:00', message: 'Rev 1 — özel kalıp' }],
    attachments: [{ id: 'a1', name: 'PS1_özet.pdf', type: 'pdf' }],
    lineEvents: [{ id: 'e1', at: '06:00', message: 'BLOKE — PLC bağlantısı' }],
  },
]

/** Teknik durum etiketi (kalite akışı dahil) */
export function statusLabel(s: WorkOrderStatus): string {
  switch (s) {
    case 'planlandi':
      return 'Planlandı'
    case 'uretimde':
      return 'Üretimde'
    case 'beklemede':
      return 'Beklemede'
    case 'kalite_bekliyor':
      return 'Kalite bekliyor'
    case 'tamamlandi':
      return 'Tamamlandı'
    case 'bloke':
      return 'Bloke (arıza)'
  }
}

/**
 * prod-02 liste kolonu — 5 ana görünüm (QC bekleme → “Beklemede” alt kümesi).
 */
export function statusLabelProd02(s: WorkOrderStatus): string {
  switch (s) {
    case 'planlandi':
      return 'Planlandı'
    case 'uretimde':
      return 'Üretimde'
    case 'beklemede':
      return 'Beklemede'
    case 'kalite_bekliyor':
      return 'Beklemede (QC)'
    case 'tamamlandi':
      return 'Tamamlandı'
    case 'bloke':
      return 'Bloke (arıza)'
  }
}

/** Gri tonları — prod-02 */
export function statusRowClass(s: WorkOrderStatus): string {
  switch (s) {
    case 'planlandi':
      return 'bg-gray-50/90 text-gray-900 dark:bg-gray-950/40 dark:text-gray-100'
    case 'uretimde':
      return 'bg-gray-100/95 text-gray-900 dark:bg-gray-900/90 dark:text-gray-50'
    case 'beklemede':
      return 'bg-gray-200/80 text-gray-900 dark:bg-gray-800/80 dark:text-gray-100'
    case 'kalite_bekliyor':
      return 'bg-gray-200/90 text-gray-900 dark:bg-gray-800/90 dark:text-gray-50'
    case 'tamamlandi':
      return 'bg-gray-300/70 text-gray-900 dark:bg-gray-700/80 dark:text-gray-50'
    case 'bloke':
      return 'bg-gray-700/90 text-gray-50 dark:bg-gray-600/90 dark:text-gray-50'
  }
}

export function formatPlannedDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}.${m}.${y}`
}
