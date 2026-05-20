import { useRef, useState } from 'react'
import { SPLIT_LIST_RAIL_PX, useSplitListCollapsed } from '../shared/layout/useSplitListCollapsed'
import { useManagementModulePage, useSplitPaneDrag, useSplitPaneRatio } from '../shared/splitModuleStyles'

export function useQualitySplitLayout(moduleId: string, persistKey: string) {
  const { gl, neutralShell } = useManagementModulePage(moduleId)
  const splitRef = useRef<HTMLDivElement | null>(null)
  const { collapsed: listCollapsed, toggle: toggleListCollapsed } = useSplitListCollapsed(persistKey)
  const {
    isResizing,
    setIsResizing,
    resetRatio,
    leftWidthStyle,
    setRatioFromPointer,
  } = useSplitPaneRatio(persistKey)
  const [isResizerHover, setIsResizerHover] = useState(false)
  useSplitPaneDrag(splitRef, { isResizing, setIsResizing, setRatioFromPointer })
  const listPanelStyle = listCollapsed
    ? { width: SPLIT_LIST_RAIL_PX, minWidth: SPLIT_LIST_RAIL_PX, maxWidth: SPLIT_LIST_RAIL_PX }
    : leftWidthStyle

  return {
    gl,
    neutralShell,
    splitRef,
    listCollapsed,
    toggleListCollapsed,
    listPanelStyle,
    isResizing,
    setIsResizing,
    resetRatio,
    isResizerHover,
    setIsResizerHover,
  }
}
