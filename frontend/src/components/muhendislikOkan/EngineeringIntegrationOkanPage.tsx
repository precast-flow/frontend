import { ChevronDown, ChevronRight, Filter, Upload } from 'lucide-react'
import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import './engineeringOkanLiquid.css'
import {
  CHECKLIST_ITEMS_OKAN,
  type OkanEngJob,
  type OkanFile,
  type WorkflowStateOkan,
  initialOkanEngJobs,
} from './engineeringIntegrationOkanMock'
import { ReadinessBadge } from './ReadinessBadge'
import { ReadinessBar } from './ReadinessBar'
import { SmartProductionOrderModal } from './SmartProductionOrderModal'
import { ENGINEERING_BASE_PATH } from '../manualPieceTemplateStudio/constants'
import { MptsProvider } from '../manualPieceTemplateStudio/MptsContext'
import { MptsRoutes } from '../manualPieceTemplateStudio/MptsRoutes'
import { StandardItemsAssembliesModule } from './standardItemsAssemblies/StandardItemsAssembliesModule'
import { ToggleSwitch } from './ToggleSwitch'
import { WorkflowStepper } from './WorkflowStepper'
import { computeReadinessPercent, countChecklistDone, deriveReadinessLevel } from './readinessEngine'

function isEngineeringMptsPath(pathname: string): boolean {
  return (
    pathname.startsWith(`${ENGINEERING_BASE_PATH}/catalog/`) ||
    pathname.startsWith(`${ENGINEERING_BASE_PATH}/templates/`) ||
    pathname.startsWith(`${ENGINEERING_BASE_PATH}/production/`)
  )
}

type TabId = 'files' | 'manual' | 'summary' | 'revisions'

const TABS: { id: TabId; labelKey: string }[] = [
  { id: 'files', labelKey: 'okanEng.tab.files' },
  { id: 'manual', labelKey: 'okanEng.tab.manual' },
  { id: 'summary', labelKey: 'okanEng.tab.summary' },
  { id: 'revisions', labelKey: 'okanEng.tab.revisions' },
]

function nowTs() {
  return new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })
}

function workflowLabelKey(w: OkanEngJob['workflow']): string {
  switch (w) {
    case 'draft':
      return 'okanEng.flow.draft'
    case 'in_review':
      return 'okanEng.flow.inReview'
    case 'approved':
      return 'okanEng.flow.approved'
    case 'production_created':
      return 'okanEng.flow.productionCreated'
    default:
      return 'okanEng.flow.draft'
  }
}

type PageProps = {
  /** Liste/form Close ile ana modülden çıkış (ör. pano) */
  onCloseModule?: () => void
}

