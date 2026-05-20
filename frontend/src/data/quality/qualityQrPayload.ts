const INPUT_MATERIAL_PREFIX = 'pf://quality/input-material/'

export function buildInputMaterialQrPayload(inputMaterialId: string): string {
  return `${INPUT_MATERIAL_PREFIX}${encodeURIComponent(inputMaterialId)}`
}

export function parseInputMaterialQrPayload(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed.startsWith(INPUT_MATERIAL_PREFIX)) {
    try {
      return decodeURIComponent(trimmed.slice(INPUT_MATERIAL_PREFIX.length))
    } catch {
      return trimmed.slice(INPUT_MATERIAL_PREFIX.length) || null
    }
  }
  if (/^im-[a-z0-9-]+$/i.test(trimmed)) return trimmed
  return null
}
