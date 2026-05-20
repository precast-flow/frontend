import { ChevronsLeftRight, GripVertical } from 'lucide-react'

type Props = {
  gl: boolean
  neutralShell: boolean
  isResizing: boolean
  isResizerHover: boolean
  onMouseDown: () => void
  onDoubleClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function QualitySplitPaneResizer({
  gl,
  neutralShell,
  isResizing,
  isResizerHover,
  onMouseDown,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  return (
    <div className="relative z-10 mx-1 hidden w-2 shrink-0 cursor-col-resize lg:flex">
      <button
        type="button"
        aria-label="Paneller arası genişliği ayarla"
        title="Çift tıklayarak varsayılan sütun genişliğine dön"
        onMouseDown={onMouseDown}
        onDoubleClick={(e) => {
          e.preventDefault()
          onDoubleClick()
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={[
          'group absolute inset-y-3 left-1/2 -translate-x-1/2 rounded-full border transition',
          isResizing || isResizerHover
            ? gl
              ? 'w-6 border-black/35 bg-black/12 dark:border-white/18 dark:bg-black/60'
              : neutralShell
                ? 'w-6 border-black/35 bg-black/12 dark:border-white/18 dark:bg-black/60'
                : 'w-6 border-black/25 bg-black/8 dark:border-white/20 dark:bg-black/50'
            : 'w-3 border-black/18 bg-white/70 dark:border-white/12 dark:bg-black/55',
        ].join(' ')}
      >
        <span className="pointer-events-none flex h-full items-center justify-center text-black/55 dark:text-white/70">
          {isResizing || isResizerHover ? (
            <ChevronsLeftRight className="size-3.5" />
          ) : (
            <GripVertical className="size-3.5" />
          )}
        </span>
      </button>
    </div>
  )
}
