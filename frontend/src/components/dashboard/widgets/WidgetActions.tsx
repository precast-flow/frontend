import { useNavigate } from 'react-router-dom'
import { moduleIdToPath } from '../../../data/navigation'
import { actionsList } from '../dashboardData'
import type { WidgetInstance } from '../types'

const ROLE_COLORS: Record<string, string> = {
  satis: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  lojistik: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  uretim: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  yonetim: 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
}

type Props = { widget: WidgetInstance }

export function WidgetActions({ widget }: Props) {
  const navigate = useNavigate()
  const limit = widget.settings.limit ?? 6
  const rows = actionsList(limit)

  return (
    <ul className="dash-widget-scroll flex h-full min-h-0 flex-col gap-1.5 pr-1">
      {rows.map((row) => (
        <li key={row.id}>
          <button
            type="button"
            className="flex w-full items-start gap-2 rounded-xl border border-slate-200/60 bg-white/40 px-3 py-2.5 text-left transition hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            onClick={() => navigate(moduleIdToPath(row.moduleId))}
          >
            <span
              className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${ROLE_COLORS[row.roleTag] ?? ''}`}
            >
              {row.roleTag}
            </span>
            <span className="min-w-0 flex-1 text-sm text-[var(--glass-text-primary)]">{row.label}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
