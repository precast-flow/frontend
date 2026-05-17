import { UserManagementModuleView } from './UserManagementModuleView'
import { useUserManagementState } from './useUserManagementState'

export function UserManagementView() {
  const state = useUserManagementState()
  return <UserManagementModuleView {...state} />
}
