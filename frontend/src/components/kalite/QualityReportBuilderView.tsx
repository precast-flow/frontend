import { useId, useMemo, useState } from 'react'
import { Download, FileCheck2, FileText } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  REPORT_PREVIEW_BODY,
  REPORT_TEMPLATE_LIST,
  formatMockReportNo,
  type ReportTemplateId,
} from '../../data/qualityReportMock'
import { findFactoryByCode } from '../../data/mockFactories'
import { useI18n } from '../../i18n/I18nProvider'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'

const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm hover:bg-gray-200/90 dark:bg-gray-800 dark:text-gray-100'

export function QualityReportBuilderView() {
  const { t } = useI18n()
  const baseId = useId()
  const { selectedFactory, selectedCodes, factories } = useFactoryContext()

  const [templateId, setTemplateId] = useState<ReportTemplateId>('slump_slip')
  const [seq] = useState(() => 4182 + Math.floor(Math.random() * 40))
  const [previewLang, setPreviewLang] = useState<'tr' | 'en'>('tr')
  const [toast, setToast] = useState<string | null>(null)

  const reportNo = useMemo(() => formatMockReportNo(seq), [seq])
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const factoryLabel =
    selectedCodes.length > 1
      ? selectedCodes.join(', ')
      : findFactoryByCode(selectedFactory.code, factories)?.name ?? selectedFactory.code

  const previewLines = REPORT_PREVIEW_BODY[templateId][previewLang]
  const templateLabelKey = REPORT_TEMPLATE_LIST.find((x) => x.id === templateId)?.labelKey ?? 'qualityReport.template.slumpSlip'

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2400)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">qual-07:</strong> {t('qualityReport.intro')}
      </p>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityReport.section.build')}</h3>

            <label className="mt-3 block" htmlFor={`${baseId}-tpl`}>
              <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                {t('qualityReport.field.template')}
              </span>
              <select
                id={`${baseId}-tpl`}
                className={`${inset} mt-1.5 font-medium`}
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value as ReportTemplateId)}
              >
                {REPORT_TEMPLATE_LIST.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </label>

            {/* P2 — şablon dili */}
            <label className="mt-4 block" htmlFor={`${baseId}-lang`}>
              <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                {t('qualityReport.field.previewLang')}
              </span>
              <select
                id={`${baseId}-lang`}
                className={`${inset} mt-1.5`}
                value={previewLang}
                onChange={(e) => setPreviewLang(e.target.value as 'tr' | 'en')}
              >
                <option value="tr">{t('qualityReport.lang.tr')}</option>
                <option value="en">{t('qualityReport.lang.en')}</option>
              </select>
            </label>

            <div className="mt-4 rounded-xl bg-gray-100 px-3 py-3 text-sm shadow-neo-in dark:bg-gray-900/80">
              <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">{t('qualityReport.headerBlock')}</p>
              <dl className="mt-2 space-y-1.5 text-xs text-gray-800 dark:text-gray-100">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500 dark:text-gray-400">{t('qualityReport.h.company')}</dt>
                  <dd className="text-right font-medium">{t('qualityReport.mockCompany')}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500 dark:text-gray-400">{t('qualityReport.h.factory')}</dt>
                  <dd className="text-right font-medium">{factoryLabel}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500 dark:text-gray-400">{t('qualityReport.h.reportNo')}</dt>
                  <dd className="font-mono text-right font-semibold text-gray-900 dark:text-gray-50">{reportNo}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500 dark:text-gray-400">{t('qualityReport.h.date')}</dt>
                  <dd className="font-mono text-right">{today}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={btnPrimary} onClick={() => showToast(t('qualityReport.toastDownload'))}>
                <Download className="size-4" strokeWidth={1.75} aria-hidden />
                {t('qualityReport.download')}
              </button>
              <button type="button" className={btnSecondary} onClick={() => showToast(t('qualityReport.toastReady'))}>
                <FileCheck2 className="size-4" strokeWidth={1.75} aria-hidden />
                {t('qualityReport.ready')}
              </button>
            </div>
          </section>
        </div>

        {/* Önizleme + imza */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <section className="flex min-h-[280px] flex-col rounded-2xl border border-gray-200/90 bg-gray-200/60 p-4 shadow-neo-in dark:border-gray-600 dark:bg-gray-900/90">
            <div className="mb-3 flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <FileText className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide">{t('qualityReport.previewLabel')}</span>
            </div>
            <div className="min-h-0 flex-1 rounded-xl bg-gray-300/50 px-4 py-5 dark:bg-gray-950/50">
              <p className="text-center text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400">
                PDF
              </p>
              <p className="mt-2 text-center text-sm font-semibold text-gray-800 dark:text-gray-100">
                {t(templateLabelKey)}
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                {previewLines.map((line, i) => (
                  <li key={i} className="border-b border-gray-400/30 pb-2 last:border-0 dark:border-gray-600/40">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* P1 — üç imza çizgisi */}
          <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-950/70">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityReport.signaturesTitle')}</h3>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              {(['lab', 'quality', 'site'] as const).map((role) => (
                <div key={role}>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    {t(`qualityReport.sign.${role}`)}
                  </p>
                  <div className="mt-8 border-b border-gray-800/80 dark:border-gray-200/80" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-gray-200/90 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 shadow-neo-out dark:border-gray-600 dark:bg-gray-900 dark:text-gray-50"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
