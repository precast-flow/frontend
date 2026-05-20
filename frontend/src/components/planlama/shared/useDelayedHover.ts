import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_DELAY_MS = 1000

export function useDelayedHover(delayMs = DEFAULT_DELAY_MS) {
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const onMouseEnter = useCallback(() => {
    clearTimer()
    timerRef.current = window.setTimeout(() => setIsHovered(true), delayMs)
  }, [clearTimer, delayMs])

  const onMouseLeave = useCallback(() => {
    clearTimer()
    setIsHovered(false)
  }, [clearTimer])

  useEffect(() => () => clearTimer(), [clearTimer])

  return { isHovered, onMouseEnter, onMouseLeave }
}
