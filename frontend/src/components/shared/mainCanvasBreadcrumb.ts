import { moduleIdToPath } from '../../data/navigation'
import type { BreadcrumbSegment } from './AppModuleBreadcrumb'

const SYSTEM_PAGE_KEY: Record<string, string> = {
  'approval-flow': 'nav.approvalFlow',
  'roles-permissions': 'nav.roles',
  'user-management': 'nav.users',
}

const CONFIG_PAGE_KEY: Record<string, string> = {
  'element-identity': 'nav.elementIdentity',
  'material-catalog': 'nav.materialCatalog',
  'standard-series-catalog': 'nav.standardSeriesCatalog',
}

/** MainCanvas’ta yalnızca başlık olan modüller için üst breadcrumb (CRM/Proje kendi içinde çizer). */
export function mainCanvasBreadcrumbSegments(activeId: string): BreadcrumbSegment[] | null {
  const sys = SYSTEM_PAGE_KEY[activeId]
  if (sys) {
    return [{ labelKey: 'nav.sidebar.section.system' }, { labelKey: sys }]
  }
  const cfg = CONFIG_PAGE_KEY[activeId]
  if (cfg) {
    return [
      { labelKey: 'nav.configurationCenter', to: moduleIdToPath('configuration-center') },
      { labelKey: cfg },
    ]
  }
  return null
}

export function accountPageBreadcrumbSegments(page: 'profile' | 'settings'): BreadcrumbSegment[] {
  if (page === 'profile') {
    return [{ labelKey: 'nav.sidebar.section.account' }, { labelKey: 'nav.profile' }]
  }
  return [{ labelKey: 'nav.sidebar.section.account' }, { labelKey: 'nav.settings' }]
}
