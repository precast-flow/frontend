import { useEffect, useState } from 'react'

export const SPLIT_PANE_MIN_RATIO = 30
export const SPLIT_PANE_MAX_RATIO = 55
export const SPLIT_PANE_DEFAULT_RATIO = 40

export function clampSplitPaneRatio(value: number, defaultRatio = SPLIT_PANE_DEFAULT_RATIO): number {
  if (!Number.isFinite(value)) return defaultRatio
  return Math.min(SPLIT_PANE_MAX_RATIO, Math.max(SPLIT_PANE_MIN_RATIO, value))
}

export function splitPaneStorageKey(persistKey: string): string {
  return `split-pane:${persistKey}`
}

export function readSplitPaneRatio(persistKey: string, defaultRatio = SPLIT_PANE_DEFAULT_RATIO): number {
  try {
    const raw = sessionStorage.getItem(splitPaneStorageKey(persistKey))
    if (!raw) return defaultRatio
    const v = JSON.parse(raw) as { splitRatio?: number }
    return typeof v.splitRatio === 'number' ? clampSplitPaneRatio(v.splitRatio, defaultRatio) : defaultRatio
  } catch {
    return defaultRatio
  }
}

export function writeSplitPaneRatio(persistKey: string, splitRatio: number): void {
  try {
    sessionStorage.setItem(splitPaneStorageKey(persistKey), JSON.stringify({ splitRatio }))
  } catch {
    /* ignore */
  }
}

export type UseSplitPaneRatioOptions = {
  /** Eski birleşik view-state JSON anahtarından tek seferlik oran taşıması */
  legacyViewStateKey?: string
  /** Eski `split-pane:{key}` anahtarından tek seferlik oran taşıması */
  legacySplitPanePersistKey?: string
}

function readSplitPaneRatioInitial(
  persistKey: string,
  defaultRatio: number,
  options?: UseSplitPaneRatioOptions,
): number {
  try {
    if (sessionStorage.getItem(splitPaneStorageKey(persistKey))) {
      return readSplitPaneRatio(persistKey, defaultRatio)
    }
  } catch {
    /* ignore */
  }
  if (options?.legacyViewStateKey) {
    try {
      const raw = sessionStorage.getItem(options.legacyViewStateKey)
      if (raw) {
        const v = JSON.parse(raw) as { splitRatio?: number }
        if (typeof v.splitRatio === 'number') {
          const migrated = clampSplitPaneRatio(v.splitRatio, defaultRatio)
          writeSplitPaneRatio(persistKey, migrated)
          return migrated
        }
      }
    } catch {
      /* ignore */
    }
  }
  if (options?.legacySplitPanePersistKey && options.legacySplitPanePersistKey !== persistKey) {
    try {
      const raw = sessionStorage.getItem(splitPaneStorageKey(options.legacySplitPanePersistKey))
      if (raw) {
        const v = JSON.parse(raw) as { splitRatio?: number }
        if (typeof v.splitRatio === 'number') {
          const migrated = clampSplitPaneRatio(v.splitRatio, defaultRatio)
          writeSplitPaneRatio(persistKey, migrated)
          return migrated
        }
      }
    } catch {
      /* ignore */
    }
  }
  return readSplitPaneRatio(persistKey, defaultRatio)
}

export function useSplitPaneRatio(
  persistKey: string,
  defaultRatio = SPLIT_PANE_DEFAULT_RATIO,
  options?: UseSplitPaneRatioOptions,
) {
  const [splitRatio, setSplitRatio] = useState(() =>
    readSplitPaneRatioInitial(persistKey, defaultRatio, options),
  )
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    if (isResizing) return
    writeSplitPaneRatio(persistKey, splitRatio)
  }, [isResizing, persistKey, splitRatio])

  const resetRatio = () => setSplitRatio(clampSplitPaneRatio(defaultRatio, defaultRatio))

  const setRatioFromPointer = (clientX: number, hostLeft: number, hostWidth: number) => {
    if (hostWidth <= 0) return
    const next = ((clientX - hostLeft) / hostWidth) * 100
    setSplitRatio(clampSplitPaneRatio(next, defaultRatio))
  }

  return {
    splitRatio,
    setSplitRatio,
    isResizing,
    setIsResizing,
    resetRatio,
    setRatioFromPointer,
    leftWidthStyle: { width: `calc(${splitRatio}% - 5px)` } as const,
  }
}
