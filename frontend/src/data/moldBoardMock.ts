/**
 * prod-03 — Kalıp tahtası mock (K-01 … K-12).
 * Her hücrede en fazla 1 aktif iş kartı.
 */

export const MOLD_IDS: string[] = Array.from({ length: 12 }, (_, i) => `K-${String(i + 1).padStart(2, '0')}`)

export type MoldBoardJob = {
  id: string
  orderNo: string
  partCode: string
  /** Kısa durum metni (gri etiket) */
  statusLabel: string
  foremanName: string
  /** P1 — sistem önerisi (ince protrude çerçeve) */
  suggested?: boolean
}

/** Başlangıç yerleşimi — boş kalıplar + tek önerili kart */
export function createInitialMoldBoard(): Record<string, MoldBoardJob | null> {
  const map: Record<string, MoldBoardJob | null> = {}
  for (const id of MOLD_IDS) map[id] = null

  map['K-01'] = {
    id: 'j1',
    orderNo: 'WO-884',
    partCode: 'T12-KIRIS',
    statusLabel: 'Üretimde',
    foremanName: 'Usta Mehmet',
  }
  map['K-03'] = {
    id: 'j2',
    orderNo: 'WO-892',
    partCode: 'K40-STD',
    statusLabel: 'Üretimde',
    foremanName: 'Usta Ayşe',
    suggested: true,
  }
  map['K-04'] = {
    id: 'j3',
    orderNo: 'WO-885',
    partCode: 'P40-PANEL',
    statusLabel: 'Beklemede (QC)',
    foremanName: 'Usta Mehmet',
  }
  map['K-07'] = {
    id: 'j4',
    orderNo: 'WO-891',
    partCode: 'H12-HAT',
    statusLabel: 'Beklemede',
    foremanName: 'Usta Can',
  }
  map['K-09'] = {
    id: 'j5',
    orderNo: 'WO-894',
    partCode: 'P40-KOPYA',
    statusLabel: 'Beklemede (QC)',
    foremanName: 'Usta Ayşe',
  }
  map['K-11'] = {
    id: 'j6',
    orderNo: 'WO-890',
    partCode: 'D90-DUVAR',
    statusLabel: 'Bloke',
    foremanName: '—',
  }

  return map
}

/** P2 — günlük zaman dilimleri (yatay eksen) */
export const MOLD_BOARD_DAY_SLOTS = [
  { id: 's1', label: '06–08', hint: 'Erken' },
  { id: 's2', label: '08–10', hint: 'V1' },
  { id: 's3', label: '10–12', hint: 'V2' },
  { id: 's4', label: '12–14', hint: 'Öğle' },
  { id: 's5', label: '14–16', hint: 'V3' },
  { id: 's6', label: '16–18', hint: 'Akşam' },
] as const

/** Slot başına mock doluluk % (görsel) */
export const MOLD_BOARD_SLOT_LOAD: number[] = [20, 65, 85, 45, 70, 35]
