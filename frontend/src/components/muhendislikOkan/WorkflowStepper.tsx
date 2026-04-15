import { Check } from 'lucide-react'
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
    <div className="w-full min-w-0" role="group" aria-label={t('okanEng.flowProgressAria')}>
      <ol className="flex w-full min-w-0 list-none">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          const isDone = i < active
          const isCurrent = i === active
          const leftComplete = i > 0 && active >= i
          const rightComplete = !isLast && active > i

          return (
            <li
              key={step.wf}
              className="flex min-w-0 flex-1 flex-col items-stretch"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="flex w-full min-w-0 items-center">
                {i > 0 ? (
                  <div
                    className={[
                      'h-[3px] min-h-[3px] min-w-[0.5rem] flex-1 rounded-full transition-colors duration-300',
                      leftComplete
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgb(16_185_129/0.35)]'
                        : 'bg-slate-200/90 dark:bg-white/[0.08]',
                    ].join(' ')}
                    aria-hidden
                  />
                ) : (
                  <div className="min-w-0 flex-1" aria-hidden />
                )}

                <div
                  className={[
                    'relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-all duration-300',
                    isDone
                      ? 'bg-emerald-500 text-white shadow-[0_2px_12px_rgb(16_185_129/0.45)] ring-2 ring-emerald-400/30 ring-offset-2 ring-offset-white/80 dark:ring-offset-slate-900/80'
                      : isCurrent
                        ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-[0_4px_20px_rgb(14_165_233/0.4)] ring-[3px] ring-sky-300/50 ring-offset-2 ring-offset-white/90 dark:from-sky-400 dark:to-sky-600 dark:ring-sky-400/40 dark:ring-offset-slate-900/90'
                        : 'border border-slate-200/90 bg-white/70 text-slate-400 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-500',
                  ].join(' ')}
                >
                  {isDone ? <Check className="size-4 stroke-[3]" aria-hidden /> : <span>{i + 1}</span>}
                </div>

                {!isLast ? (
                  <div
                    className={[
                      'h-[3px] min-h-[3px] min-w-[0.5rem] flex-1 rounded-full transition-colors duration-300',
                      rightComplete
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500/90 shadow-[0_0_12px_rgb(16_185_129/0.35)]'
                        : 'bg-slate-200/90 dark:bg-white/[0.08]',
                    ].join(' ')}
                    aria-hidden
                  />
                ) : (
                  <div className="min-w-0 flex-1" aria-hidden />
                )}
              </div>

              <p
                className={[
                  'mt-2.5 px-0.5 text-center text-[11px] font-medium leading-snug tracking-tight sm:text-xs',
                  isCurrent
                    ? 'text-slate-900 dark:text-slate-50'
                    : isDone
                      ? 'text-emerald-800 dark:text-emerald-200/90'
                      : 'text-slate-500 dark:text-slate-500',
                ].join(' ')}
              >
                {t(step.labelKey)}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
