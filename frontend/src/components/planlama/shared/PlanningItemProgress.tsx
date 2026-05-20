import { useI18n } from '../../../i18n/I18nProvider'
import {
  PLANNING_PRODUCTION_STAGE_META,
  productionStageProgressPercent,
  type PlanningProductionStage,
} from '../../../data/planningProductionStage'

type Props = {
  stage: PlanningProductionStage
  stageProgress?: number
  compact?: boolean
}

export function PlanningItemProgress({ stage, stageProgress = 50, compact = true }: Props) {
  const { t } = useI18n()
  const meta = PLANNING_PRODUCTION_STAGE_META[stage]
  const percent = productionStageProgressPercent(stage, stageProgress)
  const label = t(meta.labelKey)

  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${compact ? '' : 'w-full'}`}>
      <span className="truncate text-[9px] font-medium leading-tight text-slate-600 dark:text-slate-400">
        {label} · %{percent}
      </span>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/60"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-sky-500 transition-[width] dark:bg-sky-400"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
