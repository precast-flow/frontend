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
 * Prompt 02 — çekirdek 4 grup + Adım 11 MVP: `system` (Onay Akışı Tasarımcısı).
 * Raporlama + Mobil, 01’deki “nereye konur?” kararıyla Lojistik & Saha altında.
 */
export const navGroups: NavGroup[] = [
  {
    id: 'sales',
    titleKey: 'nav.group.sales',
    items: [
      { id: 'crm', labelKey: 'nav.crm', slug: 'crm' },
      { id: 'quote', labelKey: 'nav.quote', slug: 'teklif' },
      { id: 'work-start', labelKey: 'nav.workStart', slug: 'is-baslat' },
    ],
  },
  {
    id: 'project',
    titleKey: 'nav.group.project',
    items: [
      { id: 'project', labelKey: 'nav.project', slug: 'proje' },
      { id: 'engineering', labelKey: 'nav.engineering', slug: 'muhendislik' },
      { id: 'parametric-3d', labelKey: 'nav.parametric3d', slug: 'parametrik-3b' },
    ],
  },
  {
    id: 'production',
    titleKey: 'nav.group.production',
    items: [
      { id: 'production-summary', labelKey: 'nav.productionSummary', slug: 'uretim-ozet' },
      { id: 'mes', labelKey: 'nav.mes', slug: 'mes' },
      { id: 'planning-design', labelKey: 'nav.planningDesign', slug: 'planlama-tasarim' },
      { id: 'mold-board', labelKey: 'nav.moldBoard', slug: 'kalip-tahtasi' },
      { id: 'pending-priority', labelKey: 'nav.pendingPriority', slug: 'oncelik-raporu' },
      { id: 'concrete-recipe', labelKey: 'nav.concreteRecipe', slug: 'beton-recete' },
      { id: 'batch-plant', labelKey: 'nav.batchPlant', slug: 'beton-santrali' },
      { id: 'production-role-preview', labelKey: 'nav.productionRolePreview', slug: 'uretim-roller' },
      { id: 'production-factory-ops', labelKey: 'nav.productionFactoryOps', slug: 'fabrika-vardiya-kalip-ekip' },
      { id: 'quality', labelKey: 'nav.quality', slug: 'kalite' },
      { id: 'yard', labelKey: 'nav.yard', slug: 'yard' },
    ],
  },
  {
    id: 'logistics',
    titleKey: 'nav.group.logistics',
    items: [
      { id: 'dispatch', labelKey: 'nav.dispatch', slug: 'sevkiyat' },
      { id: 'field', labelKey: 'nav.field', slug: 'saha' },
      { id: 'reporting', labelKey: 'nav.reporting', slug: 'raporlama' },
      { id: 'mobile', labelKey: 'nav.mobile', slug: 'mobil' },
    ],
  },
  {
    id: 'system',
    titleKey: 'nav.group.system',
    items: [
      { id: 'approval-flow', labelKey: 'nav.approvalFlow', slug: 'onay-akisi' },
      { id: 'roles-permissions', labelKey: 'nav.roles', slug: 'roller-izinler' },
      { id: 'user-management', labelKey: 'nav.users', slug: 'kullanicilar' },
    ],
  },
]

/** Hesap — URL: `/profile`, `/settings` */
export const accountNavGroup: NavGroup = {
  id: 'account',
  titleKey: 'nav.group.account',
  items: [
    { id: 'profile', labelKey: 'nav.profile', slug: 'profil' },
    { id: 'settings', labelKey: 'nav.settings', slug: 'ayarlar' },
  ],
}

export function findNavItem(id: string): NavItem | undefined {
  const inStart = startNavItems.find((i) => i.id === id)
  if (inStart) return inStart
  for (const item of accountNavGroup.items) {
    if (item.id === id) return item
  }
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
