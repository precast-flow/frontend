import type { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout'

export type { Layout, LayoutItem, ResponsiveLayouts }

export type WidgetType =
  | 'notifications'
  | 'actions'
  | 'list'
  | 'chart'
  | 'kpi'
  | 'gauge'
  | 'heatmap'
  | 'funnel'
  | 'topn'
  | 'calendar'
  | 'activity'
  | 'quickActions'
  | 'markdown'
  | 'text'
  | 'clock'
  | 'map'
  | 'moldStatus'
  | 'iframe'
  | 'weather'
  | 'currency'

export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'pie'
  | 'donut'
  | 'radial'
  | 'stackedBar'
  | 'sparkline'

export type DataSourceKey =
  | 'productionSummary'
  | 'quality'
  | 'dispatch'
  | 'reporting'
  | 'generalPlanning'
  | 'monthlyProduction'
  | 'quoteStages'
  | 'lineUtilization'

export type ListDataSourceKey =
  | 'customers'
  | 'quotes'
  | 'projects'
  | 'workOrders'
  | 'dailyReports'
  | 'ncrs'

export type NotificationFilter = 'all' | 'unread' | 'high'

export type WidgetSettings = {
  title?: string
  chartType?: ChartType
  dataSource?: DataSourceKey
  listSource?: ListDataSourceKey
  limit?: number
  notificationFilter?: NotificationFilter
  kpiKey?: string
  note?: string
  gaugeValue?: number
  gaugeMax?: number
  /** YYYY-MM-DD — boş = bugün */
  moldViewDate?: string
  showEmptyMolds?: boolean
  /** `all` veya bant id (L1, L2, …) */
  moldBandFilter?: string
  /** Virgülle: USD,EUR,GBP */
  currencySymbols?: string
  /** preset | geolocation */
  weatherLocationMode?: string
  weatherCity?: string
  /** marmara | ege | … | all */
  weatherRegion?: string
  weatherLat?: number
  weatherLon?: number
  weatherPlaceName?: string
  /** Widget üst şeridi — varsayılan kapalı */
  showHeader?: boolean
  textContent?: string
  textAlign?: 'left' | 'center' | 'right'
  textSize?: 'sm' | 'md' | 'lg' | 'xl'
  textColor?: 'default' | 'muted' | 'sky' | 'emerald' | 'amber' | 'rose' | 'violet'
  textWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
  textVAlign?: 'start' | 'center' | 'end'
  /** topn widget */
  topnSource?: ListDataSourceKey
  showKpiTrend?: boolean
}

export type WidgetInstance = {
  id: string
  type: WidgetType
  settings: WidgetSettings
}

export type DashboardDoc = {
  id: string
  name: string
  widgets: WidgetInstance[]
  layouts: ResponsiveLayouts
  updatedAt: number
}

export type DashboardPersistedState = {
  dashboards: DashboardDoc[]
  activeDashboardId: string
}

export type WidgetCatalogEntry = {
  type: WidgetType
  categoryKey: string
  defaultW: number
  defaultH: number
  minW?: number
  minH?: number
  comingSoon?: boolean
  defaultSettings?: WidgetSettings
}
