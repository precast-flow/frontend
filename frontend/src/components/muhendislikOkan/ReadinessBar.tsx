import type { ReadinessLevel } from './readinessEngine'

const BAR: Record<ReadinessLevel, string> = {
  red: 'from-red-500 to-rose-600 shadow-[0_0_12px_rgb(239_68_68/0.35)]',
  yellow: 'from-amber-400 to-amber-600 shadow-[0_0_12px_rgb(245_158_11/0.35)]',
  green: 'from-emerald-400 to-teal-600 shadow-[0_0_14px_rgb(16_185_129/0.45)]',
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
        <span className="font-semibold text-slate-800 dark:text-slate-100">{labelLeft}</span>
        <span className="tabular-nums font-bold text-slate-900 dark:text-slate-50">{p}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full border border-white/25 bg-slate-200/45 shadow-[inset_0_1px_3px_rgb(15_23_42/0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${BAR[level]} transition-all duration-300`}
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  )
}
