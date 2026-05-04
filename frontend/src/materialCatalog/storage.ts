import { createDefaultMaterialCatalog } from './defaultMaterials'
import type { MaterialDef } from './types'

const KEY = 'malzeme-katalog-v1'

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

function mergeDefaults(stored: MaterialDef[]): MaterialDef[] {
  const defaults = createDefaultMaterialCatalog()
  const byId = new Map<string, MaterialDef>()
  for (const m of stored) {
    byId.set(m.id, m)
  }
  for (const d of defaults) {
    if (!byId.has(d.id)) {
      byId.set(d.id, d)
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'tr'))
}

export function loadMaterialCatalog(): MaterialDef[] {
  const raw = readJson<MaterialDef[]>(KEY, [])
  if (!raw.length) return createDefaultMaterialCatalog()
  return mergeDefaults(raw)
}

export function saveMaterialCatalog(materials: MaterialDef[]): void {
  writeJson(KEY, materials)
}
