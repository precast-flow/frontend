import type { DashboardDoc, LayoutItem, ResponsiveLayouts, WidgetInstance } from './types'

export const DASHBOARD_STORAGE_KEY = 'precast-dashboards-v1'

function wid(): string {
  return `w-${crypto.randomUUID().slice(0, 8)}`
}

const kpi1 = wid()
const kpi2 = wid()
const kpi3 = wid()
const kpi4 = wid()
const notif = wid()
const actions = wid()
const chart = wid()

const seedWidgets: WidgetInstance[] = [
  {
    id: kpi1,
    type: 'kpi',
    settings: { title: 'Açık proje', kpiKey: 'projects' },
  },
  {
    id: kpi2,
    type: 'kpi',
    settings: { title: 'Bugün üretilen', kpiKey: 'produced' },
  },
  {
    id: kpi3,
    type: 'kpi',
    settings: { title: 'Saha stok', kpiKey: 'yard' },
  },
  {
    id: kpi4,
    type: 'kpi',
    settings: { title: 'Sevkiyat', kpiKey: 'dispatch' },
  },
  {
    id: notif,
    type: 'notifications',
    settings: { notificationFilter: 'all', limit: 8 },
  },
  {
    id: actions,
    type: 'actions',
    settings: { limit: 6 },
  },
  {
    id: chart,
    type: 'chart',
    settings: {
      title: 'Aylık üretim',
      chartType: 'line',
      dataSource: 'monthlyProduction',
    },
  },
]

const lgLayout: LayoutItem[] = [
  { i: kpi1, x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: kpi2, x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: kpi3, x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: kpi4, x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: chart, x: 0, y: 2, w: 8, h: 5, minW: 4, minH: 3 },
  { i: notif, x: 8, y: 2, w: 4, h: 5, minW: 3, minH: 3 },
  { i: actions, x: 0, y: 7, w: 12, h: 4, minW: 4, minH: 3 },
]

export function layoutsFromLg(lg: LayoutItem[]): ResponsiveLayouts {
  return {
    lg,
    md: lg.map((item) => ({ ...item, w: Math.min(item.w, 10) })),
    sm: lg.map((item) => ({ ...item, w: Math.min(item.w, 6), x: 0 })),
    xs: lg.map((item, idx) => ({
      ...item,
      x: 0,
      w: 4,
      y: idx * (item.h ?? 2),
    })),
    xxs: lg.map((item, idx) => ({
      ...item,
      x: 0,
      w: 2,
      y: idx * (item.h ?? 2),
    })),
  }
}

export function createDefaultDashboard(name = 'Varsayılan Pano'): DashboardDoc {
  const id = `dash-${crypto.randomUUID().slice(0, 8)}`
  return {
    id,
    name,
    widgets: seedWidgets.map((w) => ({ ...w, id: w.id })),
    layouts: layoutsFromLg(lgLayout),
    updatedAt: Date.now(),
  }
}

export type DashboardTemplateId = 'default' | 'production' | 'empty'

export type DashboardTemplateMeta = {
  id: DashboardTemplateId
  nameKey: string
  descKey: string
}

export const DASHBOARD_TEMPLATES: DashboardTemplateMeta[] = [
  {
    id: 'default',
    nameKey: 'dashboard.templates.default',
    descKey: 'dashboard.templates.defaultDesc',
  },
  {
    id: 'production',
    nameKey: 'dashboard.templates.production',
    descKey: 'dashboard.templates.productionDesc',
  },
  {
    id: 'empty',
    nameKey: 'dashboard.templates.empty',
    descKey: 'dashboard.templates.emptyDesc',
  },
]

export function createProductionDashboard(name = 'Üretim panosu'): DashboardDoc {
  const mold = wid()
  const k1 = wid()
  const k2 = wid()
  const act = wid()
  const widgets: WidgetInstance[] = [
    { id: k1, type: 'kpi', settings: { kpiKey: 'produced' } },
    { id: k2, type: 'kpi', settings: { kpiKey: 'yard' } },
    { id: mold, type: 'moldStatus', settings: { showEmptyMolds: true } },
    { id: act, type: 'actions', settings: { limit: 5 } },
  ]
  const lg: LayoutItem[] = [
    { i: k1, x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: k2, x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: mold, x: 0, y: 2, w: 12, h: 8, minW: 6, minH: 5 },
    { i: act, x: 0, y: 10, w: 6, h: 4, minW: 4, minH: 3 },
  ]
  const id = `dash-${crypto.randomUUID().slice(0, 8)}`
  return {
    id,
    name,
    widgets,
    layouts: layoutsFromLg(lg),
    updatedAt: Date.now(),
  }
}

export function createDashboardFromTemplate(
  templateId: DashboardTemplateId,
  name?: string,
): DashboardDoc {
  switch (templateId) {
    case 'production':
      return createProductionDashboard(name)
    case 'empty':
      return createEmptyDashboard(name ?? 'Yeni pano')
    default:
      return createDefaultDashboard(name ?? 'Varsayılan Pano')
  }
}

export function createEmptyDashboard(name: string): DashboardDoc {
  const id = `dash-${crypto.randomUUID().slice(0, 8)}`
  return {
    id,
    name,
    widgets: [],
    layouts: { lg: [], md: [], sm: [], xs: [], xxs: [] },
    updatedAt: Date.now(),
  }
}

export function nextWidgetLayout(
  existing: readonly LayoutItem[],
  widgetId: string,
  w: number,
  h: number,
  minW = 2,
  minH = 2,
): LayoutItem {
  const maxY = existing.reduce((acc, item) => Math.max(acc, (item.y ?? 0) + (item.h ?? 1)), 0)
  return { i: widgetId, x: 0, y: maxY, w, h, minW, minH }
}

export function layoutItemAt(
  widgetId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  cols = 12,
  minW = 2,
  minH = 2,
): LayoutItem {
  const clampedX = Math.max(0, Math.min(x, cols - w))
  return { i: widgetId, x: clampedX, y: Math.max(0, y), w, h, minW, minH }
}
