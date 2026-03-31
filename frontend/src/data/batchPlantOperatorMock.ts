/**
 * prod-06 — Beton santrali operatör ekranı (mock).
 * Tam ekran, az tıklama; sadece santral operatörü düzenler (UI’da rol simülasyonu).
 */

export type BatchPlantPhase = 'idle' | 'pouring' | 'paused'

/** Sıradaki iş — kart verisi */
export const BATCH_CURRENT_JOB = {
  orderNo: 'UE-2025-1842',
  partLabel: 'PP-KIR-210 · Kiriş 12m',
  m3Target: 12.5,
  recipeCode: 'BT-C35-P1',
  /** Reçete özeti (tek satır) */
  recipeSummary: 'C35/45 · PCE 4,8 L/m³ · korozyon inhibitörü',
} as const

/** P1 — Son döküm özeti (önceki iş 1 satır) — tamamlanınca güncellenir (mock) */
export type PreviousPourSummary = {
  orderNo: string
  partShort: string
  m3: string
  recipeCode: string
  finishedAtDisplay: string
}

export const BATCH_PREVIOUS_POUR_SEED: PreviousPourSummary = {
  orderNo: 'UE-2025-1801',
  partShort: 'Duvar D-04',
  m3: '8,0',
  recipeCode: 'BT-C30-STD',
  finishedAtDisplay: '19.03.2025 06:55',
}
