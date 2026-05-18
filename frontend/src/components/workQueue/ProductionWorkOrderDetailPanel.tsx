import { useMemo, useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useWorkQueue } from '../../context/WorkQueueContext'
import {
  PRE_POUR_CHECKS,
  alreadyPourApproved,
  canApprovePour,
  childOrderRoleLabelKey,
} from '../../data/productionWorkOrderFlow'
import {
  resolveWorkQueueName,
  WORK_QUEUE_ORG_SEQUENCE,
  type WorkQueueItem,
  type WorkQueueOrgUnit,
  type WorkQueuePerspective,
} from '../../data/workQueueMock'
import { splitDetailPanelBodyClass, splitTabPill } from '../shared/splitModuleStyles'
import { CuringReportView } from './CuringReportView'
import { ProductionProjectDocumentView } from './ProductionProjectDocumentView'

type TabId = 'document' | 'prePour' | 'spawned'

type Props = {
  item: WorkQueueItem
  gl: boolean
  onOpenInList?: (
    workQueueId: string,
    opts: { perspective: WorkQueuePerspective; unit: WorkQueueOrgUnit | 'all' },
  ) => void
}

export function ProductionWorkOrderDetailPanel({ item, gl, onOpenInList }: Props) {
  const { t } = useI18n()
  const {
    getProductionFlowState,
    togglePrePourCheck,
    approvePourSpawn,
    getSpawnedChildren,
    getCuringReport,
    getCuringReportsForProductionOrder,
    getCuringReportsForProduct,
  } = useWorkQueue()
  const [tab, setTab] = useState<TabId>('document')
  const [toast, setToast] = useState<string | null>(null)
  const [reportCuringId, setReportCuringId] = useState<string | null>(null)

  const flow = getProductionFlowState(item.id)
  const approved = alreadyPourApproved(flow)
  const canApprove = canApprovePour(flow)
  const checkedCount = PRE_POUR_CHECKS.filter((c) => flow.checklist[c.id]).length
  const spawned = useMemo(() => getSpawnedChildren(item.id), [getSpawnedChildren, item.id])
  const linkedReports = useMemo(() => {
    const byOrder = getCuringReportsForProductionOrder(item.id)
    const byProduct = item.productCode ? getCuringReportsForProduct(item.productCode) : []
    const map = new Map(byOrder.map((r) => [r.id, r]))
    for (const r of byProduct) map.set(r.id, r)
    return [...map.values()]
  }, [getCuringReportsForProductionOrder, getCuringReportsForProduct, item.id, item.productCode])
  const activeReport = reportCuringId ? getCuringReport(reportCuringId) : undefined

  const cardCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  const handleApprove = () => {
    if (!canApprove) return
    const ok = approvePourSpawn(item)
    if (ok) {
      setToast(t('unitWorkQueue.productionFlow.approveSuccess'))
      setTab('spawned')
      window.setTimeout(() => setToast(null), 4000)
    }
  }

  const unitLabel = (orgId: WorkQueueItem['targetUnit']) => {
    const hit = WORK_QUEUE_ORG_SEQUENCE.find((u) => u.id === orgId)
    return hit ? t(hit.labelKey) : orgId
  }

  if (activeReport) {
    return (
      <div className={`flex min-h-0 flex-1 flex-col ${splitDetailPanelBodyClass}`}>
        <CuringReportView
          report={activeReport}
          gl={gl}
          onBack={() => setReportCuringId(null)}
        />
      </div>
    )
  }

  return (
    <div className={`flex min-h-0 flex-1 flex-col gap-3 ${splitDetailPanelBodyClass}`}>
      <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-1">
        <div
          className="flex max-w-full gap-1 overflow-x-auto"
          role="tablist"
          aria-label={t('unitWorkQueue.productionFlow.tablist')}
        >
          {(
            [
              ['document', 'unitWorkQueue.productionFlow.tab.document'],
              ['prePour', 'unitWorkQueue.productionFlow.tab.prePour'],
              ['spawned', 'unitWorkQueue.productionFlow.tab.spawned'],
            ] as const
          ).map(([id, key]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={splitTabPill(tab === id)}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      {toast ? (
        <p
          className="mx-auto max-w-md rounded-lg bg-emerald-500/15 px-3 py-2 text-center text-xs font-semibold text-emerald-900 ring-1 ring-emerald-500/25 dark:text-emerald-100"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      <div className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-4 ${splitDetailPanelBodyClass}`}>
        {tab === 'document' ? (
          <div className={`${splitDetailPanelBodyClass} space-y-4`}>
            <ProductionProjectDocumentView item={item} gl={gl} />
            {linkedReports.length > 0 ? (
              <section className={cardCls}>
                <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
                  {t('unitWorkQueue.curingReport.linkedTitle')}
                </h5>
                <ul className="space-y-2">
                  {linkedReports.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        className="w-full rounded-lg border border-black/12 px-3 py-2 text-left text-sm font-medium text-black transition hover:bg-black/[0.04] dark:border-white/12 dark:text-white dark:hover:bg-white/[0.06]"
                        onClick={() => setReportCuringId(r.curingWorkQueueId)}
                      >
                        {r.reportNo} · {r.productName}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}

        {tab === 'prePour' ? (
          <div className={`${splitDetailPanelBodyClass} space-y-4`}>
            {approved ? (
              <p className="rounded-lg bg-sky-500/12 px-3 py-2 text-center text-xs font-semibold text-sky-950 ring-1 ring-sky-500/20 dark:text-sky-100">
                {t('unitWorkQueue.productionFlow.approvedBanner')}
              </p>
            ) : null}

            <p className="text-center text-xs text-black/60 dark:text-white/65">
              {t('unitWorkQueue.productionFlow.checkProgress', {
                done: String(checkedCount),
                total: String(PRE_POUR_CHECKS.length),
              })}
            </p>

            <ul className="space-y-2">
              {PRE_POUR_CHECKS.map((check) => {
                const done = flow.checklist[check.id]
                return (
                  <li key={check.id}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
                        done
                          ? 'border-emerald-500/30 bg-emerald-500/8 dark:border-emerald-400/25'
                          : gl
                            ? 'border-black/12 hover:bg-black/[0.03] dark:border-white/12'
                            : 'border-slate-200/80 hover:bg-slate-50/80 dark:border-slate-600/60'
                      } ${approved ? 'pointer-events-none opacity-70' : ''}`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={done}
                        disabled={approved}
                        onChange={() => togglePrePourCheck(item.id, check.id)}
                      />
                      {done ? (
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="mt-0.5 size-5 shrink-0 text-black/35 dark:text-white/40" />
                      )}
                      <span className="min-w-0 flex-1 text-left text-sm text-black dark:text-white">
                        {t(check.labelKey)}
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-black/45 dark:text-white/50">
                        {done
                          ? t('unitWorkQueue.productionFlow.checkDone')
                          : t('unitWorkQueue.productionFlow.checkPending')}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>

            <div className="flex flex-col items-center gap-2 pt-2">
              <button
                type="button"
                disabled={!canApprove || approved}
                onClick={handleApprove}
                className={
                  canApprove && !approved
                    ? 'rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50'
                    : 'rounded-lg border border-black/15 bg-black/[0.04] px-5 py-2.5 text-sm font-semibold text-black/45 dark:border-white/15 dark:text-white/45'
                }
              >
                {t('unitWorkQueue.productionFlow.approvePour')}
              </button>
              {!canApprove && !approved ? (
                <p className="text-center text-[11px] text-black/55 dark:text-white/60">
                  {t('unitWorkQueue.productionFlow.approveHint')}
                </p>
              ) : null}
              {approved ? (
                <p className="text-center text-[11px] text-black/55 dark:text-white/60">
                  {t('unitWorkQueue.productionFlow.alreadyApproved')}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === 'spawned' ? (
          <div className={`${splitDetailPanelBodyClass} space-y-3`}>
            <p className="rounded-lg bg-black/[0.04] px-3 py-2 text-left text-[11px] leading-relaxed text-black/70 dark:bg-white/[0.06] dark:text-white/75">
              {t('unitWorkQueue.productionFlow.spawnHowTo')}
            </p>
            {spawned.length === 0 ? (
              <p className="rounded-xl border border-dashed border-black/18 p-6 text-center text-sm text-black/65 dark:border-white/15 dark:text-white/70">
                {t('unitWorkQueue.productionFlow.spawnEmpty')}
              </p>
            ) : (
              spawned.map((child) => (
                <article key={child.id} className={cardCls}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
                    {t(childOrderRoleLabelKey(child.kind))}
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-black dark:text-white">
                    {child.orderNo}
                  </p>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-black/55 dark:text-white/60">
                        {t('unitWorkQueue.assigneePerson')}
                      </dt>
                      <dd className="font-medium text-black dark:text-white">
                        {child.assigneeUserId ? resolveWorkQueueName(child.assigneeUserId) : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-black/55 dark:text-white/60">
                        {t('unitWorkQueue.colTargetUnit')}
                      </dt>
                      <dd className="font-medium text-black dark:text-white">
                        {unitLabel(child.targetUnit)}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-black/55 dark:text-white/60">
                        {t('unitWorkQueue.productionFlow.spawnParentRef')}
                      </dt>
                      <dd className="font-medium text-black dark:text-white">
                        {item.orderNo} · {item.projectCode}
                      </dd>
                    </div>
                  </dl>
                  {onOpenInList ? (
                    <button
                      type="button"
                      className="mt-3 w-full rounded-lg border border-sky-500/35 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-950 transition hover:bg-sky-500/15 dark:text-sky-100"
                      onClick={() =>
                        onOpenInList(child.id, {
                          perspective:
                            child.kind === 'curing_order' ? 'to_me' : 'by_me',
                          unit: child.targetUnit,
                        })
                      }
                    >
                      {child.kind === 'curing_order'
                        ? t('unitWorkQueue.productionFlow.openCuringInList')
                        : t('unitWorkQueue.productionFlow.openInList')}
                    </button>
                  ) : null}
                  {child.kind === 'curing_order' && getCuringReport(child.id) ? (
                    <button
                      type="button"
                      className="mt-2 w-full rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-950 dark:text-emerald-100"
                      onClick={() => setReportCuringId(child.id)}
                    >
                      {t('unitWorkQueue.curingReport.viewReport')}
                    </button>
                  ) : null}
                </article>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
