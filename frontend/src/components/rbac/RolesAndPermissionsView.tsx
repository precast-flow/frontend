import { RolesAndPermissionsModuleView } from './RolesAndPermissionsModuleView'
import { useRolesPermissionsState } from './useRolesPermissionsState'

export function RolesAndPermissionsView() {
  const state = useRolesPermissionsState()
  return <RolesAndPermissionsModuleView {...state} />
}
