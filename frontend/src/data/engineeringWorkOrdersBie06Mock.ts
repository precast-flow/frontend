/**
 * bie-06 — Mühendislik iş emirleri: Tip A (metraj / teklif destek) vs Tip B (üretim öncesi).
 * mvp-08 ile uyumlu dosya + manuel alanlar detayda kullanılır.
 *
 * Çapraz referans: `promts/13-ui-production-prompts/prod-02-emir-listesi-ve-detay.md` —
 * burada oluşan üretim emri mock id formatı PRD-####; MES / üretim listesi ile aynı hikâye.
 */
import type { EngFile } from './engineeringMock'

export type EngWOKind = 'A' | 'B'

export type EngWOStatus =
  | 'taslak'
  | 'inceleniyor'
  | 'islemde'
  | 'tamamlandi'
  | 'uretim_emri_olusturuldu'

export type EngWORevision = {
  id: string
  rev: string
  at: string
  actor: string
  note: string
}

export type EngWorkOrderBie06 = {
  id: string
  code: string
  title: string
  projectId: string
  projectCode: string
  projectName: string
  kind: EngWOKind
  status: EngWOStatus
  priority: 'dusuk' | 'normal' | 'yuksek'
  updatedAt: string
  versionLabel: string
  files: EngFile[]
  revisions: EngWORevision[]
  /** Tip B — üretim emri oluşturulduğunda */
  productionOrderId?: string
  /** P2 — parametrik ürün placeholder */
  parametricPlaceholder?: string
}

export const MOCK_ENG_FACTORIES = [
  { id: 'IST-HAD', label: 'IST-HAD · Hadımköy' },
  { id: 'ANK-01', label: 'ANK-01 · Ostim' },
  { id: 'KOC-01', label: 'KOC-01 · Gebze' },
] as const

const f = (
  partial: Omit<EngFile, 'id'> & { id: string },
): EngFile => ({
  ...partial,
})

