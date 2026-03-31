export type QueueLane = 'bekleyen' | 'devam' | 'tamamlandi'

export type QualityItem = {
  id: string
  code: string
  element: string
  workOrder: string
  project: string
  lane: QueueLane
}

export const qualityQueues: Record<QueueLane, QualityItem[]> = {
  bekleyen: [
    {
      id: 'q1',
      code: 'QC-2401',
      element: 'T kiriş 12m',
      workOrder: 'WO-884',
      project: 'PRJ-2026-014',
      lane: 'bekleyen',
    },
    {
      id: 'q2',
      code: 'QC-2402',
      element: 'Panel P-40',
      workOrder: 'WO-885',
      project: 'PRJ-2026-014',
      lane: 'bekleyen',
    },
  ],
  devam: [
    {
      id: 'q3',
      code: 'QC-2398',
      element: 'Konsol K-02',
      workOrder: 'WO-881',
      project: 'PRJ-2026-014',
      lane: 'devam',
    },
  ],
  tamamlandi: [
    {
      id: 'q4',
      code: 'QC-2390',
      element: 'Segment M',
      workOrder: 'WO-870',
      project: 'PRJ-2025-088',
      lane: 'tamamlandi',
    },
  ],
}

export const rejectReasonCodes = [
  { value: 'OLCU', label: 'Ölçü tolerans dışı' },
  { value: 'CAT', label: 'Çatlak / yüzey hatası' },
  { value: 'BET', label: 'Beton testi uyumsuz' },
  { value: 'DOK', label: 'Döküm hatası' },
  { value: 'DIG', label: 'Diğer' },
] as const
