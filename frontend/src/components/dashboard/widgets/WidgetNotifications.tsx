import { useNavigate } from 'react-router-dom'
import { useNotificationFeed } from '../../../context/NotificationFeedContext'
import { useWorkQueueOptional } from '../../../context/WorkQueueContext'
import { dailyProductionReportDetailPath } from '../../../data/dailyProductionReportPaths'
import { qualityControlReportDetailPath } from '../../../data/qualityControlReportPaths'
import { moduleIdToPath } from '../../../data/navigation'
import type { WidgetInstance } from '../types'

type Props = { widget: WidgetInstance; onModuleNavigate?: (id: string) => void }

export function WidgetNotifications({ widget, onModuleNavigate }: Props) {
  const { items } = useNotificationFeed()
  const navigate = useNavigate()
  const workQueue = useWorkQueueOptional()
  const filter = widget.settings.notificationFilter ?? 'all'
  const limit = widget.settings.limit ?? 8

  const filtered = items
    .filter((n) => {
      if (filter === 'high') return n.title.toLowerCase().includes('ret') || n.title.includes('onay')
      return true
    })
    .slice(0, limit)

  return (
    <ul className="dash-widget-scroll flex h-full min-h-0 flex-col gap-1 pr-1">
      {filtered.map((n) => (
        <li key={n.id}>
          <button
            type="button"
            className="flex w-full flex-col gap-0.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-slate-100/80 dark:hover:bg-white/8"
            onClick={() => {
              if (n.openDailyReportId) {
                navigate(dailyProductionReportDetailPath(n.openDailyReportId))
                return
              }
              if (n.openQualityReportProductionId) {
                navigate(qualityControlReportDetailPath(n.openQualityReportProductionId))
                return
              }
              if (n.moduleId === 'unit-work-queue' && workQueue) {
                workQueue.requestWorkQueueNav({
                  workQueueId: n.workQueueId,
                  openNcReportId: n.nonconformanceId,
                })
              }
              onModuleNavigate?.(n.moduleId)
              navigate(moduleIdToPath(n.moduleId))
            }}
          >
            <span className="text-sm font-medium text-[var(--glass-text-primary)]">{n.title}</span>
            <span className="text-xs text-[var(--glass-text-muted)]">{n.detail}</span>
            <span className="text-[10px] text-slate-400">{n.time}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
