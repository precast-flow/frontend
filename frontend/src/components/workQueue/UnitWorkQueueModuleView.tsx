import { Link, useLocation } from 'react-router-dom'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronRight, Factory } from 'lucide-react'
import { activeModuleIdFromPathname } from '../../data/navigation'
import { useFactoryContext } from '../../context/FactoryContext'
import { useI18n } from '../../i18n/I18nProvider'
import { useThemeMode } from '../../theme/ThemeProvider'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import { SplitListPaginationNav } from '../shared/SplitListPaginationNav'
import {
  splitDetailHeaderClass,
  splitListCardClass,
  splitListEmptyClass,
  splitTabPill,
} from '../shared/splitModuleStyles'
import {
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
  eiSplitHeaderButtonPassive,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'
import { useWorkQueue } from '../../context/WorkQueueContext'
import {
  childOrderRoleLabelKey,
  isProductionChildOrder,
  isProductionParentOrder,
} from '../../data/productionWorkOrderFlow'
import {
  filterWorkQueueItems,
  MOCK_WORK_QUEUE_VIEWER_ID,
  resolveWorkQueueName,
  WORK_QUEUE_ORG_SEQUENCE,
  type WorkQueueItem,
  type WorkQueueOrgUnit,
  type WorkQueuePerspective,
} from '../../data/workQueueMock'
import { CuringWorkOrderDetailPanel } from './CuringWorkOrderDetailPanel'
import { ProductionChildOrderDetailPanel } from './ProductionChildOrderDetailPanel'
import { ProductionWorkOrderDetailPanel } from './ProductionWorkOrderDetailPanel'

const selectCls =
  'rounded-lg border border-slate-200/80 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-slate-900 shadow-sm outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/25 dark:border-slate-600/70 dark:bg-slate-900/60 dark:text-slate-50 sm:text-sm'

const glassSelectCls =
  'glass-input min-w-0 max-w-full px-2.5 py-1.5 text-xs font-semibold text-black sm:text-sm dark:text-white'

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

const UNIT_WORK_QUEUE_DEFAULT_PAGE_SIZE = 4
type Props = {
  onNavigate?: (moduleId: string) => void
}

export function UnitWorkQueueModuleView(_props: Props) {
  void _props.onNavigate
  const { t, locale } = useI18n()
  const { items: workQueueItems } = useWorkQueue()
  const baseId = useId()
  const { isFactoryInScope } = useFactoryContext()
  const rightRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  const [perspective, setPerspective] = useState<WorkQueuePerspective>('to_me')
  const [unit, setUnit] = useState<WorkQueueOrgUnit | 'all'>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [factoryRestricted, setFactoryRestricted] = useState(true)
  const [selectedId, setSelectedId] = useState<string>(() => workQueueItems[0]?.id ?? '')
  const [detailTab, setDetailTab] = useState<'summary' | 'project' | 'history'>('summary')
  const [listPage, setListPage] = useState(1)
  const pageSize = UNIT_WORK_QUEUE_DEFAULT_PAGE_SIZE

  const filtered = useMemo(
    () =>
      filterWorkQueueItems(workQueueItems, {
        perspective,
        unit,
        viewerId: MOCK_WORK_QUEUE_VIEWER_ID,
        search,
        factoryRestricted,
        factoryAllows: isFactoryInScope,
      }),
    [perspective, unit, search, factoryRestricted, isFactoryInScope, workQueueItems],
  )

  useEffect(() => {
    if (filtered.length === 0) return
    if (!filtered.some((r) => r.id === selectedId)) {
      setSelectedId(filtered[0]!.id)
    }
  }, [filtered, selectedId])

  const listTotalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safeListPage = Math.min(listPage, listTotalPages)
  const pagedItems = useMemo(() => {
    const start = (safeListPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, pageSize, safeListPage])
  const listPageStart = filtered.length === 0 ? 0 : (safeListPage - 1) * pageSize + 1
  const listPageEnd = Math.min(filtered.length, safeListPage * pageSize)

  useEffect(() => {
    setListPage(1)
  }, [perspective, unit, search, factoryRestricted, pageSize])

  useEffect(() => {
    setListPage((p) => Math.min(p, listTotalPages))
  }, [listTotalPages])

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    })
  }, [safeListPage, pageSize])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId('')
      return
    }
    if (pagedItems.some((r) => r.id === selectedId)) return
    setSelectedId(pagedItems[0]?.id ?? filtered[0]!.id)
  }, [filtered, pagedItems, selectedId])

  const selected = filtered.find((r) => r.id === selectedId)
  const productionParentDetail = selected != null && isProductionParentOrder(selected)
  const productionChildDetail = selected != null && isProductionChildOrder(selected)

  const openWorkOrderInList = (
    workQueueId: string,
    opts: { perspective: WorkQueuePerspective; unit: WorkQueueOrgUnit | 'all' },
  ) => {
    setPerspective(opts.perspective)
    setUnit(opts.unit)
    setSelectedId(workQueueId)
    setListPage(1)
    setFilterOpen(false)
    requestAnimationFrame(() => rightRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  useEffect(() => {
    if (!productionParentDetail && !productionChildDetail) {
      setDetailTab('summary')
    }
    requestAnimationFrame(() => rightRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }, [selectedId, productionParentDetail, productionChildDetail])

  const kpis = useMemo(() => {
    const open = filtered.filter((r) => r.status !== 'tamamlandi').length
    const due = filtered.filter((r) => r.dueToday && r.status !== 'tamamlandi').length
    const blocked = filtered.filter((r) => r.status === 'bloke').length
    return { open, due, blocked }
  }, [filtered])

  const location = useLocation()
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const neutralShell = activeModuleIdFromPathname(location.pathname) === 'unit-work-queue'

  return (
    <div
      className="project-mgmt-glass-light flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-3xl"
      data-neutral-shell={neutralShell ? 'true' : undefined}
    >
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2">
        <div className="flex flex-col gap-2 px-[0.6875rem] pb-1">
            <nav aria-label={t('project.breadcrumbAria')} className="mb-0">
              <ol className="flex flex-wrap items-center gap-1 text-xs text-black/60 dark:text-white/65">
                <li>
                  <Link
                    to="/planlama"
                    className="font-medium text-black/75 underline-offset-2 transition hover:text-black hover:underline dark:text-white/75 dark:hover:text-white"
                  >
                    {t('nav.sidebar.section.planning')}
                  </Link>
                </li>
                <li className="flex items-center gap-1" aria-hidden>
                  <ChevronRight className="size-3.5 shrink-0 opacity-70" />
                </li>
                <li className="font-semibold text-black dark:text-white" aria-current="page">
                  {t('nav.unitWorkQueue')}
                </li>
              </ol>
            </nav>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs">
            <span
              className={
                gl ? 'text-black/60 dark:text-white/65' : 'text-slate-500 dark:text-slate-400'
              }
            >
              {t('unitWorkQueue.kpiPending')}:{' '}
              <strong className={gl ? 'text-black dark:text-white' : 'text-slate-800 dark:text-slate-200'}>{kpis.open}</strong>
            </span>
            <span
              className={
                gl ? 'text-black/60 dark:text-white/65' : 'text-slate-500 dark:text-slate-400'
              }
            >
              {t('unitWorkQueue.kpiDueToday')}:{' '}
              <strong className={gl ? 'text-black dark:text-white' : 'text-slate-800 dark:text-slate-200'}>{kpis.due}</strong>
            </span>
            <span
              className={
                gl ? 'text-black/60 dark:text-white/65' : 'text-slate-500 dark:text-slate-400'
              }
            >
              {t('unitWorkQueue.kpiBlocked')}:{' '}
              <strong className={gl ? 'text-black dark:text-white' : 'text-slate-800 dark:text-slate-200'}>{kpis.blocked}</strong>
            </span>
          </div>
        </div>

        <div
          className={[
            'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
            gl
              ? 'gap-2 rounded-3xl bg-transparent p-1 md:p-1.5'
              : 'rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5',
          ].join(' ')}
        >
          <ElementIdentityPieceCodesLikeSplit
            persistKey="unit-work-queue"
            listRef={listRef}
            defaultSplitRatio={38}
            listTitle={t('unitWorkQueue.listTitle')}
            visualVariant="project-mgmt"
            embedded
            neutralChrome={neutralShell}
            listIndentWhenFilterOpen="18.5rem"
            isFilterOpen={filterOpen}
            onFilterOpenChange={setFilterOpen}
            headerActions={
              <label
                className={
                  gl
                    ? 'flex items-center gap-2 text-[11px] font-medium text-black/70 dark:text-white/75'
                    : 'flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300'
                }
              >
                <span className="sr-only">{t('unitWorkQueue.orgFilter')}</span>
                <select
                  className={gl ? glassSelectCls : selectCls}
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
                className={gl ? 'project-mgmt-toolbar-search' : ''}
                inputClassName={gl ? 'glass-input' : ''}
              />
            }
            filterAside={
              <div className="space-y-4">
                <ElementIdentityFilterSheetHeader
                  title={t('nav.unitWorkQueue')}
                  subtitle={t('unitWorkQueue.rbacNote')}
                  onClose={() => setFilterOpen(false)}
                  glass={gl}
                />
                <fieldset className="space-y-2">
                  <legend
                    className={
                      gl
                        ? 'text-xs font-semibold text-black dark:text-white'
                        : 'text-xs font-semibold text-slate-800 dark:text-slate-100'
                    }
                  >
                    {t('unitWorkQueue.filterPerspective')}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={splitTabPill(perspective === 'to_me')}
                      onClick={() => setPerspective('to_me')}
                    >
                      {t('unitWorkQueue.tabToMe')}
                    </button>
                    <button
                      type="button"
                      className={splitTabPill(perspective === 'by_me')}
                      onClick={() => setPerspective('by_me')}
                    >
                      {t('unitWorkQueue.tabByMe')}
                    </button>
                  </div>
                </fieldset>
                <fieldset className="space-y-2">
                  <legend
                    className={
                      gl
                        ? 'text-xs font-semibold text-black dark:text-white'
                        : 'text-xs font-semibold text-slate-800 dark:text-slate-100'
                    }
                  >
                    {t('unitWorkQueue.factoryScope')}
                  </legend>
                  <label
                    className={
                      gl
                        ? 'flex cursor-pointer items-center gap-2 text-xs text-black/80 dark:text-white/80'
                        : 'flex cursor-pointer items-center gap-2 text-xs text-slate-700 dark:text-slate-300'
                    }
                  >
                    <input
                      type="checkbox"
                      checked={factoryRestricted}
                      onChange={(e) => setFactoryRestricted(e.target.checked)}
                      className={
                        gl
                          ? 'size-4 rounded border-black/25 text-black dark:border-white/25 dark:bg-black/40'
                          : 'size-4 rounded border-slate-300 text-sky-600 dark:border-slate-600 dark:bg-slate-950'
                      }
                    />
                    {t('unitWorkQueue.filterFactoryScope')}
                  </label>
                </fieldset>
                <p
                  className={
                    gl
                      ? 'text-[11px] leading-relaxed text-black/55 dark:text-white/60'
                      : 'text-[11px] leading-relaxed text-slate-500 dark:text-slate-400'
                  }
                >
                  {t('unitWorkQueue.trackingHint')}
                </p>
                <p
                  className={
                    gl
                      ? 'text-[11px] leading-relaxed text-sky-900/80 dark:text-sky-100/85'
                      : 'text-[11px] leading-relaxed text-sky-800 dark:text-sky-200/90'
                  }
                >
                  {t('unitWorkQueue.productionFlow.dailyOrderHint')}
                </p>
              </div>
            }
            listBody={
              filtered.length === 0 ? (
                <li className={splitListEmptyClass}>{t('unitWorkQueue.empty')}</li>
              ) : (
                pagedItems.map((row) => (
                  <li
                    key={row.id}
                    className={splitListCardClass(
                      row.id === selectedId,
                      'flex min-h-0 shrink-0 items-stretch gap-1.5 px-2 py-1.5',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(row.id)}
                      aria-current={row.id === selectedId ? 'true' : undefined}
                      className="min-w-0 flex-1 rounded-md px-0.5 py-0.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                    >
                      <p className="truncate text-sm font-semibold leading-snug text-black dark:text-white">
                        {row.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-black/70 dark:text-white/70">
                        {row.orderNo} · {unitLabel(row.targetUnit, t)}
                        {row.parentWorkQueueId ? (
                          <span className="text-black/50 dark:text-white/55">
                            {' '}
                            · {t(childOrderRoleLabelKey(row.kind))}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className={statusClass(row.status)}>{t(`unitWorkQueue.status.${row.status}`)}</span>
                        {row.dueToday ? (
                          <span className="inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:text-amber-100">
                            {t('unitWorkQueue.dueBadge')}
                          </span>
                        ) : null}
                      </p>
                    </button>
                  </li>
                ))
              )
            }
            footer={
              <div
                className={
                  gl
                    ? 'flex flex-col gap-2 px-2 py-1 text-[11px] text-black/70 dark:text-white/75 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'
                    : 'flex flex-col gap-2 px-2 text-[11px] text-slate-500 dark:text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'
                }
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {filtered.length > 0 ? (
                    <span className="tabular-nums">
                      {t('unitWorkQueue.pagination.footerRange', {
                        start: String(listPageStart),
                        end: String(listPageEnd),
                        total: String(filtered.length),
                      })}
                    </span>
                  ) : (
                    <span className="tabular-nums">{t('unitWorkQueue.pagination.emptyFooter')}</span>
                  )}
                  <span className="hidden sm:inline">
                    {t('unitWorkQueue.demoViewer', { name: resolveWorkQueueName(MOCK_WORK_QUEUE_VIEWER_ID) })}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {filtered.length > 0 ? (
                    <>
                      <SplitListPaginationNav
                        safePage={safeListPage}
                        pageCount={listTotalPages}
                        onPrev={() => setListPage((p) => Math.max(1, p - 1))}
                        onNext={() => setListPage((p) => Math.min(listTotalPages, p + 1))}
                        gl={gl}
                        locale={locale}
                        buttonStyle={gl ? 'glass' : 'legacy-slate'}
                        pageIndicatorClassName={
                          gl ? 'tabular-nums text-black/80 dark:text-white/75' : 'tabular-nums text-slate-600 dark:text-slate-300'
                        }
                      />
                    </>
                  ) : null}
                </div>
              </div>
            }
            rightPanelRef={rightRef}
            rightAside={
              selected ? (
                <div key={selected.id} className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
                  <div
                    className={
                      productionParentDetail || productionChildDetail
                        ? 'flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4'
                        : 'mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 lg:max-w-3xl'
                    }
                  >
                    <header className={splitDetailHeaderClass}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                        {t('unitWorkQueue.selectedWorkEyebrow')}
                      </p>
                      <h3 className="mt-1.5 text-xl font-semibold leading-tight text-black dark:text-white">
                        {selected.title}
                      </h3>
                      <p className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm leading-snug text-black/75 dark:text-white/80">
                        <span className="font-mono tabular-nums">{selected.orderNo}</span>
                        <span aria-hidden>·</span>
                        <span>{unitLabel(selected.targetUnit, t)}</span>
                        {selected.dueToday ? (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 ring-1 ring-amber-500/35 dark:bg-amber-500/15 dark:text-amber-50">
                            {t('unitWorkQueue.dueBadge')}
                          </span>
                        ) : null}
                        <span className={`shrink-0 ${statusClass(selected.status)}`}>
                          {t(`unitWorkQueue.status.${selected.status}`)}
                        </span>
                      </p>
                      <div className="mt-2 flex flex-wrap justify-center gap-2">
                        {selected.projectRouteId ? (
                          <Link
                            className={`${eiSplitHeaderButtonPassive} no-underline`}
                            to={`/proje-detay/${selected.projectRouteId}`}
                          >
                            {t('unitWorkQueue.actionOpenProject')}
                          </Link>
                        ) : (
                          <span className={`${eiSplitHeaderButtonPassive} cursor-not-allowed opacity-55`}>
                            {t('unitWorkQueue.actionOpenProject')}
                          </span>
                        )}
                        <button type="button" className={eiSplitHeaderButtonPassive}>
                          {t('unitWorkQueue.actionStart')}
                        </button>
                        <button type="button" className={eiSplitHeaderButtonPassive}>
                          {t('unitWorkQueue.actionComplete')}
                        </button>
                        <button type="button" className={eiSplitHeaderButtonPassive}>
                          {t('unitWorkQueue.actionBlock')}
                        </button>
                      </div>
                    </header>

                    {!productionParentDetail && !productionChildDetail ? (
                    <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
                      <div
                        className="flex max-w-full gap-1 overflow-x-auto"
                        role="tablist"
                        aria-label={t('unitWorkQueue.listTitle')}
                        aria-orientation="horizontal"
                      >
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
                            role="tab"
                            id={`unit-work-queue-tab-${id}`}
                            aria-selected={detailTab === id}
                            aria-controls="unit-work-queue-detail-panel"
                            tabIndex={detailTab === id ? 0 : -1}
                            onClick={() => setDetailTab(id)}
                            className={splitTabPill(detailTab === id)}
                          >
                            {t(key)}
                          </button>
                        ))}
                      </div>
                    </div>
                    ) : null}

                    <div
                      key={
                        productionParentDetail || productionChildDetail
                          ? `production-flow-${selected.id}`
                          : detailTab
                      }
                      id="unit-work-queue-detail-panel"
                      role="tabpanel"
                      aria-labelledby={
                        productionParentDetail || productionChildDetail
                          ? undefined
                          : `unit-work-queue-tab-${detailTab}`
                      }
                      className={[
                        'okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden',
                        productionParentDetail || productionChildDetail
                          ? 'w-full text-left'
                          : 'px-0.5 text-center sm:px-1',
                      ].join(' ')}
                    >
                      {productionParentDetail ? (
                        <ProductionWorkOrderDetailPanel
                          item={selected}
                          gl={gl}
                          onOpenInList={openWorkOrderInList}
                        />
                      ) : null}
                      {productionChildDetail && selected.kind === 'curing_order' ? (
                        <CuringWorkOrderDetailPanel item={selected} gl={gl} />
                      ) : null}
                      {productionChildDetail &&
                      (selected.kind === 'pour_order' || selected.kind === 'sample_order') ? (
                        <ProductionChildOrderDetailPanel item={selected} gl={gl} />
                      ) : null}
                      {!productionParentDetail && !productionChildDetail && detailTab === 'summary' ? (
                        <div className="flex flex-col divide-y divide-slate-200/25 dark:divide-white/10">
                          <div className="pb-4 pt-0">
                            <p className="mx-auto max-w-lg text-sm leading-relaxed text-black/80 dark:text-white/85">
                              {selected.detailBody}
                            </p>
                          </div>
                          <div className="pb-4 pt-4">
                            <dl className="mx-auto grid max-w-sm grid-cols-2 justify-items-center gap-x-6 gap-y-4 text-base sm:max-w-md sm:gap-x-10">
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-black/60 dark:text-white/65">
                                  {t('unitWorkQueue.detailKind')}
                                </dt>
                                <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">
                                  {t(`unitWorkQueue.kind.${selected.kind}`)}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-black/60 dark:text-white/65">
                                  {t('unitWorkQueue.colPriority')}
                                </dt>
                                <dd className="mt-0.5 inline-flex items-center justify-center gap-2 font-medium leading-snug text-black dark:text-white">
                                  {priorityDot(selected.priority)}
                                  {t(`unitWorkQueue.priority.${selected.priority}`)}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-black/60 dark:text-white/65">
                                  {t('unitWorkQueue.assigneePerson')}
                                </dt>
                                <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">
                                  {selected.assigneeUserId ? resolveWorkQueueName(selected.assigneeUserId) : '—'}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-black/60 dark:text-white/65">
                                  {t('unitWorkQueue.assignerPerson')}
                                </dt>
                                <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">
                                  {resolveWorkQueueName(selected.assignerUserId)}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-black/60 dark:text-white/65">
                                  {t('unitWorkQueue.detailFrom')}
                                </dt>
                                <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">
                                  {unitLabel(selected.fromUnit, t)}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-black/60 dark:text-white/65">
                                  {t('unitWorkQueue.detailTo')}
                                </dt>
                                <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">
                                  {unitLabel(selected.toUnit, t)}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-black/60 dark:text-white/65">
                                  {t('unitWorkQueue.detailFactory')}
                                </dt>
                                <dd className="mt-0.5 inline-flex items-center justify-center gap-1.5 font-mono text-sm font-medium leading-snug text-black dark:text-white">
                                  <Factory className="size-3.5 text-black/50 dark:text-white/55" aria-hidden />
                                  {selected.factoryCode}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-black/60 dark:text-white/65">
                                  {t('unitWorkQueue.colDays')}
                                </dt>
                                <dd className="mt-0.5 font-medium tabular-nums leading-snug text-black dark:text-white">
                                  {selected.daysOnDesk}
                                </dd>
                              </div>
                              <div className="min-w-0 sm:col-span-2">
                                <dt className="text-xs font-medium text-black/60 dark:text-white/65">
                                  {t('unitWorkQueue.colUpdated')}
                                </dt>
                                <dd className="mt-0.5 font-medium leading-snug text-black dark:text-white">
                                  {selected.lastUpdatedLabel}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      ) : null}
                      {!productionParentDetail && !productionChildDetail && detailTab === 'project' ? (
                        <div className="mx-auto max-w-lg rounded-xl border border-dashed border-black/18 p-4 text-left text-sm text-black/75 dark:border-white/15 dark:text-white/80 sm:text-center">
                          <p className="font-semibold text-black dark:text-white">
                            {selected.projectCode} — {selected.projectName}
                          </p>
                          <p className="mt-2">{t('unitWorkQueue.panelProjectPlaceholder')}</p>
                        </div>
                      ) : null}
                      {!productionParentDetail && !productionChildDetail && detailTab === 'history' ? (
                        <ul className="mx-auto max-w-lg space-y-3 text-left text-sm text-black/75 dark:text-white/80 sm:text-center">
                          <li>{t('unitWorkQueue.historyMock1')}</li>
                          <li>{t('unitWorkQueue.historyMock2')}</li>
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={
                    gl
                      ? 'flex h-full min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-black/18 p-8 text-center text-sm text-black/55 dark:border-white/15 dark:text-white/60'
                      : 'flex h-full min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300/75 p-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400'
                  }
                >
                  {t('unitWorkQueue.empty')}
                </div>
              )
            }
          />
        </div>
      </div>
    </div>
  )
}
