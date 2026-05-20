import { useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import { CalendarDays, FileText, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { useFactoryContext } from '../../context/FactoryContext'
import { useWorkQueue } from '../../context/WorkQueueContext'
import {
  buildDailyProductionReport,
  formatDailyReportDateTime,
  formatDailyReportDay,
  summarizeLinesByProject,
  type DailyProductionReport,
  type DailyProductionReportLine,
} from '../../data/dailyProductionReport'
import { dailyProductionReportDetailPath } from '../../data/dailyProductionReportPaths'
import { PmStyleDialog } from '../shared/PmStyleDialog'
import { DailyProductionReportView } from './DailyProductionReportView'

const DATE_PANEL = 'rounded-xl border border-slate-200/50 p-3 dark:border-slate-600/45'
const GLASS_INPUT =
  'rounded-lg border border-slate-200/50 bg-transparent px-3 py-2 backdrop-blur-sm dark:border-slate-600/50'

type Step = 'list' | 'preview'

type Props = {
  open: boolean
  onClose: () => void
  defaultDayIso: string
  visibleDayRange?: { min: string; max: string }
  onConfirmed?: (reportNo: string) => void
}

export function DailyProductionReportDialog({
  open,
  onClose,
  defaultDayIso,
  visibleDayRange,
  onConfirmed,
}: Props) {
  const { t, locale } = useI18n()
  const loc = locale === 'en' ? 'en-GB' : 'tr-TR'
  const navigate = useNavigate()
  const { selectedFactory } = useFactoryContext()
  const {
    listEligibleForDailyReport,
    getDailyReportForDay,
    generateDailyProductionReport,
    listDailyReports,
  } = useWorkQueue()

  const reportHistory = useMemo(
    () => (open ? listDailyReports(selectedFactory.code).slice(0, 10) : []),
    [open, listDailyReports, selectedFactory.code],
  )

  const handleOpenReport = (reportId: string) => {
    onClose()
    navigate(dailyProductionReportDetailPath(reportId), {
      state: { fromProductionPlanning: true },
    })
  }
  const dateInputId = useId()
  const [selectedDay, setSelectedDay] = useState(defaultDayIso)
  const [step, setStep] = useState<Step>('list')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedDay(defaultDayIso)
      setStep('list')
    }
  }, [open, defaultDayIso])

  const eligible = useMemo(
    () => (open ? listEligibleForDailyReport(selectedDay, selectedFactory.code) : []),
    [open, listEligibleForDailyReport, selectedDay, selectedFactory.code],
  )

  const existingReport = useMemo(
    () => (open ? getDailyReportForDay(selectedFactory.code, selectedDay) : undefined),
    [open, getDailyReportForDay, selectedFactory.code, selectedDay],
  )

  const previewReport = useMemo(() => {
    if (!open || eligible.length === 0) return null
    return buildDailyProductionReport(eligible, selectedDay, selectedFactory.code).report
  }, [open, eligible, selectedDay, selectedFactory.code])

  const handleOpenExisting = () => {
    if (!existingReport) return
    onClose()
    navigate(dailyProductionReportDetailPath(existingReport.id), {
      state: { fromProductionPlanning: true },
    })
  }

  const handleConfirm = () => {
    if (confirming || eligible.length === 0 || existingReport) return
    setConfirming(true)
    const result = generateDailyProductionReport(selectedDay, selectedFactory.code)
    setConfirming(false)
    if (!result.ok) {
      if (result.reason === 'duplicate_day' && result.existingReportId) {
        onClose()
        navigate(dailyProductionReportDetailPath(result.existingReportId), {
          state: { fromProductionPlanning: true },
        })
      }
      return
    }
    onConfirmed?.(result.report.reportNo)
    onClose()
    navigate(dailyProductionReportDetailPath(result.report.id), {
      state: { fromProductionPlanning: true },
    })
  }

  if (!open) return null

  return (
    <PmStyleDialog
      title={t('productionPlanning.dailyReport.title')}
      subtitle={t('productionPlanning.dailyReport.subtitle')}
      closeLabel={t('productionPlanning.dailyReport.cancel')}
      onClose={onClose}
      size={step === 'preview' ? 'lg' : 'md'}
      footer={
        <footer className="flex flex-wrap items-center justify-end gap-2">
          {step === 'preview' ? (
            <button
              type="button"
              onClick={() => setStep('list')}
              className="rounded-lg border border-slate-200/60 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-black/[0.04] dark:border-slate-600/50 dark:text-slate-200 dark:hover:bg-white/[0.06]"
            >
              {t('productionPlanning.dailyReport.back')}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200/60 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-black/[0.04] dark:border-slate-600/50 dark:text-slate-200 dark:hover:bg-white/[0.06]"
            >
              {t('productionPlanning.dailyReport.cancel')}
            </button>
          )}
          {step === 'list' ? (
            <button
              type="button"
              disabled={eligible.length === 0 || Boolean(existingReport)}
              onClick={() => setStep('preview')}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-600"
            >
              {t('productionPlanning.dailyReport.nextPreview')}
            </button>
          ) : (
            <button
              type="button"
              disabled={confirming}
              onClick={handleConfirm}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-600"
            >
              {t('productionPlanning.dailyReport.confirm')}
            </button>
          )}
        </footer>
      }
    >
      {step === 'list' ? (
        <ListStep
          dateInputId={dateInputId}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          visibleDayRange={visibleDayRange}
          existingReport={existingReport}
          eligible={eligible.map((e) => e.line)}
          reportHistory={reportHistory}
          onOpenExisting={handleOpenExisting}
          onOpenReport={handleOpenReport}
          t={t}
          loc={loc}
        />
      ) : previewReport ? (
        <Block className="max-h-[min(70vh,640px)] overflow-y-auto">
          <DailyProductionReportView
            report={previewReport}
            gl
            layout="panel"
            embeddedPreview
          />
        </Block>
      ) : null}
    </PmStyleDialog>
  )
}

