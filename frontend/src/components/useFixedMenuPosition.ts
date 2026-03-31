import { type RefObject, useLayoutEffect, useState } from 'react'

/** Viewport sabit menü — üst bar içinde değil; backdrop-filter sayfa üzerinde çalışır. */
export function useFixedMenuPosition(wrapRef: RefObject<HTMLElement | null>, open: boolean) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, rightInset: 0 })

  useLayoutEffect(() => {
    if (!open) return
    const el = wrapRef.current
    if (!el) return

    const run = () => {
      const r = el.getBoundingClientRect()
      setPos({
        top: r.bottom + 8,
        left: r.left,
        width: r.width,
        rightInset: window.innerWidth - r.right,
      })
    }

    run()
    window.addEventListener('resize', run)
    window.addEventListener('scroll', run, true)
    return () => {
      window.removeEventListener('resize', run)
      window.removeEventListener('scroll', run, true)
    }
  }, [open, wrapRef])

  return pos
}
