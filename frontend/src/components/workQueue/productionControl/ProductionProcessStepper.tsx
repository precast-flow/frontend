import { useI18n } from '../../../i18n/I18nProvider'
import type { ProductionWorkOrderFlowState } from '../../../data/productionWorkOrderFlow'
import {
  alreadyPourApproved,
  alreadyWarehouseApproved,
  isProductionFlowComplete,
} from '../../../data/productionWorkOrderFlow'
type Props = {
  flow: ProductionWorkOrderFlowState
  hasCuringReport: boolean
  gl: boolean
}

type StepState = 'done' | 'current' | 'pending'

function stepClass(state: StepState, gl: boolean): string {
  const base = 'rounded-full px-2 py-0.5 text-[10px] font-semibold'
  if (state === 'done') {
    return `${base} bg-emerald-500/15 text-emerald-900 ring-1 ring-emerald-500/25 dark:text-emerald-100`
  }
  if (state === 'current') {
    return `${base} bg-sky-500/15 text-sky-950 ring-1 ring-sky-500/30 dark:text-sky-100`
  }
  return gl
    ? `${base} bg-black/[0.04] text-black/50 dark:bg-white/[0.06] dark:text-white/55`
    : `${base} bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400`
}

export function ProductionProcessStepper({ flow, hasCuringReport, gl }: Props) {
  const { t } = useI18n()
  const pourDone = alreadyPourApproved(flow)
  const reportDone = hasCuringReport
  const postStepsDone =
    flow.postPour.labelingDone && flow.postPour.surfaceCleaningDone
  const warehouseDone = alreadyWarehouseApproved(flow)
  const complete = isProductionFlowComplete(flow)

  const steps: { key: string; label: string; state: StepState }[] = [
    {
      key: 'pour',
      label: t('unitWorkQueue.processStep.pour'),
      state: pourDone ? 'done' : 'current',
    },
    {
      key: 'curing',
      label: t('unitWorkQueue.processStep.curing'),
      state: !pourDone ? 'pending' : reportDone ? 'done' : 'current',
    },
    {
      key: 'post',
      label: t('unitWorkQueue.processStep.postPour'),
      state: !pourDone
        ? 'pending'
        : complete
          ? 'done'
          : postStepsDone
            ? 'done'
            : reportDone
              ? 'current'
              : 'pending',
    },
    {
      key: 'warehouse',
      label: t('unitWorkQueue.processStep.warehouse'),
      state: warehouseDone ? 'done' : postStepsDone && reportDone ? 'current' : 'pending',
    },
  ]

  return (
    <div
      className={
        gl
          ? 'flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-black/[0.02] px-2 py-2 dark:border-white/10'
          : 'flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-slate-200/70 bg-white/50 px-2 py-2 dark:border-slate-600/50 dark:bg-slate-900/30'
      }
      role="list"
      aria-label={t('unitWorkQueue.processStep.list')}
    >
      {steps.map((step, i) => (
        <span key={step.key} className="inline-flex items-center gap-1.5" role="listitem">
          <span className={stepClass(step.state, gl)}>{step.label}</span>
          {i < steps.length - 1 ? (
            <span className="text-black/25 dark:text-white/30" aria-hidden>
              →
            </span>
          ) : null}
        </span>
      ))}
    </div>
  )
}
