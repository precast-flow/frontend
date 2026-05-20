import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useWorkQueue } from '../../context/WorkQueueContext'
import {
  CURING_COMPLETE_DELAY_MS,
  CURING_STEAM_OFF_DELAY_MS,
} from '../../data/productionWorkOrderFlowConstants'
import type { WorkQueueItem } from '../../data/workQueueMock'
import { splitDetailPanelBodyClass } from '../shared/splitModuleStyles'
import { CuringReportView } from './CuringReportView'
import { WorkOrderListProgress } from './WorkOrderListProgress'

type Props = {
  item: WorkQueueItem
  gl: boolean
}

function formatCountdown(ms: number): string {
  const sec = Math.max(0, Math.ceil(ms / 1000))
  return `${sec} sn`
}

function formatTime(ms: number | null, locale: string): string {
  if (ms == null) return '—'
  return new Date(ms).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CuringWorkOrderDetailPanel({ item, gl }: Props) {
  const { t, locale } = useI18n()
  const {
    getCuringFlowState,
    startCuring,
    pauseCuring,
    resumeCuring,
    acknowledgeCuringSteamOff,
    getCuringReport,
  } = useWorkQueue()
  const [, setTick] = useState(0)
  const [showReport, setShowReport] = useState(false)
  const [pauseNote, setPauseNote] = useState('')

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

  const plannedStart = flow.plannedCuringStartAt ?? flow.startedAt
  const expectedEnd = flow.expectedCuringEndAt

  return (
    <div className={`${splitDetailPanelBodyClass} space-y-4 pb-4`}>
      <WorkOrderListProgress item={item} compact={false} />

      <div className={cardCls}>
        <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
          {t('unitWorkQueue.productionFlow.curing.eyebrow')}
        </p>
        <p className="mt-1 text-lg font-semibold text-black dark:text-white">{t(statusKey)}</p>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.curing.plannedStart')}</dt>
            <dd className="font-medium text-black dark:text-white">{formatTime(plannedStart, locale)}</dd>
          </div>
          <div>
            <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.curing.expectedEnd')}</dt>
            <dd className="font-medium text-black dark:text-white">{formatTime(expectedEnd, locale)}</dd>
          </div>
        </dl>
        {item.sourceProductionOrderNo ? (
          <p className="mt-2 text-sm text-black/70 dark:text-white/75">
            {t('unitWorkQueue.productionFlow.curing.parentOrder')}:{' '}
            <span className="font-mono font-medium">{item.sourceProductionOrderNo}</span>
          </p>
        ) : null}
      </div>

      {flow.earlySteamShutdownWarning ? (
        <p className="rounded-lg bg-amber-500/12 px-3 py-2 text-xs font-semibold text-amber-950 dark:text-amber-100">
          {t('unitWorkQueue.curing.earlySteamWarning')}
        </p>
      ) : null}

      {flow.pauseHistory.length > 0 ? (
        <div className={cardCls}>
          <p className="text-xs font-semibold uppercase text-black/55 dark:text-white/60">
            {t('unitWorkQueue.curing.pauseHistory')}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-black/75 dark:text-white/80">
            {flow.pauseHistory.map((p, i) => (
              <li key={`${p.at}-${i}`}>
                {new Date(p.at).toLocaleString(locale)}
                {p.reason ? ` — ${p.reason}` : ` — ${t('unitWorkQueue.curing.pauseNoReason')}`}
                {p.resumedAt ? ` · ${t('unitWorkQueue.curing.resumed')}` : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {flow.status === 'beklemede' ? (
        <div className="flex justify-center">
          <button type="button" className={primaryBtn} onClick={() => startCuring(item.id)}>
            {t('unitWorkQueue.productionFlow.curing.start')}
          </button>
        </div>
      ) : null}

      {flow.status === 'duraklatildi' ? (
        <div className="flex justify-center">
          <button
            type="button"
            className={primaryBtn}
            onClick={() => resumeCuring(item.id)}
          >
            {t('unitWorkQueue.curing.resume')}
          </button>
        </div>
      ) : null}

      {flow.status !== 'beklemede' && flow.status !== 'duraklatildi' && flow.status !== 'tamamlandi' ? (
        <div className={`${cardCls} space-y-2`}>
          <label className="block text-xs font-medium text-black/55 dark:text-white/60">
            {t('unitWorkQueue.curing.pauseReasonLabel')}
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950"
            rows={2}
            placeholder={t('unitWorkQueue.curing.pauseReasonPlaceholder')}
            value={pauseNote}
            onChange={(e) => setPauseNote(e.target.value)}
          />
          <button
            type="button"
            className="w-full rounded-lg border border-slate-300/80 px-3 py-2 text-sm font-semibold dark:border-slate-600"
            onClick={() => {
              if (pauseCuring(item.id, pauseNote)) {
                setPauseNote('')
              }
            }}
          >
            {t('unitWorkQueue.curing.pause')}
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

      {flow.status === 'buhar_kapatma_bekleniyor' || flow.status === 'kurleme_basladi' ? (
        <div className="space-y-3">
          {flow.status === 'buhar_kapatma_bekleniyor' ? (
            <p className="rounded-lg bg-rose-500/12 px-3 py-2 text-center text-sm font-semibold text-rose-950 ring-1 ring-rose-500/25 dark:text-rose-100">
              {t('unitWorkQueue.productionFlow.curing.steamWarning')}
            </p>
          ) : null}
          <div className="flex justify-center">
            <button type="button" className={primaryBtn} onClick={() => acknowledgeCuringSteamOff(item.id)}>
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

      {flow.status === 'bekleme_suresi' ? (
        <p className="text-center text-[11px] text-black/55 dark:text-white/60">
          {t('unitWorkQueue.curing.autoCompleteHint')}
        </p>
      ) : null}

      {flow.status === 'tamamlandi' && report && showReport ? (
        <div className="border-t border-black/10 pt-4 dark:border-white/10">
          <CuringReportView report={report} gl={gl} />
        </div>
      ) : null}
    </div>
  )
}
