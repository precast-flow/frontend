import { useNavigate } from 'react-router-dom'
import { DashboardGrid } from './DashboardGrid'
import { DashboardToolbar } from './DashboardToolbar'
import { useDashboardHistoryKeyboard } from './useDashboardHistoryKeyboard'
import { WidgetCatalogDialog } from './WidgetCatalogDialog'
import { WidgetSettingsDrawer } from './WidgetSettingsDrawer'

export function DashboardShell() {
  const navigate = useNavigate()
  useDashboardHistoryKeyboard()

  const onModuleNavigate = (moduleId: string) => {
    if (moduleId === 'quote') {
      navigate('/crm')
      return
    }
    if (moduleId === 'dispatch' || moduleId === 'quality' || moduleId === 'mes' || moduleId === 'yard') {
      navigate('/birim-is-kuyrugu')
      return
    }
    const paths: Record<string, string> = {
      crm: '/crm',
      project: '/proje',
      'approval-flow': '/onay-akisi',
      'unit-work-queue': '/birim-is-kuyrugu',
    }
    navigate(paths[moduleId] ?? '/proje')
  }

  return (
    <div className="gm-glass-main-canvas gm-glass-main-canvas--okan-liquid project-mgmt-page-root relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-3xl px-0 pt-0 pb-1 md:px-1 md:pt-0 md:pb-2">
      <DashboardToolbar />
      <div className="dashboard-scroll-pane relative min-h-0 min-w-0 flex-1 overflow-auto overscroll-y-auto">
        <DashboardGrid onModuleNavigate={onModuleNavigate} />
      </div>
      <WidgetCatalogDialog />
      <WidgetSettingsDrawer />
    </div>
  )
}
