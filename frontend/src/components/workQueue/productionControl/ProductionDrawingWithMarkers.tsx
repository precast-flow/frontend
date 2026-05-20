import { useI18n } from '../../../i18n/I18nProvider'
import type { ControlPhase, QualityMarker } from '../../../data/productionQualityControl'
import type { WorkQueueItem } from '../../../data/workQueueMock'
import { PdfMarkerViewer } from '../../shared/pdfMarker/PdfMarkerViewer'

type Props = {
  item: WorkQueueItem
  phase: ControlPhase
  markers: QualityMarker[]
  disabled?: boolean
  gl: boolean
  focusMarkerId?: string | null
  onAddPassMarker: (xPct: number, yPct: number) => string | void
  onRequestWarning?: (xPct: number, yPct: number) => string | void
  onRequestError?: (xPct: number, yPct: number) => void
  onMarkerSelect?: (marker: QualityMarker) => void
  onUpdateMarkerPosition?: (markerId: string, xPct: number, yPct: number) => void
  onUpdateMarkerNote?: (markerId: string, note: string) => void
  onDeleteMarker?: (markerId: string) => void
  onOpenNcForMarker?: (marker: QualityMarker) => void
  onGenerateReport?: () => void
  hasQualityReport?: boolean
  totalMarkerCount?: number
}

export function ProductionDrawingWithMarkers({
  item,
  markers,
  disabled = false,
  gl,
  focusMarkerId,
  onAddPassMarker,
  onRequestWarning,
  onRequestError,
  onMarkerSelect,
  onUpdateMarkerPosition,
  onUpdateMarkerNote,
  onDeleteMarker,
  onOpenNcForMarker,
  onGenerateReport,
  hasQualityReport = false,
  totalMarkerCount = 0,
}: Props) {
  const { t } = useI18n()

  return (
    <PdfMarkerViewer
      item={item}
      markers={markers}
      mode={disabled ? 'readonly' : 'interactive'}
      disabled={disabled}
      gl={gl}
      focusMarkerId={focusMarkerId}
      toolbarLabels={{
        pass: t('unitWorkQueue.qualityMarker.pass'),
        warning: t('unitWorkQueue.qualityMarker.warning'),
        error: t('unitWorkQueue.qualityMarker.error'),
        drawingTitle: t('unitWorkQueue.qualityMarker.drawingTitle'),
        fullscreen: t('unitWorkQueue.qualityMarker.fullscreen'),
        close: t('unitWorkQueue.close'),
        save: t('unitWorkQueue.save'),
        delete: t('unitWorkQueue.delete'),
        nc: t('unitWorkQueue.qualityMarker.openNc'),
        dragHint: t('unitWorkQueue.qualityMarker.dragHint'),
        zoomIn: t('unitWorkQueue.qualityMarker.zoomIn'),
        zoomOut: t('unitWorkQueue.qualityMarker.zoomOut'),
        resetZoom: t('unitWorkQueue.qualityMarker.resetZoom'),
      }}
      onAddPassMarker={onAddPassMarker}
      onRequestWarning={onRequestWarning}
      onRequestError={onRequestError}
      onMarkerSelect={onMarkerSelect}
      onUpdateMarkerPosition={onUpdateMarkerPosition}
      onUpdateMarkerNote={onUpdateMarkerNote}
      onDeleteMarker={onDeleteMarker}
      onOpenNcForMarker={onOpenNcForMarker}
      reportSlot={
        onGenerateReport && totalMarkerCount > 0 && !disabled ? (
          <div className="flex shrink-0 justify-end border-t border-slate-200/80 pt-2 dark:border-slate-600/60">
            <button
              type="button"
              onClick={onGenerateReport}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700"
            >
              {hasQualityReport
                ? t('unitWorkQueue.qcReport.regenerate')
                : t('unitWorkQueue.qcReport.generate')}
            </button>
          </div>
        ) : null
      }
    />
  )
}
