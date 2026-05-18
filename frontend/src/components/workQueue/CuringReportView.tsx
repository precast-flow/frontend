import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  formatDurationMs,
  formatReportDateTime,
  type CuringReport,
} from '../../data/curingReport'
import { eiSplitHeaderButtonPassive } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { splitDetailPanelBodyClass } from '../shared/splitModuleStyles'
import {
  PrintableReportShell,
  type PrintableReportHeader,
  type PrintableReportSection,
} from '../shared/printableReport/PrintableReport'
import { PrintReportToolbar } from '../shared/printableReport/PrintReportToolbar'
import { usePrintReport } from '../shared/printableReport/usePrintReport'

type Props = {
  report: CuringReport
  gl: boolean
  onBack?: () => void
}

export function CuringReportView({ report, gl, onBack }: Props) {
  const { t, locale } = useI18n()
  const loc = locale === 'en' ? 'en-GB' : 'tr-TR'
  const reportId = `curing-report-${report.id}`
  const { print } = usePrintReport(reportId)

  const sectionCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  const labelCls = 'text-xs font-medium text-black/55 dark:text-white/60'
  const valueCls = 'mt-0.5 text-sm font-medium text-black dark:text-white'
  const actionBtn = `${eiSplitHeaderButtonPassive} px-2.5 py-1.5`

  const moldLabel = report.moldName
    ? report.moldId
      ? `${report.moldName} (${report.moldId})`
      : report.moldName
    : null

  const printHeader: PrintableReportHeader = useMemo(() => {
    const bannerText = report.steamShutoffDelayed
      ? t('unitWorkQueue.curingReport.steamDelayBanner', {
          delay: formatDurationMs(report.steamDelayMs),
        })
      : t('unitWorkQueue.curingReport.steamOnTime')

    return {
      title: t('unitWorkQueue.curingReport.title'),
      subtitle: report.reportNo,
      meta: [
        {
          label: t('unitWorkQueue.curingReport.printDate'),
          value: formatReportDateTime(report.createdAt, loc),
        },
        { label: t('unitWorkQueue.curingReport.projectName'), value: report.projectName },
        { label: t('unitWorkQueue.curingReport.projectCode'), value: report.projectCode },
      ],
      banner: {
        text: bannerText,
        variant: report.steamShutoffDelayed ? ('delay' as const) : ('ok' as const),
      },
    }
  }, [report, loc, t])

  const printSections: PrintableReportSection[] = useMemo(
    () => [
      {
        title: t('unitWorkQueue.curingReport.sectionProject'),
        fields: [
          { label: t('unitWorkQueue.curingReport.projectCode'), value: report.projectCode },
          { label: t('unitWorkQueue.curingReport.projectName'), value: report.projectName },
          { label: t('unitWorkQueue.curingReport.productCode'), value: report.productCode },
          { label: t('unitWorkQueue.curingReport.productName'), value: report.productName },
          ...(moldLabel
            ? [
                {
                  label: t('unitWorkQueue.curingReport.mold'),
                  value: moldLabel,
                  fullWidth: true,
                },
              ]
            : []),
        ],
      },
      {
        title: t('unitWorkQueue.curingReport.sectionOrders'),
        fields: [
          {
            label: t('unitWorkQueue.curingReport.productionOrderNo'),
            value: report.productionOrderNo,
          },
          { label: t('unitWorkQueue.curingReport.curingOrderNo'), value: report.curingOrderNo },
          { label: t('unitWorkQueue.curingReport.shift'), value: report.shiftLabel },
          { label: t('unitWorkQueue.curingReport.factory'), value: report.factoryCode },
          {
            label: t('unitWorkQueue.curingReport.curer'),
            value: report.curerName,
            fullWidth: true,
          },
        ],
      },
      {
        title: t('unitWorkQueue.curingReport.sectionTimeline'),
        fields: [
          {
            label: t('unitWorkQueue.curingReport.curingStartedAt'),
            value: formatReportDateTime(report.curingStartedAt, loc),
          },
          {
            label: t('unitWorkQueue.curingReport.steamWarningAt'),
            value: formatReportDateTime(report.steamWarningAt, loc),
          },
          {
            label: t('unitWorkQueue.curingReport.steamDueAt'),
            value: formatReportDateTime(report.steamOffDueAt, loc),
          },
          {
            label: t('unitWorkQueue.curingReport.steamAckAt'),
            value: formatReportDateTime(report.steamAcknowledgedAt, loc),
            warn: report.steamShutoffDelayed,
          },
          {
            label: t('unitWorkQueue.curingReport.waitStartAt'),
            value: formatReportDateTime(report.waitPeriodStartAt, loc),
          },
          {
            label: t('unitWorkQueue.curingReport.waitEndAt'),
            value: formatReportDateTime(report.waitPeriodEndAt, loc),
          },
          {
            label: t('unitWorkQueue.curingReport.completedAt'),
            value: formatReportDateTime(report.curingCompletedAt, loc),
          },
          {
            label: t('unitWorkQueue.curingReport.totalDuration'),
            value: formatDurationMs(report.totalCuringMs),
            fullWidth: true,
          },
        ],
      },
    ],
    [report, loc, moldLabel, t],
  )

  const printFooter = `${report.projectCode} · ${report.productCode} · ${report.factoryCode}`
  const screenField = (
    labelKey: string,
    value: string,
    highlight = false,
    fullWidth = false,
  ) => (
    <div className={fullWidth ? 'sm:col-span-2' : undefined}>
      <dt className={labelCls}>{t(labelKey)}</dt>
      <dd
        className={`${valueCls} ${highlight ? 'text-rose-700 dark:text-rose-300' : ''}`.trim()}
      >
        {value}
      </dd>
    </div>
  )

  return (
    <PrintableReportShell
      reportId={reportId}
      header={printHeader}
      sections={printSections}
      footer={printFooter}
      className={`${splitDetailPanelBodyClass} space-y-4`}
      toolbar={
        <header className="flex flex-col gap-3 border-b border-black/10 pb-3 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 text-left">
            {onBack ? (
              <button type="button" onClick={onBack} className={`${actionBtn} mb-2`}>
                <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
                {t('unitWorkQueue.curingReport.backToOrder')}
              </button>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
              {t('unitWorkQueue.curingReport.title')}
            </p>
            <h4 className="mt-0.5 font-mono text-lg font-semibold leading-tight text-black dark:text-white">
              {report.reportNo}
            </h4>
            <p className="mt-0.5 text-xs text-black/60 dark:text-white/65">
              {formatReportDateTime(report.createdAt, loc)}
            </p>
          </div>
          <PrintReportToolbar
            printLabel={t('unitWorkQueue.curingReport.print')}
            pdfLabel={t('unitWorkQueue.curingReport.pdf')}
            pdfHint={t('unitWorkQueue.curingReport.pdfHint')}
            onPrint={() => print()}
          />
        </header>
      }
    >
      {report.steamShutoffDelayed ? (
        <p className="rounded-lg bg-rose-500/12 px-3 py-2 text-center text-sm font-semibold text-rose-950 ring-1 ring-rose-500/25 dark:text-rose-100">
          {t('unitWorkQueue.curingReport.steamDelayBanner', {
            delay: formatDurationMs(report.steamDelayMs),
          })}
        </p>
      ) : (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-xs font-medium text-emerald-900 dark:text-emerald-100">
          {t('unitWorkQueue.curingReport.steamOnTime')}
        </p>
      )}

      <section className={sectionCls}>
        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t('unitWorkQueue.curingReport.sectionProject')}
        </h5>
        <dl className="grid gap-3 sm:grid-cols-2">
          {screenField('unitWorkQueue.curingReport.projectCode', report.projectCode)}
          {screenField('unitWorkQueue.curingReport.projectName', report.projectName)}
          {screenField('unitWorkQueue.curingReport.productCode', report.productCode)}
          {screenField('unitWorkQueue.curingReport.productName', report.productName)}
          {moldLabel
            ? screenField('unitWorkQueue.curingReport.mold', moldLabel, false, true)
            : null}
        </dl>
      </section>

      <section className={sectionCls}>
        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t('unitWorkQueue.curingReport.sectionOrders')}
        </h5>
        <dl className="grid gap-3 sm:grid-cols-2">
          {screenField('unitWorkQueue.curingReport.productionOrderNo', report.productionOrderNo)}
          {screenField('unitWorkQueue.curingReport.curingOrderNo', report.curingOrderNo)}
          {screenField('unitWorkQueue.curingReport.shift', report.shiftLabel)}
          {screenField('unitWorkQueue.curingReport.factory', report.factoryCode)}
          {screenField('unitWorkQueue.curingReport.curer', report.curerName, false, true)}
        </dl>
      </section>

      <section className={sectionCls}>
        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t('unitWorkQueue.curingReport.sectionTimeline')}
        </h5>
        <dl className="grid gap-3 sm:grid-cols-2">
          {screenField(
            'unitWorkQueue.curingReport.curingStartedAt',
            formatReportDateTime(report.curingStartedAt, loc),
          )}
          {screenField(
            'unitWorkQueue.curingReport.steamWarningAt',
            formatReportDateTime(report.steamWarningAt, loc),
          )}
          {screenField(
            'unitWorkQueue.curingReport.steamDueAt',
            formatReportDateTime(report.steamOffDueAt, loc),
          )}
          {screenField(
            'unitWorkQueue.curingReport.steamAckAt',
            formatReportDateTime(report.steamAcknowledgedAt, loc),
            report.steamShutoffDelayed,
          )}
          {screenField(
            'unitWorkQueue.curingReport.waitStartAt',
            formatReportDateTime(report.waitPeriodStartAt, loc),
          )}
          {screenField(
            'unitWorkQueue.curingReport.waitEndAt',
            formatReportDateTime(report.waitPeriodEndAt, loc),
          )}
          {screenField(
            'unitWorkQueue.curingReport.completedAt',
            formatReportDateTime(report.curingCompletedAt, loc),
          )}
          {screenField(
            'unitWorkQueue.curingReport.totalDuration',
            formatDurationMs(report.totalCuringMs),
          )}
        </dl>
      </section>
    </PrintableReportShell>
  )
}
