import { ChevronRight, LayoutList, Plus, Shapes, Tags } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { activeModuleIdFromPathname } from '../../data/navigation'
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
import { useThemeMode } from '../../theme/ThemeProvider'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'
import { BulkProductImportDialog } from './BulkProductImportDialog'
import {
  eiSplitHeaderButtonPassive,
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
} from './ElementIdentityPieceCodesLikeSplit'
import { ElementIdentitySplitListPaginationFooter } from './ElementIdentitySplitListPaginationFooter'
import { useElementIdentitySplitListPagination } from './useElementIdentitySplitListPagination'
import { eiSplitListRowShell, eiTabPill } from './elementIdentitySplitUi'
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
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const location = useLocation()
  const neutralShell = activeModuleIdFromPathname(location.pathname) === 'element-identity'
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
  const codeListRef = useRef<HTMLUListElement | null>(null)
  const labelsListRef = useRef<HTMLUListElement | null>(null)

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

  const codeListResetKey = `${codeTypeQuery}:${[...groupFilter].sort().join(',')}`
  const codeListPagination = useElementIdentitySplitListPagination(filteredTypes, codeListResetKey)
  const { visible: visibleTypes } = codeListPagination

  const scrollCodeListTop = () => {
    requestAnimationFrame(() => codeListRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

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

  const labelListPagination = useElementIdentitySplitListPagination(filteredTemplates, labelFilterQuery)
  const { visible: visibleLabelTemplates } = labelListPagination

  const scrollLabelsListTop = () => {
    requestAnimationFrame(() => labelsListRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const headerBtnCls = eiSplitHeaderButtonPassive

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

  const detailSectionCard = gl
    ? 'rounded-xl border border-black/10 bg-white/45 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.48)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none'
    : 'rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5'
  const infoDt = gl ? 'text-[11px] font-medium text-black/50 dark:text-white/55' : 'text-xs text-slate-500 dark:text-slate-400'
  const infoDd = gl ? 'font-semibold text-black dark:text-slate-50' : 'font-medium text-slate-900 dark:text-slate-50'

  const crumbMuted = gl ? 'text-black/60 dark:text-white/65' : 'text-slate-500 dark:text-slate-400'
  const crumbLink = gl
    ? 'font-medium text-black/75 underline-offset-2 transition hover:text-black hover:underline dark:text-white/75 dark:hover:text-white'
    : 'font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400'
  const crumbCurrent = gl
    ? 'max-w-[40ch] truncate font-semibold text-black dark:text-white'
    : 'max-w-[40ch] truncate font-semibold text-slate-800 dark:text-slate-100'
  const mainTabUsesSplit = mainTab === 'general' || mainTab === 'products' || mainTab === 'code' || mainTab === 'labels'

  return (
    <div
      className="project-mgmt-glass-light flex min-h-0 flex-1 flex-col gap-0 overflow-hidden rounded-3xl"
      data-neutral-shell={neutralShell ? 'true' : undefined}
    >
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-1">
      <div className="px-[0.6875rem] pt-0 pb-0.5">
        <div className="mb-1.5 pb-1.5">
          <h1
            className={`text-xl font-semibold tracking-tight md:text-2xl ${gl ? 'text-black dark:text-white' : 'text-gray-900 dark:text-gray-50'}`}
          >
            {card.name} — {t('elementIdentity.detail.titleSuffix')}
          </h1>
        </div>
        <nav aria-label="Breadcrumb" className="mb-0">
          <ol className={`flex flex-wrap items-center gap-1 text-xs ${crumbMuted}`}>
            <li>
              <Link to="/tanimlar" className={crumbLink}>
                {t('elementIdentity.detail.breadcrumbHub')}
              </Link>
            </li>
            <li className="flex items-center gap-1" aria-hidden>
              <ChevronRight className="size-3.5 shrink-0 opacity-70" />
            </li>
            <li>
              <button type="button" onClick={() => navigate('/eleman-kimlik')} className={crumbLink}>
                {t('elementIdentity.detail.breadcrumbModule')}
              </button>
            </li>
            <li className="flex items-center gap-1" aria-hidden>
              <ChevronRight className="size-3.5 shrink-0 opacity-70" />
            </li>
            <li className={crumbCurrent} aria-current="page">
              {card.code}
            </li>
          </ol>
        </nav>
      </div>

      <div
        className={[
          'min-h-0 overflow-hidden',
          gl
            ? 'flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-3xl bg-transparent p-1 md:p-1.5'
            : 'rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
            gl ? 'glass-card glass-card--static project-mgmt-split-panel gap-3' : 'gap-3 px-1 sm:px-2',
          ].join(' ')}
        >
          <div
            className="flex shrink-0 gap-1 overflow-x-auto px-0.5 sm:px-0"
            role="tablist"
            aria-label="Eleman kimlik detay sekmeleri"
          >
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mainTab === tab.id}
                onClick={() => setMainTab(tab.id)}
                className={eiTabPill(mainTab === tab.id)}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          <div
            className={`min-h-0 flex-1 overflow-x-hidden text-sm ${mainTabUsesSplit ? 'flex min-h-0 flex-col overflow-hidden' : 'overflow-y-auto overscroll-y-contain'} ${gl ? 'px-0.5 sm:px-1' : ''}`}
          >
            {mainTab === 'general' ? (
              <ElementIdentityPieceCodesLikeSplit
                persistKey={`${projectId}:general`}
                visualVariant="project-mgmt"
                neutralChrome={neutralShell}
                embedded
                fillParentHeight
                listIndentWhenFilterOpen="18.5rem"
                listTitle={t('elementIdentity.detail.splitGeneralTitle')}
                filterToolbarSearch={
                  <FilterToolbarSearch
                    id={`ei-general-section-search-${projectId}`}
                    value={generalListQuery}
                    onValueChange={setGeneralListQuery}
                    placeholder={t('elementIdentity.detail.generalSearchPh')}
                    ariaLabel={t('elementIdentity.detail.generalSearchAria')}
                    className={['min-w-0 sm:max-w-[14rem]', gl ? 'project-mgmt-toolbar-search' : ''].filter(Boolean).join(' ')}
                    inputClassName={gl ? 'glass-input' : ''}
                  />
                }
                isFilterOpen={filterOpenGeneral}
                onFilterOpenChange={setFilterOpenGeneral}
                filterAside={
                  <div>
                    <ElementIdentityFilterSheetHeader
                      glass={gl}
                      title={t('elementIdentity.detail.generalFiltersTitle')}
                      subtitle={t('elementIdentity.detail.generalFiltersSubtitle')}
                      onClose={() => setFilterOpenGeneral(false)}
                    />
                    <label className="mb-3 block">
                      <span
                        className={
                          gl
                            ? 'text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80'
                            : 'text-[11px] font-medium text-slate-600 dark:text-slate-300'
                        }
                      >
                        {t('elementIdentity.detail.generalSearchLabel')}
                      </span>
                      <input
                        type="search"
                        value={generalListQuery}
                        onChange={(e) => setGeneralListQuery(e.target.value)}
                        placeholder={t('elementIdentity.detail.generalSearchPh')}
                        autoComplete="off"
                        className={
                          gl
                            ? 'glass-input mt-2 w-full'
                            : 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'
                        }
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
                            scrollTop(rightGeneralRef)
                          }}
                          className={`${eiSplitHeaderButtonPassive} w-full justify-start px-2 py-2 text-left text-xs`}
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
                      <li key={id}>
                        <div className={eiSplitListRowShell(generalSection === id)}>
                        <button
                          type="button"
                          onClick={() => {
                            setGeneralSection(id)
                            scrollTop(rightGeneralRef)
                          }}
                          aria-current={generalSection === id ? 'true' : undefined}
                          className="flex min-w-0 w-full flex-1 items-stretch gap-2.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
                        >
                          <span
                            className={
                              gl
                                ? 'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-black/8 text-black ring-1 ring-inset ring-black/12 dark:bg-white/10 dark:text-white dark:ring-white/15'
                                : 'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/60'
                            }
                          >
                            <LayoutList className="size-4" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className={
                                gl
                                  ? 'font-semibold text-black dark:text-white'
                                  : 'font-semibold text-slate-900 dark:text-slate-50'
                              }
                            >
                              {t(key)}
                            </p>
                            <p
                              className={
                                gl ? 'text-xs text-black/65 dark:text-white/70' : 'text-xs text-slate-600 dark:text-slate-400'
                              }
                            >
                              {card.code}
                            </p>
                          </div>
                        </button>
                        </div>
                      </li>
                    ))}
                  </>
                }
                footer={
                  gl ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-black/75 dark:text-white/80">
                      <span>
                        {t('elementIdentity.list.elementsCount')}:{' '}
                        <span className="font-semibold tabular-nums text-black dark:text-white">{stats.total}</span>
                      </span>
                      <span>
                        {t('elementIdentity.list.productsCount')}:{' '}
                        <span className="font-semibold tabular-nums text-black dark:text-white">{prd.length}</span>
                      </span>
                    </div>
                  ) : (
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
                  )
                }
                rightPanelRef={rightGeneralRef}
                rightAside={
                  <div className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
                    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden sm:gap-4">
                      <header
                        className={
                          gl
                            ? 'shrink-0 border-b border-black/12 pb-3 text-left dark:border-white/10'
                            : 'shrink-0 border-b border-slate-200/25 pb-3 text-left dark:border-white/10'
                        }
                      >
                        <p
                          className={
                            gl
                              ? 'text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65'
                              : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                          }
                        >
                          {t('elementIdentity.detail.tabGeneral')}
                        </p>
                        <h3
                          className={
                            gl
                              ? 'mt-1.5 text-xl font-semibold leading-tight text-black dark:text-white'
                              : 'mt-1.5 text-lg font-semibold text-slate-900 dark:text-slate-50'
                          }
                        >
                          {t(generalTitleKey)}
                        </h3>
                        <p
                          className={
                            gl
                              ? 'mt-1 text-sm leading-snug text-black/75 dark:text-white/80'
                              : 'mt-1 text-sm leading-snug text-slate-600 dark:text-slate-300'
                          }
                        >
                          {card.name} · {card.customer}
                        </p>
                      </header>
                      <div
                        role="tabpanel"
                        className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden text-left"
                      >
                      {generalSection === 'summary' ? (
                        <section className={detailSectionCard}>
                          <p
                            className={
                              gl
                                ? 'text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                : 'text-xs font-semibold uppercase tracking-wide text-slate-500'
                            }
                          >
                            {t('elementIdentity.list.summaryTitle')}
                          </p>
                          <dl className="mt-3 space-y-2">
                            <div className="flex justify-between gap-2">
                              <dt className={infoDt}>{t('elementIdentity.detail.code')}</dt>
                              <dd className={`font-mono ${infoDd}`}>{card.code}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className={infoDt}>{t('elementIdentity.detail.customer')}</dt>
                              <dd className={infoDd}>{card.customer}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className={infoDt}>{t('elementIdentity.list.elementsCount')}</dt>
                              <dd className={`tabular-nums ${infoDd}`}>{stats.total}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className={infoDt}>{t('elementIdentity.list.productsCount')}</dt>
                              <dd className={`tabular-nums ${infoDd}`}>{prd.length}</dd>
                            </div>
                          </dl>
                        </section>
                      ) : null}
                      {generalSection === 'stats' ? (
                        <section className={detailSectionCard}>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between gap-2">
                              <dt className={infoDt}>{t('elementIdentity.detail.ifcCount')}</dt>
                              <dd className={`tabular-nums ${infoDd}`}>{stats.ifc}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className={infoDt}>{t('elementIdentity.detail.manualCount')}</dt>
                              <dd className={`tabular-nums ${infoDd}`}>{stats.manual}</dd>
                            </div>
                          </dl>
                        </section>
                      ) : null}
                      {generalSection === 'note' ? (
                        <section
                          className={`${detailSectionCard} text-xs leading-relaxed ${
                            gl ? 'text-black/75 dark:text-white/80' : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {card.note}
                        </section>
                      ) : null}
                      </div>
                    </div>
                  </div>
                }
              />
            ) : null}

            {mainTab === 'products' ? (
              <ElementIdentityProductsTab
                projectId={projectId}
                neutralChrome={neutralShell}
                onOpenNewProduct={() => setNewProductOpen(true)}
                onOpenBulkImport={() => setBulkOpen(true)}
              />
            ) : null}

            {mainTab === 'code' ? (
              <ElementIdentityPieceCodesLikeSplit
                persistKey={`${projectId}:code`}
                listRef={codeListRef}
                visualVariant="project-mgmt"
                neutralChrome={neutralShell}
                embedded
                fillParentHeight
                listIndentWhenFilterOpen="18.5rem"
                listTitle={t('elementIdentity.detail.splitCodeTitle')}
                filterToolbarSearch={
                  <FilterToolbarSearch
                    id={`ei-code-type-search-${projectId}`}
                    value={codeTypeQuery}
                    onValueChange={setCodeTypeQuery}
                    placeholder={t('elementIdentity.detail.codeSearchPh')}
                    ariaLabel={t('elementIdentity.detail.codeSearchAria')}
                    className={['min-w-0 sm:max-w-[14rem]', gl ? 'project-mgmt-toolbar-search' : ''].filter(Boolean).join(' ')}
                    inputClassName={gl ? 'glass-input' : ''}
                  />
                }
                isFilterOpen={filterOpenCode}
                onFilterOpenChange={setFilterOpenCode}
                filterAside={
                  <div>
                    <ElementIdentityFilterSheetHeader
                      glass={gl}
                      title={t('elementIdentity.detail.codeFiltersTitle')}
                      subtitle={t('elementIdentity.detail.codeFiltersSubtitle')}
                      onClose={() => setFilterOpenCode(false)}
                    />
                    <label className="mb-3 block">
                      <span
                        className={
                          gl
                            ? 'text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80'
                            : 'text-[11px] font-medium text-slate-600 dark:text-slate-300'
                        }
                      >
                        {t('elementIdentity.detail.codeSearchLabel')}
                      </span>
                      <input
                        type="search"
                        value={codeTypeQuery}
                        onChange={(e) => setCodeTypeQuery(e.target.value)}
                        placeholder={t('elementIdentity.detail.codeSearchPh')}
                        autoComplete="off"
                        className={
                          gl
                            ? 'glass-input mt-2 w-full'
                            : 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'
                        }
                      />
                    </label>
                    <p
                      className={
                        gl
                          ? 'mb-2 text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80'
                          : 'mb-2 text-[11px] font-medium text-slate-600 dark:text-slate-300'
                      }
                    >
                      {t('elementIdentity.code.filterTitle')}
                    </p>
                    <div className="flex flex-col gap-2">
                      {GROUP_ORDER.map((g) => (
                        <label
                          key={g.id}
                          className={
                            gl
                              ? 'flex cursor-pointer items-center gap-2 rounded-lg border border-black/12 bg-white/45 px-2 py-2 text-[11px] text-black dark:border-white/12 dark:bg-white/[0.06] dark:text-white'
                              : 'flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200/70 bg-white/80 px-2 py-2 text-[11px] dark:border-slate-600 dark:bg-slate-900/50'
                          }
                        >
                          <input type="checkbox" checked={groupFilter.has(g.id)} onChange={() => toggleGroup(g.id)} />
                          {t(g.labelKey)}
                        </label>
                      ))}
                    </div>
                    <div
                      className={`mt-3 border-t pt-2 ${gl ? 'border-black/10 dark:border-white/10' : 'border-slate-200/60 dark:border-slate-700/60'}`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setCodeTypeQuery('')
                          setGroupFilter(new Set(GROUP_ORDER.map((x) => x.id)))
                        }}
                        className={`${eiSplitHeaderButtonPassive} w-full justify-center py-1.5 text-[11px]`}
                      >
                        {t('elementIdentity.reset')}
                      </button>
                    </div>
                  </div>
                }
                listBody={
                  codeListPagination.totalCount === 0 ? (
                    <li
                      className={
                        gl
                          ? 'list-none rounded-xl border border-dashed border-black/20 bg-white/25 px-3 py-8 text-center text-xs text-black/60 dark:border-white/15 dark:bg-white/5 dark:text-white/65'
                          : 'list-none rounded-lg border border-dashed border-slate-300/60 px-3 py-6 text-center text-xs text-slate-500'
                      }
                    >
                      —
                    </li>
                  ) : (
                    visibleTypes.map((et) => {
                      const bar = productSourceBar(et.category === 'superstructure' ? 'IFC' : 'MANUAL')
                      return (
                        <li key={et.id}>
                          <div className={eiSplitListRowShell(selectedType?.id === et.id)}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTypeId(et.id)
                              setCodeSub('detail')
                              scrollTop(rightCodeRef)
                            }}
                            aria-current={selectedType?.id === et.id ? 'true' : undefined}
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
                                <Shapes className="size-4" aria-hidden />
                              </span>
                              <div className="min-w-0 flex-1">
                                <span
                                  className={
                                    gl
                                      ? 'inline-flex w-fit rounded-md bg-black/8 px-1.5 py-0.5 text-[10px] font-semibold text-black dark:bg-white/12 dark:text-white'
                                      : 'inline-flex w-fit rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                                  }
                                >
                                  {t(categoryLabelKey(et.category))}
                                </span>
                                <p
                                  className={`mt-1 font-semibold ${gl ? 'text-black dark:text-white' : 'text-slate-900 dark:text-slate-50'}`}
                                >
                                  {locale === 'en' ? et.nameEn : et.nameTr}
                                </p>
                                <p
                                  className={`font-mono text-[11px] ${gl ? 'text-black/65 dark:text-white/70' : 'text-slate-500'}`}
                                >
                                  {et.defaultCode}
                                </p>
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
                    pageStart={codeListPagination.pageStart}
                    pageEnd={codeListPagination.pageEnd}
                    totalCount={codeListPagination.totalCount}
                    safePage={codeListPagination.safePage}
                    pageCount={codeListPagination.pageCount}
                    onPrev={() => {
                      codeListPagination.setPage((p) => Math.max(1, p - 1))
                      scrollCodeListTop()
                    }}
                    onNext={() => {
                      codeListPagination.setPage((p) => Math.min(codeListPagination.pageCount, p + 1))
                      scrollCodeListTop()
                    }}
                  />
                }
                rightPanelRef={rightCodeRef}
                rightAside={
                  selectedType ? (
                    <div className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
                      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden sm:gap-4">
                      <header
                        className={
                          gl
                            ? 'shrink-0 border-b border-black/12 pb-3 text-left dark:border-white/10'
                            : 'shrink-0 border-b border-slate-200/25 pb-3 text-left dark:border-white/10'
                        }
                      >
                        <p
                          className={
                            gl
                              ? 'text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65'
                              : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                          }
                        >
                          {t('elementIdentity.table.elementType')}
                        </p>
                        <h3
                          className={
                            gl
                              ? 'mt-1.5 text-xl font-semibold leading-tight text-black dark:text-white'
                              : 'mt-1.5 text-lg font-semibold text-slate-900 dark:text-slate-50'
                          }
                        >
                          {locale === 'en' ? selectedType.nameEn : selectedType.nameTr}
                        </h3>
                        <p
                          className={
                            gl
                              ? 'mt-1 font-mono text-sm text-black/75 dark:text-white/80'
                              : 'mt-1 font-mono text-sm text-slate-600 dark:text-slate-300'
                          }
                        >
                          {selectedType.defaultCode}
                        </p>
                      </header>
                      <div className="flex shrink-0 gap-1 overflow-x-auto" role="tablist" aria-label={t('elementIdentity.detail.tabCode')}>
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
                              className={eiTabPill(codeSub === id)}
                            >
                              {t(key)}
                            </button>
                          ))}
                      </div>
                      <div className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden text-left">
                        {codeSub === 'detail' ? (
                          <div className="space-y-4 text-left">
                            <div className={detailSectionCard}>
                              <p
                                className={
                                  gl
                                    ? 'text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                    : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                                }
                              >
                                IFC
                              </p>
                              <p
                                className={`mt-1 font-mono text-sm ${gl ? 'text-black dark:text-white' : 'text-slate-900 dark:text-slate-100'}`}
                              >
                                {selectedType.ifcClass} / {selectedType.defaultIfcPredefinedType ?? '—'}
                              </p>
                              {selectedType.description ? (
                                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                  {selectedType.description}
                                </p>
                              ) : null}
                            </div>
                            <dl className={`grid gap-3 sm:grid-cols-2 ${detailSectionCard}`}>
                              <div>
                                <dt className={infoDt}>{t('elementIdentity.table.default')}</dt>
                                <dd className={`mt-1 font-mono text-sm ${infoDd}`}>{selectedType.defaultCode}</dd>
                              </div>
                              <div>
                                <dt className={infoDt}>{t('elementIdentity.table.override')}</dt>
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
                          <div className={`overflow-x-auto ${detailSectionCard}`}>
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
                          <div className={detailSectionCard}>
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
                    </div>
                  ) : (
                    <p className={`px-1 text-left text-xs ${gl ? 'text-black/60 dark:text-white/65' : 'text-slate-500'}`}>—</p>
                  )
                }
              />
            ) : null}

            {mainTab === 'labels' ? (
              <ElementIdentityPieceCodesLikeSplit
                persistKey={`${projectId}:labels`}
                listRef={labelsListRef}
                visualVariant="project-mgmt"
                neutralChrome={neutralShell}
                embedded
                fillParentHeight
                listIndentWhenFilterOpen="18.5rem"
                defaultSplitRatio={30}
                listTitle={t('elementIdentity.detail.splitLabelsTitle')}
                filterToolbarSearch={
                  <FilterToolbarSearch
                    id={`ei-label-template-search-${projectId}`}
                    value={labelFilterQuery}
                    onValueChange={setLabelFilterQuery}
                    placeholder={t('elementIdentity.detail.labelSearchPh')}
                    ariaLabel={t('elementIdentity.detail.labelSearchAria')}
                    className={['min-w-0 sm:max-w-[14rem]', gl ? 'project-mgmt-toolbar-search' : ''].filter(Boolean).join(' ')}
                    inputClassName={gl ? 'glass-input' : ''}
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
                    className={headerBtnCls}
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
                      glass={gl}
                      title={t('elementIdentity.detail.labelFiltersTitle')}
                      subtitle={t('elementIdentity.detail.labelFiltersSubtitle')}
                      onClose={() => setFilterOpenLabels(false)}
                    />
                    <label>
                      <span
                        className={
                          gl
                            ? 'text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80'
                            : 'text-[11px] font-medium text-slate-600 dark:text-slate-300'
                        }
                      >
                        {t('elementIdentity.ifc.sourceName')}
                      </span>
                      <input
                        type="text"
                        value={labelFilterQuery}
                        onChange={(e) => setLabelFilterQuery(e.target.value)}
                        className={
                          gl
                            ? 'glass-input mt-2 w-full'
                            : 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'
                        }
                      />
                    </label>
                    <div
                      className={`mt-3 border-t pt-2 ${gl ? 'border-black/10 dark:border-white/10' : 'border-slate-200/60 dark:border-slate-700/60'}`}
                    >
                      <button
                        type="button"
                        onClick={() => setLabelFilterQuery('')}
                        className={`${eiSplitHeaderButtonPassive} w-full justify-center py-1.5 text-[11px]`}
                      >
                        {t('elementIdentity.reset')}
                      </button>
                    </div>
                  </div>
                }
                listBody={
                  labelListPagination.totalCount === 0 ? (
                    <li
                      className={
                        gl
                          ? 'list-none rounded-xl border border-dashed border-black/20 bg-white/25 px-3 py-8 text-center text-xs text-black/60 dark:border-white/15 dark:bg-white/5 dark:text-white/65'
                          : 'list-none rounded-lg border border-dashed border-slate-300/60 px-3 py-8 text-center text-xs text-slate-500'
                      }
                    >
                      —
                    </li>
                  ) : (
                    visibleLabelTemplates.map((tm) => {
                    const previewLine = templateListPreviewMark(tm, activeFirm, activeProject, overrides)
                    const isActive = activeTemplate.id === tm.id
                    return (
                      <li key={tm.id}>
                        <div className={eiSplitListRowShell(isActive)}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTemplateId(tm.id)
                            setLabelSub('overview')
                            scrollTop(rightLabelsRef)
                          }}
                          aria-current={isActive ? 'true' : undefined}
                          className="flex min-w-0 w-full flex-1 flex-col gap-1.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={
                                gl
                                  ? 'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-black/8 text-black ring-1 ring-inset ring-black/12 dark:bg-white/10 dark:text-white dark:ring-white/15'
                                  : 'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/60'
                              }
                            >
                              <Tags className="size-4" aria-hidden />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`font-semibold ${gl ? 'text-black dark:text-white' : 'text-slate-900 dark:text-slate-50'}`}
                              >
                                {tm.name}
                              </p>
                              <div className="mt-0.5 flex flex-wrap gap-1">
                                {tm.id === activeFirm.defaultTemplateId ? (
                                  <span
                                    className={
                                      gl
                                        ? 'rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-900 dark:text-emerald-200'
                                        : 'rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300'
                                    }
                                  >
                                    {t('elementIdentity.labels.default')}
                                  </span>
                                ) : null}
                                {projectId && tm.id === projectDefaultTemplateId ? (
                                  <span
                                    className={
                                      gl
                                        ? 'rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-900 dark:text-sky-200'
                                        : 'rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800 dark:text-sky-300'
                                    }
                                  >
                                    {t('elementIdentity.labels.projectDefaultBadge')}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <p
                            className={`truncate pl-10 font-mono text-[10px] ${gl ? 'text-black/65 dark:text-white/70' : 'text-slate-600 dark:text-slate-400'}`}
                            title={previewLine}
                          >
                            {previewLine}
                          </p>
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
                    pageStart={labelListPagination.pageStart}
                    pageEnd={labelListPagination.pageEnd}
                    totalCount={labelListPagination.totalCount}
                    safePage={labelListPagination.safePage}
                    pageCount={labelListPagination.pageCount}
                    onPrev={() => {
                      labelListPagination.setPage((p) => Math.max(1, p - 1))
                      scrollLabelsListTop()
                    }}
                    onNext={() => {
                      labelListPagination.setPage((p) => Math.min(labelListPagination.pageCount, p + 1))
                      scrollLabelsListTop()
                    }}
                  />
                }
                rightPanelRef={rightLabelsRef}
                rightAside={
                  <div className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
                    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden sm:gap-4">
                      <header
                        className={
                          gl
                            ? 'shrink-0 border-b border-black/12 pb-3 text-left dark:border-white/10'
                            : 'shrink-0 border-b border-slate-200/25 pb-3 text-left dark:border-white/10'
                        }
                      >
                        <p
                          className={
                            gl
                              ? 'text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65'
                              : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                          }
                        >
                          {t('elementIdentity.labels.title')}
                        </p>
                        <h3
                          className={
                            gl
                              ? 'mt-1.5 text-xl font-semibold leading-tight text-black dark:text-white'
                              : 'mt-1.5 text-lg font-semibold text-slate-900 dark:text-slate-50'
                          }
                        >
                          {activeTemplate.name}
                        </h3>
                      </header>
                      <div className="flex shrink-0 gap-1 overflow-x-auto" role="tablist" aria-label={t('elementIdentity.detail.tabLabels')}>
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
                            className={eiTabPill(labelSub === id)}
                          >
                            {t(key)}
                          </button>
                        ))}
                      </div>
                      <div
                        role="tabpanel"
                        className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden text-left"
                      >
                      {labelSub === 'overview' ? (
                        <div className="space-y-4 text-left">
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={assignTemplateAsProjectDefault}
                              className={
                                `${eiSplitHeaderButtonPassive} w-full justify-center px-4 py-2.5 text-sm`
                              }
                            >
                              {t('elementIdentity.labels.setProjectDefault')}
                            </button>
                            <button
                              type="button"
                              onClick={assignTemplateAsFirmDefaultFuture}
                              className={
                                `${eiSplitHeaderButtonPassive} w-full justify-center px-4 py-2.5 text-sm`
                              }
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
                              className={
                                `${eiSplitHeaderButtonPassive} w-full justify-center px-4 py-2.5 text-sm`
                              }
                            >
                              {t('elementIdentity.labels.createFromLabel')}
                            </button>
                          </div>
                          <div className={detailSectionCard}>
                            <p
                              className={
                                gl
                                  ? 'text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                  : 'text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                              }
                            >
                              {t('elementIdentity.labels.codeStructureTitle')}
                            </p>
                            <p
                              className={
                                gl
                                  ? 'mt-1 text-xs text-black/65 dark:text-white/70'
                                  : 'mt-1 text-xs text-slate-500 dark:text-slate-400'
                              }
                            >
                              {t('elementIdentity.labels.codeStructureHint')}
                            </p>
                            <p
                              className={`mt-3 text-sm leading-relaxed ${gl ? 'text-black dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}
                            >
                              {tokenSequenceReadable(activeTemplate, t)}
                            </p>
                            <p
                              className={
                                gl
                                  ? 'mt-4 text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60'
                                  : 'mt-4 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                              }
                            >
                              {t('elementIdentity.livePreview.title')}
                            </p>
                            <p
                              className={`mt-1 break-all font-mono text-sm font-semibold ${gl ? 'text-black dark:text-white' : 'text-slate-900 dark:text-slate-50'}`}
                            >
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
                  </div>
                }
              />
            ) : null}
          </div>
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
