import type { MarkerKind } from '../data/productionQualityControl'
import { drawingFallbackImageUrl } from '../data/productionDrawingMock'

const OUTPUT_WIDTH = 640
const OUTPUT_HEIGHT = 420
const CROP_FRACTION = 0.38

const PIN_COLORS: Record<MarkerKind, { fill: string; ring: string }> = {
  pass: { fill: '#10b981', ring: '#6ee7b7' },
  warning: { fill: '#f59e0b', ring: '#fcd34d' },
  error: { fill: '#dc2626', ring: '#fca5a5' },
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('drawing image load failed'))
    img.src = url
  })
}

function drawMarkerPin(ctx: CanvasRenderingContext2D, cx: number, cy: number, kind: MarkerKind) {
  const { fill, ring } = PIN_COLORS[kind]
  const r = 14
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r + 3, 0, Math.PI * 2)
  ctx.fillStyle = ring
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 14px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const glyph = kind === 'pass' ? '✓' : kind === 'warning' ? '!' : '✕'
  ctx.fillText(glyph, cx, cy + (kind === 'pass' ? 0 : 0.5))
  ctx.restore()
}

/** Çizimde işaretlenen noktanın yakın çevresini rapor/PDF için görsel olarak üretir */
export async function captureMarkerSpotSnapshot(
  imageUrl: string,
  xPct: number,
  yPct: number,
  kind: MarkerKind,
): Promise<string> {
  let img: HTMLImageElement
  try {
    img = await loadImage(imageUrl)
  } catch {
    img = await loadImage(drawingFallbackImageUrl())
  }

  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_WIDTH
  canvas.height = OUTPUT_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')

  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const cropW = iw * CROP_FRACTION
  const cropH = ih * CROP_FRACTION
  const cx = (xPct / 100) * iw
  const cy = (yPct / 100) * ih
  const sx = Math.max(0, Math.min(iw - cropW, cx - cropW / 2))
  const sy = Math.max(0, Math.min(ih - cropH, cy - cropH / 2))

  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT)
  ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT)
  drawMarkerPin(ctx, OUTPUT_WIDTH / 2, OUTPUT_HEIGHT / 2, kind)

  return canvas.toDataURL('image/jpeg', 0.9)
}
