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

const nested =
  'rounded-xl border border-white/25 bg-white/20 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_4px_20px_rgb(15_23_42/0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_4px_24px_rgb(0_0_0/0.2)]'

export function RiskInsightPanel({ job, t }: Props) {
  const { score, done, total, missing, risks, suggestions, statusLabel } = buildInsights(job, t)

  return (
    <aside className="lg:sticky lg:top-0 flex max-h-[calc(100vh-12rem)] flex-col gap-3 overflow-y-auto rounded-2xl border border-white/30 bg-white/25 p-3 shadow-[0_8px_32px_rgb(15_23_42/0.06),inset_0_1px_0_rgb(255_255_255/0.45)] backdrop-blur-2xl dark:border-white/12 dark:bg-white/[0.07] dark:shadow-[0_8px_40px_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.1)]">
      <h2 className="px-1 text-sm font-semibold text-slate-900 dark:text-slate-50">{t('okanEng.risk.title')}</h2>

      <section className={nested}>
        <h3 className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
          {t('okanEng.risk.workflow')}
        </h3>
        <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">{statusLabel}</p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          {t('okanEng.risk.readinessHint', { score: String(score) })}
        </p>
      </section>

      <section className={nested}>
        <h3 className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
          {t('okanEng.risk.checkProgress')}
        </h3>
        <p className="mt-1 text-sm tabular-nums text-slate-800 dark:text-slate-100">
          {done} / {total}
        </p>
      </section>

      <section className={nested}>
        <h3 className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
          {t('okanEng.risk.missing')}
        </h3>
        {missing.length === 0 ? (
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">{t('okanEng.risk.none')}</p>
        ) : (
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-200">
            {missing.slice(0, 8).map((m) => (
              <li key={m}>{m}</li>
            ))}
            {missing.length > 8 ? (
              <li className="text-xs text-slate-500 dark:text-slate-400">
                {t('okanEng.risk.more', { n: String(missing.length - 8) })}
              </li>
            ) : null}
          </ul>
        )}
      </section>

      <section className={nested}>
        <h3 className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
          {t('okanEng.risk.alerts')}
        </h3>
        {risks.length === 0 ? (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('okanEng.risk.noAlerts')}</p>
        ) : (
          <ul className="mt-1 space-y-1.5 text-sm text-amber-950 dark:text-amber-100">
            {risks.map((r) => (
              <li
                key={r}
                className="rounded-lg border border-amber-400/35 bg-amber-100/40 px-2 py-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.4)] backdrop-blur-md dark:border-amber-500/25 dark:bg-amber-950/35"
              >
                {r}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={nested}>
        <h3 className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
          {t('okanEng.risk.suggested')}
        </h3>
        <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-200">
          {suggestions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
