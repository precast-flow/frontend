import type { SizeFormat } from '../types'

/**
 * SIZE token üretimi için format kataloğu.
 *
 * Template DSL (basit mustache-like):
 *   - {fieldName}            → dimension değeri (mm)
 *   - {fieldName/1000}       → mm → m
 *   - {fieldName/10}         → mm → cm
 *   - {fieldName|round:0}    → yuvarlama
 *   - {fieldName|pad:3}      → sol sıfır doldurma
 *   - Literal karakterler (-, x, D, H, _) direkt yazılır.
 *
 * Imperial Çift T için özel token:
 *   - {widthFeet}   → mm → feet (round)
 *   - {depthInches} → mm → inch (round)
 */

export const SIZE_FORMATS: SizeFormat[] = [
  {
    id: 'length_m',
    nameTr: 'Uzunluk (metre)',
    nameEn: 'Length (m)',
    inputs: ['height'],
    outputTemplate: '{height/1000|round:0}',
    unitSystem: 'metric',
    examples: [{ input: { height: 5000 }, output: '5' }],
  },
  {
    id: 'length_cm',
    nameTr: 'Uzunluk (cm)',
    nameEn: 'Length (cm)',
    inputs: ['height'],
    outputTemplate: '{height/10|round:0}',
    unitSystem: 'metric',
    examples: [{ input: { height: 5000 }, output: '500' }],
  },
  {
    id: 'length_mm',
    nameTr: 'Uzunluk (mm)',
    nameEn: 'Length (mm)',
    inputs: ['height'],
    outputTemplate: '{height|round:0}',
    unitSystem: 'metric',
    examples: [{ input: { height: 5000 }, output: '5000' }],
  },
  {
    id: 'section_wxh',
    nameTr: 'Kesit W×H (cm)',
    nameEn: 'Section W×H (cm)',
    inputs: ['sectionWidth', 'sectionDepth'],
    outputTemplate: '{sectionWidth/10|round:0}x{sectionDepth/10|round:0}',
    unitSystem: 'metric',
    examples: [{ input: { sectionWidth: 400, sectionDepth: 400 }, output: '40x40' }],
  },
  {
    id: 'section_wxh_mm',
    nameTr: 'Kesit W×H (mm)',
    nameEn: 'Section W×H (mm)',
    inputs: ['sectionWidth', 'sectionDepth'],
    outputTemplate: '{sectionWidth}x{sectionDepth}',
    unitSystem: 'metric',
  },
  {
    id: 'diameter_cm',
    nameTr: 'Çap (cm)',
    nameEn: 'Diameter (cm)',
    inputs: ['diameter'],
    outputTemplate: 'D{diameter/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'length_cm_section_cm',
    nameTr: 'Uzunluk + Kesit (cm)',
    nameEn: 'Length + Section (cm)',
    inputs: ['height', 'sectionWidth', 'sectionDepth'],
    outputTemplate: '{height/10|round:0}-{sectionWidth/10|round:0}x{sectionDepth/10|round:0}',
    unitSystem: 'metric',
    examples: [
      { input: { height: 5000, sectionWidth: 400, sectionDepth: 400 }, output: '500-40x40' },
    ],
  },
  {
    id: 'length_m_section_cm',
    nameTr: 'Uzunluk (m) + Kesit (cm)',
    nameEn: 'Length (m) + Section (cm)',
    inputs: ['height', 'sectionWidth', 'sectionDepth'],
    outputTemplate: '{height/1000|round:0}-{sectionWidth/10|round:0}x{sectionDepth/10|round:0}',
    unitSystem: 'metric',
    examples: [
      { input: { height: 5000, sectionWidth: 400, sectionDepth: 400 }, output: '5-40x40' },
    ],
  },
  {
    id: 'length_m_diameter_cm',
    nameTr: 'Uzunluk (m) + Çap (cm)',
    nameEn: 'Length (m) + Diameter (cm)',
    inputs: ['height', 'diameter'],
    outputTemplate: '{height/1000|round:0}-D{diameter/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'span_cm',
    nameTr: 'Açıklık (cm)',
    nameEn: 'Span (cm)',
    inputs: ['span'],
    outputTemplate: '{span/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'span_m',
    nameTr: 'Açıklık (m)',
    nameEn: 'Span (m)',
    inputs: ['span'],
    outputTemplate: '{span/1000|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'span_cm_section',
    nameTr: 'Açıklık + Kesit (cm)',
    nameEn: 'Span + Section (cm)',
    inputs: ['span', 'width', 'height'],
    outputTemplate: '{span/10|round:0}-{width/10|round:0}x{height/10|round:0}',
    unitSystem: 'metric',
    examples: [
      { input: { span: 12000, width: 300, height: 600 }, output: '1200-30x60' },
    ],
  },
  {
    id: 'length_height',
    nameTr: 'Uzunluk + Yükseklik (cm)',
    nameEn: 'Length + Height (cm)',
    inputs: ['length', 'height'],
    outputTemplate: '{length/10|round:0}-{height/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'length_height_thickness',
    nameTr: 'Duvar / Panel boyutu',
    nameEn: 'Wall / Panel Size',
    inputs: ['length', 'height', 'thickness'],
    outputTemplate: '{length/10|round:0}-{height/10|round:0}-{thickness/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'length_height_thickness_total',
    nameTr: 'Sandviç Panel Toplam',
    nameEn: 'Sandwich Panel Total',
    inputs: ['length', 'height', 'innerThickness', 'coreThickness', 'outerThickness'],
    outputTemplate:
      '{length/10|round:0}-{height/10|round:0}-{totalThickness/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'length_cm_thickness_cm',
    nameTr: 'Hollow Core Döşeme',
    nameEn: 'Hollow Core Slab',
    inputs: ['length', 'thickness'],
    outputTemplate: '{length/10|round:0}-{thickness/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'dt_eu_format',
    nameTr: 'Çift T (EU metrik)',
    nameEn: 'Double-T (EU metric)',
    inputs: ['length', 'width', 'depth'],
    outputTemplate: '{length/10|round:0}-{width/10|round:0}-{depth/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'dt_us_format',
    nameTr: 'Çift T (US PCI)',
    nameEn: 'Double-T (US PCI)',
    inputs: ['width', 'depth'],
    outputTemplate: '{widthFeet}DT{depthInches}',
    unitSystem: 'imperial',
  },
  {
    id: 'run_rise_width',
    nameTr: 'Merdiven (run-rise-width, cm)',
    nameEn: 'Stair (run-rise-width, cm)',
    inputs: ['totalRun', 'totalRise', 'width'],
    outputTemplate: '{totalRun/10|round:0}-{totalRise/10|round:0}-{width/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'l_stair_format',
    nameTr: 'L / U Merdiven',
    nameEn: 'L / U Stair',
    inputs: ['runA', 'runB', 'totalRise', 'width'],
    outputTemplate:
      '{runA/10|round:0}-{runB/10|round:0}-{totalRise/10|round:0}-{width/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'spiral_dia_rise',
    nameTr: 'Helezon Merdiven',
    nameEn: 'Spiral Stair',
    inputs: ['outerDiameter', 'totalRise'],
    outputTemplate: 'D{outerDiameter/10|round:0}-H{totalRise/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'projection_wxh',
    nameTr: 'Konsol boyutu',
    nameEn: 'Corbel size',
    inputs: ['projection', 'width', 'height'],
    outputTemplate: '{projection/10|round:0}-{width/10|round:0}x{height/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'socket_full',
    nameTr: 'Soket tam',
    nameEn: 'Socket full',
    inputs: [
      'outerLength',
      'outerWidth',
      'totalHeight',
      'socketLength',
      'socketWidth',
      'socketDepth',
    ],
    outputTemplate:
      '{outerLength/10|round:0}-{outerWidth/10|round:0}-{totalHeight/10|round:0}_{socketLength/10|round:0}-{socketWidth/10|round:0}-{socketDepth/10|round:0}',
    unitSystem: 'metric',
  },
  {
    id: 'extrusion_legs',
    nameTr: 'L/U Profil Duvar',
    nameEn: 'L/U Profile Wall',
    inputs: ['extrusionHeight', 'legA', 'legB'],
    outputTemplate: '{extrusionHeight/10|round:0}-{legA/10|round:0}-{legB/10|round:0}',
    unitSystem: 'metric',
  },
]

export const SIZE_FORMATS_BY_ID: Record<string, SizeFormat> = Object.fromEntries(
  SIZE_FORMATS.map((f) => [f.id, f]),
)

/** Tablolarda gösterilecek kısa format kodu (katalog `id` türevi). */
export function sizeFormatCatalogCode(formatId: string): string {
  if (!formatId) return '—'
  return formatId
    .split('_')
    .map((seg) => (seg[0] ? seg[0].toUpperCase() : ''))
    .join('')
}
