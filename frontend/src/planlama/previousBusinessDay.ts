/** UTC tarih parçası YYYY-MM-DD */
export function toDayIsoUtc(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function isWeekendUtc(d: Date): boolean {
  const day = d.getUTCDay()
  return day === 0 || day === 6
}

/**
 * Verilen tarihten geriye doğru ilk iş günü (Cumartesi/Pazar atlanır).
 * `skipNonProductionDays` planlama takvimindeki üretim dışı günler için kullanılabilir.
 */
export function previousBusinessDayIso(
  fromDate: Date = new Date(),
  options?: { skipNonProductionDays?: (dayIso: string) => boolean },
): string {
  const d = new Date(fromDate)
  d.setUTCHours(12, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() - 1)

  const skip = options?.skipNonProductionDays
  for (let guard = 0; guard < 366; guard++) {
    const iso = toDayIsoUtc(d)
    if (!isWeekendUtc(d) && !(skip?.(iso) ?? false)) {
      return iso
    }
    d.setUTCDate(d.getUTCDate() - 1)
  }
  return toDayIsoUtc(d)
}
