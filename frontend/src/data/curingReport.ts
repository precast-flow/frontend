import type { CuringFlowState } from './productionWorkOrderFlow'
import { resolveWorkQueueName, type WorkQueueItem } from './workQueueMock'

export type CuringReport = {
  id: string
  reportNo: string
  curingWorkQueueId: string
  createdAt: number
  projectCode: string
  projectName: string
  projectRouteId: string | null
  productCode: string
  productName: string
  moldId?: string
  moldName?: string
  productionOrderNo: string
  curingOrderNo: string
  shiftLabel: string
  factoryCode: string
  curerUserId: string | null
  curerName: string
  curingStartedAt: number
  steamOffDueAt: number
  steamWarningAt: number
  steamAcknowledgedAt: number
  waitPeriodStartAt: number
  waitPeriodEndAt: number
  curingCompletedAt: number
  totalCuringMs: number
  steamShutoffDelayed: boolean
  steamDelayMs: number
}

export function formatReportDateTime(ms: number, locale = 'tr-TR'): string {
  return new Date(ms).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatDurationMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h} sa ${m} dk ${s} sn`
  if (m > 0) return `${m} dk ${s} sn`
  return `${s} sn`
}

export function buildCuringReport(
  curingItem: WorkQueueItem,
  flow: CuringFlowState,
  completedAt: number,
): CuringReport | null {
  if (
    flow.startedAt == null ||
    flow.steamOffDueAt == null ||
    flow.steamAcknowledgedAt == null
  ) {
    return null
  }

  const steamWarningAt = flow.steamWarningAt ?? flow.steamOffDueAt
  const steamDelayMs = Math.max(0, flow.steamAcknowledgedAt - flow.steamOffDueAt)
  const steamShutoffDelayed = steamDelayMs > 0
  const waitPeriodStartAt = flow.steamAcknowledgedAt
  const waitPeriodEndAt = completedAt
  const totalCuringMs = completedAt - flow.startedAt

  const stamp = completedAt
  const reportNo = `KR-${curingItem.orderNo.replace(/[^A-Z0-9]/gi, '')}-${String(stamp).slice(-6)}`

  return {
    id: `cr-${curingItem.id}`,
    reportNo,
    curingWorkQueueId: curingItem.id,
    createdAt: completedAt,
    projectCode: curingItem.projectCode,
    projectName: curingItem.projectName,
    projectRouteId: curingItem.projectRouteId ?? null,
    productCode: curingItem.productCode ?? '—',
    productName: curingItem.productName ?? curingItem.title,
    moldId: curingItem.moldId,
    moldName: curingItem.moldName,
    productionOrderNo: curingItem.sourceProductionOrderNo ?? '—',
    curingOrderNo: curingItem.orderNo,
    shiftLabel: curingItem.shiftLabel ?? '—',
    factoryCode: curingItem.factoryCode,
    curerUserId: curingItem.assigneeUserId,
    curerName: curingItem.assigneeUserId
      ? resolveWorkQueueName(curingItem.assigneeUserId)
      : '—',
    curingStartedAt: flow.startedAt,
    steamOffDueAt: flow.steamOffDueAt,
    steamWarningAt,
    steamAcknowledgedAt: flow.steamAcknowledgedAt,
    waitPeriodStartAt,
    waitPeriodEndAt,
    curingCompletedAt: completedAt,
    totalCuringMs,
    steamShutoffDelayed,
    steamDelayMs,
  }
}
