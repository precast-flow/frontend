import { ChevronRight, LayoutList, Plus, Shapes, Tags } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { projectManagementCardsMock } from '../../data/projectManagementCardsMock'
import { ALL_ELEMENT_TYPES } from '../../elementIdentity/catalog/allElementTypes'
import { SIZE_FORMATS, sizeFormatCatalogCode } from '../../elementIdentity/catalog/sizeFormats'
import { TYPOLOGIES_BY_ID } from '../../elementIdentity/catalog/typologies'
import { resolveInstanceMark } from '../../elementIdentity/firm/nameResolver'
import type {
  ElementCategory,
  FirmCodeOverride,
  FirmNamingTemplate,
  FirmProfile,
  ProjectLike,
} from '../../elementIdentity/types'
import { useI18n } from '../../i18n/I18nProvider'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import { BulkProductImportDialog } from './BulkProductImportDialog'
import {
  eiSplitHeaderButtonPassive,
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
} from './ElementIdentityPieceCodesLikeSplit'
import { ElementIdentityProductsTab } from './ElementIdentityProductsTab'
import { NewProductDialog } from './NewProductDialog'
import { TemplateBuilderPanel } from './TemplateBuilderPanel'
import { useElementIdentity } from './elementIdentityContextValue'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'

type MainTab = 'general' | 'products' | 'code' | 'labels'
type CodeSub = 'detail' | 'typologies' | 'label'
type GeneralSection = 'summary' | 'stats' | 'note'
type LabelSub = 'overview' | 'edit'

const LABEL_LIST_PREVIEW_EL = {
  elementTypeId: 'col',
  typologyId: 'col-rect',
  dimensions: { height: 5000, sectionWidth: 400, sectionDepth: 400 },
  sequence: 1,
  revision: 0,
} as const

function tokenSequenceReadable(template: FirmNamingTemplate, t: (k: string) => string): string {
  const sep = template.separator?.trim() || '-'
  const parts = [...template.tokens]
    .filter((x) => x.enabled)
    .sort((a, b) => a.order - b.order)
    .map((x) => t(`elementIdentity.token.${x.token}`))
  return parts.join(` ${sep} `)
}

function templateListPreviewMark(
  template: FirmNamingTemplate,
  firm: FirmProfile,
  project: ProjectLike,
  overrides: FirmCodeOverride[],
): string {
  return resolveInstanceMark({
    element: LABEL_LIST_PREVIEW_EL,
    template,
    firm,
    project,
    overrides,
  }).instanceMark
}

const GROUP_ORDER: { id: ElementCategory; labelKey: string }[] = [
  { id: 'superstructure', labelKey: 'elementIdentity.code.group.superstructure' },
  { id: 'substructure', labelKey: 'elementIdentity.code.group.substructure' },
  { id: 'environmental_protection', labelKey: 'elementIdentity.code.group.environmental_protection' },
  { id: 'landscaping', labelKey: 'elementIdentity.code.group.landscaping' },
  { id: 'energy_carrier', labelKey: 'elementIdentity.code.group.energy_carrier' },
  { id: 'custom_prefab', labelKey: 'elementIdentity.code.group.custom_prefab' },
  { id: 'industrial', labelKey: 'elementIdentity.code.group.industrial' },
  { id: 'architectural', labelKey: 'elementIdentity.code.group.architectural' },
]

function productSourceBar(source: string) {
  if (source === 'IFC' || source === 'CAD') {
    return {
      pct: 72,
      track: 'bg-sky-100/90 dark:bg-sky-950/60',
      fill: 'bg-sky-500',
      label: 'text-sky-800 dark:text-sky-200',
    }
  }
  return {
    pct: 48,
    track: 'bg-emerald-100/90 dark:bg-emerald-950/50',
    fill: 'bg-emerald-500',
    label: 'text-emerald-800 dark:text-emerald-100',
  }
}

