export type ProjectStatus = 'tasarim' | 'uretim' | 'yard' | 'sevkiyat' | 'saha' | 'tamamlandi'

export type ProjectElement = {
  id: string
  code: string
  type: string
  status: string
  rev: string
}

export type ProjectRisk = {
  id: string
  title: string
  impact: 'dusuk' | 'orta' | 'yuksek'
  owner: string
}

export type ProjectMilestone = {
  id: string
  date: string
  label: string
}

export type LinkedQuote = {
  number: string
  totalLabel: string
  /** Teklif modülünde vurgu için mock referans */
  hint: string
}

export type Project = {
  id: string
  code: string
  name: string
  customer: string
  status: ProjectStatus
  deadline: string
  /** Salt okunur fabrika kodu (mock) */
  factoryCode: string
  /** bie-03 — yapı yeri / adres özeti */
  siteAddress: string
  /** bie-03 — kısa kapsam (teklif yan paneli) */
  scopeShort: string
  owners: string[]
  /** 0..4 — macroSteps ile uyumlu */
  currentStepIndex: number
  elements: ProjectElement[]
  risks: ProjectRisk[]
  milestones: ProjectMilestone[]
  linkedQuote: LinkedQuote | null
}

/** mvp-07 — özet şerit: tasarım → üretim → yard → sevkiyat → saha */
export const macroSteps = ['Tasarım', 'Üretim', 'Yard', 'Sevkiyat', 'Saha'] as const

const elements10: ProjectElement[] = [
  { id: 'e1', code: 'E-1001', type: 'T kiriş 12m', status: 'Üretimde', rev: 'C' },
  { id: 'e2', code: 'E-1002', type: 'Panel P-40', status: 'Yardda', rev: 'B' },
  { id: 'e3', code: 'E-1003', type: 'Konsol K-02', status: 'Kontrol', rev: 'A' },
  { id: 'e4', code: 'E-1004', type: 'Kolon C1', status: 'Üretimde', rev: 'B' },
  { id: 'e5', code: 'E-1005', type: 'Kolon C2', status: 'Beklemede', rev: 'A' },
  { id: 'e6', code: 'E-1006', type: 'Tırım T-08', status: 'Üretimde', rev: 'C' },
  { id: 'e7', code: 'E-1007', type: 'Bağlantı plakası', status: 'Kalite', rev: 'B' },
  { id: 'e8', code: 'E-1008', type: 'Lift gövdesi', status: 'Beklemede', rev: 'A' },
  { id: 'e9', code: 'E-1009', type: 'Geçici mesnet', status: 'Yardda', rev: 'A' },
  { id: 'e10', code: 'E-1010', type: 'Ankraj seti', status: 'Planlama', rev: 'A' },
]

export const projects: Project[] = [
  {
    id: 'p1',
    code: 'PRJ-2026-014',
    name: 'Köprü Ayağı Lot-2',
    customer: 'Yapıtaş İnşaat A.Ş.',
    status: 'yard',
    deadline: '28 Nis 2026',
    factoryCode: 'IST-HAD',
    siteAddress: 'İstanbul / Kartal — Sahil yolu km 12+400',
    scopeShort: 'Köprü ayağı prefab elemanları; lot 2 üretim ve sevkiyat.',
    owners: ['AK', 'MD', 'SY'],
    currentStepIndex: 2,
    elements: elements10,
    milestones: [
      { id: 'm1', date: '15 Şub 2026', label: 'Statik onay (milestone)' },
      { id: 'm2', date: '01 Mar 2026', label: 'İlk üretim parti başlangıcı' },
      { id: 'm3', date: '20 Mar 2026', label: 'Yard teslim hedefi (lot A)' },
    ],
    risks: [
      { id: 'r1', title: 'Çelik teslimatı 1 hafta kayabilir', impact: 'yuksek', owner: 'MD' },
      { id: 'r2', title: 'Vinç randevusu yoğun', impact: 'orta', owner: 'SY' },
    ],
    linkedQuote: {
      number: 'T-2026-0144',
      totalLabel: '₺2.253.600',
      hint: 'Teklif modülünde aynı numaralı satırı seçin (mock).',
    },
  },
  {
    id: 'p2',
    code: 'PRJ-2025-088',
    name: 'Viyadük segmentleri',
    customer: 'Metro Beton San.',
    status: 'tasarim',
    deadline: '15 Haz 2026',
    factoryCode: 'ANK-01',
    siteAddress: 'Ankara çevre yolu viyadük güzergâhı',
    scopeShort: 'Segment üretimi; keşif ve statik onay sürecinde.',
    owners: ['AK'],
    currentStepIndex: 0,
    elements: [{ id: 'e1', code: 'S-01', type: 'Segment M', status: 'Taslak', rev: 'A' }],
    milestones: [{ id: 'm1', date: '10 Nis 2026', label: 'Keşif doneleri' }],
    risks: [],
    linkedQuote: null,
  },
  {
    id: 'p3',
    code: 'PRJ-2026-033',
    name: 'Kentsel dönüşüm Blok 1–4',
    customer: 'Kentsel Dönüşüm A.Ş.',
    status: 'uretim',
    deadline: '30 Eyl 2026',
    factoryCode: 'IST-HAD',
    siteAddress: 'İstanbul — Kentsel dönüşüm alanı Blok 1–4',
    scopeShort: 'Kolon ve bağlantı elemanları; çoklu blok teslimatı.',
    owners: ['ZK', 'MD'],
    currentStepIndex: 1,
    elements: [
      { id: 'x1', code: 'K-10', type: 'Kolon 40x40', status: 'Üretimde', rev: 'D' },
      { id: 'x2', code: 'K-11', type: 'Kolon 45x45', status: 'Beklemede', rev: 'C' },
    ],
    milestones: [],
    risks: [{ id: 'r1', title: 'Beton tedarik fiyatı dalgalanması', impact: 'orta', owner: 'ZK' }],
    linkedQuote: {
      number: 'T-2025-0991',
      totalLabel: '₺2.100.000',
      hint: 'Kapalı teklif referansı (mock).',
    },
  },
  {
    id: 'p4',
    code: 'PRJ-2024-201',
    name: 'Liman dalga kıran',
    customer: 'Karadeniz Liman İşl.',
    status: 'tamamlandi',
    deadline: '12 Ara 2025',
    factoryCode: 'KOC-01',
    siteAddress: 'Trabzon liman sahası',
    scopeShort: 'Dalga kıran blokları; proje kapatıldı (salt arşiv).',
    owners: ['SY'],
    currentStepIndex: 4,
    elements: [
      { id: 'y1', code: 'D-01', type: 'Blok tip A', status: 'Teslim edildi', rev: 'F' },
      { id: 'y2', code: 'D-02', type: 'Blok tip B', status: 'Teslim edildi', rev: 'F' },
    ],
    milestones: [{ id: 'm1', date: '12 Ara 2025', label: 'Proje kapanış' }],
    risks: [],
    linkedQuote: null,
  },
]

/** Teklif ekranında bağlanabilecek projeler — kapanmamış (mock kural) */
export function openProjectsForQuote(): Project[] {
  return projects.filter((p) => p.status !== 'tamamlandi')
}

export function projectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

export function statusLabel(s: ProjectStatus): string {
  switch (s) {
    case 'tasarim':
      return 'Tasarım'
    case 'uretim':
      return 'Üretim'
    case 'yard':
      return 'Yard'
    case 'sevkiyat':
      return 'Sevkiyat'
    case 'saha':
      return 'Saha'
    case 'tamamlandi':
      return 'Tamamlandı'
  }
}
