import { AlertTriangle, ClipboardList, FileWarning, FlaskConical } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  MOCK_URGENT_ACTIONS,
  QUALITY_DASHBOARD_KPIS,
  QUALITY_TREND_BARS_PCT,
  type QualityKpiKey,
} from '../../data/qualityDashboardMock'
import { useI18n } from '../../i18n/I18nProvider'

const kpiIcon = (key: QualityKpiKey) => {
  switch (key) {
    case 'samplesToday':
      return FlaskConical
    case 'pendingTests':
      return ClipboardList
    case 'outOfLimit':
      return AlertTriangle
    case 'reportsPending':
      return FileWarning
    default:
      return FlaskConical
  }
}

const severityClass = (s: 'critical' | 'high' | 'normal') => {
  if (s === 'critical')
    return 'bg-rose-100 text-rose-900 ring-rose-300/80 dark:bg-rose-950/50 dark:text-rose-100 dark:ring-rose-800/80'
  if (s === 'high')
    return 'bg-amber-100 text-amber-950 ring-amber-300/80 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-800/60'
  return 'bg-gray-200/90 text-gray-800 ring-gray-300/80 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-600/80'
}

export function QualityDashboardSection() {
  const { t } = useI18n()
  const { selectedFactory, selectedCodes } = useFactoryContext()
  const scopeLabel = selectedCodes.length > 1 ? selectedCodes.join(', ') : selectedFactory.code

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityDashboard.sectionTitle')}</h2>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{t('qualityDashboard.intro')}</p>
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
          <span className="font-mono text-gray-600 dark:text-gray-500">{scopeLabel}</span>
          {' · '}
          {t('qualityDashboard.scopeHint')}
        </p>
      </div>

      {/* P0 — KPI */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {QUALITY_DASHBOARD_KPIS.map((row) => {
          const Icon = kpiIcon(row.key)
          return (
            <div
              key={row.key}
              className="rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/90"
              title={t(`qualityDashboard.kpi.${row.key}.hint`)}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t(`qualityDashboard.kpi.${row.key}.label`)}
                </p>
                <Icon className="size-4 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-gray-50">
                {row.value}
                {row.unit ? (
                  <span className="ml-1 text-lg font-semibold text-gray-500 dark:text-gray-400">{row.unit}</span>
                ) : null}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t(`qualityDashboard.kpi.${row.key}.hint`)}</p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* P0 — acil aksiyonlar */}
        <section className="lg:col-span-7">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityDashboard.urgentTitle')}</h3>
          <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{t('qualityDashboard.urgentHint')}</p>
          <div className="mt-3 overflow-x-auto rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-950/70">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-[11px] uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">{t('qualityDashboard.col.severity')}</th>
                  <th className="px-3 py-2 font-semibold">{t('qualityDashboard.col.action')}</th>
                  <th className="px-3 py-2 font-semibold">{t('qualityDashboard.col.ref')}</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_URGENT_ACTIONS.map((row) => (
                  <tr key={row.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${severityClass(row.severity)}`}
                      >
                        {t(`qualityDashboard.severity.${row.severity}`)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-gray-900 dark:text-gray-50">{t(row.titleKey)}</p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400">{t(row.metaKey)}</p>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-700 dark:text-gray-200">{row.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* P1 — periyodik rapor hatırlatıcı */}
          <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/60">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityDashboard.periodicTitle')}</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{t('qualityDashboard.periodicBody')}</p>
            <p className="mt-3 rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-800 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-100">
              {t('qualityDashboard.periodicDue')}
            </p>
          </section>

          {/* P2 — trend placeholder */}
          <section className="rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-900/80">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityDashboard.trendTitle')}</h3>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{t('qualityDashboard.trendHint')}</p>
            <div
              className="mt-4 flex items-end justify-between gap-1.5 px-1"
              role="img"
              aria-label={t('qualityDashboard.trendAria')}
            >
              {QUALITY_TREND_BARS_PCT.map((h, i) => (
                <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <div className="relative h-24 w-full max-w-[32px]">
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-gray-700 to-gray-500 shadow-neo-in dark:from-gray-300 dark:to-gray-500"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">G{i + 1}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
