import { TrendingDown, TrendingUp } from 'lucide-react'
import { useFactoryContext } from '../../../context/FactoryContext'
import { kpiValueForKey } from '../dashboardData'
import type { WidgetInstance } from '../types'

type Props = { widget: WidgetInstance }

export function WidgetKpi({ widget }: Props) {
  const { selectedCodes } = useFactoryContext()
  const aggregate = selectedCodes.length > 1
  const key = widget.settings.kpiKey ?? 'projects'
  const value = kpiValueForKey(key, aggregate)
  const showTrend = widget.settings.showKpiTrend !== false
  const trendUp = key !== 'yard'

  return (
    <div className="flex h-full flex-col justify-center gap-1 px-1">
      <p className="text-3xl font-semibold tabular-nums tracking-tight text-[var(--glass-text-primary)] md:text-4xl">
        {value}
      </p>
      {showTrend ? (
        <p className="flex items-center gap-1 text-xs text-[var(--glass-text-muted)]">
          {trendUp ? (
            <TrendingUp className="size-3.5 text-emerald-500" aria-hidden />
          ) : (
            <TrendingDown className="size-3.5 text-amber-500" aria-hidden />
          )}
          <span>{trendUp ? '+4.2%' : '-1.1%'} · 7g</span>
        </p>
      ) : null}
    </div>
  )
}
