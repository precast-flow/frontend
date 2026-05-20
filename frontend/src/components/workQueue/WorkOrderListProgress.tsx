import { useMemo } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useWorkQueue } from '../../context/WorkQueueContext'
import { computeWorkOrderProgress } from '../../data/workOrderProgress'
import type { WorkQueueItem } from '../../data/workQueueMock'

type Props = {
  item: WorkQueueItem
  compact?: boolean
}

export function WorkOrderListProgress({ item, compact = true }: Props) {
  const { t } = useI18n()
  const wq = useWorkQueue()

  const progress = useMemo(() => {
    const ctx = {
      getProductionFlowState: wq.getProductionFlowState,
      getCuringFlowState: wq.getCuringFlowState,
      getPourFlowState: wq.getPourFlowState,
      getSampleFlowState: wq.getSampleFlowState,
      hasCuringReportForOrder: (id: string) => wq.getCuringReportsForProductionOrder(id).length > 0,
      getNonconformance: wq.getNonconformance,
    }
    return computeWorkOrderProgress(item, ctx)
  }, [item, wq])

  const label = progress.labelParams
    ? t(progress.labelKey, progress.labelParams)
    : t(progress.labelKey)

  return (
    <div className={`flex shrink-0 flex-col items-end gap-0.5 ${compact ? 'w-[88px]' : 'w-28'}`}>
      <span className="max-w-full truncate text-[10px] font-medium leading-tight text-black/60 dark:text-white/65">
        {label}
      </span>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/15"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-sky-500 transition-[width] dark:bg-sky-400"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  )
}
