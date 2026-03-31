import { useEffect, useId, useMemo, useState } from 'react'
import { Barcode, ClipboardList, Factory, FileStack, FileText, History, LayoutList } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  MOCK_QUALITY_SAMPLES,
  getMockAttachments,
  getMockReportHistory,
  getMockTestsForSample,
  type QualitySampleDetail,
  type SampleStatus,
} from '../../data/qualitySamplesMock'
import { findFactoryByCode, MOCK_FACTORIES } from '../../data/mockFactories'
import { useI18n } from '../../i18n/I18nProvider'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

const tabBtn = (on: boolean) =>
  [
    'rounded-xl px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
    on
      ? 'bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900'
      : 'bg-gray-100 text-gray-600 shadow-neo-in hover:text-gray-900 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white',
  ].join(' ')

const statusPill = (s: SampleStatus) => {
  const map: Record<SampleStatus, string> = {
    draft: 'bg-gray-200 text-gray-800 ring-gray-400/50 dark:bg-gray-800 dark:text-gray-200',
    in_lab: 'bg-sky-100 text-sky-950 ring-sky-300/70 dark:bg-sky-950/50 dark:text-sky-100',
    tests_pending: 'bg-amber-100 text-amber-950 ring-amber-300/80 dark:bg-amber-950/40 dark:text-amber-100',
    passed: 'bg-emerald-100 text-emerald-950 ring-emerald-300/80 dark:bg-emerald-950/40 dark:text-emerald-100',
    failed: 'bg-rose-100 text-rose-950 ring-rose-300/80 dark:bg-rose-950/40 dark:text-rose-100',
    cancelled: 'bg-gray-300/80 text-gray-800 line-through ring-gray-400/60 dark:bg-gray-700 dark:text-gray-300',
  }
  return map[s]
}

const testStateClass = (state: 'pending' | 'ok' | 'fail') => {
  if (state === 'ok') return 'text-emerald-800 dark:text-emerald-200'
  if (state === 'fail') return 'text-rose-800 dark:text-rose-200'
  return 'text-amber-800 dark:text-amber-100'
}

type DetailTab = 'general' | 'tests' | 'attachments' | 'reports'

function filterSamples(
  rows: QualitySampleDetail[],
  opts: {
    dateFrom: string
    dateTo: string
    factoryCode: string
    project: string
    orderNo: string
    status: SampleStatus | ''
    isFactoryInScope: (code: string) => boolean
  },
): QualitySampleDetail[] {
  return rows.filter((r) => {
    if (!opts.isFactoryInScope(r.factoryCode)) return false
    if (opts.factoryCode && r.factoryCode !== opts.factoryCode) return false
    if (opts.project.trim() && !r.project.toLowerCase().includes(opts.project.trim().toLowerCase())) return false
    if (opts.orderNo.trim() && !r.orderNo.toLowerCase().includes(opts.orderNo.trim().toLowerCase())) return false
    if (opts.status && r.status !== opts.status) return false
    if (opts.dateFrom && r.takenAt < opts.dateFrom) return false
    if (opts.dateTo && r.takenAt > opts.dateTo) return false
    return true
  })
}

type QualitySamplesListViewProps = {
  onNavigate?: (moduleId: string) => void
}

