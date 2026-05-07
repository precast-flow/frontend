import { Link } from 'react-router-dom'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Factory } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import { useI18n } from '../../i18n/I18nProvider'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import {
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
  eiSplitHeaderButtonPassive,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import {
  filterWorkQueueItems,
  MOCK_WORK_QUEUE_VIEWER_ID,
  resolveWorkQueueName,
  WORK_QUEUE_ITEMS,
  WORK_QUEUE_ORG_SEQUENCE,
  type WorkQueueItem,
  type WorkQueueOrgUnit,
  type WorkQueuePerspective,
} from '../../data/workQueueMock'

const selectCls =
  'rounded-lg border border-slate-200/80 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-slate-900 shadow-sm outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/25 dark:border-slate-600/70 dark:bg-slate-900/60 dark:text-slate-50 sm:text-sm'

function tabPill(active: boolean) {
  return [
    'rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 sm:text-sm',
    active
      ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
      : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100',
  ].join(' ')
}

function statusClass(status: WorkQueueItem['status']) {
  const base =
    'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 sm:text-[11px]'
  if (status === 'tamamlandi') return `${base} bg-emerald-500/15 text-emerald-800 ring-emerald-500/25 dark:text-emerald-200`
  if (status === 'bloke') return `${base} bg-rose-500/15 text-rose-800 ring-rose-500/25 dark:text-rose-200`
  if (status === 'islemde') return `${base} bg-amber-500/15 text-amber-900 ring-amber-500/25 dark:text-amber-100`
  return `${base} bg-slate-500/10 text-slate-700 ring-slate-400/25 dark:text-slate-300`
}

function priorityDot(priority: WorkQueueItem['priority']) {
  const map = {
    dusuk: 'bg-slate-400 dark:bg-slate-500',
    normal: 'bg-sky-500',
    yuksek: 'bg-amber-500',
    acil: 'bg-rose-500',
  } as const
  return <span className={`inline-block size-2 shrink-0 rounded-full ${map[priority]}`} aria-hidden />
}

function unitLabel(orgId: WorkQueueOrgUnit, t: (k: string) => string) {
  const hit = WORK_QUEUE_ORG_SEQUENCE.find((u) => u.id === orgId)
  return hit ? t(hit.labelKey) : orgId
}

type Props = {
  onNavigate?: (moduleId: string) => void
}

export function UnitWorkQueueModuleView(_props: Props) {
  void _props.onNavigate
  const { t } = useI18n()
  const baseId = useId()
  const { isFactoryInScope } = useFactoryContext()
  const rightRef = useRef<HTMLDivElement | null>(null)

  const [perspective, setPerspective] = useState<WorkQueuePerspective>('to_me')
  const [unit, setUnit] = useState<WorkQueueOrgUnit | 'all'>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [factoryRestricted, setFactoryRestricted] = useState(true)
  const [selectedId, setSelectedId] = useState<string>(WORK_QUEUE_ITEMS[0]!.id)
  const [detailTab, setDetailTab] = useState<'summary' | 'project' | 'history'>('summary')

  const filtered = useMemo(
    () =>
      filterWorkQueueItems(WORK_QUEUE_ITEMS, {
        perspective,
        unit,
        viewerId: MOCK_WORK_QUEUE_VIEWER_ID,
        search,
        factoryRestricted,
        factoryAllows: isFactoryInScope,
      }),
    [perspective, unit, search, factoryRestricted, isFactoryInScope],
  )

  useEffect(() => {
    if (filtered.some((r) => r.id === selectedId)) return
    setSelectedId(filtered[0]?.id ?? '')
  }, [filtered, selectedId])

  useEffect(() => {
    setDetailTab('summary')
    requestAnimationFrame(() => rightRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }, [selectedId])

  const selected = filtered.find((r) => r.id === selectedId)

  const kpis = useMemo(() => {
    const open = filtered.filter((r) => r.status !== 'tamamlandi').length
    const due = filtered.filter((r) => r.dueToday && r.status !== 'tamamlandi').length
    const blocked = filtered.filter((r) => r.status === 'bloke').length
    return { open, due, blocked }
  }, [filtered])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden pb-2">
      <div className="shrink-0 space-y-2 px-[0.6875rem]">
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t('unitWorkQueue.intro')}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={tabPill(perspective === 'to_me')} onClick={() => setPerspective('to_me')}>
            {t('unitWorkQueue.tabToMe')}
          </button>
          <button type="button" className={tabPill(perspective === 'by_me')} onClick={() => setPerspective('by_me')}>
            {t('unitWorkQueue.tabByMe')}
          </button>
          <span className="mx-1 hidden text-slate-300 dark:text-slate-600 sm:inline" aria-hidden>
            ·
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
            <span>
              {t('unitWorkQueue.kpiPending')}:{' '}
              <strong className="text-slate-800 dark:text-slate-200">{kpis.open}</strong>
            </span>
            <span>
              {t('unitWorkQueue.kpiDueToday')}:{' '}
              <strong className="text-slate-800 dark:text-slate-200">{kpis.due}</strong>
            </span>
            <span>
              {t('unitWorkQueue.kpiBlocked')}:{' '}
              <strong className="text-slate-800 dark:text-slate-200">{kpis.blocked}</strong>
            </span>
          </div>
        </div>
      </div>

      <ElementIdentityPieceCodesLikeSplit
        persistKey="unit-work-queue"
        defaultSplitRatio={38}
        listTitle={t('unitWorkQueue.listTitle')}
        isFilterOpen={filterOpen}
        onFilterOpenChange={setFilterOpen}
        headerActions={
          <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <span className="sr-only">{t('unitWorkQueue.orgFilter')}</span>
            <select
              className={selectCls}
              value={unit}
              onChange={(e) =>
                setUnit(e.target.value === 'all' ? 'all' : (e.target.value as WorkQueueOrgUnit))
              }
              aria-label={t('unitWorkQueue.orgFilter')}
            >
              <option value="all">{t('unitWorkQueue.unit.all')}</option>
              {WORK_QUEUE_ORG_SEQUENCE.map((u) => (
                <option key={u.id} value={u.id}>
                  {t(u.labelKey)}
                </option>
              ))}
            </select>
          </label>
        }
        filterToolbarSearch={
          <FilterToolbarSearch
            id={`${baseId}-wq-search`}
            value={search}
            onValueChange={setSearch}
            placeholder={t('unitWorkQueue.searchPlaceholder')}
            ariaLabel={t('unitWorkQueue.searchPlaceholder')}
          />
        }
        filterAside={
          <div className="space-y-4">
            <ElementIdentityFilterSheetHeader
              title={t('nav.unitWorkQueue')}
              subtitle={t('unitWorkQueue.rbacNote')}
              onClose={() => setFilterOpen(false)}
            />
            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                {t('unitWorkQueue.factoryScope')}
              </legend>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={factoryRestricted}
                  onChange={(e) => setFactoryRestricted(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-sky-600 dark:border-slate-600 dark:bg-slate-950"
                />
                {t('unitWorkQueue.filterFactoryScope')}
              </label>
            </fieldset>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{t('unitWorkQueue.trackingHint')}</p>
          </div>
        }
        listBody={
          filtered.length === 0 ? (
            <li className="rounded-xl border border-dashed border-slate-300/80 p-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
              {t('unitWorkQueue.empty')}
            </li>
          ) : (
            filtered.map((row) => {
              const active = row.id === selectedId
              return (
                <li key={row.id} role="presentation" className="list-none px-1">
                  <button
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    className={[
                      'w-full rounded-xl border px-3 py-2.5 text-left shadow-sm outline-none ring-sky-400/35 transition hover:border-sky-300/55 hover:bg-white/95 dark:hover:bg-slate-900/85',
                      active
                        ? 'border-sky-400/50 bg-white/98 ring-2 dark:border-sky-500/40 dark:bg-slate-900/80'
                        : 'border-slate-200/75 bg-white/70 dark:border-slate-700/70 dark:bg-slate-900/45',
                    ].join(' ')}
                  >
                    <div className="flex flex-wrap items-start gap-2 border-b border-slate-100/90 pb-1.5 dark:border-slate-700/55">
                      <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">{row.orderNo}</span>
                      <span className={`ms-auto shrink-0 ${statusClass(row.status)}`}>{t(`unitWorkQueue.status.${row.status}`)}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">{row.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xs">
                      {row.summary}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        {priorityDot(row.priority)}
                        {t(`unitWorkQueue.priority.${row.priority}`)}
                      </span>
                      <span>{t(`unitWorkQueue.kind.${row.kind}`)}</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">{unitLabel(row.targetUnit, t)}</span>
                    </div>
                  </button>
                </li>
              )
            })
          )
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {filtered.length}/{WORK_QUEUE_ITEMS.length} mock
            </span>
            <span className="hidden sm:inline">{t('unitWorkQueue.demoViewer', { name: resolveWorkQueueName(MOCK_WORK_QUEUE_VIEWER_ID) })}</span>
          </div>
        }
        rightPanelRef={rightRef}
        rightAside={
          selected ? (
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-12">
              <div className="rounded-2xl border border-white/35 bg-white/45 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">{selected.title}</h2>
                      {selected.dueToday ? (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 ring-1 ring-amber-500/35 dark:bg-amber-500/15 dark:text-amber-50">
                          {t('unitWorkQueue.dueBadge')}
                        </span>
                      ) : null}
                    </div>
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{selected.orderNo}</p>
                  </div>
                  <span className={`shrink-0 ${statusClass(selected.status)}`}>{t(`unitWorkQueue.status.${selected.status}`)}</span>
                </div>

                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('unitWorkQueue.detailKind')}</dt>
                    <dd>{t(`unitWorkQueue.kind.${selected.kind}`)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('unitWorkQueue.colPriority')}</dt>
                    <dd className="inline-flex items-center gap-2">
                      {priorityDot(selected.priority)} {t(`unitWorkQueue.priority.${selected.priority}`)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('unitWorkQueue.assigneePerson')}</dt>
                    <dd>{selected.assigneeUserId ? resolveWorkQueueName(selected.assigneeUserId) : '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('unitWorkQueue.assignerPerson')}</dt>
                    <dd>{resolveWorkQueueName(selected.assignerUserId)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('unitWorkQueue.detailFrom')}</dt>
                    <dd>{unitLabel(selected.fromUnit, t)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('unitWorkQueue.detailTo')}</dt>
                    <dd>{unitLabel(selected.toUnit, t)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('unitWorkQueue.detailFactory')}</dt>
                    <dd className="flex items-center gap-2 font-mono text-xs">
                      <Factory className="size-3.5 text-sky-600 dark:text-sky-400" aria-hidden /> {selected.factoryCode}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('unitWorkQueue.colDays')}</dt>
                    <dd>{selected.daysOnDesk}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('unitWorkQueue.colUpdated')}</dt>
                    <dd>{selected.lastUpdatedLabel}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200/80 pt-3 dark:border-slate-600/65">
                  {selected.projectRouteId ? (
                    <Link
                      className={`${eiSplitHeaderButtonPassive} text-sky-800 dark:text-sky-200`}
                      to={`/proje-detay/${selected.projectRouteId}`}
                    >
                      {t('unitWorkQueue.actionOpenProject')}
                    </Link>
                  ) : (
                    <span className={`${eiSplitHeaderButtonPassive} cursor-not-allowed opacity-55`}>{t('unitWorkQueue.actionOpenProject')}</span>
                  )}
                  <button type="button" className={`${eiSplitHeaderButtonPassive} opacity-90`}>
                    {t('unitWorkQueue.actionStart')}
                  </button>
                  <button type="button" className={`${eiSplitHeaderButtonPassive} opacity-90`}>
                    {t('unitWorkQueue.actionComplete')}
                  </button>
                  <button type="button" className={`${eiSplitHeaderButtonPassive} opacity-90`}>
                    {t('unitWorkQueue.actionBlock')}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 border-b border-slate-200/80 pb-0.5 dark:border-slate-600/65">
                {(
                  [
                    ['summary', 'unitWorkQueue.panelTab.summary'],
                    ['project', 'unitWorkQueue.panelTab.project'],
                    ['history', 'unitWorkQueue.panelTab.history'],
                  ] as const
                ).map(([id, key]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDetailTab(id)}
                    className={[
                      'rounded-t-lg px-3 py-1.5 text-xs font-semibold transition',
                      detailTab === id
                        ? 'border border-b-0 border-slate-200/90 bg-white/90 text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
                    ].join(' ')}
                  >
                    {t(key)}
                  </button>
                ))}
              </div>

              {detailTab === 'summary' ? (
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{selected.detailBody}</p>
              ) : null}
              {detailTab === 'project' ? (
                <div className="rounded-xl border border-dashed border-slate-300/80 p-4 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-400">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {selected.projectCode} — {selected.projectName}
                  </p>
                  <p className="mt-2">{t('unitWorkQueue.panelProjectPlaceholder')}</p>
                </div>
              ) : null}
              {detailTab === 'history' ? (
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li>{t('unitWorkQueue.historyMock1')}</li>
                  <li>{t('unitWorkQueue.historyMock2')}</li>
                </ul>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300/75 p-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
              {t('unitWorkQueue.empty')}
            </div>
          )
        }
      />
    </div>
  )
}
