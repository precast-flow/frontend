/** Kalite kontrol raporu tam sayfa detay rotası */
export function qualityControlReportDetailPath(productionWorkQueueId: string): string {
  return `/kalite-kontrol-raporu/${encodeURIComponent(productionWorkQueueId)}`
}

export type QualityControlReportDetailLocationState = {
  fromUnitWorkQueue?: boolean
  returnWorkQueueId?: string
}
