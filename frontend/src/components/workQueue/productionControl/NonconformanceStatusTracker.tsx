import { Check } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '../../../i18n/I18nProvider'
import {
  NONCONFORMANCE_STATUS_TRACKING_STEPS,
  ensureNonconformanceStatusHistory,
  isNonconformanceRoutingStepSkipped,
  isNonconformanceStepCompleted,
  nonconformanceStatusLabelKey,
  type NonconformanceRecord,
} from '../../../data/productionQualityControl'
import { formatNcReportDateTime } from '../../../data/nonconformanceReport'
import { resolveWorkQueueName } from '../../../data/workQueueMock'

type Props = {
  record: NonconformanceRecord
  gl: boolean
}

export function NonconformanceStatusTracker({ record, gl }: Props) {
  const { t, locale } = useI18n()
  const loc = locale === 'en' ? 'en-GB' : 'tr-TR'

  const ensured = useMemo(() => ensureNonconformanceStatusHistory(record), [record])

  const historyByStatus = useMemo(() => {
    const map = new Map<string, (typeof ensured.statusHistory)[number]>()
    for (const entry of ensured.statusHistory) {
      if (!map.has(entry.status)) map.set(entry.status, entry)
    }
    return map
  }, [ensured.statusHistory])

  const cardCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  return (
    <section className={cardCls} aria-label={t('unitWorkQueue.nonconformance.workflowTitle')}>
      <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
        {t('unitWorkQueue.nonconformance.workflowTitle')}
      </h5>
      <ol className="space-y-0">
        {NONCONFORMANCE_STATUS_TRACKING_STEPS.map((step, index) => {
          const skipped =
            step.routingBranch &&
            (step.id === 'routed_project' || step.id === 'routed_production') &&
            isNonconformanceRoutingStepSkipped(ensured, step.id)

          const completed = !skipped && isNonconformanceStepCompleted(ensured, step.id)
          const current = !skipped && ensured.status === step.id
          const historyEntry = historyByStatus.get(step.id)

          const lineMuted = skipped
            ? 'text-black/35 dark:text-white/35'
            : completed
              ? 'text-black dark:text-white'
              : 'text-black/55 dark:text-white/60'

          return (
            <li key={step.id} className="flex gap-3">
              <div className="flex w-5 shrink-0 flex-col items-center" aria-hidden>
                <span
                  className={[
                    'flex size-5 items-center justify-center rounded-full border text-[10px] font-bold',
                    skipped
                      ? 'border-black/10 bg-transparent text-black/30 dark:border-white/10 dark:text-white/30'
                      : current
                        ? 'border-sky-600 bg-sky-600 text-white ring-2 ring-sky-500/30'
                        : completed
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-black/20 bg-white/80 text-black/45 dark:border-white/20 dark:bg-white/10 dark:text-white/50',
                  ].join(' ')}
                >
                  {completed && !current ? (
                    <Check className="size-3" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </span>
                {index < NONCONFORMANCE_STATUS_TRACKING_STEPS.length - 1 ? (
                  <span
                    className={[
                      'my-0.5 min-h-[1.25rem] w-px flex-1',
                      skipped
                        ? 'bg-black/8 dark:bg-white/10'
                        : completed
                          ? 'bg-emerald-500/50'
                          : 'bg-black/12 dark:bg-white/15',
                    ].join(' ')}
                  />
                ) : null}
              </div>
              <div className={`min-w-0 flex-1 pb-4 ${lineMuted}`}>
                <p className={`text-sm font-semibold ${current ? 'text-sky-800 dark:text-sky-200' : ''}`}>
                  {t(nonconformanceStatusLabelKey(step.id))}
                  {skipped ? (
                    <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide opacity-70">
                      ({t('unitWorkQueue.nonconformance.workflowSkipped')})
                    </span>
                  ) : null}
                </p>
                {historyEntry ? (
                  <p className="mt-0.5 text-xs opacity-80">
                    {formatNcReportDateTime(historyEntry.at, loc)}
                    {historyEntry.byUserId
                      ? ` · ${resolveWorkQueueName(historyEntry.byUserId)}`
                      : null}
                  </p>
                ) : null}
                {historyEntry?.note ? (
                  <p className="mt-1 text-xs leading-snug opacity-90">{historyEntry.note}</p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