export function ElementIdentityProjectDetailPage() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const {
    projects,
    setActiveProjectId,
    projectElements,
    projectProducts,
    firmTemplates,
    setActiveTemplateId,
    activeFirm,
    activeTemplate,
    activeProject,
    overrides,
    upsertOverride,
    removeOverride,
    addTemplate,
    templates,
    updateFirm,
  } = useElementIdentity()

  const card = projectManagementCardsMock.find((x) => x.id === projectId)
  const projectLite = projects.find((p) => p.id === projectId)

  const detailKey = `element-identity:detail:${projectId ?? 'x'}`
  const [mainTab, setMainTab] = useState<MainTab>(() => {
    try {
      const raw = sessionStorage.getItem(detailKey)
      if (!raw) return 'general'
      const p = JSON.parse(raw) as { mainTab?: MainTab }
      return p.mainTab ?? 'general'
    } catch {
      return 'general'
    }
  })

  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null)
  const [codeSub, setCodeSub] = useState<CodeSub>('detail')
  const [groupFilter, setGroupFilter] = useState<Set<ElementCategory>>(
    () => new Set(GROUP_ORDER.map((g) => g.id)),
  )
  const [typologyFormats, setTypologyFormats] = useState<Record<string, string>>({})
  const [typeLabelTemplateId, setTypeLabelTemplateId] = useState<Record<string, string>>({})
  const [newProductOpen, setNewProductOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [newLabelOpen, setNewLabelOpen] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [presetId, setPresetId] = useState<string>('')
  /** Yeni şablon diyaloğu: liste üstü mü, özet sekmesindeki “etiketten” akışı mı */
  const [newLabelDialogSource, setNewLabelDialogSource] = useState<'listHeader' | 'fromLabelOverview'>('listHeader')

  const [filterOpenGeneral, setFilterOpenGeneral] = useState(false)
  const [filterOpenCode, setFilterOpenCode] = useState(false)
  const [filterOpenLabels, setFilterOpenLabels] = useState(false)

  const [generalSection, setGeneralSection] = useState<GeneralSection>('summary')
  const [labelFilterQuery, setLabelFilterQuery] = useState('')
  const [generalListQuery, setGeneralListQuery] = useState('')
  const [codeTypeQuery, setCodeTypeQuery] = useState('')
  const [labelSub, setLabelSub] = useState<LabelSub>('overview')
  const [projectDefaultTemplateId, setProjectDefaultTemplateId] = useState<string | null>(null)

  const rightGeneralRef = useRef<HTMLDivElement | null>(null)
  const rightCodeRef = useRef<HTMLDivElement | null>(null)
  const rightLabelsRef = useRef<HTMLDivElement | null>(null)

  const scrollTop = (ref: RefObject<HTMLDivElement | null>) => {
    requestAnimationFrame(() => ref.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  useEffect(() => {
    if (projectId) setActiveProjectId(projectId)
  }, [projectId, setActiveProjectId])

  useEffect(() => {
    try {
      sessionStorage.setItem(detailKey, JSON.stringify({ mainTab }))
    } catch {
      /* ignore */
    }
  }, [detailKey, mainTab])

  const els = useMemo(
    () => projectElements.filter((e) => e.projectId === projectId),
    [projectElements, projectId],
  )
  const prd = useMemo(
    () => projectProducts.filter((p) => p.projectId === projectId && p.status === 'active'),
    [projectProducts, projectId],
  )

  const stats = useMemo(() => {
    let ifc = 0
    let manual = 0
    for (const e of els) {
      if (e.sourceSystem === 'MANUAL') manual += 1
      else ifc += 1
    }
    return { ifc, manual, total: els.length }
  }, [els])

  const filteredTypes = useMemo(() => {
    const base = ALL_ELEMENT_TYPES.filter((et) => groupFilter.has(et.category)).sort((a, b) => a.order - b.order)
    const q = codeTypeQuery.trim().toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR')
    if (!q) return base
    return base.filter((et) => {
      const label = locale === 'en' ? et.nameEn : et.nameTr
      const hay = `${label} ${et.defaultCode} ${et.ifcClass}`.toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR')
      return hay.includes(q)
    })
  }, [groupFilter, codeTypeQuery, locale])

  const selectedType = filteredTypes.find((x) => x.id === selectedTypeId) ?? filteredTypes[0] ?? null

  useEffect(() => {
    if (!selectedTypeId || !filteredTypes.some((t) => t.id === selectedTypeId)) {
      setSelectedTypeId(filteredTypes[0]?.id ?? null)
    }
  }, [filteredTypes, selectedTypeId])

  const filteredTemplates = useMemo(() => {
    const q = labelFilterQuery.trim().toLocaleLowerCase('tr-TR')
    return firmTemplates.filter((tm) => !q || tm.name.toLocaleLowerCase('tr-TR').includes(q))
  }, [firmTemplates, labelFilterQuery])

  const generalSectionDefs = useMemo(() => {
    const defs = [
      ['summary', 'elementIdentity.detail.generalSummary'],
      ['stats', 'elementIdentity.detail.generalStats'],
      ['note', 'elementIdentity.detail.generalNote'],
    ] as const
    const loc = locale === 'en' ? 'en-US' : 'tr-TR'
    const q = generalListQuery.trim().toLocaleLowerCase(loc)
    if (!q) return defs
    return defs.filter(([, key]) => t(key).toLocaleLowerCase(loc).includes(q))
  }, [generalListQuery, locale, t])

  const toggleGroup = useCallback((g: ElementCategory) => {
    setGroupFilter((prev) => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g)
      else next.add(g)
      return next
    })
  }, [])

  const duplicateTemplate = useCallback(() => {
    const base = templates.find((x) => x.id === presetId) ?? activeTemplate
    const id = `tmpl-${Date.now()}`
    const now = new Date().toISOString()
    addTemplate({
      ...base,
      id,
      name: newLabelName.trim() || base.name,
      firmId: activeFirm.id,
      createdAt: now,
      updatedAt: now,
    })
    setActiveTemplateId(id)
    setNewLabelOpen(false)
    setNewLabelName('')
    setNewLabelDialogSource('listHeader')
  }, [templates, presetId, activeTemplate, addTemplate, activeFirm.id, setActiveTemplateId, newLabelName])

  useEffect(() => {
    if (!projectId) return
    try {
      const v = sessionStorage.getItem(`ei:label:proj-default:${projectId}`)
      setProjectDefaultTemplateId(v && v.length > 0 ? v : null)
    } catch {
      setProjectDefaultTemplateId(null)
    }
  }, [projectId])

  const assignTemplateAsProjectDefault = useCallback(() => {
    if (!projectId) return
    try {
      sessionStorage.setItem(`ei:label:proj-default:${projectId}`, activeTemplate.id)
    } catch {
      /* ignore */
    }
    setProjectDefaultTemplateId(activeTemplate.id)
  }, [projectId, activeTemplate.id])

  const assignTemplateAsFirmDefaultFuture = useCallback(() => {
    updateFirm({ ...activeFirm, defaultTemplateId: activeTemplate.id })
  }, [updateFirm, activeFirm, activeTemplate.id])

  const categoryLabelKey = useCallback((cat: ElementCategory) => {
    return GROUP_ORDER.find((g) => g.id === cat)?.labelKey ?? 'elementIdentity.code.filterTitle'
  }, [])

  if (!projectId || !card || !projectLite) {
    return <Navigate to="/eleman-kimlik" replace />
  }

  const mainTabs: { id: MainTab; labelKey: string }[] = [
    { id: 'general', labelKey: 'elementIdentity.detail.tabGeneral' },
    { id: 'products', labelKey: 'elementIdentity.detail.tabProducts' },
    { id: 'code', labelKey: 'elementIdentity.detail.tabCode' },
    { id: 'labels', labelKey: 'elementIdentity.detail.tabLabels' },
  ]

  const generalTitleKey =
    generalSection === 'summary'
      ? 'elementIdentity.detail.generalSummary'
      : generalSection === 'stats'
        ? 'elementIdentity.detail.generalStats'
        : 'elementIdentity.detail.generalNote'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[1.25rem]">
      <div className="px-[0.6875rem] py-1">
        <div className="mb-2 pb-2">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-2xl">
            {card.name} — {t('elementIdentity.detail.titleSuffix')}
          </h1>
        </div>
        <nav aria-label="Breadcrumb" className="mb-0">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <li>
              <Link
                to="/tanimlar"
                className="font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400"
              >
                {t('elementIdentity.detail.breadcrumbHub')}
              </Link>
            </li>
            <li className="flex items-center gap-1" aria-hidden>
              <ChevronRight className="size-3.5 shrink-0 opacity-70" />
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigate('/eleman-kimlik')}
                className="font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400"
              >
                {t('elementIdentity.detail.breadcrumbModule')}
              </button>
            </li>
            <li className="flex items-center gap-1" aria-hidden>
              <ChevronRight className="size-3.5 shrink-0 opacity-70" />
            </li>
            <li className="max-w-[40ch] truncate font-semibold text-slate-800 dark:text-slate-100" aria-current="page">
              {card.code}
            </li>
          </ol>
        </nav>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex h-full min-h-0 flex-col gap-3 px-1 sm:px-2">
          <div className="flex shrink-0 gap-1 overflow-x-auto" role="tablist">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mainTab === tab.id}
                onClick={() => setMainTab(tab.id)}
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                  mainTab === tab.id
                    ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
                    : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100'
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden text-sm">
            {mainTab === 'general' ? (
              <ElementIdentityPieceCodesLikeSplit
                persistKey={`${projectId}:general`}
                listTitle={t('elementIdentity.detail.splitGeneralTitle')}
                filterToolbarSearch={
                  <FilterToolbarSearch
                    id={`ei-general-section-search-${projectId}`}
                    value={generalListQuery}
                    onValueChange={setGeneralListQuery}
                    placeholder={t('elementIdentity.detail.generalSearchPh')}
                    ariaLabel={t('elementIdentity.detail.generalSearchAria')}
                  />
                }
                isFilterOpen={filterOpenGeneral}
                onFilterOpenChange={setFilterOpenGeneral}
                filterAside={
                  <div>
                    <ElementIdentityFilterSheetHeader
                      title={t('elementIdentity.detail.generalFiltersTitle')}
                      subtitle={t('elementIdentity.detail.generalFiltersSubtitle')}
                      onClose={() => setFilterOpenGeneral(false)}
                    />
                    <label className="mb-3 block">
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {t('elementIdentity.detail.generalSearchLabel')}
                      </span>
                      <input
                        type="search"
                        value={generalListQuery}
                        onChange={(e) => setGeneralListQuery(e.target.value)}
                        placeholder={t('elementIdentity.detail.generalSearchPh')}
                        autoComplete="off"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </label>
                    <div className="grid gap-2">
                      {generalSectionDefs.map(([id, key]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setGeneralSection(id)
                            setFilterOpenGeneral(false)
                          }}
                          className="rounded-lg border border-slate-200/70 bg-white/80 px-2 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-sky-950/40"
                        >
                          {t(key)}
                        </button>
                      ))}
                    </div>
                  </div>
                }
                listBody={
                  <>
                    {generalSectionDefs.map(([id, key]) => (
                      <li key={id} className="rounded-lg border border-slate-200/50 bg-white/50 dark:border-slate-700/50 dark:bg-slate-900/25">
                        <button
                          type="button"
                          onClick={() => setGeneralSection(id)}
                          className={[
                            'flex w-full items-stretch gap-2.5 px-3 py-2 text-left text-sm transition',
                            generalSection === id
                              ? 'okan-project-list-row--active bg-sky-500/10 dark:bg-sky-400/10'
                              : 'hover:bg-white/50 dark:hover:bg-slate-900/35',
                          ].join(' ')}
                        >
                          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/60">
                            <LayoutList className="size-4" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-50">{t(key)}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{card.code}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </>
                }
                footer={
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <span>
                      {t('elementIdentity.list.elementsCount')}:{' '}
                      <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-50">{stats.total}</span>
                    </span>
                    <span>
                      {t('elementIdentity.list.productsCount')}:{' '}
                      <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-50">{prd.length}</span>
                    </span>
                  </div>
                }
                rightPanelRef={rightGeneralRef}
                rightAside={
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {t('elementIdentity.detail.tabGeneral')}
                      </p>
                      <h3 className="mt-1.5 text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {t(generalTitleKey)}
                      </h3>
                    </header>
                    <div
                      role="tabpanel"
                      className="okan-project-tab-panel mt-3 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-left sm:px-1"
                    >
                      {generalSection === 'summary' ? (
                        <section className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t('elementIdentity.list.summaryTitle')}
                          </p>
                          <dl className="mt-3 space-y-2 text-slate-800 dark:text-slate-100">
                            <div className="flex justify-between gap-2">
                              <dt className="text-slate-500">{t('elementIdentity.detail.code')}</dt>
                              <dd className="font-mono font-semibold">{card.code}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className="text-slate-500">{t('elementIdentity.detail.customer')}</dt>
                              <dd>{card.customer}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className="text-slate-500">{t('elementIdentity.list.elementsCount')}</dt>
                              <dd className="font-semibold">{stats.total}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className="text-slate-500">{t('elementIdentity.list.productsCount')}</dt>
                              <dd className="font-semibold">{prd.length}</dd>
                            </div>
                          </dl>
                        </section>
                      ) : null}
                      {generalSection === 'stats' ? (
                        <section className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
                          <dl className="space-y-2 text-sm text-slate-800 dark:text-slate-100">
                            <div className="flex justify-between gap-2">
                              <dt className="text-slate-500">{t('elementIdentity.detail.ifcCount')}</dt>
                              <dd className="font-semibold tabular-nums">{stats.ifc}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className="text-slate-500">{t('elementIdentity.detail.manualCount')}</dt>
                              <dd className="font-semibold tabular-nums">{stats.manual}</dd>
                            </div>
                          </dl>
                        </section>
                      ) : null}
                      {generalSection === 'note' ? (
                        <section className="rounded-xl border border-slate-200/40 bg-white/40 p-4 text-xs leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                          {card.note}
                        </section>
                      ) : null}
                    </div>
                  </div>
                }
              />
            ) : null}

            {mainTab === 'products' ? (
              <ElementIdentityProductsTab
                projectId={projectId}
                onOpenNewProduct={() => setNewProductOpen(true)}
                onOpenBulkImport={() => setBulkOpen(true)}
              />
            ) : null}

            {mainTab === 'code' ? (
              <ElementIdentityPieceCodesLikeSplit
                persistKey={`${projectId}:code`}
                listTitle={t('elementIdentity.detail.splitCodeTitle')}
                filterToolbarSearch={
                  <FilterToolbarSearch
                    id={`ei-code-type-search-${projectId}`}
                    value={codeTypeQuery}
                    onValueChange={setCodeTypeQuery}
                    placeholder={t('elementIdentity.detail.codeSearchPh')}
                    ariaLabel={t('elementIdentity.detail.codeSearchAria')}
                  />
                }
                isFilterOpen={filterOpenCode}
                onFilterOpenChange={setFilterOpenCode}
                filterAside={
                  <div>
                    <ElementIdentityFilterSheetHeader
                      title={t('elementIdentity.detail.codeFiltersTitle')}
                      subtitle={t('elementIdentity.detail.codeFiltersSubtitle')}
                      onClose={() => setFilterOpenCode(false)}
                    />
                    <label className="mb-3 block">
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {t('elementIdentity.detail.codeSearchLabel')}
                      </span>
                      <input
                        type="search"
                        value={codeTypeQuery}
                        onChange={(e) => setCodeTypeQuery(e.target.value)}
                        placeholder={t('elementIdentity.detail.codeSearchPh')}
                        autoComplete="off"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </label>
                    <p className="mb-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      {t('elementIdentity.code.filterTitle')}
                    </p>
                    <div className="flex flex-col gap-2">
                      {GROUP_ORDER.map((g) => (
                        <label
                          key={g.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200/70 bg-white/80 px-2 py-2 text-[11px] dark:border-slate-600 dark:bg-slate-900/50"
                        >
                          <input type="checkbox" checked={groupFilter.has(g.id)} onChange={() => toggleGroup(g.id)} />
                          {t(g.labelKey)}
                        </label>
                      ))}
                    </div>
                    <div className="mt-3 border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => {
                          setCodeTypeQuery('')
                          setGroupFilter(new Set(GROUP_ORDER.map((x) => x.id)))
                        }}
                        className="w-full rounded-md border border-slate-300 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {t('elementIdentity.reset')}
                      </button>
                    </div>
                  </div>
                }
                listBody={
                  filteredTypes.length === 0 ? (
                    <li className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-slate-500">
                      —
                    </li>
                  ) : (
                    filteredTypes.map((et) => {
                      const bar = productSourceBar(et.category === 'superstructure' ? 'IFC' : 'MANUAL')
                      return (
                        <li
                          key={et.id}
                          className="rounded-lg border border-slate-200/50 bg-white/50 dark:border-slate-700/50 dark:bg-slate-900/25"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTypeId(et.id)
                              setCodeSub('detail')
                              scrollTop(rightCodeRef)
                            }}
                            aria-current={selectedType?.id === et.id ? 'true' : undefined}
                            className={[
                              'flex w-full items-stretch gap-2.5 px-3 py-2 text-left text-sm transition',
                              selectedType?.id === et.id
                                ? 'okan-project-list-row--active bg-sky-500/10 dark:bg-sky-400/10'
                                : 'hover:bg-white/50 dark:hover:bg-slate-900/35',
                            ].join(' ')}
                          >
                            <div className="flex min-w-0 flex-1 gap-2">
                              <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/60">
                                <Shapes className="size-4" aria-hidden />
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className="inline-flex w-fit rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                  {t(categoryLabelKey(et.category))}
                                </span>
                                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{et.nameTr}</p>
                                <p className="font-mono text-[11px] text-slate-500">{et.defaultCode}</p>
                              </div>
                            </div>
                            <div className="flex w-[min(38%,7.5rem)] max-w-[7.5rem] shrink-0 flex-col justify-center gap-1">
                              <div className={['h-1.5 w-full overflow-hidden rounded-full', bar.track].join(' ')}>
                                <div
                                  className={['h-full rounded-full', bar.fill].join(' ')}
                                  style={{ width: `${bar.pct}%` }}
                                />
                              </div>
                            </div>
                          </button>
                        </li>
                      )
                    })
                  )
                }
                footer={
                  <div className="px-1 text-[11px] text-slate-600 dark:text-slate-300">
                    {t('elementIdentity.table.elementType')}:{' '}
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                      {filteredTypes.length}
                    </span>
                  </div>
                }
                rightPanelRef={rightCodeRef}
                rightAside={
                  selectedType ? (
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                      <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {t('elementIdentity.table.elementType')}
                        </p>
                        <h3 className="mt-1.5 text-lg font-semibold text-slate-900 dark:text-slate-50">
                          {locale === 'en' ? selectedType.nameEn : selectedType.nameTr}
                        </h3>
                      </header>
                      <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
                        <div className="flex max-w-full gap-1 overflow-x-auto" role="tablist">
                          {(
                            [
                              ['detail', 'elementIdentity.code.subDetail'],
                              ['typologies', 'elementIdentity.code.subTypologies'],
                              ['label', 'elementIdentity.code.subLabel'],
                            ] as const
                          ).map(([id, key]) => (
                            <button
                              key={id}
                              type="button"
                              role="tab"
                              aria-selected={codeSub === id}
                              onClick={() => {
                                setCodeSub(id)
                                scrollTop(rightCodeRef)
                              }}
                              className={`shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                                codeSub === id
                                  ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
                                  : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100'
                              }`}
                            >
                              {t(key)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="okan-project-tab-panel mt-3 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-left sm:px-1">
                        {codeSub === 'detail' ? (
                          <div className="space-y-4 text-left">
                            <div className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                IFC
                              </p>
                              <p className="mt-1 font-mono text-sm text-slate-900 dark:text-slate-100">
                                {selectedType.ifcClass} / {selectedType.defaultIfcPredefinedType ?? '—'}
                              </p>
                              {selectedType.description ? (
                                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                  {selectedType.description}
                                </p>
                              ) : null}
                            </div>
                            <dl className="grid gap-3 rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5 sm:grid-cols-2">
                              <div>
                                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {t('elementIdentity.table.default')}
                                </dt>
                                <dd className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">
                                  {selectedType.defaultCode}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {t('elementIdentity.table.override')}
                                </dt>
                                <dd className="mt-1">
                                  {(() => {
                                    const ovRec = overrides.find(
                                      (o) =>
                                        o.firmId === activeFirm.id &&
                                        o.scope === 'element_type' &&
                                        o.refId === selectedType.id &&
                                        o.active,
                                    )
                                    return (
                                      <input
                                        type="text"
                                        value={ovRec?.customCode ?? ''}
                                        placeholder={selectedType.defaultCode}
                                        onChange={(e) => {
                                          const val = e.target.value.trim().toUpperCase()
                                          if (!val) {
                                            if (ovRec) removeOverride(ovRec.id)
                                            return
                                          }
                                          const id =
                                            ovRec?.id ??
                                            `ov-${activeFirm.id}-et-${selectedType.id}-${Date.now().toString(36)}`
                                          upsertOverride({
                                            id,
                                            firmId: activeFirm.id,
                                            scope: 'element_type',
                                            refId: selectedType.id,
                                            customCode: val,
                                            active: true,
                                            createdAt: ovRec?.createdAt ?? new Date().toISOString(),
                                            updatedAt: new Date().toISOString(),
                                          })
                                        }}
                                        className="w-full max-w-[14rem] rounded-lg border border-slate-300/80 bg-white px-2.5 py-2 font-mono text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                                      />
                                    )
                                  })()}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        ) : null}
                        {codeSub === 'typologies' ? (
                          <div className="overflow-x-auto rounded-xl border border-slate-200/40 bg-white/40 dark:border-white/10 dark:bg-white/5">
                            <table className="w-full min-w-[48rem] text-left text-xs">
                              <thead>
                                <tr className="border-b border-slate-200/50 dark:border-white/10">
                                  <th className="px-3 py-2">{t('elementIdentity.table.typology')}</th>
                                  <th className="px-3 py-2 font-mono">{t('elementIdentity.table.ifcPredef')}</th>
                                  <th className="px-3 py-2">{t('elementIdentity.table.default')}</th>
                                  <th className="px-3 py-2">{t('elementIdentity.table.override')}</th>
                                  <th className="px-3 py-2">{t('elementIdentity.code.typologyFormat')}</th>
                                  <th className="px-3 py-2 font-mono">{t('elementIdentity.code.formatCatalogCode')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedType.allowedTypologies.map((tid) => {
                                  const ty = TYPOLOGIES_BY_ID[tid]
                                  const k = `${selectedType.id}:${tid}`
                                  const fmt =
                                    typologyFormats[k] ?? ty?.defaultSizeFormatId ?? SIZE_FORMATS[0]?.id ?? ''
                                  const ovRec = overrides.find(
                                    (o) =>
                                      o.firmId === activeFirm.id &&
                                      o.scope === 'typology' &&
                                      o.refId === tid &&
                                      o.active,
                                  )
                                  const tyName = ty ? (locale === 'en' ? ty.nameEn : ty.nameTr) : tid
                                  return (
                                    <tr key={tid} className="border-b border-slate-100/80 dark:border-white/5">
                                      <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-50">
                                        {tyName}
                                      </td>
                                      <td className="px-3 py-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                        {ty?.ifcPredefinedType ?? '—'}
                                      </td>
                                      <td className="px-3 py-2 font-mono text-[11px] text-slate-700 dark:text-slate-200">
                                        {ty?.defaultCode ?? '—'}
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          type="text"
                                          value={ovRec?.customCode ?? ''}
                                          placeholder={ty?.defaultCode ?? ''}
                                          onChange={(e) => {
                                            const val = e.target.value.trim().toUpperCase()
                                            if (!val) {
                                              if (ovRec) removeOverride(ovRec.id)
                                              return
                                            }
                                            const id =
                                              ovRec?.id ??
                                              `ov-${activeFirm.id}-ty-${tid}-${Date.now().toString(36)}`
                                            upsertOverride({
                                              id,
                                              firmId: activeFirm.id,
                                              scope: 'typology',
                                              refId: tid,
                                              customCode: val,
                                              active: true,
                                              createdAt: ovRec?.createdAt ?? new Date().toISOString(),
                                              updatedAt: new Date().toISOString(),
                                            })
                                          }}
                                          className="w-full min-w-[5rem] max-w-[7rem] rounded-lg border border-slate-300/80 bg-white px-2 py-1.5 font-mono text-[11px] text-slate-900 outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <select
                                          value={fmt}
                                          onChange={(e) =>
                                            setTypologyFormats((prev) => ({ ...prev, [k]: e.target.value }))
                                          }
                                          className="w-full min-w-[10rem] max-w-xs rounded-lg border border-slate-300/80 bg-white px-2 py-1.5 text-[11px] dark:border-slate-600 dark:bg-slate-900"
                                        >
                                          {SIZE_FORMATS.map((sf) => (
                                            <option key={sf.id} value={sf.id}>
                                              {locale === 'en' ? sf.nameEn : sf.nameTr}
                                            </option>
                                          ))}
                                        </select>
                                      </td>
                                      <td className="px-3 py-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                        {sizeFormatCatalogCode(fmt)}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : null}
                        {codeSub === 'label' ? (
                          <div className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
                            <p className="text-xs text-slate-600 dark:text-slate-300">{t('elementIdentity.detail.codeLabelHint')}</p>
                            <label className="mt-3 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                              {t('elementIdentity.labels.title')}
                              <select
                                value={
                                  typeLabelTemplateId[selectedType.id] ??
                                  firmTemplates[0]?.id ??
                                  activeTemplate.id
                                }
                                onChange={(e) =>
                                  setTypeLabelTemplateId((prev) => ({
                                    ...prev,
                                    [selectedType.id]: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full max-w-md rounded-lg border border-slate-300 bg-white px-2 py-2 dark:border-slate-600 dark:bg-slate-900"
                              >
                                {firmTemplates.map((tm) => (
                                  <option key={tm.id} value={tm.id}>
                                    {tm.name}
                                    {tm.id === activeFirm.defaultTemplateId ? ` (${t('elementIdentity.labels.default')})` : ''}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-xs text-slate-500">—</p>
                  )
                }
              />
            ) : null}

            {mainTab === 'labels' ? (
              <ElementIdentityPieceCodesLikeSplit
                persistKey={`${projectId}:labels`}
                defaultSplitRatio={30}
                listTitle={t('elementIdentity.detail.splitLabelsTitle')}
                filterToolbarSearch={
                  <FilterToolbarSearch
                    id={`ei-label-template-search-${projectId}`}
                    value={labelFilterQuery}
                    onValueChange={setLabelFilterQuery}
                    placeholder={t('elementIdentity.detail.labelSearchPh')}
                    ariaLabel={t('elementIdentity.detail.labelSearchAria')}
                  />
                }
                headerActions={
                  <button
                    type="button"
                    onClick={() => {
                      setNewLabelDialogSource('listHeader')
                      setPresetId(activeTemplate.id)
                      setNewLabelName('')
                      setNewLabelOpen(true)
                    }}
                    className={eiSplitHeaderButtonPassive}
                  >
                    <Plus className="size-3.5 shrink-0" aria-hidden />
                    {t('elementIdentity.labels.new')}
                  </button>
                }
                isFilterOpen={filterOpenLabels}
                onFilterOpenChange={setFilterOpenLabels}
                filterAside={
                  <div>
                    <ElementIdentityFilterSheetHeader
                      title={t('elementIdentity.detail.labelFiltersTitle')}
                      subtitle={t('elementIdentity.detail.labelFiltersSubtitle')}
                      onClose={() => setFilterOpenLabels(false)}
                    />
                    <label>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {t('elementIdentity.ifc.sourceName')}
                      </span>
                      <input
                        type="text"
                        value={labelFilterQuery}
                        onChange={(e) => setLabelFilterQuery(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </label>
                    <div className="mt-3 border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => setLabelFilterQuery('')}
                        className="w-full rounded-md border border-slate-300 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {t('elementIdentity.reset')}
                      </button>
                    </div>
                  </div>
                }
                listBody={
                  filteredTemplates.map((tm) => {
                    const previewLine = templateListPreviewMark(tm, activeFirm, activeProject, overrides)
                    return (
                      <li
                        key={tm.id}
                        className="rounded-lg border border-slate-200/50 bg-white/50 dark:border-slate-700/50 dark:bg-slate-900/25"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTemplateId(tm.id)
                            setLabelSub('overview')
                            scrollTop(rightLabelsRef)
                          }}
                          aria-current={activeTemplate.id === tm.id ? 'true' : undefined}
                          className={[
                            'flex w-full flex-col gap-1.5 px-3 py-2 text-left text-sm transition',
                            activeTemplate.id === tm.id
                              ? 'okan-project-list-row--active bg-sky-500/10 dark:bg-sky-400/10'
                              : 'hover:bg-white/50 dark:hover:bg-slate-900/35',
                          ].join(' ')}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/60">
                              <Tags className="size-4" aria-hidden />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900 dark:text-slate-50">{tm.name}</p>
                              <div className="mt-0.5 flex flex-wrap gap-1">
                                {tm.id === activeFirm.defaultTemplateId ? (
                                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                                    {t('elementIdentity.labels.default')}
                                  </span>
                                ) : null}
                                {projectId && tm.id === projectDefaultTemplateId ? (
                                  <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800 dark:text-sky-300">
                                    {t('elementIdentity.labels.projectDefaultBadge')}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <p className="truncate pl-10 font-mono text-[10px] text-slate-600 dark:text-slate-400" title={previewLine}>
                            {previewLine}
                          </p>
                        </button>
                      </li>
                    )
                  })
                }
                footer={
                  <div className="px-1 text-[11px] text-slate-600 dark:text-slate-300">
                    {t('elementIdentity.labels.title')}:{' '}
                    <span className="font-semibold tabular-nums">{filteredTemplates.length}</span>
                  </div>
                }
                rightPanelRef={rightLabelsRef}
                rightAside={
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {t('elementIdentity.labels.title')}
                      </p>
                      <h3 className="mt-1.5 text-lg font-semibold text-slate-900 dark:text-slate-50">{activeTemplate.name}</h3>
                    </header>
                    <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
                      <div className="flex max-w-full gap-1 overflow-x-auto" role="tablist">
                        {(
                          [
                            ['overview', 'elementIdentity.labels.tabOverview'],
                            ['edit', 'elementIdentity.labels.tabEdit'],
                          ] as const
                        ).map(([id, key]) => (
                          <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={labelSub === id}
                            onClick={() => {
                              setLabelSub(id)
                              scrollTop(rightLabelsRef)
                            }}
                            className={`shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                              labelSub === id
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
                      {labelSub === 'overview' ? (
                        <div className="flex flex-col items-center gap-8 px-1 py-1">
                          <div className="flex w-full max-w-sm flex-col gap-2">
                            <button
                              type="button"
                              onClick={assignTemplateAsProjectDefault}
                              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                            >
                              {t('elementIdentity.labels.setProjectDefault')}
                            </button>
                            <button
                              type="button"
                              onClick={assignTemplateAsFirmDefaultFuture}
                              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                            >
                              {t('elementIdentity.labels.setFirmAllFuture')}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNewLabelDialogSource('fromLabelOverview')
                                setPresetId(activeTemplate.id)
                                setNewLabelName('')
                                setNewLabelOpen(true)
                              }}
                              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                            >
                              {t('elementIdentity.labels.createFromLabel')}
                            </button>
                          </div>
                          <div className="w-full max-w-lg space-y-2 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              {t('elementIdentity.labels.codeStructureTitle')}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {t('elementIdentity.labels.codeStructureHint')}
                            </p>
                            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                              {tokenSequenceReadable(activeTemplate, t)}
                            </p>
                            <p className="pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              {t('elementIdentity.livePreview.title')}
                            </p>
                            <p className="break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">
                              {templateListPreviewMark(activeTemplate, activeFirm, activeProject, overrides)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="min-h-0 flex-1">
                          <TemplateBuilderPanel layout="embedded" />
                        </div>
                      )}
                    </div>
                  </div>
                }
              />
            ) : null}
          </div>
        </div>
      </div>

      <NewProductDialog open={newProductOpen} projectId={projectId} onClose={() => setNewProductOpen(false)} />
      <BulkProductImportDialog open={bulkOpen} projectId={projectId} onClose={() => setBulkOpen(false)} />

      {newLabelOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
            <h3 className="text-sm font-semibold">
              {newLabelDialogSource === 'fromLabelOverview'
                ? t('elementIdentity.labels.createFromLabel')
                : t('elementIdentity.labels.new')}
            </h3>
            <label className="mt-2 block text-xs">
              {t('elementIdentity.labels.name')}
              <input
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
            <label className="mt-2 block text-xs">
              {t('elementIdentity.labels.startFrom')}
              <select
                value={presetId}
                onChange={(e) => setPresetId(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 dark:border-slate-600 dark:bg-slate-800"
              >
                {firmTemplates.map((tm) => (
                  <option key={tm.id} value={tm.id}>
                    {tm.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewLabelOpen(false)
                  setNewLabelDialogSource('listHeader')
                }}
                className="text-xs font-semibold text-slate-600"
              >
                {t('elementIdentity.cancel')}
              </button>
              <button
                type="button"
                onClick={duplicateTemplate}
                className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white"
              >
                {t('elementIdentity.save')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
