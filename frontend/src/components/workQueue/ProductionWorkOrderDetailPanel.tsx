import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, Lock } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useWorkQueue } from '../../context/WorkQueueContext'
import {
  PRE_POUR_CHECKS,
  alreadyPourApproved,
  buildSpawnedWorkOrders,
  canApprovePour,
  canInteractPostPour,
} from '../../data/productionWorkOrderFlow'
import type { QualityMarker } from '../../data/productionQualityControl'
import {
  type WorkQueueItem,
  type WorkQueueOrgUnit,
  type WorkQueuePerspective,
} from '../../data/workQueueMock'
import {
  DetailTwoColumnLayout,
  splitDetailPanelBodyClass,
  splitTabPill,
  splitTabPillLocked,
  StickyDetailTabBar,
} from '../shared/splitModuleStyles'
import { PdfMarkerViewer } from '../shared/pdfMarker/PdfMarkerViewer'
import { SpawnedWorkOrdersList } from './productionControl/SpawnedWorkOrdersList'
import { CuringReportView } from './CuringReportView'
import { ProductionProjectDocumentView } from './ProductionProjectDocumentView'
import { ProductionDrawingWithMarkers } from './productionControl/ProductionDrawingWithMarkers'
import { ProductionProcessStepper } from './productionControl/ProductionProcessStepper'
import { NonconformanceDialog } from './productionControl/NonconformanceDialog'
import {
  commitMarkerNoteSave,
  openNewMarkerNote,
  type MarkerNoteDialogState,
} from './productionControl/markerNoteDialogState'
import { useOpenQualityControlReport } from './useOpenQualityControlReport'
import { ProductionNonconformancesList } from './productionControl/ProductionNonconformancesList'
import { QualityReportComposeDialog } from './productionControl/QualityReportComposeDialog'
import { PostPourControlTab } from './productionControl/PostPourControlTab'
import { PourSpawnPreviewDialog } from './productionControl/PourSpawnPreviewDialog'
import type { QualityReportIncludeKinds } from '../../data/qualityControlReport'

type TabId = 'document' | 'prePour' | 'spawned' | 'nonconformances' | 'postPour'

type Props = {
  item: WorkQueueItem
  gl: boolean
  onOpenInList?: (
    workQueueId: string,
    opts: { perspective: WorkQueuePerspective; unit: WorkQueueOrgUnit | 'all' },
  ) => void
}

const TAB_ORDER: readonly { id: TabId; key: string; locked?: boolean }[] = [
  { id: 'document', key: 'unitWorkQueue.productionFlow.tab.document' },
  { id: 'prePour', key: 'unitWorkQueue.productionFlow.tab.prePour' },
  { id: 'spawned', key: 'unitWorkQueue.productionFlow.tab.spawned' },
  { id: 'postPour', key: 'unitWorkQueue.productionFlow.tab.postPour', locked: true },
  { id: 'nonconformances', key: 'unitWorkQueue.productionFlow.tab.nonconformances' },
]

