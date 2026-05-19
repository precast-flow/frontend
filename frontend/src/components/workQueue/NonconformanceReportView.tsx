import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  controlPhaseLabelKey,
  nonconformanceStatusLabelKey,
} from '../../data/productionQualityControl'
import {
  formatNcReportDateTime,
  ncReportPeople,
  type NonconformanceReport,
} from '../../data/nonconformanceReport'
import { eiSplitHeaderButtonPassive } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { splitDetailPanelBodyClass } from '../shared/splitModuleStyles'
import {
  PrintableReportShell,
  type PrintableReportHeader,
  type PrintableReportSection,
} from '../shared/printableReport/PrintableReport'
import { PrintReportToolbar } from '../shared/printableReport/PrintReportToolbar'
import { usePrintReport } from '../shared/printableReport/usePrintReport'
import { QualityMarkerPin } from './productionControl/QualityMarkerPin'

type Props = {
  report: NonconformanceReport
  gl: boolean
  onBack?: () => void
}

export function NonconformanceReportView({ report, gl, onBack }: Props) {
  const { t, locale } = useI18n()
  const loc = locale === 'en' ? 'en-GB' : 'tr-TR'
  const reportId = `nc-report-${report.id}`
  const { print } = usePrintReport(reportId)
  const people = ncReportPeople(report)

  const sectionCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  const labelCls = 'text-xs font-medium text-black/55 dark:text-white/60'
  const valueCls = 'mt-0.5 text-sm font-medium text-black dark:text-white'
  const actionBtn = `${eiSplitHeaderButtonPassive} px-2.5 py-1.5`

  const phaseLabel = t(controlPhaseLabelKey(report.phase))
  const statusLabel = t(nonconformanceStatusLabelKey(report.status))
  const responsibleLabel = t(`unitWorkQueue.nonconformance.unit.${report.responsibleUnit}`)

  const routedUnitLabel =
    report.routedToTarget === 'project'
      ? t('unitWorkQueue.nonconformance.unit.project')
      : report.routedToTarget === 'production'
        ? t('unitWorkQueue.nonconformance.unit.production')
        : null

  const markerPreview = {
    id: report.markerId,
    productionWorkQueueId: report.productionWorkQueueId,
    phase: report.phase,
    kind: 'error' as const,
    xPct: report.markerXPct,
    yPct: report.markerYPct,
    createdAt: report.createdAt,
    createdByUserId: report.createdByUserId,
    nonconformanceId: report.id,
  }

  const printHeader: PrintableReportHeader = useMemo(
    () => ({
      title: t('unitWorkQueue.ncReport.title'),
      subtitle: report.reportNo,
      meta: [
        {
          label: t('unitWorkQueue.ncReport.printDate'),
          value: formatNcReportDateTime(new Date().toISOString(), loc),
        },
        { label: t('unitWorkQueue.ncReport.ncOrderNo'), value: report.ncOrderNo },
        { label: t('unitWorkQueue.ncReport.productionOrderNo'), value: report.productionOrderNo },
      ],
      banner: {
        text: `${phaseLabel} · ${statusLabel}`,
        variant: report.status === 'resolved' || report.status === 'closed' ? 'ok' : 'delay',
      },
    }),
    [report, loc, phaseLabel, statusLabel, t],
  )

  const printSections: PrintableReportSection[] = useMemo(() => {
    const base: PrintableReportSection[] = [
      {
        title: t('unitWorkQueue.ncReport.sectionContext'),
        fields: [
          { label: t('unitWorkQueue.ncReport.phase'), value: phaseLabel, fullWidth: true },
          { label: t('unitWorkQueue.ncReport.status'), value: statusLabel },
          { label: t('unitWorkQueue.ncReport.responsibleUnit'), value: responsibleLabel },
          { label: t('unitWorkQueue.ncReport.projectCode'), value: report.projectCode },
          { label: t('unitWorkQueue.ncReport.projectName'), value: report.projectName },
          { label: t('unitWorkQueue.ncReport.productCode'), value: report.productCode },
          { label: t('unitWorkQueue.ncReport.productName'), value: report.productName },
          { label: t('unitWorkQueue.ncReport.factory'), value: report.factoryCode },
          { label: t('unitWorkQueue.ncReport.shift'), value: report.shiftLabel },
        ],
      },
      {
        title: t('unitWorkQueue.ncReport.sectionPeople'),
        fields: [
          { label: t('unitWorkQueue.ncReport.createdBy'), value: people.creator },
          { label: t('unitWorkQueue.ncReport.assignee'), value: people.assignee },
          {
            label: t('unitWorkQueue.ncReport.createdAt'),
            value: formatNcReportDateTime(report.createdAt, loc),
          },
        ],
      },
      {
        title: t('unitWorkQueue.ncReport.sectionDescription'),
        notes: report.description,
        allowBreak: true,
      },
      {
        title: t('unitWorkQueue.ncReport.sectionMarker'),
        fields: [
          {
            label: t('unitWorkQueue.nonconformance.markerPosition'),
            value: `${Math.round(report.markerXPct)}% · ${Math.round(report.markerYPct)}%`,
          },
        ],
      },
    ]

    if (report.routingInstruction && routedUnitLabel) {
      base.push({
        title: t('unitWorkQueue.ncReport.sectionRouting'),
        fields: [
          { label: t('unitWorkQueue.ncReport.routedTo'), value: routedUnitLabel },
          {
            label: t('unitWorkQueue.ncReport.routedAt'),
            value: report.routedAt ? formatNcReportDateTime(report.routedAt, loc) : '—',
          },
          { label: t('unitWorkQueue.ncReport.routedBy'), value: people.router ?? '—' },
        ],
        notes: report.routingInstruction,
        allowBreak: true,
      })
    }

    if (report.photos.length > 0) {
      base.push({
        title: t('unitWorkQueue.ncReport.sectionPhotos'),
        notes: report.photos.map((p) => p.fileName).join(', '),
        allowBreak: true,
      })
    }

    return base
  }, [report, loc, people, phaseLabel, statusLabel, responsibleLabel, routedUnitLabel, t])

  const printFooter = t('unitWorkQueue.ncReport.footer', { reportNo: report.reportNo })

  const field = (labelKey: string, value: string, fullWidth = false) => (
    <div className={fullWidth ? 'sm:col-span-2' : undefined}>
      <dt className={labelCls}>{t(labelKey)}</dt>
      <dd className={valueCls}>{value}</dd>
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
                {t('unitWorkQueue.ncReport.back')}
              </button>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
              {t('unitWorkQueue.ncReport.title')}
            </p>
            <h4 className="mt-0.5 font-mono text-lg font-semibold leading-tight text-black dark:text-white">
              {report.reportNo}
            </h4>
            <p className="mt-0.5 text-xs text-black/60 dark:text-white/65">
              {report.ncOrderNo} · {formatNcReportDateTime(report.createdAt, loc)}
            </p>
          </div>
          <PrintReportToolbar
            printLabel={t('unitWorkQueue.ncReport.print')}
            pdfLabel={t('unitWorkQueue.ncReport.pdf')}
            pdfHint={t('unitWorkQueue.ncReport.pdfHint')}
            onPrint={() => print()}
          />
        </header>
      }
    >
      <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-center text-xs font-semibold text-rose-950 ring-1 ring-rose-500/20 dark:text-rose-100">
        {phaseLabel}
      </p>

      <section className={sectionCls}>
        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t('unitWorkQueue.ncReport.sectionContext')}
        </h5>
        <dl className="grid gap-3 sm:grid-cols-2">
          {field('unitWorkQueue.ncReport.status', statusLabel)}
          {field('unitWorkQueue.ncReport.responsibleUnit', responsibleLabel)}
          {field('unitWorkQueue.ncReport.projectCode', report.projectCode)}
          {field('unitWorkQueue.ncReport.projectName', report.projectName)}
          {field('unitWorkQueue.ncReport.productCode', report.productCode)}
          {field('unitWorkQueue.ncReport.productName', report.productName)}
          {field('unitWorkQueue.ncReport.productionOrderNo', report.productionOrderNo, true)}
          {field('unitWorkQueue.ncReport.factory', report.factoryCode)}
          {field('unitWorkQueue.ncReport.shift', report.shiftLabel)}
        </dl>
      </section>

      <section className={sectionCls}>
        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t('unitWorkQueue.ncReport.sectionPeople')}
        </h5>
        <dl className="grid gap-3 sm:grid-cols-2">
          {field('unitWorkQueue.ncReport.createdBy', people.creator)}
          {field('unitWorkQueue.ncReport.assignee', people.assignee)}
          {field('unitWorkQueue.ncReport.createdAt', formatNcReportDateTime(report.createdAt, loc), true)}
        </dl>
      </section>

      <section className={sectionCls}>
        <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t('unitWorkQueue.ncReport.sectionDescription')}
        </h5>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-black dark:text-white">
          {report.description}
        </p>
      </section>

      {report.photos.length > 0 ? (
        <section className={sectionCls}>
          <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
            {t('unitWorkQueue.ncReport.sectionPhotos')}
          </h5>
          <ul className="flex flex-wrap gap-2">
            {report.photos.map((p) => (
              <li key={p.id}>
                <img
                  src={p.objectUrl}
                  alt=""
                  className="size-28 rounded-lg border border-black/10 object-cover"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={sectionCls}>
        <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t('unitWorkQueue.ncReport.sectionMarker')}
        </h5>
        <div className="relative mx-auto h-40 w-full max-w-md rounded-lg border border-black/10 bg-slate-100 dark:bg-slate-800">
          <QualityMarkerPin marker={markerPreview} />
        </div>
        <p className="mt-2 text-center text-[11px] text-black/55 dark:text-white/60">
          {t('unitWorkQueue.nonconformance.markerPosition', {
            x: String(Math.round(report.markerXPct)),
            y: String(Math.round(report.markerYPct)),
          })}
        </p>
      </section>

      {report.routingInstruction && routedUnitLabel ? (
        <section className={sectionCls}>
          <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
            {t('unitWorkQueue.ncReport.sectionRouting')}
          </h5>
          <dl className="mb-3 grid gap-3 sm:grid-cols-2">
            {field('unitWorkQueue.ncReport.routedTo', routedUnitLabel)}
            {field(
              'unitWorkQueue.ncReport.routedAt',
              report.routedAt ? formatNcReportDateTime(report.routedAt, loc) : '—',
            )}
            {people.router ? field('unitWorkQueue.ncReport.routedBy', people.router) : null}
          </dl>
          <p className="whitespace-pre-wrap text-sm text-black dark:text-white">
            {report.routingInstruction}
          </p>
        </section>
      ) : null}
    </PrintableReportShell>
  )
}
