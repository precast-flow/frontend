import { BookMarked, Package, Plus, Upload } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ALL_ELEMENT_TYPES } from '../../elementIdentity/catalog/allElementTypes'
import { TYPOLOGIES_BY_ID } from '../../elementIdentity/catalog/typologies'
import type { ProductLifecycleStatus, ProjectProduct, ProjectProductSource } from '../../elementIdentity/types'
import { useI18n } from '../../i18n/I18nProvider'
import {
  eiSplitHeaderButtonPassive,
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
} from './ElementIdentityPieceCodesLikeSplit'
import { ProductActivityTab } from './ProductActivityTab'
import { ProductDimensionsTab } from './ProductDimensionsTab'
import { ProductDrawingsTab } from './ProductDrawingsTab'
import { ProductMaterialsTab } from './ProductMaterialsTab'
import { ProductRebarTab } from './ProductRebarTab'
import { AddFromStandardCatalogDialog } from './AddFromStandardCatalogDialog'
import { useElementIdentity } from './elementIdentityContextValue'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'

type ProductDetailTab = 'general' | 'note' | 'dimensions' | 'materials' | 'rebar' | 'drawings' | 'activity'

function productSourceBar(source: string) {
  if (source === 'IFC' || source === 'CAD') {
    return {
      pct: 72,
      track: 'bg-sky-100/90 dark:bg-sky-950/60',
      fill: 'bg-sky-500',
      label: 'text-sky-800 dark:text-sky-200',
    }
  }
  if (source === 'STANDARD_LIBRARY') {
    return {
      pct: 56,
      track: 'bg-violet-100/90 dark:bg-violet-950/50',
      fill: 'bg-violet-500',
      label: 'text-violet-900 dark:text-violet-100',
    }
  }
  return {
    pct: 48,
    track: 'bg-emerald-100/90 dark:bg-emerald-950/50',
    fill: 'bg-emerald-500',
    label: 'text-emerald-800 dark:text-emerald-100',
  }
}

export type ElementIdentityProductsTabProps = {
  projectId: string
  onOpenNewProduct: () => void
  onOpenBulkImport: () => void
}

