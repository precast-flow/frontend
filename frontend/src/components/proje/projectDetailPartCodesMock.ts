/** Proje detay — Parça kodları sekmesi için hiyerarşik mock veri */

import type { Locale } from '../../i18n/I18nProvider'
import type { RebarShapeType } from '../../elementIdentity/types'

export type ProjectPartActivity = { id: string; at: string; text: string }

/** Eleman kimlik kataloğundaki tipoloji id (ör. col-rect, beam-t) */
export type PartLifecycleStatus = 'tasarim' | 'uretim' | 'saha' | 'montaj' | 'tamamlandi'

export type PartMaterialRow = {
  id: string
  category: string
  name: string
  specification: string
  quantity: number
  unit: string
}

export type RebarScheduleRow = {
  id: string
  /** Poz / işaret */
  position: string
  diameterMm: number
  steelGrade: string
  shape: RebarShapeType
  /** Gelişmiş boy (tek çubuk) */
  developedLengthMm: number
  count: number
  /** Satır toplamı kg */
  totalWeightKg: number
  notes?: string
}

export type RebarScheduleSummary = {
  totalWeightKg: number
  straightBarCount: number
  /** straight dışındaki parçalar */
  shapedBarCount: number
  totalDevelopedLengthM: number
}

export type PartDrawingRevision = {
  id: string
  revision: string
  title: string
  updatedAt: string
  updatedBy: string
  changeNote: string
  pdfUrl: string
}

export type ProjectPartCode = {
  id: string
  code: string
  familyId: string
  familyLabel: string
  rev: string
  qty: number
  weightKg: number
  drawingStatus: string
  productType: string
  /** Kısa teknik not (liste / özet) */
  description: string
  /** Uzun tanım — ürün özellikleri */
  definition: string
  lifecycleStatus: PartLifecycleStatus
  /** Üretim planındaki sıralama numarası */
  productionOrder: number
  /** elementIdentity tipoloji id — boyutlar bu tipin identifyingDimensions ile eşleşir */
  typologyId: string
  /** mm (veya adet tipi boyutlar için sayı) — katalog ile uyumlu anahtarlar */
  dimensionValues: Record<string, number>
  /** Tek parça brüt hacim m³ */
  volumeM3: number
  materials: PartMaterialRow[]
  rebarSchedule: RebarScheduleRow[]
  rebarSummary: RebarScheduleSummary
  drawingRevisions?: PartDrawingRevision[]
  pdfPreviewUrl: string
  activities: ProjectPartActivity[]
}

export function getPartLifecycleLabel(status: PartLifecycleStatus, locale: Locale): string {
  const tr: Record<PartLifecycleStatus, string> = {
    tasarim: 'Tasarım aşamasında',
    uretim: 'Üretimde',
    saha: 'Şantiyede',
    montaj: 'Montajda',
    tamamlandi: 'Tamamlandı',
  }
  const en: Record<PartLifecycleStatus, string> = {
    tasarim: 'In design',
    uretim: 'In production',
    saha: 'On site',
    montaj: 'Being assembled',
    tamamlandi: 'Completed',
  }
  return locale === 'en' ? en[status] : tr[status]
}

/** Yaşam döngüsü sırasına göre ilerleme (görsel bar için, 5 aşama). */
export function getPartLifecycleProgressPercent(status: PartLifecycleStatus): number {
  const map: Record<PartLifecycleStatus, number> = {
    tasarim: 20,
    uretim: 40,
    saha: 60,
    montaj: 80,
    tamamlandi: 100,
  }
  return map[status]
}

export type PartLifecycleBarStyles = {
  track: string
  fill: string
  label: string
  /** Sağ panel rozet arka planı + ince çerçeve (sol liste bar paletiyle uyumlu) */
  badge: string
}

