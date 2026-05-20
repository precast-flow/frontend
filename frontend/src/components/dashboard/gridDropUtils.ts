import { calcGridItemPosition, calcXY } from 'react-grid-layout'
import type { WidgetType } from './types'

export const WIDGET_DND_MIME = 'application/x-precast-widget'

const GRID_METRICS = {
  cols: 12,
  rowHeight: 56,
  margin: [16, 16] as const,
  containerPadding: [0, 0] as const,
  maxRows: Infinity,
}

export function gridPositionParams(containerWidth: number) {
  return {
    ...GRID_METRICS,
    containerWidth,
  }
}

export function setWidgetDragData(dt: DataTransfer, type: WidgetType) {
  dt.setData(WIDGET_DND_MIME, type)
  dt.setData('text/plain', type)
  dt.effectAllowed = 'copy'
}

export function readWidgetDragData(dt: DataTransfer): WidgetType | null {
  const raw = dt.getData(WIDGET_DND_MIME) || dt.getData('text/plain')
  if (!raw) return null
  return raw as WidgetType
}

export type DropPreviewRect = {
  x: number
  y: number
  left: number
  top: number
  width: number
  height: number
}

/** İmleç konumundan grid hücresi + piksel önizleme kutusu (varsayılan w×h). */
export function dropPreviewFromPointer(
  clientX: number,
  clientY: number,
  gridEl: HTMLElement,
  containerWidth: number,
  itemW: number,
  itemH: number,
): DropPreviewRect {
  const rect = gridEl.getBoundingClientRect()
  const top = clientY - rect.top
  const left = clientX - rect.left
  const params = gridPositionParams(containerWidth)
  const { x, y } = calcXY(params, top, left, itemW, itemH)
  const pos = calcGridItemPosition(params, x, y, itemW, itemH)
  return { x, y, left: pos.left, top: pos.top, width: pos.width, height: pos.height }
}

export function isDroppingPlaceholderId(id: string) {
  return id === '__dropping-elem__' || id.startsWith('__dropping')
}
