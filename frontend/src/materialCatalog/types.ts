/**
 * Firma malzeme kataloğu — prefabrik BOM / donatı seçimleri için dinamik tanımlar.
 */

export type MaterialCategory =
  | 'concrete'
  | 'rebar'
  | 'prestress'
  | 'hardware'
  | 'insulation'
  | 'sleeve'
  | 'plate'
  | 'profile'
  | 'bolt'
  | 'custom'

export type FieldType = 'number' | 'text' | 'select' | 'bool'

export type FieldDef = {
  id: string
  label: string
  type: FieldType
  unit?: string
  /** type === 'select' için */
  options?: string[]
  required: boolean
  order: number
}

export type MaterialDef = {
  id: string
  name: string
  code: string
  category: MaterialCategory
  description?: string
  fields: FieldDef[]
  /** Sistem ön tanımları silinemez */
  readonly?: boolean
  createdAt: string
  updatedAt: string
}

/** Ürün BOM satırında katalogdan doldurulan değerler */
export type MaterialInstanceValues = Record<string, string | number | boolean>

export type MaterialInstance = {
  defId: string
  values: MaterialInstanceValues
}

/** Donatı şekil sınıflandırması (BS 8666 / pratik prefabrik) */
export type CatalogRebarShapeType =
  | 'straight'
  | 'stirrup'
  | 'hook'
  | 'l_bar'
  | 'u_bar'
  | 'crank'
  | 'custom'

export type MaterialCatalogState = {
  materials: MaterialDef[]
}
