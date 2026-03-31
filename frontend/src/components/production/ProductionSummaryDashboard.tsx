import { useMemo, useState } from 'react'
import { Factory, Sun, Sunset, Moon, Users, ArrowRight } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  MOCK_DIRECT_REPORTS_OPEN_ORDERS,
  PRODUCTION_CRITICAL_ROWS,
  PRODUCTION_KPI_BASE,
  SHIFT_FACTORS,
  WEEKLY_OUTPUT_SERIES,
  type ProductionKpiRow,
} from '../../data/productionSummaryMock'
import { useI18n } from '../../i18n/I18nProvider'

type ShiftId = 'morning' | 'evening' | 'night'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'
const tabShift = (on: boolean) =>
  [
    'inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900',
    on
      ? 'bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900'
      : 'bg-gray-100 text-gray-700 shadow-neo-in hover:text-gray-900 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-white',
  ].join(' ')

function applyShiftFactor(row: ProductionKpiRow, factor: number): number {
  if (row.key === 'lineLoadPct') return Math.min(100, Math.round(row.value * factor))
  if (row.unit === '%') return row.value
  return Math.max(0, Math.round(row.value * factor))
}

type Props = {
  onNavigate: (moduleId: string) => void
}

export function ProductionSummaryDashboard({ onNavigate }: Props) {
  const { t } = useI18n()
  const { selectedFactory, selectedCodes, contextDetail } = useFactoryContext()
  const [shift, setShift] = useState<ShiftId>('morning')

  const factor = SHIFT_FACTORS[shift]

  const kpiTiles = useMemo(() => {
    const primary: ProductionKpiRow[] = [
      PRODUCTION_KPI_BASE.find((r) => r.key === 'plannedToday')!,
      PRODUCTION_KPI_BASE.find((r) => r.key === 'inProduction')!,
      PRODUCTION_KPI_BASE.find((r) => r.key === 'delayed')!,
      PRODUCTION_KPI_BASE.find((r) => r.key === 'batchingQueue')!,
    ]
    const secondary: ProductionKpiRow[] = [
      PRODUCTION_KPI_BASE.find((r) => r.key === 'qcPending')!,
      PRODUCTION_KPI_BASE.find((r) => r.key === 'completedToday')!,
      PRODUCTION_KPI_BASE.find((r) => r.key === 'carryOverYesterday')!,
      PRODUCTION_KPI_BASE.find((r) => r.key === 'lineLoadPct')!,
    ]
    return { primary, secondary }
  }, [])

  const maxWeek = Math.max(...WEEKLY_OUTPUT_SERIES, 1)

  const factoryLabel = selectedCodes.length > 1 ? selectedCodes.join(', ') : selectedFactory.code

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        <strong className="text-gray-800 dark:text-gray-100">prod-01:</strong> Üretim şefi / vardiya amiri sabah
        özeti (mock).{' '}
        <span className="text-gray-500 dark:text-gray-500">
          Roller: şef — KPI + kritik liste (düzenle); vardiya amiri — vardiya filtresi + liste; usta / santral — salt
          okunur özet (üretimde aynı ekran salt mod).
        </span>
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3 shadow-neo-in dark:bg-gray-950/70">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <Factory className="size-4 shrink-0 text-gray-600 dark:text-gray-400" strokeWidth={1.75} aria-hidden />
          <span>
            <strong className="font-semibold text-gray-900 dark:text-gray-50">{factoryLabel}</strong>
            <span className="text-gray-500 dark:text-gray-400"> · {contextDetail}</span>
          </span>
        </div>
        <div className="flex w-full min-w-[min(100%,280px)] max-w-md gap-1 rounded-2xl bg-gray-100 p-1 shadow-neo-in dark:bg-gray-900/80">
          <button type="button" className={tabShift(shift === 'morning')} onClick={() => setShift('morning')}>
            <Sun className="size-4" aria-hidden />
            {t('productionSummary.shiftMorning')}
          </button>
          <button type="button" className={tabShift(shift === 'evening')} onClick={() => setShift('evening')}>
            <Sunset className="size-4" aria-hidden />
            {t('productionSummary.shiftEvening')}
          </button>
          <button type="button" className={tabShift(shift === 'night')} onClick={() => setShift('night')}>
            <Moon className="size-4" aria-hidden />
            {t('productionSummary.shiftNight')}
          </button>
        </div>
      </div>

      {/* P0 — protrude KPI */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('productionSummary.kpiPrimary')}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpiTiles.primary.map((row) => {
            const v = applyShiftFactor(row, factor)
            return (
              <div
                key={row.key}
                className="rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/90"
                title={row.hint}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {row.label}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-gray-50">
                  {v}
                  <span className="ml-1 text-lg font-semibold text-gray-500 dark:text-gray-400">{row.unit}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{row.hint}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('productionSummary.kpiSecondary')}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpiTiles.secondary.map((row) => {
            const v = applyShiftFactor(row, factor)
            return (
              <div
                key={row.key}
                className="rounded-2xl bg-gray-50 p-4 shadow-neo-out-sm dark:bg-gray-900/80"
                title={row.hint}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {row.label}
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-50">
                  {v}
                  <span className="ml-1 text-base font-semibold text-gray-500 dark:text-gray-400">{row.unit}</span>
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,320px)]">
        {/* P0 — inset kritik liste */}
        <section className="flex min-h-0 flex-col rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-950/80">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            {t('productionSummary.criticalTitle')}
          </h2>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t('productionSummary.criticalHint')}</p>
          <div className="mt-3 overflow-auto rounded-xl bg-gray-50 dark:bg-gray-900/60">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">{t('productionSummary.colOrder')}</th>
                  <th className="px-3 py-2 font-semibold">{t('productionSummary.colPart')}</th>
                  <th className="px-3 py-2 font-semibold">{t('productionSummary.colDelay')}</th>
                  <th className="px-3 py-2 font-semibold">{t('productionSummary.colTag')}</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCTION_CRITICAL_ROWS.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-200/80 dark:border-gray-700/80"
                  >
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-800 dark:text-gray-100">{r.orderNo}</td>
                    <td className="px-3 py-2.5 text-gray-900 dark:text-gray-50">{r.partName}</td>
                    <td className="px-3 py-2.5 tabular-nums text-gray-700 dark:text-gray-200">{r.delayDays}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded-full bg-gray-200/90 px-2 py-0.5 text-[11px] font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                        {r.tag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          {/* P1 — astların emirleri */}
          <section className="rounded-2xl border border-gray-200/80 bg-gray-50 p-4 shadow-neo-out-sm dark:border-gray-700 dark:bg-gray-900/80">
            <div className="flex items-start gap-2">
              <Users className="mt-0.5 size-4 shrink-0 text-gray-600 dark:text-gray-400" strokeWidth={1.75} />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {t('productionSummary.directReportsTitle')}
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{MOCK_DIRECT_REPORTS_OPEN_ORDERS.note}</p>
                <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-50">
                  {MOCK_DIRECT_REPORTS_OPEN_ORDERS.count}{' '}
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('productionSummary.openOrders')}</span>
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('unit-work-queue')}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gray-700 underline-offset-2 hover:underline dark:text-gray-300"
                >
                  {t('productionSummary.linkUnitWorkQueue')}
                  <ArrowRight className="size-3.5" aria-hidden />
                </button>
              </div>
            </div>
          </section>

          {/* P2 — sparkline */}
          <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-out-sm dark:bg-gray-900/80">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              {t('productionSummary.sparklineTitle')}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('productionSummary.sparklineHint')}</p>
            <div
              className="mt-4 flex h-24 items-end justify-between gap-1 rounded-xl bg-gray-100 px-2 pb-2 pt-4 shadow-neo-in dark:bg-gray-950/80"
              role="img"
              aria-label={t('productionSummary.sparklineAria')}
            >
              {WEEKLY_OUTPUT_SERIES.map((val, i) => (
                <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className="w-full max-w-[2rem] rounded-t-md bg-gray-400 dark:bg-gray-500"
                    style={{ height: `${(val / maxWeek) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                    {t('productionSummary.sparkDay', { n: String(i + 1) })}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 8 KPI tutarlı tablo (referans) */}
      <details className="rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-950/60">
        <summary className="cursor-pointer text-sm font-medium text-gray-800 dark:text-gray-100">
          {t('productionSummary.kpiTableSummary')}
        </summary>
        <div className="mt-3 overflow-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="py-2 pr-2 font-semibold">Alan</th>
                <th className="py-2 pr-2 font-semibold">Değer</th>
                <th className="py-2 font-semibold">Birim</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTION_KPI_BASE.map((row) => (
                <tr key={row.key} className="border-t border-gray-200/80 dark:border-gray-700/80">
                  <td className="py-2 pr-2 text-gray-900 dark:text-gray-50">{row.label}</td>
                  <td className="py-2 pr-2 font-mono tabular-nums text-gray-800 dark:text-gray-100">
                    {applyShiftFactor(row, factor)}
                  </td>
                  <td className="py-2 text-gray-600 dark:text-gray-400">{row.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onNavigate('mes')}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900"
        >
          {t('productionSummary.goMes')}
          <ArrowRight className="size-4" aria-hidden />
        </button>
        <label className="flex min-w-[12rem] flex-1 items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('productionSummary.demoRole')}</span>
          <select className={inset} defaultValue="chief" disabled title={t('productionSummary.demoRoleHint')}>
            <option value="chief">{t('productionSummary.roleChief')}</option>
            <option value="supervisor">{t('productionSummary.roleSupervisor')}</option>
            <option value="foreman">{t('productionSummary.roleForeman')}</option>
          </select>
        </label>
      </div>
    </div>
  )
}
