import { useI18n } from '../../i18n/I18nProvider'
import type { WidgetType } from './types'
import { widgetIconFor } from './widgetIcons'
import type { CatalogDragPayload } from './catalogDragState'
import type { DropPreviewRect } from './gridDropUtils'

const TYPE_LABEL: Record<WidgetType, string> = {
  notifications: 'dashboard.widget.notifications',
  actions: 'dashboard.widget.actions',
  list: 'dashboard.widget.list',
  chart: 'dashboard.widget.chart',
  kpi: 'dashboard.widget.kpi',
  gauge: 'dashboard.widget.gauge',
  heatmap: 'dashboard.widget.heatmap',
  funnel: 'dashboard.widget.funnel',
  topn: 'dashboard.widget.topn',
  calendar: 'dashboard.widget.calendar',
  activity: 'dashboard.widget.activity',
  quickActions: 'dashboard.widget.quickActions',
  markdown: 'dashboard.widget.text',
  text: 'dashboard.widget.text',
  clock: 'dashboard.widget.clock',
  map: 'dashboard.widget.map',
  moldStatus: 'dashboard.widget.moldStatus',
  iframe: 'dashboard.widget.iframe',
  weather: 'dashboard.widget.weather',
  currency: 'dashboard.widget.currency',
}

type Props = {
  drag: CatalogDragPayload
  rect: DropPreviewRect
}

export function DashboardDropPreview({ drag, rect }: Props) {
  const { t } = useI18n()
  const Icon = widgetIconFor(drag.type)

  return (
    <div
      className="dashboard-drop-preview absolute z-30 flex flex-col overflow-hidden"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
      aria-hidden
    >
      <div className="flex h-full flex-col items-center justify-center gap-1.5 px-2 text-center">
        <Icon className="size-5 text-sky-600/80 dark:text-cyan-400/80" strokeWidth={1.75} />
        <span className="line-clamp-2 text-[10px] font-medium text-slate-700 dark:text-slate-200">
          {t(TYPE_LABEL[drag.type])}
        </span>
      </div>
    </div>
  )
}
