import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, Check, Maximize2, Minus, X, ZoomIn, ZoomOut } from 'lucide-react'
import type { MarkerKind, QualityMarker } from '../../../data/productionQualityControl'
import {
  drawingFallbackImageUrl,
  resolveProductionDrawingSource,
  S2_KOLON_DRAWING_PDF,
} from '../../../data/productionDrawingMock'
import { PdfPageCanvas, type PdfPageLayout } from './PdfPageCanvas'
import type { WorkQueueItem } from '../../../data/workQueueMock'
import { QualityMarkerPin } from '../../workQueue/productionControl/QualityMarkerPin'
import { PmStyleDialog } from '../PmStyleDialog'
import { MarkerEditPopover } from './MarkerEditPopover'
import { MarkerPopoverPortal } from './MarkerPopoverPortal'

export type PdfMarkerViewerMode = 'interactive' | 'readonly'

type Props = {
  item: WorkQueueItem
  markers: QualityMarker[]
  mode?: PdfMarkerViewerMode
  disabled?: boolean
  gl?: boolean
  /** Yeni eklenen işaret — popover otomatik açılır */
  focusMarkerId?: string | null
  toolbarLabels: {
    pass: string
    warning: string
    error: string
    drawingTitle: string
    fullscreen: string
    close: string
    save: string
    delete: string
    nc: string
    dragHint?: string
    zoomIn: string
    zoomOut: string
    resetZoom: string
  }
  onAddPassMarker?: (xPct: number, yPct: number) => string | void
  onRequestWarning?: (xPct: number, yPct: number) => string | void
  onRequestError?: (xPct: number, yPct: number) => void
  onMarkerSelect?: (marker: QualityMarker) => void
  onUpdateMarkerPosition?: (markerId: string, xPct: number, yPct: number) => void
  onUpdateMarkerNote?: (markerId: string, note: string) => void
  onDeleteMarker?: (markerId: string) => void
  onOpenNcForMarker?: (marker: QualityMarker) => void
  reportSlot?: React.ReactNode
}

const MIN_ZOOM = 0.15
const MAX_ZOOM = 4

