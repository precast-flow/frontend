/**
 * firm-04 — Vardiya ve çalışma takvimi (mock).
 */

export type ShiftModelId = 'day_single' | 'two_shift' | 'three_shift' | 'night_day'

export type ShiftTableRow = {
  id: string
  name: string
  start: string
  end: string
}

export type FactoryShiftOverride = {
  id: string
  factoryCode: string
  shiftModel: ShiftModelId
  note: string
}

export type FirmShiftCalendarState = {
  useShifts: boolean
  singleDayStart: string
  singleDayEnd: string
  shiftModel: ShiftModelId
  shiftRows: ShiftTableRow[]
  weekendProduction: boolean
  holidayBehavior: string
  factoryOverrides: FactoryShiftOverride[]
}

export const SHIFT_CALENDAR_SEED: FirmShiftCalendarState = {
  useShifts: true,
  singleDayStart: '08:00',
  singleDayEnd: '17:00',
  shiftModel: 'three_shift',
  shiftRows: [
    { id: 'r1', name: 'Sabah', start: '06:00', end: '14:00' },
    { id: 'r2', name: 'Akşam', start: '14:00', end: '22:00' },
    { id: 'r3', name: 'Gece', start: '22:00', end: '06:00' },
  ],
  weekendProduction: false,
  holidayBehavior: 'suspend',
  factoryOverrides: [
    { id: 'o1', factoryCode: 'IST-HAD', shiftModel: 'two_shift', note: 'Gece vardiyası Cuma kısaltıldı (mock)' },
    { id: 'o2', factoryCode: 'ANK-01', shiftModel: 'day_single', note: 'Tek vardiya — gündüz modeli (mock)' },
  ],
}

export const HOLIDAY_BEHAVIOR_OPTIONS = [
  { value: 'suspend', labelKey: 'firmShift.holiday.suspend' },
  { value: 'planned', labelKey: 'firmShift.holiday.planned' },
  { value: 'ignore', labelKey: 'firmShift.holiday.ignore' },
] as const

/** Vardiya filtresi üretim ekranında görünür mü? (P1 önizleme metni) */
export function isProductionShiftFilterVisible(state: FirmShiftCalendarState): boolean {
  return isShiftFilterVisible(state.useShifts, state.shiftModel)
}

export function isShiftFilterVisible(useShifts: boolean, model: ShiftModelId): boolean {
  if (!useShifts) return false
  if (model === 'day_single') return false
  return true
}
