import type { ProductRebarEntry, ProductRebarSummary } from '../../elementIdentity/types'

export function newRowId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function computeRebarSummary(rows: ProductRebarEntry[]): ProductRebarSummary {
  let totalWeightKg = 0
  let straightBarCount = 0
  let shapedBarCount = 0
  let totalDevelopedLengthM = 0
  for (const r of rows) {
    totalWeightKg += r.totalWeightKg
    totalDevelopedLengthM += (r.developedLengthMm * r.count) / 1000
    if (r.shape === 'straight') straightBarCount += r.count
    else shapedBarCount += r.count
  }
  return { totalWeightKg, straightBarCount, shapedBarCount, totalDevelopedLengthM }
}

const DEMO_PDF = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'

export function defaultDrawingPdfUrl(): string {
  return DEMO_PDF
}
