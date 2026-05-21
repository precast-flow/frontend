import * as XLSX from 'xlsx'
import {
  INPUT_MATERIAL_QUALITY_PLAN_NO,
  KK_PL01_QUALITY_PLAN_ROWS,
  specValuesForMaterialType,
  type InputMaterialQualityPlanRow,
} from './inputMaterialQualityPlanKKPL01'
import type {
  ConcreteRecipe,
  InputMaterialStatus,
  InputMaterialType,
  LabTest,
  QualityInputMaterial,
  QualitySupplierOption,
} from './qualityManagementTypes'
import type { InputMaterialDraft } from '../../context/QualityManagementContext'

export type QualityExcelModule = 'input_materials' | 'concrete_recipes' | 'lab_tests'

const SHEET_DATA = 'Veriler'
const SHEET_PLAN = 'KK-PL-01 Plan'
const SHEET_TEMPLATE = 'Şablon'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function workbookToFile(wb: XLSX.WorkBook, filename: string) {
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  downloadBlob(
    new Blob([out], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    filename,
  )
}

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]/g, '')
}

const INPUT_HEADER_MAP: Record<string, keyof InputMaterialDraft | 'supplierCode' | 'supplierNameLookup'> = {
  malzemeturu: 'materialType',
  materialtype: 'materialType',
  malzemeadi: 'name',
  name: 'name',
  sistemmalzemekodu: 'systemMaterialCode',
  systemmaterialcode: 'systemMaterialCode',
  firmakodu: 'supplierCode',
  suppliercode: 'supplierCode',
  tedarikcikodu: 'supplierCode',
  tedarikcifirmakodu: 'supplierCode',
  supplierid: 'supplierId',
  tedarikciid: 'supplierId',
  tedarikcifirma: 'supplierId',
  tedarikcifirmaadi: 'supplierNameLookup',
  tedarikcifirmadi: 'supplierNameLookup',
  suppliername: 'supplierNameLookup',
  malzemeyisaglayanfirma: 'supplierNameLookup',
  firmaurunkodu: 'supplierMaterialCode',
  tedarikciurunkodu: 'supplierMaterialCode',
  suppliermaterialcode: 'supplierMaterialCode',
  capolcu: 'diameterOrSize',
  diameterorsize: 'diameterOrSize',
  kalitesinifi: 'qualityClass',
  qualityclass: 'qualityClass',
  partilotno: 'lotNo',
  lotno: 'lotNo',
  sertifikano: 'certificateNo',
  certificateno: 'certificateNo',
  giristarihi: 'entryDate',
  entrydate: 'entryDate',
  miktar: 'quantity',
  quantity: 'quantity',
  birim: 'unit',
  unit: 'unit',
  aciklama: 'description',
  description: 'description',
  durum: 'status',
  status: 'status',
}

const MATERIAL_TYPE_ALIASES: Record<string, InputMaterialType> = {
  rebar: 'rebar',
  demir: 'rebar',
  donati: 'rebar',
  mesh: 'mesh',
  hasir: 'mesh',
  celikhasir: 'mesh',
  prestress: 'prestress',
  ongermeli: 'prestress',
  accessory: 'accessory',
  yardimci: 'accessory',
  cement: 'cement',
  cimento: 'cement',
  aggregate: 'aggregate',
  agrega: 'aggregate',
  powder_paint: 'powder_paint',
  tozboya: 'powder_paint',
  form_oil: 'form_oil',
  kalipyagi: 'form_oil',
  chemical_admixture: 'chemical_admixture',
  kimyasalkatki: 'chemical_admixture',
  steel_form: 'steel_form',
  celikkalip: 'steel_form',
  other: 'other',
  diger: 'other',
}

const STATUS_ALIASES: Record<string, InputMaterialStatus> = {
  active: 'active',
  aktif: 'active',
  kullanimda: 'active',
  inactive: 'inactive',
  pasif: 'inactive',
  kullanimdisi: 'inactive',
  quarantine: 'quarantine',
  karantina: 'quarantine',
  consumed: 'consumed',
  tukendi: 'consumed',
  rejected: 'rejected',
  red: 'rejected',
}

function planRowsToSheet(): Record<string, string>[] {
  return KK_PL01_QUALITY_PLAN_ROWS.map((r) => ({
    'Plan No': r.planNo,
    'Malzeme Grubu': r.materialCategory,
    'Kontrol Özelliği': r.characteristic,
    'Muayene Türü': r.inspectionType,
    Doküman: r.documentRef,
    'Cihaz/Metod': r.equipmentMethod,
    'Kontrol Sıklığı': r.controlFrequency,
    'Kabul Kriteri': r.acceptanceCriteria,
    'Muayene Sorumlusu': r.inspectorRole,
    'Kalite Kayıtları': r.qualityRecords,
    'Problem Halinde': r.onProblem ?? '',
  }))
}

