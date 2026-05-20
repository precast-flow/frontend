import { useEffect, type RefObject } from 'react'

type SplitPaneDragHandlers = {
  isResizing: boolean
  setIsResizing: (value: boolean) => void
  setRatioFromPointer: (clientX: number, hostLeft: number, hostWidth: number) => void
}

/** Sürükle-bırak ile split oranı ayarı — `useSplitPaneRatio` ile birlikte kullanın. */
export function useSplitPaneDrag(
  hostRef: RefObject<HTMLElement | null>,
  { isResizing, setIsResizing, setRatioFromPointer }: SplitPaneDragHandlers,
) {
  useEffect(() => {
    if (!isResizing) return
    let rafId = 0
    const onMouseMove = (event: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const host = hostRef.current
        if (!host) return
        const rect = host.getBoundingClientRect()
        if (rect.width <= 0) return
        setRatioFromPointer(event.clientX, rect.left, rect.width)
      })
    }
    const onMouseUp = () => {
      cancelAnimationFrame(rafId)
      setIsResizing(false)
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      cancelAnimationFrame(rafId)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [hostRef, isResizing, setIsResizing, setRatioFromPointer])
}
