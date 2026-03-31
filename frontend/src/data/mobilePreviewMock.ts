export type MobileTask = {
  id: string
  title: string
  subtitle: string
  cta: string
}

export const mobileTasks: MobileTask[] = [
  {
    id: 'm1',
    title: 'Teslimat · SVK-0318',
    subtitle: '3 eleman · 14:00',
    cta: 'Teslim al',
  },
  {
    id: 'm2',
    title: 'Montaj · Hat A',
    subtitle: 'T kiriş 12 m',
    cta: 'Tamamla',
  },
]

export type MobileNotification = {
  id: string
  title: string
  body: string
  time: string
  read: boolean
}

export const mobileNotifications: MobileNotification[] = [
  {
    id: 'n1',
    read: false,
    time: '2 dk',
    title: 'Slot onayı',
    body: 'Hat B · 15:00 slot MES tarafından onaylandı.',
  },
  {
    id: 'n2',
    read: false,
    time: '1 sa',
    title: 'Sevkiyat hazır',
    body: 'SVK-0318 yükleme listesi güncellendi.',
  },
  {
    id: 'n3',
    read: true,
    time: 'Dün',
    title: 'Kalite',
    body: 'Kontrol formu QF-112 imzalandı.',
  },
]

export const mobileScanPlaceholder = {
  label: 'Kamera önizleme (web)',
  hint: 'Gerçek uygulamada kamera API; burada QR alanı yer tutucu.',
  lastScan: 'Eleman: EL-2026-441 · Hat A · Onaylı',
}
