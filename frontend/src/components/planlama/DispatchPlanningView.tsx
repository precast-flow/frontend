import { GeneralPlanningProvider } from './GeneralPlanningContext'
import { PlanningTimelineView } from './shared/PlanningTimelineView'
import { UNIT_VIEW_PERMISSIONS } from '../../data/generalPlanningUnitConfig'
import { useGeneralPlanningAccess } from '../../hooks/useGeneralPlanningAccess'

function DispatchPlanningInner() {
  const access = useGeneralPlanningAccess()
  const canView = access.hasPermission(UNIT_VIEW_PERMISSIONS.dispatch)

  if (!canView) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Sevkiyat planlama için yetkiniz bulunmuyor.
      </div>
    )
  }

  return <PlanningTimelineView variant="dispatch" />
}

/** Genel planlama — Sevkiyat birimi görünümü (lojistik modülü altında ayrı sayfa). */
export function DispatchPlanningView() {
  return (
    <GeneralPlanningProvider lockUnit="dispatch">
      <DispatchPlanningInner />
    </GeneralPlanningProvider>
  )
}
