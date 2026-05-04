import { Package, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import '../muhendislikOkan/engineeringOkanLiquid.css'
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

  const handleNewTemplate = () => {
    addStandardSeriesTemplate({
      firmId: activeFirm.id,
      code: 'SERI-NEW',
      name: locale === 'en' ? 'New series template' : 'Yeni seri şablonu',
      active: true,
      elementTypeId: 'land-paver',
      typologyId: 'beam-rect',
    })
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
      <ElementIdentityPieceCodesLikeSplit
        persistKey="standard-series-catalog"
        listTitle={t('standardSeries.listTitle')}
        filterToolbarSearch={
          <FilterToolbarSearch
            id="standard-series-list-search"
            value={filterQuery}
            onValueChange={setFilterQuery}
            placeholder={t('standardSeries.searchPh')}
            ariaLabel={t('standardSeries.search')}
          />
        }
        headerActions={
          <>
            <button type="button" onClick={handleNewTemplate} className={eiSplitHeaderButtonPassive}>
              <Plus className="size-3.5 shrink-0" aria-hidden />
              {t('standardSeries.newTemplate')}
            </button>
            <button
              type="button"
              disabled={!selected}
              onClick={openAddToProject}
              className={eiSplitHeaderButtonPassive}
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
            />
            <div className="grid gap-2.5">
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {t('standardSeries.search')}
                </span>
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>
              <label>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {t('standardSeries.categoryFilter')}
                </span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
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
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  className="rounded border-slate-300"
                />
                {t('standardSeries.activeOnly')}
              </label>
            </div>
            <div className="mt-3 flex justify-end border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setFilterQuery('')
                  setCategoryFilter('focus')
                  setActiveOnly(false)
                }}
                className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
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
            filtered.map((tpl) => {
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
                    className={`flex w-full flex-col gap-1 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                      selectedId === tpl.id
                        ? 'border-sky-400/60 bg-sky-500/10 dark:border-sky-500/40 dark:bg-sky-500/15'
                        : 'border-slate-200/50 bg-white/40 hover:bg-white/70 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-slate-900/50'
                    }`}
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
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-600 dark:text-slate-300">
            <p>
              <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">
                {filtered.length}
              </span>{' '}
              {locale === 'en' ? 'templates' : 'şablon'}
            </p>
            <button
              type="button"
              onClick={() => selectedId && removeStandardSeriesTemplate(selectedId)}
              disabled={!selected}
              className="rounded-md border border-rose-300/70 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-40 dark:border-rose-600/60 dark:text-rose-300 dark:hover:bg-rose-950/40"
            >
              {t('standardSeries.remove')}
            </button>
          </div>
        }
        rightPanelRef={rightRef}
        rightAside={
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {selected && productLike ? (
              <div className="flex h-full min-h-0 flex-col">
                <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t('standardSeries.selected')}
                  </p>
                  <h3 className="mt-1.5 font-mono text-xl font-semibold text-slate-900 dark:text-slate-50">
                    {selected.code}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{selected.name}</p>
                </header>
                <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
                  <div className="flex max-w-full gap-1 overflow-x-auto" role="tablist">
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
                        className={`shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                          detailTab === id
                            ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
                            : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100'
                        }`}
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
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {t('elementIdentity.detail.code')}
                        </span>
                        <input
                          value={selected.code}
                          onChange={(e) => patchTemplateFields({ code: e.target.value.toUpperCase() })}
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {t('elementIdentity.products.nameField')}
                        </span>
                        <input
                          value={selected.name}
                          onChange={(e) => patchTemplateFields({ name: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selected.active}
                          onChange={(e) => patchTemplateFields({ active: e.target.checked })}
                          className="rounded border-slate-300"
                        />
                        {t('standardSeries.active')}
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {t('standardSeries.description')}
                        </span>
                        <textarea
                          value={selected.description ?? ''}
                          onChange={(e) => patchTemplateFields({ description: e.target.value || undefined })}
                          rows={3}
                          className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {t('elementIdentity.products.definition')}
                        </span>
                        <textarea
                          value={selected.definition ?? ''}
                          onChange={(e) => patchTemplateFields({ definition: e.target.value || undefined })}
                          rows={3}
                          className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block sm:col-span-2">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('elementIdentity.table.elementType')}
                          </span>
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
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                          >
                            <option value="">—</option>
                            {ALL_ELEMENT_TYPES.map((et) => (
                              <option key={et.id} value={et.id}>
                                {locale === 'en' ? et.nameEn : et.nameTr}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-[10px] text-slate-500">{elementTypeLabel(selected.elementTypeId)}</p>
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('elementIdentity.table.typology')}
                          </span>
                          <select
                            value={selected.typologyId ?? ''}
                            onChange={(e) => patchTemplateFields({ typologyId: e.target.value || undefined })}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
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
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('elementIdentity.products.lifecycle')}
                          </span>
                          <select
                            value={selected.lifecycleStatus ?? 'tasarim'}
                            onChange={(e) =>
                              patchTemplateFields({
                                lifecycleStatus: e.target.value as ProductLifecycleStatus,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                          >
                            <option value="tasarim">{locale === 'en' ? 'Design' : 'Tasarım'}</option>
                            <option value="uretim">{locale === 'en' ? 'Production' : 'Üretim'}</option>
                            <option value="saha">{locale === 'en' ? 'Site' : 'Saha'}</option>
                            <option value="montaj">{locale === 'en' ? 'Assembly' : 'Montaj'}</option>
                            <option value="tamamlandi">{locale === 'en' ? 'Completed' : 'Tamamlandı'}</option>
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('elementIdentity.products.volume')}
                          </span>
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
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm tabular-nums dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
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
              <p className="px-1 text-center text-xs text-slate-500 dark:text-slate-400">
                {t('standardSeries.selectHint')}
              </p>
            )}
          </div>
        }
      />

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
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
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
