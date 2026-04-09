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
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isCurrent
                    ? 'bg-gray-900 text-white shadow-neo-out-sm dark:bg-gray-100 dark:text-gray-900'
                    : isPast
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
                ].join(' ')}
              >
                {i + 1}
              </span>
              <span
                className={`min-w-0 truncate text-[11px] font-medium sm:max-w-[7rem] ${isCurrent ? 'text-gray-900 dark:text-gray-50' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {t(step.labelKey)}
              </span>
              {!isLast ? (
                <span
                  className={`h-0.5 flex-1 ${i < active ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
