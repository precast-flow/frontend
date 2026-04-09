import type { OkanEngJob } from './engineeringIntegrationOkanMock'
import { CHECKLIST_ITEMS_OKAN } from './engineeringIntegrationOkanMock'
import { computeReadinessPercent, countChecklistDone, deriveReadinessLevel } from './readinessEngine'

type TFn = (key: string, params?: Record<string, string>) => string

type Props = {
  job: OkanEngJob
  t: TFn
}

function buildInsights(job: OkanEngJob, t: TFn) {
  const score = computeReadinessPercent(job)
  const level = deriveReadinessLevel(score, job)
  const { done, total } = countChecklistDone(job.checklist)

  const missing: string[] = []
  for (const c of CHECKLIST_ITEMS_OKAN) {
    if (!job.checklist[c.id]) {
      missing.push(t(`okanEng.chk.${c.id}`))
    }
  }

  const risks: string[] = []
  if (job.files.some((f) => f.fileType.toUpperCase() === 'IFC' && f.integrationStatus !== 'hazir')) {
    risks.push(t('okanEng.risk.ifcPending'))
  }
  if (job.manual.toleranceNote.trim().length < 3) {
    risks.push(t('okanEng.risk.tolerance'))
  }
  if (job.files.some((f) => f.locked)) {
    risks.push(t('okanEng.risk.lockedFile'))
  }
  if (!job.files.some((f) => f.fileType.toUpperCase() === 'PDF')) {
    risks.push(t('okanEng.risk.noPdf'))
  }

  const suggestions: string[] = []
  if (job.kind === 'B' && job.workflow === 'approved' && level !== 'green') {
    suggestions.push(t('okanEng.suggest.approveBeforePo'))
  }
  if (job.workflow === 'in_review') {
    suggestions.push(t('okanEng.suggest.reviewQueue'))
  }
  if (missing.length > 0) {
    suggestions.push(t('okanEng.suggest.completeChecklist'))
  }

  const statusLabel =
    job.workflow === 'draft'
      ? t('okanEng.flow.draft')
      : job.workflow === 'in_review'
        ? t('okanEng.flow.inReview')
        : job.workflow === 'approved'
          ? t('okanEng.flow.approved')
          : t('okanEng.flow.productionCreated')

  return { score, done, total, missing, risks, suggestions, statusLabel }
}

export function RiskInsightPanel({ job, t }: Props) {
  const { score, done, total, missing, risks, suggestions, statusLabel } = buildInsights(job, t)

  return (
    <aside className="lg:sticky lg:top-0 flex max-h-[calc(100vh-12rem)] flex-col gap-3 overflow-y-auto rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm dark:bg-gray-900">
      <h2 className="px-1 text-sm font-semibold text-gray-900 dark:text-gray-50">{t('okanEng.risk.title')}</h2>

      <section className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/80">
        <h3 className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
          {t('okanEng.risk.workflow')}
        </h3>
        <p className="mt-1 text-sm text-gray-800 dark:text-gray-100">{statusLabel}</p>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
          {t('okanEng.risk.readinessHint', { score: String(score) })}
        </p>
      </section>

      <section className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/80">
        <h3 className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
          {t('okanEng.risk.checkProgress')}
        </h3>
        <p className="mt-1 text-sm tabular-nums text-gray-800 dark:text-gray-100">
          {done} / {total}
        </p>
      </section>

      <section className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/80">
        <h3 className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
          {t('okanEng.risk.missing')}
        </h3>
        {missing.length === 0 ? (
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">{t('okanEng.risk.none')}</p>
        ) : (
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-200">
            {missing.slice(0, 8).map((m) => (
              <li key={m}>{m}</li>
            ))}
            {missing.length > 8 ? (
              <li className="text-xs text-gray-500">
                {t('okanEng.risk.more', { n: String(missing.length - 8) })}
              </li>
            ) : null}
          </ul>
        )}
      </section>

      <section className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/80">
        <h3 className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
          {t('okanEng.risk.alerts')}
        </h3>
        {risks.length === 0 ? (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('okanEng.risk.noAlerts')}</p>
        ) : (
          <ul className="mt-1 space-y-1.5 text-sm text-amber-900 dark:text-amber-100">
            {risks.map((r) => (
              <li key={r} className="rounded-lg border border-amber-500/30 bg-amber-50/90 px-2 py-1.5 shadow-neo-in dark:border-amber-800/40 dark:bg-amber-950/40">
                {r}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/80">
        <h3 className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
          {t('okanEng.risk.suggested')}
        </h3>
        <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-200">
          {suggestions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
