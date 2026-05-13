import { Link, useLocation } from 'react-router-dom'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronRight, Factory } from 'lucide-react'
import { activeModuleIdFromPathname } from '../../data/navigation'
import { useFactoryContext } from '../../context/FactoryContext'
import { useI18n } from '../../i18n/I18nProvider'
import { useThemeMode } from '../../theme/ThemeProvider'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import {
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
  eiSplitHeaderButtonPassive,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'
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

const glassSelectCls =
  'glass-input min-w-0 max-w-full px-2.5 py-1.5 text-xs font-semibold text-black sm:text-sm dark:text-white'

function tabPill(active: boolean, gl: boolean) {
  if (gl) {
    return [
      'rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 sm:text-sm',
      active
        ? 'border-black/28 bg-black/8 text-black dark:border-white/20 dark:bg-white/10 dark:text-white'
        : 'border-black/18 bg-white/55 text-black/75 hover:text-black dark:border-white/12 dark:bg-slate-900/35 dark:text-white/80 dark:hover:text-white',
    ].join(' ')
  }
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

  const location = useLocation()
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const neutralShell = activeModuleIdFromPathname(location.pathname) === 'unit-work-queue'

  const detailActionClass = gl
    ? 'card-button inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold'
    : eiSplitHeaderButtonPassive

  return (
    <div
      className="project-mgmt-glass-light flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-3xl"
      data-neutral-shell={neutralShell ? 'true' : undefined}
    >
      <div className="shrink-0 px-[0.6875rem] pt-0.5">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-2xl">
          {t('nav.unitWorkQueue')}
        </h1>
      </div>
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2">
        <div className="shrink-0 px-[0.6875rem] py-1">
          <div className="pb-5 sm:pb-6">
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
          </div>
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

        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <ElementIdentityPieceCodesLikeSplit
            persistKey="unit-work-queue"
            defaultSplitRatio={38}
            listTitle={t('unitWorkQueue.listTitle')}
            visualVariant="project-mgmt"
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
                      className={tabPill(perspective === 'to_me', gl)}
                      onClick={() => setPerspective('to_me')}
                    >
                      {t('unitWorkQueue.tabToMe')}
                    </button>
                    <button
                      type="button"
                      className={tabPill(perspective === 'by_me', gl)}
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
              </div>
            }
            listBody={
              filtered.length === 0 ? (
                <li
                  className={
                    gl
                      ? 'rounded-xl border border-dashed border-black/20 p-8 text-center text-sm text-black/55 dark:border-white/18 dark:text-white/60'
                      : 'rounded-xl border border-dashed border-slate-300/80 p-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400'
                  }
                >
                  {t('unitWorkQueue.empty')}
                </li>
              ) : (
                filtered.map((row) => {
                  const active = row.id === selectedId
                  return (
                    <li
                      key={row.id}
                      role="presentation"
                      className={[
                        'list-none',
                        gl
                          ? [
                              'px-1',
                              'glass-card',
                              'glass-card--static',
                              'project-mgmt-list-row-card',
                              'flex min-h-0 shrink-0 flex-col',
                              active ? 'okan-project-list-row--active' : '',
                            ].join(' ')
                          : 'px-1',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className={
                          gl
                            ? 'min-h-0 w-full flex-1 rounded-md px-2 py-2 text-left transition hover:bg-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:hover:bg-white/8'
                            : [
                                'w-full rounded-xl border px-3 py-2.5 text-left shadow-sm outline-none ring-sky-400/35 transition hover:border-sky-300/55 hover:bg-white/95 dark:hover:bg-slate-900/85',
                                active
                                  ? 'border-sky-400/50 bg-white/98 ring-2 dark:border-sky-500/40 dark:bg-slate-900/80'
                                  : 'border-slate-200/75 bg-white/70 dark:border-slate-700/70 dark:bg-slate-900/45',
                              ].join(' ')
                        }
                      >
                        <div
                          className={
                            gl
                              ? 'flex flex-wrap items-start gap-2 border-b border-black/10 pb-1.5 dark:border-white/10'
                              : 'flex flex-wrap items-start gap-2 border-b border-slate-100/90 pb-1.5 dark:border-slate-700/55'
                          }
                        >
                          <span
                            className={
                              gl
                                ? 'font-mono text-[11px] font-semibold text-black/55 dark:text-white/60'
                                : 'font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400'
                            }
                          >
                            {row.orderNo}
                          </span>
                          <span className={`ms-auto shrink-0 ${statusClass(row.status)}`}>
                            {t(`unitWorkQueue.status.${row.status}`)}
                          </span>
                        </div>
                        <p
                          className={
                            gl
                              ? 'mt-1 text-sm font-semibold leading-snug text-black dark:text-white'
                              : 'mt-1 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50'
                          }
                        >
                          {row.title}
                        </p>
                        <p
                          className={
                            gl
                              ? 'mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-black/70 dark:text-white/70 sm:text-xs'
                              : 'mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xs'
                          }
                        >
                          {row.summary}
                        </p>
                        <div
                          className={
                            gl
                              ? 'mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-black/55 dark:text-white/65'
                              : 'mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400'
                          }
                        >
                          <span className="inline-flex items-center gap-1">
                            {priorityDot(row.priority)}
                            {t(`unitWorkQueue.priority.${row.priority}`)}
                          </span>
                          <span>{t(`unitWorkQueue.kind.${row.kind}`)}</span>
                          <span
                            className={
                              gl ? 'font-medium text-black/75 dark:text-white/80' : 'font-medium text-slate-600 dark:text-slate-300'
                            }
                          >
                            {unitLabel(row.targetUnit, t)}
                          </span>
                        </div>
                      </button>
                    </li>
                  )
                })
              )
            }
            footer={
              <div
                className={
                  gl
                    ? 'flex flex-wrap items-center justify-between gap-2 px-2 py-1 text-[11px] text-black/70 dark:text-white/75'
                    : 'flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] text-slate-500 dark:text-slate-400'
                }
              >
                <span>
                  {filtered.length}/{WORK_QUEUE_ITEMS.length} mock
                </span>
                <span className="hidden sm:inline">
                  {t('unitWorkQueue.demoViewer', { name: resolveWorkQueueName(MOCK_WORK_QUEUE_VIEWER_ID) })}
                </span>
              </div>
            }
            rightPanelRef={rightRef}
            rightAside={
              selected ? (
                <div className="okan-project-detail-column flex h-full min-h-0 min-w-0 flex-1 flex-col">
                  <div className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto px-1 pb-12 pt-1 lg:max-w-3xl">
                    <header
                      className={
                        gl
                          ? 'shrink-0 border-b border-black/12 pb-3 text-center dark:border-white/10'
                          : 'shrink-0 rounded-2xl border border-white/35 bg-white/45 p-4 text-center shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40'
                      }
                    >
                      <p
                        className={
                          gl
                            ? 'text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65'
                            : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                        }
                      >
                        {t('unitWorkQueue.selectedWorkEyebrow')}
                      </p>
                      <h3
                        className={
                          gl
                            ? 'mt-1.5 text-xl font-semibold leading-tight text-black dark:text-white'
                            : 'mt-1.5 text-xl font-semibold leading-tight text-slate-900 dark:text-slate-50'
                        }
                      >
                        {selected.title}
                      </h3>
                      <div
                        className={
                          gl
                            ? 'mt-1 flex flex-wrap items-center justify-center gap-2 text-sm leading-snug text-black/75 dark:text-white/80'
                            : 'mt-1 flex flex-wrap items-center justify-center gap-2 text-sm leading-snug text-slate-600 dark:text-slate-300'
                        }
                      >
                        <span className="font-mono tabular-nums">{selected.orderNo}</span>
                        {selected.dueToday ? (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 ring-1 ring-amber-500/35 dark:bg-amber-500/15 dark:text-amber-50">
                            {t('unitWorkQueue.dueBadge')}
                          </span>
                        ) : null}
                        <span className={`shrink-0 ${statusClass(selected.status)}`}>
                          {t(`unitWorkQueue.status.${selected.status}`)}
                        </span>
                      </div>

                      <dl className="mt-4 grid gap-2 text-left text-sm sm:grid-cols-2">
                        <div>
                          <dt
                            className={
                              gl
                                ? 'text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                : 'text-[11px] font-semibold uppercase tracking-wide text-slate-400'
                            }
                          >
                            {t('unitWorkQueue.detailKind')}
                          </dt>
                          <dd className={gl ? 'text-black dark:text-white' : ''}>{t(`unitWorkQueue.kind.${selected.kind}`)}</dd>
                        </div>
                        <div>
                          <dt
                            className={
                              gl
                                ? 'text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                : 'text-[11px] font-semibold uppercase tracking-wide text-slate-400'
                            }
                          >
                            {t('unitWorkQueue.colPriority')}
                          </dt>
                          <dd className={`inline-flex items-center gap-2 ${gl ? 'text-black dark:text-white' : ''}`}>
                            {priorityDot(selected.priority)} {t(`unitWorkQueue.priority.${selected.priority}`)}
                          </dd>
                        </div>
                        <div>
                          <dt
                            className={
                              gl
                                ? 'text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                : 'text-[11px] font-semibold uppercase tracking-wide text-slate-400'
                            }
                          >
                            {t('unitWorkQueue.assigneePerson')}
                          </dt>
                          <dd className={gl ? 'text-black dark:text-white' : ''}>
                            {selected.assigneeUserId ? resolveWorkQueueName(selected.assigneeUserId) : '—'}
                          </dd>
                        </div>
                        <div>
                          <dt
                            className={
                              gl
                                ? 'text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                : 'text-[11px] font-semibold uppercase tracking-wide text-slate-400'
                            }
                          >
                            {t('unitWorkQueue.assignerPerson')}
                          </dt>
                          <dd className={gl ? 'text-black dark:text-white' : ''}>
                            {resolveWorkQueueName(selected.assignerUserId)}
                          </dd>
                        </div>
                        <div>
                          <dt
                            className={
                              gl
                                ? 'text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                : 'text-[11px] font-semibold uppercase tracking-wide text-slate-400'
                            }
                          >
                            {t('unitWorkQueue.detailFrom')}
                          </dt>
                          <dd className={gl ? 'text-black dark:text-white' : ''}>{unitLabel(selected.fromUnit, t)}</dd>
                        </div>
                        <div>
                          <dt
                            className={
                              gl
                                ? 'text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                : 'text-[11px] font-semibold uppercase tracking-wide text-slate-400'
                            }
                          >
                            {t('unitWorkQueue.detailTo')}
                          </dt>
                          <dd className={gl ? 'text-black dark:text-white' : ''}>{unitLabel(selected.toUnit, t)}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt
                            className={
                              gl
                                ? 'text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                : 'text-[11px] font-semibold uppercase tracking-wide text-slate-400'
                            }
                          >
                            {t('unitWorkQueue.detailFactory')}
                          </dt>
                          <dd className={`flex items-center gap-2 font-mono text-xs ${gl ? 'text-black dark:text-white' : ''}`}>
                            <Factory
                              className={
                                gl
                                  ? 'size-3.5 text-black/50 dark:text-white/55'
                                  : 'size-3.5 text-sky-600 dark:text-sky-400'
                              }
                              aria-hidden
                            />{' '}
                            {selected.factoryCode}
                          </dd>
                        </div>
                        <div>
                          <dt
                            className={
                              gl
                                ? 'text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                : 'text-[11px] font-semibold uppercase tracking-wide text-slate-400'
                            }
                          >
                            {t('unitWorkQueue.colDays')}
                          </dt>
                          <dd className={gl ? 'text-black dark:text-white' : ''}>{selected.daysOnDesk}</dd>
                        </div>
                        <div>
                          <dt
                            className={
                              gl
                                ? 'text-[11px] font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                : 'text-[11px] font-semibold uppercase tracking-wide text-slate-400'
                            }
                          >
                            {t('unitWorkQueue.colUpdated')}
                          </dt>
                          <dd className={gl ? 'text-black dark:text-white' : ''}>{selected.lastUpdatedLabel}</dd>
                        </div>
                      </dl>

                      <div
                        className={
                          gl
                            ? 'mt-4 flex flex-wrap justify-center gap-2 border-t border-black/10 pt-3 dark:border-white/10'
                            : 'mt-4 flex flex-wrap gap-2 border-t border-slate-200/80 pt-3 dark:border-slate-600/65'
                        }
                      >
                        {selected.projectRouteId ? (
                          <Link
                            className={gl ? detailActionClass : `${eiSplitHeaderButtonPassive} text-sky-800 dark:text-sky-200`}
                            to={`/proje-detay/${selected.projectRouteId}`}
                          >
                            {t('unitWorkQueue.actionOpenProject')}
                          </Link>
                        ) : (
                          <span
                            className={
                              gl
                                ? `${detailActionClass} cursor-not-allowed opacity-55`
                                : `${eiSplitHeaderButtonPassive} cursor-not-allowed opacity-55`
                            }
                          >
                            {t('unitWorkQueue.actionOpenProject')}
                          </span>
                        )}
                        <button type="button" className={gl ? detailActionClass : `${eiSplitHeaderButtonPassive} opacity-90`}>
                          {t('unitWorkQueue.actionStart')}
                        </button>
                        <button type="button" className={gl ? detailActionClass : `${eiSplitHeaderButtonPassive} opacity-90`}>
                          {t('unitWorkQueue.actionComplete')}
                        </button>
                        <button type="button" className={gl ? detailActionClass : `${eiSplitHeaderButtonPassive} opacity-90`}>
                          {t('unitWorkQueue.actionBlock')}
                        </button>
                      </div>
                    </header>

                    {gl ? (
                      <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center border-b border-black/10 pb-2 pt-0.5 dark:border-white/10">
                        <div
                          className="okan-liquid-pill-track flex max-w-full gap-1 overflow-x-auto rounded-full p-1"
                          role="tablist"
                          aria-label={t('unitWorkQueue.listTitle')}
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
                              aria-selected={detailTab === id}
                              onClick={() => setDetailTab(id)}
                              className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 sm:text-sm ${
                                detailTab === id
                                  ? 'okan-liquid-pill-active okan-project-tab-active text-black dark:text-white'
                                  : 'text-black/70 hover:text-black dark:text-white/75 dark:hover:text-white'
                              }`}
                            >
                              {t(key)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
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
                    )}

                    <div className="okan-project-tab-panel min-h-0 min-w-0 flex-1">
                      {detailTab === 'summary' ? (
                        <p
                          className={
                            gl
                              ? 'text-sm leading-relaxed text-black/80 dark:text-white/85'
                              : 'text-sm leading-relaxed text-slate-700 dark:text-slate-300'
                          }
                        >
                          {selected.detailBody}
                        </p>
                      ) : null}
                      {detailTab === 'project' ? (
                        <div
                          className={
                            gl
                              ? 'rounded-xl border border-dashed border-black/18 p-4 text-sm text-black/75 dark:border-white/15 dark:text-white/80'
                              : 'rounded-xl border border-dashed border-slate-300/80 p-4 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-400'
                          }
                        >
                          <p
                            className={
                              gl
                                ? 'font-semibold text-black dark:text-white'
                                : 'font-semibold text-slate-800 dark:text-slate-100'
                            }
                          >
                            {selected.projectCode} — {selected.projectName}
                          </p>
                          <p className="mt-2">{t('unitWorkQueue.panelProjectPlaceholder')}</p>
                        </div>
                      ) : null}
                      {detailTab === 'history' ? (
                        <ul
                          className={
                            gl
                              ? 'space-y-3 text-sm text-black/75 dark:text-white/80'
                              : 'space-y-3 text-sm text-slate-600 dark:text-slate-400'
                          }
                        >
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
