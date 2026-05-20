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

/** Planlama grubu — Proje, Görev, Müşteri */
const PLANNING_PAGE_KEY: Record<string, string> = {
  project: 'nav.project',
  crm: 'nav.crm',
  'unit-work-queue': 'nav.unitWorkQueue',
}

/** Kalite modül sayfaları */
const QUALITY_PAGE_KEY: Record<string, string> = {
  'quality-input-materials': 'nav.qualityInputMaterials',
  'quality-concrete-recipes': 'nav.qualityConcreteRecipes',
  'quality-lab-tests': 'nav.qualityLabTests',
}

/** MainCanvas üst başlık + breadcrumb (tek kaynak). */
export function mainCanvasBreadcrumbSegments(activeId: string): BreadcrumbSegment[] | null {
  const planningPage = PLANNING_PAGE_KEY[activeId]
  if (planningPage) {
    return [
      { labelKey: 'nav.sidebar.section.planning', to: '/planlama' },
      { labelKey: planningPage },
    ]
  }

  const qualityPage = QUALITY_PAGE_KEY[activeId]
  if (qualityPage) {
    return [
      { labelKey: 'nav.sidebar.section.quality', to: '/kalite-girdi-malzeme' },
      { labelKey: qualityPage },
    ]
  }

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
