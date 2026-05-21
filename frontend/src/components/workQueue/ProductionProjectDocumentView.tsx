import { useMemo } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import type { WorkQueueItem } from '../../data/workQueueMock'
import { splitDetailPanelBodyClass } from '../shared/splitModuleStyles'
import {
  PrintableReportShell,
  type PrintableReportHeader,
  type PrintableReportSection,
} from '../shared/printableReport/PrintableReport'
import { PrintReportToolbar } from '../shared/printableReport/PrintReportToolbar'
import { usePrintReport } from '../shared/printableReport/usePrintReport'
import { RebarMaterialTraceSection } from './productionControl/RebarMaterialTraceSection'

type Props = {
  item: WorkQueueItem
  gl: boolean
}

export function ProductionProjectDocumentView({ item, gl }: Props) {
  const { t, locale } = useI18n()
  const loc = locale === 'en' ? 'en-GB' : 'tr-TR'
  const reportId = `production-doc-${item.id}`
  const { print } = usePrintReport(reportId)

  const productName = item.productName ?? item.title
  const productCode = item.productCode ?? '—'
  const moldLabel =
    item.moldName && item.moldId ? `${item.moldName} (${item.moldId})` : item.moldName ?? item.moldId ?? '—'
  const volume =
    item.volumeM3 != null && item.volumeM3 > 0 ? `${item.volumeM3.toFixed(1)} m³` : '—'
  const steel =
    item.steelKg != null && item.steelKg > 0 ? `${(item.steelKg / 1000).toFixed(2)} t` : '—'
  const notes = item.fieldNotes ?? item.detailBody ?? '—'

  const printedAt = useMemo(
    () =>
      new Intl.DateTimeFormat(loc, {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(new Date()),
    [loc],
  )

  const sectionCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  const labelCls = 'text-xs font-medium text-black/55 dark:text-white/60'
  const valueCls = 'mt-0.5 text-sm font-medium text-black dark:text-white'

  const printHeader: PrintableReportHeader = {
    title: t('unitWorkQueue.productionFlow.document.printTitle'),
    subtitle: item.orderNo,
    meta: [
      { label: t('unitWorkQueue.productionFlow.document.printDate'), value: printedAt },
      { label: t('unitWorkQueue.productionFlow.document.projectName'), value: item.projectName },
      { label: t('unitWorkQueue.productionFlow.document.projectCode'), value: item.projectCode },
    ],
  }

  const printSections: PrintableReportSection[] = [
    {
      title: t('unitWorkQueue.productionFlow.document.sectionProject'),
      fields: [
        { label: t('unitWorkQueue.productionFlow.document.projectCode'), value: item.projectCode },
        { label: t('unitWorkQueue.productionFlow.document.projectName'), value: item.projectName },
      ],
    },
    {
      title: t('unitWorkQueue.productionFlow.document.sectionProduct'),
      fields: [
        { label: t('unitWorkQueue.productionFlow.document.productCode'), value: productCode },
        { label: t('unitWorkQueue.productionFlow.document.productName'), value: productName },
        { label: t('unitWorkQueue.productionFlow.document.mold'), value: moldLabel },
        { label: t('unitWorkQueue.productionFlow.document.volume'), value: volume },
        { label: t('unitWorkQueue.productionFlow.document.steel'), value: steel },
        { label: t('unitWorkQueue.productionFlow.document.recipe'), value: item.recipeId ?? '—' },
      ],
    },
    {
      title: t('unitWorkQueue.productionFlow.document.sectionOrder'),
      fields: [
        {
          label: t('unitWorkQueue.productionFlow.document.orderNo'),
          value: item.orderNo,
          mono: true,
        },
        {
          label: t('unitWorkQueue.productionFlow.document.shift'),
          value: item.shiftLabel ?? '—',
        },
        {
          label: t('unitWorkQueue.productionFlow.document.factory'),
          value: item.factoryCode,
        },
        {
          label: t('unitWorkQueue.productionFlow.document.planDay'),
          value: item.planDayIso ?? '—',
        },
      ],
    },
    {
      title: t('unitWorkQueue.productionFlow.document.sectionNotes'),
      notes,
      allowBreak: true,
    },
  ]

  const printFooter = `${item.projectCode} · ${productCode} · ${item.factoryCode}`
  const screenField = (labelKey: string, value: string, mono = false) => (
    <div>
      <dt className={labelCls}>{t(labelKey)}</dt>
      <dd className={`${valueCls} ${mono ? 'font-mono' : ''}`.trim()}>{value}</dd>
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
            <h4 className="text-lg font-semibold leading-tight text-black dark:text-white">
              {t('unitWorkQueue.productionFlow.document.title')}
            </h4>
            <p className="mt-0.5 font-mono text-sm text-black/70 dark:text-white/75">{item.orderNo}</p>
          </div>
          <PrintReportToolbar
            printLabel={t('unitWorkQueue.productionFlow.document.print')}
            pdfLabel={t('unitWorkQueue.curingReport.pdf')}
            pdfHint={t('unitWorkQueue.curingReport.pdfHint')}
            onPrint={() => print()}
          />
        </header>
      }
    >
      <section className={sectionCls}>
        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t('unitWorkQueue.productionFlow.document.sectionProject')}
        </h5>
        <dl className="grid gap-3 sm:grid-cols-2">
          {screenField('unitWorkQueue.productionFlow.document.projectCode', item.projectCode)}
          {screenField('unitWorkQueue.productionFlow.document.projectName', item.projectName)}
        </dl>
      </section>

      <section className={sectionCls}>
        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t('unitWorkQueue.productionFlow.document.sectionProduct')}
        </h5>
        <dl className="grid gap-3 sm:grid-cols-2">
          {screenField('unitWorkQueue.productionFlow.document.productCode', productCode)}
          {screenField('unitWorkQueue.productionFlow.document.productName', productName)}
          {screenField('unitWorkQueue.productionFlow.document.mold', moldLabel)}
          {screenField('unitWorkQueue.productionFlow.document.volume', volume)}
          {screenField('unitWorkQueue.productionFlow.document.steel', steel)}
          {screenField('unitWorkQueue.productionFlow.document.recipe', item.recipeId ?? '—')}
        </dl>
      </section>

      <section className={sectionCls}>
        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t('unitWorkQueue.productionFlow.document.sectionOrder')}
        </h5>
        <dl className="grid gap-3 sm:grid-cols-2">
          {screenField('unitWorkQueue.productionFlow.document.orderNo', item.orderNo, true)}
          {screenField('unitWorkQueue.productionFlow.document.shift', item.shiftLabel ?? '—')}
          {screenField('unitWorkQueue.productionFlow.document.factory', item.factoryCode)}
          {screenField('unitWorkQueue.productionFlow.document.planDay', item.planDayIso ?? '—')}
        </dl>
      </section>

      <RebarMaterialTraceSection item={item} gl={gl} />

      <section className={sectionCls}>
        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t('unitWorkQueue.productionFlow.document.sectionNotes')}
        </h5>
        <p className="text-sm leading-relaxed text-black/80 dark:text-white/85">{notes}</p>
      </section>
    </PrintableReportShell>
  )
}
