/**
 * qual-04 — Basınç dayanımı (küp/silindir, 7/28 gün) mock.
 */

export type SpecimenShape = 'cube' | 'cylinder'

export type AgeDay = 7 | 28

export type CompressiveResultRow = {
  id: string
  sampleCode: string
  shape: SpecimenShape
  ageDay: AgeDay
  /** MPa — boş string = girilmedi */
  mpa: string
  notBroken: boolean
  invalid: boolean
}

/** Başlangıç tablosu — aynı numune için farklı yaşlar */
export const INITIAL_COMPRESSIVE_ROWS: CompressiveResultRow[] = [
  {
    id: 'cr1',
    sampleCode: 'NUM-2025-0142',
    shape: 'cube',
    ageDay: 7,
    mpa: '32.1',
    notBroken: false,
    invalid: false,
  },
  {
    id: 'cr2',
    sampleCode: 'NUM-2025-0142',
    shape: 'cube',
    ageDay: 28,
    mpa: '',
    notBroken: false,
    invalid: false,
  },
  {
    id: 'cr3',
    sampleCode: 'NUM-2025-0140',
    shape: 'cylinder',
    ageDay: 28,
    mpa: '38.4',
    notBroken: false,
    invalid: false,
  },
  {
    id: 'cr4',
    sampleCode: 'NUM-2025-0139',
    shape: 'cube',
    ageDay: 7,
    mpa: '28.9',
    notBroken: false,
    invalid: true,
  },
  {
    id: 'cr5',
    sampleCode: 'NUM-2025-0136',
    shape: 'cube',
    ageDay: 28,
    mpa: '',
    notBroken: true,
    invalid: false,
  },
]

export const MOCK_SAMPLE_LINK_OPTIONS = [
  'NUM-2025-0142',
  'NUM-2025-0141',
  'NUM-2025-0140',
  'NUM-2025-0139',
  'NUM-2025-0136',
] as const
