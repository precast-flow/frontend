import { useEffect } from 'react'
import { useDashboard } from '../../context/DashboardContext'

export function useDashboardHistoryKeyboard() {
  const { editMode, undo, redo, canUndo, canRedo } = useDashboard()

  useEffect(() => {
    if (!editMode) return

    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      const key = e.key.toLowerCase()
      if (key === 'z' && !e.shiftKey) {
        if (!canUndo) return
        e.preventDefault()
        undo()
      } else if (key === 'z' && e.shiftKey) {
        if (!canRedo) return
        e.preventDefault()
        redo()
      } else if (key === 'y') {
        if (!canRedo) return
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editMode, undo, redo, canUndo, canRedo])
}
