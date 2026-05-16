import { ArrowRightLeft, BookMarked, Package, Plus, Upload } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ALL_ELEMENT_TYPES } from '../../elementIdentity/catalog/allElementTypes'
import { TYPOLOGIES_BY_ID } from '../../elementIdentity/catalog/typologies'
import type { ProductLifecycleStatus, ProjectProduct, ProjectProductSource } from '../../elementIdentity/types'
import { useI18n } from '../../i18n/I18nProvider'
import { useThemeMode } from '../../theme/ThemeProvider'
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
import { ProductTransferDialog } from './ProductTransferDialog'
import { ProductTransferHistoryPanel } from './ProductTransferHistoryPanel'
import type { ProductTransferLogEntry } from './productTransferTypes'
import { useElementIdentity } from './elementIdentityContextValue'
import { projectManagementCardsMock } from '../../data/projectManagementCardsMock'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import { ElementIdentitySplitListPaginationFooter } from './ElementIdentitySplitListPaginationFooter'
import { useElementIdentitySplitListPagination } from './useElementIdentitySplitListPagination'
import { eiSplitListRowShell, eiTabPill } from './elementIdentitySplitUi'

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
  neutralChrome?: boolean
}

export function ElementIdentityProductsTab({
  projectId,
  onOpenNewProduct,
  onOpenBulkImport,
  neutralChrome = false,
}: ElementIdentityProductsTabProps) {
  const { t, locale } = useI18n()
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const { projectProducts, removeProjectProduct, updateProjectProduct } = useElementIdentity()

  const [transferOpen, setTransferOpen] = useState(false)
  const [transferLogs, setTransferLogs] = useState<ProductTransferLogEntry[]>([])

  const sourceProjectLabel = useMemo(() => {
    const card = projectManagementCardsMock.find((c) => c.id === projectId)
    if (card) return `${card.code} · ${card.name}`
    return projectId
  }, [projectId])

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
  const listRef = useRef<HTMLUListElement | null>(null)

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

  const listPagination = useElementIdentitySplitListPagination(
    filtered,
    `${filterQuery}:${filterSource}`,
  )
  const { visible: visibleProducts } = listPagination

  const scrollListTop = () => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

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

  const headerBtnPrimary = gl
    ? ['glass-btn', 'primary', 'small', 'inline-flex', 'items-center', 'gap-1.5', 'shrink-0'].join(' ')
    : 'inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
  const headerBtnSecondary = gl
    ? ['glass-btn', 'secondary', 'small', 'inline-flex', 'items-center', 'gap-1.5', 'shrink-0'].join(' ')
    : eiSplitHeaderButtonPassive
  const filterLabelCls = gl
    ? 'text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80'
    : 'text-[11px] font-medium text-slate-600 dark:text-slate-300'
  const filterInputCls = gl
    ? 'glass-input mt-2 w-full text-xs'
    : 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'
  const sectionHeading = gl
    ? 'text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
    : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'

  return (
    <>
    <ElementIdentityPieceCodesLikeSplit
      persistKey={`${projectId}:products`}
      listRef={listRef}
      visualVariant="project-mgmt"
      neutralChrome={neutralChrome}
      embedded
      fillParentHeight
      listIndentWhenFilterOpen="18.5rem"
      listTitle={t('elementIdentity.detail.splitProductsTitle')}
      filterToolbarSearch={
        <FilterToolbarSearch
          id={`ei-products-search-${projectId}`}
          value={filterQuery}
          onValueChange={setFilterQuery}
          placeholder={t('elementIdentity.detail.productSearchPh')}
          ariaLabel={t('elementIdentity.detail.productSearchAria')}
          className={['min-w-0 sm:max-w-[14rem]', gl ? 'project-mgmt-toolbar-search' : ''].filter(Boolean).join(' ')}
          inputClassName={gl ? 'glass-input' : ''}
        />
      }
      headerActions={
        <>
          <button type="button" onClick={onOpenNewProduct} className={headerBtnPrimary}>
            <Plus className="size-3.5 shrink-0" aria-hidden />
            {t('elementIdentity.products.new')}
          </button>
          <button type="button" onClick={onOpenBulkImport} className={headerBtnSecondary}>
            <Upload className="size-3.5 shrink-0" aria-hidden />
            {t('elementIdentity.products.bulk')}
          </button>
          <button type="button" onClick={() => setCatalogOpen(true)} className={headerBtnSecondary}>
            <BookMarked className="size-3.5 shrink-0" aria-hidden />
            {t('elementIdentity.products.addFromCatalog')}
          </button>
          <button
            type="button"
            onClick={() => setTransferOpen(true)}
            disabled={prd.length === 0}
            className={headerBtnSecondary}
            title={prd.length === 0 ? t('elementIdentity.transfer.emptyDisabled') : undefined}
          >
            <ArrowRightLeft className="size-3.5 shrink-0" aria-hidden />
            {t('elementIdentity.transfer.open')}
          </button>
        </>
      }
      isFilterOpen={filterOpen}
      onFilterOpenChange={setFilterOpen}
      filterAside={
        <div>
          <ProductTransferHistoryPanel logs={transferLogs} glass={gl} />
          <div className={transferLogs.length > 0 ? 'mt-3' : undefined}>
          <ElementIdentityFilterSheetHeader
            glass={gl}
            title={t('elementIdentity.detail.productFiltersTitle')}
            subtitle={t('elementIdentity.detail.productFiltersSubtitle')}
            onClose={() => setFilterOpen(false)}
          />
          <div className="grid gap-2.5">
            <label>
              <span className={filterLabelCls}>{t('elementIdentity.ifc.sourceName')}</span>
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={t('elementIdentity.detail.productSearchPh')}
                className={filterInputCls}
              />
            </label>
            <label>
              <span className={filterLabelCls}>{t('elementIdentity.products.source')}</span>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as typeof filterSource)}
                className={filterInputCls}
              >
                <option value="all">{t('elementIdentity.detail.filterAll')}</option>
                <option value="MANUAL">MANUAL</option>
                <option value="IFC">IFC</option>
                <option value="CAD">CAD</option>
                <option value="STANDARD_LIBRARY">{t('elementIdentity.products.sourceStandard')}</option>
              </select>
            </label>
          </div>
          <div
            className={`mt-3 flex items-center justify-between border-t pt-2 ${gl ? 'border-black/10 dark:border-white/10' : 'border-slate-200/60 dark:border-slate-700/60'}`}
          >
            <span className={`text-[11px] ${gl ? 'text-black/60 dark:text-white/70' : 'text-slate-600 dark:text-slate-300'}`}>
              {t('elementIdentity.detail.resultCount')}:{' '}
              <span className={`tabular-nums font-semibold ${gl ? 'text-black dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                {filtered.length}
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setFilterQuery('')
                setFilterSource('all')
              }}
              className={
                gl
                  ? ['glass-btn', 'secondary', 'small'].join(' ')
                  : 'rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'
              }
            >
              {t('elementIdentity.reset')}
            </button>
          </div>
          </div>
        </div>
      }
                listBody={
                  listPagination.totalCount === 0 ? (
          <li
            className={
              gl
                ? 'list-none rounded-xl border border-dashed border-black/20 bg-white/25 px-3 py-8 text-center text-xs text-black/60 dark:border-white/15 dark:bg-white/5 dark:text-white/65'
                : 'list-none rounded-lg border border-dashed border-slate-300/60 bg-white/30 px-3 py-8 text-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/20'
            }
          >
            {t('elementIdentity.products.empty')}
          </li>
                  ) : (
                    visibleProducts.map((p) => {
            const bar = productSourceBar(p.source)
            const rowActive = selectedId === p.id
            return (
              <li key={p.id}>
                <div className={eiSplitListRowShell(rowActive)}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(p.id)
                    setDetailTab('general')
                    scrollPanelTop()
                  }}
                  aria-current={rowActive ? 'true' : undefined}
                  className="flex min-w-0 w-full flex-1 items-stretch gap-2.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
                >
                  <div className="flex min-w-0 flex-1 gap-2">
                    <span
                      className={
                        gl
                          ? 'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-black/8 text-black ring-1 ring-inset ring-black/12 dark:bg-white/10 dark:text-white dark:ring-white/15'
                          : 'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/60'
                      }
                    >
                      <Package className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 flex-col gap-0.5">
                      <span
                        className={
                          gl
                            ? 'inline-flex w-fit rounded-md bg-black/8 px-1.5 py-0.5 text-[10px] font-semibold text-black dark:bg-white/12 dark:text-white'
                            : 'inline-flex w-fit rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }
                      >
                        {p.source}
                      </span>
                      <p
                        className={`mt-1 font-mono font-semibold ${gl ? 'text-black dark:text-white' : 'text-slate-900 dark:text-slate-50'}`}
                      >
                        {p.code}
                      </p>
                      <p className={`truncate text-xs ${gl ? 'text-black/65 dark:text-white/70' : 'text-slate-600 dark:text-slate-400'}`}>
                        {p.name}
                      </p>
                      <p
                        className={`text-[11px] font-semibold ${gl ? 'text-black/55 dark:text-white/60' : 'text-slate-500 dark:text-slate-400'}`}
                      >
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
                </div>
              </li>
            )
          })
        )
      }
      footer={
        <ElementIdentitySplitListPaginationFooter
          gl={gl}
          locale={locale}
          pageStart={listPagination.pageStart}
          pageEnd={listPagination.pageEnd}
          totalCount={listPagination.totalCount}
          safePage={listPagination.safePage}
          pageCount={listPagination.pageCount}
          onPrev={() => {
            listPagination.setPage((p) => Math.max(1, p - 1))
            scrollListTop()
          }}
          onNext={() => {
            listPagination.setPage((p) => Math.min(listPagination.pageCount, p + 1))
            scrollListTop()
          }}
          trailing={
            <button
              type="button"
              onClick={() => {
                if (selectedId) removeProjectProduct(selectedId)
              }}
              disabled={!selected}
              className={
                gl
                  ? ['glass-btn', 'secondary', 'small', 'text-rose-700', 'dark:text-rose-300', 'disabled:opacity-40'].join(' ')
                  : 'rounded-md border border-rose-300/70 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-40 dark:border-rose-600/60 dark:text-rose-300 dark:hover:bg-rose-950/40'
              }
            >
              {t('elementIdentity.products.remove')}
            </button>
          }
        />
      }
      rightPanelRef={rightRef}
      rightAside={
        <div className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
          {selected ? (
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden sm:gap-4">
              <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                <p
                  className={
                    gl
                      ? 'text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65'
                      : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                  }
                >
                  {t('elementIdentity.detail.selectedProduct')}
                </p>
                <h3
                  className={
                    gl
                      ? 'mt-1.5 font-mono text-xl font-semibold leading-tight text-black dark:text-white'
                      : 'mt-1.5 font-mono text-xl font-semibold text-slate-900 dark:text-slate-50'
                  }
                >
                  {selected.code}
                </h3>
                <p
                  className={
                    gl
                      ? 'mt-1 text-sm leading-snug text-black/75 dark:text-white/80'
                      : 'mt-1 text-sm text-slate-600 dark:text-slate-300'
                  }
                >
                  {selected.name}
                </p>
              </header>
              <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
                <div className="flex max-w-full gap-1 overflow-x-auto" role="tablist" aria-label={t('elementIdentity.detail.tabProducts')}>
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
                      className={eiTabPill(detailTab === id)}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>
              <div
                role="tabpanel"
                className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden text-left"
              >
                {detailTab === 'general' && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className={sectionHeading}>{t('elementIdentity.products.sectionIdentity')}</h4>
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
            <p className={`px-1 text-left text-xs ${gl ? 'text-black/60 dark:text-white/65' : 'text-slate-500 dark:text-slate-400'}`}>
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
    <ProductTransferDialog
      open={transferOpen}
      sourceProjectId={projectId}
      sourceProjectLabel={sourceProjectLabel}
      activeProducts={prd}
      onClose={() => setTransferOpen(false)}
      onTransferred={(log) => {
        setTransferLogs((prev) => [log, ...prev])
        setSelectedId((cur) => (cur && log.productIds.includes(cur) ? null : cur))
      }}
    />
    </>
  )
}
