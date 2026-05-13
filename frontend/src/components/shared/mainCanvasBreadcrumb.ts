import type { BreadcrumbSegment } from './AppModuleBreadcrumb'

const SYSTEM_PAGE_KEY: Record<string, string> = {
  'approval-flow': 'nav.approvalFlow',
  'roles-permissions': 'nav.roles',
  'user-management': 'nav.users',
}

const ADMIN_PAGE_KEY: Record<string, string> = {
  'element-identity-admin': 'nav.elementIdentityAdmin',
}

/** MainCanvas’ta yalnızca başlık olan modüller için üst breadcrumb (CRM/Proje/Eleman kimlik/Malzeme kataloğu/Standart seri kendi içinde çizer). */
export function mainCanvasBreadcrumbSegments(activeId: string): BreadcrumbSegment[] | null {
  const sys = SYSTEM_PAGE_KEY[activeId]
  if (sys) {
    return [{ labelKey: 'nav.sidebar.section.system' }, { labelKey: sys }]
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
