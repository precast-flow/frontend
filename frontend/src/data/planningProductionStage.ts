import type { PlanStatusKey } from './planningDesignMock'

export type PlanningProductionStage =
  | 'mold_cleaning'
  | 'reinforcement_mount'
  | 'mold_prep'
  | 'awaiting_pour'
  | 'curing'
  | 'post_pour_check'
  | 'awaiting_warehouse'
  | 'completed'

export const PLANNING_PRODUCTION_STAGES: PlanningProductionStage[] = [
  'mold_cleaning',
  'reinforcement_mount',
  'mold_prep',
  'awaiting_pour',
  'curing',
  'post_pour_check',
  'awaiting_warehouse',
  'completed',
]

export type PlanningProductionStageMeta = {
  labelKey: string
  /** Genel süreç içindeki yaklaşık tamamlanma yüzdesi (aşama başlangıcı). */
  basePercent: number
}

export const PLANNING_PRODUCTION_STAGE_META: Record<
  PlanningProductionStage,
  PlanningProductionStageMeta
> = {
  mold_cleaning: { labelKey: 'planning.productionStage.moldCleaning', basePercent: 8 },
  reinforcement_mount: { labelKey: 'planning.productionStage.reinforcementMount', basePercent: 20 },
  mold_prep: { labelKey: 'planning.productionStage.moldPrep', basePercent: 32 },
  awaiting_pour: { labelKey: 'planning.productionStage.awaitingPour', basePercent: 48 },
  curing: { labelKey: 'planning.productionStage.curing', basePercent: 65 },
  post_pour_check: { labelKey: 'planning.productionStage.postPourCheck', basePercent: 82 },
  awaiting_warehouse: { labelKey: 'planning.productionStage.awaitingWarehouse', basePercent: 92 },
  completed: { labelKey: 'planning.productionStage.completed', basePercent: 100 },
}

export function productionStageProgressPercent(
  stage: PlanningProductionStage,
  stageProgress = 50,
): number {
  const meta = PLANNING_PRODUCTION_STAGE_META[stage]
  if (stage === 'completed') return 100
  const idx = PLANNING_PRODUCTION_STAGES.indexOf(stage)
  const next = PLANNING_PRODUCTION_STAGES[idx + 1]
  const nextBase = next ? PLANNING_PRODUCTION_STAGE_META[next].basePercent : 100
  const span = nextBase - meta.basePercent
  return Math.min(99, Math.round(meta.basePercent + (span * stageProgress) / 100))
}

/** Mock atama: status + index ile gerçekçi aşama çeşitliliği. */
export function assignMockProductionStage(
  status: PlanStatusKey,
  index: number,
): { productionStage: PlanningProductionStage; productionStageProgress: number } {
  const stageProgress = 25 + (index % 4) * 18

  if (status === 'PRODUCED_OK') {
    return { productionStage: 'completed', productionStageProgress: 100 }
  }
  if (status === 'CANCELLED' || status === 'SCRAP') {
    return { productionStage: 'mold_cleaning', productionStageProgress: 10 }
  }
  if (status === 'HOLD_UNCERTAIN') {
    return { productionStage: 'awaiting_pour', productionStageProgress: 40 }
  }
  if (status === 'ISSUE_REWORK') {
    return { productionStage: 'post_pour_check', productionStageProgress: 55 }
  }
  if (status === 'PLANNED' || status === 'ORDERED_DESIGN') {
    const early: PlanningProductionStage[] = ['mold_cleaning', 'reinforcement_mount', 'mold_prep']
    return {
      productionStage: early[index % early.length]!,
      productionStageProgress: stageProgress,
    }
  }
  // IN_PROGRESS
  const mid: PlanningProductionStage[] = [
    'awaiting_pour',
    'curing',
    'post_pour_check',
    'awaiting_warehouse',
  ]
  return {
    productionStage: mid[index % mid.length]!,
    productionStageProgress: stageProgress,
  }
}
