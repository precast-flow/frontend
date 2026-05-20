import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS,
  ResponsiveGridLayout,
  useContainerWidth,
  verticalCompactor,
  type Layout,
  type ResponsiveLayouts,
} from 'react-grid-layout'
import { useI18n } from '../../i18n/I18nProvider'
import { useDashboard } from '../../context/DashboardContext'
import { endCatalogDrag, getCatalogDrag, type CatalogDragPayload } from './catalogDragState'
import { autoScrollForPointer, findDashboardScrollPane } from './dragAutoScroll'
import { DashboardDropPreview } from './DashboardDropPreview'
import { dropPreviewFromPointer, isDroppingPlaceholderId, type DropPreviewRect } from './gridDropUtils'
import { WidgetFrame } from './WidgetFrame'

const GRID_ROW_HEIGHT = 56
const GRID_MARGIN: [number, number] = [16, 16]

type Props = {
  onModuleNavigate?: (id: string) => void
}

function sanitizeLayouts(layouts: ResponsiveLayouts): ResponsiveLayouts {
  const out: ResponsiveLayouts = {}
  for (const [bp, items] of Object.entries(layouts)) {
    out[bp] = items?.filter((it) => !isDroppingPlaceholderId(it.i)) ?? []
  }
  return out
}

function pointerInRect(clientX: number, clientY: number, el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom
}