export function PdfMarkerViewer({
  item,
  markers,
  mode = 'interactive',
  disabled = false,
  gl = false,
  focusMarkerId = null,
  toolbarLabels,
  onAddPassMarker,
  onRequestWarning,
  onRequestError,
  onMarkerSelect,
  onUpdateMarkerPosition,
  onUpdateMarkerNote,
  onDeleteMarker,
  onOpenNcForMarker,
  reportSlot,
}: Props) {
  const readonly = mode === 'readonly' || disabled
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const panRef = useRef({ x: 0, y: 0, dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 })
  const popoverAnchorRef = useRef<HTMLDivElement | null>(null)
  const dragMarkerRef = useRef<{
    id: string
    startX: number
    startY: number
    moved: boolean
    captured: boolean
  } | null>(null)

  const [activeTool, setActiveTool] = useState<MarkerKind | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [fullscreen, setFullscreen] = useState(false)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const fitZoomRef = useRef(1)
  const pageLayoutRef = useRef<PdfPageLayout | null>(null)

  const source = resolveProductionDrawingSource(item)
  const pdfUrl =
    item.kind === 'production'
      ? S2_KOLON_DRAWING_PDF
      : source.mode === 'pdf'
        ? (source.url.split('#')[0]?.split('?')[0] ?? source.url)
        : S2_KOLON_DRAWING_PDF

  const [imageUrl, setImageUrl] = useState(source.mode === 'image' ? source.url : '')
  const [pdfFailed, setPdfFailed] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(0)

  /** Üretim emirleri her zaman PDF; ekran görüntüsü / önizleme PNG kullanılmaz. */
  const usePdf = item.kind === 'production' || source.mode === 'pdf'
  const useImage = !usePdf && source.mode === 'image'

  useEffect(() => {
    setPdfFailed(false)
  }, [item.id, pdfUrl])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setViewportWidth(Math.max(0, Math.floor(el.clientWidth)))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [fullscreen])

  useEffect(() => {
    if (focusMarkerId) setSelectedMarkerId(focusMarkerId)
  }, [focusMarkerId])

  const applyFitZoom = useCallback((layout: PdfPageLayout) => {
    const viewport = containerRef.current
    if (!viewport) return
    const pad = 12
    const cw = Math.max(1, viewport.clientWidth - pad)
    const ch = Math.max(1, viewport.clientHeight - pad)
    const fit = Math.min(cw / layout.width, ch / layout.height, 1)
    const next = Math.max(MIN_ZOOM, Math.min(1, fit))
    fitZoomRef.current = next
    setZoom(next)
    setPan({ x: 0, y: 0 })
  }, [])

  const handlePageLayout = useCallback(
    (layout: PdfPageLayout) => {
      pageLayoutRef.current = layout
      applyFitZoom(layout)
    },
    [applyFitZoom],
  )

  useEffect(() => {
    if (fullscreen || !usePdf || pdfFailed) return
    const layout = pageLayoutRef.current
    if (!layout) return
    const viewport = containerRef.current
    if (!viewport) return
    const ro = new ResizeObserver(() => applyFitZoom(layout))
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [fullscreen, usePdf, pdfFailed, applyFitZoom])

  const frameCls = gl
    ? 'overflow-hidden rounded-xl border border-black/12 bg-black/[0.02] dark:border-white/12'
    : 'overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100/80 dark:border-slate-600/60 dark:bg-slate-900/50'

  const coordsFromEvent = useCallback((clientX: number, clientY: number) => {
    const content = contentRef.current
    if (!content) return null
    const rect = content.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    const xPct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const yPct = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    return { xPct, yPct }
  }, [])

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (readonly) return
    if ((e.target as HTMLElement).closest('[data-marker-popover]')) return
    if (dragMarkerRef.current?.moved) return
    if (dragMarkerRef.current) return
    if (!activeTool) {
      setSelectedMarkerId(null)
      return
    }
    const c = coordsFromEvent(e.clientX, e.clientY)
    if (!c) return
    if (activeTool === 'pass') {
      const id = onAddPassMarker?.(c.xPct, c.yPct)
      if (typeof id === 'string') setSelectedMarkerId(id)
      return
    }
    if (activeTool === 'warning') {
      const id = onRequestWarning?.(c.xPct, c.yPct)
      if (typeof id === 'string') setSelectedMarkerId(id)
      return
    }
    onRequestError?.(c.xPct, c.yPct)
  }

  const onPanStart = (e: React.PointerEvent) => {
    if (e.button !== 0 || activeTool || dragMarkerRef.current) return
    if ((e.target as HTMLElement).closest('[data-marker-pin], [data-marker-popover]')) return
    panRef.current = {
      x: pan.x,
      y: pan.y,
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPanMove = (e: React.PointerEvent) => {
    if (dragMarkerRef.current) return
    if (!panRef.current.dragging) return
    setPan({
      x: panRef.current.originX + (e.clientX - panRef.current.startX),
      y: panRef.current.originY + (e.clientY - panRef.current.startY),
    })
  }

  const onPanEnd = () => {
    panRef.current.dragging = false
    dragMarkerRef.current = null
  }

  const handleMarkerPointerDown = (e: React.PointerEvent, markerId: string, marker: QualityMarker) => {
    e.stopPropagation()
    if (readonly) {
      setSelectedMarkerId(markerId)
      onMarkerSelect?.(marker)
      return
    }
    if (!onUpdateMarkerPosition) return
    dragMarkerRef.current = {
      id: markerId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      captured: false,
    }
    setSelectedMarkerId(markerId)
  }

  const handleMarkerPointerMove = (e: React.PointerEvent, markerId: string) => {
    const drag = dragMarkerRef.current
    if (!drag || drag.id !== markerId || !onUpdateMarkerPosition) return
    e.stopPropagation()
    const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY)
    if (dist > 4) {
      drag.moved = true
      if (!drag.captured) {
        drag.captured = true
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      }
    }
    if (!drag.moved) return
    const c = coordsFromEvent(e.clientX, e.clientY)
    if (c) onUpdateMarkerPosition(markerId, c.xPct, c.yPct)
  }

  const handleMarkerPointerUp = (e: React.PointerEvent, marker: QualityMarker) => {
    const drag = dragMarkerRef.current
    if (!drag || drag.id !== marker.id) return
    e.stopPropagation()
    const wasDrag = drag.moved
    if (drag.captured) {
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }
    }
    dragMarkerRef.current = null
    if (!wasDrag) {
      setSelectedMarkerId(marker.id)
      onMarkerSelect?.(marker)
    }
  }

  const closePopover = useCallback(() => {
    setSelectedMarkerId(null)
  }, [])

  const selectedMarker = markers.find((m) => m.id === selectedMarkerId)

  const viewportHeightClass = fullscreen
    ? 'max-h-[min(85vh,920px)] min-h-[420px]'
    : 'max-h-[min(70vh,680px)] min-h-[300px]'

  const toolbar = (
    <div
      className={
        gl
          ? 'flex min-h-9 shrink-0 items-center justify-between gap-3 rounded-xl border border-black/10 bg-black/[0.03] px-2.5 py-1.5 dark:border-white/10 dark:bg-white/[0.04]'
          : 'flex min-h-9 shrink-0 items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/90 px-2.5 py-1.5 dark:border-slate-600/60 dark:bg-slate-900/40'
      }
    >
      {!readonly ? (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {(['pass', 'warning', 'error'] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              disabled={readonly}
              aria-pressed={activeTool === kind}
              className={toolBtn(kind, activeTool === kind)}
              onClick={() => setActiveTool((cur) => (cur === kind ? null : kind))}
            >
              {kind === 'pass' ? (
                <Check className="size-3 shrink-0" />
              ) : kind === 'warning' ? (
                <AlertTriangle className="size-3 shrink-0" />
              ) : (
                <X className="size-3 shrink-0" />
              )}
              {kind === 'pass'
                ? toolbarLabels.pass
                : kind === 'warning'
                  ? toolbarLabels.warning
                  : toolbarLabels.error}
            </button>
          ))}
        </div>
      ) : (
        <p className="min-w-0 truncate text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          {toolbarLabels.drawingTitle}
        </p>
      )}
      <div className="inline-flex shrink-0 flex-nowrap items-center gap-1">
        <button
          type="button"
          className={zoomBtn}
          aria-label={toolbarLabels.zoomOut}
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.15))}
        >
          <ZoomOut className="size-3.5 shrink-0" />
        </button>
        <button
          type="button"
          className={zoomBtn}
          aria-label={toolbarLabels.resetZoom}
          onClick={() => {
            setZoom(fitZoomRef.current)
            setPan({ x: 0, y: 0 })
          }}
        >
          <Minus className="size-3.5 shrink-0" />
        </button>
        <button
          type="button"
          className={zoomBtn}
          aria-label={toolbarLabels.zoomIn}
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.15))}
        >
          <ZoomIn className="size-3.5 shrink-0" />
        </button>
        <button type="button" className={zoomBtn} onClick={() => setFullscreen(true)}>
          <Maximize2 className="size-3.5 shrink-0" />
          <span className="sr-only">{toolbarLabels.fullscreen}</span>
        </button>
      </div>
    </div>
  )

  const viewerBody = (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {toolbar}
      <div
        ref={containerRef}
        className={`relative ${frameCls} ${viewportHeightClass} overflow-hidden ${!readonly && activeTool ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
        onClick={handleCanvasClick}
        onPointerDown={onPanStart}
        onPointerMove={onPanMove}
        onPointerUp={onPanEnd}
        onPointerLeave={onPanEnd}
      >
        <div
          ref={contentRef}
          className="relative block w-full min-w-0 origin-top-left"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          {useImage ? (
            <img
              src={imageUrl || drawingFallbackImageUrl()}
              alt={toolbarLabels.drawingTitle}
              className="pointer-events-none block h-auto w-full max-w-full bg-white object-contain dark:bg-slate-950"
              onError={() => setImageUrl(drawingFallbackImageUrl())}
            />
          ) : usePdf && pdfFailed ? (
            <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-amber-400/60 bg-amber-50/80 px-4 py-6 text-center dark:border-amber-500/40 dark:bg-amber-950/30">
              <p className="text-xs font-medium text-amber-950 dark:text-amber-100">
                PDF yüklenemedi.
              </p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-sky-700 underline hover:text-sky-800 dark:text-sky-300"
              >
                {pdfUrl}
              </a>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                onClick={() => setPdfFailed(false)}
              >
                Tekrar dene
              </button>
            </div>
          ) : usePdf && viewportWidth > 0 ? (
            <PdfPageCanvas
              pdfUrl={pdfUrl}
              alt={toolbarLabels.drawingTitle}
              layoutWidth={viewportWidth}
              onLoadError={() => setPdfFailed(true)}
              onPageLayout={handlePageLayout}
            />
          ) : usePdf ? (
            <div className="flex min-h-[200px] w-full items-center justify-center bg-white text-xs text-slate-500 dark:bg-slate-950">
              PDF…
            </div>
          ) : null}
          {markers.map((m) => {
            const isSelected = selectedMarkerId === m.id
            return (
              <div
                key={m.id}
                ref={isSelected ? popoverAnchorRef : undefined}
                data-marker-pin
                className={
                  readonly || !onUpdateMarkerPosition
                    ? 'absolute touch-none'
                    : 'absolute cursor-grab touch-none active:cursor-grabbing'
                }
                style={{
                  position: 'absolute',
                  left: `${m.xPct}%`,
                  top: `${m.yPct}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isSelected ? 25 : 15,
                }}
                onPointerDown={(e) => handleMarkerPointerDown(e, m.id, m)}
                onPointerMove={(e) => handleMarkerPointerMove(e, m.id)}
                onPointerUp={(e) => handleMarkerPointerUp(e, m)}
                onPointerCancel={(e) => handleMarkerPointerUp(e, m)}
              >
                <QualityMarkerPin marker={m} selected={isSelected} />
              </div>
            )
          })}
        </div>
      </div>
      {reportSlot}
    </div>
  )

  return (
    <>
      <MarkerPopoverPortal
        anchorRef={popoverAnchorRef}
        open={Boolean(selectedMarker)}
        repositionKey={`${zoom}-${pan.x}-${pan.y}-${selectedMarkerId}`}
      >
        {selectedMarker ? (
          <MarkerEditPopover
            marker={selectedMarker}
            readOnly={readonly}
            closeLabel={toolbarLabels.close}
            saveLabel={toolbarLabels.save}
            deleteLabel={toolbarLabels.delete}
            ncLabel={toolbarLabels.nc}
            dragHint={readonly ? undefined : toolbarLabels.dragHint}
            onClose={closePopover}
            onSaveNote={(note) => onUpdateMarkerNote?.(selectedMarker.id, note)}
            onDelete={
              onDeleteMarker ? () => onDeleteMarker(selectedMarker.id) : undefined
            }
            onOpenNc={
              selectedMarker.kind === 'error' && onOpenNcForMarker
                ? () => onOpenNcForMarker(selectedMarker)
                : undefined
            }
          />
        ) : null}
      </MarkerPopoverPortal>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{viewerBody}</div>
      {fullscreen ? (
        <PmStyleDialog
          title={toolbarLabels.drawingTitle}
          closeLabel={toolbarLabels.close}
          onClose={() => setFullscreen(false)}
          size="fullscreen"
        >
          {viewerBody}
        </PmStyleDialog>
      ) : null}
    </>
  )
}

const zoomBtn =
  'inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white/80 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200'

function toolBtn(kind: MarkerKind, active: boolean) {
  const base =
    'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition disabled:opacity-40'
  if (kind === 'pass') {
    return `${base} ${active ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-900' : 'border-slate-200/80 text-slate-700'}`
  }
  if (kind === 'warning') {
    return `${base} ${active ? 'border-amber-500/50 bg-amber-500/15 text-amber-950' : 'border-slate-200/80 text-slate-700'}`
  }
  return `${base} ${active ? 'border-red-500/50 bg-red-500/15 text-red-950' : 'border-slate-200/80 text-slate-700'}`
}