export const initialEngWorkOrdersBie06: EngWorkOrderBie06[] = [
  {
    id: 'wo-a-metraj',
    code: 'IE-MUH-2025-441',
    title: 'Metraj — kentsel dönüşüm kolon seti',
    projectId: 'p3',
    projectCode: 'PRJ-2026-033',
    projectName: 'Kentsel dönüşüm Blok 1–4',
    kind: 'A',
    status: 'tamamlandi',
    priority: 'normal',
    updatedAt: '22.03.2026 16:20',
    versionLabel: 'Rev B',
    parametricPlaceholder: 'COLUMN',
    files: [
      f({
        id: 'a-f1',
        name: 'Metraj_ozet_blok1.xlsx',
        fileType: 'XLSX',
        size: '88 KB',
        uploadedBy: 'Zeynep A.',
        uploadedAt: '20.03.2026',
        locked: false,
      }),
      f({
        id: 'a-f2',
        name: 'Kolon_cetveli_rB.pdf',
        fileType: 'PDF',
        size: '1,2 MB',
        uploadedBy: 'Mehmet D.',
        uploadedAt: '21.03.2026',
        locked: false,
      }),
      f({
        id: 'a-f3',
        name: 'Kesit_haritasi.dwg',
        fileType: 'DWG',
        size: '4 MB',
        uploadedBy: 'Mehmet D.',
        uploadedAt: '22.03.2026',
        locked: true,
        lockReason: 'Teklif revizyonu bekleniyor',
      }),
    ],
    revisions: [
      {
        id: 'a-r1',
        rev: 'Rev A',
        at: '18.03.2026 10:00',
        actor: 'Zeynep A.',
        note: 'İlk metraj yükleme',
      },
      {
        id: 'a-r2',
        rev: 'Rev B',
        at: '22.03.2026 16:20',
        actor: 'Mehmet D.',
        note: 'Kolon adetleri güncellendi (Blok 3)',
      },
    ],
  },
  {
    id: 'wo-a-teklif',
    code: 'IE-MUH-2025-448',
    title: 'Teklif destek — IFC kesit kontrolü',
    projectId: 'p1',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    kind: 'A',
    status: 'inceleniyor',
    priority: 'yuksek',
    updatedAt: '23.03.2026 11:05',
    versionLabel: 'Rev A',
    parametricPlaceholder: 'BEAM',
    files: [
      f({
        id: 'at-f1',
        name: 'Kopru_IFC_slice.ifc',
        fileType: 'IFC',
        size: '38 MB',
        uploadedBy: 'Can D.',
        uploadedAt: '22.03.2026',
        locked: false,
        integrationStatus: 'islenmedi',
      }),
      f({
        id: 'at-f2',
        name: 'Notlar_satış.docx',
        fileType: 'DOCX',
        size: '24 KB',
        uploadedBy: 'Can Ö.',
        uploadedAt: '23.03.2026',
        locked: false,
      }),
    ],
    revisions: [
      {
        id: 'at-r1',
        rev: 'Rev A',
        at: '23.03.2026 11:05',
        actor: 'Can D.',
        note: 'Satıştan gelen IFC — kesit uyumu kontrolü',
      },
    ],
  },
  {
    id: 'wo-b-kopru',
    code: 'IE-MUH-2025-502',
    title: 'Üretim öncesi — köprü çıkış paketi',
    projectId: 'p1',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    kind: 'B',
    status: 'tamamlandi',
    priority: 'yuksek',
    updatedAt: '24.03.2026 09:00',
    versionLabel: 'Rev C',
    parametricPlaceholder: 'PANEL',
    files: [
      f({
        id: 'b1-f1',
        name: 'Assembly_IFC_v3.ifc',
        fileType: 'IFC',
        size: '44 MB',
        uploadedBy: 'Mehmet D.',
        uploadedAt: '23.03.2026',
        locked: false,
        integrationStatus: 'islenmedi',
      }),
      f({
        id: 'b1-f2',
        name: 'BOM_revD.xlsx',
        fileType: 'XLSX',
        size: '130 KB',
        uploadedBy: 'Ayşe K.',
        uploadedAt: '23.03.2026',
        locked: false,
      }),
      f({
        id: 'b1-f3',
        name: 'Panel_P90_detay.pdf',
        fileType: 'PDF',
        size: '2,1 MB',
        uploadedBy: 'Mehmet D.',
        uploadedAt: '24.03.2026',
        locked: true,
        lockReason: 'Üretim emri bekleniyor',
      }),
    ],
    revisions: [
      {
        id: 'b1-r1',
        rev: 'Rev A',
        at: '10.03.2026',
        actor: 'Mehmet D.',
        note: 'İlk çıkış',
      },
      {
        id: 'b1-r2',
        rev: 'Rev B',
        at: '18.03.2026',
        actor: 'Ayşe K.',
        note: 'Donatı çakışması giderildi',
      },
      {
        id: 'b1-r3',
        rev: 'Rev C',
        at: '24.03.2026 09:00',
        actor: 'Mehmet D.',
        note: 'Panel P-90 fabrika notları eklendi',
      },
    ],
  },
  {
    id: 'wo-b-segment',
    code: 'IE-MUH-2025-510',
    title: 'Üretim öncesi — segment takoz detayları',
    projectId: 'p2',
    projectCode: 'PRJ-2025-088',
    projectName: 'Viyadük segmentleri',
    kind: 'B',
    status: 'islemde',
    priority: 'normal',
    updatedAt: '21.03.2026 14:30',
    versionLabel: 'Rev A',
    files: [
      f({
        id: 'b2-f1',
        name: 'Takoz_cnc.dwg',
        fileType: 'DWG',
        size: '6 MB',
        uploadedBy: 'Deniz T.',
        uploadedAt: '19.03.2026',
        locked: false,
      }),
      f({
        id: 'b2-f2',
        name: 'Kaynak_notu.pdf',
        fileType: 'PDF',
        size: '900 KB',
        uploadedBy: 'Deniz T.',
        uploadedAt: '21.03.2026',
        locked: false,
      }),
    ],
    revisions: [
      {
        id: 'b2-r1',
        rev: 'Rev A',
        at: '21.03.2026 14:30',
        actor: 'Deniz T.',
        note: 'Takoz geometrisi netleştirildi',
      },
    ],
  },
  {
    id: 'wo-b-prd-done',
    code: 'IE-MUH-2025-480',
    title: 'Üretim öncesi — panel hattı bağlantıları',
    projectId: 'p1',
    projectCode: 'PRJ-2026-014',
    projectName: 'Köprü Ayağı Lot-2',
    kind: 'B',
    status: 'uretim_emri_olusturuldu',
    priority: 'normal',
    updatedAt: '15.03.2026 08:15',
    versionLabel: 'Rev B',
    productionOrderId: 'PRD-2048',
    files: [
      f({
        id: 'b3-f1',
        name: 'Baglanti_plakalari.pdf',
        fileType: 'PDF',
        size: '1,4 MB',
        uploadedBy: 'Mehmet D.',
        uploadedAt: '12.03.2026',
        locked: true,
        lockReason: 'PRD-2048 ile kilitli',
      }),
    ],
    revisions: [
      {
        id: 'b3-r1',
        rev: 'Rev A',
        at: '08.03.2026',
        actor: 'Mehmet D.',
        note: 'İlk bağlantı seti',
      },
      {
        id: 'b3-r2',
        rev: 'Rev B',
        at: '14.03.2026',
        actor: 'Selin Y.',
        note: 'Hat toleransı güncellendi',
      },
    ],
  },
]

