import type { WidgetType } from './types'

export type CatalogDragPayload = {
  type: WidgetType
  w: number
  h: number
}

let active: CatalogDragPayload | null = null

export function beginCatalogDrag(payload: CatalogDragPayload) {
  active = payload
}

export function getCatalogDrag(): CatalogDragPayload | null {
  return active
}

export function endCatalogDrag() {
  active = null
}
