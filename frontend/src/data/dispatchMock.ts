export type DispatchStatus =
  | 'taslak'
  | 'onay_bekliyor'
  | 'yukleme'
  | 'yolda'
  | 'teslim_edildi'
  | 'iptal'

/** mvp-11 — çıkış onayı özeti (şablon bağlantısı metin) */
export type DispatchApprovalUi = 'bekliyor' | 'onaylandi'

export type DispatchPlan = {
  id: string
  code: string
  window: string
  destination: string
  project: string
  factoryCode: string
  status: DispatchStatus
  /** Araç plaka */
  plate: string
  /** Şoför adı (mock) */
  driverName: string
  /** Fabrika çıkış saati — planlanan veya gerçekleşen */
  factoryExitTime: string
  vehicle: string
  route: string
  /** Eleman ID yükleme sırası — 6 satır (mvp-11) */
  loadOrder: string[]
  capacityExceeded: boolean
  /** Kapasite bandı (ton) */
  totalWeightT: number
  capacityLimitT: number
  carrierId: string
  approvalUi: DispatchApprovalUi
  /** mvp-02 şablonu: süreç tipi `dispatch` — aktif adım metni */
  activeApprovalStepLabel: string
  /** P1 stepper: Planla → Yükle → Onay → Kapat (0–3) */
  flowStepIndex: number
}

export const mockDispatchCarriers = [
  { id: 'car1', name: 'Acme Lojistik A.Ş.' },
  { id: 'car2', name: 'Marmara Transport Co.' },
  { id: 'car3', name: 'TIR-FORWARD Ltd.' },
] as const

/** Bugün 3 kayıt (mock) — her biri 6 eleman satırı */
export const dispatchPlans: DispatchPlan[] = [
  {
    id: 'd1',
    code: 'SVK-2026-0321',
    window: 'Bugün 14:00 – 16:00',
    destination: 'Şantiye Köprü Lot-2',
    project: 'PRJ-2026-014',
    factoryCode: 'IST-HAD',
    status: 'onay_bekliyor',
    plate: '34 ABC 901',
    driverName: 'Mehmet Yılmaz',
    factoryExitTime: '15:45 (plan)',
    vehicle: '34 ABC 901 · Tır',
    route: 'Fabrika → TEM → Anadolu',
    loadOrder: ['E-1001', 'E-1002', 'E-1003', 'E-1004', 'E-1005', 'E-1006'],
    capacityExceeded: true,
    totalWeightT: 46.2,
    capacityLimitT: 40,
    carrierId: 'car1',
    approvalUi: 'bekliyor',
    activeApprovalStepLabel: 'Adım 2/3 · Depo sorumlusu (Şablon: Sevkiyat çıkışı — mvp-02)',
    flowStepIndex: 2,
  },
  {
    id: 'd2',
    code: 'SVK-2026-0322',
    window: 'Bugün 08:00 – 10:00',
    destination: 'Metro depo sahası',
    project: 'PRJ-2025-088',
    factoryCode: 'IST-HAD',
    status: 'yukleme',
    plate: '41 K 5522',
    driverName: 'Ayşe Demir',
    factoryExitTime: '09:12',
    vehicle: '41 K 5522 · Lowbed',
    route: 'Hadımköy → D-100',
    loadOrder: ['E-0880', 'E-0881', 'E-0882', 'E-0883', 'E-0884', 'E-0885'],
    capacityExceeded: false,
    totalWeightT: 28.4,
    capacityLimitT: 40,
    carrierId: 'car2',
    approvalUi: 'onaylandi',
    activeApprovalStepLabel: 'Onay tamam — yükleme aşaması',
    flowStepIndex: 1,
  },
  {
    id: 'd3',
    code: 'SVK-2026-0323',
    window: 'Bugün 11:30 – 12:30',
    destination: 'Gebze montaj alanı',
    project: 'PRJ-2025-060',
    factoryCode: 'KOC-01',
    status: 'taslak',
    plate: '—',
    driverName: 'Atanmadı',
    factoryExitTime: '—',
    vehicle: 'Bekleniyor',
    route: '—',
    loadOrder: ['E-0750', 'E-0751', 'E-0752', 'E-0753', 'E-0754', 'E-0755'],
    capacityExceeded: false,
    totalWeightT: 31.0,
    capacityLimitT: 44,
    carrierId: 'car3',
    approvalUi: 'bekliyor',
    activeApprovalStepLabel: 'Adım 1/3 · Vardiya amiri (Şablon: Sevkiyat çıkışı — mvp-02)',
    flowStepIndex: 0,
  },
]

/** Eski yükleme mikro-adımları — geriye dönük; mvp-11 ana akış `dispatchFlowSteps` */
export const loadSteps = [
  { id: 'hazirlik', label: 'Hazırlık' },
  { id: 'kontrol', label: 'Kontrol listesi' },
  { id: 'yukleme', label: 'Yükleme' },
  { id: 'muhur', label: 'Mühür / imza' },
  { id: 'cikis', label: 'Çıkış kaydı' },
] as const

/** P1 — ana sevkiyat stepper */
export const dispatchFlowSteps = [
  { id: 'planla', label: 'Planla' },
  { id: 'yukle', label: 'Yükle' },
  { id: 'onay', label: 'Onay' },
  { id: 'kapat', label: 'Kapat' },
] as const

export function statusLabel(s: DispatchStatus): string {
  switch (s) {
    case 'taslak':
      return 'Taslak'
    case 'onay_bekliyor':
      return 'Onay bekliyor'
    case 'yukleme':
      return 'Yüklemede'
    case 'yolda':
      return 'Yolda'
    case 'teslim_edildi':
      return 'Teslim edildi'
    case 'iptal':
      return 'İptal'
  }
}

export function statusPill(s: DispatchStatus) {
  const base = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1'
  switch (s) {
    case 'taslak':
      return `${base} bg-gray-100 text-gray-700 ring-gray-300/90`
    case 'onay_bekliyor':
      return `${base} bg-gray-200/90 text-gray-900 ring-gray-400/80`
    case 'yukleme':
      return `${base} bg-gray-100 text-gray-800 ring-gray-400/80`
    case 'yolda':
      return `${base} bg-gray-200/80 text-gray-900 ring-gray-500/70`
    case 'teslim_edildi':
      return `${base} bg-gray-800 text-white ring-gray-700`
    case 'iptal':
      return `${base} bg-gray-50 text-red-800 ring-red-300/70`
  }
}

export function approvalUiLabel(ui: DispatchApprovalUi): string {
  return ui === 'bekliyor' ? 'Bekliyor' : 'Onaylandı'
}

export function approvalUiPill(ui: DispatchApprovalUi) {
  const base = 'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1'
  return ui === 'bekliyor'
    ? `${base} bg-amber-50 text-amber-950 ring-amber-300/80 dark:bg-amber-950/30 dark:text-amber-100`
    : `${base} bg-emerald-50 text-emerald-900 ring-emerald-300/80 dark:bg-emerald-950/30 dark:text-emerald-100`
}
