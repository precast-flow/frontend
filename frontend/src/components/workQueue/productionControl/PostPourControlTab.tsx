import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, Printer } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { useWorkQueue } from '../../../context/WorkQueueContext'
import type { CuringReport } from '../../../data/curingReport'
import {
  alreadyWarehouseApproved,
  canApproveWarehouseTransfer,
  canInteractPostPour,
  missingPostPourSteps,
  type ProductionWorkOrderFlowState,
} from '../../../data/productionWorkOrderFlow'
import type { QualityMarker } from '../../../data/productionQualityControl'
import { resolveWorkQueueName, type WorkQueueItem } from '../../../data/workQueueMock'
import { printReportInIframe } from '../../shared/printableReport/printReportInIframe'
import { ProductionDrawingWithMarkers } from './ProductionDrawingWithMarkers'
import { ProductionLabelPrintSheet } from './ProductionLabelPrintSheet'
import { ProductionProcessStepper } from './ProductionProcessStepper'
import { NonconformanceDialog } from './NonconformanceDialog'
import {
  commitMarkerNoteSave,
  openNewMarkerNote,
  type MarkerNoteDialogState,
} from './markerNoteDialogState'
import { WarehouseTransferDialog } from './WarehouseTransferDialog'

type Props = {
  item: WorkQueueItem
  flow: ProductionWorkOrderFlowState
  linkedReports: CuringReport[]
  gl: boolean
  onMarkerSelect?: (marker: QualityMarker) => void
  onGenerateReport?: () => void
  hasQualityReport?: boolean
  totalMarkerCount?: number
}

