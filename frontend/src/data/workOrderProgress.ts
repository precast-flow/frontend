import {
  alreadyPourApproved,
  alreadyWarehouseApproved,
  createInitialCuringFlowState,
  createInitialPourFlowState,
  createInitialProductionFlowState,
  createInitialSampleFlowState,
  isProductionParentOrder,
  PRE_POUR_CHECKS,
  shouldAutoCompleteCuring,
  type CuringFlowState,
  type PourOrderFlowState,
  type ProductionWorkOrderFlowState,
  type SampleOrderFlowState,
} from './productionWorkOrderFlow'
import type { NonconformanceRecord } from './productionQualityControl'
import { nonconformanceStatusRank } from './productionQualityControl'
import type { WorkQueueItem, WorkQueueStatus } from './workQueueMock'

export type WorkOrderProgressSnapshot = {
  percent: number
  labelKey: string
  labelParams?: Record<string, string>
}

export type WorkOrderProgressContext = {
  getProductionFlowState: (id: string) => ProductionWorkOrderFlowState
  getCuringFlowState: (id: string) => CuringFlowState
  getPourFlowState: (id: string) => PourOrderFlowState
  getSampleFlowState: (id: string) => SampleOrderFlowState
  hasCuringReportForOrder: (productionId: string) => boolean
  getNonconformance?: (id: string) => NonconformanceRecord | undefined
}

function pct(done: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((done / total) * 100)
}

function fromStatus(status: WorkQueueStatus): WorkOrderProgressSnapshot {
  const percent = status === 'tamamlandi' ? 100 : status === 'islemde' ? 50 : status === 'bloke' ? 15 : 8
  return {
    percent,
    labelKey: `unitWorkQueue.status.${status}`,
  }
}

function productionParentProgress(
  item: WorkQueueItem,
  ctx: WorkOrderProgressContext,
): WorkOrderProgressSnapshot {
  const flow = ctx.getProductionFlowState(item.id)
  const checksDone = PRE_POUR_CHECKS.filter((c) => flow.checklist[c.id]).length
  const checksTotal = PRE_POUR_CHECKS.length
  const hasCuring = ctx.hasCuringReportForOrder(item.id)
  const pourDone = alreadyPourApproved(flow)
  const warehouseDone = alreadyWarehouseApproved(flow)

  let steps = 0
  let done = 0
  steps += 1
  if (checksDone === checksTotal) done += 1
  steps += 1
  if (pourDone) done += 1
  steps += 1
  if (hasCuring) done += 1
  steps += 1
  if (flow.postPour.labelingDone) done += 1
  steps += 1
  if (flow.postPour.surfaceCleaningDone) done += 1
  steps += 1
  if (warehouseDone) done += 1

  if (warehouseDone) {
    return { percent: 100, labelKey: 'unitWorkQueue.progress.productionComplete' }
  }
  if (!pourDone) {
    return {
      percent: pct(checksDone, checksTotal),
      labelKey: 'unitWorkQueue.progress.prePour',
      labelParams: { done: String(checksDone), total: String(checksTotal) },
    }
  }
  if (!hasCuring) {
    return { percent: pct(done, steps), labelKey: 'unitWorkQueue.progress.awaitingCuring' }
  }
  return { percent: pct(done, steps), labelKey: 'unitWorkQueue.progress.postPour' }
}

function curingProgress(flow: CuringFlowState): WorkOrderProgressSnapshot {
  const order: CuringFlowState['status'][] = [
    'beklemede',
    'kurleme_basladi',
    'buhar_kapatma_bekleniyor',
    'bekleme_suresi',
    'tamamlandi',
  ]
  if (flow.status === 'duraklatildi') {
    return { percent: 40, labelKey: 'unitWorkQueue.progress.curingPaused' }
  }
  const idx = order.indexOf(flow.status)
  const percent = flow.status === 'tamamlandi' ? 100 : Math.max(12, pct(idx, order.length - 1))
  return {
    percent,
    labelKey: `unitWorkQueue.productionFlow.curing.status.${flow.status}`,
  }
}

function pourProgress(flow: PourOrderFlowState): WorkOrderProgressSnapshot {
  const map: Record<PourOrderFlowState['status'], WorkOrderProgressSnapshot> = {
    beklemede: { percent: 10, labelKey: 'unitWorkQueue.progress.pourPending' },
    onaylandi: { percent: 100, labelKey: 'unitWorkQueue.progress.pourApproved' },
    gecikme: { percent: 55, labelKey: 'unitWorkQueue.progress.pourDelayed' },
    iptal: { percent: 100, labelKey: 'unitWorkQueue.progress.pourCancelled' },
    tamamlandi: { percent: 100, labelKey: 'unitWorkQueue.progress.pourDone' },
  }
  return map[flow.status]
}

function sampleProgress(flow: SampleOrderFlowState): WorkOrderProgressSnapshot {
  const map: Record<SampleOrderFlowState['status'], WorkOrderProgressSnapshot> = {
    beklemede: { percent: 12, labelKey: 'unitWorkQueue.progress.samplePending' },
    etiket_yazdirildi: { percent: 55, labelKey: 'unitWorkQueue.progress.sampleLabelPrinted' },
    mevcut_numune_baglandi: { percent: 85, labelKey: 'unitWorkQueue.progress.sampleLinked' },
    tamamlandi: { percent: 100, labelKey: 'unitWorkQueue.progress.sampleDone' },
  }
  return map[flow.status]
}

export function computeWorkOrderProgress(
  item: WorkQueueItem,
  ctx: WorkOrderProgressContext,
): WorkOrderProgressSnapshot {
  if (item.kind === 'production' && isProductionParentOrder(item)) {
    return productionParentProgress(item, ctx)
  }
  if (item.kind === 'curing_order') {
    return curingProgress(ctx.getCuringFlowState(item.id))
  }
  if (item.kind === 'pour_order') {
    return pourProgress(ctx.getPourFlowState(item.id))
  }
  if (item.kind === 'sample_order') {
    return sampleProgress(ctx.getSampleFlowState(item.id))
  }
  if (item.kind === 'nonconformance' && item.nonconformanceId && ctx.getNonconformance) {
    const nc = ctx.getNonconformance(item.nonconformanceId)
    if (nc) {
      const rank = nonconformanceStatusRank(nc.status)
      const max = 6
      return {
        percent: Math.round((rank / max) * 100),
        labelKey: `unitWorkQueue.ncStatus.${nc.status}`,
      }
    }
  }
  return fromStatus(item.status)
}

export function createDefaultProgressContext(): WorkOrderProgressContext {
  return {
    getProductionFlowState: () => createInitialProductionFlowState(),
    getCuringFlowState: () => createInitialCuringFlowState(),
    getPourFlowState: () => createInitialPourFlowState(),
    getSampleFlowState: () => createInitialSampleFlowState(),
    hasCuringReportForOrder: () => false,
  }
}

export { shouldAutoCompleteCuring }
