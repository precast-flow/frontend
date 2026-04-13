/**
 * Standart öğe setleri (Standard Items Assemblies) — mock veri (eng-01…03).
 */

export type StandardAssemblyComponent = {
  id: string
  pieceMarkId: string
  description: string
  productCategory: string
  prdCode: string
  crossSection: string
  active: boolean
}

export type StandardAssembly = {
  id: string
  location: string
  itemCode: string
  description: string
  unitCode: string
  active: boolean
  components: StandardAssemblyComponent[]
}

export const SIA_LOCATIONS = [
  'CV Grand Haven (GH)',
  'CV Grands Rapids',
] as const

export const SIA_UNITS = ['EACH - Each', 'SF - Square Feet'] as const

/** Piece mark sözlüğü — seçimde alt alanlar dolar (eng-03 cascade) */
export type PieceMarkOption = {
  id: string
  label: string
  productCategory: string
  prdCode: string
  crossSection: string
  suggestedDescription?: string
}

export const PIECE_MARK_OPTIONS: PieceMarkOption[] = [
  {
    id: 'pm-ba-1205',
    label: `BA-1205 - Barrier 12'-5"`,
    productCategory: 'Barrier',
    prdCode: 'Barrier',
    crossSection: 'BAR - Barrier',
    suggestedDescription: `Barrier 12'-5"`,
  },
  {
    id: 'pm-cr-0212',
    label: 'CR-0212 - Corner unit',
    productCategory: 'Misc',
    prdCode: 'Corner',
    crossSection: 'CR - Corner',
  },
  {
    id: 'pm-bar-1200',
    label: `BAR-1200 - Barrier 12'0"`,
    productCategory: 'Barrier',
    prdCode: 'Barrier',
    crossSection: 'BAR - Barrier',
    suggestedDescription: `Barrier 12'0"`,
  },
]

function comp(
  id: string,
  pieceMarkId: string,
  description: string,
  active: boolean,
): StandardAssemblyComponent {
  const pm = PIECE_MARK_OPTIONS.find((p) => p.id === pieceMarkId) ?? PIECE_MARK_OPTIONS[0]!
  return {
    id,
    pieceMarkId,
    description,
    productCategory: pm.productCategory,
    prdCode: pm.prdCode,
    crossSection: pm.crossSection,
    active,
  }
}

/** Liste + detay çapraz tutarlılık: BAR-1200 / Barrier 12'0" */
const baseStandardAssemblies: StandardAssembly[] = [
  {
    id: 'sia-1',
    location: 'CV Grand Haven (GH)',
    itemCode: 'BAR-1200',
    description: `Barrier 12'0"`,
    unitCode: 'EACH - Each',
    active: true,
    components: [comp('c1', 'pm-ba-1205', '', true)],
  },
  {
    id: 'sia-2',
    location: 'CV Grands Rapids',
    itemCode: 'BA-1205',
    description: 'Barrier section A',
    unitCode: 'EACH - Each',
    active: true,
    components: [],
  },
  {
    id: 'sia-3',
    location: 'CV Grand Haven (GH)',
    itemCode: 'CR-0212',
    description: 'Corner standard',
    unitCode: 'SF - Square Feet',
    active: false,
    components: [],
  },
  {
    id: 'sia-4',
    location: 'CV Grands Rapids',
    itemCode: 'MS-9001',
    description: 'Misc embed kit',
    unitCode: 'EACH - Each',
    active: true,
    components: [],
  },
  {
    id: 'sia-5',
    location: 'CV Grand Haven (GH)',
    itemCode: 'RB-3300',
    description: 'Rebar bundle 33ft',
    unitCode: 'EACH - Each',
    active: true,
    components: [],
  },
  {
    id: 'sia-6',
    location: 'CV Grands Rapids',
    itemCode: 'ST-4402',
    description: 'Strand pack',
    unitCode: 'EACH - Each',
    active: true,
    components: [],
  },
  {
    id: 'sia-7',
    location: 'CV Grand Haven (GH)',
    itemCode: 'IN-2100',
    description: 'Insert set 21mm',
    unitCode: 'SF - Square Feet',
    active: false,
    components: [],
  },
  {
    id: 'sia-8',
    location: 'CV Grands Rapids',
    itemCode: 'LL-1002',
    description: 'Lifting loop type 2',
    unitCode: 'EACH - Each',
    active: true,
    components: [],
  },
  {
    id: 'sia-9',
    location: 'CV Grand Haven (GH)',
    itemCode: 'AK-500',
    description: 'Assembly kit 500',
    unitCode: 'EACH - Each',
    active: true,
    components: [],
  },
  {
    id: 'sia-10',
    location: 'CV Grands Rapids',
    itemCode: 'BR-0800',
    description: 'Barrier 8ft',
    unitCode: 'EACH - Each',
    active: true,
    components: [],
  },
  {
    id: 'sia-11',
    location: 'CV Grand Haven (GH)',
    itemCode: 'PD-1200',
    description: 'Panel default 12ft',
    unitCode: 'SF - Square Feet',
    active: true,
    components: [],
  },
  {
    id: 'sia-12',
    location: 'CV Grands Rapids',
    itemCode: 'ZZ-9999',
    description: 'Reserved code',
    unitCode: 'EACH - Each',
    active: false,
    components: [],
  },
]

/** Sayfa başına 50 satır ile ikinci sayfayı gösterebilmek için ek mock satırlar (eng-01). */
const extraRows: StandardAssembly[] = Array.from({ length: 48 }, (_, i) => {
  const n = i + 1
  const loc = n % 2 === 0 ? SIA_LOCATIONS[1]! : SIA_LOCATIONS[0]!
  return {
    id: `sia-x-${n}`,
    location: loc,
    itemCode: `GEN-${String(1000 + n).padStart(4, '0')}`,
    description: `Generated mock ${n}`,
    unitCode: n % 3 === 0 ? 'SF - Square Feet' : 'EACH - Each',
    active: n % 5 !== 0,
    components: [],
  }
})

export const initialStandardAssemblies: StandardAssembly[] = [...baseStandardAssemblies, ...extraRows]

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
