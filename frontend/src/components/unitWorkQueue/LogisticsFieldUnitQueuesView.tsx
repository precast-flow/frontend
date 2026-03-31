import { useMemo, useState } from 'react'
import { Factory, MapPin, X } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  initialFieldRowsBie08,
  initialLogisticsRowsBie08,
  type FieldUnitRowBie08,
  type LogisticsUnitRowBie08,
} from '../../data/logisticsFieldUnitWorkBie08Mock'
import { projects } from '../../data/projectsMock'
import { useI18n } from '../../i18n/I18nProvider'

type TabId = 'logistics' | 'field'

type Props = {
  onNavigate: (moduleId: string) => void
}

const inset =
  'rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'
const tabBtn = (on: boolean) =>
  [
    'rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
    on
      ? 'bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900'
      : 'bg-gray-100 text-gray-700 shadow-neo-in dark:bg-gray-900 dark:text-gray-200',
  ].join(' ')

export function LogisticsFieldUnitQueuesView({ onNavigate }: Props) {
  const { t } = useI18n()
  const { selectedCodes, isFactoryInScope } = useFactoryContext()

  const [tab, setTab] = useState<TabId>('logistics')
  const [logisticsRows, setLogisticsRows] = useState(() =>
    initialLogisticsRowsBie08.map((r) => ({ ...r })),
  )
  const [fieldRows, setFieldRows] = useState(() => initialFieldRowsBie08.map((r) => ({ ...r })))

  const [selectedLog, setSelectedLog] = useState<LogisticsUnitRowBie08 | null>(null)
  const [selectedField, setSelectedField] = useState<FieldUnitRowBie08 | null>(null)

  const [manProjectId, setManProjectId] = useState(projects[0]!.id)
  const [manLoadWindow, setManLoadWindow] = useState('01.04.2026 08:00–12:00')
  const [manTarget, setManTarget] = useState('')
  const [manAddress, setManAddress] = useState('')
  const [manChain, setManChain] = useState('')

  const [manFieldActivity, setManFieldActivity] = useState<FieldUnitRowBie08['activity']>('teslim')
  const [manFieldDate, setManFieldDate] = useState('02.04.2026')
  const [manFieldAddr, setManFieldAddr] = useState('')
  const [manFieldChain, setManFieldChain] = useState('')

  const filteredLogistics = useMemo(
    () =>
      logisticsRows.filter((r) => isFactoryInScope(r.factoryCode)),
    [logisticsRows, isFactoryInScope],
  )

  const filteredField = useMemo(
    () => fieldRows.filter((r) => isFactoryInScope(r.factoryCode)),
    [fieldRows, isFactoryInScope],
  )

  const addManualLogistics = () => {
    const p = projects.find((x) => x.id === manProjectId) ?? projects[0]!
    const id = `ls-man-${Date.now()}`
    const row: LogisticsUnitRowBie08 = {
      id,
      factoryCode: p.factoryCode,
      workOrderNo: `IE-LOJ-MAN-${String(Date.now()).slice(-4)}`,
      projectCode: p.code,
      projectName: p.name,
      productionRef: null,
      loadWindow: manLoadWindow,
      status: 'beklemede',
      targetSite: manTarget || t('bie08.manual.defaultTarget'),
      triggerSource: 'manuel',
      address: manAddress || p.siteAddress,
      chainNote: manChain || t('bie08.manual.defaultChainLog'),
      mapPlaceholder: t('bie08.map.manual'),
    }
    setLogisticsRows((prev) => [row, ...prev])
  }

  const addManualField = () => {
    const p = projects.find((x) => x.id === manProjectId) ?? projects[0]!
    const id = `sf-man-${Date.now()}`
    const row: FieldUnitRowBie08 = {
      id,
      factoryCode: p.factoryCode,
      workOrderNo: `IE-SAH-MAN-${String(Date.now()).slice(-4)}`,
      projectCode: p.code,
      projectName: p.name,
      activity: manFieldActivity,
      status: 'beklemede',
      dateLabel: manFieldDate,
      triggerSource: 'manuel',
      address: manFieldAddr || p.siteAddress,
      chainNote: manFieldChain || t('bie08.manual.defaultChainField'),
      logisticsRef: null,
      mapPlaceholder: t('bie08.map.manual'),
    }
    setFieldRows((prev) => [row, ...prev])
  }

  const planBadgeClass =
    'inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-950 ring-1 ring-violet-300/80 dark:bg-violet-950/40 dark:text-violet-100'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">bie-08:</strong> {t('bie08.intro')}
      </p>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-gray-50 px-3 py-2 shadow-neo-in dark:bg-gray-950/80">
        <Factory className="size-4 text-gray-500" strokeWidth={1.75} aria-hidden />
        <span className="text-xs text-gray-600 dark:text-gray-300">{t('bie08.factoryScope')}:</span>
        <span className="font-mono text-xs font-medium text-gray-800 dark:text-gray-100">
          {selectedCodes.join(', ')}
        </span>
      </div>

      <section
        className="rounded-2xl border border-gray-200/80 bg-gray-50/90 p-4 shadow-neo-in dark:border-gray-700/80 dark:bg-gray-950/60"
        aria-labelledby="bie08-rules-h"
      >
        <h2 id="bie08-rules-h" className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
          {t('bie08.rulesTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200">{t('bie08.rulesBody')}</p>
        <p className="mt-3 text-[11px] font-medium text-gray-600 dark:text-gray-400">{t('bie08.decisionNote')}</p>
      </section>

      <div className="flex flex-wrap gap-2 border-b border-gray-200/90 pb-3 dark:border-gray-700/90">
        <button type="button" className={tabBtn(tab === 'logistics')} onClick={() => setTab('logistics')}>
          {t('bie08.tab.logistics')}
        </button>
        <button type="button" className={tabBtn(tab === 'field')} onClick={() => setTab('field')}>
          {t('bie08.tab.field')}
        </button>
        <button
          type="button"
          onClick={() => onNavigate('dispatch')}
          className="ml-auto rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-100"
        >
          {t('bie08.linkDispatch')}
        </button>
      </div>

      {tab === 'logistics' ? (
        <div className="min-h-0 flex-1 overflow-auto rounded-2xl bg-gray-50 shadow-neo-in dark:bg-gray-950/50">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200/90 bg-gray-100/90 text-[11px] font-semibold uppercase text-gray-500 dark:border-gray-700/90 dark:bg-gray-900/80 dark:text-gray-400">
                <th className="px-3 py-3">{t('bie08.log.colOrder')}</th>
                <th className="px-3 py-3">{t('bie08.log.colProject')}</th>
                <th className="px-3 py-3">{t('bie08.log.colProdRef')}</th>
                <th className="px-3 py-3">{t('bie08.log.colWindow')}</th>
                <th className="px-3 py-3">{t('bie08.log.colStatus')}</th>
                <th className="px-3 py-3">{t('bie08.log.colSite')}</th>
                <th className="px-3 py-3">{t('bie08.colTrigger')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogistics.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-gray-200/60 hover:bg-gray-100/90 dark:border-gray-800/80 dark:hover:bg-gray-900/70"
                  onClick={() => {
                    setSelectedLog(row)
                    setSelectedField(null)
                  }}
                >
                  <td className="px-3 py-3 font-mono text-xs font-semibold text-gray-900 dark:text-gray-50">
                    {row.workOrderNo}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-50">{row.projectName}</div>
                    <div className="font-mono text-[11px] text-gray-500">{row.projectCode}</div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-700 dark:text-gray-200">
                    {row.productionRef ?? '—'}
                  </td>
                  <td className="px-3 py-3 text-gray-800 dark:text-gray-200">{row.loadWindow}</td>
                  <td className="px-3 py-3">{t(`bie08.log.status.${row.status}`)}</td>
                  <td className="max-w-[10rem] truncate px-3 py-3 text-gray-800 dark:text-gray-200">{row.targetSite}</td>
                  <td className="px-3 py-3">
                    {row.triggerSource === 'otomatik_plan' ? (
                      <span className={planBadgeClass}>{t('bie08.badge.plan')}</span>
                    ) : (
                      <span className="text-xs text-gray-600 dark:text-gray-400">{t('bie08.badge.manual')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogistics.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">{t('bie08.empty')}</p>
          ) : null}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto rounded-2xl bg-gray-50 shadow-neo-in dark:bg-gray-950/50">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200/90 bg-gray-100/90 text-[11px] font-semibold uppercase text-gray-500 dark:border-gray-700/90 dark:bg-gray-900/80 dark:text-gray-400">
                <th className="px-3 py-3">{t('bie08.field.colOrder')}</th>
                <th className="px-3 py-3">{t('bie08.field.colProject')}</th>
                <th className="px-3 py-3">{t('bie08.field.colActivity')}</th>
                <th className="px-3 py-3">{t('bie08.field.colStatus')}</th>
                <th className="px-3 py-3">{t('bie08.field.colDate')}</th>
                <th className="px-3 py-3">{t('bie08.colTrigger')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredField.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-gray-200/60 hover:bg-gray-100/90 dark:border-gray-800/80 dark:hover:bg-gray-900/70"
                  onClick={() => {
                    setSelectedField(row)
                    setSelectedLog(null)
                  }}
                >
                  <td className="px-3 py-3 font-mono text-xs font-semibold text-gray-900 dark:text-gray-50">
                    {row.workOrderNo}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-50">{row.projectName}</div>
                    <div className="font-mono text-[11px] text-gray-500">{row.projectCode}</div>
                  </td>
                  <td className="px-3 py-3">{t(`bie08.field.activity.${row.activity}`)}</td>
                  <td className="px-3 py-3">{t(`bie08.field.status.${row.status}`)}</td>
                  <td className="px-3 py-3 font-mono text-xs">{row.dateLabel}</td>
                  <td className="px-3 py-3">
                    {row.triggerSource === 'otomatik_plan' ? (
                      <span className={planBadgeClass}>{t('bie08.badge.plan')}</span>
                    ) : (
                      <span className="text-xs text-gray-600 dark:text-gray-400">{t('bie08.badge.manual')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredField.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">{t('bie08.empty')}</p>
          ) : null}
        </div>
      )}

      <section className="rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-900">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('bie08.manual.title')}</h3>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t('bie08.manual.hint')}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('bie08.manual.project')}</span>
            <select
              className={`${inset} mt-1 w-full`}
              value={manProjectId}
              onChange={(e) => setManProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          </label>
          {tab === 'logistics' ? (
            <>
              <label className="sm:col-span-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('bie08.manual.loadWindow')}</span>
                <input className={`${inset} mt-1 w-full`} value={manLoadWindow} onChange={(e) => setManLoadWindow(e.target.value)} />
              </label>
              <label className="sm:col-span-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('bie08.manual.target')}</span>
                <input className={`${inset} mt-1 w-full`} value={manTarget} onChange={(e) => setManTarget(e.target.value)} />
              </label>
              <label className="sm:col-span-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('bie08.manual.address')}</span>
                <input className={`${inset} mt-1 w-full`} value={manAddress} onChange={(e) => setManAddress(e.target.value)} />
              </label>
              <label className="sm:col-span-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('bie08.manual.chain')}</span>
                <textarea className={`${inset} mt-1 w-full resize-none`} rows={2} value={manChain} onChange={(e) => setManChain(e.target.value)} />
              </label>
              <button
                type="button"
                onClick={addManualLogistics}
                className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
              >
                {t('bie08.manual.submitLog')}
              </button>
            </>
          ) : (
            <>
              <label>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('bie08.manual.activity')}</span>
                <select
                  className={`${inset} mt-1 w-full`}
                  value={manFieldActivity}
                  onChange={(e) => setManFieldActivity(e.target.value as FieldUnitRowBie08['activity'])}
                >
                  <option value="teslim">{t('bie08.field.activity.teslim')}</option>
                  <option value="montaj">{t('bie08.field.activity.montaj')}</option>
                  <option value="kontrol">{t('bie08.field.activity.kontrol')}</option>
                </select>
              </label>
              <label>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('bie08.field.colDate')}</span>
                <input className={`${inset} mt-1 w-full`} value={manFieldDate} onChange={(e) => setManFieldDate(e.target.value)} />
              </label>
              <label className="sm:col-span-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('bie08.manual.address')}</span>
                <input className={`${inset} mt-1 w-full`} value={manFieldAddr} onChange={(e) => setManFieldAddr(e.target.value)} />
              </label>
              <label className="sm:col-span-2">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('bie08.manual.chain')}</span>
                <textarea className={`${inset} mt-1 w-full resize-none`} rows={2} value={manFieldChain} onChange={(e) => setManFieldChain(e.target.value)} />
              </label>
              <button
                type="button"
                onClick={addManualField}
                className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
              >
                {t('bie08.manual.submitField')}
              </button>
            </>
          )}
        </div>
      </section>

      {selectedLog || selectedField ? (
        <>
          <button
            type="button"
            className="gm-glass-drawer-backdrop fixed inset-0 z-40 border-0 p-0"
            aria-label={t('unitWorkQueue.close')}
            onClick={() => {
              setSelectedLog(null)
              setSelectedField(null)
            }}
          />
          <aside className="gm-glass-drawer-panel fixed inset-y-0 right-0 z-50 flex min-h-0 w-full max-w-md flex-col overflow-hidden border-l border-gray-200/90 bg-pf-surface shadow-neo-out dark:border-gray-700/90">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200/90 p-4 dark:border-gray-700/90">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {selectedLog?.workOrderNo ?? selectedField?.workOrderNo}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedLog?.projectName ?? selectedField?.projectName}
                </p>
              </div>
              <button
                type="button"
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => { setSelectedLog(null); setSelectedField(null) }}
                aria-label={t('unitWorkQueue.close')}
              >
                <X className="size-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-sm text-gray-700 dark:text-gray-200">
              <div
                className="flex min-h-[140px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-400/80 bg-gray-200/50 p-4 text-center dark:border-gray-600 dark:bg-gray-800/50"
                aria-hidden
              >
                <MapPin className="mb-2 size-8 text-gray-500" strokeWidth={1.5} />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t('bie08.map.title')}</p>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  {selectedLog?.mapPlaceholder ?? selectedField?.mapPlaceholder}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('bie08.detail.address')}</p>
                <p className="mt-1">{selectedLog?.address ?? selectedField?.address}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/80">
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('bie08.detail.chain')}</p>
                <p className="mt-2 leading-relaxed">{selectedLog?.chainNote ?? selectedField?.chainNote}</p>
              </div>
              {selectedField?.logisticsRef ? (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">{t('bie08.detail.logRef')}:</span>{' '}
                  <span className="font-mono">{selectedField.logisticsRef}</span>
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => onNavigate('dispatch')}
                className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-100"
              >
                {t('bie08.detail.openDispatch')}
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  )
}
