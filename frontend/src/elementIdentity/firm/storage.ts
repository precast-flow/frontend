import type {
  ElementTypeCatalogEntry,
  FirmCodeOverride,
  FirmNamingTemplate,
  FirmProfile,
  IdentifyingDimension,
  IfcMappingRule,
  ProjectElement,
  ProjectProduct,
  ProjectSequenceCounter,
  SizeFormat,
  StandardSeriesTemplate,
  Typology,
} from '../types'
import { defaultStandardSeriesTemplates } from '../../standardSeriesCatalog/defaultTemplates'
import {
  ELEMENT_TYPES,
  IDENTIFYING_DIMENSIONS,
  IFC_MAPPING_RULES,
  SIZE_FORMATS,
  TYPOLOGIES,
} from '../catalog'
import { MOCK_FIRMS, MOCK_OVERRIDES, MOCK_TEMPLATES } from './mockFirms'

const KEY_FIRMS = 'precast.elementIdentity.firms'
const KEY_TEMPLATES = 'precast.elementIdentity.templates'
const KEY_OVERRIDES = 'precast.elementIdentity.overrides'
const KEY_ACTIVE_FIRM = 'precast.elementIdentity.activeFirmId'
const KEY_ELEMENTS = 'precast.elementIdentity.projectElements'
const KEY_COUNTERS = 'precast.elementIdentity.sequenceCounters'
const KEY_PRODUCTS = 'precast.elementIdentity.projectProducts'
const KEY_STANDARD_SERIES = 'standart-seri-urunler-v1'

/** Admin sayfasında düzenlenebilen sistem kataloğu — TS sabitleri seed; localStorage override. */
const KEY_ELEMENT_TYPES = 'precast.elementIdentity.elementTypes'
const KEY_TYPOLOGIES = 'precast.elementIdentity.typologies'
const KEY_DIMENSIONS = 'precast.elementIdentity.dimensions'
const KEY_SIZE_FORMATS = 'precast.elementIdentity.sizeFormats'
const KEY_IFC_RULES = 'precast.elementIdentity.ifcMappingRules'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

// Firms ---------------------------------------------------------------------
export function loadFirms(): FirmProfile[] {
  return readJson<FirmProfile[]>(KEY_FIRMS, MOCK_FIRMS)
}
export function saveFirms(firms: FirmProfile[]): void {
  writeJson(KEY_FIRMS, firms)
}

// Templates -----------------------------------------------------------------
export function loadTemplates(): FirmNamingTemplate[] {
  return readJson<FirmNamingTemplate[]>(KEY_TEMPLATES, MOCK_TEMPLATES)
}
export function saveTemplates(templates: FirmNamingTemplate[]): void {
  writeJson(KEY_TEMPLATES, templates)
}

// Overrides -----------------------------------------------------------------
export function loadOverrides(): FirmCodeOverride[] {
  return readJson<FirmCodeOverride[]>(KEY_OVERRIDES, MOCK_OVERRIDES)
}
export function saveOverrides(overrides: FirmCodeOverride[]): void {
  writeJson(KEY_OVERRIDES, overrides)
}

// Active firm ---------------------------------------------------------------
export function loadActiveFirmId(fallback: string): string {
  return readJson<string>(KEY_ACTIVE_FIRM, fallback)
}
export function saveActiveFirmId(id: string): void {
  writeJson(KEY_ACTIVE_FIRM, id)
}

// Elements ------------------------------------------------------------------
export function loadProjectElements(): ProjectElement[] {
  return readJson<ProjectElement[]>(KEY_ELEMENTS, [])
}
export function saveProjectElements(els: ProjectElement[]): void {
  writeJson(KEY_ELEMENTS, els)
}

// Sequence counters ---------------------------------------------------------
export function loadCounters(): ProjectSequenceCounter[] {
  return readJson<ProjectSequenceCounter[]>(KEY_COUNTERS, [])
}
export function saveCounters(c: ProjectSequenceCounter[]): void {
  writeJson(KEY_COUNTERS, c)
}

// Project products (mock ürün envanteri) ------------------------------------
export function loadProjectProducts(): ProjectProduct[] {
  return readJson<ProjectProduct[]>(KEY_PRODUCTS, [])
}
export function saveProjectProducts(rows: ProjectProduct[]): void {
  writeJson(KEY_PRODUCTS, rows)
}