export function exportInputMaterialsExcel(
  materials: QualityInputMaterial[],
  suppliers: QualitySupplierOption[],
  filename = 'girdi-malzeme-listesi.xlsx',
) {
  const supplierById = new Map(suppliers.map((s) => [s.id, s]))
  const rows = materials.map((m) => ({
    'Malzeme Türü': m.materialType,
    'Malzeme Adı': m.name,
    'Sistem Malzeme Kodu': m.systemMaterialCode,
    'Tedarikçi Kodu': supplierById.get(m.supplierId)?.code ?? m.supplierId,
    'Tedarikçi Firma Adı': supplierById.get(m.supplierId)?.name ?? '',
    'Tedarikçi Ürün Kodu': m.supplierMaterialCode,
    'Çap/Ölçü': m.diameterOrSize,
    'Kalite Sınıfı': m.qualityClass,
    'Parti/Lot No': m.lotNo,
    'Sertifika No': m.certificateNo,
    'Giriş Tarihi': m.entryDate,
    Miktar: m.quantity,
    Birim: m.unit,
    Açıklama: m.description ?? '',
    Durum: m.status,
    'KK-PL-01': m.qualityPlanRef ?? INPUT_MATERIAL_QUALITY_PLAN_NO,
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), SHEET_DATA)
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planRowsToSheet()), SHEET_PLAN)
  workbookToFile(wb, filename)
}

export function downloadInputMaterialTemplateExcel(
  filename = 'girdi-malzeme-sablon.xlsx',
) {
  const example: Record<string, string | number>[] = [
    {
      'Malzeme Türü': 'rebar',
      'Malzeme Adı': 'B500C Ø12 nervürlü',
      'Sistem Malzeme Kodu': 'DON-500-12',
      'Tedarikçi Kodu': 'TD-YURT',
      'Tedarikçi Firma Adı': 'Yurtiçi Demir Çelik A.Ş.',
      'Tedarikçi Ürün Kodu': 'YT-B500-12-2026',
      'Çap/Ölçü': 'Ø12 mm',
      'Kalite Sınıfı': 'B500C',
      'Parti/Lot No': 'LOT-ÖRNEK',
      'Sertifika No': 'SRF-00000',
      'Giriş Tarihi': new Date().toISOString().slice(0, 10),
      Miktar: 10,
      Birim: 'ton',
      Açıklama: 'Örnek satır — silip kendi kayıtlarınızı ekleyin',
      Durum: 'active',
      'KK-PL-01': INPUT_MATERIAL_QUALITY_PLAN_NO,
    },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(example), SHEET_TEMPLATE)
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planRowsToSheet()), SHEET_PLAN)
  workbookToFile(wb, filename)
}

export type ParsedInputMaterialRow = {
  rowIndex: number
  draft: InputMaterialDraft
  errors: string[]
}

