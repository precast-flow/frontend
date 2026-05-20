import { useEffect, useId, useMemo, useState, type KeyboardEvent } from 'react'
import { AlertTriangle, CalendarDays, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useFactoryContext } from '../../context/FactoryContext'
import { useWorkQueue } from '../../context/WorkQueueContext'
import { formatDailyReportDay } from '../../data/dailyProductionReport'
import { type PlanItem } from '../../data/planningDesignMock'
import { resolveWorkQueueName } from '../../data/workQueueMock'
import {
  buildDailyProductionPreview,
  previewWorkOrdersFromDay,
  type DailyProductionPreviewLine,
  type ShiftProductionGroup,
} from '../../planlama/productionDailyWorkOrder'
import { PmStyleDialog } from '../shared/PmStyleDialog'

const SHIFT_SECTION =
  'overflow-hidden rounded-xl border border-slate-200/50 dark:border-slate-600/45'
const SHIFT_HEADER =
  'bg-black/[0.04] backdrop-blur-md hover:bg-black/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.09]'
const DATE_PANEL = 'rounded-xl border border-slate-200/50 p-3 dark:border-slate-600/45'
const GLASS_INPUT =
  'rounded-lg border border-slate-200/50 bg-transparent px-3 py-2 backdrop-blur-sm dark:border-slate-600/50'
const GLASS_BADGE =
  'rounded-full bg-sky-500/12 px-1.5 py-0.5 ring-1 ring-sky-500/20 dark:bg-sky-400/10'
const GLASS_BTN_SECONDARY =
  'rounded-lg border border-slate-200/60 bg-transparent px-4 py-2 backdrop-blur-sm transition hover:bg-black/[0.04] dark:border-slate-600/50 dark:hover:bg-white/[0.06]'

type Step = 'select' | 'preview'

type Props = {
  open: boolean
  onClose: () => void
  planItems: readonly PlanItem[]
  moldNameById: ReadonlyMap<string, string>
  defaultDayIso: string
  visibleDayRange?: { min: string; max: string }
  onConfirmed?: (count: number) => void
  onOpenDailyReport?: () => void
}