// Standart seri ürün şablonları (firma kataloğu) --------------------------------
export function loadStandardSeriesTemplates(fallbackFirmId: string): StandardSeriesTemplate[] {
  const rows = readJson<StandardSeriesTemplate[]>(KEY_STANDARD_SERIES, [])
  if (rows.length === 0) {
    return defaultStandardSeriesTemplates(fallbackFirmId)
  }
  return rows
}

export function saveStandardSeriesTemplates(rows: StandardSeriesTemplate[]): void {
  writeJson(KEY_STANDARD_SERIES, rows)
}

export function allocateSequence(
  counters: ProjectSequenceCounter[],
  projectId: string,
  scopeKey: string,
): { next: number; counters: ProjectSequenceCounter[] } {
  const idx = counters.findIndex((c) => c.projectId === projectId && c.scopeKey === scopeKey)
  if (idx === -1) {
    const created: ProjectSequenceCounter = {
      id: `cnt-${projectId}-${scopeKey}`,
      projectId,
      scope: 'element_type',
      scopeKey,
      currentValue: 1,
    }
    return { next: 1, counters: [...counters, created] }
  }
  const updated = { ...counters[idx], currentValue: counters[idx].currentValue + 1 }
  const arr = [...counters]
  arr[idx] = updated
  return { next: updated.currentValue, counters: arr }
}

export function resetAll(): void {
  try {
    localStorage.removeItem(KEY_FIRMS)
    localStorage.removeItem(KEY_TEMPLATES)
    localStorage.removeItem(KEY_OVERRIDES)
    localStorage.removeItem(KEY_ACTIVE_FIRM)
    localStorage.removeItem(KEY_ELEMENTS)
    localStorage.removeItem(KEY_COUNTERS)
    localStorage.removeItem(KEY_PRODUCTS)
    localStorage.removeItem(KEY_STANDARD_SERIES)
    localStorage.removeItem(KEY_ELEMENT_TYPES)
    localStorage.removeItem(KEY_TYPOLOGIES)
    localStorage.removeItem(KEY_DIMENSIONS)
    localStorage.removeItem(KEY_SIZE_FORMATS)
    localStorage.removeItem(KEY_IFC_RULES)
  } catch {
    /* ignore */
  }
}

// Element types --------------------------------------------------------------
export function loadElementTypes(): ElementTypeCatalogEntry[] {
  return readJson<ElementTypeCatalogEntry[]>(KEY_ELEMENT_TYPES, ELEMENT_TYPES)
}
export function saveElementTypes(rows: ElementTypeCatalogEntry[]): void {
  writeJson(KEY_ELEMENT_TYPES, rows)
}

// Typologies -----------------------------------------------------------------
export function loadTypologies(): Typology[] {
  return readJson<Typology[]>(KEY_TYPOLOGIES, TYPOLOGIES)
}
export function saveTypologies(rows: Typology[]): void {
  writeJson(KEY_TYPOLOGIES, rows)
}

// Identifying dimensions -----------------------------------------------------
export function loadDimensions(): IdentifyingDimension[] {
  return readJson<IdentifyingDimension[]>(KEY_DIMENSIONS, IDENTIFYING_DIMENSIONS)
}
export function saveDimensions(rows: IdentifyingDimension[]): void {
  writeJson(KEY_DIMENSIONS, rows)
}

// Size formats ---------------------------------------------------------------
export function loadSizeFormats(): SizeFormat[] {
  return readJson<SizeFormat[]>(KEY_SIZE_FORMATS, SIZE_FORMATS)
}
export function saveSizeFormats(rows: SizeFormat[]): void {
  writeJson(KEY_SIZE_FORMATS, rows)
}

// IFC mapping rules ----------------------------------------------------------
export function loadIfcMappingRules(): IfcMappingRule[] {
  return readJson<IfcMappingRule[]>(KEY_IFC_RULES, IFC_MAPPING_RULES)
}
export function saveIfcMappingRules(rows: IfcMappingRule[]): void {
  writeJson(KEY_IFC_RULES, rows)
}
