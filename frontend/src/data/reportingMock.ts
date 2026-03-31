export type ReportCategory = 'uretim' | 'lojistik' | 'kalite'

export type ReportDef = {
  id: string
  name: string
  description: string
  category: ReportCategory
}

export const reportCategories: { id: ReportCategory; label: string }[] = [
  { id: 'uretim', label: 'Üretim' },
  { id: 'lojistik', label: 'Lojistik' },
  { id: 'kalite', label: 'Kalite' },
]

/** mvp-13 P0 — sol katalog: 3 rapor */
export const reportCatalog: ReportDef[] = [
  {
    id: 'r-uretim',
    category: 'uretim',
    name: 'Üretim özeti',
    description: 'Hat bazında tamamlanan adet ve slot kullanımı.',
  },
  {
    id: 'r-sevk',
    category: 'lojistik',
    name: 'Sevkiyat özeti',
    description: 'Planlanan vs gerçekleşen çıkış ve gecikme.',
  },
  {
    id: 'r-kalite',
    category: 'kalite',
    name: 'Kalite özeti',
    description: 'Kontrol, onay ve ret / tamir oranları.',
  },
]

export type ReportResultRow = {
  id: string
  dimension: string
  period: string
  value: string
  trend: string
  drillNote: string
}

/** Örnek sayısal mock — 10 satır (mvp-13) */
export const reportResultRows: ReportResultRow[] = [
  {
    id: 'row1',
    dimension: 'Hat A',
    period: '18–24 Mar',
    value: '1 240 ad',
    trend: '+4.2%',
    drillNote: 'MES onaylı çıktı; proje PRJ-2026-014 ağırlıklı.',
  },
  {
    id: 'row2',
    dimension: 'Hat B',
    period: '18–24 Mar',
    value: '980 ad',
    trend: '−1.1%',
    drillNote: 'Çarşamba bakım penceresi düşüldü.',
  },
  {
    id: 'row3',
    dimension: 'Hat C',
    period: '18–24 Mar',
    value: '1 102 ad',
    trend: '+0.8%',
    drillNote: 'Plan ile uyumlu.',
  },
  {
    id: 'row4',
    dimension: 'Ortalama OEE',
    period: 'Hafta 12',
    value: '84%',
    trend: '+2%',
    drillNote: 'Vardiya B değişim süresi iyileşti.',
  },
  {
    id: 'row5',
    dimension: 'Gecikmeli sevk',
    period: '18–24 Mar',
    value: '3',
    trend: '−2',
    drillNote: 'SVK-2026-0318 referanslı iki gün kayma.',
  },
  {
    id: 'row6',
    dimension: 'Zamanında teslim',
    period: '18–24 Mar',
    value: '92%',
    trend: '+3%',
    drillNote: 'Yard çıkış saatleri ile uyumlu.',
  },
  {
    id: 'row7',
    dimension: 'QC bekleyen',
    period: 'Anlık',
    value: '7 emir',
    trend: '—',
    drillNote: 'İstanbul fabrika kuyruğu.',
  },
  {
    id: 'row8',
    dimension: 'Ret oranı',
    period: '18–24 Mar',
    value: '2.1%',
    trend: '−0.3%',
    drillNote: 'NCR yüzey / ölçü kodları.',
  },
  {
    id: 'row9',
    dimension: 'İlk seferde geçen',
    period: '18–24 Mar',
    value: '94%',
    trend: '+1%',
    drillNote: 'Montaj geri bildirimi düşük.',
  },
  {
    id: 'row10',
    dimension: 'Tamir tekrar',
    period: '18–24 Mar',
    value: '1.2%',
    trend: '0%',
    drillNote: 'Tekrarlayan tek kayıt izlendi.',
  },
]

export type SavedViewChip = { id: string; label: string; reportId: string }

export const savedViewChips: SavedViewChip[] = [
  { id: 'sv1', label: 'Haftalık üretim', reportId: 'r-uretim' },
  { id: 'sv2', label: 'Sevkiyat KPI', reportId: 'r-sevk' },
  { id: 'sv3', label: 'Kalite ret özeti', reportId: 'r-kalite' },
]
