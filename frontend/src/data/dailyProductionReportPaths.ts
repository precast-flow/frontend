/** Günlük üretim raporu tam sayfa detay rotası */
export function dailyProductionReportDetailPath(reportId: string): string {
  return `/gunluk-uretim-raporu/${encodeURIComponent(reportId)}`
}

export type DailyProductionReportDetailLocationState = {
  fromProductionPlanning?: boolean
  returnPath?: string
}
