import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  anchorRef: React.RefObject<HTMLElement | null>
  open: boolean
  /** zoom/pan sonrası konumu yenile */
  repositionKey?: string
  children: React.ReactNode
}

/** overflow:hidden dışında, işaretin üstünde sabit konumlu popover. */
export function MarkerPopoverPortal({ anchorRef, open, repositionKey, children }: Props) {
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' })

  useLayoutEffect(() => {
    if (!open) return

    const update = () => {
      const el = anchorRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setStyle({
        position: 'fixed',
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
        transform: 'translate(-50%, -100%)',
        zIndex: 10000,
        visibility: 'visible',
      })
    }

    update()
    const ro = new ResizeObserver(update)
    if (anchorRef.current) ro.observe(anchorRef.current)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, anchorRef, repositionKey])

  if (!open) return null

  return createPortal(
    <div data-marker-popover style={style}>
      {children}
    </div>,
    document.body,
  )
}
