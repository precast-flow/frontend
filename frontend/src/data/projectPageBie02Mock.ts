/**
 * bie-02 — proje tek sayfa: zaman çizelgesi, mesajlar, dosyalar (mock).
 */

export type MessageStageTag =
  | 'teklif'
  | 'proje_ofisi'
  | 'muhendislik'
  | 'uretim'
  | 'kalite'
  | 'lojistik'
  | 'saha'

export type ProjectTimelineEvent = {
  id: string
  /** ISO veya görüntü metni */
  at: string
  actor: string
  actorRole: string
  description: string
}

export type ProjectThreadMessage = {
  id: string
  at: string
  author: string
  body: string
  stage: MessageStageTag
}

export type ProjectDrawingFile = {
  id: string
  name: string
  rev: string
  uploadedAt: string
  sizeLabel: string
  ext: 'pdf' | 'dwg' | 'ifc' | 'png'
}

export const MESSAGE_STAGE_LABELS: Record<MessageStageTag, string> = {
  teklif: 'Teklif hazırlığı',
  proje_ofisi: 'Proje ofisi',
  muhendislik: 'Mühendislik',
  uretim: 'Üretim',
  kalite: 'Kalite',
  lojistik: 'Lojistik',
  saha: 'Saha',
}

/** @mention mock kullanıcıları */
export const MENTION_USERS = [
  { id: 'u1', label: 'Ayşe Kaya · Proje ofisi' },
  { id: 'u2', label: 'Mehmet Demir · Mühendislik' },
  { id: 'u3', label: 'Selin Yılmaz · Üretim planlama' },
  { id: 'u4', label: 'Can Öztürk · Satış' },
]

const TIMELINE_P1: ProjectTimelineEvent[] = [
  {
    id: 'ev1',
    at: '12.02.2026 09:12',
    actor: 'Can Öztürk',
    actorRole: 'Satış',
    description: 'Proje oluşturuldu; müşteri sözleşmesi referansı bağlandı.',
  },
  {
    id: 'ev2',
    at: '13.02.2026 14:05',
    actor: 'Ayşe Kaya',
    actorRole: 'Proje ofisi',
    description: 'Kayıt proje ofisine alındı; ön inceleme başlatıldı.',
  },
  {
    id: 'ev3',
    at: '14.02.2026 11:22',
    actor: 'Ayşe Kaya',
    actorRole: 'Proje ofisi',
    description: 'Çizim seti yüklendi: köprü_ayağı_plan_r1.pdf (rev A).',
  },
  {
    id: 'ev4',
    at: '18.02.2026 16:40',
    actor: 'Can Öztürk',
    actorRole: 'Satış',
    description: 'Teklif T-2026-0144 oluşturuldu ve projeye bağlandı.',
  },
  {
    id: 'ev5',
    at: '22.02.2026 10:15',
    actor: 'Mehmet Demir',
    actorRole: 'Mühendislik',
    description: 'İş başlatıldı — statik ön kontrol listesi açıldı.',
  },
  {
    id: 'ev6',
    at: '28.02.2026 08:50',
    actor: 'Mehmet Demir',
    actorRole: 'Mühendislik',
    description: 'Çıkış çizimleri onaylandı; üretim öncesi mühendislik tamam.',
  },
  {
    id: 'ev7',
    at: '05.03.2026 07:30',
    actor: 'Selin Yılmaz',
    actorRole: 'Üretim',
    description: 'MES üretim emri PRJ-2026-014 bağlandı; ilk parti planlandı.',
  },
  {
    id: 'ev8',
    at: '18.03.2026 13:10',
    actor: 'Selin Yılmaz',
    actorRole: 'Üretim',
    description: 'Yard lokasyonu D2 rezerve edildi; sevkiyat öncesi kontrol.',
  },
  {
    id: 'ev9',
    at: '20.03.2026 09:00',
    actor: 'Sistem',
    actorRole: 'Bildirim',
    description: 'Son aktivite: mesaj thread’inde proje ofisi geri bildirimi (mock).',
  },
]

