/**
 * Üretim hazırlık skoru — ağırlıklar (toplam 1.0):
 * - dosyalar: 0.22 — PDF + DWG varlığı; IFC satırı ayrı risk (skora küçük bonus/ceza)
 * - manuel kritik: 0.23 — beton sınıfı + tolerans metni
 * - manuel opsiyonel: 0.07 — uyarı bayrakları (bilinçli onay)
 * - checklist: 0.35 — kritik maddeler ağırlıklı
 * - iş akışı: 0.13 — Taslak < İncelemede < Onaylı < Üretim oluşturuldu
 */
import type { OkanEngJob, OkanFile } from './engineeringIntegrationOkanMock'
import { CHECKLIST_ITEMS_OKAN } from './engineeringIntegrationOkanMock'

export type ReadinessLevel = 'red' | 'yellow' | 'green'

const W_FILES = 0.22
const W_MANUAL_CRIT = 0.23
const W_MANUAL_OPT = 0.07
const W_CHECK = 0.35
const W_FLOW = 0.13

function fileScore(files: OkanFile[]): number {
  const hasPdf = files.some((f) => f.fileType.toUpperCase() === 'PDF')
  const hasDwg = files.some((f) => f.fileType.toUpperCase() === 'DWG' || f.name.toLowerCase().endsWith('.dwg'))
  let base = 0
  if (hasPdf) base += 0.45
  if (hasDwg) base += 0.45
  if (!hasPdf && !hasDwg && files.length > 0) base += 0.35
  const hasIfc = files.some((f) => f.fileType.toUpperCase() === 'IFC')
  if (hasIfc) {
    const unprocessed = files.some(
      (f) => f.fileType.toUpperCase() === 'IFC' && f.integrationStatus !== 'hazir',
    )
    if (unprocessed) base -= 0.12
    else base += 0.1
  }
  return Math.max(0, Math.min(1, base))
}

function manualCriticalScore(job: OkanEngJob): number {
  const concrete = job.manual.concrete.trim().length >= 2
  const tol = job.manual.toleranceNote.trim().length >= 3
  return (concrete ? 0.55 : 0) + (tol ? 0.45 : 0)
}

function manualOptionalScore(job: OkanEngJob): number {
  if (job.manual.warnAnchorage || job.manual.warnFatigue) return 1
  return 0.65
}

function checklistScore(checklist: Record<string, boolean>): number {
  const critical = CHECKLIST_ITEMS_OKAN.filter((c) => c.critical)
  const optional = CHECKLIST_ITEMS_OKAN.filter((c) => !c.critical)
  const critDone = critical.filter((c) => checklist[c.id]).length / Math.max(1, critical.length)
  const optDone = optional.filter((c) => checklist[c.id]).length / Math.max(1, optional.length)
  return critDone * 0.72 + optDone * 0.28
}

function workflowScore(wf: OkanEngJob['workflow']): number {
  switch (wf) {
    case 'draft':
      return 0.22
    case 'in_review':
      return 0.52
    case 'approved':
      return 0.88
    case 'production_created':
      return 1
    default:
      return 0
  }
}

export function computeReadinessPercent(job: OkanEngJob): number {
  const f = fileScore(job.files)
  const mc = manualCriticalScore(job)
  const mo = manualOptionalScore(job)
  const ck = checklistScore(job.checklist)
  const fl = workflowScore(job.workflow)
  const raw =
    W_FILES * f + W_MANUAL_CRIT * mc + W_MANUAL_OPT * mo + W_CHECK * ck + W_FLOW * fl
  return Math.round(Math.max(0, Math.min(100, raw * 100)))
}

export function hasCriticalChecklistGap(checklist: Record<string, boolean>): boolean {
  return CHECKLIST_ITEMS_OKAN.some((c) => c.critical && !checklist[c.id])
}

export function deriveReadinessLevel(score: number, job: OkanEngJob): ReadinessLevel {
  const criticalGap = hasCriticalChecklistGap(job.checklist)
  const hasIfcRisk = job.files.some(
    (f) => f.fileType.toUpperCase() === 'IFC' && f.integrationStatus !== 'hazir',
  )
  const toleranceEmpty = job.manual.toleranceNote.trim().length < 3
  const lockedInProduction = job.files.some((f) => f.locked)

  if (criticalGap || score < 42) return 'red'
  if (score < 78 || hasIfcRisk || toleranceEmpty || lockedInProduction) return 'yellow'
  return 'green'
}

export function countChecklistDone(checklist: Record<string, boolean>): { done: number; total: number } {
  const total = CHECKLIST_ITEMS_OKAN.length
  const done = CHECKLIST_ITEMS_OKAN.filter((c) => checklist[c.id]).length
  return { done, total }
}
