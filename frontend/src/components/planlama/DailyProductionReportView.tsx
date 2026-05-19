import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  formatDailyReportDateTime,
  formatDailyReportDay,
  summarizeLinesByProject,
  type DailyProductionReport,
} from '../../data/dailyProductionReport'
import { resolveWorkQueueName } from '../../data/workQueueMock'
import { eiSplitHeaderButtonPassive } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { splitDetailPanelBodyClass } from '../shared/splitModuleStyles'
import {
  PrintableReportDocument,
  PrintableReportShell,
  type PrintableReportHeader,
  type PrintableReportSection,
} from '../shared/printableReport/PrintableReport'
import { PrintReportToolbar } from '../shared/printableReport/PrintReportToolbar'
import { usePrintReport } from '../shared/printableReport/usePrintReport'

type Props = {
  report: DailyProductionReport
  gl: boolean
  onBack?: () => void
  layout?: 'panel' | 'page'
  /** Modal önizleme: yalnızca içerik, tek yazdır araç çubuğu shell üstünde */
  embeddedPreview?: boolean
}

export function DailyProductionReportView({
  report,
  gl,
  onBack,
  layout = 'panel',
  embeddedPreview = false,
}: Props) {
  const { t, locale } = useI18n()
  const loc = locale === 'en' ? 'en-GB' : 'tr-TR'
  const reportId = `daily-production-report-${report.id}`
  const { print } = usePrintReport(reportId)

  const isPageLayout = layout === 'page'
  const sectionCls =
    isPageLayout && gl
      ? 'rounded-xl border border-black/10 bg-white/45 p-4 text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.48)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none'
      : gl
        ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
        : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  const labelCls = 'text-xs font-medium text-black/55 dark:text-white/60'
  const valueCls = 'mt-0.5 text-sm font-medium text-black dark:text-white'
  const actionBtn = `${eiSplitHeaderButtonPassive} px-2.5 py-1.5`

  const printHeader: PrintableReportHeader = useMemo(
    () => ({
      title: t('productionPlanning.dailyReport.printTitle'),
      subtitle: report.reportNo,
      meta: [
        {
          label: t('productionPlanning.dailyReport.printDate'),
          value: formatDailyReportDateTime(report.createdAt, loc),
        },
        {
          label: t('productionPlanning.dailyReport.reportDay'),
          value: formatDailyReportDay(report.reportDayIso, loc),
        },
        { label: t('productionPlanning.dailyReport.factory'), value: report.factoryCode },
        {
          label: t('productionPlanning.dailyReport.lineCount'),
          value: String(report.lines.length),
        },
      ],
    }),
    [report, loc, t],
  )

  const projectSummary = useMemo(
    () => summarizeLinesByProject(report.lines),
    [report.lines],
  )

  const printSections: PrintableReportSection[] = useMemo(() => {
    const projectFields = projectSummary.map((row) => ({
      label: t('productionPlanning.dailyReport.projectBreakdownTitle'),
      value: t('productionPlanning.dailyReport.projectBreakdownLine', {
        code: row.projectCode,
        name: row.projectName,
        count: String(row.count),
      }),
      fullWidth: true,
    }))

    const lineFields = report.lines.flatMap((line, index) => [
      {
        label: `${index + 1}. ${t('productionPlanning.dailyReport.colOrder')}`,
        value: line.productionOrderNo,
        mono: true,
      },
      {
        label: t('productionPlanning.dailyReport.colProduct'),
        value: `${line.productCode} — ${line.productName}`,
      },
      {
        label: t('productionPlanning.dailyReport.colProject'),
        value: `${line.projectCode} · ${line.projectName}`,
        fullWidth: true,
      },
      {
        label: t('productionPlanning.dailyReport.colShift'),
        value: line.shiftLabel,
      },
      {
        label: t('productionPlanning.dailyReport.colWarehouse'),
        value: line.warehouseLabel,
      },
      {
        label: t('productionPlanning.dailyReport.colCompleted'),
        value: formatDailyReportDateTime(line.productionCompletedAt, loc),
      },
      {
        label: t('productionPlanning.dailyReport.colMovableDate'),
        value: formatDailyReportDateTime(line.eligibleShipAt, loc),
      },
    ])

    return [
      {
        title: t('productionPlanning.dailyReport.summarySection'),
        fields: [
          {
            label: t('productionPlanning.dailyReport.reportDay'),
            value: formatDailyReportDay(report.reportDayIso, loc),
          },
          {
            label: t('productionPlanning.dailyReport.factory'),
            value: report.factoryCode,
          },
          {
            label: t('productionPlanning.dailyReport.lineCount'),
            value: String(report.lines.length),
          },
          {
            label: t('productionPlanning.dailyReport.printDate'),
            value: formatDailyReportDateTime(report.createdAt, loc),
          },
          {
            label: t('productionPlanning.dailyReport.createdBy'),
            value: resolveWorkQueueName(report.createdByUserId),
            fullWidth: true,
          },
          ...projectFields,
        ],
      },
      {
        title: t('productionPlanning.dailyReport.linesSection'),
        fields: lineFields,
        allowBreak: true,
      },
    ]
  }, [report, loc, t, projectSummary])

  const footerNote = t('productionPlanning.dailyReport.footerNote')

  const toolbar = (
    <PrintReportToolbar
      printLabel={t('unitWorkQueue.qcReport.print')}
      pdfLabel={t('unitWorkQueue.qcReport.pdf')}
      pdfHint={t('unitWorkQueue.qcReport.pdfHint')}
      onPrint={() => print()}
    />
  )

  const reportContent = (
    <>
      <section className={sectionCls}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className={labelCls}>{t('productionPlanning.dailyReport.reportDay')}</dt>
            <dd className={valueCls}>{formatDailyReportDay(report.reportDayIso, loc)}</dd>
          </div>
          <div>
            <dt className={labelCls}>{t('productionPlanning.dailyReport.factory')}</dt>
            <dd className={valueCls}>{report.factoryCode}</dd>
          </div>
          <div>
            <dt className={labelCls}>{t('productionPlanning.dailyReport.lineCount')}</dt>
            <dd className={valueCls}>{report.lines.length}</dd>
          </div>
        </dl>
        {projectSummary.length > 0 ? (
          <div className="mt-4 border-t border-black/10 pt-4 dark:border-white/10">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
              {t('productionPlanning.dailyReport.projectBreakdownTitle')}
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-black dark:text-white">
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
      </section>

      <section className={`${sectionCls} mt-4`}>
        <h3 className="mb-3 text-sm font-semibold text-black dark:text-white">
          {t('productionPlanning.dailyReport.linesSection')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="text-[10px] font-bold uppercase tracking-wide text-black/55 dark:text-white/60">
              <tr>
                <th className="pb-2 pr-3">{t('productionPlanning.dailyReport.colOrder')}</th>
                <th className="pb-2 pr-3">{t('productionPlanning.dailyReport.colProduct')}</th>
                <th className="pb-2 pr-3">{t('productionPlanning.dailyReport.colProject')}</th>
                <th className="pb-2 pr-3">{t('productionPlanning.dailyReport.colShift')}</th>
                <th className="pb-2 pr-3">{t('productionPlanning.dailyReport.colWarehouse')}</th>
                <th className="pb-2 pr-3">{t('productionPlanning.dailyReport.colMovableDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {report.lines.map((line) => (
                <tr key={line.productionWorkQueueId}>
                  <td className="py-2 pr-3 font-mono font-semibold">{line.productionOrderNo}</td>
                  <td className="py-2 pr-3">
                    {line.productCode}
                    <span className="mt-0.5 block text-[10px] opacity-70">{line.productName}</span>
                  </td>
                  <td className="py-2 pr-3">
                    {line.projectCode}
                    <span className="mt-0.5 block text-[10px] opacity-70">{line.projectName}</span>
                  </td>
                  <td className="py-2 pr-3">{line.shiftLabel}</td>
                  <td className="py-2 pr-3">{line.warehouseLabel}</td>
                  <td className="py-2 pr-3 tabular-nums">
                    {formatDailyReportDateTime(line.eligibleShipAt, loc)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-black/55 dark:text-white/60">{footerNote}</p>
      </section>
    </>
  )

  const screenToolbar = (
    <header
      className={[
        'flex shrink-0 flex-wrap items-center gap-2',
        embeddedPreview
          ? 'mb-3 justify-end border-b border-slate-200/60 pb-3 dark:border-slate-600/50'
          : 'mb-4 justify-between',
      ].join(' ')}
    >
      {onBack && !embeddedPreview ? (
        <button type="button" onClick={onBack} className={actionBtn}>
          <ArrowLeft className="mr-1 inline size-4" aria-hidden />
          {t('productionPlanning.dailyReport.back')}
        </button>
      ) : null}
      {toolbar}
    </header>
  )

  if (isPageLayout) {
    return (
      <>
        <PrintableReportDocument
          reportId={reportId}
          header={printHeader}
          sections={printSections}
          footer={footerNote}
        />
        <div className={`${splitDetailPanelBodyClass} w-full min-w-0`}>
          {screenToolbar}
          <div className="space-y-4">{reportContent}</div>
        </div>
      </>
    )
  }

  return (
    <PrintableReportShell
      reportId={reportId}
      header={printHeader}
      sections={printSections}
      footer={footerNote}
      className={splitDetailPanelBodyClass}
      toolbar={screenToolbar}
    >
      {reportContent}
    </PrintableReportShell>
  )
}