const SUMMARY_PANEL =
  'rounded-xl border border-slate-200/50 bg-black/[0.03] p-3 dark:border-slate-600/45 dark:bg-white/[0.04]'

function ListStep({
  dateInputId,
  selectedDay,
  setSelectedDay,
  visibleDayRange,
  existingReport,
  eligible,
  reportHistory,
  onOpenExisting,
  onOpenReport,
  t,
  loc,
}: {
  dateInputId: string
  selectedDay: string
  setSelectedDay: (v: string) => void
  visibleDayRange?: { min: string; max: string }
  existingReport?: DailyProductionReport
  eligible: DailyProductionReportLine[]
  reportHistory: DailyProductionReport[]
  onOpenExisting: () => void
  onOpenReport: (reportId: string) => void
  t: (key: string, vars?: Record<string, string>) => string
  loc: string
}) {
  const projectSummary = useMemo(() => summarizeLinesByProject(eligible), [eligible])

  return (
    <div className="space-y-4">
      <Block className={DATE_PANEL}>
        <label
          htmlFor={dateInputId}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
        >
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          {t('productionPlanning.dailyReport.dayLabel')}
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
          {t('productionPlanning.dailyReport.dayHint')}
        </p>
      </Block>

      {existingReport ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300/50 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-500/35 dark:text-amber-100">
          <span>{t('productionPlanning.dailyReport.existingBanner', { reportNo: existingReport.reportNo })}</span>
          <button
            type="button"
            onClick={onOpenExisting}
            className="rounded-lg border border-amber-400/60 px-3 py-1 text-xs font-semibold hover:bg-amber-500/15"
          >
            {t('productionPlanning.dailyReport.openExisting')}
          </button>
        </div>
      ) : null}

      <Block className={SUMMARY_PANEL}>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          {t('productionPlanning.dailyReport.historyTitle')}
        </h4>
        {reportHistory.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('productionPlanning.dailyReport.historyEmpty')}
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {reportHistory.map((report) => (
              <li key={report.id}>
                <button
                  type="button"
                  onClick={() => onOpenReport(report.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-800 transition hover:bg-black/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06]"
                >
                  <span>
                    {t('productionPlanning.dailyReport.historyLine', {
                      reportNo: report.reportNo,
                      day: formatDailyReportDay(report.reportDayIso, loc),
                      count: String(report.lines.length),
                    })}
                  </span>
                  <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                    {t('productionPlanning.dailyReport.historyOpen')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
            <FileText className="size-4 text-sky-600 dark:text-sky-400" aria-hidden />
            {t('productionPlanning.dailyReport.previewTitle')}
          </h4>
          <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-sky-900 dark:text-sky-100">
            {t('productionPlanning.dailyReport.previewCount', { count: String(eligible.length) })}
          </span>
        </div>

        {eligible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200/50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600/45 dark:text-slate-400">
            {t('productionPlanning.dailyReport.empty')}
          </p>
        ) : (
          <>
            {projectSummary.length > 0 ? (
              <div className={`mb-3 ${SUMMARY_PANEL}`}>
                <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  {t('productionPlanning.dailyReport.projectBreakdownTitle')}
                </h5>
                <ul className="mt-2 space-y-1 text-sm text-slate-800 dark:text-slate-100">
                  {projectSummary.map((row) => (
                    <li key={row.projectCode}>
                      {t('productionPlanning.dailyReport.projectBreakdownLine', {
                        code: row.projectCode,
                        name: row.projectName,
                        count: String(row.count),
                      })}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-600/45">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="bg-black/[0.04] text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-white/[0.06] dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2">{t('productionPlanning.dailyReport.colOrder')}</th>
                    <th className="px-3 py-2">{t('productionPlanning.dailyReport.colProduct')}</th>
                    <th className="px-3 py-2">{t('productionPlanning.dailyReport.colProject')}</th>
                    <th className="px-3 py-2">{t('productionPlanning.dailyReport.colShift')}</th>
                    <th className="px-3 py-2">{t('productionPlanning.dailyReport.colWarehouse')}</th>
                    <th className="px-3 py-2">{t('productionPlanning.dailyReport.colCompleted')}</th>
                    <th className="px-3 py-2">{t('productionPlanning.dailyReport.colMovableDate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-600/40">
                  {eligible.map((line) => (
                    <tr key={line.productionWorkQueueId} className="text-slate-800 dark:text-slate-100">
                      <td className="px-3 py-2 font-mono font-semibold">{line.productionOrderNo}</td>
                      <td className="px-3 py-2">
                        <span className="font-medium">{line.productCode}</span>
                        <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">
                          {line.productName}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {line.projectCode}
                        <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">
                          {line.projectName}
                        </span>
                      </td>
                      <td className="px-3 py-2">{line.shiftLabel}</td>
                      <td className="px-3 py-2">{line.warehouseLabel}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {formatDailyReportDateTime(line.productionCompletedAt, loc)}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Lock className="size-3 text-amber-600 dark:text-amber-400" aria-hidden />
                          {formatDailyReportDateTime(line.eligibleShipAt, loc)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {t('productionPlanning.dailyReport.waitNote')}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {formatDailyReportDay(selectedDay, loc)}
        </p>
      </Block>
    </div>
  )
}

function Block({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={className}>{children}</div>
}
