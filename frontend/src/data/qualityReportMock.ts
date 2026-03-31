/**
 * qual-07 — Rapor şablonları ve önizleme gövdesi (mock).
 */

export type ReportTemplateId = 'slump_slip' | 'compressive_summary' | 'pour_report' | 'project_quality'

export type ReportTemplateDef = {
  id: ReportTemplateId
  labelKey: string
}

export const REPORT_TEMPLATE_LIST: ReportTemplateDef[] = [
  { id: 'slump_slip', labelKey: 'qualityReport.template.slumpSlip' },
  { id: 'compressive_summary', labelKey: 'qualityReport.template.compressive' },
  { id: 'pour_report', labelKey: 'qualityReport.template.pour' },
  { id: 'project_quality', labelKey: 'qualityReport.template.project' },
]

/** P2 — önizleme gövdesi (iki dil) */
export const REPORT_PREVIEW_BODY: Record<ReportTemplateId, { tr: string[]; en: string[] }> = {
  slump_slip: {
    tr: [
      'Slump fişi — taze beton konsistansı',
      'Ölçüm yeri: santral çıkış · Hava sıcaklığı kayıtlı',
      'Hedef bant: reçete ile uyumlu (mock tablo)',
    ],
    en: [
      'Slump ticket — fresh concrete consistency',
      'Measurement point: plant discharge · air temp logged',
      'Target band: aligned with recipe (mock table)',
    ],
  },
  compressive_summary: {
    tr: [
      'Basınç dayanım özeti — küp / silindir',
      'Yaş günü: 7 ve 28 · MPa sonuçları özet tablo',
      'Değerlendirme: sınıf karşılaştırması (mock)',
    ],
    en: [
      'Compressive strength summary — cube / cylinder',
      'Age days: 7 and 28 · MPa in summary table',
      'Assessment: class comparison (mock)',
    ],
  },
  pour_report: {
    tr: [
      'Döküm raporu — parti ve emir bağlantısı',
      'Santral: mikser, yükleme süresi, hacim (mock)',
      'Numune referansları: slump + laboratuvar zinciri',
    ],
    en: [
      'Pour report — batch and order linkage',
      'Plant: mixer, load time, volume (mock)',
      'Sample refs: slump + lab chain',
    ],
  },
  project_quality: {
    tr: [
      'Proje kalite özeti — dönemsel',
      'Kapsam: Metro L4 · IST-HAD (mock)',
      'Özet KPI: uygunluk oranı, açık aksiyon sayısı',
    ],
    en: [
      'Project quality summary — periodic',
      'Scope: Metro L4 · IST-HAD (mock)',
      'KPI summary: pass rate, open actions',
    ],
  },
}

export function formatMockReportNo(seq: number): string {
  const y = new Date().getFullYear()
  return `RAP-${y}-${String(seq).padStart(5, '0')}`
}
