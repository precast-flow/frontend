import type { WorkQueueItem } from './workQueueMock'

/** Yerel mock çizim — harici PDF iframe engeline takılmaz. */
export const DEFAULT_DRAWING_ASSET = '/drawings/production-control-mock.svg'

/** Yedek: projede kullanılan Mozilla örnek PDF (yalnızca açık pdf URL verildiğinde). */
const FALLBACK_PDF_URL =
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'

const PRODUCT_DRAWING_URLS: Record<string, string> = {
  'PRD-ATL-D01': DEFAULT_DRAWING_ASSET,
  'PRD-SANDBOX-01': DEFAULT_DRAWING_ASSET,
}

export type ProductionDrawingSource =
  | { mode: 'image'; url: string }
  | { mode: 'pdf'; url: string }

export function isPdfDrawingUrl(url: string): boolean {
  return /\.pdf(\?|#|$)/i.test(url) || url.includes('application/pdf')
}

export function buildEmbeddedPdfUrl(pdfUrl: string): string {
  if (pdfUrl.includes('#')) return pdfUrl
  return `${pdfUrl}#toolbar=0&navpanes=0`
}

export function resolveProductionDrawingUrl(item: WorkQueueItem): string {
  if (item.drawingPreviewUrl) return item.drawingPreviewUrl
  if (item.productCode && PRODUCT_DRAWING_URLS[item.productCode]) {
    return PRODUCT_DRAWING_URLS[item.productCode]
  }
  return DEFAULT_DRAWING_ASSET
}

export function resolveProductionDrawingSource(item: WorkQueueItem): ProductionDrawingSource {
  const url = resolveProductionDrawingUrl(item)
  if (isPdfDrawingUrl(url)) {
    return { mode: 'pdf', url: buildEmbeddedPdfUrl(url) }
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
