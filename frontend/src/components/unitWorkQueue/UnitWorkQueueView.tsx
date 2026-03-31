import { useEffect, useMemo, useState } from 'react'
import { Factory, Inbox, Send, X } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import { useProductionQuality } from '../../context/ProductionQualityContext'
import {
  MOCK_UNIT_EXEC_SUMMARY,
  MOCK_UNIT_WORK_ASSIGNED_BY,
  MOCK_UNIT_WORK_ASSIGNED_TO,
  MOCK_UNITS,
  unitNameById,
  type MockUnitWorkRow,
  type UnitWorkAssignmentKind,
} from '../../data/mockUnitWorkQueue'
import { useI18n } from '../../i18n/I18nProvider'

type TabId = 'to_me' | 'by_me'

type Props = {
  onNavigate: (moduleId: string) => void
}

const inset =
  'rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'
const tabBtn = (on: boolean) =>
  [
    'rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900',
    on
      ? 'bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900'
      : 'bg-gray-100 text-gray-700 shadow-neo-in hover:text-gray-900 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-white',
  ].join(' ')
const btnNeo =
  'rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-100 dark:hover:text-white dark:ring-offset-gray-900'
const btnPrimary =
  'rounded-xl bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900'

function kindLabelKey(k: UnitWorkAssignmentKind): string {
  return `unitWorkQueue.kind.${k}`
}

function statusLabelKey(s: MockUnitWorkRow['status']): string {
  return `unitWorkQueue.status.${s}`
}

function priorityLabelKey(p: MockUnitWorkRow['priority']): string {
  return `unitWorkQueue.priority.${p}`
}

function bie07QualityChipClass(p: NonNullable<MockUnitWorkRow['bie07']>['qualityProgress']): string {
  const base = 'mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1'
  switch (p) {
    case 'bekliyor':
      return `${base} bg-amber-100 text-amber-950 ring-amber-300/80 dark:bg-amber-950/40 dark:text-amber-100`
    case 'devam':
      return `${base} bg-sky-100 text-sky-950 ring-sky-300/80 dark:bg-sky-950/40 dark:text-sky-100`
    case 'tamam':
      return `${base} bg-emerald-100 text-emerald-950 ring-emerald-300/80 dark:bg-emerald-950/40 dark:text-emerald-100`
    default:
      return base
  }
}

