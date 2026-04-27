import type {
  FirmCodeOverride,
  FirmNamingTemplate,
  FirmProfile,
  ProjectElement,
  ProjectSequenceCounter,
} from '../types'
import { MOCK_FIRMS, MOCK_OVERRIDES, MOCK_TEMPLATES } from './mockFirms'

const KEY_FIRMS = 'precast.elementIdentity.firms'
const KEY_TEMPLATES = 'precast.elementIdentity.templates'
const KEY_OVERRIDES = 'precast.elementIdentity.overrides'
const KEY_ACTIVE_FIRM = 'precast.elementIdentity.activeFirmId'
const KEY_ELEMENTS = 'precast.elementIdentity.projectElements'
const KEY_COUNTERS = 'precast.elementIdentity.sequenceCounters'

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
  } catch {
    /* ignore */
  }
}
