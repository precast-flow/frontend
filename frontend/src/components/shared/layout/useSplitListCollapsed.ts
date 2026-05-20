import { useCallback, useState } from 'react'

const STORAGE_PREFIX = 'split-list-collapsed:'

function readCollapsed(key: string): boolean {
  if (typeof sessionStorage === 'undefined') return false
  try {
    return sessionStorage.getItem(`${STORAGE_PREFIX}${key}`) === '1'
  } catch {
    return false
  }
}

function writeCollapsed(key: string, collapsed: boolean): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, collapsed ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function useSplitListCollapsed(persistKey: string) {
  const [collapsed, setCollapsedState] = useState(() => readCollapsed(persistKey))

  const setCollapsed = useCallback(
    (next: boolean) => {
      setCollapsedState(next)
      writeCollapsed(persistKey, next)
    },
    [persistKey],
  )

  const toggle = useCallback(() => {
    setCollapsed(!collapsed)
  }, [collapsed, setCollapsed])

  const expand = useCallback(() => setCollapsed(false), [setCollapsed])

  return { collapsed, setCollapsed, toggle, expand }
}

export const SPLIT_LIST_RAIL_PX = 44
