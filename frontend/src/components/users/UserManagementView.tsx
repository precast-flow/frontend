import { useSearchParams } from 'react-router-dom'
import { UserManagementModuleView } from './UserManagementModuleView'
import { useUserManagementState } from './useUserManagementState'
import { UserManagementViewLegacy } from './UserManagementViewLegacy'

export function UserManagementView() {
  const [sp] = useSearchParams()
  const state = useUserManagementState()
  if (sp.get('legacy') === '1') {
    return <UserManagementViewLegacy {...state} />
  }
  return <UserManagementModuleView {...state} />
}
