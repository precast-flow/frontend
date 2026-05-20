import { useMemo } from 'react'
import { CalendarDays, Radio } from 'lucide-react'
import { useFactoryContext } from '../../../context/FactoryContext'
import { useDashboard } from '../../../context/DashboardContext'
import { useI18n } from '../../../i18n/I18nProvider'
import {
  buildMoldStatusView,
  isLiveDate,
  PRODUCTION_BANDS,
  todayIsoDate,
  type MoldOperationKey,
} from '../../../data/moldStatusBoardMock'
import type { WidgetInstance } from '../types'

type Props = { widget: WidgetInstance }

const OP_STYLE: Record<MoldOperationKey, string> = {
  idle: 'border-slate-300/80 bg-slate-50/80 dark:border-white/15 dark:bg-white/5',
  pouring: 'border-sky-400/70 bg-sky-500/10 ring-1 ring-sky-500/20',
  curing: 'border-violet-400/70 bg-violet-500/10 ring-1 ring-violet-500/20',
  mold_cleaning: 'border-cyan-400/70 bg-cyan-500/10 ring-1 ring-cyan-500/20',
  demolding: 'border-amber-400/70 bg-amber-500/10 ring-1 ring-amber-500/20',
  qc_hold: 'border-orange-400/70 bg-orange-500/10 ring-1 ring-orange-500/20',
  maintenance: 'border-rose-400/70 bg-rose-500/10 ring-1 ring-rose-500/20',
  blocked: 'border-red-400/80 bg-red-500/10 ring-1 ring-red-500/25',
  scheduled: 'border-indigo-400/70 bg-indigo-500/10 ring-1 ring-indigo-500/20',
}

const OP_DOT: Record<MoldOperationKey, string> = {
  idle: 'bg-slate-400',
  pouring: 'bg-sky-500',
  curing: 'bg-violet-500',
  mold_cleaning: 'bg-cyan-500',
  demolding: 'bg-amber-500',
  qc_hold: 'bg-orange-500',
  maintenance: 'bg-rose-500',
  blocked: 'bg-red-500',
  scheduled: 'bg-indigo-500',
}

const LEGEND_OPS: MoldOperationKey[] = [
  'pouring',
  'curing',
  'mold_cleaning',
  'demolding',
  'qc_hold',
  'maintenance',
  'blocked',
  'scheduled',
  'idle',
]

