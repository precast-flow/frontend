import { useRef, type ReactNode } from 'react'
import { PlanningItemHoverDetail } from './PlanningItemHoverDetail'
import { buildPlanningItemHoverPayload, type PlanningItemHoverPayload } from './planningItemDetail'
import type { TimelineDisplayItem } from './planningTimelineTypes'
import { useDelayedHover } from './useDelayedHover'
import type { PlanningUnitKey } from '../../../data/generalPlanningMock'

type Props = {
  item: TimelineDisplayItem
  locale: string
  unit?: PlanningUnitKey
  groupItems?: TimelineDisplayItem[]
  moldName?: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
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
  onClick,
  onContextMenu,
  draggable,
  onDragStart,
  onDragEnd,
}: Props) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const { isHovered, onMouseEnter, onMouseLeave } = useDelayedHover(1000)

  const payload: PlanningItemHoverPayload | null = isHovered
    ? buildPlanningItemHoverPayload(item, locale, { unit, groupItems, moldName })
    : null

  return (
    <>
      <div
        ref={anchorRef}
        className={className}
        style={style}
        onClick={onClick}
        onContextMenu={onContextMenu}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
      <PlanningItemHoverDetail anchorRef={anchorRef} open={isHovered} payload={payload} />
    </>
  )
}
