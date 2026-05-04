import { useSearchParams } from 'react-router-dom'
import { RolesAndPermissionsModuleView } from './RolesAndPermissionsModuleView'
import { RolesAndPermissionsViewLegacy } from './RolesAndPermissionsViewLegacy'
import { useRolesPermissionsState } from './useRolesPermissionsState'

export function RolesAndPermissionsView() {
  const [sp] = useSearchParams()
  const state = useRolesPermissionsState()
  if (sp.get('legacy') === '1') {
    return <RolesAndPermissionsViewLegacy {...state} />
  }
  return <RolesAndPermissionsModuleView {...state} />
}