const MESSAGES_P1: ProjectThreadMessage[] = [
  {
    id: 'msg1',
    at: '14.02.2026 11:30',
    author: 'Can Öztürk',
    body: 'Müşteri köprü ayağı için ek kesit istedi; @Ayşe Kaya dosyaları yükler misiniz?',
    stage: 'teklif',
  },
  {
    id: 'msg2',
    at: '14.02.2026 11:45',
    author: 'Ayşe Kaya',
    body: 'Yükleme tamam — klasörde r1 seti var. Teklif hazırlığına geçebiliriz.',
    stage: 'proje_ofisi',
  },
  {
    id: 'msg3',
    at: '22.02.2026 11:02',
    author: 'Mehmet Demir',
    body: 'Statikte ankraj detayı netleşti; üretim öncesi rev B çizimini bekliyorum.',
    stage: 'muhendislik',
  },
  {
    id: 'msg4',
    at: '06.03.2026 08:15',
    author: 'Selin Yılmaz',
    body: 'İlk parti kalıp slotu Pazartesi sabah; numune isteyen var mı @Ayşe Kaya?',
    stage: 'uretim',
  },
  {
    id: 'msg5',
    at: '07.03.2026 10:40',
    author: 'Kalite Birimi',
    body: 'İlk parça numune talebi kuyrukta — lot A için örnekleme planı paylaşıldı.',
    stage: 'kalite',
  },
  {
    id: 'msg6',
    at: '19.03.2026 15:20',
    author: 'Lojistik',
    body: 'D2 için forklift penceresi 14:00–16:00; sevkiyat planına işlendi.',
    stage: 'lojistik',
  },
  {
    id: 'msg7',
    at: '20.03.2026 09:05',
    author: 'Saha Koord.',
    body: 'Şantiye teslim rampası hazır; vinç randevusu onaylı (mock).',
    stage: 'saha',
  },
]

const FILES_P1: ProjectDrawingFile[] = [
  {
    id: 'f1',
    name: 'köprü_ayağı_plan_r1.pdf',
    rev: 'A',
    uploadedAt: '14.02.2026',
    sizeLabel: '2,4 MB',
    ext: 'pdf',
  },
  {
    id: 'f2',
    name: 'kesit_detay_04.dwg',
    rev: 'B',
    uploadedAt: '28.02.2026',
    sizeLabel: '890 KB',
    ext: 'dwg',
  },
  {
    id: 'f3',
    name: '3b_model_lot2.ifc',
    rev: 'C',
    uploadedAt: '01.03.2026',
    sizeLabel: '18 MB',
    ext: 'ifc',
  },
  {
    id: 'f4',
    name: 'numune_foto_on.png',
    rev: '—',
    uploadedAt: '08.03.2026',
    sizeLabel: '1,1 MB',
    ext: 'png',
  },
  {
    id: 'f5',
    name: 'sevkiyat_palet_etiketi.pdf',
    rev: '1',
    uploadedAt: '18.03.2026',
    sizeLabel: '120 KB',
    ext: 'pdf',
  },
]

/** Kısa özet metinleri (bie-02 Özet sekmesi) */
export const PROJECT_SUMMARY_BLURBS: Record<string, string> = {
  p1: 'Köprü ayağı Lot-2 — üretim ve yard aşamasında; teklif onaylı, mühendislik çıkışları tamamlandı. Sevkiyat öncesi yard lokasyonu ve saha koordinasyonu devam ediyor (mock).',
  p2: 'Viyadük segmentleri — tasarım / keşif aşamasında; bağlı teklif henüz yok.',
  p3: 'Kentsel dönüşüm blokları — üretim aktif; kritik takip beton fiyatı riski.',
  p4: 'Liman dalga kıran — proje kapatıldı; arşiv ve garanti süreci (salt okunur mock).',
}

export function getTimelineForProject(projectId: string): ProjectTimelineEvent[] {
  if (projectId === 'p1') return TIMELINE_P1
  return [
    {
      id: 'ev-mini-1',
      at: '10.01.2026 10:00',
      actor: 'Sistem',
      actorRole: 'Kayıt',
      description: 'Proje oluşturuldu (kısaltılmış zaman çizelgesi — mock).',
    },
    {
      id: 'ev-mini-2',
      at: '12.01.2026 15:30',
      actor: 'Kullanıcı',
      actorRole: 'Proje ofisi',
      description: 'Dosya eklendi; inceleme bekleniyor.',
    },
  ]
}

export function getMessagesForProject(projectId: string): ProjectThreadMessage[] {
  if (projectId === 'p1') return MESSAGES_P1
  return [
    {
      id: 'm-a',
      at: '01.03.2026 09:00',
      author: 'Proje ofisi',
      body: 'Thread başlatıldı — detaylı mesajlar ana örnek projede (PRJ-2026-014).',
      stage: 'proje_ofisi',
    },
  ]
}

export function getFilesForProject(projectId: string): ProjectDrawingFile[] {
  if (projectId === 'p1') return FILES_P1
  return [
    {
      id: 'fx',
      name: 'genel_notlar.pdf',
      rev: 'A',
      uploadedAt: '05.03.2026',
      sizeLabel: '400 KB',
      ext: 'pdf',
    },
  ]
}

export function lastActivityLine(projectId: string): string {
  const t = getTimelineForProject(projectId)
  const last = t[t.length - 1]
  if (!last) return '—'
  return `${last.at} · ${last.actor} (${last.actorRole}) — ${last.description}`
}