export function ElementIdentityProductsTab({
  projectId,
  onOpenNewProduct,
  onOpenBulkImport,
}: ElementIdentityProductsTabProps) {
  const { t, locale } = useI18n()
  const { projectProducts, removeProjectProduct, updateProjectProduct } = useElementIdentity()

  const prd = useMemo(
    () => projectProducts.filter((p) => p.projectId === projectId && p.status === 'active'),
    [projectProducts, projectId],
  )

  const [filterOpen, setFilterOpen] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')
  const [filterSource, setFilterSource] = useState<'all' | ProjectProductSource>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<ProductDetailTab>('general')
  const [catalogOpen, setCatalogOpen] = useState(false)
  const rightRef = useRef<HTMLDivElement | null>(null)

  const scrollPanelTop = () => {
    requestAnimationFrame(() => rightRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const filtered = useMemo(() => {
    const q = filterQuery.trim().toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR')
    return prd.filter((p) => {
      if (filterSource !== 'all' && p.source !== filterSource) return false
      if (!q) return true
      return (
        p.code.toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR').includes(q) ||
        p.name.toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR').includes(q)
      )
    })
  }, [prd, filterQuery, filterSource, locale])

  const selected = useMemo(() => prd.find((p) => p.id === selectedId) ?? null, [prd, selectedId])

  useEffect(() => {
    if (prd.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !prd.some((p) => p.id === selectedId)) {
      setSelectedId(prd[0]?.id ?? null)
    }
  }, [prd, selectedId])

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

  const patchProduct = useCallback(
    (partial: Partial<ProjectProduct>) => {
      if (!selected) return
      let next: ProjectProduct = { ...selected, ...partial }
      if (partial.elementTypeId != null && partial.elementTypeId !== selected.elementTypeId) {
        const allowed = typologyIdsForType(partial.elementTypeId)
        const curTy = next.typologyId
        if (!curTy || !allowed.includes(curTy)) {
          next = { ...next, typologyId: allowed[0] }
        }
      }
      updateProjectProduct(next)
    },
    [selected, updateProjectProduct, typologyIdsForType],
  )

  const elementTypeLabel = useCallback(
    (id?: string) => {
      const et = ALL_ELEMENT_TYPES.find((e) => e.id === id)
      if (!et) return '—'
      return locale === 'en' ? et.nameEn : et.nameTr
    },
    [locale],
  )

  const typologyLabel = useCallback(
    (id?: string) => {
      const ty = id ? TYPOLOGIES_BY_ID[id] : undefined
      if (!ty) return '—'
      return locale === 'en' ? ty.nameEn : ty.nameTr
    },
    [locale],
  )

  return (
    <>
    <ElementIdentityPieceCodesLikeSplit
      persistKey={`${projectId}:products`}
      listTitle={t('elementIdentity.detail.splitProductsTitle')}
      filterToolbarSearch={
        <FilterToolbarSearch
          id={`ei-products-search-${projectId}`}
          value={filterQuery}
          onValueChange={setFilterQuery}
          placeholder={t('elementIdentity.detail.productSearchPh')}
          ariaLabel={t('elementIdentity.detail.productSearchAria')}
        />
      }
      headerActions={
        <>
          <button type="button" onClick={onOpenNewProduct} className={eiSplitHeaderButtonPassive}>
            <Plus className="size-3.5 shrink-0" aria-hidden />
            {t('elementIdentity.products.new')}
          </button>
          <button type="button" onClick={onOpenBulkImport} className={eiSplitHeaderButtonPassive}>
            <Upload className="size-3.5 shrink-0" aria-hidden />
            {t('elementIdentity.products.bulk')}
          </button>
          <button type="button" onClick={() => setCatalogOpen(true)} className={eiSplitHeaderButtonPassive}>
            <BookMarked className="size-3.5 shrink-0" aria-hidden />
            {t('elementIdentity.products.addFromCatalog')}
          </button>
        </>
      }
      isFilterOpen={filterOpen}
      onFilterOpenChange={setFilterOpen}
      filterAside={
        <div>
          <ElementIdentityFilterSheetHeader
            title={t('elementIdentity.detail.productFiltersTitle')}
            subtitle={t('elementIdentity.detail.productFiltersSubtitle')}
            onClose={() => setFilterOpen(false)}
          />
          <div className="grid gap-2.5">
            <label>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {t('elementIdentity.ifc.sourceName')}
              </span>
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={t('elementIdentity.detail.productSearchPh')}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>
            <label>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {t('elementIdentity.products.source')}
              </span>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as typeof filterSource)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="all">{t('elementIdentity.detail.filterAll')}</option>
                <option value="MANUAL">MANUAL</option>
                <option value="IFC">IFC</option>
                <option value="CAD">CAD</option>
                <option value="STANDARD_LIBRARY">{t('elementIdentity.products.sourceStandard')}</option>
              </select>
            </label>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-600 dark:text-slate-300">
              {t('elementIdentity.detail.resultCount')}:{' '}
              <span className="tabular-nums font-semibold">{filtered.length}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setFilterQuery('')
                setFilterSource('all')
              }}
              className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t('elementIdentity.reset')}
            </button>
          </div>
        </div>
      }
      listBody={
        filtered.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-300/60 bg-white/30 px-3 py-8 text-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/20">
            {t('elementIdentity.products.empty')}
          </li>
        ) : (
          filtered.map((p) => {
            const bar = productSourceBar(p.source)
            return (
              <li
                key={p.id}
                className="rounded-lg border border-slate-200/50 bg-white/50 dark:border-slate-700/50 dark:bg-slate-900/25"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(p.id)
                    setDetailTab('general')
                    scrollPanelTop()
                  }}
                  aria-current={selectedId === p.id ? 'true' : undefined}
                  className={[
                    'flex w-full items-stretch gap-2.5 px-3 py-2 text-left text-sm transition',
                    selectedId === p.id
                      ? 'okan-project-list-row--active bg-sky-500/10 dark:bg-sky-400/10'
                      : 'hover:bg-white/50 dark:hover:bg-slate-900/35',
                  ].join(' ')}
                >
                  <div className="flex min-w-0 flex-1 gap-2">
                    <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/60">
                      <Package className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 flex-col gap-0.5">
                      <span className="inline-flex w-fit rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {p.source}
                      </span>
                      <p className="mt-1 font-mono font-semibold text-slate-900 dark:text-slate-50">{p.code}</p>
                      <p className="truncate text-xs text-slate-600 dark:text-slate-400">{p.name}</p>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {t('elementIdentity.products.rev')}: {p.revision}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-[min(38%,7.5rem)] max-w-[7.5rem] shrink-0 flex-col justify-center gap-1">
                    <div
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={bar.pct}
                      className={['h-1.5 w-full overflow-hidden rounded-full', bar.track].join(' ')}
                    >
                      <div
                        className={['h-full rounded-full transition-[width]', bar.fill].join(' ')}
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                    <span className={['line-clamp-2 text-[10px] font-semibold leading-tight', bar.label].join(' ')}>
                      {p.source}
                    </span>
                  </div>
                </button>
              </li>
            )
          })
        )
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-600 dark:text-slate-300">
          <p>
            {filtered.length > 0 ? (
              <>
                <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">1</span>-
                <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">
                  {filtered.length}
                </span>{' '}
                /{' '}
                <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">
                  {filtered.length}
                </span>{' '}
                {locale === 'en' ? 'results' : 'sonuç'}
              </>
            ) : (
              <span>{locale === 'en' ? 'No results' : 'Sonuç yok'}</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              if (selectedId) removeProjectProduct(selectedId)
            }}
            disabled={!selected}
            className="rounded-md border border-rose-300/70 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-40 dark:border-rose-600/60 dark:text-rose-300 dark:hover:bg-rose-950/40"
          >
            {t('elementIdentity.products.remove')}
          </button>
        </div>
      }
      rightPanelRef={rightRef}
      rightAside={
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {selected ? (
            <div className="flex h-full min-h-0 flex-col">
              <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t('elementIdentity.detail.selectedProduct')}
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
                      ['general', 'elementIdentity.detail.productSubGeneral'],
                      ['dimensions', 'elementIdentity.products.tabDimensions'],
                      ['materials', 'elementIdentity.products.tabMaterials'],
                      ['rebar', 'elementIdentity.products.tabRebar'],
                      ['drawings', 'elementIdentity.products.tabDrawings'],
                      ['activity', 'elementIdentity.products.tabActivity'],
                      ['note', 'elementIdentity.detail.productSubNote'],
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
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {t('elementIdentity.products.sectionIdentity')}
                      </h4>
                      <label className="mt-3 block sm:col-span-2">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {t('elementIdentity.products.definition')}
                        </span>
                        <textarea
                          value={selected.definition ?? ''}
                          onChange={(e) => patchProduct({ definition: e.target.value || undefined })}
                          rows={4}
                          className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </label>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('elementIdentity.products.lifecycle')}
                          </span>
                          <select
                            value={selected.lifecycleStatus ?? 'tasarim'}
                            onChange={(e) =>
                              patchProduct({ lifecycleStatus: e.target.value as ProductLifecycleStatus })
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
                              patchProduct({
                                volumeM3: v === '' ? undefined : Math.max(0, Number(v) || 0),
                              })
                            }}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm tabular-nums dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                          />
                        </label>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label className="block sm:col-span-2">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('elementIdentity.detail.code')}
                          </span>
                          <input
                            value={selected.code}
                            onChange={(e) => patchProduct({ code: e.target.value.toUpperCase() })}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                          />
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('elementIdentity.products.nameField')}
                          </span>
                          <input
                            value={selected.name}
                            onChange={(e) => patchProduct({ name: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                          />
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('elementIdentity.table.elementType')}
                          </span>
                          <select
                            value={selected.elementTypeId ?? ''}
                            onChange={(e) => patchProduct({ elementTypeId: e.target.value || undefined })}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
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
                            onChange={(e) => patchProduct({ typologyId: e.target.value || undefined })}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                          >
                            <option value="">—</option>
                            {typologyOptions.map((ty) => (
                              <option key={ty.id} value={ty.id}>
                                {locale === 'en' ? ty.nameEn : ty.nameTr}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-[10px] text-slate-500">{typologyLabel(selected.typologyId)}</p>
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('elementIdentity.products.rev')}
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={selected.revision}
                            onChange={(e) =>
                              patchProduct({ revision: Math.max(1, Number(e.target.value) || 1) })
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm tabular-nums outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('elementIdentity.products.source')}
                          </span>
                          <select
                            value={selected.source}
                            onChange={(e) => patchProduct({ source: e.target.value as ProjectProductSource })}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                          >
                            <option value="MANUAL">MANUAL</option>
                            <option value="IFC">IFC</option>
                            <option value="CAD">CAD</option>
                            <option value="STANDARD_LIBRARY">{t('elementIdentity.products.sourceStandard')}</option>
                          </select>
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {t('elementIdentity.products.statusField')}
                          </span>
                          <select
                            value={selected.status}
                            onChange={(e) =>
                              patchProduct({ status: e.target.value as 'active' | 'superseded' })
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                          >
                            <option value="active">{t('elementIdentity.products.statusActive')}</option>
                            <option value="superseded">{t('elementIdentity.products.statusSuperseded')}</option>
                          </select>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                {detailTab === 'note' && (
                  <div className="flex flex-col gap-3">
                    <label className="block">
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {t('elementIdentity.products.noteField')}
                      </span>
                      <textarea
                        value={selected.note ?? ''}
                        onChange={(e) => patchProduct({ note: e.target.value || undefined })}
                        rows={5}
                        className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {t('elementIdentity.products.createdAt')}:
                      </span>{' '}
                      {selected.createdAt ? new Date(selected.createdAt).toLocaleString(locale === 'en' ? 'en-GB' : 'tr-TR') : '—'}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {t('elementIdentity.detail.productSourceBlurb')}
                    </p>
                  </div>
                )}
                {detailTab === 'dimensions' && (
                  <ProductDimensionsTab product={selected} onPatch={patchProduct} />
                )}
                {detailTab === 'materials' && (
                  <ProductMaterialsTab product={selected} onPatch={patchProduct} />
                )}
                {detailTab === 'rebar' && (
                  <ProductRebarTab product={selected} onPatch={patchProduct} />
                )}
                {detailTab === 'drawings' && (
                  <ProductDrawingsTab product={selected} onPatch={patchProduct} />
                )}
                {detailTab === 'activity' && (
                  <ProductActivityTab product={selected} onPatch={patchProduct} />
                )}
              </div>
            </div>
          ) : (
            <p className="px-1 text-center text-xs text-slate-500 dark:text-slate-400">
              {t('elementIdentity.detail.selectProductHint')}
            </p>
          )}
        </div>
      }
    />
    <AddFromStandardCatalogDialog
      open={catalogOpen}
      projectId={projectId}
      onClose={() => setCatalogOpen(false)}
    />
    </>
  )
}
