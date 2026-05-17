import { ChevronRight, Package, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'
import { ALL_ELEMENT_TYPES } from '../../elementIdentity/catalog/allElementTypes'
import { TYPOLOGIES_BY_ID } from '../../elementIdentity/catalog/typologies'
import type {
  AssemblyComponentLine,
  ElementCategory,
  ProductLifecycleStatus,
  ProjectProduct,
  StandardSeriesTemplate,
} from '../../elementIdentity/types'
import { useI18n } from '../../i18n/I18nProvider'
import { activeModuleIdFromPathname } from '../../data/navigation'
import { useThemeMode } from '../../theme/ThemeProvider'
import { mergeTemplateFromProductPartial, templateToProductForEditor } from '../../standardSeriesCatalog/templateProductAdapter'
import { PmStyleDialog } from '../shared/PmStyleDialog'
import { ProductActivityTab } from '../elementIdentity/ProductActivityTab'
import { ProductDimensionsTab } from '../elementIdentity/ProductDimensionsTab'
import { ProductDrawingsTab } from '../elementIdentity/ProductDrawingsTab'
import { ProductMaterialsTab } from '../elementIdentity/ProductMaterialsTab'
import { ProductRebarTab } from '../elementIdentity/ProductRebarTab'
import { useElementIdentity } from '../elementIdentity/elementIdentityContextValue'
import {
  eiSplitHeaderButtonPassive,
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { SplitListPaginationNav } from '../shared/SplitListPaginationNav'
import { eiSplitListRowButton, eiTabPill } from '../elementIdentity/elementIdentitySplitUi'
import { StandardSeriesAssemblyTab } from './StandardSeriesAssemblyTab'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'

type DetailTab = 'general' | 'dimensions' | 'materials' | 'rebar' | 'drawings' | 'activity' | 'assembly'

type CategoryFilter = 'all' | 'focus' | ElementCategory

const ALL_CATEGORIES: ElementCategory[] = [
  'superstructure',
  'substructure',
  'industrial',
  'architectural',
  'environmental_protection',
  'landscaping',
  'energy_carrier',
  'custom_prefab',
]

const LIST_VIEW_STATE_KEY = 'standard-series-catalog:list:view'
const STANDARD_SERIES_LIST_PAGE_SIZE = 5

function elemCatLabelKey(cat: ElementCategory): string {
  return `standardSeries.elemCat.${cat}`
}

function categoryPassesFilter(
  cat: ElementCategory | undefined,
  mode: CategoryFilter,
): boolean {
  if (!cat) return mode === 'all'
  if (mode === 'all') return true
  if (mode === 'focus') return cat !== 'superstructure' && cat !== 'architectural'
  return cat === mode
}

export function StandardSeriesCatalogModuleView() {
  const { t, locale } = useI18n()
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const location = useLocation()
  const neutralShell = activeModuleIdFromPathname(location.pathname) === 'standard-series-catalog'
  const {
    activeFirm,
    standardSeriesTemplates,
    addStandardSeriesTemplate,
    updateStandardSeriesTemplate,
    removeStandardSeriesTemplate,
    instantiateStandardTemplateToProject,
    projects,
  } = useElementIdentity()

  const firmTemplates = useMemo(
    () => standardSeriesTemplates.filter((x) => x.firmId === activeFirm.id),
    [standardSeriesTemplates, activeFirm.id],
  )

  const [filterOpen, setFilterOpen] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('focus')
  const [activeOnly, setActiveOnly] = useState(false)
  const [listPage, setListPage] = useState(() => {
    try {
      const raw = sessionStorage.getItem(LIST_VIEW_STATE_KEY)
      if (!raw) return 1
      const v = JSON.parse(raw) as { listPage?: number }
      return typeof v.listPage === 'number' && v.listPage > 0 ? v.listPage : 1
    } catch {
      return 1
    }
  })
  const listScrollRef = useRef<HTMLUListElement | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('general')
  const rightRef = useRef<HTMLDivElement | null>(null)

  const [addToProjectOpen, setAddToProjectOpen] = useState(false)
  const [addProjectId, setAddProjectId] = useState('')
  const [addCode, setAddCode] = useState('')
  const [addName, setAddName] = useState('')

  const scrollPanelTop = () => {
    requestAnimationFrame(() => rightRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const selected = useMemo(
    () => firmTemplates.find((x) => x.id === selectedId) ?? null,
    [firmTemplates, selectedId],
  )

  useEffect(() => {
    if (firmTemplates.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !firmTemplates.some((x) => x.id === selectedId)) {
      setSelectedId(firmTemplates[0]!.id)
    }
  }, [firmTemplates, selectedId])

  useEffect(() => {
    if (selected) {
      setAddCode(selected.code)
      setAddName(selected.name)
    }
  }, [selected?.id, selected?.code, selected?.name])

  useEffect(() => {
    if (projects.length && !addProjectId) {
      setAddProjectId(projects[0]!.id)
    }
  }, [projects, addProjectId])

  const filtered = useMemo(() => {
    const q = filterQuery.trim().toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR')
    return firmTemplates.filter((tpl) => {
      if (activeOnly && !tpl.active) return false
      const et = tpl.elementTypeId ? ALL_ELEMENT_TYPES.find((e) => e.id === tpl.elementTypeId) : undefined
      if (!categoryPassesFilter(et?.category, categoryFilter)) return false
      if (!q) return true
      const hay = `${tpl.code} ${tpl.name} ${tpl.description ?? ''}`.toLocaleLowerCase(
        locale === 'en' ? 'en-US' : 'tr-TR',
      )
      return hay.includes(q)
    })
  }, [firmTemplates, filterQuery, categoryFilter, activeOnly, locale])

  useEffect(() => {
    setListPage(1)
  }, [filterQuery, categoryFilter, activeOnly])

  const listPageCount = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / STANDARD_SERIES_LIST_PAGE_SIZE)),
    [filtered.length],
  )
  const safeListPage = Math.min(listPage, listPageCount)
  const visibleTemplates = useMemo(() => {
    const start = (safeListPage - 1) * STANDARD_SERIES_LIST_PAGE_SIZE
    return filtered.slice(start, start + STANDARD_SERIES_LIST_PAGE_SIZE)
  }, [filtered, safeListPage])
  const listPageStart =
    filtered.length === 0 ? 0 : (safeListPage - 1) * STANDARD_SERIES_LIST_PAGE_SIZE + 1
  const listPageEnd = Math.min(filtered.length, safeListPage * STANDARD_SERIES_LIST_PAGE_SIZE)

  useEffect(() => {
    try {
      sessionStorage.setItem(LIST_VIEW_STATE_KEY, JSON.stringify({ listPage: safeListPage }))
    } catch {
      /* ignore */
    }
  }, [safeListPage])

  useEffect(() => {
    requestAnimationFrame(() => listScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }, [safeListPage])

  const typologyIdsForType = useCallback((elementTypeId: string) => {
    const et = ALL_ELEMENT_TYPES.find((e) => e.id === elementTypeId)
    return et?.allowedTypologies ?? []
  }, [])

  const typologyOptions = useMemo(() => {
    const etId = selected?.elementTypeId ?? ALL_ELEMENT_TYPES[0]?.id ?? ''
    return typologyIdsForType(etId)
      .map((id) => TYPOLOGIES_BY_ID[id])
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
  }, [selected?.elementTypeId, typologyIdsForType])

  const patchTemplateFields = useCallback(
    (partial: Partial<StandardSeriesTemplate>) => {
      if (!selected) return
      updateStandardSeriesTemplate({ ...selected, ...partial, updatedAt: new Date().toISOString() })
    },
    [selected, updateStandardSeriesTemplate],
  )

  const patchFromProductTabs = useCallback(
    (partial: Partial<ProjectProduct>) => {
      if (!selected) return
      updateStandardSeriesTemplate(mergeTemplateFromProductPartial(selected, partial))
    },
    [selected, updateStandardSeriesTemplate],
  )

  const productLike = useMemo(() => (selected ? templateToProductForEditor(selected) : null), [selected])

  const elementTypeLabel = useCallback(
    (id?: string) => {
      const et = ALL_ELEMENT_TYPES.find((e) => e.id === id)
      if (!et) return '—'
      return locale === 'en' ? et.nameEn : et.nameTr
    },
    [locale],
  )

  const fieldLabelClass = gl
    ? 'text-[11px] font-medium text-black/65 dark:text-white/75'
    : 'text-[11px] font-medium text-slate-600 dark:text-slate-300'
  const fieldInputClass = gl
    ? 'glass-input mt-1 w-full px-2.5 py-2 text-sm'
    : 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'
  const fieldMonoClass = gl
    ? 'glass-input mt-1 w-full px-2.5 py-2 font-mono text-sm'
    : 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'
  const fieldTextareaClass = gl
    ? 'glass-input mt-1 w-full resize-y px-2.5 py-2 text-sm'
    : 'mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'

  const handleNewTemplate = () => {
    addStandardSeriesTemplate({
      firmId: activeFirm.id,
      code: 'SERI-NEW',
      name: locale === 'en' ? 'New series template' : 'Yeni seri şablonu',
      active: true,
      elementTypeId: 'land-paver',
      typologyId: 'beam-rect',
    })
    setListPage(1)
  }

  const openAddToProject = () => {
    if (!selected) return
    setAddCode(selected.code)
    setAddName(selected.name)
    setAddToProjectOpen(true)
  }

  const confirmAddToProject = () => {
    if (!selected || !addProjectId.trim()) return
    instantiateStandardTemplateToProject(addProjectId, selected.id, {
      code: addCode.trim() || selected.code,
      name: addName.trim() || selected.name,
    })
    setAddToProjectOpen(false)
  }

  return (
    <>
    <div
      className="project-mgmt-glass-light flex min-h-0 min-w-0 flex-1 basis-0 flex-col gap-0 overflow-hidden rounded-3xl"
      data-neutral-shell={neutralShell ? 'true' : undefined}
    >
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-1">
          <div className="px-[0.6875rem] pt-0 pb-0.5">
            <nav aria-label={t('project.breadcrumbAria')} className="mb-0">
              <ol className="flex flex-wrap items-center gap-1 text-xs text-black/60 dark:text-white/65">
                <li>
                  <Link
                    to="/tanimlar"
                    className="font-medium text-black/75 underline-offset-2 transition hover:text-black hover:underline dark:text-white/75 dark:hover:text-white"
                  >
                    {t('elementIdentity.detail.breadcrumbHub')}
                  </Link>
                </li>
                <li className="flex items-center gap-1" aria-hidden>
                  <ChevronRight className="size-3.5 shrink-0 opacity-70" />
                </li>
                <li className="font-semibold text-black dark:text-white" aria-current="page">
                  {t('nav.standardSeriesCatalog')}
                </li>
              </ol>
            </nav>
          </div>

        <div
          className={[
            'min-h-0 flex min-h-0 flex-1 flex-col overflow-hidden',
            gl
              ? 'rounded-3xl bg-transparent p-0'
              : 'rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5',
          ].join(' ')}
        >
          <ElementIdentityPieceCodesLikeSplit
              persistKey="standard-series-catalog"
              visualVariant="project-mgmt"
              neutralChrome={neutralShell}
              listRef={listScrollRef}
              listIndentWhenFilterOpen="18.5rem"
              defaultSplitRatio={38}
              listTitle={t('standardSeries.listTitle')}
              filterToolbarSearch={
                <FilterToolbarSearch
                  id="standard-series-list-search"
                  value={filterQuery}
                  onValueChange={(v) => {
                    setFilterQuery(v)
                    setListPage(1)
                  }}
                  placeholder={t('standardSeries.searchPh')}
                  ariaLabel={t('standardSeries.search')}
                  className={gl ? 'project-mgmt-toolbar-search' : ''}
                  inputClassName={gl ? 'glass-input' : ''}
                />
              }
              headerActions={
                <>
                  <button
                    type="button"
                    onClick={handleNewTemplate}
                    className={eiSplitHeaderButtonPassive}
                  >
                    <Plus className="size-3.5 shrink-0" aria-hidden />
                    {t('standardSeries.newTemplate')}
                  </button>
                  <button
                    type="button"
                    disabled={!selected}
                    onClick={openAddToProject}
                    className={`${eiSplitHeaderButtonPassive} inline-flex items-center gap-1.5 disabled:pointer-events-none disabled:opacity-40`}
                  >
                    <Package className="size-3.5 shrink-0" aria-hidden />
                    {t('standardSeries.addToProject')}
                  </button>
                </>
              }
              isFilterOpen={filterOpen}
              onFilterOpenChange={setFilterOpen}
              filterAside={
                <div>
                  <ElementIdentityFilterSheetHeader
                    title={t('standardSeries.filtersTitle')}
                    subtitle={t('standardSeries.filtersSubtitle')}
                    onClose={() => setFilterOpen(false)}
                    glass={gl}
                  />
                  <div className="grid gap-2.5">
                    <label>
                      <span className={fieldLabelClass}>{t('standardSeries.search')}</span>
                      <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className={
                          gl
                            ? 'glass-input mt-1 w-full px-2.5 py-2 text-xs'
                            : 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'
                        }
                      />
                    </label>
                    <label>
                      <span className={fieldLabelClass}>{t('standardSeries.categoryFilter')}</span>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                        className={
                          gl
                            ? 'glass-input mt-1 w-full px-2.5 py-2 text-xs'
                            : 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'
                        }
                      >
                        <option value="all">{t('standardSeries.catAll')}</option>
                        <option value="focus">{t('standardSeries.catFocus')}</option>
                        {ALL_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {t(elemCatLabelKey(c))}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label
                      className={
                        gl
                          ? 'flex items-center gap-2 text-xs text-black/80 dark:text-white/80'
                          : 'flex items-center gap-2 text-xs'
                      }
                    >
                      <input
                        type="checkbox"
                        checked={activeOnly}
                        onChange={(e) => setActiveOnly(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      {t('standardSeries.activeOnly')}
                    </label>
                  </div>
                  <div
                    className={
                      gl
                        ? 'mt-3 flex justify-end border-t border-black/12 pt-2 dark:border-white/12'
                        : 'mt-3 flex justify-end border-t border-slate-200/60 pt-2 dark:border-slate-700/60'
                    }
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setFilterQuery('')
                        setCategoryFilter('focus')
                        setActiveOnly(false)
                      }}
                      className={
                        gl
                          ? ['glass-btn', 'secondary', 'small'].join(' ')
                          : 'rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200'
                      }
                    >
                      {t('elementIdentity.reset')}
                    </button>
                  </div>
                </div>
              }
              listBody={
                filtered.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-slate-300/60 bg-white/30 px-3 py-8 text-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/20">
                    {t('standardSeries.empty')}
                  </li>
                ) : (
                  visibleTemplates.map((tpl) => {
                    const et = tpl.elementTypeId ? ALL_ELEMENT_TYPES.find((e) => e.id === tpl.elementTypeId) : undefined
                    const cat = et?.category
                    return (
                      <li key={tpl.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(tpl.id)
                            setDetailTab('general')
                            scrollPanelTop()
                          }}
                          aria-current={selectedId === tpl.id ? 'true' : undefined}
                          className={eiSplitListRowButton(selectedId === tpl.id)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">
                              {tpl.code}
                            </span>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                tpl.active
                                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                                  : 'bg-slate-400/20 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {tpl.active ? t('standardSeries.active') : t('standardSeries.inactive')}
                            </span>
                          </div>
                          <span className="line-clamp-2 text-slate-700 dark:text-slate-200">{tpl.name}</span>
                          {cat ? (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{t(elemCatLabelKey(cat))}</span>
                          ) : null}
                        </button>
                      </li>
                    )
                  })
                )
              }
              footer={
                <div className="flex flex-col gap-2 px-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {filtered.length > 0 ? (
                      <>
                        <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">{listPageStart}</span>-
                        <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">{listPageEnd}</span>{' '}
                        / <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">{filtered.length}</span>{' '}
                        {locale === 'en' ? 'templates' : 'şablon'}
                      </>
                    ) : (
                      <span>{t('standardSeries.empty')}</span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {filtered.length > 0 ? (
                      <SplitListPaginationNav
                        safePage={safeListPage}
                        pageCount={listPageCount}
                        onPrev={() => setListPage((p) => Math.max(1, p - 1))}
                        onNext={() => setListPage((p) => Math.min(listPageCount, p + 1))}
                        gl={gl}
                        locale={locale}
                        buttonStyle={gl ? 'glass' : 'passive'}
                        pageIndicatorClassName={
                          gl ? 'tabular-nums text-black/80 dark:text-white/75' : 'tabular-nums text-black/70 dark:text-white/75'
                        }
                      />
                    ) : null}
                  </div>
                </div>
              }
              rightPanelRef={rightRef}
              rightAside={
                <div key={selectedId ?? 'none'} className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
                  <div className="mx-auto flex h-full min-h-0 min-w-0 w-full max-w-2xl flex-1 flex-col gap-4 overflow-hidden lg:max-w-3xl">
                  {selected && productLike ? (
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                      <header className="flex shrink-0 flex-col items-center border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {t('standardSeries.selected')}
                        </p>
                        <h3 className="mt-1 max-w-full px-1 font-mono text-xl font-semibold text-slate-900 dark:text-slate-50">
                          {selected.code}
                        </h3>
                        <p className="mt-2 max-w-full px-1 text-xs text-slate-600 dark:text-slate-400">{selected.name}</p>
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={openAddToProject}
                            className={`${eiSplitHeaderButtonPassive} inline-flex items-center gap-1.5`}
                          >
                            <Package className="size-3.5 shrink-0" aria-hidden />
                            {t('standardSeries.addToProject')}
                          </button>
                          <button
                            type="button"
                            onClick={() => selectedId && removeStandardSeriesTemplate(selectedId)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300/70 bg-rose-50/90 px-2 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-600/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/60"
                          >
                            <Trash2 className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                            {t('standardSeries.remove')}
                          </button>
                        </div>
                      </header>
                      <div className="sticky top-0 z-10 flex w-full min-w-0 shrink-0 justify-center bg-transparent pt-3">
                        <div
                          className="flex max-w-full gap-1 overflow-x-auto"
                          role="tablist"
                          aria-label={t('standardSeries.listTitle')}
                          aria-orientation="horizontal"
                        >
                          {(
                            [
                              ['general', 'standardSeries.tabGeneral'],
                              ['dimensions', 'elementIdentity.products.tabDimensions'],
                              ['materials', 'elementIdentity.products.tabMaterials'],
                              ['rebar', 'elementIdentity.products.tabRebar'],
                              ['drawings', 'elementIdentity.products.tabDrawings'],
                              ['activity', 'elementIdentity.products.tabActivity'],
                              ['assembly', 'standardSeries.tabAssembly'],
                            ] as const
                          ).map(([id, key]) => (
                            <button
                              key={id}
                              type="button"
                              role="tab"
                              aria-selected={detailTab === id}
                              onClick={() => {
                                setDetailTab(id)
                                scrollPanelTop()
                              }}
                              className={eiTabPill(detailTab === id)}
                            >
                              {t(key)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div
                        role="tabpanel"
                        className="okan-project-tab-panel mt-3 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-left sm:px-1"
                      >
                        {detailTab === 'general' && (
                          <div className="flex flex-col gap-3">
                            <label className="block">
                              <span className={fieldLabelClass}>{t('elementIdentity.detail.code')}</span>
                              <input
                                value={selected.code}
                                onChange={(e) => patchTemplateFields({ code: e.target.value.toUpperCase() })}
                                className={fieldMonoClass}
                              />
                            </label>
                            <label className="block">
                              <span className={fieldLabelClass}>{t('elementIdentity.products.nameField')}</span>
                              <input
                                value={selected.name}
                                onChange={(e) => patchTemplateFields({ name: e.target.value })}
                                className={fieldInputClass}
                              />
                            </label>
                            <label
                              className={
                                gl
                                  ? 'flex items-center gap-2 text-sm text-black/85 dark:text-white/85'
                                  : 'flex items-center gap-2 text-sm'
                              }
                            >
                              <input
                                type="checkbox"
                                checked={selected.active}
                                onChange={(e) => patchTemplateFields({ active: e.target.checked })}
                                className="rounded border-slate-300"
                              />
                              {t('standardSeries.active')}
                            </label>
                            <label className="block">
                              <span className={fieldLabelClass}>{t('standardSeries.description')}</span>
                              <textarea
                                value={selected.description ?? ''}
                                onChange={(e) => patchTemplateFields({ description: e.target.value || undefined })}
                                rows={3}
                                className={fieldTextareaClass}
                              />
                            </label>
                            <label className="block">
                              <span className={fieldLabelClass}>{t('elementIdentity.products.definition')}</span>
                              <textarea
                                value={selected.definition ?? ''}
                                onChange={(e) => patchTemplateFields({ definition: e.target.value || undefined })}
                                rows={3}
                                className={fieldTextareaClass}
                              />
                            </label>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <label className="block sm:col-span-2">
                                <span className={fieldLabelClass}>{t('elementIdentity.table.elementType')}</span>
                                <select
                                  value={selected.elementTypeId ?? ''}
                                  onChange={(e) => {
                                    const elementTypeId = e.target.value || undefined
                                    const allowed = typologyIdsForType(elementTypeId ?? '')
                                    const nextTy = allowed[0]
                                    patchTemplateFields({
                                      elementTypeId,
                                      typologyId: nextTy,
                                    })
                                  }}
                                  className={fieldInputClass}
                                >
                                  <option value="">—</option>
                                  {ALL_ELEMENT_TYPES.map((et) => (
                                    <option key={et.id} value={et.id}>
                                      {locale === 'en' ? et.nameEn : et.nameTr}
                                    </option>
                                  ))}
                                </select>
                                <p
                                  className={
                                    gl ? 'mt-1 text-[10px] text-black/55 dark:text-white/60' : 'mt-1 text-[10px] text-slate-500'
                                  }
                                >
                                  {elementTypeLabel(selected.elementTypeId)}
                                </p>
                              </label>
                              <label className="block sm:col-span-2">
                                <span className={fieldLabelClass}>{t('elementIdentity.table.typology')}</span>
                                <select
                                  value={selected.typologyId ?? ''}
                                  onChange={(e) => patchTemplateFields({ typologyId: e.target.value || undefined })}
                                  className={fieldInputClass}
                                >
                                  <option value="">—</option>
                                  {typologyOptions.map((ty) => (
                                    <option key={ty.id} value={ty.id}>
                                      {locale === 'en' ? ty.nameEn : ty.nameTr}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="block">
                                <span className={fieldLabelClass}>{t('elementIdentity.products.lifecycle')}</span>
                                <select
                                  value={selected.lifecycleStatus ?? 'tasarim'}
                                  onChange={(e) =>
                                    patchTemplateFields({
                                      lifecycleStatus: e.target.value as ProductLifecycleStatus,
                                    })
                                  }
                                  className={fieldInputClass}
                                >
                                  <option value="tasarim">{locale === 'en' ? 'Design' : 'Tasarım'}</option>
                                  <option value="uretim">{locale === 'en' ? 'Production' : 'Üretim'}</option>
                                  <option value="saha">{locale === 'en' ? 'Site' : 'Saha'}</option>
                                  <option value="montaj">{locale === 'en' ? 'Assembly' : 'Montaj'}</option>
                                  <option value="tamamlandi">{locale === 'en' ? 'Completed' : 'Tamamlandı'}</option>
                                </select>
                              </label>
                              <label className="block">
                                <span className={fieldLabelClass}>{t('elementIdentity.products.volume')}</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  value={selected.volumeM3 ?? ''}
                                  onChange={(e) => {
                                    const v = e.target.value
                                    patchTemplateFields({
                                      volumeM3: v === '' ? undefined : Math.max(0, Number(v) || 0),
                                    })
                                  }}
                                  className={`${fieldInputClass} tabular-nums`}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                        {detailTab === 'dimensions' && (
                          <ProductDimensionsTab product={productLike} onPatch={patchFromProductTabs} />
                        )}
                        {detailTab === 'materials' && (
                          <ProductMaterialsTab product={productLike} onPatch={patchFromProductTabs} />
                        )}
                        {detailTab === 'rebar' && <ProductRebarTab product={productLike} onPatch={patchFromProductTabs} />}
                        {detailTab === 'drawings' && (
                          <ProductDrawingsTab product={productLike} onPatch={patchFromProductTabs} />
                        )}
                        {detailTab === 'activity' && (
                          <ProductActivityTab product={productLike} onPatch={patchFromProductTabs} />
                        )}
                        {detailTab === 'assembly' && (
                          <StandardSeriesAssemblyTab
                            rows={selected.assemblyComponents ?? []}
                            onChange={(rows: AssemblyComponentLine[]) =>
                              patchTemplateFields({ assemblyComponents: rows })
                            }
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 py-8">
                      <p
                        className={
                          gl
                            ? 'text-center text-xs text-black/60 dark:text-white/65'
                            : 'text-center text-xs text-slate-500 dark:text-slate-400'
                        }
                      >
                        {t('standardSeries.selectHint')}
                      </p>
                    </div>
                  )}
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {addToProjectOpen && selected ? (
        <PmStyleDialog
          title={t('standardSeries.addToProjectTitle')}
          subtitle={selected.code}
          closeLabel={t('elementIdentity.cancel')}
          onClose={() => setAddToProjectOpen(false)}
          maxWidthClass="max-w-md"
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddToProjectOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-600"
              >
                {t('elementIdentity.cancel')}
              </button>
              <button
                type="button"
                disabled={!addProjectId}
                onClick={confirmAddToProject}
                className={`${eiSplitHeaderButtonPassive} px-3 py-2 text-sm disabled:opacity-40`}
              >
                {t('standardSeries.addConfirm')}
              </button>
            </div>
          }
        >
          <div className="grid gap-3 text-sm">
            <label className="block">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {t('standardSeries.targetProject')}
              </span>
              <select
                value={addProjectId}
                onChange={(e) => setAddProjectId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code}
                    {p.name ? ` — ${p.name}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {t('elementIdentity.detail.code')}
              </span>
              <input
                value={addCode}
                onChange={(e) => setAddCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {t('elementIdentity.products.nameField')}
              </span>
              <input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>
          </div>
        </PmStyleDialog>
      ) : null}
    </>
  )
}
