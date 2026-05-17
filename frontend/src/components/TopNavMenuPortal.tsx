import { createPortal } from 'react-dom'
import { useLayoutEffect, useState, type ReactNode, type RefObject } from 'react'

const TOPNAV_MENU_Z = 200

type Align = 'start' | 'end'

type Props = {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  id: string
  labelledBy: string
  className: string
  align?: Align
  children: ReactNode
}

/** Üst nav açılır menü — planlama gibi yoğun z-index sayfalarının üstünde kalması için body portal. */
export function TopNavMenuPortal({
  open,
  anchorRef,
  panelRef,
  id,
  labelledBy,
  className,
  align = 'start',
  children,
}: Props) {
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return
    }

    const update = () => {
      const anchor = anchorRef.current
      if (!anchor) return
      const r = anchor.getBoundingClientRect()
      const panelW = panelRef.current?.offsetWidth ?? 208
      const maxLeft = Math.max(8, window.innerWidth - panelW - 8)
      const left =
        align === 'end'
          ? Math.min(Math.max(8, r.right - panelW), maxLeft)
          : Math.min(Math.max(8, r.left), maxLeft)
      setPos({ left, top: r.bottom + 6 })
    }

    update()
    const raf = requestAnimationFrame(update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, anchorRef, panelRef, align])

  if (!open || !pos || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      className={[
        className,
        'gm-glass-topbar-menu-portal fixed max-h-[min(70dvh,22rem)] overflow-y-auto',
      ].join(' ')}
      style={{ left: pos.left, top: pos.top, zIndex: TOPNAV_MENU_Z }}
    >
      {children}
    </div>,
    document.body,
  )
}
