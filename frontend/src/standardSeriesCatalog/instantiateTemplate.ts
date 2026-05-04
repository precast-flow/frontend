import type { ProjectProduct, StandardSeriesTemplate } from '../elementIdentity/types'

export function buildProjectProductFromTemplate(
  template: StandardSeriesTemplate,
  projectId: string,
  overrides: { code?: string; name?: string },
): Omit<ProjectProduct, 'id' | 'createdAt'> {
  const code = (overrides.code ?? template.code).trim().toUpperCase()
  const name = (overrides.name ?? template.name).trim()
  return {
    projectId,
    name,
    code,
    elementTypeId: template.elementTypeId,
    typologyId: template.typologyId,
    source: 'STANDARD_LIBRARY',
    revision: 1,
    status: 'active',
    note: template.note,
    definition: template.definition,
    lifecycleStatus: template.lifecycleStatus,
    volumeM3: template.volumeM3,
    dimensions: template.dimensions ? { ...template.dimensions } : undefined,
    materials: template.materials?.map((m) => ({ ...m })),
    rebarSchedule: template.rebarSchedule?.map((r) => ({ ...r })),
    rebarSummary: template.rebarSummary ? { ...template.rebarSummary } : undefined,
    drawingRevisions: template.drawingRevisions?.map((d) => ({ ...d })),
    activities: template.activities?.map((a) => ({ ...a })),
    assemblyComponents: template.assemblyComponents?.map((a) => ({ ...a })),
  }
}
