import type { PlanVisualTone } from '../../../data/generalPlanningMock'
import type { PlanItem } from '../../../data/planningDesignMock'

export type TimelineDisplayItem = PlanItem & {
  visualTone: PlanVisualTone
  isPreview: boolean
}

export type PlanCardDisplayMode = 'coordinator' | 'ops'

export function planCardToneClasses(visualTone: PlanVisualTone): string {
  if (visualTone === 'preview') {
    return 'ring-2 ring-sky-400/55 shadow-md saturate-100 opacity-100'
  }
  return 'opacity-[0.72] saturate-[0.55]'
}
