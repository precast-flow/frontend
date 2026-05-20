import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  Clock,
  CircleDollarSign,
  Cloud,
  Factory,
  FileText,
  Filter,
  Gauge,
  Globe,
  Grid3x3,
  Hash,
  List,
  ListChecks,
  Map,
  Trophy,
  Zap,
} from 'lucide-react'
import type { WidgetType } from './types'

const WIDGET_ICONS: Record<WidgetType, LucideIcon> = {
  kpi: Hash,
  notifications: Bell,
  actions: ListChecks,
  list: List,
  chart: BarChart3,
  gauge: Gauge,
  heatmap: Grid3x3,
  funnel: Filter,
  topn: Trophy,
  calendar: Calendar,
  activity: Activity,
  quickActions: Zap,
  markdown: FileText,
  text: FileText,
  clock: Clock,
  map: Map,
  moldStatus: Factory,
  iframe: Globe,
  weather: Cloud,
  currency: CircleDollarSign,
}

export function widgetIconFor(type: WidgetType): LucideIcon {
  return WIDGET_ICONS[type]
}