/** Bar ve durum yazısı için duruma özel renkler (Tailwind tam sınıf adları). */
export function getPartLifecycleBarStyles(status: PartLifecycleStatus): PartLifecycleBarStyles {
  const map: Record<PartLifecycleStatus, PartLifecycleBarStyles> = {
    tasarim: {
      track: 'bg-violet-200/70 dark:bg-violet-950/50',
      fill: 'bg-violet-500 dark:bg-violet-400',
      label: 'text-violet-800 dark:text-violet-200',
      badge:
        'bg-violet-200/55 dark:bg-violet-950/35 ring-1 ring-inset ring-violet-400/45 dark:ring-violet-500/30',
    },
    uretim: {
      track: 'bg-amber-200/70 dark:bg-amber-950/45',
      fill: 'bg-amber-500 dark:bg-amber-400',
      label: 'text-amber-900 dark:text-amber-200',
      badge:
        'bg-amber-200/55 dark:bg-amber-950/35 ring-1 ring-inset ring-amber-400/45 dark:ring-amber-500/30',
    },
    saha: {
      track: 'bg-sky-200/70 dark:bg-sky-950/45',
      fill: 'bg-sky-500 dark:bg-sky-400',
      label: 'text-sky-900 dark:text-sky-200',
      badge: 'bg-sky-200/55 dark:bg-sky-950/35 ring-1 ring-inset ring-sky-400/45 dark:ring-sky-500/30',
    },
    montaj: {
      track: 'bg-indigo-200/70 dark:bg-indigo-950/45',
      fill: 'bg-indigo-500 dark:bg-indigo-400',
      label: 'text-indigo-900 dark:text-indigo-200',
      badge:
        'bg-indigo-200/55 dark:bg-indigo-950/35 ring-1 ring-inset ring-indigo-400/45 dark:ring-indigo-500/30',
    },
    tamamlandi: {
      track: 'bg-emerald-200/70 dark:bg-emerald-950/45',
      fill: 'bg-emerald-500 dark:bg-emerald-400',
      label: 'text-emerald-900 dark:text-emerald-200',
      badge:
        'bg-emerald-200/55 dark:bg-emerald-950/35 ring-1 ring-inset ring-emerald-400/45 dark:ring-emerald-500/30',
    },
  }
  return map[status]
}

const DEMO_PDF = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'

