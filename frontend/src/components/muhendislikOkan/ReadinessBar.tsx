import type { ReadinessLevel } from './readinessEngine'

const BAR: Record<ReadinessLevel, string> = {
  red: 'bg-red-500 dark:bg-red-600',
  yellow: 'bg-amber-500 dark:bg-amber-500',
  green: 'bg-emerald-500 dark:bg-emerald-600',
}

type Props = {
  percent: number
  level: ReadinessLevel
  labelLeft: string
}

export function ReadinessBar({ percent, level, labelLeft }: Props) {
  const p = Math.max(0, Math.min(100, percent))
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-gray-800 dark:text-gray-100">{labelLeft}</span>
        <span className="tabular-nums font-bold text-gray-900 dark:text-gray-50">{p}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-neo-in dark:bg-gray-800/90">
        <div
          className={`h-full rounded-full transition-all duration-300 ${BAR[level]}`}
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  )
}