export function DashboardGrid({ onModuleNavigate }: Props) {
  const { t } = useI18n()
  const {
    activeDashboard,
    editMode,
    setLayouts,
    addWidget,
    beginLayoutGesture,
    endLayoutGesture,
  } = useDashboard()
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1280 })
  const [dropPreview, setDropPreview] = useState<DropPreviewRect | null>(null)
  const [dragPayload, setDragPayload] = useState<CatalogDragPayload | null>(null)

  const dropPreviewRef = useRef<DropPreviewRect | null>(null)
  const dropCommittedRef = useRef(false)
  const rafRef = useRef(0)
  const lastPointerRef = useRef({ x: 0, y: 0 })

  const layouts = activeDashboard?.layouts ?? { lg: [] }
  const widgets = activeDashboard?.widgets ?? []

  const commitCatalogDrop = useCallback(() => {
    if (dropCommittedRef.current) return
    const drag = getCatalogDrag()
    const preview = dropPreviewRef.current
    if (!drag || !preview) return

    dropCommittedRef.current = true
    endCatalogDrag()
    dropPreviewRef.current = null
    setDropPreview(null)
    setDragPayload(null)

    addWidget(drag.type, {
      position: { x: preview.x, y: preview.y },
      size: { w: drag.w, h: drag.h },
    })
  }, [addWidget])

  const dragConfig = useMemo(
    () => ({
      enabled: editMode,
      handle: '.dash-drag',
      cancel:
        'button,textarea,input,select,a,.recharts-wrapper,.dash-widget-delete,.dash-catalog-tile',
    }),
    [editMode],
  )

  const resizeConfig = useMemo(
    () => ({
      enabled: editMode,
      handles: ['se'] as const,
    }),
    [editMode],
  )

  const onLayoutChange = useCallback(
    (_layout: Layout, allLayouts: ResponsiveLayouts) => {
      setLayouts(sanitizeLayouts(allLayouts), { skipHistory: true })
    },
    [setLayouts],
  )

  const onGridDragStart = useCallback(() => {
    if (!editMode) return
    beginLayoutGesture()
    const scrollEl = findDashboardScrollPane(containerRef.current)
    const onMove = (ev: MouseEvent) => autoScrollForPointer(ev.clientY, scrollEl)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', () => document.removeEventListener('mousemove', onMove), {
      once: true,
    })
  }, [editMode, containerRef, beginLayoutGesture])

  const onGridDragStop = useCallback(() => {
    endLayoutGesture()
  }, [endLayoutGesture])

  const onGridResizeStart = useCallback(() => {
    if (editMode) beginLayoutGesture()
  }, [editMode, beginLayoutGesture])

  const onGridResizeStop = useCallback(() => {
    endLayoutGesture()
  }, [endLayoutGesture])

  useEffect(() => {
    if (!editMode) {
      dropPreviewRef.current = null
      setDropPreview(null)
      setDragPayload(null)
      return
    }

    const updatePreview = (clientX: number, clientY: number) => {
      const drag = getCatalogDrag()
      if (!drag || !mounted || width <= 0) return

      const host = containerRef.current
      const gridEl = host?.querySelector('.react-grid-layout') as HTMLElement | null
      if (!host || !gridEl) return

      const rect = dropPreviewFromPointer(clientX, clientY, gridEl, width, drag.w, drag.h)
      dropPreviewRef.current = rect
      setDragPayload(drag)
      setDropPreview(rect)
    }

    const onDragOver = (e: DragEvent) => {
      if (!getCatalogDrag()) return

      const host = containerRef.current
      const gridEl = host?.querySelector('.react-grid-layout') as HTMLElement | null
      if (!host || !gridEl || !mounted || width <= 0) return

      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'

      lastPointerRef.current = { x: e.clientX, y: e.clientY }
      autoScrollForPointer(e.clientY, findDashboardScrollPane(host))

      if (rafRef.current) return
      const x = e.clientX
      const y = e.clientY
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        updatePreview(x, y)
      })
    }

    const onDrop = (e: DragEvent) => {
      if (!getCatalogDrag()) return
      e.preventDefault()
      e.stopPropagation()
      commitCatalogDrop()
    }

    const onDragEnd = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0

      const host = containerRef.current
      const gridEl = host?.querySelector('.react-grid-layout') as HTMLElement | null
      const { x, y } = lastPointerRef.current

      if (
        !dropCommittedRef.current &&
        getCatalogDrag() &&
        dropPreviewRef.current &&
        gridEl &&
        pointerInRect(x, y, gridEl)
      ) {
        commitCatalogDrop()
      }

      endCatalogDrag()
      dropCommittedRef.current = false
      dropPreviewRef.current = null
      setDropPreview(null)
      setDragPayload(null)
    }

    const onDragStart = () => {
      dropCommittedRef.current = false
      dropPreviewRef.current = null
      setDropPreview(null)
      setDragPayload(null)
    }

    document.addEventListener('dragstart', onDragStart)
    document.addEventListener('dragover', onDragOver)
    document.addEventListener('drop', onDrop)
    document.addEventListener('dragend', onDragEnd)

    return () => {
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('dragstart', onDragStart)
      document.removeEventListener('dragover', onDragOver)
      document.removeEventListener('drop', onDrop)
      document.removeEventListener('dragend', onDragEnd)
    }
  }, [editMode, mounted, width, containerRef, commitCatalogDrop])

  if (!activeDashboard) {
    return (
      <p className="py-12 text-center text-sm text-[var(--glass-text-muted)]">Pano yükleniyor…</p>
    )
  }

  return (
    <div
      ref={containerRef}
      className={[
        'dashboard-grid-host relative w-full px-1 pb-2 md:px-2',
        dropPreview ? 'dashboard-grid-host--drop-active' : '',
      ].join(' ')}
    >
      {dropPreview && dragPayload ? (
        <DashboardDropPreview drag={dragPayload} rect={dropPreview} />
      ) : null}

      {mounted && width > 0 ? (
        <ResponsiveGridLayout
          width={width}
          layouts={layouts}
          breakpoints={DEFAULT_BREAKPOINTS}
          cols={DEFAULT_COLS}
          rowHeight={GRID_ROW_HEIGHT}
          margin={GRID_MARGIN}
          containerPadding={[0, 0] as const}
          compactor={verticalCompactor}
          dragConfig={dragConfig}
          resizeConfig={resizeConfig}
          onLayoutChange={onLayoutChange}
          onDragStart={onGridDragStart}
          onDragStop={onGridDragStop}
          onResizeStart={onGridResizeStart}
          onResizeStop={onGridResizeStop}
        >
          {widgets.map((widget) => (
            <div key={widget.id} className="h-full min-h-0">
              <WidgetFrame widget={widget} onModuleNavigate={onModuleNavigate} />
            </div>
          ))}
        </ResponsiveGridLayout>
      ) : null}

      {widgets.length === 0 && editMode ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-[var(--glass-text-muted)]">
          {t('dashboard.catalog.dropEmpty')}
        </p>
      ) : null}
    </div>
  )
}
