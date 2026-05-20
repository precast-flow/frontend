import { useLocation } from 'react-router-dom'
import { activeModuleIdFromPathname } from '../../../data/navigation'
import { useThemeMode } from '../../../theme/ThemeProvider'

/**
 * Split yönetim modülleri (Proje, CRM, Görev, Kalite) için ortak kabuk bayrakları.
 */
export function useManagementModulePage(moduleId: string) {
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const location = useLocation()
  const neutralShell = activeModuleIdFromPathname(location.pathname) === moduleId
  return { gl, neutralShell, moduleId }
}