export function DailyProductionWorkOrderDialog({
  open,
  onClose,
  planItems,
  moldNameById,
  defaultDayIso,
  visibleDayRange,
  onConfirmed,
  onOpenDailyReport,
}: Props) {
  const { t, locale } = useI18n()
  const loc = locale === 'en' ? 'en-GB' : 'tr-TR'
  const { selectedFactory } = useFactoryContext()
  const { appendItems, getDailyReportForDay } = useWorkQueue()
  const dateInputId = useId()
  const [selectedDay, setSelectedDay] = useState(defaultDayIso)
  const [step, setStep] = useState<Step>('select')
  const [confirming, setConfirming] = useState(false)
  const [reportWarningDismissed, setReportWarningDismissed] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedDay(defaultDayIso)
      setStep('select')
      setReportWarningDismissed(false)
    }
  }, [open, defaultDayIso])

  useEffect(() => {
    setReportWarningDismissed(false)
  }, [selectedDay])

  const shiftGroups: ShiftProductionGroup[] = useMemo(
    () => (open ? buildDailyProductionPreview(planItems, selectedDay, moldNameById) : []),
    [open, planItems, selectedDay, moldNameById],
  )

  const previewCount = useMemo(
    () => shiftGroups.reduce((sum, g) => sum + g.lines.length, 0),
    [shiftGroups],
  )

  const existingReport = useMemo(
    () => (open ? getDailyReportForDay(selectedFactory.code, selectedDay) : undefined),
    [open, getDailyReportForDay, selectedFactory.code, selectedDay],
  )

  const previewWorkOrders = useMemo(
    () =>
      open && step === 'preview'
        ? previewWorkOrdersFromDay(shiftGroups, {
            planDayIso: selectedDay,
            factoryCode: selectedFactory.code,
          })
        : [],
    [open, step, shiftGroups, selectedDay, selectedFactory.code],
  )

  const showReportWarning = !existingReport && !reportWarningDismissed && step === 'select'

  const handleConfirm = () => {
    if (previewCount === 0 || confirming || step !== 'preview') return
    setConfirming(true)
    appendItems(previewWorkOrders)
    onConfirmed?.(previewWorkOrders.length)
    setConfirming(false)
    onClose()
  }

  if (!open) return null

  return (
    <PmStyleDialog
      title={t('productionPlanning.dailyOrder.title')}
      subtitle={t('productionPlanning.dailyOrder.subtitle')}
      closeLabel={t('productionPlanning.dailyOrder.cancel')}
      onClose={onClose}
      size="md"
      footer={
        step === 'select' ? (
          <SelectFooter
            previewCount={previewCount}
            onClose={onClose}
            onNext={() => setStep('preview')}
            t={t}
          />
        ) : (
          <PreviewFooter
            previewCount={previewCount}
            confirming={confirming}
            onBack={() => setStep('select')}
            onConfirm={handleConfirm}
            t={t}
          />
        )
      }
    >
      <div className="space-y-4">
        {step === 'select' ? (
          <>
            {showReportWarning ? (
              <ReportMissingBanner
                t={t}
                onContinue={() => setReportWarningDismissed(true)}
                onOpenReport={onOpenDailyReport}
              />
            ) : null}
            <div className={DATE_PANEL}>
              <label
                htmlFor={dateInputId}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
              >
                <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                {t('productionPlanning.dailyOrder.dayLabel')}
              </label>
              <input
                id={dateInputId}
                type="date"
                value={selectedDay}
                min={visibleDayRange?.min}
                max={visibleDayRange?.max}
                onChange={(e) => setSelectedDay(e.target.value)}
                className={`mt-2 w-full max-w-xs text-sm font-medium text-slate-900 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/25 dark:text-slate-50 ${GLASS_INPUT}`}
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t('productionPlanning.dailyOrder.dayHint')}
              </p>
            </div>
            <PreviewSection shiftGroups={shiftGroups} previewCount={previewCount} selectedDay={selectedDay} t={t} />
          </>
        ) : (
          <ConfirmPreviewSection
            shiftGroups={shiftGroups}
            previewWorkOrders={previewWorkOrders}
            selectedDay={selectedDay}
            factoryCode={selectedFactory.code}
            loc={loc}
            t={t}
          />
        )}
      </div>
    </PmStyleDialog>
  )
}

function ReportMissingBanner({
  t,
  onContinue,
  onOpenReport,
}: {
  t: (key: string) => string
  onContinue: () => void
  onOpenReport?: () => void
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-amber-300/60 bg-amber-50/80 p-3 dark:border-amber-600/40 dark:bg-amber-950/30"
      role="status"
    >
      <div className="flex gap-2">
        <AlertTriangle className="size-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
        <p className="text-sm text-amber-950 dark:text-amber-100">
          {t('productionPlanning.dailyOrder.reportMissingWarning')}
        </p>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onContinue} className={GLASS_BTN_SECONDARY}>
          {t('productionPlanning.dailyOrder.reportMissingContinue')}
        </button>
        {onOpenReport ? (
          <button
            type="button"
            onClick={onOpenReport}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
          >
            {t('productionPlanning.dailyOrder.reportMissingOpenReport')}
          </button>
        ) : null}
      </div>
    </div>
  )
}

