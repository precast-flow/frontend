import {
  dashboardKpiAggregate,
  dashboardKpiSingle,
  dashboardTodos,
  lineUtilization,
  monthlyProduction,
  quoteStageCounts,
  weeklyDispatch,
} from '../../data/dashboardMock'
import { PRODUCTION_KPI_BASE } from '../../data/productionSummaryMock'
import { QUALITY_DASHBOARD_KPIS } from '../../data/qualityDashboardMock'
import { crmCustomers } from '../../data/crmCustomers'
import { quotes } from '../../data/quotesMock'
import { projectManagementCardsMock } from '../../data/projectManagementCardsMock'
import { MOCK_UNIT_WORK_ASSIGNED_TO } from '../../data/mockUnitWorkQueue'
import type { ChartType, DataSourceKey, ListDataSourceKey } from './types'

export function kpiValueForKey(key: string, aggregate: boolean): string {
  const src = aggregate ? dashboardKpiAggregate : dashboardKpiSingle
  const map: Record<string, string> = {
    projects: src.projects,
    produced: src.produced,
    yard: src.yard,
    dispatch: src.dispatch,
    approvals: src.approvals,
  }
  return map[key] ?? '—'
}

export type ChartPoint = { label: string; value: number; value2?: number }

export function chartDataForSource(source: DataSourceKey): ChartPoint[] {
  switch (source) {
    case 'monthlyProduction':
      return monthlyProduction.map((r) => ({ label: r.month, value: r.value }))
    case 'quoteStages':
      return quoteStageCounts.map((r) => ({ label: r.label, value: r.value }))
    case 'lineUtilization':
      return lineUtilization.map((r) => ({ label: r.label, value: r.percent }))
    case 'dispatch':
      return weeklyDispatch.map((r) => ({
        label: r.day,
        value: r.planned,
        value2: r.actual,
      }))
    case 'productionSummary':
      return PRODUCTION_KPI_BASE.slice(0, 6).map((r) => ({
        label: r.label.split(' ').slice(0, 2).join(' '),
        value: r.value,
      }))
    case 'quality':
      return QUALITY_DASHBOARD_KPIS.map((r) => ({
        label: r.key,
        value: r.value,
      }))
    case 'reporting':
      return [
        { label: 'Pzt', value: 12 },
        { label: 'Sal', value: 18 },
        { label: 'Çar', value: 15 },
        { label: 'Per', value: 22 },
        { label: 'Cum', value: 19 },
      ]
    case 'generalPlanning':
      return [
        { label: 'Hafta 1', value: 40 },
        { label: 'Hafta 2', value: 52 },
        { label: 'Hafta 3', value: 48 },
        { label: 'Hafta 4', value: 61 },
      ]
    default:
      return monthlyProduction.map((r) => ({ label: r.month, value: r.value }))
  }
}

export type ListRow = { id: string; primary: string; secondary?: string; meta?: string }

export function listDataForSource(source: ListDataSourceKey, limit: number): ListRow[] {
  switch (source) {
    case 'customers':
      return crmCustomers.slice(0, limit).map((c) => ({
        id: c.id,
        primary: c.name,
        secondary: c.city ?? c.sector,
        meta: c.status,
      }))
    case 'quotes':
      return quotes.slice(0, limit).map((q) => ({
        id: q.id,
        primary: q.number,
        secondary: q.customer,
        meta: q.status,
      }))
    case 'projects':
      return projectManagementCardsMock.slice(0, limit).map((p) => ({
        id: p.id,
        primary: p.name,
        secondary: p.customer,
        meta: p.status,
      }))
    case 'workOrders':
      return MOCK_UNIT_WORK_ASSIGNED_TO.slice(0, limit).map((w) => ({
        id: w.id,
        primary: w.workOrderNo,
        secondary: w.projectCode,
        meta: w.status,
      }))
    case 'dailyReports':
      return [
        { id: 'dr1', primary: 'GÜR-2026-0412', secondary: 'Hat A', meta: 'Onaylı' },
        { id: 'dr2', primary: 'GÜR-2026-0411', secondary: 'Hat B', meta: 'Taslak' },
        { id: 'dr3', primary: 'GÜR-2026-0410', secondary: 'Hat C', meta: 'Onaylı' },
      ].slice(0, limit)
    case 'ncrs':
      return [
        { id: 'ncr1', primary: 'NCR-2026-088', secondary: 'WO-885', meta: 'Açık' },
        { id: 'ncr2', primary: 'NCR-2026-087', secondary: 'WO-882', meta: 'İncelemede' },
      ].slice(0, limit)
    default:
      return []
  }
}

export function actionsList(limit: number) {
  return dashboardTodos.slice(0, limit)
}

export function heatmapCells(): { day: number; value: number }[] {
  return Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    value: Math.floor(Math.random() * 8) + 1,
  }))
}

export const CHART_TYPES: ChartType[] = [
  'line',
  'bar',
  'area',
  'pie',
  'donut',
  'radial',
  'stackedBar',
  'sparkline',
]