export function UnitWorkQueueView({ onNavigate }: Props) {
  const { t } = useI18n()
  const { selectedCodes, isFactoryInScope } = useFactoryContext()
  const { extraUnitWorkAssignedBy } = useProductionQuality()
  const [unitId, setUnitId] = useState(MOCK_UNITS.find((u) => u.id === 'u-uretim')?.id ?? MOCK_UNITS[0].id)
  const [tab, setTab] = useState<TabId>('to_me')
  const [selected, setSelected] = useState<MockUnitWorkRow | null>(null)
  const [panelTab, setPanelTab] = useState<'summary' | 'project' | 'history'>('summary')

  const rowsToMe = useMemo(() => {
    return MOCK_UNIT_WORK_ASSIGNED_TO.filter(
      (r) =>
        r.assigneeUnitId === unitId && isFactoryInScope(r.factoryCode),
    )
  }, [unitId, isFactoryInScope])

  const rowsByMe = useMemo(() => {
    return [...MOCK_UNIT_WORK_ASSIGNED_BY, ...extraUnitWorkAssignedBy].filter(
      (r) =>
        r.assignerUnitId === unitId && isFactoryInScope(r.factoryCode),
    )
  }, [unitId, isFactoryInScope, extraUnitWorkAssignedBy])

  const kpis = useMemo(() => {
    const src = tab === 'to_me' ? rowsToMe : rowsByMe
    const pending = src.filter((r) => r.status === 'beklemede' || r.status === 'islemde').length
    const blocked = src.filter((r) => r.status === 'bloke').length
    const dueToday = tab === 'to_me' ? Math.min(2, pending) : Math.min(1, pending)
    return { pending, blocked, dueToday }
  }, [tab, rowsToMe, rowsByMe])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (selected) setPanelTab('summary')
  }, [selected])

  const tableRows = tab === 'to_me' ? rowsToMe : rowsByMe

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">bie-05 (mock):</strong>{' '}
        {t('unitWorkQueue.intro')}
      </p>
      <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('unitWorkQueue.unitChangeNote')}</p>

      <div className="flex flex-wrap items-end gap-4">
        <label className="min-w-[220px] flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('unitWorkQueue.unitContext')}
          </span>
          <select
            className={`${inset} mt-1 w-full`}
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
          >
            {MOCK_UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 shadow-neo-in dark:bg-gray-950/80">
          <Factory className="size-4 text-gray-500 dark:text-gray-400" strokeWidth={1.75} aria-hidden />
          <span className="text-xs text-gray-600 dark:text-gray-300">{t('unitWorkQueue.factoryScope')}:</span>
          <span className="font-mono text-xs font-medium text-gray-800 dark:text-gray-100">
            {selectedCodes.join(', ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-900/90">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('unitWorkQueue.kpiPending')}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-50">{kpis.pending}</p>
        </div>
        <div className="rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-900/90">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('unitWorkQueue.kpiDueToday')}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-50">{kpis.dueToday}</p>
        </div>
        <div className="rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-900/90">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('unitWorkQueue.kpiBlocked')}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-800 dark:text-amber-200">{kpis.blocked}</p>
        </div>
      </div>

      <section
        className="rounded-2xl border border-gray-200/80 bg-gray-50/90 p-4 shadow-neo-in dark:border-gray-700/80 dark:bg-gray-950/60"
        aria-labelledby="exec-summary-h"
      >
        <h2 id="exec-summary-h" className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
          {t('unitWorkQueue.execSummaryTitle')}
        </h2>
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{t('unitWorkQueue.execSummaryHint')}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_UNIT_EXEC_SUMMARY.map((s) => (
            <div
              key={s.unitId}
              className="rounded-xl bg-gray-100 px-3 py-2.5 text-xs shadow-neo-out-sm dark:bg-gray-900/90"
            >
              <p className="font-semibold text-gray-900 dark:text-gray-50">{unitNameById(s.unitId)}</p>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                {t('unitWorkQueue.execOpen')}: <span className="font-mono tabular-nums">{s.openCount}</span>
                {' · '}
                {t('unitWorkQueue.execBlocked')}: <span className="font-mono tabular-nums">{s.blockedCount}</span>
                {' · '}
                {t('unitWorkQueue.execDue')}: <span className="font-mono tabular-nums">{s.dueTodayCount}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-b border-gray-200/90 pb-3 dark:border-gray-700/90">
        <button type="button" className={tabBtn(tab === 'to_me')} onClick={() => setTab('to_me')}>
          <span className="inline-flex items-center gap-2">
            <Inbox className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {t('unitWorkQueue.tabToMe')}
          </span>
        </button>
        <button type="button" className={tabBtn(tab === 'by_me')} onClick={() => setTab('by_me')}>
          <span className="inline-flex items-center gap-2">
            <Send className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {t('unitWorkQueue.tabByMe')}
          </span>
        </button>
      </div>

      {tab === 'by_me' ? (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong className="text-gray-800 dark:text-gray-200">{t('unitWorkQueue.tabByMe')}:</strong>{' '}
          {t('unitWorkQueue.trackingHint')}
        </p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-auto rounded-2xl bg-gray-50 shadow-neo-in dark:bg-gray-950/50">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200/90 bg-gray-100/90 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700/90 dark:bg-gray-900/80 dark:text-gray-400">
              <th className="px-4 py-3">{t('unitWorkQueue.colOrder')}</th>
              <th className="px-4 py-3">{t('unitWorkQueue.colProject')}</th>
              <th className="px-4 py-3">{t('unitWorkQueue.colKind')}</th>
              <th className="px-4 py-3">{t('unitWorkQueue.colStatus')}</th>
              <th className="px-4 py-3">{t('unitWorkQueue.colPriority')}</th>
              <th className="px-4 py-3">{t('unitWorkQueue.colDays')}</th>
              <th className="px-4 py-3">{t('unitWorkQueue.colUpdated')}</th>
              {tab === 'by_me' ? <th className="px-4 py-3">{t('unitWorkQueue.colTargetUnit')}</th> : null}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr
                key={row.id}
                className={[
                  'cursor-pointer border-b border-gray-200/60 transition hover:bg-gray-100/90 dark:border-gray-800/80 dark:hover:bg-gray-900/70',
                  tab === 'by_me' ? 'bg-gray-50/80 dark:bg-gray-950/60' : '',
                ].join(' ')}
                onClick={() => setSelected(row)}
              >
                <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900 dark:text-gray-50">
                  {row.workOrderNo}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-gray-50">{row.projectName}</div>
                  <div className="font-mono text-[11px] text-gray-500 dark:text-gray-400">{row.projectCode}</div>
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{t(kindLabelKey(row.kind))}</td>
                <td className="px-4 py-3">
                  <div>{t(statusLabelKey(row.status))}</div>
                  {row.bie07?.qualityProgress ? (
                    <span className={bie07QualityChipClass(row.bie07.qualityProgress)}>
                      {t(`unitWorkQueue.bie07Quality.${row.bie07.qualityProgress}`)}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{t(priorityLabelKey(row.priority))}</td>
                <td className="px-4 py-3 tabular-nums text-gray-700 dark:text-gray-300">{row.daysOnDesk}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.lastUpdate}</td>
                {tab === 'by_me' ? (
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {unitNameById(row.assigneeUnitId)}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
        {tableRows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('unitWorkQueue.empty')}
          </p>
        ) : null}
      </div>

      <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('unitWorkQueue.rbacNote')}</p>
      <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('unitWorkQueue.rbacTabs')}</p>

      {selected ? (
        <>
          <button
            type="button"
            className="gm-glass-drawer-backdrop fixed inset-0 z-40 border-0 p-0"
            aria-label={t('unitWorkQueue.close')}
            onClick={() => setSelected(null)}
          />
          <aside
            className="gm-glass-drawer-panel fixed inset-y-0 right-0 z-50 flex min-h-0 w-full max-w-md flex-col overflow-hidden border-l border-gray-200/90 bg-pf-surface shadow-neo-out dark:border-gray-700/90"
            aria-labelledby="uwq-panel-title"
            aria-label={t('unitWorkQueue.detailDrawer')}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200/90 p-4 dark:border-gray-700/90">
              <div>
                <h2 id="uwq-panel-title" className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {selected.workOrderNo}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selected.projectName}</p>
              </div>
              <button
                type="button"
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setSelected(null)}
                aria-label={t('unitWorkQueue.close')}
              >
                <X className="size-5" strokeWidth={1.75} />
              </button>
            </div>

            {selected.detailPresentation === 'panel' ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex gap-1 border-b border-gray-200/90 px-2 pt-2 dark:border-gray-700/90">
                  {(['summary', 'project', 'history'] as const).map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={tabBtn(panelTab === id)}
                      onClick={() => setPanelTab(id)}
                    >
                      {t(`unitWorkQueue.panelTab.${id}`)}
                    </button>
                  ))}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  {panelTab === 'summary' ? (
                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                      <p>{selected.summaryNote}</p>
                      {selected.bie07 ? (
                        <div className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-700 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-200">
                          <p>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">
                              {t('unitWorkQueue.bie07FromMes')}
                            </span>{' '}
                            <span className="font-mono">{selected.bie07.parentMesCode}</span>
                            {' · '}
                            {t(`mes.bie07.type.${selected.bie07.requestType}`)}
                          </p>
                          {selected.bie07.qualityProgress ? (
                            <p className="mt-2">
                              <span className="font-semibold">{t('unitWorkQueue.bie07QcLabel')}:</span>{' '}
                              <span className={bie07QualityChipClass(selected.bie07.qualityProgress)}>
                                {t(`unitWorkQueue.bie07Quality.${selected.bie07.qualityProgress}`)}
                              </span>
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      <dl className="grid gap-2 rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/80">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">{t('unitWorkQueue.detailFrom')}</dt>
                          <dd>{unitNameById(selected.assignerUnitId)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">{t('unitWorkQueue.detailTo')}</dt>
                          <dd>{unitNameById(selected.assigneeUnitId)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">{t('unitWorkQueue.detailFactory')}</dt>
                          <dd className="font-mono">{selected.factoryCode}</dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className={btnPrimary} onClick={() => onNavigate('project')}>
                          {t('unitWorkQueue.actionOpenProject')}
                        </button>
                        <button type="button" className={btnNeo} disabled>
                          {t('unitWorkQueue.actionStart')}
                        </button>
                        <button type="button" className={btnNeo} disabled>
                          {t('unitWorkQueue.actionComplete')}
                        </button>
                        <button type="button" className={btnNeo} disabled>
                          {t('unitWorkQueue.actionBlock')}
                        </button>
                        {tab === 'by_me' ? (
                          <button type="button" className={btnNeo} disabled title="Salt takip sekmesi">
                            {t('unitWorkQueue.cancelRequestDisabled')}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  {panelTab === 'project' ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t('unitWorkQueue.panelProjectPlaceholder')}</p>
                  ) : null}
                  {panelTab === 'history' ? (
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="rounded-xl bg-gray-50 px-3 py-2 shadow-neo-in dark:bg-gray-950/80">
                        {t('unitWorkQueue.historyMock1')}
                      </li>
                      <li className="rounded-xl bg-gray-50 px-3 py-2 shadow-neo-in dark:bg-gray-950/80">
                        {t('unitWorkQueue.historyMock2')}
                      </li>
                    </ul>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500 dark:text-gray-400">{t('unitWorkQueue.detailKind')}</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-50">{t(kindLabelKey(selected.kind))}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500 dark:text-gray-400">{t('unitWorkQueue.detailStatus')}</dt>
                    <dd>{t(statusLabelKey(selected.status))}</dd>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-gray-700 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-200">
                    {selected.summaryNote}
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" className={btnPrimary} onClick={() => onNavigate('project')}>
                    {t('unitWorkQueue.actionOpenProject')}
                  </button>
                  <button type="button" className={btnNeo} disabled>
                    {t('unitWorkQueue.actionStart')}
                  </button>
                  <button type="button" className={btnNeo} disabled>
                    {t('unitWorkQueue.actionComplete')}
                  </button>
                  <button type="button" className={btnNeo} disabled>
                    {t('unitWorkQueue.actionBlock')}
                  </button>
                  {tab === 'by_me' ? (
                    <button type="button" className={btnNeo} disabled>
                      {t('unitWorkQueue.cancelRequestDisabled')}
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </aside>
        </>
      ) : null}
    </div>
  )
}
