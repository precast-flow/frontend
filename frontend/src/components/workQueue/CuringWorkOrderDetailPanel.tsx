import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useWorkQueue } from '../../context/WorkQueueContext'
import {
  CURING_COMPLETE_DELAY_MS,
  CURING_STEAM_OFF_DELAY_MS,
} from '../../data/productionWorkOrderFlowConstants'
import { canCompleteCuring } from '../../data/productionWorkOrderFlow'
import type { WorkQueueItem } from '../../data/workQueueMock'
import { splitDetailPanelBodyClass } from '../shared/splitModuleStyles'
import { CuringReportView } from './CuringReportView'

type Props = {
  item: WorkQueueItem
  gl: boolean
}

function formatCountdown(ms: number): string {
  const sec = Math.max(0, Math.ceil(ms / 1000))
  return `${sec} sn`
}

export function CuringWorkOrderDetailPanel({ item, gl }: Props) {
  const { t } = useI18n()
  const {
    getCuringFlowState,
    startCuring,
    acknowledgeCuringSteamOff,
    completeCuringWithReport,
    getCuringReport,
  } = useWorkQueue()
  const [, setTick] = useState(0)
  const [showReport, setShowReport] = useState(false)

  const flow = getCuringFlowState(item.id)
  const report = getCuringReport(item.id)
  const now = Date.now()

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 500)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (report) setShowReport(true)
  }, [report?.id])

  const cardCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  const statusKey = `unitWorkQueue.productionFlow.curing.status.${flow.status}`
  const steamRemaining =
    flow.steamOffDueAt != null ? Math.max(0, flow.steamOffDueAt - now) : null
  const completeRemaining =
    flow.completeDueAt != null ? Math.max(0, flow.completeDueAt - now) : null

  const primaryBtn =
    'rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-45'

  const handleComplete = () => {
    const created = completeCuringWithReport(item)
    if (created) setShowReport(true)
  }

  return (
    <div className={`${splitDetailPanelBodyClass} space-y-4 pb-4`}>
      <div className={cardCls}>
        <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
          {t('unitWorkQueue.productionFlow.curing.eyebrow')}
        </p>
        <p className="mt-1 text-lg font-semibold text-black dark:text-white">{t(statusKey)}</p>
        {item.sourceProductionOrderNo ? (
          <p className="mt-2 text-sm text-black/70 dark:text-white/75">
            {t('unitWorkQueue.productionFlow.curing.parentOrder')}:{' '}
            <span className="font-mono font-medium">{item.sourceProductionOrderNo}</span>
          </p>
        ) : null}
      </div>

      {flow.status === 'beklemede' ? (
        <div className="flex justify-center">
          <button type="button" className={primaryBtn} onClick={() => startCuring(item.id)}>
            {t('unitWorkQueue.productionFlow.curing.start')}
          </button>
        </div>
      ) : null}

      {flow.status === 'kurleme_basladi' && steamRemaining != null ? (
        <p className="rounded-lg bg-amber-500/12 px-3 py-2 text-center text-sm text-amber-950 ring-1 ring-amber-500/25 dark:text-amber-100">
          {t('unitWorkQueue.productionFlow.curing.steamCountdown', {
            time: formatCountdown(steamRemaining),
            demo: String(CURING_STEAM_OFF_DELAY_MS / 1000),
          })}
        </p>
      ) : null}

      {flow.status === 'buhar_kapatma_bekleniyor' ? (
        <div className="space-y-3">
          <p className="rounded-lg bg-rose-500/12 px-3 py-2 text-center text-sm font-semibold text-rose-950 ring-1 ring-rose-500/25 dark:text-rose-100">
            {t('unitWorkQueue.productionFlow.curing.steamWarning')}
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              className={primaryBtn}
              onClick={() => acknowledgeCuringSteamOff(item.id)}
            >
              {t('unitWorkQueue.productionFlow.curing.steamAck')}
            </button>
          </div>
        </div>
      ) : null}

      {flow.status === 'bekleme_suresi' && completeRemaining != null ? (
        <p className="rounded-lg bg-sky-500/12 px-3 py-2 text-center text-sm text-sky-950 ring-1 ring-sky-500/25 dark:text-sky-100">
          {t('unitWorkQueue.productionFlow.curing.completeCountdown', {
            time: formatCountdown(completeRemaining),
            demo: String(CURING_COMPLETE_DELAY_MS / 1000),
          })}
        </p>
      ) : null}

      {flow.status === 'bekleme_suresi' && !report ? (
        <div className="space-y-2">
          <p className="text-center text-[11px] text-black/55 dark:text-white/60">
            {t('unitWorkQueue.curingReport.completeHint')}
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              className={primaryBtn}
              disabled={!canCompleteCuring(flow, now)}
              onClick={handleComplete}
            >
              {t('unitWorkQueue.productionFlow.curing.complete')}
            </button>
          </div>
        </div>
      ) : null}

      {flow.status === 'tamamlandi' && report && !showReport ? (
        <div className="flex justify-center">
          <button
            type="button"
            className={primaryBtn}
            onClick={() => setShowReport(true)}
          >
            {t('unitWorkQueue.curingReport.viewReport')}
          </button>
        </div>
      ) : null}

      {report && showReport ? (
        <div className="border-t border-black/10 pt-4 dark:border-white/10">
          <CuringReportView report={report} gl={gl} />
        </div>
      ) : null}
    </div>
  )
}