export function WidgetMoldStatus({ widget }: Props) {
  const { t } = useI18n()
  const { selectedCodes } = useFactoryContext()
  const { updateWidgetSettings } = useDashboard()

  const viewDate = widget.settings.moldViewDate ?? todayIsoDate()
  const showEmpty = widget.settings.showEmptyMolds !== false
  const bandFilter = widget.settings.moldBandFilter ?? 'all'
  const live = isLiveDate(viewDate)

  const bands = useMemo(
    () =>
      buildMoldStatusView({
        viewDate,
        factoryCodes: selectedCodes.length ? selectedCodes : undefined,
        bandFilter,
        showEmpty,
      }),
    [viewDate, selectedCodes, bandFilter, showEmpty],
  )

  const setDate = (iso: string) => updateWidgetSettings(widget.id, { moldViewDate: iso })

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <label className="flex items-center gap-1.5 rounded-xl border border-slate-200/70 bg-white/60 px-2 py-1 text-xs dark:border-white/10 dark:bg-white/5">
          <CalendarDays className="size-3.5 opacity-70" aria-hidden />
          <input
            type="date"
            className="border-0 bg-transparent text-xs font-medium outline-none"
            value={viewDate}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="rounded-xl border border-slate-200/70 px-2 py-1 text-[11px] font-medium hover:bg-white/80 dark:border-white/10 dark:hover:bg-white/10"
          onClick={() => setDate(todayIsoDate())}
        >
          {t('dashboard.moldStatus.today')}
        </button>
        <span
          className={[
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            live
              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
              : 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-200',
          ].join(' ')}
        >
          {live ? (
            <>
              <Radio className="size-3 animate-pulse" aria-hidden />
              {t('dashboard.moldStatus.modeLive')}
            </>
          ) : (
            t('dashboard.moldStatus.modePlanned')
          )}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 shrink-0">
        {LEGEND_OPS.map((op) => (
          <span
            key={op}
            className="inline-flex items-center gap-1 rounded-md bg-black/[0.03] px-1.5 py-0.5 text-[9px] font-medium dark:bg-white/5"
          >
            <span className={`size-1.5 rounded-full ${OP_DOT[op]}`} aria-hidden />
            {t(`dashboard.moldStatus.op.${op}`)}
          </span>
        ))}
      </div>

      <div className="dash-widget-scroll min-h-0 flex-1 space-y-3 pr-0.5">
        {bands.map(({ band, molds }) => (
          <section key={band.id} className="rounded-xl border border-slate-200/60 p-2 dark:border-white/10">
            <header className="mb-2 flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold text-[var(--glass-text-primary)]">{band.label}</h4>
              <span className="text-[10px] text-[var(--glass-text-muted)]">
                {molds.filter((m) => m.state.operation !== 'idle').length}/{molds.length}{' '}
                {t('dashboard.moldStatus.occupied')}
              </span>
            </header>
            {molds.length === 0 ? (
              <p className="py-4 text-center text-xs text-[var(--glass-text-muted)]">
                {t('dashboard.moldStatus.noMolds')}
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                {molds.map((mold) => (
                  <MoldCard key={mold.id} moldLabel={mold.label} state={mold.state} live={live} />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

function MoldCard({
  moldLabel,
  state,
  live,
}: {
  moldLabel: string
  state: {
    operation: MoldOperationKey
    productCode?: string
    productName?: string
    orderNo?: string
    sinceLabel?: string
    slotLabel?: string
  }
  live: boolean
}) {
  const { t } = useI18n()
  const busy = state.operation !== 'idle'
  const style = OP_STYLE[state.operation]

  return (
    <li
      className={[
        'flex min-h-[4.5rem] flex-col rounded-xl border-l-[3px] px-2 py-1.5 transition',
        style,
        state.operation === 'idle' ? 'border-l-slate-300' : '',
      ].join(' ')}
      title={
        busy
          ? `${state.productCode ?? ''} · ${state.orderNo ?? ''}`
          : t('dashboard.moldStatus.emptyMold')
      }
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-mono text-[11px] font-bold text-[var(--glass-text-primary)]">{moldLabel}</span>
        <span className={`size-1.5 shrink-0 rounded-full ${OP_DOT[state.operation]}`} aria-hidden />
      </div>
      <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-[var(--glass-text-primary)]">
        {busy ? t(`dashboard.moldStatus.op.${state.operation}`) : t('dashboard.moldStatus.op.idle')}
      </p>
      {busy && state.productCode ? (
        <p className="line-clamp-1 font-mono text-[10px] text-[var(--glass-text-muted)]">{state.productCode}</p>
      ) : null}
      {busy && state.productName ? (
        <p className="line-clamp-1 text-[10px] text-[var(--glass-text-muted)]">{state.productName}</p>
      ) : null}
      {busy && state.orderNo ? (
        <p className="mt-auto pt-0.5 font-mono text-[9px] text-slate-500 dark:text-slate-400">{state.orderNo}</p>
      ) : null}
      {busy && live && state.sinceLabel ? (
        <p className="text-[9px] text-[var(--glass-text-muted)]">
          {t('dashboard.moldStatus.since', { time: state.sinceLabel })}
        </p>
      ) : null}
      {busy && !live && state.slotLabel ? (
        <p className="text-[9px] text-[var(--glass-text-muted)]">
          {t('dashboard.moldStatus.slot', { slot: state.slotLabel })}
        </p>
      ) : null}
    </li>
  )
}

export { PRODUCTION_BANDS as moldStatusBands }
