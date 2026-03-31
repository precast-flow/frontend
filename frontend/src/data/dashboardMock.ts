/** Genel bakış grafikleri — mock veri (Precast Flow prototip) */

/** mvp-14 — bildirim merkezi (zilde en az 5) */
export type NotificationFeedItem = {
  id: string
  title: string
  detail: string
  time: string
  /** MainCanvas modül id */
  moduleId: string
}

export const notificationFeedItems: NotificationFeedItem[] = [
  {
    id: 'n1',
    title: 'Teklif onayı bekliyor',
    detail: 'TKF-2026-014 v2 · eşik 1,2M EUR',
    time: '5 dk',
    moduleId: 'quote',
  },
  {
    id: 'n2',
    title: 'Sevkiyat çıkış onayı',
    detail: 'SVK-2026-0321 · QC tamamlandı',
    time: '12 dk',
    moduleId: 'dispatch',
  },
  {
    id: 'n3',
    title: 'Kalite ret — yeniden üretim',
    detail: 'WO-885 · NCR yüzey / ölçü',
    time: '1 s',
    moduleId: 'quality',
  },
  {
    id: 'n4',
    title: 'Üretim emri yayınlama',
    detail: 'WO-886 · slot onayı bekleniyor',
    time: '2 s',
    moduleId: 'mes',
  },
  {
    id: 'n5',
    title: 'Onay akışı: proje revizyonu',
    detail: 'PRJ-2026-014 · Rev B paketi',
    time: '3 s',
    moduleId: 'project',
  },
  {
    id: 'n6',
    title: 'CRM: müşteri iletişim güncellemesi',
    detail: 'Acme A.Ş. · son görüşme notu',
    time: '4 s',
    moduleId: 'crm',
  },
]

/** P1 — yapılacaklar (rol etiketi mock) */
export type DashboardTodo = {
  id: string
  label: string
  roleTag: 'satis' | 'lojistik' | 'uretim' | 'yonetim'
  moduleId: string
}

export const dashboardTodos: DashboardTodo[] = [
  { id: 'td1', label: 'Teklif TKF-014 v2 için ikinci onay turu', roleTag: 'satis', moduleId: 'quote' },
  { id: 'td2', label: 'SVK-0321 çıkış kaydını tamamla', roleTag: 'lojistik', moduleId: 'dispatch' },
  { id: 'td3', label: 'WO-884 kalite bekleyen emir — ölçü gir', roleTag: 'uretim', moduleId: 'quality' },
  { id: 'td4', label: 'Onay şablonu: Sevkiyat çıkışı adım ataması', roleTag: 'yonetim', moduleId: 'approval-flow' },
  { id: 'td5', label: 'Yard B3 çakışma — lokasyon ata', roleTag: 'lojistik', moduleId: 'yard' },
]

export const monthlyProduction = [
  { month: 'Eki', value: 412 },
  { month: 'Kas', value: 438 },
  { month: 'Ara', value: 401 },
  { month: 'Oca', value: 455 },
  { month: 'Şub', value: 489 },
  { month: 'Mar', value: 472 },
] as const

export const lineUtilization = [
  { id: 'a', label: 'Hat A', percent: 94 },
  { id: 'b', label: 'Hat B', percent: 88 },
  { id: 'c', label: 'Hat C', percent: 91 },
  { id: 'd', label: 'Hat D', percent: 76 },
] as const

export const weeklyDispatch = [
  { day: 'Pt', planned: 14, actual: 13 },
  { day: 'Sa', planned: 12, actual: 12 },
  { day: 'Ça', planned: 16, actual: 14 },
  { day: 'Pe', planned: 11, actual: 11 },
  { day: 'Cu', planned: 9, actual: 8 },
  { day: 'Ct', planned: 4, actual: 4 },
  { day: 'Pz', planned: 3, actual: 2 },
] as const

/** Teklif aşamaları (adet) — donut için */
export const quoteStageCounts = [
  { label: 'Taslak', value: 6 },
  { label: 'Onay bekliyor', value: 4 },
  { label: 'Onaylı', value: 11 },
  { label: 'Sözleşme', value: 3 },
] as const

export const operationSnapshot = [
  { label: 'Açık üretim emri', value: '23', hint: 'MES' },
  { label: 'Bugün tamamlanan', value: '48', hint: 'adet' },
  { label: 'Bekleyen kalite', value: '3', hint: 'NCR' },
] as const

/** mvp-14 — tek fabrika vs tüm fabrikalar (P2 özet) */
export const dashboardKpiSingle = {
  projects: '12',
  produced: '48',
  yard: '7',
  dispatch: '5',
  approvals: '5',
} as const

export const dashboardKpiAggregate = {
  projects: '34',
  produced: '142',
  yard: '21',
  dispatch: '14',
  approvals: '12',
} as const
