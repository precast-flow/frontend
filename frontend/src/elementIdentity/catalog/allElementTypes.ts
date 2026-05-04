import type { ElementTypeCatalogEntry } from '../types'
import { ELEMENT_TYPES } from './elementTypes'
import { ELEMENT_TYPES_EXTENDED } from './elementTypesExtended'

export const ALL_ELEMENT_TYPES: ElementTypeCatalogEntry[] = [...ELEMENT_TYPES, ...ELEMENT_TYPES_EXTENDED]

export const ALL_ELEMENT_TYPES_BY_ID: Record<string, ElementTypeCatalogEntry> = Object.fromEntries(
  ALL_ELEMENT_TYPES.map((e) => [e.id, e]),
)
