import { useEffect, useRef, type ReactNode } from 'react'
import { PlanningItemHoverDetail } from './PlanningItemHoverDetail'
import { buildPlanningItemHoverPayload, type PlanningItemHoverPayload } from './planningItemDetail'
import type { TimelineDisplayItem } from './planningTimelineTypes'
import type { PlanningUnitKey } from '../../../data/generalPlanningMock'

const TITLE_SELECTOR = '[data-planning-card-title]'
const STATUS_SELECTOR = '[data-planning-card-status]'

type Props = {
  item: TimelineDisplayItem
  locale: string
  unit?: PlanningUnitKey
  groupItems?: TimelineDisplayItem[]
  moldName?: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  detailOpen?: boolean
  onDetailOpenChange?: (open: boolean) => void
  onClick?: (e: React.MouseEvent) => void
  onContextMenu?: (e: React.MouseEvent) => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: () => void
}

export function PlanningTimelineCardWrapper({
  item,
  locale,
  unit,
  groupItems,
  moldName,
  children,
  className,
  style,
  detailOpen = false,
  onDetailOpenChange,
  onClick,
  onContextMenu,
  draggable,
  onDragStart,
  onDragEnd,
}: Props) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const detailPanelRef = useRef<HTMLDivElement>(null)

  const payload: PlanningItemHoverPayload | null = detailOpen
    ? buildPlanningItemHoverPayload(item, locale, { unit, groupItems, moldName })
    : null

  const closeDetail = () => onDetailOpenChange?.(false)

  useEffect(() => {
    if (!detailOpen) return
    const onPointerDown = (ev: MouseEvent) => {
      const target = ev.target as Node
      if (anchorRef.current?.contains(target)) return
      if (detailPanelRef.current?.contains(target)) return
      closeDetail()
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') closeDetail()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [detailOpen, onDetailOpenChange])

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest(TITLE_SELECTOR) || target.closest(STATUS_SELECTOR)) {
      e.stopPropagation()
      onDetailOpenChange?.(true)
      return
    }
    if (detailOpen) onDetailOpenChange?.(false)
    onClick?.(e)
  }

  return (
    <>
      <div
        ref={anchorRef}
        className={className}
        style={style}
        onClick={handleClick}
        onContextMenu={onContextMenu}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {children}
      </div>
      <PlanningItemHoverDetail
        anchorRef={anchorRef}
        panelRef={detailPanelRef}
        open={detailOpen}
        payload={payload}
        onClose={closeDetail}
        interactive
      />
    </>
  )
}
