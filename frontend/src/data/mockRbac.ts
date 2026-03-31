/** mvp-03 — roller (mock) */
export type MockRole = {
  id: string
  label: string
  /** Sistem rolü — silinemez, adı mock’ta düzenlenmez */
  isSystem: boolean
  /** Bu role atanmış kullanıcı sayısı (mock) */
  userCount: number
  description: string
  /**
   * Bu izin kimlikleri bu rolde her zaman açık kalır; kullanıcı kapatamaz (mock).
   * `admin` için tüm izinler kilit kabul edilir — ayrıca listelemeye gerek yok.
   */
  lockedPermissionIds?: string[]
}

export const MOCK_ROLES: MockRole[] = [
  {
    id: 'admin',
    label: 'Yönetici',
    isSystem: true,
    userCount: 4,
    description: 'Tam erişim; yönetim ve denetim. Onay akışı şablonları ile aynı “kim onaylar” sorusundan bağımsız ekran izinleri.',
  },
  {
    id: 'sales',
    label: 'Satış',
    isSystem: false,
    userCount: 12,
    description: 'CRM ve teklif süreçleri; fiyat ve revizyon.',
    lockedPermissionIds: ['teklif.goruntule'],
  },
  {
    id: 'planning',
    label: 'Planlama',
    isSystem: false,
    userCount: 7,
    description: 'Üretim emri ve slot; MES ile koordinasyon.',
  },
  {
    id: 'production',
    label: 'Üretim',
    isSystem: false,
    userCount: 28,
    description: 'Saha üretim ve durum güncellemeleri.',
  },
  {
    id: 'quality',
    label: 'Kalite',
    isSystem: false,
    userCount: 9,
    description: 'Kalite kayıtları ve NCR.',
  },
  {
    id: 'dispatch',
    label: 'Sevkiyat',
    isSystem: false,
    userCount: 6,
    description: 'Yükleme ve çıkış kayıtları.',
  },
  {
    id: 'field',
    label: 'Saha',
    isSystem: false,
    userCount: 15,
    description: 'Şantiye web görevleri ve teslim.',
  },
  {
    id: 'readonly',
    label: 'Salt okunur',
    isSystem: true,
    userCount: 22,
    description: 'Rapor ve pano görüntüleme; yazma yok.',
    lockedPermissionIds: [
      'crm.musteri.goruntule',
      'teklif.goruntule',
      'proje.pano.goruntule',
      'rpt.ek.1',
      'rpt.ek.2',
      'rpt.ek.3',
    ],
  },
]

export type PermissionModuleKey =
  | 'crm'
  | 'teklif'
  | 'proje'
  | 'muhendislik'
  | 'uretim'
  | 'kalite'
  | 'yard'
  | 'sevkiyat'
  | 'saha'
  | 'rapor'
  | 'yonetim'

export type PermissionDef = {
  id: string
  label: string
  module: PermissionModuleKey
}

/** Modül anahtarları — filtre UI sırası */
export const PERMISSION_MODULE_ORDER: PermissionModuleKey[] = [
  'crm',
  'teklif',
  'proje',
  'muhendislik',
  'uretim',
  'kalite',
  'yard',
  'sevkiyat',
  'saha',
  'rapor',
  'yonetim',
]

export const PERMISSION_MODULE_LABELS: Record<PermissionModuleKey, string> = {
  crm: 'CRM',
  teklif: 'Teklif',
  proje: 'Proje',
  muhendislik: 'Mühendislik',
  uretim: 'Üretim',
  kalite: 'Kalite',
  yard: 'Yard',
  sevkiyat: 'Sevkiyat',
  saha: 'Saha',
  rapor: 'Rapor',
  yonetim: 'Yönetim',
}

