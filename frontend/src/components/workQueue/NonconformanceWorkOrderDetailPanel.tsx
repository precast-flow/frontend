import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useWorkQueue } from '../../context/WorkQueueContext'
import {
  PRODUCTION_MANAGER_USER_ID,
  controlPhaseLabelKey,
} from '../../data/productionQualityControl'
import { MOCK_WORK_QUEUE_VIEWER_ID, type WorkQueueItem } from '../../data/workQueueMock'
import { splitDetailPanelBodyClass } from '../shared/splitModuleStyles'
import { useOpenQualityControlReport } from './useOpenQualityControlReport'
import { NonconformanceStatusTracker } from './productionControl/NonconformanceStatusTracker'

type Props = {
  item: WorkQueueItem
  gl: boolean
}

export function NonconformanceWorkOrderDetailPanel({ item, gl }: Props) {
  const { t } = useI18n()
  const {
    getNonconformance,
    getNonconformanceByWorkQueueId,
    getQualityControlReport,
    routeNonconformance,
    advanceNonconformanceToAwaitingResolution,
    resolveNonconformance,
    closeNonconformance,
  } = useWorkQueue()
  const openQualityControlReport = useOpenQualityControlReport()
  const record =
    (item.nonconformanceId ? getNonconformance(item.nonconformanceId) : undefined) ??
    getNonconformanceByWorkQueueId(item.id)

  const [instruction, setInstruction] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const qualityReport = record ? getQualityControlReport(record.productionWorkQueueId) : undefined

  const cardCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  const isManager =
    item.assigneeUserId === PRODUCTION_MANAGER_USER_ID ||
    item.assigneeUserId === MOCK_WORK_QUEUE_VIEWER_ID

  const canRoute = record?.status === 'manager_review' && isManager
  const canAdvanceResolution =
    record?.status === 'routed_project' || record?.status === 'routed_production'
  const canResolve = record?.status === 'awaiting_resolution'
  const canClose = record?.status === 'resolved'

  if (!record) {
    return (
      <p className="p-4 text-center text-sm text-black/65 dark:text-white/70">
        {t('unitWorkQueue.nonconformance.notFound')}
      </p>
    )
  }

  const handleRoute = (target: 'project' | 'production') => {
    const ok = routeNonconformance(record.id, target, instruction)
    if (ok) {
      setToast(t('unitWorkQueue.nonconformance.routedToast'))
      setInstruction('')
      window.setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <div className={`${splitDetailPanelBodyClass} space-y-4 pb-4`}>
      <section className={cardCls}>
        <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
          {t('unitWorkQueue.nonconformance.detailEyebrow')}
        </p>
        <p className="mt-1 text-lg font-semibold text-black dark:text-white">{item.orderNo}</p>
        <p className="mt-2 text-sm text-black/70 dark:text-white/75">
          {t(controlPhaseLabelKey(record.phase))}
        </p>
        {qualityReport ? (
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700"
            onClick={() => openQualityControlReport(record.productionWorkQueueId)}
          >
            <FileText className="size-3.5" aria-hidden />
            {t('unitWorkQueue.qcReport.viewReport')}
          </button>
        ) : null}
      </section>

      <NonconformanceStatusTracker record={record} gl={gl} />

      <section className={cardCls}>
        <h5 className="mb-2 text-xs font-bold uppercase tracking-wide">{t('unitWorkQueue.nonconformance.description')}</h5>
        <p className="whitespace-pre-wrap text-sm text-black dark:text-white">{record.description}</p>
      </section>

      {record.routingInstruction ? (
        <section className={cardCls}>
          <h5 className="mb-1 text-xs font-bold uppercase">{t('unitWorkQueue.nonconformance.routingNote')}</h5>
          <p className="text-sm">{record.routingInstruction}</p>
        </section>
      ) : null}

      {canRoute ? (
        <section className={cardCls}>
          <h5 className="mb-2 text-xs font-bold uppercase">{t('unitWorkQueue.nonconformance.routeTitle')}</h5>
          <textarea
            className="mb-3 w-full rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-slate-900/50"
            rows={3}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder={t('unitWorkQueue.nonconformance.routePlaceholder')}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700"
              onClick={() => handleRoute('project')}
            >
              {t('unitWorkQueue.nonconformance.routeProject')}
            </button>
            <button
              type="button"
              className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700"
              onClick={() => handleRoute('production')}
            >
              {t('unitWorkQueue.nonconformance.routeProduction')}
            </button>
          </div>
        </section>
      ) : null}

      {canAdvanceResolution ? (
        <div className="flex justify-center">
          <button
            type="button"
            className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700"
            onClick={() => {
              if (advanceNonconformanceToAwaitingResolution(record.id)) {
                setToast(t('unitWorkQueue.nonconformance.awaitingResolutionToast'))
                window.setTimeout(() => setToast(null), 3000)
              }
            }}
          >
            {t('unitWorkQueue.nonconformance.startResolution')}
          </button>
        </div>
      ) : null}

      {canResolve || canClose ? (
        <div className="flex flex-wrap justify-center gap-2">
          {canResolve ? (
            <button
              type="button"
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-100"
              onClick={() => {
                if (resolveNonconformance(record.id)) {
                  setToast(t('unitWorkQueue.nonconformance.resolvedToast'))
                  window.setTimeout(() => setToast(null), 3000)
                }
              }}
            >
              {t('unitWorkQueue.nonconformance.markResolved')}
            </button>
          ) : null}
          {canClose ? (
            <button
              type="button"
              className="rounded-lg border border-black/15 px-4 py-2 text-xs font-semibold"
              onClick={() => {
                if (closeNonconformance(record.id)) {
                  setToast(t('unitWorkQueue.nonconformance.closedToast'))
                  window.setTimeout(() => setToast(null), 3000)
                }
              }}
            >
              {t('unitWorkQueue.nonconformance.close')}
            </button>
          ) : null}
        </div>
      ) : null}

      {toast ? (
        <p className="text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">{toast}</p>
      ) : null}
    </div>
  )
}
