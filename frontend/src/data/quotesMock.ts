export type QuoteStatus = 'taslak' | 'onay_bekliyor' | 'onayli' | 'red'

export type QuoteLine = {
  id: string
  code: string
  description: string
  qty: number | null
  unit: string
  unitPrice: number
  error?: string
}

export type QuoteHistoryEntry = {
  id: string
  actor: string
  role: string
  when: string
  action: string
}

export type VersionSnapshot = {
  total: number
  lines: QuoteLine[]
  versionNote: string
}

export type Quote = {
  id: string
  number: string
  customer: string
  /** `projectsMock` id — bie-03 zorunlu bağ */
  projectId: string
  project: string
  /** Listede gösterilen sürüm etiketi */
  version: string
  versionNote: string
  total: number
  currency: string
  status: QuoteStatus
  lines: QuoteLine[]
  /** Geçerlilik tarihi (liste) */
  validityDate: string
  /** Örn. "2/3 Finans" — çok adımlı onay */
  activeStepLabel: string
  /** mvp-02 onay akışı şablon adı (UI metni) */
  approvalTemplateName: string
  /** Onay geçmişi timeline */
  approvalHistory: QuoteHistoryEntry[]
  /** P1 — v1 / v2 anlık görüntü */
  versionSnapshots: Record<'v1' | 'v2', VersionSnapshot>
  /** P2 — tutar eşiği; doluysa bilgi bandı */
  thresholdWarning?: string
}

const lines5v2: QuoteLine[] = [
  { id: 'a1', code: 'P-001', description: 'Prefab T kiriş 12m', qty: 24, unit: 'ad', unitPrice: 42500 },
  { id: 'a2', code: 'P-014', description: 'C35/45 beton döküm (m³)', qty: 180, unit: 'm³', unitPrice: 3850 },
  { id: 'a3', code: 'L-220', description: 'Yükleme + montaj desteği', qty: 1, unit: 'lot', unitPrice: 185000 },
  { id: 'a4', code: 'N-010', description: 'Nervürlü donatı çelik', qty: 4200, unit: 'kg', unitPrice: 38 },
  { id: 'a5', code: 'T-400', description: 'Geçici mesnet (kiralama)', qty: 8, unit: 'ad', unitPrice: 12000 },
]

const lines5v1: QuoteLine[] = [
  { id: 'b1', code: 'P-001', description: 'Prefab T kiriş 12m', qty: 22, unit: 'ad', unitPrice: 41000 },
  { id: 'b2', code: 'P-014', description: 'C30/37 beton döküm (m³)', qty: 160, unit: 'm³', unitPrice: 3750 },
  { id: 'b3', code: 'L-220', description: 'Yükleme + montaj desteği', qty: 1, unit: 'lot', unitPrice: 195000 },
  { id: 'b4', code: 'N-010', description: 'Nervürlü donatı çelik', qty: 4000, unit: 'kg', unitPrice: 38 },
  { id: 'b5', code: 'T-400', description: 'Geçici mesnet (kiralama)', qty: 8, unit: 'ad', unitPrice: 11500 },
]

function sumLines(lines: QuoteLine[]): number {
  let s = 0
  for (const l of lines) {
    const q = l.qty
    if (q == null) continue
    s += q * l.unitPrice
  }
  return s
}

const snapV1: VersionSnapshot = {
  total: sumLines(lines5v1),
  lines: lines5v1,
  versionNote: 'İlk iç teklif; beton C30/37; kiriş adedi 22.',
}
const snapV2: VersionSnapshot = {
  total: sumLines(lines5v2),
  lines: lines5v2,
  versionNote: 'Beton C35/45; kiriş 24 adet; montaj lotu güncellendi.',
}