export function EngineeringIntegrationOkanPage({ onCloseModule }: PageProps) {
  const { t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const isMptsSubRoute = useMemo(() => isEngineeringMptsPath(location.pathname), [location.pathname])
  const [engSurface, setEngSurface] = useState<'jobs' | 'standardItems'>('jobs')
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState<OkanEngJob[]>(() =>
    initialOkanEngJobs.map((j) => ({
      ...j,
      files: j.files.map((f) => ({ ...f })),
      manual: { ...j.manual },
      checklist: { ...j.checklist },
      revisions: j.revisions.map((r) => ({ ...r })),
    })),
  )
  const [selectedId, setSelectedId] = useState(() => searchParams.get('job') ?? initialOkanEngJobs[0]!.id)
  const [tab, setTab] = useState<TabId>('files')
  const [manualOpen, setManualOpen] = useState(true)
  const [poOpen, setPoOpen] = useState(false)
  const [timelineFlash, setTimelineFlash] = useState<string | null>(null)
  const [nextPrdSeq, setNextPrdSeq] = useState(2056)

  const [kindFilter, setKindFilter] = useState<'all' | 'A' | 'B'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [workflowFilter, setWorkflowFilter] = useState<'all' | WorkflowStateOkan>('all')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  const selected = useMemo(() => jobs.find((j) => j.id === selectedId) ?? null, [jobs, selectedId])

  const projectOptions = useMemo(() => {
    const m = new Map<string, string>()
    for (const j of jobs) {
      m.set(j.projectCode, `${j.projectCode} · ${j.projectName}`)
    }
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1], 'tr'))
  }, [jobs])

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (kindFilter !== 'all' && j.kind !== kindFilter) return false
      if (projectFilter !== 'all' && j.projectCode !== projectFilter) return false
      if (workflowFilter !== 'all' && j.workflow !== workflowFilter) return false
      return true
    })
  }, [jobs, kindFilter, projectFilter, workflowFilter])

  /**
   * Sadece state → URL senkronu. URL → state için ayrı effect kullanma:
   * setSearchParams asenkron güncellendiğinde eski ?job= ile tekrar setSelectedId çağrılıp
   * kullanıcı seçiminin üzerine yazılıyordu (bazen tek tıkta seçim tutmuyordu).
   */
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev)
        if (n.get('job') === selectedId) return prev
        n.set('job', selectedId)
        return n
      },
      { replace: true },
    )
  }, [selectedId, setSearchParams])

  useEffect(() => {
    if (engSurface !== 'jobs' || isMptsSubRoute) return
    startTransition(() => setTab('files'))
  }, [selectedId, engSurface, isMptsSubRoute])

  useEffect(() => {
    if (filteredJobs.length === 0) return
    if (!filteredJobs.some((j) => j.id === selectedId)) {
      startTransition(() => setSelectedId(filteredJobs[0]!.id))
    }
  }, [filteredJobs, selectedId])

  const patchJob = useCallback((id: string, fn: (j: OkanEngJob) => OkanEngJob) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? fn({ ...j }) : j)))
  }, [])

  const readinessFor = useCallback((job: OkanEngJob) => {
    const score = computeReadinessPercent(job)
    const level = deriveReadinessLevel(score, job)
    return { score, level }
  }, [])

  const badgeLabel = (level: ReturnType<typeof deriveReadinessLevel>) => {
    if (level === 'red') return t('okanEng.badge.notReady')
    if (level === 'yellow') return t('okanEng.badge.risky')
    return t('okanEng.badge.ready')
  }

  const handleMockUpload = () => {
    if (!selected) return
    const id = `up-${Date.now()}`
    const f: OkanFile = {
      id,
      name: `Yukleme_${id.slice(-4)}.pdf`,
      fileType: 'PDF',
      size: '320 KB',
      uploadedBy: 'Siz (mock)',
      uploadedAt: nowTs(),
      locked: false,
    }
    patchJob(selected.id, (j) => ({
      ...j,
      files: [...j.files, f],
      updatedAt: nowTs(),
    }))
  }

  const toggleCheck = (key: string) => {
    if (!selected) return
    patchJob(selected.id, (j) => ({
      ...j,
      checklist: { ...j.checklist, [key]: !j.checklist[key] },
      updatedAt: nowTs(),
    }))
  }

  const setManual = (patch: Partial<OkanEngJob['manual']>) => {
    if (!selected) return
    patchJob(selected.id, (j) => ({
      ...j,
      manual: { ...j.manual, ...patch },
      updatedAt: nowTs(),
    }))
  }

  const sendReview = () => {
    if (!selected || selected.workflow !== 'draft') return
    patchJob(selected.id, (j) => ({ ...j, workflow: 'in_review', updatedAt: nowTs() }))
  }

  const approve = () => {
    if (!selected || selected.workflow !== 'in_review') return
    patchJob(selected.id, (j) => ({ ...j, workflow: 'approved', updatedAt: nowTs() }))
  }

  const requestRevision = () => {
    if (!selected || selected.workflow !== 'in_review') return
    patchJob(selected.id, (j) => ({ ...j, workflow: 'draft', updatedAt: nowTs() }))
  }

  const openPoModal = () => {
    if (!selected || selected.kind !== 'B' || selected.workflow !== 'approved') return
    setPoOpen(true)
  }

  const onPoConfirm = ({ prdId, factoryId, dueDate }: { prdId: string; factoryId: string; dueDate: string }) => {
    if (!selected) return
    setNextPrdSeq((n) => n + 1)
    patchJob(selected.id, (j) => ({
      ...j,
      workflow: 'production_created',
      productionOrderId: prdId,
      updatedAt: nowTs(),
    }))
    const fac = factoryId
    setTimelineFlash(
      t('okanEng.timelineFlash', { prd: prdId, project: selected.projectCode, factory: fac, due: dueDate }),
    )
    window.setTimeout(() => setTimelineFlash(null), 12000)
  }

  return (
    <div className="okan-liquid-root flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-[1.25rem]">
      <div className="okan-liquid-blobs" aria-hidden>
        <div className="okan-liquid-blob okan-liquid-blob--a" />
        <div className="okan-liquid-blob okan-liquid-blob--b" />
        <div className="okan-liquid-blob okan-liquid-blob--c" />
      </div>
      <div className="okan-liquid-content flex min-h-0 flex-1 flex-col gap-4">
      <div
        className="okan-liquid-pill-track flex w-full max-w-full shrink-0 gap-1 overflow-x-auto rounded-full p-1"
        role="tablist"
        aria-label={t('sia.mainTab.aria')}
      >
        <button
          type="button"
          role="tab"
          aria-selected={!isMptsSubRoute && engSurface === 'jobs'}
          onClick={() => {
            setEngSurface('jobs')
            navigate({ pathname: ENGINEERING_BASE_PATH, search: location.search })
          }}
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 md:text-sm ${
            !isMptsSubRoute && engSurface === 'jobs'
              ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
          }`}
        >
          {t('sia.mainTab.jobs')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isMptsSubRoute && engSurface === 'standardItems'}
          onClick={() => {
            setEngSurface('standardItems')
            navigate({ pathname: ENGINEERING_BASE_PATH, search: location.search })
          }}
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 md:text-sm ${
            !isMptsSubRoute && engSurface === 'standardItems'
              ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
          }`}
        >
          {t('sia.mainTab.standardItems')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={location.pathname.startsWith(`${ENGINEERING_BASE_PATH}/catalog/material-items`)}
          onClick={() =>
            navigate({ pathname: `${ENGINEERING_BASE_PATH}/catalog/material-items`, search: location.search })
          }
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 md:text-sm ${
            location.pathname.startsWith(`${ENGINEERING_BASE_PATH}/catalog/material-items`)
              ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
          }`}
        >
          {t('mpts.layout.nav.materialItems')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={location.pathname.startsWith(`${ENGINEERING_BASE_PATH}/catalog/material-assemblies`)}
          onClick={() =>
            navigate({ pathname: `${ENGINEERING_BASE_PATH}/catalog/material-assemblies`, search: location.search })
          }
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 md:text-sm ${
            location.pathname.startsWith(`${ENGINEERING_BASE_PATH}/catalog/material-assemblies`)
              ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
          }`}
        >
          {t('mpts.layout.nav.assemblies')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={location.pathname.startsWith(`${ENGINEERING_BASE_PATH}/templates/piece-mark-templates`)}
          onClick={() =>
            navigate({ pathname: `${ENGINEERING_BASE_PATH}/templates/piece-mark-templates`, search: location.search })
          }
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 md:text-sm ${
            location.pathname.startsWith(`${ENGINEERING_BASE_PATH}/templates/piece-mark-templates`)
              ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
          }`}
        >
          {t('mpts.layout.nav.pieceMarkTpl')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={location.pathname.startsWith(`${ENGINEERING_BASE_PATH}/production/`)}
          onClick={() =>
            navigate({ pathname: `${ENGINEERING_BASE_PATH}/production/piece-marks`, search: location.search })
          }
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 md:text-sm ${
            location.pathname.startsWith(`${ENGINEERING_BASE_PATH}/production/`)
              ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
          }`}
        >
          {t('mpts.layout.nav.pieceMarks')}
        </button>
      </div>

      {isMptsSubRoute ? (
        <MptsProvider basePath={ENGINEERING_BASE_PATH}>
          <div className="flex min-h-0 min-h-[28rem] flex-1 flex-col overflow-hidden">
            <MptsRoutes onCloseModule={onCloseModule ?? (() => undefined)} />
          </div>
        </MptsProvider>
      ) : engSurface === 'standardItems' ? (
        <StandardItemsAssembliesModule onCloseModule={onCloseModule ?? (() => undefined)} />
      ) : null}

      {!isMptsSubRoute && engSurface === 'jobs' ? (
      <>
      {selected ? (
        <SmartProductionOrderModal
          open={poOpen}
          job={selected}
          t={t}
          nextPrd={nextPrdSeq}
          onClose={() => setPoOpen(false)}
          onConfirm={onPoConfirm}
        />
      ) : null}

      {timelineFlash ? (
        <div role="status" className="okan-liquid-banner-ok px-4 py-3 text-sm text-emerald-950 dark:text-emerald-100">
          <p className="font-medium">{timelineFlash}</p>
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <section
          className="okan-liquid-panel flex max-h-[min(48vh,440px)] flex-col p-3 lg:col-span-4 lg:max-h-none"
          aria-labelledby="okan-wo-list-h"
        >
          <div className="mb-2 space-y-2 px-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2
                id="okan-wo-list-h"
                className="min-w-0 flex-1 text-sm font-semibold leading-tight text-slate-900 dark:text-slate-50"
              >
                {t('okanEng.listTitle')}
              </h2>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setFilterPanelOpen((o) => !o)}
                  aria-expanded={filterPanelOpen}
                  title={
                    filterPanelOpen
                      ? t('eng.bie06.filter.toggleClose')
                      : t('eng.bie06.filter.toggleOpen')
                  }
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 sm:gap-1.5 sm:px-2.5 sm:text-xs ${
                    filterPanelOpen
                      ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
                  }`}
                >
                  <Filter className="size-3.5 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">
                    {filterPanelOpen ? t('eng.bie06.filter.toggleClose') : t('eng.bie06.filter.toggleOpen')}
                  </span>
                </button>
              </div>
            </div>

            {filterPanelOpen ? (
              <div className="okan-liquid-panel-nested flex flex-col gap-2.5 p-2.5">
                <label className="block w-full min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    {t('eng.bie06.filter.kind')}
                  </span>
                  <select
                    value={kindFilter}
                    onChange={(e) => setKindFilter(e.target.value as 'all' | 'A' | 'B')}
                    className="okan-liquid-select mt-1 w-full border-0 px-3 py-2 text-sm shadow-none"
                  >
                    <option value="all">{t('eng.bie06.filter.kindAll')}</option>
                    <option value="A">{t('eng.bie06.filter.kindA')}</option>
                    <option value="B">{t('eng.bie06.filter.kindB')}</option>
                  </select>
                </label>
                <label className="block w-full min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    {t('eng.bie06.filter.project')}
                  </span>
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="okan-liquid-select mt-1 w-full border-0 px-3 py-2 text-sm shadow-none"
                  >
                    <option value="all">{t('eng.bie06.filter.projectAll')}</option>
                    {projectOptions.map(([code, label]) => (
                      <option key={code} value={code}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block w-full min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    {t('eng.bie06.filter.status')}
                  </span>
                  <select
                    value={workflowFilter}
                    onChange={(e) => setWorkflowFilter(e.target.value as 'all' | WorkflowStateOkan)}
                    className="okan-liquid-select mt-1 w-full border-0 px-3 py-2 text-sm shadow-none"
                  >
                    <option value="all">{t('eng.bie06.filter.statusAll')}</option>
                    <option value="draft">{t('okanEng.flow.draft')}</option>
                    <option value="in_review">{t('okanEng.flow.inReview')}</option>
                    <option value="approved">{t('okanEng.flow.approved')}</option>
                    <option value="production_created">{t('okanEng.flow.productionCreated')}</option>
                  </select>
                </label>
              </div>
            ) : null}
          </div>
          {filteredJobs.length === 0 ? (
            <p className="px-1 text-sm text-slate-600 dark:text-slate-400">{t('okanEng.filterEmpty')}</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {filteredJobs.map((job) => {
                const { score, level } = readinessFor(job)
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedId(job.id)}
                    className={[
                      'okan-liquid-list-card p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
                      selectedId === job.id ? 'okan-liquid-list-card--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{job.projectName}</span>
                      <ReadinessBadge level={level} label={`${score}%`} />
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{job.woCode}</p>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {selected ? (
          <section
            className="okan-liquid-panel flex min-h-0 flex-col gap-4 p-4 lg:col-span-8"
            aria-label={t('okanEng.detailRegion')}
          >
            <div className="min-w-0 flex-1 space-y-4">
              <div className="okan-liquid-panel-nested w-full min-w-0 p-4">
                <WorkflowStepper workflow={selected.workflow} kind={selected.kind} t={t} />
              </div>

              {(() => {
                const { score, level } = readinessFor(selected)
                return (
                  <div className="okan-liquid-panel-nested p-4">
                    <ReadinessBar
                      percent={score}
                      level={level}
                      labelLeft={t('okanEng.readinessTitle')}
                    />
                  </div>
                )
              })()}

              <div className="flex flex-wrap items-center gap-2">
                <ReadinessBadge level={readinessFor(selected).level} label={badgeLabel(readinessFor(selected).level)} />
                {selected.kind === 'B' && selected.workflow === 'production_created' && selected.productionOrderId ? (
                  <span className="text-sm font-mono text-slate-700 dark:text-slate-200">
                    {selected.productionOrderId}
                  </span>
                ) : null}
              </div>

              <div className="okan-liquid-panel-nested p-4">
                <h2 className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                  {t('okanEng.summaryCard')}
                </h2>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-600 dark:text-slate-400">{t('okanEng.summary.project')}</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">{selected.projectName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-600 dark:text-slate-400">{t('okanEng.summary.kind')}</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">
                      {selected.kind === 'A' ? t('okanEng.kindA') : t('okanEng.kindB')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-600 dark:text-slate-400">{t('okanEng.summary.workflow')}</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">{t(workflowLabelKey(selected.workflow))}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-600 dark:text-slate-400">{t('okanEng.summary.readiness')}</dt>
                    <dd className="font-medium tabular-nums text-slate-900 dark:text-slate-50">
                      {readinessFor(selected).score}%
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-slate-600 dark:text-slate-400">{t('okanEng.summary.updated')}</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">{selected.updatedAt}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-wrap gap-2">
                {selected.workflow === 'draft' ? (
                  <button type="button" onClick={sendReview} className="okan-liquid-btn-primary px-4 py-2.5 text-sm font-semibold">
                    {t('okanEng.cta.submitReview')}
                  </button>
                ) : null}
                {selected.workflow === 'in_review' ? (
                  <>
                    <button type="button" onClick={approve} className="okan-liquid-btn-primary px-4 py-2.5 text-sm font-semibold">
                      {t('okanEng.cta.approve')}
                    </button>
                    <button
                      type="button"
                      onClick={requestRevision}
                      className="okan-liquid-btn-secondary px-4 py-2.5 text-sm font-semibold"
                    >
                      {t('okanEng.cta.requestRev')}
                    </button>
                  </>
                ) : null}
                {selected.kind === 'B' && selected.workflow === 'approved' ? (
                  <button
                    type="button"
                    onClick={openPoModal}
                    className="okan-liquid-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
                  >
                    {t('okanEng.cta.createPo')}
                  </button>
                ) : null}
                {selected.kind === 'A' && selected.workflow === 'approved' ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">{t('okanEng.typeA.doneHint')}</p>
                ) : null}
                {selected.kind === 'B' && selected.workflow === 'production_created' ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">{t('okanEng.poLocked')}</p>
                ) : null}
              </div>

              <div className="okan-liquid-pill-track flex gap-1 overflow-x-auto rounded-full p-1" role="tablist">
                {TABS.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === x.id}
                    onClick={() => setTab(x.id)}
                    className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 md:text-sm ${
                      tab === x.id
                        ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
                    }`}
                  >
                    {t(x.labelKey)}
                  </button>
                ))}
              </div>

              {tab === 'files' ? (
                <section className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMockUpload}
                      className="okan-liquid-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
                    >
                      <Upload className="size-4" aria-hidden />
                      {t('okanEng.upload')}
                    </button>
                  </div>
                  <div className="okan-liquid-table-wrap min-h-0">
                    <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="okan-liquid-table-thead text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                          <th className="px-3 py-2.5">{t('okanEng.table.name')}</th>
                          <th className="px-3 py-2.5">{t('okanEng.table.type')}</th>
                          <th className="px-3 py-2.5">{t('okanEng.table.lock')}</th>
                          <th className="px-3 py-2.5">{t('okanEng.table.ifc')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.files.map((file) => (
                          <tr key={file.id} className="okan-liquid-table-row border-t">
                            <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-50">{file.name}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{file.fileType}</td>
                            <td className="px-3 py-2">
                              {file.locked ? (
                                <span className="text-amber-800 dark:text-amber-200">{t('okanEng.lockedYes')}</span>
                              ) : (
                                <span className="text-slate-500 dark:text-slate-400">{t('okanEng.lockedNo')}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                              {file.fileType.toUpperCase() === 'IFC' ? (
                                file.integrationStatus === 'hazir' ? (
                                  t('okanEng.ifc.ok')
                                ) : (
                                  <span className="rounded-md border border-amber-400/40 bg-amber-100/80 px-1.5 py-0.5 text-amber-950 backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-100">
                                    {t('okanEng.ifc.pending')}
                                  </span>
                                )
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}

              {tab === 'manual' ? (
                <section>
                  <button
                    type="button"
                    onClick={() => setManualOpen((o) => !o)}
                    className="okan-liquid-btn-secondary mb-3 flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold"
                  >
                    {t('okanEng.manual.section')}
                    {manualOpen ? <ChevronDown className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
                  </button>
                  {manualOpen ? (
                    <div className="okan-liquid-panel-nested space-y-4 p-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {t('okanEng.manual.critical')}
                        </label>
                        <div className="mt-2 space-y-2">
                          <div>
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400" title={t('okanEng.tooltip.concrete')}>
                              {t('okanEng.field.concrete')}
                            </label>
                            <input
                              value={selected.manual.concrete}
                              onChange={(e) => setManual({ concrete: e.target.value })}
                              className="okan-liquid-input mt-1 w-full max-w-md border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400" title={t('okanEng.tooltip.tolerance')}>
                              {t('okanEng.field.tolerance')}
                            </label>
                            <textarea
                              value={selected.manual.toleranceNote}
                              onChange={(e) => setManual({ toleranceNote: e.target.value })}
                              rows={3}
                              className="okan-liquid-input mt-1 w-full resize-none border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {t('okanEng.manual.optional')}
                        </label>
                        <div className="mt-2 space-y-2">
                          <div className="okan-liquid-panel-nested flex items-center justify-between gap-3 px-3 py-2.5">
                            <span className="text-sm text-slate-800 dark:text-slate-100">{t('okanEng.field.warn1')}</span>
                            <ToggleSwitch
                              checked={selected.manual.warnAnchorage}
                              onChange={(next) => setManual({ warnAnchorage: next })}
                              aria-label={t('okanEng.field.warn1')}
                            />
                          </div>
                          <div className="okan-liquid-panel-nested flex items-center justify-between gap-3 px-3 py-2.5">
                            <span className="text-sm text-slate-800 dark:text-slate-100">{t('okanEng.field.warn2')}</span>
                            <ToggleSwitch
                              checked={selected.manual.warnFatigue}
                              onChange={(next) => setManual({ warnFatigue: next })}
                              aria-label={t('okanEng.field.warn2')}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('okanEng.manual.footer')}</p>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {tab === 'summary' ? (
                <section className="okan-liquid-panel-nested space-y-4 p-4">
                  {(() => {
                    const { done, total } = countChecklistDone(selected.checklist)
                    return (
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {t('okanEng.checklist.title')}
                          </h3>
                          <span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">
                            {done} / {total}
                          </span>
                        </div>
                        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                          <div
                            className="h-full rounded-full bg-emerald-500 shadow-[0_0_12px_rgb(16_185_129/0.45)] transition-all"
                            style={{ width: `${(done / total) * 100}%` }}
                          />
                        </div>
                        <ul className="mt-4 divide-y divide-white/20 dark:divide-white/10">
                          {CHECKLIST_ITEMS_OKAN.map((c) => (
                            <li key={c.id}>
                              <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`text-sm ${c.critical ? 'font-medium text-slate-900 dark:text-slate-50' : 'text-slate-700 dark:text-slate-200'}`}
                                  >
                                    {t(`okanEng.chk.${c.id}`)}
                                  </p>
                                  <p className="mt-0.5 text-[10px] uppercase tracking-wide">
                                    {c.critical ? (
                                      <span className="font-semibold text-red-600 dark:text-red-400">{t('okanEng.criticalTag')}</span>
                                    ) : (
                                      <span className="text-slate-400">{t('okanEng.optionalTag')}</span>
                                    )}
                                  </p>
                                </div>
                                <ToggleSwitch
                                  checked={!!selected.checklist[c.id]}
                                  onChange={() => toggleCheck(c.id)}
                                  aria-label={t(`okanEng.chk.${c.id}`)}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })()}
                </section>
              ) : null}

              {tab === 'revisions' ? (
                <section className="min-h-0">
                  <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                    {t('okanEng.rev.hint')} · {t('okanEng.rev.currentLabel')}:{' '}
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{selected.revisionLabel}</span>
                  </p>
                  <div className="okan-liquid-table-wrap min-h-0">
                    <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="okan-liquid-table-thead text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                          <th className="px-3 py-2.5">{t('okanEng.rev.colRev')}</th>
                          <th className="px-3 py-2.5">{t('okanEng.rev.colAt')}</th>
                          <th className="px-3 py-2.5">{t('okanEng.rev.colActor')}</th>
                          <th className="px-3 py-2.5">{t('okanEng.rev.colNote')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.revisions.map((r) => (
                          <tr key={r.id} className="okan-liquid-table-row border-b">
                            <td className="px-3 py-2.5 font-mono text-xs font-semibold text-slate-900 dark:text-slate-50">{r.rev}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-600 dark:text-slate-400">{r.at}</td>
                            <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">{r.actor}</td>
                            <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">{r.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}
            </div>
          </section>
        ) : (
          <div className="okan-liquid-panel flex min-h-[120px] items-center justify-center p-6 lg:col-span-8">
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('okanEng.empty')}</p>
          </div>
        )}
      </div>
      </>
      ) : null}
      </div>
    </div>
  )
}
