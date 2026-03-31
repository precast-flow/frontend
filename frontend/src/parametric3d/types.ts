/** Adım 18 — parametrik JSON sözleşmesi (schema 1.0) */

export type ElementFamily = 'COLUMN' | 'BEAM' | 'CULVERT' | 'PANEL' | 'PROFILE_WALL'

export type PanelKind = 'WALL' | 'SLAB'

export type ProfileType = 'L' | 'U'

export type ParametricPayload = {
  schemaVersion: '1.0'
  elementFamily: ElementFamily
  variantCode: string
  unit: 'mm'
  panelKind?: PanelKind
  parameters: ParametricParameters
}

export type ParametricParameters =
  | ColumnParams
  | BeamParams
  | CulvertParams
  | PanelParams
  | ProfileWallParams

export type ColumnParams = {
  sectionWidth: number
  sectionDepth: number
  height: number
}

export type BeamParams = {
  span: number
  width: number
  height: number
}

export type CulvertParams = {
  outerLength: number
  outerWidth: number
  outerHeight: number
  innerLength: number
  innerWidth: number
  innerHeight: number
}

export type PanelOpening = { x: number; y: number; width: number; height: number }

export type PanelParams = {
  length: number
  height: number
  thickness: number
  openings?: PanelOpening[]
}

export type ProfileWallParams = {
  profileType: ProfileType
  legLengthA: number
  legLengthB: number
  legLengthC?: number
  wallThickness: number
  extrusionHeight: number
}

export type ValidationCode = 'VALIDATION_ERROR' | 'GEOMETRY_ERROR'

export type ValidationResult =
  | { ok: true }
  | { ok: false; code: ValidationCode; message: string }

export type SavedDesign = {
  id: string
  name: string
  payload: ParametricPayload
  createdAt: string
}

const STORAGE_KEY = 'precast-parametric-designs-v1'

export function loadSavedDesigns(): SavedDesign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedDesign[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveDesigns(list: SavedDesign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function defaultPayload(family: ElementFamily): ParametricPayload {
  const base = {
    schemaVersion: '1.0' as const,
    unit: 'mm' as const,
    variantCode: defaultVariant(family),
    elementFamily: family,
  }
  switch (family) {
    case 'COLUMN':
      return {
        ...base,
        parameters: { sectionWidth: 400, sectionDepth: 400, height: 3200 },
      }
    case 'BEAM':
      return {
        ...base,
        parameters: { span: 6000, width: 300, height: 600 },
      }
    case 'CULVERT':
      return {
        ...base,
        parameters: {
          outerLength: 3000,
          outerWidth: 2000,
          outerHeight: 1500,
          innerLength: 2400,
          innerWidth: 1400,
          innerHeight: 1200,
        },
      }
    case 'PANEL':
      return {
        ...base,
        panelKind: 'WALL',
        parameters: {
          length: 6000,
          height: 3000,
          thickness: 200,
          openings: [],
        },
      }
    case 'PROFILE_WALL':
      return {
        ...base,
        parameters: {
          profileType: 'L',
          legLengthA: 2400,
          legLengthB: 1800,
          wallThickness: 200,
          extrusionHeight: 3200,
        },
      }
    default:
      return base as ParametricPayload
  }
}

function defaultVariant(f: ElementFamily): string {
  switch (f) {
    case 'COLUMN':
      return 'T1-DIKDORTGEN'
    case 'BEAM':
      return 'RECT_PRISM'
    case 'CULVERT':
      return 'T3-BOX-KAPALI'
    case 'PANEL':
      return 'T4-DUZ-LEVHA'
    case 'PROFILE_WALL':
      return 'T5-L-KOSE'
    default:
      return 'T0'
  }
}
