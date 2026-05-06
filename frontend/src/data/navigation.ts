export type NavItem = {
  id: string
  /** i18n key — `useI18n().t(labelKey)` */
  labelKey: string
  slug: string
}

export type NavGroup = {
  id: string
  titleKey: string
  items: NavItem[]
}

/** Kenar çubuğu “Başlangıç” — modül yok (eski Genel bakış / kuyruk ekranları kaldırıldı). */
export const startNavItems: NavItem[] = []

/**
 * Planlama grubu modül listesi — üst yatay nav (AppTopNav) ile kullanılır.
 * Üretim / Kalite / Lojistik gruplarında şimdilik alt modül yok; grup başlığı menüde kalır.
 */
export const navGroups: NavGroup[] = [
  {
    id: 'planning',
    titleKey: 'nav.sidebar.section.planning',
    items: [
      { id: 'planning-hub', labelKey: 'nav.planningHub', slug: 'planlama' },
      { id: 'crm', labelKey: 'nav.crm', slug: 'crm' },
      { id: 'project', labelKey: 'nav.project', slug: 'proje' },
      { id: 'planning-design', labelKey: 'nav.planningDesign', slug: 'planlama-tasarim' },
    ],
  },
  {
    id: 'production',
    titleKey: 'nav.sidebar.section.production',
    items: [],
  },
  {
    id: 'quality',
    titleKey: 'nav.sidebar.section.quality',
    items: [],
  },
  {
    id: 'logistics',
    titleKey: 'nav.sidebar.section.logistics',
    items: [],
  },
  {
    id: 'system',
    titleKey: 'nav.sidebar.section.system',
    items: [
      { id: 'approval-flow', labelKey: 'nav.approvalFlow', slug: 'onay-akisi' },
      { id: 'roles-permissions', labelKey: 'nav.roles', slug: 'roller-izinler' },
      { id: 'user-management', labelKey: 'nav.users', slug: 'kullanicilar' },
    ],
  },
  {
    id: 'configuration',
    titleKey: 'nav.sidebar.section.configuration',
    items: [
      { id: 'configuration-center', labelKey: 'nav.configurationCenter', slug: 'tanimlar' },
      { id: 'element-identity', labelKey: 'nav.elementIdentity', slug: 'eleman-kimlik' },
      { id: 'material-catalog', labelKey: 'nav.materialCatalog', slug: 'malzeme-katalogu' },
      {
        id: 'standard-series-catalog',
        labelKey: 'nav.standardSeriesCatalog',
        slug: 'standart-seri-urunler',
      },
    ],
  },
  {
    id: 'admin',
    titleKey: 'nav.sidebar.section.admin',
    items: [
      {
        id: 'element-identity-admin',
        labelKey: 'nav.elementIdentityAdmin',
        slug: 'admin/eleman-kimlik',
      },
    ],
  },
  {
    id: 'account',
    titleKey: 'nav.sidebar.section.account',
    items: [
      { id: 'profile', labelKey: 'nav.profile', slug: 'profil' },
      { id: 'settings', labelKey: 'nav.settings', slug: 'ayarlar' },
    ],
  },
]

/** Hesap — `findNavItem` / geriye dönük referanslar için son gruptan türetilir */
export const accountNavGroup: NavGroup = navGroups.find((g) => g.id === 'account')!

const DEFAULT_MODULE_ID = 'project'

export function findNavItem(id: string): NavItem | undefined {
  const inStart = startNavItems.find((i) => i.id === id)
  if (inStart) return inStart
  for (const g of navGroups) {
    const hit = g.items.find((i) => i.id === id)
    if (hit) return hit
  }
  return undefined
}

/** Kenar çubuğu modülleri — URL ilk segmenti (`/crm`, `/onay-akisi`) → modül id */
export function findModuleIdBySlug(slug: string): string | undefined {
  const inStart = startNavItems.find((i) => i.slug === slug)
  if (inStart) return inStart.id
  for (const g of navGroups) {
    const hit = g.items.find((i) => i.slug === slug)
    if (hit) return hit.id
  }
  return undefined
}

/**
 * Modül / hesap geçişi — yenilemede doğru ekran için path (profil & ayarlar sabit path).
 */
export function moduleIdToPath(id: string): string {
  if (id === 'profile') return '/profile'
  if (id === 'settings') return '/settings'
  const item = findNavItem(id)
  if (!item) return '/'
  return `/${item.slug}`
}

/** URL → kenar çubuğu vurgusu */
export function activeModuleIdFromPathname(pathname: string): string {
  if (pathname === '/profile') return 'profile'
  if (pathname === '/settings') return 'settings'
  if (pathname === '/') return DEFAULT_MODULE_ID
  if (pathname.startsWith('/musteri-detay/')) return 'crm'
  if (pathname === '/teklif' || pathname.startsWith('/teklif/')) return 'crm'
  if (pathname.startsWith('/admin/eleman-kimlik')) return 'element-identity-admin'
  if (pathname.startsWith('/eleman-kimlik')) return 'element-identity'
  if (pathname.startsWith('/malzeme-katalogu')) return 'material-catalog'
  if (pathname.startsWith('/standart-seri-urunler')) return 'standard-series-catalog'
  const seg = pathname.replace(/^\//, '').split('/')[0]
  if (!seg) return DEFAULT_MODULE_ID
  return findModuleIdBySlug(seg) ?? DEFAULT_MODULE_ID
}

/** Aktif modülün hangi akordeon grubunda olduğu (yoksa null). */
export function navGroupIdForModuleId(moduleId: string, groups: NavGroup[]): string | null {
  for (const g of groups) {
    if (g.items.some((i) => i.id === moduleId)) return g.id
  }
  return null
}