export const projectDetailPartCodesMock: ProjectPartCode[] = [
  {
    id: 'pc-kl-401',
    code: 'KL-401',
    familyId: 'kolon',
    familyLabel: 'Kolon',
    rev: 'R2',
    qty: 42,
    weightKg: 4200,
    drawingStatus: 'Onaylı',
    productType: 'Dikdörtgen kolon',
    description: '40×40 kesit, C35/45; ankraj detayları R2 ile güncellendi.',
    definition:
      'Prefabrik dikdörtgen kesitli taşıyıcı kolon. C35/45 beton sınıfı, XC1 çevre sınıfı. Üst ve alt bağlantılarda ankraj kanalları ve plaka detayları şartnameye uygundur.',
    lifecycleStatus: 'uretim',
    productionOrder: 12,
    typologyId: 'col-rect',
    dimensionValues: { height: 5000, sectionWidth: 400, sectionDepth: 400 },
    volumeM3: 0.8,
    materials: [
      { id: 'm1', category: 'Geçiş / dolgu', name: 'PVC sleeve', specification: 'Ø110 elektrik geçiş', quantity: 4, unit: 'ad' },
      { id: 'm2', category: 'Bağlantı', name: 'Ankraj seti', specification: 'M24 galvaniz, 150 mm gömme', quantity: 8, unit: 'takım' },
      { id: 'm3', category: 'Bağlantı', name: 'Bağlantı plakası', specification: 'S355, 200×200×20', quantity: 2, unit: 'ad' },
      { id: 'm4', category: 'Yalıtım', name: 'Köşe profili', specification: 'EPDM bantlı', quantity: 12, unit: 'm' },
    ],
    rebarSchedule: [
      { id: 'r1', position: '101', diameterMm: 16, steelGrade: 'B500C', shape: 'straight', developedLengthMm: 4850, count: 8, totalWeightKg: 61.2 },
      { id: 'r2', position: '102', diameterMm: 14, steelGrade: 'B500C', shape: 'stirrup', developedLengthMm: 2100, count: 12, totalWeightKg: 35.8 },
      { id: 'r3', position: '103', diameterMm: 12, steelGrade: 'B500C', shape: 'stirrup', developedLengthMm: 1650, count: 24, totalWeightKg: 35.0 },
      { id: 'r4', position: '104', diameterMm: 10, steelGrade: 'B500C', shape: 'straight', developedLengthMm: 3980, count: 4, totalWeightKg: 9.8 },
    ],
    rebarSummary: { totalWeightKg: 141.8, straightBarCount: 12, shapedBarCount: 36, totalDevelopedLengthM: 102.6 },
    pdfPreviewUrl: DEMO_PDF,
    activities: [
      { id: 'a1', at: '14.04 09:10', text: 'Çizim R2 olarak yeniden yayınlandı.' },
      { id: 'a2', at: '12.04 16:40', text: 'Kalıp grubu üretim sırasına alındı.' },
      { id: 'a3', at: '10.04 11:05', text: 'Müşteri revizyonu işlendi (ankraj).' },
    ],
  },
  {
    id: 'pc-kl-402',
    code: 'KL-402',
    familyId: 'kolon',
    familyLabel: 'Kolon',
    rev: 'R1',
    qty: 28,
    weightKg: 3100,
    drawingStatus: 'İncelemede',
    productType: 'Dikdörtgen kolon',
    description: '45×45 kesit, köşe pahları 25 mm.',
    definition:
      'Büyük kesitli dikdörtgen kolon; köşe pahları ve yüzey buhar kürü notları çizimde belirtilmiştir. Statik onay sonrası üretim serbest.',
    lifecycleStatus: 'tasarim',
    productionOrder: 3,
    typologyId: 'col-rect',
    dimensionValues: { height: 4500, sectionWidth: 450, sectionDepth: 450 },
    volumeM3: 0.91,
    materials: [
      { id: 'm1', category: 'Geçiş / dolgu', name: 'PVC boru', specification: 'Ø90 sıhhi', quantity: 2, unit: 'ad' },
      { id: 'm2', category: 'Bağlantı', name: 'Levha', specification: 'S275, kaynaklı muf', quantity: 1, unit: 'ad' },
    ],
    rebarSchedule: [
      { id: 'r1', position: '201', diameterMm: 20, steelGrade: 'B500C', shape: 'straight', developedLengthMm: 4350, count: 12, totalWeightKg: 128.4 },
      { id: 'r2', position: '202', diameterMm: 14, steelGrade: 'B500C', shape: 'stirrup', developedLengthMm: 1880, count: 16, totalWeightKg: 45.2 },
    ],
    rebarSummary: { totalWeightKg: 173.6, straightBarCount: 12, shapedBarCount: 16, totalDevelopedLengthM: 82.2 },
    pdfPreviewUrl: DEMO_PDF,
    activities: [{ id: 'a1', at: '13.04 14:22', text: 'Statik onay bekleniyor.' }],
  },
  {
    id: 'pc-kr-208',
    code: 'KR-208',
    familyId: 'kiris',
    familyLabel: 'Kiriş',
    rev: 'R1',
    qty: 68,
    weightKg: 8900,
    drawingStatus: 'Onaylı',
    productType: 'T kiriş',
    description: 'Açıklık 12 m, alt donatı seti revizyonu R1.',
    definition:
      'Standart T kesitli prefabrik kiriş; üst başlık ile döşeme kompozit çalışır. Alt bölgede çatlak kontrol donatısı ve korse donatı R1 ile güncellenmiştir.',
    lifecycleStatus: 'uretim',
    productionOrder: 18,
    typologyId: 'beam-t',
    dimensionValues: {
      span: 12000,
      totalHeight: 600,
      flangeWidth: 600,
      webWidth: 200,
      flangeThickness: 150,
    },
    volumeM3: 2.85,
    materials: [
      { id: 'm1', category: 'Bağlantı', name: 'Kaynak plakası', specification: 'Köşe 150×150×12', quantity: 4, unit: 'ad' },
      { id: 'm2', category: 'Geçiş / dolgu', name: 'PVC conduit', specification: 'Ø50', quantity: 6, unit: 'm' },
    ],
    rebarSchedule: [
      { id: 'r1', position: 'T01', diameterMm: 22, steelGrade: 'B500C', shape: 'straight', developedLengthMm: 11850, count: 6, totalWeightKg: 214.0 },
      { id: 'r2', position: 'T02', diameterMm: 14, steelGrade: 'B500C', shape: 'stirrup', developedLengthMm: 3200, count: 18, totalWeightKg: 79.5 },
      { id: 'r3', position: 'T03', diameterMm: 12, steelGrade: 'B500C', shape: 'stirrup', developedLengthMm: 1450, count: 32, totalWeightKg: 51.2 },
    ],
    rebarSummary: { totalWeightKg: 344.7, straightBarCount: 6, shapedBarCount: 50, totalDevelopedLengthM: 178.4 },
    pdfPreviewUrl: DEMO_PDF,
    activities: [
      { id: 'a1', at: '14.04 08:30', text: 'Kalıp-donatı PDF birleştirildi.' },
      { id: 'a2', at: '11.04 17:15', text: 'Üretim için BOM aktarıldı.' },
    ],
  },
  {
    id: 'pc-kr-209',
    code: 'KR-209',
    familyId: 'kiris',
    familyLabel: 'Kiriş',
    rev: 'R0',
    qty: 24,
    weightKg: 2100,
    drawingStatus: 'Taslak',
    productType: 'L kiriş',
    description: 'Konsol bağlantı detayı netleştirilecek.',
    definition:
      'Tek taraflı L kesitli kenar kirişi. Konsol mesnet donatısı ve konsol ucu kanca detayları müşteri onayı sonrası kesinleşecek.',
    lifecycleStatus: 'tasarim',
    productionOrder: 6,
    typologyId: 'beam-l',
    dimensionValues: {
      span: 9000,
      totalHeight: 500,
      flangeWidth: 350,
      webWidth: 180,
      flangeThickness: 140,
    },
    volumeM3: 1.42,
    materials: [{ id: 'm1', category: 'Bağlantı', name: 'Ankraj', specification: 'Kimyasal dübel M16', quantity: 6, unit: 'ad' }],
    rebarSchedule: [
      { id: 'r1', position: 'L01', diameterMm: 18, steelGrade: 'B500C', shape: 'straight', developedLengthMm: 8850, count: 4, totalWeightKg: 71.0 },
      { id: 'r2', position: 'L02', diameterMm: 12, steelGrade: 'B500C', shape: 'stirrup', developedLengthMm: 980, count: 20, totalWeightKg: 17.4 },
    ],
    rebarSummary: { totalWeightKg: 88.4, straightBarCount: 4, shapedBarCount: 20, totalDevelopedLengthM: 55.0 },
    pdfPreviewUrl: DEMO_PDF,
    activities: [{ id: 'a1', at: '09.04 10:00', text: 'İlk çizim yüklendi (taslak).' }],
  },
  {
    id: 'pc-ds-110',
    code: 'DS-110',
    familyId: 'doseme',
    familyLabel: 'Döşeme',
    rev: 'R3',
    qty: 56,
    weightKg: 12400,
    drawingStatus: 'Onaylı',
    productType: 'Hollow core',
    description: 'HC 200, üst topping 50 mm.',
    definition:
      'Ön gerilmeli hollow core döşeme plakaları. Çekirdekler ve üst topping kalınlığı şantiye dökümü ile birlikte çalışır. Lift bağlantıları projeye uygundur.',
    lifecycleStatus: 'saha',
    productionOrder: 28,
    typologyId: 'slab-hc',
    dimensionValues: { length: 8000, width: 1200, thickness: 200, coreCount: 6, coreDiameter: 140 },
    volumeM3: 1.44,
    materials: [
      { id: 'm1', category: 'Geçiş / dolgu', name: 'PVC pipe', specification: 'Ø75 MEP', quantity: 3, unit: 'ad' },
      { id: 'm2', category: 'Bağlantı', name: 'Lift anchor', specification: '2,5 t WLL', quantity: 4, unit: 'ad' },
    ],
    rebarSchedule: [
      { id: 'r1', position: 'HC-1', diameterMm: 12, steelGrade: 'St1570/1770', shape: 'straight', developedLengthMm: 7950, count: 12, totalWeightKg: 84.2, notes: 'Ön gerilme teli (mock)' },
      { id: 'r2', position: 'HC-2', diameterMm: 8, steelGrade: 'B500C', shape: 'straight', developedLengthMm: 1180, count: 48, totalWeightKg: 17.8, notes: 'Üst çelik hasır' },
    ],
    rebarSummary: { totalWeightKg: 102.0, straightBarCount: 60, shapedBarCount: 0, totalDevelopedLengthM: 152.0 },
    pdfPreviewUrl: DEMO_PDF,
    activities: [
      { id: 'a1', at: '13.04 09:45', text: 'R3: çekirdek aralığı güncellendi.' },
      { id: 'a2', at: '08.04 15:20', text: 'MEP geçişleri işaretlendi.' },
    ],
  },
  {
    id: 'pc-pn-090',
    code: 'PN-090',
    familyId: 'panel',
    familyLabel: 'Panel',
    rev: 'R3',
    qty: 113,
    weightKg: 22600,
    drawingStatus: 'Onaylı',
    productType: 'Sandviç duvar paneli',
    description: '6×3 m modül, dış yüzey fırçalı beton.',
    definition:
      'Üç katmanlı sandviç cephe paneli: taşıyıcı iç tabaka, yalıtım çekirdeği ve mimari dış kabuk. Ankraj ve bağlantı plakaları cephe hizasına göre konumlanmıştır.',
    lifecycleStatus: 'montaj',
    productionOrder: 34,
    typologyId: 'wall-swp',
    dimensionValues: { length: 6000, height: 3000, innerThickness: 60, coreThickness: 100, outerThickness: 80 },
    volumeM3: 3.24,
    materials: [
      { id: 'm1', category: 'Bağlantı', name: 'Bağlantı plakası', specification: 'S355 kaynaklı', quantity: 6, unit: 'ad' },
      { id: 'm2', category: 'Bağlantı', name: 'Ankraj çubuğu', specification: 'Ø20 paslanmaz', quantity: 8, unit: 'ad' },
      { id: 'm3', category: 'Geçiş / dolgu', name: 'PVC sleeve', specification: 'Ø160 havalandırma', quantity: 1, unit: 'ad' },
    ],
    rebarSchedule: [
      { id: 'r1', position: 'P01', diameterMm: 10, steelGrade: 'B500C', shape: 'straight', developedLengthMm: 5950, count: 64, totalWeightKg: 118.0 },
      { id: 'r2', position: 'P02', diameterMm: 8, steelGrade: 'B500C', shape: 'stirrup', developedLengthMm: 820, count: 90, totalWeightKg: 36.2 },
    ],
    rebarSummary: { totalWeightKg: 154.2, straightBarCount: 64, shapedBarCount: 90, totalDevelopedLengthM: 454.6 },
    pdfPreviewUrl: DEMO_PDF,
    activities: [
      { id: 'a1', at: '14.04 07:55', text: 'Cephe hizası QC onayı alındı.' },
      { id: 'a2', at: '12.04 12:10', text: 'Haftalık üretim planına eklendi.' },
      { id: 'a3', at: '05.04 16:00', text: 'R3 mimari uyum kontrolü tamamlandı.' },
    ],
  },
  {
    id: 'pc-pn-091',
    code: 'PN-091',
    familyId: 'panel',
    familyLabel: 'Panel',
    rev: 'R1',
    qty: 48,
    weightKg: 8200,
    drawingStatus: 'Onaylı',
    productType: 'İç bölen panel',
    description: 'Akustik katmanlı çekirdek.',
    definition:
      'İç mekân bölen panel; çift yüzey ve akustik yalıtım çekirdeği. Yüzeyler düz sıva uyumludur.',
    lifecycleStatus: 'uretim',
    productionOrder: 23,
    typologyId: 'wall-prt',
    dimensionValues: { length: 4200, height: 3000, thickness: 100 },
    volumeM3: 1.26,
    materials: [
      { id: 'm1', category: 'Geçiş / dolgu', name: 'PVC pipe', specification: 'Ø50 elektrik', quantity: 2, unit: 'ad' },
    ],
    rebarSchedule: [
      { id: 'r1', position: 'PR1', diameterMm: 8, steelGrade: 'B500C', shape: 'straight', developedLengthMm: 4100, count: 36, totalWeightKg: 29.1 },
      { id: 'r2', position: 'PR2', diameterMm: 8, steelGrade: 'B500C', shape: 'stirrup', developedLengthMm: 650, count: 24, totalWeightKg: 6.1 },
    ],
    rebarSummary: { totalWeightKg: 35.2, straightBarCount: 36, shapedBarCount: 24, totalDevelopedLengthM: 163.2 },
    pdfPreviewUrl: DEMO_PDF,
    activities: [{ id: 'a1', at: '11.04 13:40', text: 'Sevkiyat grubu B olarak etiketlendi.' }],
  },
  {
    id: 'pc-mr-015',
    code: 'MR-015',
    familyId: 'merdiven',
    familyLabel: 'Merdiven',
    rev: 'R0',
    qty: 4,
    weightKg: 1800,
    drawingStatus: 'Onaylı',
    productType: 'Düz merdiven tablası',
    description: '10 basamak, kaymaz yüzey kaplaması notu.',
    definition:
      'Tek kollu düz merdiven tablası; basamak yüzeyi kaymaz kaplama ile tamamlanacaktır. Alt ve üst bağlantı detayları montaj planına referanslıdır.',
    lifecycleStatus: 'tamamlandi',
    productionOrder: 41,
    typologyId: 'stair-str',
    dimensionValues: {
      totalRun: 3000,
      totalRise: 1800,
      width: 1200,
      stepCount: 10,
      treadDepth: 300,
      riserHeight: 180,
    },
    volumeM3: 1.95,
    materials: [
      { id: 'm1', category: 'Bağlantı', name: 'Kayma plakası', specification: 'Üst mesnet', quantity: 2, unit: 'ad' },
      { id: 'm2', category: 'Geçiş / dolgu', name: 'PVC sleeve', specification: 'Ø40', quantity: 2, unit: 'ad' },
    ],
    rebarSchedule: [
      { id: 'r1', position: 'S01', diameterMm: 12, steelGrade: 'B500C', shape: 'stirrup', developedLengthMm: 2850, count: 14, totalWeightKg: 42.0 },
      { id: 'r2', position: 'S02', diameterMm: 10, steelGrade: 'B500C', shape: 'straight', developedLengthMm: 1180, count: 22, totalWeightKg: 16.0 },
    ],
    rebarSummary: { totalWeightKg: 58.0, straightBarCount: 22, shapedBarCount: 14, totalDevelopedLengthM: 65.8 },
    pdfPreviewUrl: DEMO_PDF,
    activities: [{ id: 'a1', at: '06.04 11:30', text: 'Saha montaj sırası 3. blok.' }],
  },
]

export const projectDetailPartFamilyOrder = [
  { id: 'kolon', label: 'Kolon' },
  { id: 'kiris', label: 'Kiriş' },
  { id: 'doseme', label: 'Döşeme' },
  { id: 'panel', label: 'Panel' },
  { id: 'merdiven', label: 'Merdiven' },
] as const
