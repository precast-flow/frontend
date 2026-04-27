import { SIZE_FORMATS_BY_ID } from '../catalog/sizeFormats'
import type { SizeFormat } from '../types'

/**
 * Basit mustache-like DSL:
 *   {field}              → dimension değeri (mm)
 *   {field/1000}         → mm → m
 *   {field/10}           → mm → cm
 *   {field|round:N}      → ondalığa yuvarla
 *   {field|pad:N}        → sol sıfır doldur
 *
 * Imperial özel (dt_us_format):
 *   {widthFeet}    → mm → feet (round 0)
 *   {depthInches}  → mm → inch (round 0)
 *
 * Sandviç toplam kalınlık:
 *   {totalThickness}     → inner + core + outer (mm)
 */

const TOKEN_RE = /\{([^}]+)\}/g

function applyDivide(value: number, divisor: number): number {
  return value / divisor
}

function applyRound(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return '?'
  const factor = Math.pow(10, Math.max(0, decimals))
  const rounded = Math.round(value * factor) / factor
  if (decimals === 0) return String(Math.round(rounded))
  return rounded.toFixed(decimals)
}

function applyPad(value: string, width: number): string {
  return value.padStart(width, '0')
}

function resolveDerived(
  fieldName: string,
  dims: Record<string, number>,
): number | null {
  if (fieldName === 'totalThickness') {
    const a = dims.innerThickness ?? 0
    const b = dims.coreThickness ?? 0
    const c = dims.outerThickness ?? 0
    if (!a && !b && !c && dims.thickness != null) return dims.thickness
    return a + b + c
  }
  if (fieldName === 'widthFeet') {
    // mm → feet
    const w = dims.width ?? 0
    return w / 304.8
  }
  if (fieldName === 'depthInches') {
    // mm → inch
    const d = dims.depth ?? dims.height ?? 0
    return d / 25.4
  }
  return null
}

/**
 * Tek bir token ifadesini ("height/1000|round:0") çözer.
 */
function evaluateExpression(expression: string, dims: Record<string, number>): string {
  // Parse field + transformations
  // e.g. "height/1000|round:0|pad:3"
  const parts = expression.split('|').map((p) => p.trim())
  const base = parts[0]

  let value: number | null = null

  // Check derived field
  const derived = resolveDerived(base.split('/')[0] ?? '', dims)
  if (derived != null && !base.includes('/')) {
    value = derived
  } else if (base.includes('/')) {
    const [fieldName, divisorStr] = base.split('/')
    const fieldValue = dims[fieldName] ?? resolveDerived(fieldName, dims)
    if (fieldValue == null) return '?'
    value = applyDivide(fieldValue as number, Number(divisorStr) || 1)
  } else {
    const v = dims[base]
    value = v != null ? v : derived
  }

  if (value == null || Number.isNaN(value)) return '?'

  // If there's no explicit round, default to round:0 for readability
  const ops = parts.slice(1)
  let out: string | null = null
  let rounded = false
  for (const op of ops) {
    const [name, paramStr] = op.split(':')
    const param = Number(paramStr)
    if (name === 'round') {
      out = applyRound(value, Number.isFinite(param) ? param : 0)
      rounded = true
    } else if (name === 'pad') {
      const base = out ?? applyRound(value, 0)
      out = applyPad(base, Number.isFinite(param) ? param : 0)
    }
  }
  if (out == null) {
    out = rounded ? String(value) : applyRound(value, 0)
  }
  return out
}

export function generateSize(
  formatId: string | null,
  dimensions: Record<string, number>,
): string {
  if (!formatId) return ''
  const fmt: SizeFormat | undefined = SIZE_FORMATS_BY_ID[formatId]
  if (!fmt) return ''
  return fmt.outputTemplate.replace(TOKEN_RE, (_match, inner) =>
    evaluateExpression(inner, dimensions),
  )
}

/** Size imzası — sequence scoping için */
export function buildSizeSignature(
  formatId: string | null,
  dimensions: Record<string, number>,
): string {
  const value = generateSize(formatId, dimensions)
  return value || 'no-size'
}
