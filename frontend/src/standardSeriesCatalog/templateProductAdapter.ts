import type { ProjectProduct, StandardSeriesTemplate } from '../elementIdentity/types'

const TEMPLATE_PATCH_KEYS: (keyof ProjectProduct)[] = [
  'name',
  'code',
  'elementTypeId',
  'typologyId',
  'note',
  'definition',
  'lifecycleStatus',
  'volumeM3',
  'dimensions',
  'materials',
  'rebarSchedule',
  'rebarSummary',
  'drawingRevisions',
  'activities',
]

/** Ürün sekmelerinde kullanılmak üzere şablonu geçici ProjectProduct şekline çevirir */
export function templateToProductForEditor(t: StandardSeriesTemplate): ProjectProduct {
  return {
    id: t.id,
    projectId: '__standard_series_template__',
    name: t.name,
    code: t.code,
    elementTypeId: t.elementTypeId,
    typologyId: t.typologyId,
    source: 'MANUAL',
    revision: 1,
    status: 'active',
    createdAt: t.updatedAt ?? new Date().toISOString(),
    note: t.note,
    definition: t.definition,
    lifecycleStatus: t.lifecycleStatus,
    volumeM3: t.volumeM3,
    dimensions: t.dimensions,
    materials: t.materials,
    rebarSchedule: t.rebarSchedule,
    rebarSummary: t.rebarSummary,
    drawingRevisions: t.drawingRevisions,
    activities: t.activities,
  }
}

export function mergeTemplateFromProductPartial(
  prev: StandardSeriesTemplate,
  partial: Partial<ProjectProduct>,
): StandardSeriesTemplate {
  let next: StandardSeriesTemplate = { ...prev, updatedAt: new Date().toISOString() }
  for (const k of TEMPLATE_PATCH_KEYS) {
    if (k in partial && partial[k] !== undefined) {
      next = { ...next, [k]: partial[k] } as StandardSeriesTemplate
    }
  }
  return next
}
