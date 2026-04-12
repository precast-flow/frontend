import type { WorkflowStateOkan } from './engineeringIntegrationOkanMock'

type StepDef = { wf: WorkflowStateOkan; labelKey: string }

const STEPS_A: StepDef[] = [
  { wf: 'draft', labelKey: 'okanEng.flow.draft' },
  { wf: 'in_review', labelKey: 'okanEng.flow.inReview' },
  { wf: 'approved', labelKey: 'okanEng.flow.approved' },
]

const STEPS_B: StepDef[] = [
  { wf: 'draft', labelKey: 'okanEng.flow.draft' },
  { wf: 'in_review', labelKey: 'okanEng.flow.inReview' },
  { wf: 'approved', labelKey: 'okanEng.flow.approved' },
  { wf: 'production_created', labelKey: 'okanEng.flow.productionCreated' },
]

type TFn = (key: string) => string

type Props = {
  workflow: WorkflowStateOkan
  kind: 'A' | 'B'
  t: TFn
}

function activeIndex(steps: StepDef[], workflow: WorkflowStateOkan, kind: 'A' | 'B'): number {
  let wf = workflow
  if (kind === 'A' && wf === 'production_created') wf = 'approved'
  if (workflow === 'production_created' && steps.every((s) => s.wf !== 'production_created')) {
    return steps.length - 1
  }
  const i = steps.findIndex((s) => s.wf === wf)
  return i >= 0 ? i : 0
}

export function WorkflowStepper({ workflow, kind, t }: Props) {
  const steps = kind === 'A' ? STEPS_A : STEPS_B
  const active = activeIndex(steps, workflow, kind)

  return (
    <div className="overflow-x-auto pb-1">
      <ol className="flex min-w-[min(100%,480px)] items-center gap-1">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          const isPast = i < active
          const isCurrent = i === active
          return (
            <li key={step.wf} className="flex flex-1 items-center gap-1">
              <span
                className={[
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold backdrop-blur-md transition',
                  isCurrent
                    ? 'border border-sky-400/40 bg-gradient-to-b from-slate-800/95 to-slate-900/95 text-white shadow-[0_4px_16px_rgb(14_165_233/0.25),inset_0_1px_0_rgb(255_255_255/0.2)] dark:from-white/20 dark:to-white/10 dark:text-slate-50 dark:shadow-[0_4px_20px_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.25)]'
                    : isPast
                      ? 'border border-emerald-400/35 bg-emerald-500/85 text-white shadow-[0_0_12px_rgb(16_185_129/0.35),inset_0_1px_0_rgb(255_255_255/0.25)] dark:bg-emerald-500/70'
                      : 'border border-white/35 bg-white/25 text-slate-600 shadow-[inset_0_1px_0_rgb(255_255_255/0.6)] dark:border-white/12 dark:bg-white/6 dark:text-slate-400',
                ].join(' ')}
              >
                {i + 1}
              </span>
              <span
                className={`min-w-0 truncate text-[11px] font-medium sm:max-w-[7rem] ${isCurrent ? 'text-slate-900 dark:text-slate-50' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {t(step.labelKey)}
              </span>
              {!isLast ? (
                <span
                  className={`h-0.5 flex-1 rounded-full ${i < active ? 'bg-gradient-to-r from-emerald-400/90 to-emerald-500/70 shadow-[0_0_8px_rgb(16_185_129/0.35)]' : 'bg-slate-300/60 dark:bg-white/10'}`}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
