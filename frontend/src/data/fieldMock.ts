/** mvp-12 — şantiye web (responsive); dispatch ile eşleşen sevk no’lar */
export type FieldTaskKind = 'teslim_bekliyor' | 'montaj' | 'uyari'

export type FieldDeliveryLine = {
  id: string
  /** Sevkiyat modülü ile mock eşleşme */
  sevkNo: string
  summary: string
}

export type FieldTask = {
  id: string
  projectId: string
  kind: FieldTaskKind
  /** Kart başlığı */
  cardTitle: string
  subtitle: string
  time: string
  /** Teslim kartı — 2 satır */
  deliveries?: FieldDeliveryLine[]
  /** Montaj */
  montajElement?: string
  /** Uyarı / blokaj */
  blockReason?: string
  blockOwner?: string
  blockSolution?: string
}

export const fieldProjects = [
  { id: 'fp1', label: 'PRJ-2026-014 · Köprü Lot-2' },
  { id: 'fp2', label: 'PRJ-2025-088 · Viyadük' },
] as const

/** Bugün 3 kart: teslim bekliyor (içinde 2 sevk satırı), montaj, uyarı */
export const fieldTasks: FieldTask[] = [
  {
    id: 't1',
    projectId: 'fp1',
    kind: 'teslim_bekliyor',
    cardTitle: 'Teslim bekliyor',
    subtitle: '2 sevkiyat · dispatch mock',
    time: 'Bugün',
    deliveries: [
      { id: 'td1', sevkNo: 'SVK-2026-0321', summary: '6 eleman · İstanbul çıkış' },
      { id: 'td2', sevkNo: 'SVK-2026-0322', summary: '6 eleman · Metro depo' },
    ],
  },
  {
    id: 't2',
    projectId: 'fp1',
    kind: 'montaj',
    cardTitle: 'Montaj',
    subtitle: 'Hat A · T kiriş 12m',
    time: '15:30',
    montajElement: 'E-1001',
  },
  {
    id: 't3',
    projectId: 'fp1',
    kind: 'uyari',
    cardTitle: 'Uyarı',
    subtitle: 'Vinç / güvenlik',
    time: 'Açık',
    blockReason: 'Vinç 08:00–12:00 rezerve',
    blockOwner: 'Şantiye şefi',
    blockSolution: 'Öğleden sonra yeniden dene',
  },
  {
    id: 't4',
    projectId: 'fp2',
    kind: 'teslim_bekliyor',
    cardTitle: 'Teslim bekliyor',
    subtitle: '1 sevkiyat',
    time: 'Bugün',
    deliveries: [{ id: 'td3', sevkNo: 'SVK-2026-0323', summary: '6 eleman · Gebze' }],
  },
  {
    id: 't5',
    projectId: 'fp2',
    kind: 'montaj',
    cardTitle: 'Montaj',
    subtitle: 'Segment hattı',
    time: '09:00',
    montajElement: 'E-0880',
  },
  {
    id: 't6',
    projectId: 'fp2',
    kind: 'uyari',
    cardTitle: 'Uyarı',
    subtitle: 'Erişim yolu',
    time: 'Dikkat',
    blockReason: 'Bölgesel trafik yönlendirmesi',
    blockOwner: 'İSG',
    blockSolution: 'Alternatif rampa kullan',
  },
]

export const blokajSebepOptions = [
  { value: 'vinc', label: 'Vinç / ekipman müsait değil' },
  { value: 'hava', label: 'Hava koşulları' },
  { value: 'trafik', label: 'Trafik / erişim' },
  { value: 'diger', label: 'Diğer' },
] as const