export function PostPourControlTab({
  item,
  flow,
  linkedReports,
  gl,
  onMarkerSelect,
  onGenerateReport,
  hasQualityReport = false,
  totalMarkerCount = 0,
}: Props) {
  const { t } = useI18n()
  const {
    getMarkers,
    addMarker,
    saveWarningMarkerNote,
    saveNonconformanceFromMarker,
    togglePostPourLabeling,
    togglePostPourSurfaceCleaning,
    approveWarehouseTransfer,
    updateMarkerPosition,
    updateMarkerNote,
    deleteMarker,
  } = useWorkQueue()

  const [noteDialog, setNoteDialog] = useState<MarkerNoteDialogState | null>(null)
  const [focusMarkerId, setFocusMarkerId] = useState<string | null>(null)
  const [warehouseOpen, setWarehouseOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const interactive = canInteractPostPour(flow)
  const hasReport = linkedReports.length > 0
  const canWarehouse = canApproveWarehouseTransfer(flow, hasReport)
  const warehouseDone = alreadyWarehouseApproved(flow)
  const missing = missingPostPourSteps(flow, hasReport)
  const markers = getMarkers(item.id, 'post_pour')

  const labelReportId = `production-label-${item.id}`
  const productionDate =
    item.planDayIso ?? flow.pourApprovedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)

  const cardCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  const curingChild = useMemo(() => {
    return linkedReports[0]
  }, [linkedReports])

  const handleMarkerSelect = (marker: QualityMarker) => {
    if (marker.kind === 'error') {
      if (onMarkerSelect) {
        onMarkerSelect(marker)
        return
      }
      setNoteDialog({ mode: 'existing', marker })
      return
    }
    setFocusMarkerId(marker.id)
  }

  const handlePrintLabel = () => {
    printReportInIframe(labelReportId)
  }

  const handleWarehouseConfirm = (warehouseId: string) => {
    const ok = approveWarehouseTransfer(item, warehouseId)
    if (ok) {
      setWarehouseOpen(false)
      setToast(t('unitWorkQueue.postPour.warehouseSuccess'))
      window.setTimeout(() => setToast(null), 4000)
    }
  }

  const missingLabels = missing.map((step) => {
    if (step === 'labeling') return t('unitWorkQueue.postPour.missingLabeling')
    if (step === 'surface_cleaning') return t('unitWorkQueue.postPour.missingSurface')
    return t('unitWorkQueue.postPour.missingCuringReport')
  })

  return (
    <div className="space-y-4">
      <ProductionProcessStepper flow={flow} hasCuringReport={hasReport} gl={gl} />

      {!interactive ? (
        <p className="rounded-lg bg-amber-500/12 px-3 py-2 text-center text-xs font-semibold text-amber-950 ring-1 ring-amber-500/20 dark:text-amber-100">
          {t('unitWorkQueue.postPour.lockedUntilPour')}
        </p>
      ) : null}

      <section className={cardCls}>
        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t('unitWorkQueue.postPour.contextTitle')}
        </h5>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.productionFlow.document.projectCode')}</dt>
            <dd className="font-medium text-black dark:text-white">
              {item.projectCode} · {item.projectName}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.productionFlow.document.productCode')}</dt>
            <dd className="font-medium text-black dark:text-white">
              {item.productCode ?? '—'} · {item.productName ?? item.title}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.productionFlow.document.orderNo')}</dt>
            <dd className="font-mono font-medium text-black dark:text-white">{item.orderNo}</dd>
          </div>
          <div>
            <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.productionFlow.document.shift')}</dt>
            <dd className="font-medium text-black dark:text-white">{item.shiftLabel ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.postPour.pourApproved')}</dt>
            <dd className="font-medium text-emerald-700 dark:text-emerald-300">
              {flow.pourApprovedAt ? t('unitWorkQueue.postPour.yes') : t('unitWorkQueue.postPour.no')}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.postPour.curingReport')}</dt>
            <dd className="font-medium text-black dark:text-white">
              {curingChild ? curingChild.reportNo : t('unitWorkQueue.postPour.reportPending')}
            </dd>
          </div>
        </dl>
      </section>

      <div
        className={`relative grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] ${!interactive ? 'pointer-events-none opacity-55' : ''}`}
      >
        <ProductionDrawingWithMarkers
          item={item}
          phase="post_pour"
          markers={markers}
          disabled={!interactive || warehouseDone}
          gl={gl}
          focusMarkerId={focusMarkerId}
          onAddPassMarker={(x, y) => {
            const marker = addMarker(item.id, 'post_pour', 'pass', x, y)
            setFocusMarkerId(marker.id)
            return marker.id
          }}
          onRequestWarning={(x, y) => {
            const marker = addMarker(item.id, 'post_pour', 'warning', x, y)
            setFocusMarkerId(marker.id)
            return marker.id
          }}
          onRequestError={(x, y) =>
            setNoteDialog(openNewMarkerNote('error', 'post_pour', x, y))
          }
          onMarkerSelect={handleMarkerSelect}
          onUpdateMarkerPosition={(id, x, y) => updateMarkerPosition(item.id, id, x, y)}
          onUpdateMarkerNote={(id, note) => updateMarkerNote(item.id, id, note)}
          onDeleteMarker={(id) => {
            deleteMarker(item.id, id)
            setFocusMarkerId(null)
          }}
          onOpenNcForMarker={(m) => setNoteDialog({ mode: 'existing', marker: m })}
          onGenerateReport={onGenerateReport}
          hasQualityReport={hasQualityReport}
          totalMarkerCount={totalMarkerCount}
        />

        <aside className="space-y-4">
          <section className={cardCls}>
            <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
              {t('unitWorkQueue.postPour.labelingSection')}
            </h5>
            <button
              type="button"
              disabled={!interactive || warehouseDone}
              onClick={handlePrintLabel}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-sky-500/35 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-950 dark:text-sky-100"
            >
              <Printer className="size-4" aria-hidden />
              {t('unitWorkQueue.postPour.printLabel')}
            </button>
            <ProductionLabelPrintSheet
              item={item}
              reportId={labelReportId}
              productionDate={productionDate}
            />

            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 ${
                flow.postPour.labelingDone
                  ? 'border-emerald-500/30 bg-emerald-500/8'
                  : 'border-black/12 dark:border-white/12'
              } ${warehouseDone ? 'pointer-events-none opacity-70' : ''}`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={flow.postPour.labelingDone}
                disabled={!interactive || warehouseDone}
                onChange={() => togglePostPourLabeling(item.id)}
              />
              {flow.postPour.labelingDone ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="mt-0.5 size-5 shrink-0 text-black/35 dark:text-white/40" />
              )}
              <span className="text-sm text-black dark:text-white">
                {t('unitWorkQueue.postPour.checkLabeling')}
              </span>
            </label>

            <label
              className={`mt-2 flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 ${
                flow.postPour.surfaceCleaningDone
                  ? 'border-emerald-500/30 bg-emerald-500/8'
                  : 'border-black/12 dark:border-white/12'
              } ${warehouseDone ? 'pointer-events-none opacity-70' : ''}`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={flow.postPour.surfaceCleaningDone}
                disabled={!interactive || warehouseDone}
                onChange={() => togglePostPourSurfaceCleaning(item.id)}
              />
              {flow.postPour.surfaceCleaningDone ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="mt-0.5 size-5 shrink-0 text-black/35 dark:text-white/40" />
              )}
              <span className="text-sm text-black dark:text-white">
                {t('unitWorkQueue.postPour.checkSurface')}
              </span>
            </label>
          </section>

          <section className={cardCls}>
            {warehouseDone && flow.postPour.warehouseTransfer ? (
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                  {t('unitWorkQueue.postPour.warehouseDoneTitle')}
                </p>
                <p>
                  <span className="text-black/55 dark:text-white/60">
                    {t('unitWorkQueue.warehouse.selected')}:
                  </span>{' '}
                  {flow.postPour.warehouseTransfer.warehouseLabel}
                </p>
                <p>
                  <span className="text-black/55 dark:text-white/60">
                    {t('unitWorkQueue.warehouse.approvedAt')}:
                  </span>{' '}
                  {new Date(flow.postPour.warehouseTransfer.approvedAt).toLocaleString('tr-TR')}
                </p>
                <p>
                  <span className="text-black/55 dark:text-white/60">
                    {t('unitWorkQueue.warehouse.approvedBy')}:
                  </span>{' '}
                  {resolveWorkQueueName(flow.postPour.warehouseTransfer.approvedByUserId)}
                </p>
              </div>
            ) : (
              <>
                {!hasReport ? (
                  <p className="mb-2 text-xs font-medium text-amber-800 dark:text-amber-200">
                    {t('unitWorkQueue.postPour.curingReportRequired')}
                  </p>
                ) : null}
                {missing.length > 0 && interactive ? (
                  <ul className="mb-3 list-inside list-disc text-xs text-black/65 dark:text-white/70">
                    {missingLabels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                ) : null}
                <button
                  type="button"
                  disabled={!canWarehouse}
                  onClick={() => setWarehouseOpen(true)}
                  className={
                    canWarehouse
                      ? 'w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700'
                      : 'w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm font-semibold text-black/45 dark:border-white/15 dark:text-white/45'
                  }
                >
                  {t('unitWorkQueue.postPour.warehouseApprove')}
                </button>
              </>
            )}
          </section>
        </aside>
      </div>

      {toast ? (
        <p className="rounded-lg bg-emerald-500/15 px-3 py-2 text-center text-xs font-semibold text-emerald-900 dark:text-emerald-100">
          {toast}
        </p>
      ) : null}

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

      <WarehouseTransferDialog
        open={warehouseOpen}
        item={item}
        gl={gl}
        onClose={() => setWarehouseOpen(false)}
        onConfirm={handleWarehouseConfirm}
      />
    </div>
  )
}