export function parseInputMaterialsExcel(
  file: ArrayBuffer,
  suppliers: QualitySupplierOption[],
): ParsedInputMaterialRow[] {
  const wb = XLSX.read(file, { type: 'array' })
  const sheetName =
    wb.SheetNames.find((n) => n === SHEET_DATA || n === SHEET_TEMPLATE) ?? wb.SheetNames[0]
  if (!sheetName) return []
  const sheet = wb.Sheets[sheetName]
  if (!sheet) return []
  const table = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
  const supplierByCode = new Map(suppliers.map((s) => [s.code.toLowerCase(), s.id]))
  const supplierById = new Map(suppliers.map((s) => [s.id, s.id]))
  const supplierByName = new Map(suppliers.map((s) => [s.name.toLowerCase(), s.id]))

  return table.map((raw, idx) => {
    const errors: string[] = []
    const draft: InputMaterialDraft = {
      materialType: 'rebar',
      name: '',
      systemMaterialCode: '',
      supplierId: '',
      supplierMaterialCode: '',
      diameterOrSize: '',
      qualityClass: '',
      lotNo: '',
      certificateNo: '',
      entryDate: new Date().toISOString().slice(0, 10),
      quantity: 0,
      unit: 'ton',
      description: '',
      status: 'active',
      qualityPlanRef: INPUT_MATERIAL_QUALITY_PLAN_NO,
    }

    for (const [key, val] of Object.entries(raw)) {
      const field = INPUT_HEADER_MAP[normalizeHeader(key)]
      if (!field) continue
      const str = String(val ?? '').trim()
      if (field === 'supplierCode') {
        const id = supplierByCode.get(str.toLowerCase()) ?? supplierById.get(str)
        if (id) draft.supplierId = id
        else if (str) errors.push(`Tedarikçi kodu bulunamadı: ${str}`)
        continue
      }
      if (field === 'supplierNameLookup') {
        const id = supplierByName.get(str.toLowerCase())
        if (id) draft.supplierId = id
        else if (str) errors.push(`Tedarikçi firma adı bulunamadı: ${str}`)
        continue
      }
      if (field === 'materialType') {
        const t = MATERIAL_TYPE_ALIASES[normalizeHeader(str)] ?? (str as InputMaterialType)
        if (MATERIAL_TYPE_ALIASES[normalizeHeader(str)] || str) draft.materialType = t
        continue
      }
      if (field === 'status') {
        draft.status = STATUS_ALIASES[normalizeHeader(str)] ?? (str as InputMaterialStatus) ?? 'active'
        continue
      }
      if (field === 'quantity') {
        draft.quantity = Number(str) || 0
        continue
      }
      if (field in draft) {
        ;(draft as Record<string, unknown>)[field] = str
      }
    }

    if (!draft.supplierMaterialCode.trim()) errors.push('Tedarikçi ürün kodu zorunlu')
    if (!draft.name.trim()) errors.push('Malzeme adı zorunlu')
    if (!draft.systemMaterialCode.trim()) errors.push('Sistem kodu zorunlu')
    if (!draft.supplierId) errors.push('Tedarikçi firma seçimi zorunlu')
    draft.specValues = specValuesForMaterialType(draft.materialType)

    return { rowIndex: idx + 2, draft, errors }
  })
}

export function exportConcreteRecipesExcel(
  recipes: ConcreteRecipe[],
  filename = 'beton-receteleri.xlsx',
) {
  const rows = recipes.map((r) => ({
    'Reçete Kodu': r.recipeCode,
    'Beton Sınıfı': r.strengthClass,
    'Kullanım Amacı': r.usagePurpose,
    'Hedef Dayanım': r.targetStrength,
    'Kıvam/Slump': r.slump,
    'Çimento Tipi': r.cementType,
    'Çimento (kg)': r.cementKg,
    'Su (kg)': r.waterKg,
    'Su/Çimento': r.waterCementRatio,
    Agregalar: r.aggregates.map((a) => `${a.name} ${a.quantityKg}kg`).join('; '),
    Katkılar: r.admixtures.map((a) => `${a.name} ${a.dosagePerM3}${a.unit}`).join('; '),
    Durum: r.status,
    Versiyon: r.version,
    Açıklama: r.description ?? '',
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), SHEET_DATA)
  workbookToFile(wb, filename)
}

export function exportLabTestsExcel(tests: LabTest[], filename = 'laboratuvar-testleri.xlsx') {
  const rows = tests.map((t) => ({
    'Test Kodu': t.testCode,
    'Test Tipi': t.testTypeId,
    'Test Tarihi': t.testDate,
    Laboratuvar: t.laboratory,
    Sorumlu: t.responsible,
    'Sonuç Durumu': t.resultStatus,
    'Geçerlilik Başlangıç': t.validityStartDate,
    'Geçerlilik Bitiş': t.validityEndDate,
    'Bağlı Malzeme': t.links.materialId ?? '',
    'Bağlı Reçete': t.links.recipeId ?? '',
    'Bağlı Numune': t.links.sampleId ?? '',
    'Bağlı Emir': t.links.workOrderId ?? '',
    'Bağlı Proje': t.links.projectId ?? '',
    Notlar: t.notes ?? '',
    Sertifika: t.certificateRef ?? '',
    'Analiz Sonuçları': t.results.map((r) => `${r.label}:${r.value}`).join('; '),
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), SHEET_DATA)
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planRowsToSheet()), SHEET_PLAN)
  workbookToFile(wb, filename)
}

export function exportQualityPlanExcel(filename = 'KK-PL-01-girdi-malzeme-kalite-plani.xlsx') {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planRowsToSheet()), SHEET_PLAN)
  workbookToFile(wb, filename)
}

export type QualityPlanRow = InputMaterialQualityPlanRow

export { KK_PL01_QUALITY_PLAN_ROWS, INPUT_MATERIAL_QUALITY_PLAN_NO }
