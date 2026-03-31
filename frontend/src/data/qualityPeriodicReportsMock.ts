/**
 * qual-08 — Periyodik rapor listesi mock (8 satır).
 */

export type PeriodicReportStatus = 'draft' | 'approved' | 'pending_delivery' | 'delivered'

export type PeriodicReportRow = {
  id: string
  nameKey: string
  periodKey: string
  status: PeriodicReportStatus
  /** Son teslim tarihi (ISO) */
  dueDate: string
}

export const MOCK_PERIODIC_REPORTS: PeriodicReportRow[] = [
  {
    id: 'pr1',
    nameKey: 'qualityPeriodic.row.name1',
    periodKey: 'qualityPeriodic.row.period.w11',
    status: 'pending_delivery',
    dueDate: '2025-03-21',
  },
  {
    id: 'pr2',
    nameKey: 'qualityPeriodic.row.name2',
    periodKey: 'qualityPeriodic.row.period.m3',
    status: 'approved',
    dueDate: '2025-03-25',
  },
  {
    id: 'pr3',
    nameKey: 'qualityPeriodic.row.name3',
    periodKey: 'qualityPeriodic.row.period.w10',
    status: 'delivered',
    dueDate: '2025-03-14',
  },
  {
    id: 'pr4',
    nameKey: 'qualityPeriodic.row.name4',
    periodKey: 'qualityPeriodic.row.period.m2',
    status: 'draft',
    dueDate: '2025-03-28',
  },
  {
    id: 'pr5',
    nameKey: 'qualityPeriodic.row.name5',
    periodKey: 'qualityPeriodic.row.period.w11',
    status: 'delivered',
    dueDate: '2025-03-15',
  },
  {
    id: 'pr6',
    nameKey: 'qualityPeriodic.row.name6',
    periodKey: 'qualityPeriodic.row.period.q1',
    status: 'pending_delivery',
    dueDate: '2025-03-22',
  },
  {
    id: 'pr7',
    nameKey: 'qualityPeriodic.row.name7',
    periodKey: 'qualityPeriodic.row.period.m3',
    status: 'draft',
    dueDate: '2025-04-05',
  },
  {
    id: 'pr8',
    nameKey: 'qualityPeriodic.row.name8',
    periodKey: 'qualityPeriodic.row.period.w12',
    status: 'approved',
    dueDate: '2025-03-29',
  },
]

export function canOpenDeliveryModal(status: PeriodicReportStatus): boolean {
  return status === 'approved' || status === 'pending_delivery'
}
