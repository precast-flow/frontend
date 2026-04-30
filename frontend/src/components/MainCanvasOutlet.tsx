import { useMemo } from 'react'
import { Navigate, useLocation, useOutletContext } from 'react-router-dom'
import { findModuleIdBySlug } from '../data/navigation'
import type { AppShellOutletContext } from '../appShellOutletContext'
import { MainCanvas } from './MainCanvas'

const DEFAULT_MODULE_ID = 'project'

export function MainCanvasOutlet() {
  const { onNavigate } = useOutletContext<AppShellOutletContext>()
  const location = useLocation()

  const activeId = useMemo(() => {
    if (location.pathname === '/') return DEFAULT_MODULE_ID
    const seg = location.pathname.slice(1).split('/')[0]
    if (!seg) return DEFAULT_MODULE_ID
    const id = findModuleIdBySlug(seg)
    return id ?? null
  }, [location.pathname])

  if (activeId === null) {
    return <Navigate to="/" replace />
  }

  return <MainCanvas activeId={activeId} onNavigate={onNavigate} />
}
