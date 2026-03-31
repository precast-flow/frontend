import { useEffect, useMemo, useState } from 'react'
import { Link2, Lock } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  MOCK_ARCHIVE_DOWNLOADS,
  MOCK_ARCHIVE_HASH_NOTE,
  MOCK_ARCHIVE_REPORTS,
  MOCK_TENANT_COMPANY,
  filterArchiveRows,
} from '../../data/qualityReportArchiveMock'
import { MOCK_FACTORIES } from '../../data/mockFactories'
import { useI18n } from '../../i18n/I18nProvider'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

export function QualityReportArchiveView() {
  const { t } = useI18n()
  const { selectedCodes } = useFactoryContext()

  const [factoryFilter, setFactoryFilter] = useState(() => selectedCodes[0] ?? '')
  const [project, setProject] = useState('')
  const [dateFrom, setDateFrom] = useState('2025-02-01')
  const [dateTo, setDateTo] = useState('2025-03-31')
  const [reportNo, setReportNo] = useState('')
  const [orderNo, setOrderNo] = useState('')

  const [selectedId, setSelectedId] = useState<string>(MOCK_ARCHIVE_REPORTS[0]?.id ?? '')

  const filtered = useMemo(
    () =>
      filterArchiveRows(MOCK_ARCHIVE_REPORTS, {
        factoryCode: factoryFilter,
        project,
        dateFrom,
        dateTo,
        reportNo,
        orderNo,
      }),
    [factoryFilter, project, dateFrom, dateTo, reportNo, orderNo],
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

  const downloads = selected ? MOCK_ARCHIVE_DOWNLOADS[selected.id] ?? [] : []

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">qual-09:</strong> {t('qualityArchive.intro')}
      </p>

      {/* P0 — filtreler */}
      <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityArchive.filtersTitle')}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
              {t('qualityArchive.filter.company')}
            </span>
            <input className={`${inset} mt-1 cursor-not-allowed opacity-90`} value={MOCK_TENANT_COMPANY} readOnly title={t('qualityArchive.companyReadonly')} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
              {t('qualityArchive.filter.factory')}
            </span>
            <select className={`${inset} mt-1`} value={factoryFilter} onChange={(e) => setFactoryFilter(e.target.value)}>
              <option value="">{t('qualityArchive.filter.allFactories')}</option>
              {MOCK_FACTORIES.map((f) => (
                <option key={f.code} value={f.code}>
                  {f.code}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
              {t('qualityArchive.filter.project')}
            </span>
            <input className={`${inset} mt-1`} value={project} onChange={(e) => setProject(e.target.value)} placeholder={t('qualityArchive.filter.projectPh')} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
              {t('qualityArchive.filter.dateFrom')}
            </span>
            <input type="date" className={`${inset} mt-1`} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
              {t('qualityArchive.filter.dateTo')}
            </span>
            <input type="date" className={`${inset} mt-1`} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
              {t('qualityArchive.filter.reportNo')}
            </span>
            <input className={`${inset} mt-1 font-mono`} value={reportNo} onChange={(e) => setReportNo(e.target.value)} placeholder="RAP-" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
              {t('qualityArchive.filter.orderNo')}
            </span>
            <input className={`${inset} mt-1 font-mono`} value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="MES-" />
          </label>
        </div>
      </section>

      <div className="grid min-h-0 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityArchive.tableTitle')}</h3>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {t('qualityArchive.rowCount', { n: String(filtered.length) })}
            </span>
          </div>
          <div className="overflow-x-auto rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-950/70">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="text-[11px] uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">{t('qualityArchive.col.reportNo')}</th>
                  <th className="px-3 py-2 font-semibold">{t('qualityArchive.col.type')}</th>
                  <th className="px-3 py-2 font-semibold">{t('qualityArchive.col.period')}</th>
                  <th className="px-3 py-2 font-semibold">{t('qualityArchive.col.factory')}</th>
                  <th className="px-3 py-2 font-semibold">{t('qualityArchive.col.author')}</th>
                  <th className="px-3 py-2 font-semibold">{t('qualityArchive.col.version')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className={`cursor-pointer border-t border-gray-200/80 dark:border-gray-700/80 ${
                      row.id === selected?.id ? 'bg-gray-200/50 dark:bg-gray-800/80' : ''
                    }`}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <td className="px-3 py-2 font-mono text-xs font-bold text-gray-900 dark:text-gray-50">{row.reportNo}</td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{t(row.typeKey)}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{row.period}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-200">{row.factoryCode}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{row.createdBy}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">{row.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-300">{t('qualityArchive.empty')}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {selected ? (
            <>
              <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/85">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
                  <Link2 className="size-4 text-gray-500" strokeWidth={1.75} aria-hidden />
                  {t('qualityArchive.detailTitle')}
                </h3>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{t('qualityArchive.detailHint')}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                    <dt className="text-gray-500 dark:text-gray-400">{t('qualityArchive.meta.project')}</dt>
                    <dd className="text-right font-medium text-gray-900 dark:text-gray-50">{selected.project}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                    <dt className="text-gray-500 dark:text-gray-400">{t('qualityArchive.meta.customer')}</dt>
                    <dd className="text-right text-gray-800 dark:text-gray-100">{selected.customerName}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                    <dt className="text-gray-500 dark:text-gray-400">{t('qualityArchive.meta.sample')}</dt>
                    <dd className="font-mono text-right text-gray-900 dark:text-gray-50">{selected.sampleCode}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                    <dt className="text-gray-500 dark:text-gray-400">{t('qualityArchive.meta.recipeSample')}</dt>
                    <dd className="font-mono text-right">{selected.sampleRecipe}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                    <dt className="text-gray-500 dark:text-gray-400">{t('qualityArchive.meta.recipeOrder')}</dt>
                    <dd className="font-mono text-right">{selected.orderRecipe}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                    <dt className="text-gray-500 dark:text-gray-400">{t('qualityArchive.meta.order')}</dt>
                    <dd className="font-mono text-right">{selected.orderNo}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500 dark:text-gray-400">{t('qualityArchive.meta.pour')}</dt>
                    <dd className="font-mono text-right">{selected.pourBatchId}</dd>
                  </div>
                </dl>
              </section>

              {/* P1 — indir geçmişi */}
              <section className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-4 dark:border-gray-600 dark:bg-gray-950/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityArchive.downloadTitle')}</h3>
                {downloads.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-200">
                    {downloads.map((d, i) => (
                      <li key={i} className="flex justify-between gap-2 rounded-lg bg-gray-100 px-2 py-1.5 dark:bg-gray-900/80">
                        <span className="font-medium">{d.user}</span>
                        <span className="font-mono text-gray-500 dark:text-gray-400">{d.at}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('qualityArchive.downloadEmpty')}</p>
                )}
              </section>

              {/* P2 — hash notu */}
              <section className="rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-950/70">
                <div className="flex items-start gap-2">
                  <Lock className="mt-0.5 size-4 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth={1.75} aria-hidden />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityArchive.hashTitle')}</h3>
                    <p className="mt-2 break-all font-mono text-[11px] leading-relaxed text-gray-700 dark:text-gray-300">
                      {MOCK_ARCHIVE_HASH_NOTE}
                    </p>
                    <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{t('qualityArchive.hashHint')}</p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <p className="rounded-2xl bg-gray-100 p-6 text-center text-sm text-gray-600 shadow-neo-in dark:bg-gray-900 dark:text-gray-300">
              {t('qualityArchive.pickRow')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
