import { useEffect } from 'react'
import { GeneralPlanningProvider, useGeneralPlanning } from './GeneralPlanningContext'
import { PlanningTimelineView } from './shared/PlanningTimelineView'
import { useGeneralPlanningAccess } from '../../hooks/useGeneralPlanningAccess'

function GeneralPlanningInner() {
  const { activeUnit, setActiveUnit } = useGeneralPlanning()
  const { allowedUnits } = useGeneralPlanningAccess()

  useEffect(() => {
    if (allowedUnits.length && !allowedUnits.includes(activeUnit)) {
      setActiveUnit(allowedUnits[0]!)
    }
  }, [activeUnit, allowedUnits, setActiveUnit])

  if (!allowedUnits.length) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Genel planlama için yetkiniz bulunmuyor.
      </div>
    )
  }

  return <PlanningTimelineView variant="general" />
}

export function GeneralPlanningView() {
  return (
    <GeneralPlanningProvider>
      <GeneralPlanningInner />
    </GeneralPlanningProvider>
  )
}