export function QualitySamplesListView({ onNavigate }: QualitySamplesListViewProps = {}) {
  const { t } = useI18n()
  const baseId = useId()
  const { selectedCodes, factories, isFactoryInScope } = useFactoryContext()

  const [dateFrom, setDateFrom] = useState('2025-03-14')
  const [dateTo, setDateTo] = useState('2025-03-20')
  const [factoryFilter, setFactoryFilter] = useState(() => selectedCodes[0] ?? '')
  const [project, setProject] = useState('')
  const [orderNo, setOrderNo] = useState('')
  const [statusFilter, setStatusFilter] = useState<SampleStatus | ''>('')

  const [selectedId, setSelectedId] = useState<string>(MOCK_QUALITY_SAMPLES[0]?.id ?? '')
  const [detailTab, setDetailTab] = useState<DetailTab>('general')
  const [toast, setToast] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      filterSamples(MOCK_QUALITY_SAMPLES, {
        dateFrom,
        dateTo,
        factoryCode: factoryFilter,
        project,
        orderNo,
        status: statusFilter,
        isFactoryInScope,
      }),
    [dateFrom, dateTo, factoryFilter, project, orderNo, statusFilter, isFactoryInScope],
  )

  useEffect(() => {
    if (filtered.length === 0) return
    if (!filtered.some((r) => r.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  const selected = useMemo(() => {
    const hit = filtered.find((r) => r.id === selectedId)
    if (hit) return hit
    return filtered[0] ?? null
  }, [filtered, selectedId])

  const tests = selected ? getMockTestsForSample(selected.id) : []
  const attachments = selected ? getMockAttachments(selected.id) : []
  const reportHistory = selected ? getMockReportHistory(selected.id) : []

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2600)
  }

  const onMerge = () => {
    if (!selected) return
    if (window.confirm(t('qualitySamples.mergeConfirm', { code: selected.sampleCode }))) {
      showToast(t('qualitySamples.mergeToast'))
    }
  }

  const onCancel = () => {
    if (!selected) return
    if (window.confirm(t('qualitySamples.cancelConfirm', { code: selected.sampleCode }))) {
      showToast(t('qualitySamples.cancelToast'))
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">qual-02:</strong> {t('qualitySamples.intro')}
      </p>

      {/* P0 — filtreler */}
      <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/60">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualitySamples.filtersTitle')}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="block text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('qualitySamples.filter.dateFrom')}
            <input
              type="date"
              className={`${inset} mt-1`}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </label>
          <label className="block text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('qualitySamples.filter.dateTo')}
            <input type="date" className={`${inset} mt-1`} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>
          <label className="block text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('qualitySamples.filter.factory')}
            <select
              className={`${inset} mt-1`}
              value={factoryFilter}
              onChange={(e) => setFactoryFilter(e.target.value)}
            >
              <option value="">{t('qualitySamples.filter.allFactories')}</option>
              {MOCK_FACTORIES.map((f) => (
                <option key={f.code} value={f.code}>
                  {f.code}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('qualitySamples.filter.project')}
            <input
              className={`${inset} mt-1`}
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder={t('qualitySamples.filter.projectPh')}
            />
          </label>
          <label className="block text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('qualitySamples.filter.orderNo')}
            <input
              className={`${inset} mt-1 font-mono`}
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder="MES-"
            />
          </label>
          <label className="block text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('qualitySamples.filter.status')}
            <select
              className={`${inset} mt-1`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SampleStatus | '')}
            >
              <option value="">{t('qualitySamples.filter.allStatus')}</option>
              {(
                ['draft', 'in_lab', 'tests_pending', 'passed', 'failed', 'cancelled'] satisfies SampleStatus[]
              ).map((s) => (
                <option key={s} value={s}>
                  {t(`qualitySamples.status.${s}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12">
        {/* Tablo */}
        <div className="flex min-h-0 flex-col lg:col-span-7">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualitySamples.tableTitle')}</h3>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {t('qualitySamples.rowCount', { n: String(filtered.length) })}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-950/70">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="sticky top-0 z-[1] bg-gray-100 text-[11px] uppercase text-gray-500 shadow-sm dark:bg-gray-900 dark:text-gray-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">{t('qualitySamples.col.id')}</th>
                  <th className="px-3 py-2 font-semibold">{t('qualitySamples.col.date')}</th>
                  <th className="px-3 py-2 font-semibold">{t('qualitySamples.col.source')}</th>
                  <th className="px-3 py-2 font-semibold">{t('qualitySamples.col.recipe')}</th>
                  <th className="px-3 py-2 font-semibold">{t('qualitySamples.col.status')}</th>
                  <th className="px-3 py-2 font-semibold">{t('qualitySamples.col.owner')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-t border-gray-200/80 dark:border-gray-700/80 ${
                      row.id === selected?.id ? 'bg-gray-200/50 dark:bg-gray-800/80' : ''
                    }`}
                  >
                    <td className="px-3 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(row.id)
                          setDetailTab('general')
                        }}
                        className="text-left font-mono text-xs font-bold text-gray-900 underline decoration-gray-400 underline-offset-2 hover:text-gray-700 dark:text-gray-50 dark:hover:text-white"
                      >
                        {row.sampleCode}
                      </button>
                      <p className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">{row.project}</p>
                      <p className="text-[11px] font-mono text-gray-500 dark:text-gray-500">{row.orderNo}</p>
                    </td>
                    <td className="px-3 py-2 align-top text-gray-700 dark:text-gray-200">{row.takenAt}</td>
                    <td className="px-3 py-2 align-top text-gray-800 dark:text-gray-100">
                      {t(`qualitySamples.source.${row.source}`)}
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-xs text-gray-800 dark:text-gray-100">
                      {row.recipeCode}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${statusPill(row.status)}`}
                      >
                        {t(`qualitySamples.status.${row.status}`)}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top text-gray-700 dark:text-gray-200">{row.responsible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-300">
                {t('qualitySamples.empty')}
              </p>
            ) : null}
          </div>
        </div>

        {/* Detay panel */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          {selected ? (
            <>
              <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/80">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-bold text-gray-900 dark:text-gray-50">{selected.sampleCode}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {findFactoryByCode(selected.factoryCode, factories)?.name ?? selected.factoryCode} ·{' '}
                      {selected.project}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${statusPill(selected.status)}`}>
                    {t(`qualitySamples.status.${selected.status}`)}
                  </span>
                </div>

                {/* P1 — barkod / etiket */}
                <div
                  className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-100/80 px-3 py-3 dark:border-gray-600 dark:bg-gray-950/60"
                  aria-label={t('qualitySamples.barcodeAria')}
                >
                  <Barcode className="size-8 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth={1.25} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                      {t('qualitySamples.barcodeTitle')}
                    </p>
                    <p className="mt-1 font-mono text-sm tracking-[0.25em] text-gray-900 dark:text-gray-50">
                      {t('qualitySamples.barcodeMock', { code: selected.sampleCode.replace(/-/g, '') })}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{t('qualitySamples.barcodeHint')}</p>
                  </div>
                </div>

                {/* qual-10 — santral / MES köprüsü */}
                {onNavigate ? (
                  <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/90 px-3 py-3 dark:border-gray-600 dark:bg-gray-950/55">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t('qualitySamples.bridgeTitle')}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{t('qualitySamples.bridgeHint')}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-800 shadow-neo-out-sm min-w-[9rem] dark:bg-gray-800 dark:text-gray-100"
                        onClick={() => {
                          const batch = selected.pourBatchId ?? 'BP-MOCK'
                          onNavigate('batch-plant')
                          showToast(t('qualitySamples.bridgeToastPour', { batch }))
                        }}
                      >
                        <Factory className="size-3.5 shrink-0 opacity-90" aria-hidden />
                        {t('qualitySamples.openPour')}
                      </button>
                      <button
                        type="button"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-800 shadow-neo-out-sm min-w-[9rem] dark:bg-gray-800 dark:text-gray-100"
                        onClick={() => {
                          onNavigate('mes')
                          showToast(t('qualitySamples.bridgeToastMes'))
                        }}
                      >
                        <ClipboardList className="size-3.5 shrink-0 opacity-90" aria-hidden />
                        {t('qualitySamples.goMes')}
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Sekmeler */}
                <div
                  className="mt-4 flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 shadow-neo-in dark:bg-gray-950/80"
                  role="tablist"
                  aria-label={t('qualitySamples.detailTabsAria')}
                >
                  {(
                    [
                      ['general', LayoutList, 'qualitySamples.tab.general'] as const,
                      ['tests', FileText, 'qualitySamples.tab.tests'] as const,
                      ['attachments', FileStack, 'qualitySamples.tab.attachments'] as const,
                      ['reports', History, 'qualitySamples.tab.reports'] as const,
                    ] as const
                  ).map(([id, Icon, labelKey]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      id={`${baseId}-tab-${id}`}
                      aria-selected={detailTab === id}
                      className={`${tabBtn(detailTab === id)} inline-flex flex-1 items-center justify-center gap-1.5 min-w-[6rem]`}
                      onClick={() => setDetailTab(id)}
                    >
                      <Icon className="size-3.5 shrink-0 opacity-90" aria-hidden />
                      {t(labelKey)}
                    </button>
                  ))}
                </div>

                <div className="mt-4 text-sm text-gray-800 dark:text-gray-100" role="tabpanel">
                  {detailTab === 'general' ? (
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                        <dt className="text-gray-500 dark:text-gray-400">{t('qualitySamples.general.order')}</dt>
                        <dd className="font-mono text-gray-900 dark:text-gray-50">{selected.orderNo}</dd>
                      </div>
                      <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                        <dt className="text-gray-500 dark:text-gray-400">{t('qualitySamples.general.recipe')}</dt>
                        <dd className="font-mono">{selected.recipeCode}</dd>
                      </div>
                      <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                        <dt className="text-gray-500 dark:text-gray-400">{t('qualitySamples.general.class')}</dt>
                        <dd>{selected.concreteClass}</dd>
                      </div>
                      <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                        <dt className="text-gray-500 dark:text-gray-400">{t('qualitySamples.general.source')}</dt>
                        <dd>{t(`qualitySamples.source.${selected.source}`)}</dd>
                      </div>
                      {selected.pourBatchId ? (
                        <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                          <dt className="text-gray-500 dark:text-gray-400">{t('qualitySamples.general.batch')}</dt>
                          <dd className="font-mono text-xs">{selected.pourBatchId}</dd>
                        </div>
                      ) : null}
                      {selected.truckPlate ? (
                        <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                          <dt className="text-gray-500 dark:text-gray-400">{t('qualitySamples.general.plate')}</dt>
                          <dd className="font-mono">{selected.truckPlate}</dd>
                        </div>
                      ) : null}
                      {selected.notes ? (
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">{t('qualitySamples.general.notes')}</dt>
                          <dd className="mt-1 rounded-lg bg-gray-100 px-2 py-2 text-xs text-gray-700 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-200">
                            {selected.notes}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}

                  {detailTab === 'tests' ? (
                    <div className="overflow-x-auto rounded-xl bg-gray-100 shadow-neo-in dark:bg-gray-950/60">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[10px] uppercase text-gray-500 dark:text-gray-400">
                          <tr>
                            <th className="px-2 py-2">{t('qualitySamples.tests.colTest')}</th>
                            <th className="px-2 py-2">{t('qualitySamples.tests.colResult')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tests.map((te) => (
                            <tr key={te.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                              <td className="px-2 py-2 font-medium text-gray-800 dark:text-gray-100">{t(te.nameKey)}</td>
                              <td className={`px-2 py-2 font-medium ${testStateClass(te.state)}`}>
                                {t(te.resultKey)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {detailTab === 'attachments' ? (
                    <ul className="space-y-2">
                      {attachments.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center justify-between gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs shadow-neo-out-sm dark:bg-gray-950/70"
                        >
                          <span className="font-medium text-gray-800 dark:text-gray-100">{t(a.nameKey)}</span>
                          <span className="text-gray-500 dark:text-gray-400">{t(a.metaKey)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {detailTab === 'reports' ? (
                    <ul className="space-y-2">
                      {reportHistory.map((rh) => (
                        <li
                          key={rh.id}
                          className="rounded-xl border border-gray-200/90 bg-gray-50 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-950/50"
                        >
                          <p className="font-medium text-gray-900 dark:text-gray-50">{t(rh.labelKey)}</p>
                          <p className="mt-0.5 text-gray-500 dark:text-gray-400">
                            {rh.at} · {t(rh.stateKey)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {/* P2 — birleştir / iptal */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200/90 pt-4 dark:border-gray-700/90">
                  <button
                    type="button"
                    onClick={onMerge}
                    className="rounded-xl border border-amber-400/80 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950 shadow-neo-out-sm hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/60"
                  >
                    {t('qualitySamples.merge')}
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-rose-400/90 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-950 shadow-neo-out-sm hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-100 dark:hover:bg-rose-950/70"
                  >
                    {t('qualitySamples.cancelSample')}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="rounded-2xl bg-gray-100 p-6 text-center text-sm text-gray-600 shadow-neo-in dark:bg-gray-900 dark:text-gray-300">
              {t('qualitySamples.pickRow')}
            </p>
          )}
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
