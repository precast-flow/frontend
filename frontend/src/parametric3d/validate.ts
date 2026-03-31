import type { ParametricPayload, ValidationResult } from './types'

function num(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function pos(v: number): boolean {
  return v > 0
}

export function validatePayload(p: ParametricPayload): ValidationResult {
  if (p.schemaVersion !== '1.0') {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'schemaVersion geçersiz' }
  }
  if (p.unit !== 'mm') {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'unit mm olmalı' }
  }
  if (!p.variantCode?.trim()) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'variantCode zorunlu' }
  }

  const { elementFamily, parameters: pr } = p

  switch (elementFamily) {
    case 'COLUMN': {
      const { sectionWidth, sectionDepth, height } = pr as Record<string, unknown>
      if (!num(sectionWidth) || !num(sectionDepth) || !num(height)) {
        return { ok: false, code: 'VALIDATION_ERROR', message: 'Kolon: tüm ölçüler sayı olmalı' }
      }
      if (!pos(sectionWidth) || !pos(sectionDepth) || !pos(height)) {
        return { ok: false, code: 'VALIDATION_ERROR', message: 'Kolon: ölçüler > 0 olmalı' }
      }
      return { ok: true }
    }
    case 'BEAM': {
      const { span, width, height } = pr as Record<string, unknown>
      if (!num(span) || !num(width) || !num(height)) {
        return { ok: false, code: 'VALIDATION_ERROR', message: 'Kiriş: tüm ölçüler sayı olmalı' }
      }
      if (!pos(span) || !pos(width) || !pos(height)) {
        return { ok: false, code: 'VALIDATION_ERROR', message: 'Kiriş: ölçüler > 0 olmalı' }
      }
      return { ok: true }
    }
    case 'CULVERT': {
      const o = pr as Record<string, unknown>
      const keys = [
        'outerLength',
        'outerWidth',
        'outerHeight',
        'innerLength',
        'innerWidth',
        'innerHeight',
      ] as const
      for (const k of keys) {
        if (!num(o[k])) {
          return { ok: false, code: 'VALIDATION_ERROR', message: `Menfez: ${k} sayı olmalı` }
        }
        if (!pos(o[k] as number)) {
          return { ok: false, code: 'VALIDATION_ERROR', message: `Menfez: ${k} > 0 olmalı` }
        }
      }
      const ol = o.outerLength as number
      const ow = o.outerWidth as number
      const oh = o.outerHeight as number
      const il = o.innerLength as number
      const iw = o.innerWidth as number
      const ih = o.innerHeight as number
      if (il >= ol || iw >= ow || ih >= oh) {
        return {
          ok: false,
          code: 'VALIDATION_ERROR',
          message: 'Menfez: iç ölçüler dış ölçülerden küçük olmalı',
        }
      }
      return { ok: true }
    }
    case 'PANEL': {
      const { length, height, thickness } = pr as Record<string, unknown>
      if (!num(length) || !num(height) || !num(thickness)) {
        return { ok: false, code: 'VALIDATION_ERROR', message: 'Panel: temel ölçüler sayı olmalı' }
      }
      if (!pos(length) || !pos(height) || !pos(thickness)) {
        return { ok: false, code: 'VALIDATION_ERROR', message: 'Panel: ölçüler > 0 olmalı' }
      }
      const openings = (pr as { openings?: unknown }).openings
      if (openings !== undefined) {
        if (!Array.isArray(openings)) {
          return { ok: false, code: 'VALIDATION_ERROR', message: 'Panel: openings dizi olmalı' }
        }
        const L = length as number
        const H = height as number
        for (let i = 0; i < openings.length; i++) {
          const op = openings[i] as Record<string, unknown>
          const x = op.x
          const y = op.y
          const w = op.width
          const h = op.height
          if (!num(x) || !num(y) || !num(w) || !num(h)) {
            return { ok: false, code: 'VALIDATION_ERROR', message: `Açıklık ${i + 1}: alanlar sayı olmalı` }
          }
          if (!pos(w) || !pos(h)) {
            return { ok: false, code: 'VALIDATION_ERROR', message: `Açıklık ${i + 1}: boyutlar > 0` }
          }
          if (x < 0 || y < 0 || x + w > L || y + h > H) {
            return {
              ok: false,
              code: 'VALIDATION_ERROR',
              message: `Açıklık ${i + 1} panel sınırı dışında`,
            }
          }
        }
      }
      return { ok: true }
    }
    case 'PROFILE_WALL': {
      const o = pr as Record<string, unknown>
      const pt = o.profileType
      if (pt !== 'L' && pt !== 'U') {
        return { ok: false, code: 'VALIDATION_ERROR', message: 'profileType L veya U olmalı' }
      }
      const t = o.wallThickness
      const a = o.legLengthA
      const b = o.legLengthB
      const eh = o.extrusionHeight
      if (!num(t) || !num(a) || !num(b) || !num(eh)) {
        return { ok: false, code: 'VALIDATION_ERROR', message: 'Perde: ölçüler sayı olmalı' }
      }
      if (!pos(t) || !pos(eh)) {
        return { ok: false, code: 'VALIDATION_ERROR', message: 'Perde: kalınlık ve yükseklik > 0' }
      }
      if (a <= t || b <= t) {
        return {
          ok: false,
          code: 'VALIDATION_ERROR',
          message: 'Perde: bacak uzunlukları duvar kalınlığından büyük olmalı',
        }
      }
      if (pt === 'U') {
        const c = o.legLengthC
        if (c !== undefined && (!num(c) || c <= t)) {
          return { ok: false, code: 'VALIDATION_ERROR', message: 'U: legLengthC sayı ve duvar kalınlığından büyük olmalı' }
        }
      }
      return { ok: true }
    }
    default:
      return { ok: false, code: 'VALIDATION_ERROR', message: 'Bilinmeyen elementFamily' }
  }
}