function ConfirmPreviewSection({
  shiftGroups,
  previewWorkOrders,
  selectedDay,
  factoryCode,
  loc,
  t,
}: {
  shiftGroups: ShiftProductionGroup[]
  previewWorkOrders: ReturnType<typeof previewWorkOrdersFromDay>
  selectedDay: string
  factoryCode: string
  loc: string
  t: (key: string, vars?: Record<string, string>) => string
}) {
  const flatLines = useMemo(() => shiftGroups.flatMap((g) => g.lines), [shiftGroups])
  const orderByPlanId = useMemo(() => {
    const map = new Map<string, string>()
    flatLines.forEach((line, i) => {
      const wo = previewWorkOrders[i]
      if (wo) map.set(line.planItemId, wo.orderNo)
    })
    return map
  }, [flatLines, previewWorkOrders])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sky-200/50 bg-sky-50/40 p-3 dark:border-sky-700/40 dark:bg-sky-950/25">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {t('productionPlanning.dailyOrder.previewSummary')}
        </p>
        <dl className="mt-2 grid gap-1 text-xs text-slate-700 dark:text-slate-300 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">{t('productionPlanning.dailyOrder.dayLabel')}</dt>
            <dd className="font-medium">{formatDailyReportDay(selectedDay, loc)}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">{t('productionPlanning.dailyReport.factory')}</dt>
            <dd className="font-medium">{factoryCode}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500 dark:text-slate-400">{t('productionPlanning.dailyOrder.previewCount', { count: String(previewWorkOrders.length) })}</dt>
          </div>
        </dl>
      </div>
      <div className="space-y-3">
        {shiftGroups.map((group) => (
          <section key={group.shiftIndex} className={SHIFT_SECTION}>
            <div className={`px-3 py-2 ${SHIFT_HEADER}`}>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">
                {group.shiftLabel}
              </span>
              <span className="ml-2 text-[10px] text-slate-600 dark:text-slate-400">
                {t('productionPlanning.dailyOrder.supervisor', {
                  name: resolveWorkQueueName(group.supervisorUserId),
                })}
              </span>
            </div>
            <ul className="divide-y divide-slate-200/40 dark:divide-slate-700/40">
              {group.lines.map((line) => (
                <li key={line.planItemId}>
                  <PreviewConfirmRow
                    line={line}
                    orderNo={orderByPlanId.get(line.planItemId) ?? '—'}
                    t={t}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function PreviewConfirmRow({
  line,
  orderNo,
  t,
}: {
  line: DailyProductionPreviewLine
  orderNo: string
  t: (key: string) => string
}) {
  return (
    <div className="grid gap-2 px-3 py-2.5 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,6rem)] sm:items-center">
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900 dark:text-slate-50">{line.title}</p>
        <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{line.productId}</p>
      </div>
      <div className="min-w-0">
        <p className="truncate text-slate-800 dark:text-slate-100">{line.projectName}</p>
        <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{line.projectCode}</p>
      </div>
      <div className="text-[11px]">
        <p className="text-slate-500 dark:text-slate-400">{t('productionPlanning.dailyOrder.previewOrderNo')}</p>
        <p className="font-mono font-semibold text-sky-800 dark:text-sky-200">{orderNo}</p>
      </div>
    </div>
  )
}

function SelectFooter({
  previewCount,
  onClose,
  onNext,
  t,
}: {
  previewCount: number
  onClose: () => void
  onNext: () => void
  t: (key: string) => string
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button type="button" onClick={onClose} className={`text-sm font-semibold text-slate-700 dark:text-slate-200 ${GLASS_BTN_SECONDARY}`}>
        {t('productionPlanning.dailyOrder.cancel')}
      </button>
      <button
        type="button"
        disabled={previewCount === 0}
        onClick={onNext}
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-sky-500 dark:hover:bg-sky-600"
      >
        {t('productionPlanning.dailyOrder.nextPreview')}
      </button>
    </div>
  )
}

function PreviewFooter({
  previewCount,
  confirming,
  onBack,
  onConfirm,
  t,
}: {
  previewCount: number
  confirming: boolean
  onBack: () => void
  onConfirm: () => void
  t: (key: string) => string
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button type="button" onClick={onBack} className={`text-sm font-semibold text-slate-700 dark:text-slate-200 ${GLASS_BTN_SECONDARY}`}>
        {t('productionPlanning.dailyOrder.back')}
      </button>
      <button
        type="button"
        disabled={previewCount === 0 || confirming}
        onClick={onConfirm}
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-sky-500 dark:hover:bg-sky-600"
      >
        {t('productionPlanning.dailyOrder.confirm')}
      </button>
    </div>
  )
}

function PreviewSection({
  shiftGroups,
  previewCount,
  selectedDay,
  t,
}: {
  shiftGroups: ShiftProductionGroup[]
  previewCount: number
  selectedDay: string
  t: (key: string, vars?: Record<string, string>) => string
}) {
  return (
    <div>
      <PreviewHeader previewCount={previewCount} t={t} />
      {previewCount === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200/50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600/45 dark:text-slate-400">
          {t('productionPlanning.dailyOrder.empty')}
        </p>
      ) : (
        <div className="space-y-3">
          {shiftGroups.map((group) => (
            <ShiftPreviewBlock key={`${selectedDay}-${group.shiftIndex}`} group={group} t={t} />
          ))}
        </div>
      )}
    </div>
  )
}

function PreviewHeader({
  previewCount,
  t,
}: {
  previewCount: number
  t: (key: string, vars?: Record<string, string>) => string
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
        <ClipboardList className="size-4 text-sky-600 dark:text-sky-400" aria-hidden />
        {t('productionPlanning.dailyOrder.previewTitle')}
      </h4>
      <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-sky-900 dark:text-sky-100">
        {t('productionPlanning.dailyOrder.previewCount', { count: String(previewCount) })}
      </span>
    </div>
  )
}

function ShiftPreviewBlock({
  group,
  t,
}: {
  group: ShiftProductionGroup
  t: (key: string, vars?: Record<string, string>) => string
}) {
  const [open, setOpen] = useState(false)
  const panelId = `daily-order-shift-${group.shiftIndex}`

  const toggle = () => setOpen((v) => !v)
  const onHeaderKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  return (
    <section className={SHIFT_SECTION}>
      <button
        type="button"
        id={`${panelId}-header`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        onKeyDown={onHeaderKeyDown}
        className={[
          `flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2 text-left transition ${SHIFT_HEADER}`,
          open ? 'border-b border-slate-200/40 dark:border-slate-600/35' : '',
        ].join(' ')}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          {open ? (
            <ChevronUp className="size-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
          ) : (
            <ChevronDown className="size-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
          )}
          <span className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">
            {group.shiftLabel}
          </span>
          <span className={`text-[10px] font-semibold tabular-nums text-slate-700 dark:text-slate-200 ${GLASS_BADGE}`}>
            {group.lines.length}
          </span>
        </span>
        <span className="text-[11px] text-slate-600 dark:text-slate-400">
          {t('productionPlanning.dailyOrder.supervisor', {
            name: resolveWorkQueueName(group.supervisorUserId),
          })}
        </span>
      </button>
      {open ? (
        <ul
          id={panelId}
          role="region"
          aria-labelledby={`${panelId}-header`}
          className="divide-y divide-slate-200/40 dark:divide-slate-700/40"
        >
          {group.lines.map((line) => (
            <li key={line.planItemId}>
              <PreviewLineRow line={line} t={t} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function PreviewLineRow({
  line,
  t,
}: {
  line: DailyProductionPreviewLine
  t: (key: string) => string
}) {
  return (
    <div className="grid gap-2 px-3 py-2.5 text-sm sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,7.5rem)] sm:items-center">
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900 dark:text-slate-50">{line.title}</p>
        <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{line.productId}</p>
      </div>
      <ProjectCell line={line} />
      <MetricsCell line={line} t={t} />
    </div>
  )
}

function ProjectCell({ line }: { line: DailyProductionPreviewLine }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-slate-800 dark:text-slate-100">{line.projectName}</p>
      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{line.projectCode}</p>
    </div>
  )
}

function MetricsCell({
  line,
  t,
}: {
  line: DailyProductionPreviewLine
  t: (key: string) => string
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] sm:grid-cols-1">
      <div>
        <dt className="text-slate-500 dark:text-slate-400">{t('productionPlanning.dailyOrder.colMold')}</dt>
        <dd className="font-medium text-slate-800 dark:text-slate-100">{line.moldName}</dd>
      </div>
      <div>
        <dt className="text-slate-500 dark:text-slate-400">{t('productionPlanning.dailyOrder.colVolume')}</dt>
        <dd className="font-medium tabular-nums text-slate-800 dark:text-slate-100">
          {line.volumeM3.toFixed(1)} m³
        </dd>
      </div>
    </dl>
  )
}
