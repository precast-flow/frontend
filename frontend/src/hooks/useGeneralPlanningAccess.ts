import { useMemo } from 'react'
import { MOCK_WORK_QUEUE_VIEWER_ID } from '../data/workQueueMock'
import { MOCK_MANAGED_USERS } from '../data/mockUsers'
import { MOCK_ROLE_PERMISSIONS } from '../data/mockRbac'
import type { PlanningUnitKey } from '../data/generalPlanningMock'
import {
  GENERAL_PLANNING_UI_UNITS,
  UNIT_EDIT_PERMISSIONS,
  UNIT_VIEW_PERMISSIONS,
} from '../data/generalPlanningUnitConfig'

function permissionSetForRoleIds(roleIds: string[]): Set<string> {
  const out = new Set<string>()
  for (const roleId of roleIds) {
    const grants = MOCK_ROLE_PERMISSIONS[roleId]
    if (grants) grants.forEach((p) => out.add(p))
  }
  return out
}

export function useGeneralPlanningAccess(previewRoleIds?: string[] | null) {
  return useMemo(() => {
    const user = MOCK_MANAGED_USERS.find((u) => u.id === MOCK_WORK_QUEUE_VIEWER_ID)
    const roleIds = previewRoleIds ?? user?.roleIds ?? []
    const isAdmin = roleIds.includes('admin')
    const permSet = permissionSetForRoleIds(roleIds)

    const hasPermission = (id: string) => isAdmin || permSet.has(id)

    const allowedUnits: PlanningUnitKey[] = GENERAL_PLANNING_UI_UNITS.filter((unit) =>
      hasPermission(UNIT_VIEW_PERMISSIONS[unit]),
    )

    const canEditUnit = (unit: PlanningUnitKey) => hasPermission(UNIT_EDIT_PERMISSIONS[unit])

    const canEditAny = allowedUnits.some((u) => canEditUnit(u))

    return {
      roleIds,
      isAdmin,
      hasPermission,
      allowedUnits,
      canEditUnit,
      canEditAny,
    }
  }, [previewRoleIds])
}
