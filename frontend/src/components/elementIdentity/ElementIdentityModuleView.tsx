import { useSearchParams } from 'react-router-dom'
import { ElementIdentityModuleViewLegacy } from './ElementIdentityModuleViewLegacy'
import { ElementIdentityProjectListView } from './ElementIdentityProjectListView'

function ElementIdentityModuleRouter() {
  const [sp] = useSearchParams()
  if (sp.get('legacy') === '1') {
    return <ElementIdentityModuleViewLegacy />
  }
  return <ElementIdentityProjectListView />
}

/** `ElementIdentityProvider` üst kabukta (`GlassAppShell`) — burada tekrar sarmalama yok */
export function ElementIdentityModuleView() {
  return <ElementIdentityModuleRouter />
}
