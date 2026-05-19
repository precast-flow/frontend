import { FileText } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import {
  controlPhaseLabelKey,
  nonconformanceStatusLabelKey,
  type NonconformanceRecord,
} from '../../../data/productionQualityControl'
import {
  reportSummaryCounts,
  type QualityControlReport,
} from '../../../data/qualityControlReport'
import { resolveWorkQueueName } from '../../../data/workQueueMock'

type Props = {
  qualityReport?: QualityControlReport
  records: NonconformanceRecord[]
  markerSpotById?: Record<string, string | undefined>
  gl: boolean
  onOpenReport: () => void
  onGenerateReport?: () => void
  onOpenWorkOrder?: (workQueueId: string) => void
}

export function ProductionNonconformancesList({
  qualityReport,
  records,
  markerSpotById = {},
  gl,
  onOpenReport,
  onGenerateReport,
  onOpenWorkOrder,
}: Props) {
  const { t } = useI18n()

  const cardCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left transition hover:border-sky-500/25 dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left transition hover:border-sky-300/50 dark:border-slate-600/60 dark:bg-slate-900/40'

  const ncCardCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  if (!qualityReport && records.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/18 p-6 text-center text-sm text-black/65 dark:border-white/15 dark:text-white/70">
        {t('unitWorkQueue.qcReport.listEmpty')}
      </p>
    )
  }

  const counts = qualityReport ? reportSummaryCounts(qualityReport) : null

  return (
    <div className="space-y-4">
      {qualityReport ? (
        <article className={cardCls}>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-200">
            {t('unitWorkQueue.qcReport.title')}
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-black dark:text-white">
            {qualityReport.reportNo}
          </p>
          {counts ? (
            <p className="mt-2 text-xs text-black/60 dark:text-white/65">
              {t('unitWorkQueue.qcReport.summaryBanner', {
                pass: String(counts.pass),
                warning: String(counts.warning),
                error: String(counts.error),
              })}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700"
              onClick={onOpenReport}
            >
              <FileText className="size-3.5" aria-hidden />
              {t('unitWorkQueue.qcReport.viewReport')}
            </button>
            {onGenerateReport ? (
              <button
                type="button"
                className="rounded-lg border border-black/15 px-3 py-2 text-xs font-semibold dark:border-white/15"
                onClick={onGenerateReport}
              >
                {t('unitWorkQueue.qcReport.regenerate')}
              </button>
            ) : null}
          </div>
        </article>
      ) : onGenerateReport ? (
        <button
          type="button"
          onClick={onGenerateReport}
          className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          {t('unitWorkQueue.qcReport.generate')}
        </button>
      ) : null}

      {records.length > 0 ? (
        <section>
          <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-red-800 dark:text-red-200">
            {t('unitWorkQueue.productionFlow.spawn.ncSection')}
          </h5>
          <ul className="space-y-3">
            {records.map((record) => {
              const summary =
                record.description.length > 120
                  ? `${record.description.slice(0, 117)}…`
                  : record.description
              const spotUrl = markerSpotById[record.markerId]

              return (
                <li key={record.id}>
                  <article className={ncCardCls}>
                    {spotUrl ? (
                      <img
                        src={spotUrl}
                        alt=""
                        className="mb-3 max-h-40 w-full rounded-lg border border-black/10 object-contain bg-slate-100 dark:border-white/12 dark:bg-slate-900"
                      />
                    ) : null}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold text-black dark:text-white">
                          {record.ncOrderNo}
                        </p>
                      </div>
                      <span className="rounded-full bg-red-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-800 ring-1 ring-red-500/20 dark:text-red-200">
                        {t(controlPhaseLabelKey(record.phase))}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-snug text-black/80 dark:text-white/85">
                      {summary}
                    </p>
                    <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-black/50 dark:text-white/55">
                          {t('unitWorkQueue.ncReport.cardStatus')}
                        </dt>
                        <dd className="font-medium text-black dark:text-white">
                          {t(nonconformanceStatusLabelKey(record.status))}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-black/50 dark:text-white/55">
                          {t('unitWorkQueue.ncReport.assignee')}
                        </dt>
                        <dd className="font-medium text-black dark:text-white">
                          {resolveWorkQueueName(record.assigneeUserId)}
                        </dd>
                      </div>
                    </dl>
                    {onOpenWorkOrder ? (
                      <button
                        type="button"
                        className="mt-3 rounded-lg border border-black/15 px-3 py-2 text-xs font-semibold dark:border-white/15"
                        onClick={() => onOpenWorkOrder(record.workQueueId)}
                      >
                        {t('unitWorkQueue.ncReport.openWorkOrder')}
                      </button>
                    ) : null}
                  </article>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
