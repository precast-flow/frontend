import type { BreadcrumbSegment } from './AppModuleBreadcrumb'

const SYSTEM_PAGE_KEY: Record<string, string> = {
  'approval-flow': 'nav.approvalFlow',
  'roles-permissions': 'nav.roles',
  'user-management': 'nav.users',
}

const DEFINITIONS_PAGE_KEY: Record<string, string> = {
  'element-identity': 'nav.elementIdentity',
  'material-catalog': 'nav.materialCatalog',
  'standard-series-catalog': 'nav.standardSeriesCatalog',
}

const ADMIN_PAGE_KEY: Record<string, string> = {
  'element-identity-admin': 'nav.elementIdentityAdmin',
}

/** MainCanvas üst breadcrumb (Proje/CRM/Planlama modülleri kendi iç breadcrumb’ını kullanır). */
export function mainCanvasBreadcrumbSegments(activeId: string): BreadcrumbSegment[] | null {
  const sys = SYSTEM_PAGE_KEY[activeId]
  if (sys) {
    return [{ labelKey: 'nav.sidebar.section.system' }, { labelKey: sys }]
  }
  const def = DEFINITIONS_PAGE_KEY[activeId]
  if (def) {
    return [{ labelKey: 'nav.sidebar.section.configuration' }, { labelKey: def }]
  }
  const admin = ADMIN_PAGE_KEY[activeId]
  if (admin) {
    return [{ labelKey: 'nav.sidebar.section.admin' }, { labelKey: admin }]
  }
  return null
}

export function accountPageBreadcrumbSegments(page: 'profile' | 'settings'): BreadcrumbSegment[] {
  if (page === 'profile') {
    return [{ labelKey: 'nav.sidebar.section.account' }, { labelKey: 'nav.profile' }]
  }
  return [{ labelKey: 'nav.sidebar.section.account' }, { labelKey: 'nav.settings' }]
}
