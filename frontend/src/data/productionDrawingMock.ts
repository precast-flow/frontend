import type { WorkQueueItem } from './workQueueMock'

/** Örnek kolon PDF çizimi — beton dökümü öncesi/sonrası kalite kontrolü. */
export const S2_KOLON_DRAWING_PDF = '/drawings/s2-kolon.pdf'

/** Yerel yedek görsel — yalnızca PDF olmayan çizim URL’leri için. */
export const DEFAULT_DRAWING_ASSET = '/drawings/production-control-mock.svg'

/** Yedek: harici demo PDF (yalnızca geliştirme). */
const FALLBACK_PDF_URL =
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'

const PRODUCT_DRAWING_URLS: Record<string, string> = {
  'PRD-ATL-D01': S2_KOLON_DRAWING_PDF,
  'PRD-SANDBOX-01': S2_KOLON_DRAWING_PDF,
  'S2-KOLON': S2_KOLON_DRAWING_PDF,
}

export type ProductionDrawingSource =
  | { mode: 'image'; url: string }
  | { mode: 'pdf'; url: string }

export function isPdfDrawingUrl(url: string): boolean {
  return /\.pdf(\?|#|$)/i.test(url) || url.includes('application/pdf')
}

export function buildEmbeddedPdfUrl(pdfUrl: string): string {
  if (pdfUrl.includes('#')) return pdfUrl
  return `${pdfUrl}#toolbar=0&navpanes=0&view=FitH`
}

export function resolveProductionDrawingUrl(item: WorkQueueItem): string {
  if (item.drawingPreviewUrl) return item.drawingPreviewUrl
  if (item.productCode && PRODUCT_DRAWING_URLS[item.productCode]) {
    return PRODUCT_DRAWING_URLS[item.productCode]
  }
  if (item.kind === 'production') return S2_KOLON_DRAWING_PDF
  return DEFAULT_DRAWING_ASSET
}

export function resolveProductionDrawingSource(item: WorkQueueItem): ProductionDrawingSource {
  const url = resolveProductionDrawingUrl(item)
  const pdfPath = isPdfDrawingUrl(url)
    ? (url.split('#')[0]?.split('?')[0] ?? url)
    : item.kind === 'production'
      ? S2_KOLON_DRAWING_PDF
      : null
  if (pdfPath) {
    return { mode: 'pdf', url: buildEmbeddedPdfUrl(pdfPath) }
  }
  return { mode: 'image', url }
}

export function drawingFallbackImageUrl(): string {
  return DEFAULT_DRAWING_ASSET
}

export function drawingFallbackPdfUrl(): string {
  return buildEmbeddedPdfUrl(FALLBACK_PDF_URL)
}

export function buildProductLabelQrPayload(workQueueId: string, productCode?: string): string {
  const code = productCode ?? '—'
  return `pf://work-order/${workQueueId}?product=${encodeURIComponent(code)}`
}
