import { listDataForSource } from '../dashboardData'
import type { WidgetInstance } from '../types'

type Props = { widget: WidgetInstance }

export function WidgetList({ widget }: Props) {
  const source = widget.settings.listSource ?? 'projects'
  const limit = widget.settings.limit ?? 8
  const rows = listDataForSource(source, limit)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <table className="w-full min-w-0 text-left text-sm">
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-slate-200/50 last:border-0 dark:border-white/8"
            >
              <td className="py-2 pr-2">
                <p className="truncate font-medium text-[var(--glass-text-primary)]">{row.primary}</p>
                {row.secondary ? (
                  <p className="truncate text-xs text-[var(--glass-text-muted)]">{row.secondary}</p>
                ) : null}
              </td>
              {row.meta ? (
                <td className="py-2 text-right text-xs text-[var(--glass-text-muted)]">{row.meta}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
