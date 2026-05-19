import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { controlPhaseLabelKey } from '../../data/productionQualityControl'
import {
  reportSummaryCounts,
  formatQualityReportDateTime,
  markerKindLabelKey,
  qualityReportCreatorName,
  type QualityControlReport,
  type QualityReportMarkerEntry,
} from '../../data/qualityControlReport'
import { eiSplitHeaderButtonPassive } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { splitDetailPanelBodyClass } from '../shared/splitModuleStyles'
import {
  PrintableReportDocument,
  PrintableReportShell,
  type PrintableReportHeader,
  type PrintableReportImage,
  type PrintableReportSection,
} from '../shared/printableReport/PrintableReport'
import { PrintReportToolbar } from '../shared/printableReport/PrintReportToolbar'
import { usePrintReport } from '../shared/printableReport/usePrintReport'

type Props = {
  report: QualityControlReport
  gl: boolean
  onBack?: () => void
  /** Tam sayfa detayda içerik panel içinde kayar */
  layout?: 'panel' | 'page'
}

function entryImages(
  entry: QualityReportMarkerEntry,
  spotCaption: string,
): PrintableReportImage[] {
  const images: PrintableReportImage[] = []
  if (entry.spotSnapshotUrl) {
    images.push({ src: entry.spotSnapshotUrl, alt: spotCaption, caption: spotCaption })
  }
  for (const photo of entry.notePhotos ?? []) {
    images.push({ src: photo.objectUrl, alt: photo.fileName })
  }
  return images
}

