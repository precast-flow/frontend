import type { ReadinessLevel } from './readinessEngine'

const STYLES: Record<ReadinessLevel, string> = {
  red: 'bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-100',
  yellow: 'bg-amber-100 text-amber-950 dark:bg-amber-950/80 dark:text-amber-100',
  green: 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-100',
}

type Props = {
  level: ReadinessLevel
  label: string
  className?: string
}

export function ReadinessBadge({ level, label, className }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-neo-out-sm ${STYLES[level]} ${className ?? ''}`}
    >
      {label}
    </span>
  )
}
