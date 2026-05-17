import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GeneralPlanningProvider, useGeneralPlanningOptional } from './GeneralPlanningContext'
import { PlanningTimelineView } from './shared/PlanningTimelineView'
import { UNIT_VIEW_PERMISSIONS } from '../../data/generalPlanningUnitConfig'
import { useGeneralPlanningAccess } from '../../hooks/useGeneralPlanningAccess'

function AssemblyPlanningInner() {
  const access = useGeneralPlanningAccess()
  const canView = access.hasPermission(UNIT_VIEW_PERMISSIONS.assembly)

  if (!canView) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Montaj planlama için yetkiniz bulunmuyor.
      </div>
    )
  }

  return <PlanningTimelineView variant="assembly" />
}

function AssemblyPlanningProjectUrlSync({
  projectFromUrl,
  setSearchParams,
}: {
  projectFromUrl: string | null
  setSearchParams: ReturnType<typeof useSearchParams>[1]
}) {
  const gp = useGeneralPlanningOptional()

  useEffect(() => {
    if (!gp?.projectScoped || !gp.selectedProjectCode) return
    if (projectFromUrl === gp.selectedProjectCode) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('project', gp.selectedProjectCode!)
        return next
      },
      { replace: true },
    )
  }, [gp?.projectScoped, gp?.selectedProjectCode, projectFromUrl, setSearchParams])

  return null
}

/** Genel planlama — Montaj birimi görünümü; planlar proje bazlı yönetilir. */
export function AssemblyPlanningView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const projectFromUrl = searchParams.get('project')

  return (
    <GeneralPlanningProvider
      lockUnit="assembly"
      projectScoped
      initialProjectCode={projectFromUrl}
    >
      <AssemblyPlanningProjectUrlSync
        projectFromUrl={projectFromUrl}
        setSearchParams={setSearchParams}
      />
      <AssemblyPlanningInner />
    </GeneralPlanningProvider>
  )
}