function MarkerEntryBlock({
  entry,
  index,
  sectionCls,
  labelCls,
  valueCls,
  t,
}: {
  entry: QualityReportMarkerEntry
  index: number
  sectionCls: string
  labelCls: string
  valueCls: string
  t: (key: string, params?: Record<string, string>) => string
}) {
  const spotCaption = t('unitWorkQueue.qcReport.spotPhotoCaption', {
    index: String(index + 1),
  })

  return (
    <article className={sectionCls}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-black dark:text-white">
          {t('unitWorkQueue.qcReport.entryTitle', { index: String(index + 1) })}
        </span>
        <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-semibold dark:bg-white/10">
          {t(controlPhaseLabelKey(entry.phase))}
        </span>
        <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-semibold dark:bg-white/10">
          {t(markerKindLabelKey(entry.kind))}
        </span>
      </div>

      {entry.spotSnapshotUrl ? (
        <figure className="mb-3 overflow-hidden rounded-xl border border-black/10 dark:border-white/12">
          <img
            src={entry.spotSnapshotUrl}
            alt={spotCaption}
            className="max-h-[min(52vh,420px)] w-full bg-slate-100 object-contain dark:bg-slate-900"
          />
          <figcaption className="border-t border-black/8 bg-black/[0.02] px-3 py-1.5 text-center text-[11px] text-black/55 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60">
            {spotCaption}
          </figcaption>
        </figure>
      ) : (
        <p className="mb-3 rounded-lg border border-dashed border-black/15 px-3 py-6 text-center text-xs text-black/50 dark:border-white/15 dark:text-white/55">
          {t('unitWorkQueue.qcReport.spotPhotoMissing')}
        </p>
      )}

      <dl className="mb-3 grid gap-2 sm:grid-cols-2">
        <div>
          <dt className={labelCls}>{t('unitWorkQueue.qcReport.entryPhase')}</dt>
          <dd className={valueCls}>{t(controlPhaseLabelKey(entry.phase))}</dd>
        </div>
        <div>
          <dt className={labelCls}>{t('unitWorkQueue.qcReport.entryKind')}</dt>
          <dd className={valueCls}>{t(markerKindLabelKey(entry.kind))}</dd>
        </div>
        {entry.responsibleUnit ? (
          <div className="sm:col-span-2">
            <dt className={labelCls}>{t('unitWorkQueue.nonconformance.responsibleUnit')}</dt>
            <dd className={valueCls}>
              {t(`unitWorkQueue.nonconformance.unit.${entry.responsibleUnit}`)}
            </dd>
          </div>
        ) : null}
      </dl>

      {entry.note?.trim() ? (
        <p className="whitespace-pre-wrap text-sm text-black dark:text-white">{entry.note}</p>
      ) : (
        <p className="text-xs text-black/50 dark:text-white/55">{t('unitWorkQueue.qcReport.noNote')}</p>
      )}

      {entry.notePhotos && entry.notePhotos.length > 0 ? (
        <div className="mt-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
            {t('unitWorkQueue.qcReport.extraPhotos')}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {entry.notePhotos.map((p) => (
              <li key={p.id}>
                <img
                  src={p.objectUrl}
                  alt={p.fileName}
                  className="max-h-48 w-full rounded-lg border border-black/10 object-contain bg-slate-50 dark:border-white/12 dark:bg-slate-900"
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}

export function QualityControlReportView({ report, gl, onBack, layout = 'panel' }: Props) {
  const { t, locale } = useI18n()
  const loc = locale === 'en' ? 'en-GB' : 'tr-TR'
  const reportId = `qc-report-${report.id}`
  const { print } = usePrintReport(reportId)
  const counts = reportSummaryCounts(report)

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

  const includedSummary = [
    report.includedKinds.pass ? t('unitWorkQueue.qualityMarker.pass') : null,
    report.includedKinds.warning ? t('unitWorkQueue.qualityMarker.warning') : null,
    report.includedKinds.error ? t('unitWorkQueue.qualityMarker.error') : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const printHeader: PrintableReportHeader = useMemo(
    () => ({
      title: t('unitWorkQueue.qcReport.title'),
      subtitle: report.reportNo,
      meta: [
        {
          label: t('unitWorkQueue.qcReport.printDate'),
          value: formatQualityReportDateTime(report.createdAt, loc),
        },
        { label: t('unitWorkQueue.qcReport.productionOrderNo'), value: report.productionOrderNo },
        { label: t('unitWorkQueue.qcReport.includedKinds'), value: includedSummary },
      ],
      banner: {
        text: t('unitWorkQueue.qcReport.summaryBanner', {
          pass: String(counts.pass),
          warning: String(counts.warning),
          error: String(counts.error),
        }),
        variant: counts.error > 0 ? 'delay' : counts.warning > 0 ? 'delay' : 'ok',
      },
    }),
    [report, loc, includedSummary, counts, t],
  )

  const printSections: PrintableReportSection[] = useMemo(() => {
    const sections: PrintableReportSection[] = [
      {
        title: t('unitWorkQueue.qcReport.sectionContext'),
        fields: [
          { label: t('unitWorkQueue.qcReport.projectCode'), value: report.projectCode },
          { label: t('unitWorkQueue.qcReport.projectName'), value: report.projectName },
          { label: t('unitWorkQueue.qcReport.productCode'), value: report.productCode },
          { label: t('unitWorkQueue.qcReport.productName'), value: report.productName },
          { label: t('unitWorkQueue.qcReport.factory'), value: report.factoryCode },
          { label: t('unitWorkQueue.qcReport.shift'), value: report.shiftLabel },
          {
            label: t('unitWorkQueue.qcReport.createdBy'),
            value: qualityReportCreatorName(report),
          },
        ],
      },
    ]

    report.entries.forEach((entry, index) => {
      const phase = t(controlPhaseLabelKey(entry.phase))
      const kind = t(markerKindLabelKey(entry.kind))
      const fields = [
        { label: t('unitWorkQueue.qcReport.entryPhase'), value: phase },
        { label: t('unitWorkQueue.qcReport.entryKind'), value: kind },
      ]
      if (entry.responsibleUnit) {
        fields.push({
          label: t('unitWorkQueue.nonconformance.responsibleUnit'),
          value: t(`unitWorkQueue.nonconformance.unit.${entry.responsibleUnit}`),
        })
      }
      const spotCaption = t('unitWorkQueue.qcReport.spotPhotoCaption', {
        index: String(index + 1),
      })
      sections.push({
        title: t('unitWorkQueue.qcReport.entryTitle', { index: String(index + 1) }),
        fields,
        notes: entry.note?.trim() || undefined,
        images: entryImages(entry, spotCaption),
        allowBreak: true,
      })
    })

    return sections
  }, [report, t])

  const printFooter = t('unitWorkQueue.qcReport.footer', { reportNo: report.reportNo })
  const sectionTitleCls = isPageLayout
    ? gl
      ? 'mb-3 text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
      : 'mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75'
    : 'mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75'

  const markersTitleCls = isPageLayout
    ? gl
      ? 'text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
      : 'text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75'
    : 'text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75'

  const toolbarHeader = (
    <header className="flex shrink-0 flex-col gap-3 border-b border-black/10 px-2 pb-3 pt-2 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between sm:px-3">
      <div className="min-w-0 flex-1 text-left">
        {onBack ? (
          <button type="button" onClick={onBack} className={`${actionBtn} mb-2`}>
            <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
            {t('unitWorkQueue.qcReport.back')}
          </button>
        ) : null}
        <p
          className={
            isPageLayout
              ? 'text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
              : 'text-xs font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-200'
          }
        >
          {t('unitWorkQueue.qcReport.title')}
        </p>
        <h4 className="mt-0.5 font-mono text-lg font-semibold leading-tight text-black dark:text-white">
          {report.reportNo}
        </h4>
        <p className="mt-0.5 text-xs text-black/60 dark:text-white/65">
          {formatQualityReportDateTime(report.createdAt, loc)} · {includedSummary}
        </p>
      </div>
      <PrintReportToolbar
        printLabel={t('unitWorkQueue.qcReport.print')}
        pdfLabel={t('unitWorkQueue.qcReport.pdf')}
        pdfHint={t('unitWorkQueue.qcReport.pdfHint')}
        onPrint={() => print()}
      />
    </header>
  )

  const reportBody = (
    <>
      <p className="rounded-lg bg-sky-500/10 px-3 py-2 text-center text-xs font-semibold text-sky-950 ring-1 ring-sky-500/20 dark:text-sky-100">
        {t('unitWorkQueue.qcReport.summaryBanner', {
          pass: String(counts.pass),
          warning: String(counts.warning),
          error: String(counts.error),
        })}
      </p>

      <section className={sectionCls}>
        <h5 className={sectionTitleCls}>{t('unitWorkQueue.qcReport.sectionContext')}</h5>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className={labelCls}>{t('unitWorkQueue.qcReport.projectCode')}</dt>
            <dd className={valueCls}>{report.projectCode}</dd>
          </div>
          <div>
            <dt className={labelCls}>{t('unitWorkQueue.qcReport.projectName')}</dt>
            <dd className={valueCls}>{report.projectName}</dd>
          </div>
          <div>
            <dt className={labelCls}>{t('unitWorkQueue.qcReport.productCode')}</dt>
            <dd className={valueCls}>{report.productCode}</dd>
          </div>
          <div>
            <dt className={labelCls}>{t('unitWorkQueue.qcReport.productName')}</dt>
            <dd className={valueCls}>{report.productName}</dd>
          </div>
          <div>
            <dt className={labelCls}>{t('unitWorkQueue.qcReport.createdBy')}</dt>
            <dd className={valueCls}>{qualityReportCreatorName(report)}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4">
        <h5 className={markersTitleCls}>{t('unitWorkQueue.qcReport.sectionMarkers')}</h5>
        {report.entries.map((entry, index) => (
          <MarkerEntryBlock
            key={entry.markerId}
            entry={entry}
            index={index}
            sectionCls={sectionCls}
            labelCls={labelCls}
            valueCls={valueCls}
            t={t}
          />
        ))}
      </section>
    </>
  )

  if (isPageLayout) {
    return (
      <>
        <PrintableReportDocument
          reportId={reportId}
          header={printHeader}
          sections={printSections}
          footer={printFooter}
        />
        <div className={`${splitDetailPanelBodyClass} w-full min-w-0`}>
          {toolbarHeader}
          <div className="space-y-4 px-2 pb-6 pt-3 sm:px-3">{reportBody}</div>
        </div>
      </>
    )
  }

  return (
    <PrintableReportShell
      reportId={reportId}
      header={printHeader}
      sections={printSections}
      footer={printFooter}
      className={`${splitDetailPanelBodyClass} space-y-4`}
      toolbar={toolbarHeader}
    >
      {reportBody}
    </PrintableReportShell>
  )
}
