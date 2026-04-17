import type { ProjectCardItem, ProjectPriority, ProjectStatus } from './projectManagementCardsMock'

/** Musteri ve sorumlu secimleri (liste ekrani mock verisiyle uyumlu ornekler) */
export const projectCreateCustomersMock: string[] = [
  'Acme Altyapi',
  'Metropol Yapi',
  'Delta Insaat',
  'Kuzey Yapi',
  'Yildiz Endustri',
  'Liman Isletmeleri',
  'Belediye A.S.',
  'Yeni Musteri A.S. (mock)',
]

export const projectCreateOwnersMock: string[] = ['OY', 'SG', 'MK', 'AY', 'EK', 'BT']

export const projectCreateStatusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'planlama', label: 'Planlama' },
  { value: 'devam', label: 'Devam ediyor' },
  { value: 'riskli', label: 'Riskli' },
  { value: 'beklemede', label: 'Beklemede' },
  { value: 'tamamlandi', label: 'Tamamlandi' },
]

export const projectCreatePriorityOptions: { value: ProjectPriority; label: string }[] = [
  { value: 'dusuk', label: 'Dusuk' },
  { value: 'normal', label: 'Normal' },
  { value: 'yuksek', label: 'Yuksek' },
  { value: 'kritik', label: 'Kritik' },
]

/** Son mock kart id sayisina gore onerilen kod (sabit mock) */
export function suggestedProjectCodeMock(): string {
  return 'PRJ-2026-040'
}

export type ProjectCreateDraft = Pick<
  ProjectCardItem,
  'code' | 'name' | 'customer' | 'owner' | 'status' | 'priority' | 'startDate' | 'dueDate' | 'progress' | 'note'
>

export const projectCreateDraftMock: ProjectCreateDraft = {
  code: suggestedProjectCodeMock(),
  name: 'Depo Kolon Paketi — Faz A',
  customer: 'Yeni Musteri A.S. (mock)',
  owner: 'EK',
  status: 'planlama',
  priority: 'normal',
  startDate: '21.04.2026',
  dueDate: '15.06.2026',
  progress: 0,
  note: 'Taslak proje; kesif onayi sonrasi guncellenecek (mock).',
}
