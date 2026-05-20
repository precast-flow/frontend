import type { WidgetInstance, WidgetType } from './types'
import { WidgetActions } from './widgets/WidgetActions'
import { WidgetChart } from './widgets/WidgetChart'
import { WidgetKpi } from './widgets/WidgetKpi'
import { WidgetList } from './widgets/WidgetList'
import {
  WidgetActivity,
  WidgetCalendar,
  WidgetClock,
  WidgetFunnel,
  WidgetGauge,
  WidgetHeatmap,
  WidgetMap,
  WidgetQuickActions,
  WidgetTopN,
} from './widgets/WidgetMisc'
import { WidgetText } from './widgets/WidgetText'
import { WidgetNotifications } from './widgets/WidgetNotifications'
import { WidgetMoldStatus } from './widgets/WidgetMoldStatus'
import { WidgetCurrency } from './widgets/WidgetCurrency'
import { WidgetWeather } from './widgets/WidgetWeather'

type Props = {
  widget: WidgetInstance
  onModuleNavigate?: (id: string) => void
}

const TITLE_KEYS: Record<WidgetType, string> = {
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

export function widgetTitle(widget: WidgetInstance, t: (k: string) => string): string {
  if (widget.settings.showHeader !== true) return ''
  if (widget.settings.title?.trim()) return widget.settings.title.trim()
  return t(TITLE_KEYS[widget.type] ?? 'dashboard.widget.unknown')
}

export function WidgetContent({ widget, onModuleNavigate }: Props) {
  switch (widget.type) {
    case 'notifications':
      return <WidgetNotifications widget={widget} onModuleNavigate={onModuleNavigate} />
    case 'actions':
      return <WidgetActions widget={widget} />
    case 'list':
      return <WidgetList widget={widget} />
    case 'chart':
      return <WidgetChart widget={widget} />
    case 'kpi':
      return <WidgetKpi widget={widget} />
    case 'gauge':
      return <WidgetGauge widget={widget} />
    case 'heatmap':
      return <WidgetHeatmap />
    case 'funnel':
      return <WidgetFunnel widget={widget} />
    case 'topn':
      return <WidgetTopN widget={widget} />
    case 'calendar':
      return <WidgetCalendar />
    case 'activity':
      return <WidgetActivity widget={widget} />
    case 'quickActions':
      return <WidgetQuickActions />
    case 'markdown':
    case 'text':
      return <WidgetText widget={widget} />
    case 'clock':
      return <WidgetClock />
    case 'map':
      return <WidgetMap />
    case 'moldStatus':
      return <WidgetMoldStatus widget={widget} />
    case 'currency':
      return <WidgetCurrency widget={widget} />
    case 'weather':
      return <WidgetWeather widget={widget} />
    case 'iframe':
      return (
        <p className="flex h-full items-center justify-center text-sm text-[var(--glass-text-muted)]">
          Yakında
        </p>
      )
    default:
      return null
  }
}
