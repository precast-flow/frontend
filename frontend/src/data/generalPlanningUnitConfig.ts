import type { PlanStatusKey } from './planningDesignMock'
import type { PlanningUnitKey } from './generalPlanningMock'

export type PlanningToolbarActionId =
  | 'filters'
  | 'queue'
  | 'undo'
  | 'redo'
  | 'history'
  | 'save'
  | 'publish'

export type PlanningFilterType = 'search' | 'resource' | 'status' | 'workdays'

export type PlanningUnitConfig = {
  unit: PlanningUnitKey
  resourceColumnLabelKey: string
  filterResourceLabelKey: string
  statusOptions: PlanStatusKey[]
  filters: PlanningFilterType[]
  toolbarActions: PlanningToolbarActionId[]
  queueEnabled: boolean
  summaryUsesSteel: boolean
  /** false → takvimde gün sütunları (sabah/öğle/gece yok); varsayılan true */
  timelineUsesShifts?: boolean
}

const ALL_STATUSES: PlanStatusKey[] = [
  'PLANNED',
  'ORDERED_DESIGN',
  'IN_PROGRESS',
  'PRODUCED_OK',
  'HOLD_UNCERTAIN',
  'ISSUE_REWORK',
  'CANCELLED',
  'SCRAP',
]

const BASE_TOOLBAR: PlanningToolbarActionId[] = [
  'filters',
  'queue',
  'undo',
  'redo',
  'history',
  'save',
  'publish',
]

const OPS_TOOLBAR: PlanningToolbarActionId[] = ['filters', 'queue', 'undo', 'redo', 'history']

/** Genel planlama araç çubuğunda gösterilen birimler (koordinasyon / «Planlama» sekmesi hariç). */
export const GENERAL_PLANNING_UI_UNITS = ['production', 'dispatch', 'assembly'] as const satisfies readonly PlanningUnitKey[]

export const GENERAL_PLANNING_UNIT_CONFIGS: Record<PlanningUnitKey, PlanningUnitConfig> = {
  planning: {
    unit: 'planning',
    resourceColumnLabelKey: 'generalPlanning.column.mold',
    filterResourceLabelKey: 'generalPlanning.filter.mold',
    statusOptions: ALL_STATUSES,
    filters: ['search', 'resource', 'status', 'workdays'],
    toolbarActions: BASE_TOOLBAR,
    queueEnabled: true,
    summaryUsesSteel: true,
  },
  production: {
    unit: 'production',
    resourceColumnLabelKey: 'generalPlanning.column.mold',
    filterResourceLabelKey: 'generalPlanning.filter.mold',
    statusOptions: ['PLANNED', 'ORDERED_DESIGN', 'IN_PROGRESS', 'PRODUCED_OK', 'HOLD_UNCERTAIN', 'ISSUE_REWORK'],
    filters: ['search', 'resource', 'status', 'workdays'],
    toolbarActions: OPS_TOOLBAR,
    queueEnabled: true,
    summaryUsesSteel: true,
  },
  dispatch: {
    unit: 'dispatch',
    resourceColumnLabelKey: 'generalPlanning.column.vehicle',
    filterResourceLabelKey: 'generalPlanning.filter.vehicle',
    statusOptions: ['PLANNED', 'IN_PROGRESS', 'PRODUCED_OK', 'HOLD_UNCERTAIN', 'CANCELLED'],
    filters: ['search', 'resource', 'status', 'workdays'],
    toolbarActions: OPS_TOOLBAR,
    queueEnabled: true,
    summaryUsesSteel: false,
    timelineUsesShifts: false,
  },
  assembly: {
    unit: 'assembly',
    resourceColumnLabelKey: 'generalPlanning.column.line',
    filterResourceLabelKey: 'generalPlanning.filter.line',
    statusOptions: ['PLANNED', 'IN_PROGRESS', 'PRODUCED_OK', 'HOLD_UNCERTAIN', 'ISSUE_REWORK'],
    filters: ['search', 'resource', 'status', 'workdays'],
    toolbarActions: OPS_TOOLBAR,
    queueEnabled: true,
    summaryUsesSteel: false,
  },
}

export function getUnitConfig(unit: PlanningUnitKey): PlanningUnitConfig {
  return GENERAL_PLANNING_UNIT_CONFIGS[unit]
}

/** İzin → toolbar aksiyon görünürlüğü */
export const TOOLBAR_ACTION_PERMISSIONS: Record<PlanningToolbarActionId, string> = {
  filters: 'genel.plan.filtre',
  queue: 'genel.plan.kuyruk',
  undo: 'genel.plan.duzenle',
  redo: 'genel.plan.duzenle',
  history: 'genel.plan.gecmis',
  save: 'genel.plan.kaydet',
  publish: 'genel.plan.yayinla',
}

export const UNIT_VIEW_PERMISSIONS: Record<PlanningUnitKey, string> = {
  planning: 'genel.plan.birim.planlama',
  production: 'genel.plan.birim.uretim',
  dispatch: 'genel.plan.birim.sevkiyat',
  assembly: 'genel.plan.birim.montaj',
}

export const UNIT_EDIT_PERMISSIONS: Record<PlanningUnitKey, string> = {
  planning: 'genel.plan.planlama.duzenle',
  production: 'genel.plan.uretim.duzenle',
  dispatch: 'genel.plan.sevkiyat.duzenle',
  assembly: 'genel.plan.montaj.duzenle',
}
