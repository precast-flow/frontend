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

/** Giriş sonrası varsayılan ekran — Prompt 03 */
export const pinnedNavItem: NavItem = {
  id: 'dashboard',
  labelKey: 'nav.dashboard',
  slug: 'genel-bakis',
}

/** Kenar çubuğu “Başlangıç” bölümü — Genel bakış + birim iş kuyruğu (bie-05) + lojistik/saha (bie-08) */
export const startNavItems: NavItem[] = [
  pinnedNavItem,
  {
    id: 'unit-work-queue',
    labelKey: 'nav.unitWorkQueue',
    slug: 'birim-is-kuyrugu',
  },
  {
    id: 'logistics-field-queues',
    labelKey: 'nav.logisticsFieldQueues',
    slug: 'lojistik-saha-is-kuyrugu',
  },
]

/**
 * İki seviyeli kenar çubuğu — tek açık akordeon bölümü (Sidebar).
 * Üretim grubu id’si `production` kalmalı (rol önizlemesi süzgeci).
 */
export const navGroups: NavGroup[] = [
  {
    id: 'production',
    titleKey: 'nav.sidebar.section.production',
    items: [
      { id: 'production-summary', labelKey: 'nav.productionSummary', slug: 'uretim-ozet' },
      { id: 'mes', labelKey: 'nav.mes', slug: 'mes' },
      { id: 'mold-board', labelKey: 'nav.moldBoard', slug: 'kalip-tahtasi' },
      { id: 'pending-priority', labelKey: 'nav.pendingPriority', slug: 'oncelik-raporu' },
      { id: 'concrete-recipe', labelKey: 'nav.concreteRecipe', slug: 'beton-recete' },
      { id: 'batch-plant', labelKey: 'nav.batchPlant', slug: 'beton-santrali' },
      { id: 'production-role-preview', labelKey: 'nav.productionRolePreview', slug: 'uretim-roller' },
      { id: 'production-factory-ops', labelKey: 'nav.productionFactoryOps', slug: 'fabrika-vardiya-kalip-ekip' },
      { id: 'yard', labelKey: 'nav.yard', slug: 'yard' },
    ],
  },
  {
    id: 'planning',
    titleKey: 'nav.sidebar.section.planning',
    items: [
      { id: 'crm', labelKey: 'nav.crm', slug: 'crm' },
      { id: 'quote', labelKey: 'nav.quote', slug: 'teklif' },
      { id: 'work-start', labelKey: 'nav.workStart', slug: 'is-baslat' },
      { id: 'project', labelKey: 'nav.project', slug: 'proje' },
      { id: 'engineering', labelKey: 'nav.engineering', slug: 'muhendislik' },
      { id: 'engineering-okan', labelKey: 'nav.engineeringOkan', slug: 'muhendislik-okan' },
      {
        id: 'manual-piece-studio',
        labelKey: 'nav.manualPieceStudio',
        slug: 'parca-sablon-studyosu',
      },
      { id: 'parametric-3d', labelKey: 'nav.parametric3d', slug: 'parametrik-3b' },
      { id: 'planning-design', labelKey: 'nav.planningDesign', slug: 'planlama-tasarim' },
    ],
  },
  {
    id: 'quality',
    titleKey: 'nav.sidebar.section.quality',
    items: [{ id: 'quality', labelKey: 'nav.quality', slug: 'kalite' }],
  },
  {
    id: 'logistics',
    titleKey: 'nav.sidebar.section.logistics',
    items: [
      { id: 'dispatch', labelKey: 'nav.dispatch', slug: 'sevkiyat' },
      { id: 'field', labelKey: 'nav.field', slug: 'saha' },
      { id: 'reporting', labelKey: 'nav.reporting', slug: 'raporlama' },
      { id: 'mobile', labelKey: 'nav.mobile', slug: 'mobil' },
    ],
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
  if (id === 'dashboard') return '/'
  const item = findNavItem(id)
  if (!item) return '/'
  return `/${item.slug}`
}

/** URL → kenar çubuğu vurgusu (geçersiz segment için dashboard varsayılır; canvas ayrıca yönlendirir). */
export function activeModuleIdFromPathname(pathname: string): string {
  if (pathname === '/profile') return 'profile'
  if (pathname === '/settings') return 'settings'
  if (pathname === '/') return 'dashboard'
  const seg = pathname.replace(/^\//, '').split('/')[0]
  if (!seg) return 'dashboard'
  return findModuleIdBySlug(seg) ?? 'dashboard'
}

/** Aktif modülün hangi akordeon grubunda olduğu (yoksa null). */
export function navGroupIdForModuleId(moduleId: string, groups: NavGroup[]): string | null {
  for (const g of groups) {
    if (g.items.some((i) => i.id === moduleId)) return g.id
  }
  return null
}