export function engWOStatusLabelKey(s: EngWOStatus): string {
  switch (s) {
    case 'taslak':
      return 'eng.bie06.status.taslak'
    case 'inceleniyor':
      return 'eng.bie06.status.inceleniyor'
    case 'islemde':
      return 'eng.bie06.status.islemde'
    case 'tamamlandi':
      return 'eng.bie06.status.tamamlandi'
    case 'uretim_emri_olusturuldu':
      return 'eng.bie06.status.uretimEmriOlusturuldu'
  }
}

export function engWOPriorityLabelKey(p: EngWorkOrderBie06['priority']): string {
  switch (p) {
    case 'dusuk':
      return 'eng.bie06.priority.dusuk'
    case 'normal':
      return 'eng.bie06.priority.normal'
    case 'yuksek':
      return 'eng.bie06.priority.yuksek'
  }
}

export function engWOStatusPillClass(s: EngWOStatus): string {
  const base = 'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1'
  switch (s) {
    case 'taslak':
      return `${base} bg-gray-100 text-gray-700 ring-gray-300/90 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-600`
    case 'inceleniyor':
      return `${base} bg-amber-100/90 text-amber-950 ring-amber-300/80 dark:bg-amber-950/40 dark:text-amber-100`
    case 'islemde':
      return `${base} bg-sky-100/90 text-sky-950 ring-sky-300/80 dark:bg-sky-950/40 dark:text-sky-100`
    case 'tamamlandi':
      return `${base} bg-emerald-100/90 text-emerald-950 ring-emerald-300/80 dark:bg-emerald-950/40 dark:text-emerald-100`
    case 'uretim_emri_olusturuldu':
      return `${base} bg-gray-800 text-white ring-gray-600 dark:bg-gray-200 dark:text-gray-900`
  }
}

export function engWOKindPillClass(kind: EngWOKind): string {
  const base = 'inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1'
  return kind === 'A'
    ? `${base} bg-violet-100 text-violet-900 ring-violet-300/80 dark:bg-violet-950/50 dark:text-violet-100`
    : `${base} bg-orange-100 text-orange-950 ring-orange-300/80 dark:bg-orange-950/40 dark:text-orange-100`
}