export function ProductionWorkOrderDetailPanel({ item, gl, onOpenInList }: Props) {
  const { t } = useI18n()
  const {
    getProductionFlowState,
    togglePrePourCheck,
    approvePourSpawn,
    getSpawnedChildren,
    getCuringReport,
    getCuringReportsForProductionOrder,
    getCuringReportsForProduct,
    getMarkers,
    addMarker,
    saveWarningMarkerNote,
    saveNonconformanceFromMarker,
    getNonconformancesForProductionOrder,
    getMarkerCountsForProduction,
    getAllMarkersForProduction,
    getQualityControlReport,
    generateQualityControlReport,
    updateMarkerPosition,
    updateMarkerNote,
    deleteMarker,
  } = useWorkQueue()
  const openQualityControlReport = useOpenQualityControlReport()
  const [tab, setTab] = useState<TabId>('document')
  const [toast, setToast] = useState<string | null>(null)
  const [reportCuringId, setReportCuringId] = useState<string | null>(null)
  const [noteDialog, setNoteDialog] = useState<MarkerNoteDialogState | null>(null)
  const [composeReportOpen, setComposeReportOpen] = useState(false)
  const [reportGenerating, setReportGenerating] = useState(false)
  const [focusMarkerId, setFocusMarkerId] = useState<string | null>(null)
  const [spawnPreviewOpen, setSpawnPreviewOpen] = useState(false)
  const [spawnConfirming, setSpawnConfirming] = useState(false)

  const ncRecords = useMemo(
    () => getNonconformancesForProductionOrder(item.id),
    [getNonconformancesForProductionOrder, item.id],
  )

  const qualityReport = getQualityControlReport(item.id)
  const markerCounts = getMarkerCountsForProduction(item.id)
  const markerSpotById = useMemo(() => {
    const map: Record<string, string | undefined> = {}
    for (const marker of getAllMarkersForProduction(item.id)) {
      if (marker.spotSnapshotUrl) map[marker.id] = marker.spotSnapshotUrl
    }
    return map
  }, [getAllMarkersForProduction, item.id])
  const totalMarkers = markerCounts.pass + markerCounts.warning + markerCounts.error

  const openMarkerNoteDialog = (marker: QualityMarker) => {
    if (marker.kind === 'error') {
      setNoteDialog({ mode: 'existing', marker })
      return
    }
    setFocusMarkerId(marker.id)
  }

  const handleComposeReport = async (include: QualityReportIncludeKinds) => {
    setReportGenerating(true)
    try {
      const report = await generateQualityControlReport(item, include)
      if (report) {
        openQualityControlReport(item.id)
        setToast(t('unitWorkQueue.qcReport.generatedToast'))
        window.setTimeout(() => setToast(null), 4000)
      }
    } finally {
      setReportGenerating(false)
    }
  }

  const openQualityReport = () => {
    if (qualityReport) openQualityControlReport(item.id)
    else setComposeReportOpen(true)
  }

  const flow = getProductionFlowState(item.id)
  const approved = alreadyPourApproved(flow)
  const canApprove = canApprovePour(flow)
  const postPourInteractive = canInteractPostPour(flow)
  const checkedCount = PRE_POUR_CHECKS.filter((c) => flow.checklist[c.id]).length
  const spawned = useMemo(() => getSpawnedChildren(item.id), [getSpawnedChildren, item.id])
  const operationalSpawned = useMemo(
    () => spawned.filter((child) => child.kind !== 'nonconformance'),
    [spawned],
  )
  const linkedReports = useMemo(() => {
    const byOrder = getCuringReportsForProductionOrder(item.id)
    const byProduct = item.productCode ? getCuringReportsForProduct(item.productCode) : []
    const map = new Map(byOrder.map((r) => [r.id, r]))
    for (const r of byProduct) map.set(r.id, r)
    return [...map.values()]
  }, [getCuringReportsForProductionOrder, getCuringReportsForProduct, item.id, item.productCode])
  const activeReport = reportCuringId ? getCuringReport(reportCuringId) : undefined
  const prePourMarkers = getMarkers(item.id, 'pre_pour')
  const allMarkers = useMemo(() => getAllMarkersForProduction(item.id), [getAllMarkersForProduction, item.id])
  const ncWorkOrders = useMemo(
    () => spawned.filter((c) => c.kind === 'nonconformance'),
    [spawned],
  )

  const handleApproveClick = () => {
    if (approved) {
      setTab('spawned')
      return
    }
    if (!canApprove) return
    setSpawnPreviewOpen(true)
  }

  const spawnPreviewRows = useMemo(
    () => buildSpawnedWorkOrders(item, Date.now()),
    [item, spawnPreviewOpen],
  )

  const handleSpawnConfirm = () => {
    setSpawnConfirming(true)
    const ok = approvePourSpawn(item)
    setSpawnConfirming(false)
    setSpawnPreviewOpen(false)
    if (ok) {
      setToast(t('unitWorkQueue.productionFlow.approveSuccess'))
      setTab('spawned')
      window.setTimeout(() => setToast(null), 4000)
    }
  }

  if (activeReport) {
    return (
      <div className={`flex min-h-0 flex-1 flex-col ${splitDetailPanelBodyClass}`}>
        <CuringReportView
          report={activeReport}
          gl={gl}
          onBack={() => setReportCuringId(null)}
        />
      </div>
    )
  }

  return (
    <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${splitDetailPanelBodyClass}`}>
      <StickyDetailTabBar gl={gl} aria-label={t('unitWorkQueue.productionFlow.tablist')}>
          {TAB_ORDER.map(({ id, key, locked }) => {
            const isActive = tab === id
            const showLock = Boolean(locked && !postPourInteractive)
            const tabOpts = { gl }
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(id)}
                className={
                  locked
                    ? `${splitTabPillLocked(isActive, showLock, tabOpts)} inline-flex items-center gap-1`
                    : splitTabPill(isActive, tabOpts)
                }
              >
                {showLock ? <Lock className="size-3 opacity-60" aria-hidden /> : null}
                {t(key)}
              </button>
            )
          })}
      </StickyDetailTabBar>

      {toast ? (
        <p
          className="mx-auto max-w-md shrink-0 rounded-lg bg-emerald-500/15 px-3 py-2 text-center text-xs font-semibold text-emerald-900 ring-1 ring-emerald-500/25 dark:text-emerald-100"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      <div className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-4 pt-1 ${splitDetailPanelBodyClass}`}>
        {tab !== 'postPour' ? (
          <ProductionProcessStepper
            flow={flow}
            hasCuringReport={linkedReports.length > 0}
            gl={gl}
          />
        ) : null}

        {tab === 'document' ? (
          <div className={`${splitDetailPanelBodyClass} mt-3 space-y-4`}>
            <ProductionProjectDocumentView item={item} gl={gl} />
          </div>
        ) : null}

        {tab === 'prePour' ? (
          <div className={`${splitDetailPanelBodyClass} mt-3 space-y-4`}>
            {approved ? (
              <p className="rounded-lg bg-sky-500/12 px-3 py-2 text-center text-xs font-semibold text-sky-950 ring-1 ring-sky-500/20 dark:text-sky-100">
                {t('unitWorkQueue.productionFlow.approvedBanner')}
              </p>
            ) : null}

            <DetailTwoColumnLayout
              className="lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
              primary={
                <div className="flex min-h-0 flex-1 flex-col">
                  <ProductionDrawingWithMarkers
                    item={item}
                    phase="pre_pour"
                    markers={prePourMarkers}
                    disabled={approved}
                    gl={gl}
                    focusMarkerId={focusMarkerId}
                    onAddPassMarker={(x, y) => {
                      const marker = addMarker(item.id, 'pre_pour', 'pass', x, y)
                      setFocusMarkerId(marker.id)
                      return marker.id
                    }}
                    onRequestWarning={(x, y) => {
                      const marker = addMarker(item.id, 'pre_pour', 'warning', x, y)
                      setFocusMarkerId(marker.id)
                      return marker.id
                    }}
                    onRequestError={(x, y) =>
                      setNoteDialog(openNewMarkerNote('error', 'pre_pour', x, y))
                    }
                    onMarkerSelect={openMarkerNoteDialog}
                    onUpdateMarkerPosition={(id, x, y) => updateMarkerPosition(item.id, id, x, y)}
                    onUpdateMarkerNote={(id, note) => updateMarkerNote(item.id, id, note)}
                    onDeleteMarker={(id) => {
                      deleteMarker(item.id, id)
                      setFocusMarkerId(null)
                    }}
                    onOpenNcForMarker={(m) => setNoteDialog({ mode: 'existing', marker: m })}
                    onGenerateReport={openQualityReport}
                    hasQualityReport={Boolean(qualityReport)}
                    totalMarkerCount={totalMarkers}
                  />
                </div>
              }
              secondary={
                <aside
                  className={
                    gl
                      ? 'flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-black/12 bg-black/[0.02] dark:border-white/12 dark:bg-white/[0.03]'
                      : 'flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white/70 shadow-sm dark:border-slate-600/60 dark:bg-slate-900/40'
                  }
                >
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-3 dark:border-slate-600/60">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {t('unitWorkQueue.productionFlow.tab.prePour')}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                        checkedCount === PRE_POUR_CHECKS.length
                          ? 'bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/25 dark:text-emerald-100'
                          : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600'
                      }`}
                    >
                      {t('unitWorkQueue.productionFlow.checkProgress', {
                        done: String(checkedCount),
                        total: String(PRE_POUR_CHECKS.length),
                      })}
                    </span>
                  </div>

                  <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
                    {PRE_POUR_CHECKS.map((check) => {
                      const done = flow.checklist[check.id]
                      return (
                        <li key={check.id}>
                          <label
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                              done
                                ? 'border-emerald-500/30 bg-emerald-500/8 dark:border-emerald-400/25'
                                : gl
                                  ? 'border-black/12 hover:bg-black/[0.03] dark:border-white/12'
                                  : 'border-slate-200/80 hover:bg-slate-50/80 dark:border-slate-600/60'
                            } ${approved ? 'pointer-events-none opacity-70' : ''}`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={done}
                              disabled={approved}
                              onChange={() => togglePrePourCheck(item.id, check.id)}
                            />
                            {done ? (
                              <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Circle className="size-5 shrink-0 text-slate-300 dark:text-slate-500" />
                            )}
                            <span className="min-w-0 flex-1 text-left text-sm leading-snug text-slate-800 dark:text-slate-100">
                              {t(check.labelKey)}
                            </span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>

                  <div className="shrink-0 space-y-2 border-t border-slate-200/80 px-4 py-3 dark:border-slate-600/60">
                    <button
                      type="button"
                      disabled={!canApprove || approved}
                      onClick={handleApproveClick}
                      className={
                        canApprove && !approved
                          ? 'w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50'
                          : 'w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-400 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-500'
                      }
                    >
                      {t('unitWorkQueue.productionFlow.approvePour')}
                    </button>
                    {!canApprove && !approved ? (
                      <p className="text-center text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {t('unitWorkQueue.productionFlow.approveHint')}
                      </p>
                    ) : null}
                  </div>
                </aside>
              }
            />
          </div>
        ) : null}

        {tab === 'spawned' ? (
          <div className={`${splitDetailPanelBodyClass} mt-3 space-y-3`}>
            <p className="rounded-lg bg-black/[0.04] px-3 py-2 text-left text-[11px] leading-relaxed text-black/70 dark:bg-white/[0.06] dark:text-white/75">
              {t('unitWorkQueue.productionFlow.spawnHowTo')}
            </p>
            <SpawnedWorkOrdersList
              parent={item}
              children={operationalSpawned}
              ncWorkOrders={ncWorkOrders}
              gl={gl}
              onOpenInList={onOpenInList}
              onOpenCuringReport={setReportCuringId}
              hasCuringReport={(id) => Boolean(getCuringReport(id))}
            />
          </div>
        ) : null}

        {tab === 'nonconformances' ? (
          <div className={`${splitDetailPanelBodyClass} mt-3 space-y-4`}>
            <ProductionNonconformancesList
              qualityReport={qualityReport}
              records={ncRecords}
              markerSpotById={markerSpotById}
              gl={gl}
              onOpenReport={() => openQualityControlReport(item.id)}
              onGenerateReport={openQualityReport}
              onOpenWorkOrder={
                onOpenInList
                  ? (wqId) => onOpenInList(wqId, { perspective: 'by_me', unit: 'production' })
                  : undefined
              }
            />
            <PdfMarkerViewer
              item={item}
              markers={allMarkers}
              mode="readonly"
              gl={gl}
              toolbarLabels={{
                pass: t('unitWorkQueue.qualityMarker.pass'),
                warning: t('unitWorkQueue.qualityMarker.warning'),
                error: t('unitWorkQueue.qualityMarker.error'),
                drawingTitle: t('unitWorkQueue.ncPreview.drawingTitle'),
                fullscreen: t('unitWorkQueue.qualityMarker.fullscreen'),
                close: t('unitWorkQueue.close'),
                save: t('unitWorkQueue.save'),
                delete: t('unitWorkQueue.delete'),
                nc: t('unitWorkQueue.qualityMarker.openNc'),
                zoomIn: t('unitWorkQueue.qualityMarker.zoomIn'),
                zoomOut: t('unitWorkQueue.qualityMarker.zoomOut'),
                resetZoom: t('unitWorkQueue.qualityMarker.resetZoom'),
              }}
            />
          </div>
        ) : null}

        {tab === 'postPour' ? (
          <div className="mt-3">
            <PostPourControlTab
              item={item}
              flow={flow}
              linkedReports={linkedReports}
              gl={gl}
              onMarkerSelect={openMarkerNoteDialog}
              onGenerateReport={openQualityReport}
              hasQualityReport={Boolean(qualityReport)}
              totalMarkerCount={totalMarkers}
            />
          </div>
        ) : null}
      </div>

      {noteDialog ? (
        <NonconformanceDialog
          open
          item={item}
          marker={noteDialog.mode === 'existing' ? noteDialog.marker : undefined}
          pendingPlacement={noteDialog.mode === 'new' ? noteDialog.placement : undefined}
          gl={gl}
          onClose={() => setNoteDialog(null)}
          onSave={(input) => {
            commitMarkerNoteSave(item, noteDialog, input, {
              addMarker,
              saveWarningMarkerNote,
              saveNonconformanceFromMarker,
            })
            if (noteDialog.mode === 'new') {
              const { placement } = noteDialog
              if (placement.kind === 'error') {
                const markersAfter = getMarkers(item.id, placement.phase)
                const latest = markersAfter
                  .filter((m) => m.kind === 'error')
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
                if (latest) setFocusMarkerId(latest.id)
              }
            } else if (noteDialog.marker) {
              setFocusMarkerId(noteDialog.marker.id)
            }
            setNoteDialog(null)
          }}
        />
      ) : null}

      <QualityReportComposeDialog
        open={composeReportOpen}
        itemLabel={`${item.orderNo} · ${item.productName ?? item.title}`}
        counts={markerCounts}
        gl={gl}
        replacingExisting={Boolean(qualityReport)}
        busy={reportGenerating}
        onClose={() => setComposeReportOpen(false)}
        onConfirm={handleComposeReport}
      />

      <PourSpawnPreviewDialog
        open={spawnPreviewOpen}
        parent={item}
        previewRows={spawnPreviewRows}
        confirming={spawnConfirming}
        onClose={() => setSpawnPreviewOpen(false)}
        onConfirm={handleSpawnConfirm}
      />
    </div>
  )
}
