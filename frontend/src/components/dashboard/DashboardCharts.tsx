import {
  monthlyProduction,
  lineUtilization,
  operationSnapshot,
  quoteStageCounts,
  weeklyDispatch,
} from '../../data/dashboardMock'

const card =
  'gm-glass-dashboard-card rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-800/90 md:p-5'
const cardTitle = 'text-sm font-semibold text-gray-900 dark:text-gray-50'
const cardHint = 'text-xs text-gray-500 dark:text-gray-400'
const chartInset =
  'gm-glass-dashboard-chart-inset mt-4 rounded-xl bg-gray-50/80 p-3 shadow-neo-in dark:bg-gray-950/60'

/** Aylık üretim — SVG çizgi + alan */
function ProductionTrendChart() {
  const values = monthlyProduction.map((d) => d.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const pad = 24
  const w = 560
  const h = 180
  const innerW = w - pad * 2
  const innerH = h - pad * 2
  const norm = (v: number) => {
    const t = max === min ? 0.5 : (v - min) / (max - min)
    return pad + innerH - t * innerH
  }
  const points = monthlyProduction
    .map((d, i) => {
      const x = pad + (innerW / (monthlyProduction.length - 1)) * i
      const y = norm(d.value)
      return `${x},${y}`
    })
    .join(' ')
  const areaPoints = `${pad},${h - pad} ${points} ${w - pad},${h - pad}`

  return (
    <div className={card}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={cardTitle}>Aylık üretim adedi</h3>
        <p className={cardHint}>Son 6 ay · MES onaylı</p>
      </div>
      <div className={chartInset}>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-44 w-full text-gray-700 dark:text-gray-300"
          role="img"
          aria-label="Aylık üretim trend grafiği"
        >
          <title>Aylık üretim trendi</title>
          <polygon
            fill="currentColor"
            fillOpacity={0.12}
            points={areaPoints}
            className="text-gray-600 dark:text-gray-400"
          />
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {monthlyProduction.map((d, i) => {
            const x = pad + (innerW / (monthlyProduction.length - 1)) * i
            const y = norm(d.value)
            return <circle key={d.month} cx={x} cy={y} r={4} fill="currentColor" />
          })}
        </svg>
        <div className="mt-2 flex justify-between px-1">
          {monthlyProduction.map((d) => (
            <span key={d.month} className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
              {d.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Hat doluluk — yatay çubuk */
function LineUtilizationChart() {
  return (
    <div className={card}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={cardTitle}>Hat doluluk / verim</h3>
        <p className={cardHint}>Anlık · %</p>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {lineUtilization.map((row) => (
          <li key={row.id}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium text-gray-800 dark:text-gray-200">{row.label}</span>
              <span className="tabular-nums text-gray-600 dark:text-gray-400">{row.percent}%</span>
            </div>
            <div className="gm-glass-chart-bar-track h-2.5 overflow-hidden rounded-full bg-gray-200/90 shadow-neo-in dark:bg-gray-950">
              <div
                className="gm-glass-chart-bar-fill h-full rounded-full bg-gray-600 shadow-neo-out-sm dark:bg-gray-400"
                style={{ width: `${row.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Haftalık sevkiyat plan vs gerçekleşen */
function WeeklyDispatchChart() {
  const max = Math.max(
    ...weeklyDispatch.flatMap((d) => [d.planned, d.actual]),
    1,
  )
  return (
    <div className={card}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={cardTitle}>Haftalık sevkiyat</h3>
        <p className={cardHint}>Plan (açık) · Gerçekleşen (koyu)</p>
      </div>
      <div className="mt-4 flex h-40 items-end justify-between gap-1 px-0.5">
        {weeklyDispatch.map((d) => (
          <div
            key={d.day}
            className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
          >
            <div className="flex w-full max-w-10 flex-col items-center justify-end gap-1">
              <div
                className="gm-glass-chart-col-planned w-full max-w-7 rounded-t-sm bg-gray-400/90 shadow-neo-out-sm dark:bg-gray-500/90"
                style={{ height: `${(d.planned / max) * 5.5}rem` }}
                title={`Plan: ${d.planned}`}
              />
              <div
                className="gm-glass-chart-col-actual w-full max-w-7 rounded-t-sm bg-gray-700 shadow-neo-out-sm dark:bg-gray-300"
                style={{ height: `${(d.actual / max) * 5.5}rem` }}
                title={`Gerçekleşen: ${d.actual}`}
              />
            </div>
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Teklif aşamaları — basit donut (SVG yay) */
function QuoteStageDonut() {
  const total = quoteStageCounts.reduce((s, x) => s + x.value, 0)
  const r = 52
  const c = 2 * Math.PI * r
  let offset = 0
  const segments = quoteStageCounts.map((seg, i) => {
    const frac = seg.value / total
    const dash = frac * c
    const el = (
      <circle
        key={seg.label}
        cx={64}
        cy={64}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={14}
        strokeDasharray={`${dash} ${c - dash}`}
        strokeDashoffset={-offset}
        className={
          i === 0
            ? 'text-gray-500 dark:text-gray-500'
            : i === 1
              ? 'text-gray-600 dark:text-gray-400'
              : i === 2
                ? 'text-gray-700 dark:text-gray-300'
                : 'text-gray-800 dark:text-gray-200'
        }
        transform="rotate(-90 64 64)"
      />
    )
    offset += dash
    return el
  })

  return (
    <div className={card}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={cardTitle}>Teklif aşamaları</h3>
        <p className={cardHint}>Açık işler · adet</p>
      </div>
      <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="gm-glass-dashboard-chart-inset rounded-full bg-gray-50/80 p-2 shadow-neo-in dark:bg-gray-950/50">
          <svg viewBox="0 0 128 128" className="size-36" role="img" aria-label="Teklif dağılımı">
            <title>Teklif aşamaları donut grafiği</title>
            {segments}
          </svg>
          <p className="sr-only">
            {quoteStageCounts.map((s) => `${s.label}: ${s.value}`).join(', ')}
          </p>
        </div>
        <ul className="flex w-full flex-col gap-2 text-xs sm:flex-1">
          {quoteStageCounts.map((s, i) => (
            <li key={s.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${
                    i === 0
                      ? 'bg-gray-500'
                      : i === 1
                        ? 'bg-gray-600'
                        : i === 2
                          ? 'bg-gray-700 dark:bg-gray-400'
                          : 'bg-gray-800 dark:bg-gray-200'
                  }`}
                  aria-hidden
                />
                {s.label}
              </span>
              <span className="font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                {s.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Operasyon özeti — mini sayılar (başlık üst bölümde) */
export function OperationSnapshotCard() {
  return (
    <div className={card}>
      <ul className="flex flex-col gap-3">
        {operationSnapshot.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between rounded-xl bg-gray-50/90 px-3 py-2.5 shadow-neo-in dark:bg-gray-950/50"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">{row.label}</span>
            <span className="text-right">
              <span className="text-lg font-bold tabular-nums text-gray-900 dark:text-gray-50">
                {row.value}
              </span>
              <span className="ml-1.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                {row.hint}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DashboardCharts() {
  return (
    <div className="gm-glass-dashboard-charts-root flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <ProductionTrendChart />
        </div>
        <div className="xl:col-span-4">
          <QuoteStageDonut />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <LineUtilizationChart />
        <WeeklyDispatchChart />
      </div>
    </div>
  )
}