/** MOCK: 3 onay bekliyor; biri 3 adımlı (2/3) ve eşik uyarısı */
export const quotes: Quote[] = [
  {
    id: 'q1',
    number: 'T-2026-0144',
    customer: 'Yapıtaş İnşaat A.Ş.',
    projectId: 'p1',
    project: 'Köprü Ayağı Lot-2',
    version: 'v2',
    versionNote: snapV2.versionNote,
    total: snapV2.total,
    currency: '₺',
    status: 'onay_bekliyor',
    lines: snapV2.lines,
    validityDate: '30.04.2026',
    activeStepLabel: '2/3 Finans',
    approvalTemplateName: 'Teklif — standart hiyerarşi',
    thresholdWarning:
      'Bu tutar ₺250.000 eşiğini aştığı için şablonda ek Finans adımı tetiklendi (mvp-02 · mock).',
    approvalHistory: [
      {
        id: 'h1',
        actor: 'Zeynep Ak',
        role: 'Satış müdürü',
        when: '20.03.2026 10:15',
        action: 'Onaya gönderildi',
      },
      {
        id: 'h2',
        actor: 'Mehmet Öz',
        role: 'CFO',
        when: '20.03.2026 11:02',
        action: 'Adım onaylandı',
      },
    ],
    versionSnapshots: { v1: snapV1, v2: snapV2 },
  },
  {
    id: 'q2',
    number: 'T-2026-0188',
    customer: 'Ege Köprü İnş.',
    projectId: 'p3',
    project: 'Rıhtım paneli',
    version: 'v1',
    versionNote: 'Teklif kalemleri netleştirildi.',
    total: 412000,
    currency: '₺',
    status: 'onay_bekliyor',
    lines: [
      { id: 'c1', code: 'R-01', description: 'Panel tip A', qty: 40, unit: 'm²', unitPrice: 8200 },
      { id: 'c2', code: 'R-02', description: 'Panel tip B', qty: 12, unit: 'm²', unitPrice: 7600 },
      { id: 'c3', code: 'M-01', description: 'Montaj işçiliği', qty: 1, unit: 'lot', unitPrice: 45000 },
      { id: 'c4', code: 'L-01', description: 'Lojistik (tek sefer)', qty: 1, unit: 'sefer', unitPrice: 28000 },
      { id: 'c5', code: 'G-01', description: 'Geçici kalıp', qty: 4, unit: 'ad', unitPrice: 15000 },
    ],
    validityDate: '15.05.2026',
    activeStepLabel: '1/2 Satış müdürü',
    approvalTemplateName: 'Teklif — standart hiyerarşi',
    approvalHistory: [
      {
        id: 'h3',
        actor: 'Ayşe Kaya',
        role: 'Sistem',
        when: '21.03.2026 09:00',
        action: 'Onaya gönderildi',
      },
    ],
    versionSnapshots: {
      v1: {
        total: 412000,
        lines: [
          { id: 'c1', code: 'R-01', description: 'Panel tip A', qty: 40, unit: 'm²', unitPrice: 8200 },
          { id: 'c2', code: 'R-02', description: 'Panel tip B', qty: 12, unit: 'm²', unitPrice: 7600 },
          { id: 'c3', code: 'M-01', description: 'Montaj işçiliği', qty: 1, unit: 'lot', unitPrice: 45000 },
          { id: 'c4', code: 'L-01', description: 'Lojistik (tek sefer)', qty: 1, unit: 'sefer', unitPrice: 28000 },
          { id: 'c5', code: 'G-01', description: 'Geçici kalıp', qty: 4, unit: 'ad', unitPrice: 15000 },
        ],
        versionNote: 'İlk sürüm.',
      },
      v2: {
        total: 412000,
        lines: [
          { id: 'c1', code: 'R-01', description: 'Panel tip A', qty: 40, unit: 'm²', unitPrice: 8200 },
          { id: 'c2', code: 'R-02', description: 'Panel tip B', qty: 12, unit: 'm²', unitPrice: 7600 },
          { id: 'c3', code: 'M-01', description: 'Montaj işçiliği', qty: 1, unit: 'lot', unitPrice: 45000 },
          { id: 'c4', code: 'L-01', description: 'Lojistik (tek sefer)', qty: 1, unit: 'sefer', unitPrice: 28000 },
          { id: 'c5', code: 'G-01', description: 'Geçici kalıp', qty: 4, unit: 'ad', unitPrice: 15000 },
        ],
        versionNote: 'v2 ile aynı tutar (mock).',
      },
    },
  },
  {
    id: 'q3',
    number: 'T-2026-0201',
    customer: 'Kentsel Dönüşüm A.Ş.',
    projectId: 'p3',
    project: 'Blok 1–4 kolonlar',
    version: 'v1',
    versionNote: 'İlk gönderim.',
    total: 198000,
    currency: '₺',
    status: 'onay_bekliyor',
    lines: [
      { id: 'd1', code: 'K-10', description: 'Kolon kesit 40x40', qty: 48, unit: 'ad', unitPrice: 2800 },
      { id: 'd2', code: 'K-11', description: 'Kolon kesit 45x45', qty: 24, unit: 'ad', unitPrice: 3200 },
      { id: 'd3', code: 'B-02', description: 'Bağlantı plakası seti', qty: 72, unit: 'set', unitPrice: 450 },
      { id: 'd4', code: 'D-01', description: 'Derme katkı', qty: 120, unit: 'kg', unitPrice: 85 },
      { id: 'd5', code: 'S-99', description: 'Şantiye denetim', qty: 5, unit: 'gün', unitPrice: 9500 },
    ],
    validityDate: '01.06.2026',
    activeStepLabel: '3/3 Genel müdür yardımcısı',
    approvalTemplateName: 'Teklif — standart hiyerarşi',
    approvalHistory: [
      { id: 'h4', actor: 'Selin Koç', role: 'Satış', when: '19.03.2026 14:00', action: 'Gönderildi' },
      { id: 'h5', actor: 'Can Demir', role: 'Planlama', when: '19.03.2026 15:20', action: 'Onaylandı' },
      { id: 'h6', actor: 'Mehmet Öz', role: 'Finans', when: '20.03.2026 08:10', action: 'Onaylandı' },
    ],
    versionSnapshots: {
      v1: {
        total: 198000,
        lines: [
          { id: 'd1', code: 'K-10', description: 'Kolon kesit 40x40', qty: 48, unit: 'ad', unitPrice: 2800 },
          { id: 'd2', code: 'K-11', description: 'Kolon kesit 45x45', qty: 24, unit: 'ad', unitPrice: 3200 },
          { id: 'd3', code: 'B-02', description: 'Bağlantı plakası seti', qty: 72, unit: 'set', unitPrice: 450 },
          { id: 'd4', code: 'D-01', description: 'Derme katkı', qty: 120, unit: 'kg', unitPrice: 85 },
          { id: 'd5', code: 'S-99', description: 'Şantiye denetim', qty: 5, unit: 'gün', unitPrice: 9500 },
        ],
        versionNote: 'Tek sürüm (mock).',
      },
      v2: {
        total: 198000,
        lines: [
          { id: 'd1', code: 'K-10', description: 'Kolon kesit 40x40', qty: 48, unit: 'ad', unitPrice: 2800 },
          { id: 'd2', code: 'K-11', description: 'Kolon kesit 45x45', qty: 24, unit: 'ad', unitPrice: 3200 },
          { id: 'd3', code: 'B-02', description: 'Bağlantı plakası seti', qty: 72, unit: 'set', unitPrice: 450 },
          { id: 'd4', code: 'D-01', description: 'Derme katkı', qty: 120, unit: 'kg', unitPrice: 85 },
          { id: 'd5', code: 'S-99', description: 'Şantiye denetim', qty: 5, unit: 'gün', unitPrice: 9500 },
        ],
        versionNote: 'v2 placeholder (mock).',
      },
    },
  },
  {
    id: 'q4',
    number: 'T-2026-0138',
    customer: 'Metro Beton San.',
    projectId: 'p2',
    project: 'Viyadük segmentleri',
    version: 'v1',
    versionNote: 'İlk yayın.',
    total: 920000,
    currency: '₺',
    status: 'taslak',
    lines: [
      { id: 'e1', code: 'S-88', description: 'Segment tipi M', qty: 18, unit: 'ad', unitPrice: 45000 },
      { id: 'e2', code: 'S-89', description: 'Segment tipi N', qty: 6, unit: 'ad', unitPrice: 52000 },
      { id: 'e3', code: 'M-20', description: 'Montaj ringi', qty: 2, unit: 'lot', unitPrice: 85000 },
      { id: 'e4', code: 'T-01', description: 'Tır nakliye', qty: 3, unit: 'sefer', unitPrice: 42000 },
      { id: 'e5', code: 'K-77', description: 'Kalıp ayarı', qty: 1, unit: 'lot', unitPrice: 38000 },
    ],
    validityDate: '10.07.2026',
    activeStepLabel: '—',
    approvalTemplateName: 'Teklif — standart hiyerarşi',
    approvalHistory: [],
    versionSnapshots: {
      v1: {
        total: 920000,
        lines: [
          { id: 'e1', code: 'S-88', description: 'Segment tipi M', qty: 18, unit: 'ad', unitPrice: 45000 },
          { id: 'e2', code: 'S-89', description: 'Segment tipi N', qty: 6, unit: 'ad', unitPrice: 52000 },
          { id: 'e3', code: 'M-20', description: 'Montaj ringi', qty: 2, unit: 'lot', unitPrice: 85000 },
          { id: 'e4', code: 'T-01', description: 'Tır nakliye', qty: 3, unit: 'sefer', unitPrice: 42000 },
          { id: 'e5', code: 'K-77', description: 'Kalıp ayarı', qty: 1, unit: 'lot', unitPrice: 38000 },
        ],
        versionNote: 'Taslak.',
      },
      v2: {
        total: 920000,
        lines: [
          { id: 'e1', code: 'S-88', description: 'Segment tipi M', qty: 18, unit: 'ad', unitPrice: 45000 },
          { id: 'e2', code: 'S-89', description: 'Segment tipi N', qty: 6, unit: 'ad', unitPrice: 52000 },
          { id: 'e3', code: 'M-20', description: 'Montaj ringi', qty: 2, unit: 'lot', unitPrice: 85000 },
          { id: 'e4', code: 'T-01', description: 'Tır nakliye', qty: 3, unit: 'sefer', unitPrice: 42000 },
          { id: 'e5', code: 'K-77', description: 'Kalıp ayarı', qty: 1, unit: 'lot', unitPrice: 38000 },
        ],
        versionNote: 'Henüz yok.',
      },
    },
  },
  {
    id: 'q5',
    number: 'T-2025-0991',
    customer: 'Vadi Prefab Ltd.',
    projectId: 'p3',
    project: 'Fabrika genişleme',
    version: 'v3',
    versionNote: 'İskonto %2 uygulandı.',
    total: 2100000,
    currency: '₺',
    status: 'onayli',
    lines: [
      { id: 'f1', code: 'X-1', description: 'Çatı elemanı', qty: 60, unit: 'm²', unitPrice: 12000 },
      { id: 'f2', code: 'X-2', description: 'Duvar paneli', qty: 120, unit: 'm²', unitPrice: 9800 },
      { id: 'f3', code: 'X-3', description: 'Aksesuar seti', qty: 4, unit: 'lot', unitPrice: 45000 },
      { id: 'f4', code: 'X-4', description: 'Yalıtım', qty: 200, unit: 'm²', unitPrice: 320 },
      { id: 'f5', code: 'X-5', description: 'Proje yönetimi', qty: 1, unit: 'lot', unitPrice: 120000 },
    ],
    validityDate: '31.12.2025',
    activeStepLabel: 'Tamamlandı',
    approvalTemplateName: 'Teklif — standart hiyerarşi',
    approvalHistory: [
      { id: 'h7', actor: 'Zeynep Ak', role: 'Satış', when: '10.11.2025 09:00', action: 'Onaylandı (tüm adımlar)' },
    ],
    versionSnapshots: {
      v1: {
        total: 2050000,
        lines: [
          { id: 'f1', code: 'X-1', description: 'Çatı elemanı', qty: 58, unit: 'm²', unitPrice: 12000 },
          { id: 'f2', code: 'X-2', description: 'Duvar paneli', qty: 118, unit: 'm²', unitPrice: 9800 },
          { id: 'f3', code: 'X-3', description: 'Aksesuar seti', qty: 4, unit: 'lot', unitPrice: 45000 },
          { id: 'f4', code: 'X-4', description: 'Yalıtım', qty: 200, unit: 'm²', unitPrice: 320 },
          { id: 'f5', code: 'X-5', description: 'Proje yönetimi', qty: 1, unit: 'lot', unitPrice: 120000 },
        ],
        versionNote: 'v2 öncesi (mock).',
      },
      v2: {
        total: 2080000,
        lines: [
          { id: 'f1', code: 'X-1', description: 'Çatı elemanı', qty: 59, unit: 'm²', unitPrice: 12000 },
          { id: 'f2', code: 'X-2', description: 'Duvar paneli', qty: 119, unit: 'm²', unitPrice: 9800 },
          { id: 'f3', code: 'X-3', description: 'Aksesuar seti', qty: 4, unit: 'lot', unitPrice: 45000 },
          { id: 'f4', code: 'X-4', description: 'Yalıtım', qty: 200, unit: 'm²', unitPrice: 320 },
          { id: 'f5', code: 'X-5', description: 'Proje yönetimi', qty: 1, unit: 'lot', unitPrice: 120000 },
        ],
        versionNote: 'v2 — ara revizyon.',
      },
    },
  },
  {
    id: 'q6',
    number: 'T-2025-0802',
    customer: 'Kıyı Yapı Kooperatifi',
    projectId: 'p1',
    project: 'Konut blokları',
    version: 'v1',
    versionNote: '—',
    total: 0,
    currency: '₺',
    status: 'red',
    lines: [],
    validityDate: '—',
    activeStepLabel: '—',
    approvalTemplateName: 'Teklif — standart hiyerarşi',
    approvalHistory: [
      { id: 'h8', actor: 'Mehmet Öz', role: 'Finans', when: '02.12.2024 16:00', action: 'Reddedildi' },
    ],
    versionSnapshots: {
      v1: { total: 0, lines: [], versionNote: '—' },
      v2: { total: 0, lines: [], versionNote: '—' },
    },
  },
]

export function statusLabel(s: QuoteStatus): string {
  switch (s) {
    case 'taslak':
      return 'Taslak'
    case 'onay_bekliyor':
      return 'Onay bekliyor'
    case 'onayli':
      return 'Onaylı'
    case 'red':
      return 'Red'
  }
}

export function lineTotal(line: QuoteLine): number | null {
  if (line.qty == null || line.qty < 0) return null
  return line.qty * line.unitPrice
}
