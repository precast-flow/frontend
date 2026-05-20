import { useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useQualityManagement } from '../../context/QualityManagementContext'
import { useWorkQueue } from '../../context/WorkQueueContext'
import { MOCK_QUALITY_SAMPLES } from '../../data/qualitySamplesMock'
import { splitDetailPanelBodyClass } from '../shared/splitModuleStyles'
import { printReportInIframe } from '../shared/printableReport/printReportInIframe'
import type { WorkQueueItem } from '../../data/workQueueMock'
import { SampleLabelPrintSheet } from './SampleLabelPrintSheet'
import { WorkOrderListProgress } from './WorkOrderListProgress'

type Props = {
  item: WorkQueueItem
  gl: boolean
}

type Mode = 'new' | 'link'

export function SampleOrderDetailPanel({ item, gl }: Props) {
  const { t } = useI18n()
  const {
    getSampleFlowState,
    printSampleLabel,
    linkExistingSample,
    completeSampleOrder,
  } = useWorkQueue()
  const { labTestsForSample } = useQualityManagement()
  const flow = getSampleFlowState(item.id)
  const [mode, setMode] = useState<Mode>('new')
  const [search, setSearch] = useState('')
  const [selectedSampleId, setSelectedSampleId] = useState('')
  const reportId = `sample-label-${item.id}`

  const cardCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  const filteredSamples = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return MOCK_QUALITY_SAMPLES.slice(0, 8)
    return MOCK_QUALITY_SAMPLES.filter(
      (s) =>
        s.sampleCode.toLowerCase().includes(q) ||
        s.project.toLowerCase().includes(q) ||
        s.orderNo.toLowerCase().includes(q),
    ).slice(0, 8)
  }, [search])

  const pourDate = item.planDayIso ?? new Date().toISOString().slice(0, 10)
  const sampleCode = flow.sampleLabelCode ?? ''
  const linkedSampleId = flow.linkedSampleId ?? selectedSampleId
  const linkedLabTests = labTestsForSample(linkedSampleId)

  const handlePrintLabel = () => {
    const code = printSampleLabel(item)
    if (!code) return
    window.setTimeout(() => printReportInIframe(reportId), 120)
  }

  const handleLink = () => {
    if (!selectedSampleId) return
    linkExistingSample(item, selectedSampleId)
    completeSampleOrder(item)
  }

  return (
    <div className={`${splitDetailPanelBodyClass} space-y-4 pb-4`}>
      <WorkOrderListProgress item={item} compact={false} />

      <dl className={`${cardCls} grid gap-3 sm:grid-cols-2`}>
        <div className="sm:col-span-2">
          <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.productionFlow.document.productName')}</dt>
          <dd className="font-medium text-black dark:text-white">{item.productName ?? item.title}</dd>
        </div>
        <div>
          <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.pour.mold')}</dt>
          <dd className="font-medium text-black dark:text-white">{item.moldName ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.pour.volume')}</dt>
          <dd className="font-medium text-black dark:text-white">
            {item.volumeM3 != null ? `${item.volumeM3} m³` : '—'}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.pour.recipe')}</dt>
          <dd className="font-medium text-black dark:text-white">{item.recipeId ?? '—'}</dd>
        </div>
      </dl>

      <div className="flex gap-2">
        <button
          type="button"
          className={modeTab(mode === 'new', gl)}
          onClick={() => setMode('new')}
        >
          {t('unitWorkQueue.sample.modeNew')}
        </button>
        <button
          type="button"
          className={modeTab(mode === 'link', gl)}
          onClick={() => setMode('link')}
        >
          {t('unitWorkQueue.sample.modeLink')}
        </button>
      </div>

      {mode === 'new' ? (
        <div className={cardCls}>
          <p className="text-sm text-black/75 dark:text-white/80">{t('unitWorkQueue.sample.newHint')}</p>
          {sampleCode ? (
            <p className="mt-2 font-mono text-sm font-semibold text-sky-900 dark:text-sky-100">{sampleCode}</p>
          ) : null}
          <button
            type="button"
            className="mt-3 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            onClick={handlePrintLabel}
          >
            {t('unitWorkQueue.sample.printLabel')}
          </button>
          {sampleCode ? (
            <SampleLabelPrintSheet item={item} sampleCode={sampleCode} reportId={reportId} pourDate={pourDate} />
          ) : null}
        </div>
      ) : null}

      {linkedLabTests.length > 0 ? (
        <div className={cardCls}>
          <h4 className="text-sm font-semibold text-black dark:text-white">
            {t('qualityLab.samplePanelTitle')}
          </h4>
          <ul className="mt-2 space-y-1 text-sm">
            {linkedLabTests.map((lt) => (
              <li key={lt.id} className="font-mono text-xs">
                {lt.testCode} · {lt.validityStartDate} – {lt.validityEndDate}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {mode === 'link' ? (
        <div className={cardCls}>
          <label className="text-xs font-semibold text-black/70 dark:text-white/75">
            {t('unitWorkQueue.sample.searchLabel')}
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
            {filteredSamples.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`w-full rounded-lg border px-2 py-1.5 text-left text-xs ${
                    selectedSampleId === s.id
                      ? 'border-sky-400 bg-sky-500/10'
                      : 'border-slate-200/80 dark:border-slate-600'
                  }`}
                  onClick={() => setSelectedSampleId(s.id)}
                >
                  <span className="font-mono font-semibold">{s.sampleCode}</span>
                  <span className="text-black/60 dark:text-white/65"> · {s.project}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!selectedSampleId}
            className="mt-3 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-45"
            onClick={handleLink}
          >
            {t('unitWorkQueue.sample.linkConfirm')}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function modeTab(active: boolean, gl: boolean) {
  return [
    'rounded-lg border px-3 py-1.5 text-xs font-semibold transition',
    active
      ? 'border-sky-400/60 bg-sky-500/15 text-sky-950 dark:text-sky-100'
      : gl
        ? 'border-black/12 text-black/70 dark:border-white/12 dark:text-white/70'
        : 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300',
  ].join(' ')
}
