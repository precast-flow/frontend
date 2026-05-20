import { useMemo } from 'react'
import { useI18n } from '../../../i18n/I18nProvider'
import { childOrderRoleLabelKey } from '../../../data/productionWorkOrderFlow'
import { resolveWorkQueueName, WORK_QUEUE_ORG_SEQUENCE, type WorkQueueItem, type WorkQueueOrgUnit, type WorkQueuePerspective } from '../../../data/workQueueMock'
import { WorkOrderListProgress } from '../WorkOrderListProgress'

type Props = {
  parent: WorkQueueItem
  children: WorkQueueItem[]
  ncWorkOrders: WorkQueueItem[]
  gl: boolean
  onOpenInList?: (
    workQueueId: string,
    opts: { perspective: WorkQueuePerspective; unit: WorkQueueOrgUnit | 'all' },
  ) => void
  onOpenCuringReport?: (curingWorkQueueId: string) => void
  hasCuringReport?: (curingWorkQueueId: string) => boolean
}

const KIND_BADGE: Record<string, string> = {
  pour_order: 'bg-amber-500/15 text-amber-950 ring-amber-500/30 dark:text-amber-100',
  sample_order: 'bg-violet-500/15 text-violet-950 ring-violet-500/30 dark:text-violet-100',
  curing_order: 'bg-cyan-500/15 text-cyan-950 ring-cyan-500/30 dark:text-cyan-100',
  nonconformance: 'bg-red-500/15 text-red-950 ring-red-500/30 dark:text-red-100',
}

export function SpawnedWorkOrdersList({
  parent,
  children,
  ncWorkOrders,
  gl,
  onOpenInList,
  onOpenCuringReport,
  hasCuringReport,
}: Props) {
  const { t } = useI18n()

  const rows = useMemo(() => {
    const ops = children.filter((c) => c.kind !== 'nonconformance')
    return [...ops, ...ncWorkOrders]
  }, [children, ncWorkOrders])

  const unitLabel = (orgId: WorkQueueOrgUnit) => {
    const hit = WORK_QUEUE_ORG_SEQUENCE.find((u) => u.id === orgId)
    return hit ? t(hit.labelKey) : orgId
  }

  const rowCls = gl
    ? 'flex flex-col gap-2 rounded-xl border border-black/12 bg-black/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/12'
    : 'flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-white/50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-600/60'

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/18 p-6 text-center text-sm text-black/65 dark:border-white/15 dark:text-white/70">
        {t('unitWorkQueue.productionFlow.spawnEmpty')}
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {rows.map((row) => {
        const badge = KIND_BADGE[row.kind] ?? KIND_BADGE.nonconformance
        return (
          <li key={row.id} className={rowCls}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${badge}`}>
                  {t(childOrderRoleLabelKey(row.kind))}
                </span>
                <span className="font-mono text-sm font-semibold text-black dark:text-white">{row.orderNo}</span>
              </div>
              <p className="mt-1 text-xs text-black/65 dark:text-white/70">
                {unitLabel(row.targetUnit)} ·{' '}
                {row.assigneeUserId ? resolveWorkQueueName(row.assigneeUserId) : '—'} ·{' '}
                {row.lastUpdatedLabel}
              </p>
              <p className="mt-0.5 truncate text-xs text-black/55 dark:text-white/60">
                {row.productName ?? parent.productName ?? parent.title}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
              <WorkOrderListProgress item={row} />
              {onOpenInList ? (
                <button
                  type="button"
                  className="rounded-lg border border-sky-500/35 bg-sky-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-sky-950 dark:text-sky-100"
                  onClick={() =>
                    onOpenInList(row.id, {
                      perspective: row.kind === 'curing_order' ? 'to_me' : 'by_me',
                      unit: row.targetUnit,
                    })
                  }
                >
                  {t('unitWorkQueue.productionFlow.openInList')}
                </button>
              ) : null}
              {row.kind === 'curing_order' && hasCuringReport?.(row.id) && onOpenCuringReport ? (
                <button
                  type="button"
                  className="rounded-lg border border-emerald-500/35 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-900 dark:text-emerald-100"
                  onClick={() => onOpenCuringReport(row.id)}
                >
                  {t('unitWorkQueue.curingReport.viewReport')}
                </button>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
