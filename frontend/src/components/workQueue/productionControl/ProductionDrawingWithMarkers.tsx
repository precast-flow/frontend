import { useRef, useState } from 'react'
import { AlertTriangle, Check, FileText, X } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import type { ControlPhase, MarkerKind, QualityMarker } from '../../../data/productionQualityControl'
import {
  drawingFallbackImageUrl,
  resolveProductionDrawingSource,
} from '../../../data/productionDrawingMock'
import type { WorkQueueItem } from '../../../data/workQueueMock'
import { QualityMarkerPin } from './QualityMarkerPin'

type Props = {
  item: WorkQueueItem
  phase: ControlPhase
  markers: QualityMarker[]
  disabled?: boolean
  gl: boolean
  onAddPassMarker: (xPct: number, yPct: number) => void
  onRequestAnnotation?: (kind: 'warning' | 'error', xPct: number, yPct: number) => void
  onMarkerSelect?: (marker: QualityMarker) => void
  onGenerateReport?: () => void
  hasQualityReport?: boolean
  totalMarkerCount?: number
}

export function ProductionDrawingWithMarkers({
  item,
  markers,
  disabled = false,
  gl,
  onAddPassMarker,
  onRequestAnnotation,
  onMarkerSelect,
  onGenerateReport,
  hasQualityReport = false,
  totalMarkerCount = 0,
}: Props) {
  const { t } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTool, setActiveTool] = useState<MarkerKind | null>(null)
  const source = resolveProductionDrawingSource(item)
  const [imageUrl, setImageUrl] = useState(
    source.mode === 'image' ? source.url : drawingFallbackImageUrl(),
  )
  const [pdfFailed, setPdfFailed] = useState(false)

  const frameCls = gl
    ? 'overflow-hidden rounded-xl border border-black/12 bg-black/[0.02] dark:border-white/12'
    : 'overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100/80 dark:border-slate-600/60 dark:bg-slate-900/50'

  const toolBtn = (kind: MarkerKind, active: boolean) => {
    const base =
      'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition disabled:opacity-40'
    if (kind === 'pass') {
      return `${base} ${active ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100' : 'border-black/12 text-black/70 dark:border-white/12 dark:text-white/70'}`
    }
    if (kind === 'warning') {
      return `${base} ${active ? 'border-amber-500/50 bg-amber-500/15 text-amber-950 dark:text-amber-100' : 'border-black/12 text-black/70 dark:border-white/12 dark:text-white/70'}`
    }
    return `${base} ${active ? 'border-red-500/50 bg-red-500/15 text-red-950 dark:text-red-100' : 'border-black/12 text-black/70 dark:border-white/12 dark:text-white/70'}`
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !activeTool || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const xPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const yPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
    if (activeTool === 'pass') {
      onAddPassMarker(xPct, yPct)
      return
    }
    onRequestAnnotation?.(activeTool, xPct, yPct)
  }

  const selectTool = (kind: MarkerKind) => {
    setActiveTool((cur) => {
      if (kind === 'pass') return cur === 'pass' ? null : 'pass'
      return cur === kind ? null : kind
    })
  }

  const switchTool = (kind: MarkerKind) => {
    setActiveTool(kind)
  }

  const useImage = source.mode === 'image' || pdfFailed
  const displayImageUrl = useImage ? imageUrl : drawingFallbackImageUrl()

  const handleImageError = () => {
    const fallback = drawingFallbackImageUrl()
    if (imageUrl !== fallback) setImageUrl(fallback)
  }

  const handlePdfError = () => {
    setPdfFailed(true)
    setImageUrl(drawingFallbackImageUrl())
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-black/50 dark:text-white/55">
          {t('unitWorkQueue.qualityMarker.toolbar')}
        </span>
        <button
          type="button"
          disabled={disabled}
          aria-pressed={activeTool === 'pass'}
          className={toolBtn('pass', activeTool === 'pass')}
          onClick={() => selectTool('pass')}
        >
          <Check className="size-3" aria-hidden />
          {t('unitWorkQueue.qualityMarker.pass')}
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-pressed={activeTool === 'warning'}
          className={toolBtn('warning', activeTool === 'warning')}
          onClick={() =>
            activeTool === 'pass' ? switchTool('warning') : selectTool('warning')
          }
        >
          <AlertTriangle className="size-3" aria-hidden />
          {t('unitWorkQueue.qualityMarker.warning')}
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-pressed={activeTool === 'error'}
          className={toolBtn('error', activeTool === 'error')}
          onClick={() => (activeTool === 'pass' ? switchTool('error') : selectTool('error'))}
        >
          <X className="size-3" aria-hidden />
          {t('unitWorkQueue.qualityMarker.error')}
        </button>
      </div>
      <div
        ref={containerRef}
        className={`relative ${frameCls} ${disabled ? 'opacity-60' : ''} ${activeTool && !disabled ? 'cursor-crosshair' : ''}`}
        onClick={handleCanvasClick}
        role="presentation"
      >
        {useImage ? (
          <img
            src={displayImageUrl}
            alt={t('unitWorkQueue.qualityMarker.drawingTitle')}
            className="pointer-events-none h-[min(42vh,360px)] w-full object-contain bg-white dark:bg-slate-950"
            onError={handleImageError}
          />
        ) : (
          <iframe
            title={t('unitWorkQueue.qualityMarker.drawingTitle')}
            src={source.url}
            className="pointer-events-none h-[min(42vh,360px)] w-full border-0 bg-white"
            onError={handlePdfError}
          />
        )}
        {markers.map((m) => (
          <QualityMarkerPin key={m.id} marker={m} onSelect={onMarkerSelect} />
        ))}
      </div>
      {activeTool === 'pass' && !disabled ? (
        <p className="text-center text-[11px] text-emerald-800/80 dark:text-emerald-200/90">
          {t('unitWorkQueue.qualityMarker.passStickyHint')}
        </p>
      ) : null}
      {activeTool === 'error' && !disabled ? (
        <p className="text-center text-[11px] text-black/55 dark:text-white/60">
          {t('unitWorkQueue.qualityMarker.errorHint')}
        </p>
      ) : null}
      {activeTool === 'warning' && !disabled ? (
        <p className="text-center text-[11px] text-black/55 dark:text-white/60">
          {t('unitWorkQueue.qualityMarker.warningHint')}
        </p>
      ) : null}
      {onGenerateReport && totalMarkerCount > 0 && !disabled ? (
        <div className="flex flex-col items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={onGenerateReport}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            <FileText className="size-3.5" aria-hidden />
            {hasQualityReport
              ? t('unitWorkQueue.qcReport.regenerate')
              : t('unitWorkQueue.qcReport.generate')}
          </button>
          <p className="text-center text-[10px] text-black/50 dark:text-white/55">
            {t('unitWorkQueue.qcReport.generateHint')}
          </p>
        </div>
      ) : null}
    </div>
  )
}
