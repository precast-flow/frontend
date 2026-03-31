/**
 * firm-05 — Firma ayarları içi fabrika listesi (mock).
 * Üretim modülü `MOCK_FACTORIES` ile uyumlu kod uzayı.
 */

import { MOCK_FACTORIES } from './mockFactories'

export type FirmFactoryRow = {
  id: string
  code: string
  name: string
  city: string
  address: string
  active: boolean
  notes: string
}

export function buildFirmFactoriesSeed(): FirmFactoryRow[] {
  return MOCK_FACTORIES.map((f, i) => ({
    id: `f-${f.code}`,
    code: f.code,
    name: f.name,
    city: f.city,
    address: f.address,
    active: f.active,
    notes: i === 0 ? 'Ana üretim tesisi — vardiya üçlü (mock).' : '',
  }))
}

export const FIRM_FACTORIES_DEFAULT_CODE = 'IST-HAD'