/** Atomik izinler + üretimde genişleyen set — listede 8 satır + kalan sayı mock */
const extra = (prefix: string, module: PermissionModuleKey, n: number): PermissionDef[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${prefix}.ek.${i + 1}`,
    label: `${prefix} ek izin ${i + 1}`,
    module,
  }))

export const ALL_PERMISSIONS: PermissionDef[] = [
  { id: 'crm.musteri.goruntule', label: 'Müşteri görüntüle', module: 'crm' },
  { id: 'crm.musteri.duzenle', label: 'Müşteri düzenle', module: 'crm' },
  { id: 'teklif.goruntule', label: 'Teklif görüntüle', module: 'teklif' },
  { id: 'teklif.duzenle', label: 'Teklif düzenle', module: 'teklif' },
  { id: 'teklif.onayla', label: 'Teklif onayla (buton)', module: 'teklif' },
  { id: 'proje.pano.goruntule', label: 'Proje panosu', module: 'proje' },
  { id: 'muhendislik.dosya.yukle', label: 'Mühendislik dosya yükle', module: 'muhendislik' },
  { id: 'uretim.emri.olustur', label: 'Üretim emri oluştur', module: 'uretim' },
  { id: 'uretim.durum.degistir', label: 'Üretim durumu değiştir', module: 'uretim' },
  { id: 'kalite.kayit', label: 'Kalite kaydı aç', module: 'kalite' },
  { id: 'sevkiyat.cikis.kaydet', label: 'Sevkiyat çıkışı kaydet', module: 'sevkiyat' },
  { id: 'yonetim.rol.yonet', label: 'Rol ve izin yönetimi', module: 'yonetim' },
  ...extra('crm', 'crm', 6),
  ...extra('teklif', 'teklif', 8),
  ...extra('proje', 'proje', 6),
  ...extra('muh', 'muhendislik', 6),
  ...extra('mes', 'uretim', 8),
  ...extra('qc', 'kalite', 6),
  ...extra('yard', 'yard', 4),
  ...extra('dpc', 'sevkiyat', 5),
  ...extra('saha', 'saha', 5),
  ...extra('rpt', 'rapor', 6),
  ...extra('adm', 'yonetim', 4),
]

/** Rol başına seçili izinler (mock) — Yönetici hepsi, Salt okunur az */
export const MOCK_ROLE_PERMISSIONS: Record<string, Set<string>> = {
  admin: new Set(ALL_PERMISSIONS.map((p) => p.id)),
  sales: new Set([
    'crm.musteri.goruntule',
    'crm.musteri.duzenle',
    'teklif.goruntule',
    'teklif.duzenle',
    'teklif.onayla',
    'rpt.ek.1',
  ]),
  planning: new Set(['uretim.emri.olustur', 'uretim.durum.degistir', 'proje.pano.goruntule', 'mes.ek.1']),
  production: new Set(['uretim.durum.degistir', 'mes.ek.2', 'mes.ek.3']),
  quality: new Set(['kalite.kayit', 'qc.ek.1']),
  dispatch: new Set(['sevkiyat.cikis.kaydet', 'dpc.ek.1']),
  field: new Set(['saha.ek.1', 'saha.ek.2']),
  readonly: new Set([
    'crm.musteri.goruntule',
    'teklif.goruntule',
    'proje.pano.goruntule',
    'rpt.ek.1',
    'rpt.ek.2',
    'rpt.ek.3',
  ]),
}

export const ROLE_TEMPLATE_GRANTS: Record<string, string[]> = {
  'tpl-min-saha': ['saha.ek.1', 'saha.ek.2', 'saha.ek.3'],
  'tpl-teklif-satis': ['teklif.goruntule', 'teklif.duzenle', 'crm.musteri.duzenle'],
  'tpl-uretim-hat': ['uretim.durum.degistir', 'mes.ek.1', 'mes.ek.2'],
}

export const MOCK_ROLE_USERS: Record<string, { name: string; email: string }[]> = {
  admin: [
    { name: 'Ayşe Kaya', email: 'ayse@acme.com' },
    { name: 'IT Yönetici', email: 'it@acme.com' },
  ],
  sales: [
    { name: 'Mehmet Yılmaz', email: 'mehmet@acme.com' },
    { name: 'Zeynep Ak', email: 'zeynep@acme.com' },
  ],
  planning: [{ name: 'Can Demir', email: 'can@acme.com' }],
  production: [{ name: 'Ali Veli', email: 'ali@acme.com' }],
  quality: [{ name: 'Selin Koç', email: 'selin@acme.com' }],
  dispatch: [{ name: 'Burak Şen', email: 'burak@acme.com' }],
  field: [{ name: 'Oğuz Kurt', email: 'oguz@acme.com' }],
  readonly: [{ name: 'Misafir Okuyucu', email: 'read@acme.com' }],
}

/** P1 — rol şablonları (içe aktar mock) */
export const MOCK_ROLE_TEMPLATES = [
  { id: 'tpl-min-saha', label: 'Minimum saha paketi' },
  { id: 'tpl-teklif-satis', label: 'Teklif + satış ofisi' },
  { id: 'tpl-uretim-hat', label: 'Üretim hattı operatörü' },
] as const

/** İzin bu rolde kilitli mi (açık kalır, kapatılamaz) */
export function isPermissionLockedForRole(role: MockRole, permissionId: string): boolean {
  if (role.id === 'admin') return true
  return Boolean(role.lockedPermissionIds?.includes(permissionId))
}

export function getLockedPermissionIdsForRole(role: MockRole): Set<string> {
  if (role.id === 'admin') return new Set(ALL_PERMISSIONS.map((p) => p.id))
  return new Set(role.lockedPermissionIds ?? [])
}

/** Onay akışı (mvp-02) ile RBAC çapraz referans — küçük tablo */
export const PERMISSION_TO_APPROVAL_HINT: { permissionId: string; hint: string }[] = [
  { permissionId: 'teklif.onayla', hint: 'Teklif onay akışındaki “Onayla” aksiyonu — akış kimin sırayla onayladığını ayrıca tanımlar.' },
  { permissionId: 'sevkiyat.cikis.kaydet', hint: 'Sevkiyat çıkışı sürecinde kayıt tamamlama; onay adımları şablonda.' },
  { permissionId: 'uretim.emri.olustur', hint: 'Üretim emri yayınlama onayı ile birlikte düşünülür (iki katman: izin + süreç).' },
  { permissionId: 'yonetim.rol.yonet', hint: 'Bu ekran; onay akışı tasarımcısından farklı nesne (roller/atomik izinler).' },
]
