import type { ReadinessLevel } from './readinessEngine'

const STYLES: Record<ReadinessLevel, string> = {
  red:
    'border border-red-400/35 bg-red-100/45 text-red-900 shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] backdrop-blur-md dark:border-red-500/25 dark:bg-red-950/40 dark:text-red-100',
  yellow:
    'border border-amber-400/40 bg-amber-100/50 text-amber-950 shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] backdrop-blur-md dark:border-amber-400/25 dark:bg-amber-950/35 dark:text-amber-100',
  green:
    'border border-emerald-400/35 bg-emerald-100/45 text-emerald-950 shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] backdrop-blur-md dark:border-emerald-400/25 dark:bg-emerald-950/35 dark:text-emerald-100',
}

type Props = {
  level: ReadinessLevel
  label: string
  className?: string
}

export function ReadinessBadge({ level, label, className }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[level]} ${className ?? ''}`}
    >
      {label}
    </span>
  )
}
