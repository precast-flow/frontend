export type ProjectStatus = 'planlama' | 'devam' | 'riskli' | 'beklemede' | 'tamamlandi'
export type ProjectPriority = 'dusuk' | 'normal' | 'yuksek' | 'kritik'

export type ProjectCardItem = {
  id: string
  code: string
  name: string
  customer: string
  owner: string
  status: ProjectStatus
  priority: ProjectPriority
  updatedAt: string
  startDate: string
  dueDate: string
  progress: number
  note: string
}

export type ProjectMiniActivity = {
  id: string
  projectId: string
  at: string
  text: string
}

export const projectManagementCardsMock: ProjectCardItem[] = [
  {
    id: 'pm-1',
    code: 'PRJ-2026-014',
    name: 'Kopru Ayagi Lot-2',
    customer: 'Acme Altyapi',
    owner: 'OY',
    status: 'devam',
    priority: 'yuksek',
    updatedAt: '14.04.2026 10:12',
    startDate: '03.03.2026',
    dueDate: '28.04.2026',
    progress: 62,
    note: 'Kritik kalip teslimi bekleniyor.',
  },
  {
    id: 'pm-2',
    code: 'PRJ-2026-022',
    name: 'Metro Istasyonu Perde Seti',
    customer: 'Metropol Yapi',
    owner: 'SG',
    status: 'riskli',
    priority: 'kritik',
    updatedAt: '14.04.2026 09:44',
    startDate: '18.03.2026',
    dueDate: '24.04.2026',
    progress: 54,
    note: 'Saha teslim penceresi daraldi.',
  },
  {
    id: 'pm-3',
    code: 'PRJ-2026-019',
    name: 'Viyaduk Segmentleri Faz-1',
    customer: 'Delta Insaat',
    owner: 'MK',
    status: 'planlama',
    priority: 'normal',
    updatedAt: '13.04.2026 18:02',
    startDate: '16.04.2026',
    dueDate: '20.05.2026',
    progress: 22,
    note: 'Kesif revizyonu tamamlandi.',
  },
  {
    id: 'pm-4',
    code: 'PRJ-2026-025',
    name: 'OSB Perde Sistemleri',
    customer: 'Kuzey Yapi',
    owner: 'AY',
    status: 'beklemede',
    priority: 'normal',
    updatedAt: '13.04.2026 14:27',
    startDate: '07.04.2026',
    dueDate: '15.05.2026',
    progress: 31,
    note: 'Musteri onayi bekleniyor.',
  },
  {
    id: 'pm-5',
    code: 'PRJ-2025-088',
    name: 'Viyaduk Segmentleri Faz-0',
    customer: 'Delta Insaat',
    owner: 'OY',
    status: 'tamamlandi',
    priority: 'dusuk',
    updatedAt: '12.04.2026 11:09',
    startDate: '10.01.2026',
    dueDate: '28.03.2026',
    progress: 100,
    note: 'Teslim tutanagi kapatildi.',
  },
  {
    id: 'pm-6',
    code: 'PRJ-2026-030',
    name: 'Santral Bina Cephe Panelleri',
    customer: 'Yildiz Endustri',
    owner: 'SG',
    status: 'devam',
    priority: 'normal',
    updatedAt: '14.04.2026 08:35',
    startDate: '25.03.2026',
    dueDate: '30.04.2026',
    progress: 68,
    note: 'Haftalik kalite raporu pozitif.',
  },
  {
    id: 'pm-7',
    code: 'PRJ-2026-033',
    name: 'Iskele Kolon-Kiris Paketi',
    customer: 'Liman Isletmeleri',
    owner: 'MK',
    status: 'planlama',
    priority: 'yuksek',
    updatedAt: '14.04.2026 07:58',
    startDate: '21.04.2026',
    dueDate: '22.05.2026',
    progress: 16,
    note: 'Mimari set transferi bekleniyor.',
  },
  {
    id: 'pm-8',
    code: 'PRJ-2026-035',
    name: 'Atik Su Hatti Prefabrikleri',
    customer: 'Belediye A.S.',
    owner: 'AY',
    status: 'devam',
    priority: 'kritik',
    updatedAt: '14.04.2026 11:20',
    startDate: '28.03.2026',
    dueDate: '26.04.2026',
    progress: 71,
    note: 'Lojistik kapasite kritik seviyede.',
  },
]

export const projectManagementActivitiesMock: ProjectMiniActivity[] = [
  { id: 'a1', projectId: 'pm-1', at: '14.04 10:00', text: 'Durum "Devam ediyor" olarak guncellendi.' },
  { id: 'a2', projectId: 'pm-1', at: '14.04 09:42', text: 'Sorumlu degisimi: OY -> SG (mock).' },
  { id: 'a3', projectId: 'pm-1', at: '13.04 16:18', text: 'Kalip tedarik notu eklendi.' },
  { id: 'a4', projectId: 'pm-2', at: '14.04 09:40', text: 'Risk rozeti kritik seviyeye cekildi.' },
  { id: 'a5', projectId: 'pm-2', at: '13.04 15:10', text: 'Teslim tarihi one cekildi: 24.04.2026.' },
  { id: 'a6', projectId: 'pm-8', at: '14.04 11:10', text: 'Yeni lojistik notu eklendi.' },
]
