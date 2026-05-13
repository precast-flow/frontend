import { useMemo } from 'react'
import { useLocation, useOutletContext } from 'react-router-dom'
import { activeModuleIdFromPathname } from '../data/navigation'
import type { AppShellOutletContext } from '../appShellOutletContext'
import { MainCanvas } from './MainCanvas'

export function MainCanvasOutlet() {
  const { onNavigate } = useOutletContext<AppShellOutletContext>()
  const location = useLocation()

  const activeId = useMemo(
    () => activeModuleIdFromPathname(location.pathname),
    [location.pathname],
  )

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <MainCanvas activeId={activeId} onNavigate={onNavigate} />
    </div>
  )
}
