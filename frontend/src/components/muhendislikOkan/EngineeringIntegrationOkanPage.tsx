import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, LayoutGrid, List, Upload } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import {
  CHECKLIST_ITEMS_OKAN,
  type OkanEngJob,
  type OkanFile,
  type WorkflowStateOkan,
  initialOkanEngJobs,
} from './engineeringIntegrationOkanMock'
import { ReadinessBadge } from './ReadinessBadge'
import { ReadinessBar } from './ReadinessBar'
import { RiskInsightPanel } from './RiskInsightPanel'
import { SmartProductionOrderModal } from './SmartProductionOrderModal'
import { ToggleSwitch } from './ToggleSwitch'
import { WorkflowStepper } from './WorkflowStepper'
import {
  computeReadinessPercent,
  countChecklistDone,
  deriveReadinessLevel,
  hasCriticalChecklistGap,
} from './readinessEngine'

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

export function EngineeringIntegrationOkanPage() {
  const { t } = useI18n()
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
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list')
  const [manualOpen, setManualOpen] = useState(true)
  const [poOpen, setPoOpen] = useState(false)
  const [timelineFlash, setTimelineFlash] = useState<string | null>(null)
  const [nextPrdSeq, setNextPrdSeq] = useState(2056)

  const [kindFilter, setKindFilter] = useState<'all' | 'A' | 'B'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [workflowFilter, setWorkflowFilter] = useState<'all' | WorkflowStateOkan>('all')

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
    setTab('files')
  }, [selectedId])

  useEffect(() => {
    if (filteredJobs.length === 0) return
    if (!filteredJobs.some((j) => j.id === selectedId)) {
      setSelectedId(filteredJobs[0]!.id)
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

  const canMarkReady = (job: OkanEngJob) => {
    const { score } = readinessFor(job)
    return score >= 72 && !hasCriticalChecklistGap(job.checklist) && job.workflow !== 'production_created'
  }

  const handleMarkReady = (job: OkanEngJob) => {
    if (!canMarkReady(job)) return
    patchJob(job.id, (j) => ({
      ...j,
      workflow: j.kind === 'A' ? 'approved' : 'approved',
      updatedAt: nowTs(),
    }))
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

  const typeABanner =
    selected?.kind === 'A' ? (
      <div
        role="status"
        className="rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-neo-in dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100"
      >
        {t('okanEng.banner.typeA')}
      </div>
    ) : null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
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
        <div
          role="status"
          className="rounded-2xl border border-emerald-300/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 shadow-neo-out-sm dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <p className="font-medium">{timelineFlash}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm dark:bg-gray-900/80">
        <label className="min-w-[140px] flex-1">
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('eng.bie06.filter.kind')}
          </span>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as 'all' | 'A' | 'B')}
            className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm shadow-neo-in dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="all">{t('eng.bie06.filter.kindAll')}</option>
            <option value="A">{t('eng.bie06.filter.kindA')}</option>
            <option value="B">{t('eng.bie06.filter.kindB')}</option>
          </select>
        </label>
        <label className="min-w-[180px] flex-1">
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('eng.bie06.filter.project')}
          </span>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm shadow-neo-in dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="all">{t('eng.bie06.filter.projectAll')}</option>
            {projectOptions.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[160px] flex-1">
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('eng.bie06.filter.status')}
          </span>
          <select
            value={workflowFilter}
            onChange={(e) => setWorkflowFilter(e.target.value as 'all' | WorkflowStateOkan)}
            className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm shadow-neo-in dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="all">{t('eng.bie06.filter.statusAll')}</option>
            <option value="draft">{t('okanEng.flow.draft')}</option>
            <option value="in_review">{t('okanEng.flow.inReview')}</option>
            <option value="approved">{t('okanEng.flow.approved')}</option>
            <option value="production_created">{t('okanEng.flow.productionCreated')}</option>
          </select>
        </label>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <section
          className="flex max-h-[min(48vh,440px)] flex-col rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm lg:col-span-4 lg:max-h-none dark:bg-gray-900"
          aria-labelledby="okan-wo-list-h"
        >
          <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-2 px-1">
            <h2 id="okan-wo-list-h" className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              {t('okanEng.listTitle')}
            </h2>
            <div
              className="flex shrink-0 gap-0.5 rounded-full bg-gray-100 p-0.5 shadow-neo-in dark:bg-gray-950/60"
              role="tablist"
              aria-label={t('okanEng.view.toggleLabel')}
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                title={t('okanEng.view.list')}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 sm:px-2.5 sm:text-xs ${
                  viewMode === 'list'
                    ? 'bg-gray-100 text-gray-900 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-50'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                }`}
              >
                <List className="size-3.5 shrink-0" aria-hidden />
                <span className="hidden sm:inline">{t('okanEng.view.list')}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'cards'}
                onClick={() => setViewMode('cards')}
                title={t('okanEng.view.cards')}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 sm:px-2.5 sm:text-xs ${
                  viewMode === 'cards'
                    ? 'bg-gray-100 text-gray-900 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-50'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                }`}
              >
                <LayoutGrid className="size-3.5 shrink-0" aria-hidden />
                <span className="hidden sm:inline">{t('okanEng.view.cards')}</span>
              </button>
            </div>
          </div>
          {viewMode === 'list' ? (
            filteredJobs.length === 0 ? (
              <p className="px-1 text-sm text-gray-500 dark:text-gray-400">{t('okanEng.filterEmpty')}</p>
            ) : (
            <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredJobs.map((job) => {
                const { score, level } = readinessFor(job)
                const wfKey = workflowLabelKey(job.workflow)
                const cardShell = [
                  'overflow-hidden rounded-xl text-sm transition',
                  selectedId === job.id
                    ? 'bg-gray-100 shadow-neo-in ring-1 ring-gray-300/70 dark:bg-gray-900 dark:ring-gray-600/70'
                    : 'bg-gray-100/80 shadow-neo-out-sm hover:shadow-neo-out dark:bg-gray-900/60',
                ].join(' ')
                return (
                  <li key={job.id}>
                    <div className={cardShell}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(job.id)}
                        className="w-full px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900 dark:text-gray-50">{job.projectName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {job.woCode} · {job.kind === 'A' ? t('okanEng.kindA') : t('okanEng.kindB')}
                            </p>
                            <p className="mt-1 text-[11px] text-gray-500">{t(wfKey)}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <ReadinessBadge level={level} label={`${score}%`} />
                            {level !== 'green' ? (
                              <AlertTriangle
                                className={`size-4 ${level === 'red' ? 'text-red-600' : 'text-amber-500'}`}
                                aria-hidden
                              />
                            ) : (
                              <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                            )}
                          </div>
                        </div>
                      </button>
                      <div className="flex flex-wrap gap-2 border-t border-gray-200/90 px-3 py-2.5 dark:border-gray-700/90">
                        <button
                          type="button"
                          onClick={() => setSelectedId(job.id)}
                          className="rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-950 dark:text-gray-100"
                        >
                          {t('okanEng.open')}
                        </button>
                        <button
                          type="button"
                          disabled={!canMarkReady(job)}
                          onClick={() => handleMarkReady(job)}
                          className="rounded-xl bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white shadow-neo-out-sm disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-200 dark:text-gray-900"
                        >
                          {t('okanEng.markReady')}
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            )
          ) : (
            filteredJobs.length === 0 ? (
              <p className="px-1 text-sm text-gray-500 dark:text-gray-400">{t('okanEng.filterEmpty')}</p>
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
                        'rounded-xl p-3 text-left shadow-neo-out-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
                        selectedId === job.id
                          ? 'bg-gray-100 shadow-neo-in ring-1 ring-gray-300/70 dark:bg-gray-900 dark:ring-gray-600/70'
                          : 'bg-gray-100/80 hover:shadow-neo-out dark:bg-gray-900/60',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">{job.projectName}</span>
                        <ReadinessBadge level={level} label={`${score}%`} />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{job.woCode}</p>
                    </button>
                  )
                })}
              </div>
            )
          )}
        </section>

        {selected ? (
          <section
            className="flex min-h-0 flex-col gap-4 rounded-2xl bg-gray-100 p-4 shadow-neo-out lg:col-span-8 dark:bg-gray-900"
            aria-label={t('okanEng.detailRegion')}
          >
            <div className="flex min-h-0 flex-col gap-4 lg:flex-row">
              <div className="min-w-0 flex-1 space-y-4">
              {typeABanner}

              <div className="rounded-xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
                <WorkflowStepper workflow={selected.workflow} kind={selected.kind} t={t} />
              </div>

              {(() => {
                const { score, level } = readinessFor(selected)
                return (
                  <div className="rounded-xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
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
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-200">
                    {selected.productionOrderId}
                  </span>
                ) : null}
              </div>

              <div className="rounded-xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
                <h2 className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('okanEng.summaryCard')}
                </h2>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">{t('okanEng.summary.project')}</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-50">{selected.projectName}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">{t('okanEng.summary.kind')}</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-50">
                      {selected.kind === 'A' ? t('okanEng.kindA') : t('okanEng.kindB')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">{t('okanEng.summary.workflow')}</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-50">{t(workflowLabelKey(selected.workflow))}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">{t('okanEng.summary.readiness')}</dt>
                    <dd className="font-medium tabular-nums text-gray-900 dark:text-gray-50">
                      {readinessFor(selected).score}%
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500 dark:text-gray-400">{t('okanEng.summary.updated')}</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-50">{selected.updatedAt}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-wrap gap-2">
                {selected.workflow === 'draft' ? (
                  <button
                    type="button"
                    onClick={sendReview}
                    className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
                  >
                    {t('okanEng.cta.submitReview')}
                  </button>
                ) : null}
                {selected.workflow === 'in_review' ? (
                  <>
                    <button
                      type="button"
                      onClick={approve}
                      className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
                    >
                      {t('okanEng.cta.approve')}
                    </button>
                    <button
                      type="button"
                      onClick={requestRevision}
                      className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-950 dark:text-gray-100"
                    >
                      {t('okanEng.cta.requestRev')}
                    </button>
                  </>
                ) : null}
                {selected.kind === 'B' && selected.workflow === 'approved' ? (
                  <button
                    type="button"
                    onClick={openPoModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
                  >
                    {t('okanEng.cta.createPo')}
                  </button>
                ) : null}
                {selected.kind === 'A' && selected.workflow === 'approved' ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('okanEng.typeA.doneHint')}</p>
                ) : null}
                {selected.kind === 'B' && selected.workflow === 'production_created' ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('okanEng.poLocked')}</p>
                ) : null}
              </div>

              <div
                className="flex gap-1 overflow-x-auto rounded-full bg-gray-100 p-1 shadow-neo-in dark:bg-gray-950/60"
                role="tablist"
              >
                {TABS.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === x.id}
                    onClick={() => setTab(x.id)}
                    className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 md:text-sm ${
                      tab === x.id
                        ? 'bg-gray-100 text-gray-900 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-50'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
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
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-950 dark:text-gray-100"
                    >
                      <Upload className="size-4" aria-hidden />
                      {t('okanEng.upload')}
                    </button>
                  </div>
                  <div className="min-h-0 overflow-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-950/80">
                    <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200/90 bg-gray-100 text-xs font-semibold uppercase text-gray-600 dark:border-gray-700/90 dark:bg-gray-900/90 dark:text-gray-400">
                          <th className="px-3 py-2.5">{t('okanEng.table.name')}</th>
                          <th className="px-3 py-2.5">{t('okanEng.table.type')}</th>
                          <th className="px-3 py-2.5">{t('okanEng.table.lock')}</th>
                          <th className="px-3 py-2.5">{t('okanEng.table.ifc')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.files.map((file) => (
                          <tr key={file.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-50">{file.name}</td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{file.fileType}</td>
                            <td className="px-3 py-2">
                              {file.locked ? (
                                <span className="text-amber-800 dark:text-amber-200">{t('okanEng.lockedYes')}</span>
                              ) : (
                                <span className="text-gray-500">{t('okanEng.lockedNo')}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
                              {file.fileType.toUpperCase() === 'IFC' ? (
                                file.integrationStatus === 'hazir' ? (
                                  t('okanEng.ifc.ok')
                                ) : (
                                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100">
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
                    className="mb-3 flex w-full items-center justify-between rounded-xl bg-gray-100 px-3 py-2.5 text-left text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-950 dark:text-gray-100"
                  >
                    {t('okanEng.manual.section')}
                    {manualOpen ? <ChevronDown className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
                  </button>
                  {manualOpen ? (
                    <div className="space-y-4 rounded-xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {t('okanEng.manual.critical')}
                        </label>
                        <div className="mt-2 space-y-2">
                          <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400" title={t('okanEng.tooltip.concrete')}>
                              {t('okanEng.field.concrete')}
                            </label>
                            <input
                              value={selected.manual.concrete}
                              onChange={(e) => setManual({ concrete: e.target.value })}
                              className="mt-1 w-full max-w-md rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-900 dark:text-gray-100"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400" title={t('okanEng.tooltip.tolerance')}>
                              {t('okanEng.field.tolerance')}
                            </label>
                            <textarea
                              value={selected.manual.toleranceNote}
                              onChange={(e) => setManual({ toleranceNote: e.target.value })}
                              rows={3}
                              className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {t('okanEng.manual.optional')}
                        </label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-100 px-3 py-2.5 shadow-neo-in dark:bg-gray-900/80">
                            <span className="text-sm text-gray-800 dark:text-gray-100">{t('okanEng.field.warn1')}</span>
                            <ToggleSwitch
                              checked={selected.manual.warnAnchorage}
                              onChange={(next) => setManual({ warnAnchorage: next })}
                              aria-label={t('okanEng.field.warn1')}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-100 px-3 py-2.5 shadow-neo-in dark:bg-gray-900/80">
                            <span className="text-sm text-gray-800 dark:text-gray-100">{t('okanEng.field.warn2')}</span>
                            <ToggleSwitch
                              checked={selected.manual.warnFatigue}
                              onChange={(next) => setManual({ warnFatigue: next })}
                              aria-label={t('okanEng.field.warn2')}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('okanEng.manual.footer')}</p>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {tab === 'summary' ? (
                <section className="space-y-4 rounded-xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
                  {(() => {
                    const { done, total } = countChecklistDone(selected.checklist)
                    return (
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                            {t('okanEng.checklist.title')}
                          </h3>
                          <span className="text-sm tabular-nums text-gray-600 dark:text-gray-300">
                            {done} / {total}
                          </span>
                        </div>
                        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 shadow-neo-in dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${(done / total) * 100}%` }}
                          />
                        </div>
                        <ul className="mt-4 divide-y divide-gray-200/90 dark:divide-gray-700/90">
                          {CHECKLIST_ITEMS_OKAN.map((c) => (
                            <li key={c.id}>
                              <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                <div className="min-w-0 flex-1">
                                  <p className={`text-sm ${c.critical ? 'font-medium text-gray-900 dark:text-gray-50' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {t(`okanEng.chk.${c.id}`)}
                                  </p>
                                  <p className="mt-0.5 text-[10px] uppercase tracking-wide">
                                    {c.critical ? (
                                      <span className="font-semibold text-red-600 dark:text-red-400">{t('okanEng.criticalTag')}</span>
                                    ) : (
                                      <span className="text-gray-400">{t('okanEng.optionalTag')}</span>
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
                  <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                    {t('okanEng.rev.hint')} · {t('okanEng.rev.currentLabel')}:{' '}
                    <span className="font-mono font-semibold text-gray-800 dark:text-gray-100">{selected.revisionLabel}</span>
                  </p>
                  <div className="min-h-0 overflow-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-950/80">
                    <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200/90 bg-gray-100 text-xs font-semibold uppercase text-gray-600 dark:border-gray-700/90 dark:bg-gray-900/90 dark:text-gray-400">
                          <th className="px-3 py-2.5">{t('okanEng.rev.colRev')}</th>
                          <th className="px-3 py-2.5">{t('okanEng.rev.colAt')}</th>
                          <th className="px-3 py-2.5">{t('okanEng.rev.colActor')}</th>
                          <th className="px-3 py-2.5">{t('okanEng.rev.colNote')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.revisions.map((r) => (
                          <tr key={r.id} className="border-b border-gray-200/80 dark:border-gray-700/80">
                            <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gray-900 dark:text-gray-50">{r.rev}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400">{r.at}</td>
                            <td className="px-3 py-2.5 text-gray-700 dark:text-gray-200">{r.actor}</td>
                            <td className="px-3 py-2.5 text-gray-700 dark:text-gray-200">{r.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}
            </div>

            <div className="w-full shrink-0 lg:w-[min(100%,300px)]">
              <RiskInsightPanel job={selected} t={t} />
            </div>
          </div>
          </section>
        ) : (
          <div className="flex min-h-[120px] items-center justify-center rounded-2xl bg-gray-100 p-6 shadow-neo-out-sm lg:col-span-8 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('okanEng.empty')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
