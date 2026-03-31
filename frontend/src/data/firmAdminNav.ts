import type { LucideIcon } from 'lucide-react'
import { Building2, CalendarClock, FileDiff, LayoutDashboard, Shield, Users } from 'lucide-react'

export type FirmAdminNavItem = {
  id: string
  path: string
  labelKey: string
  icon: LucideIcon
}

/** Sol menü — firm-01 P0 */
export const FIRM_ADMIN_NAV: FirmAdminNavItem[] = [
  { id: 'general', path: '/firma-ayarlari', labelKey: 'firmAdmin.nav.general', icon: LayoutDashboard },
  {
    id: 'calendar',
    path: '/firma-ayarlari/takvim',
    labelKey: 'firmAdmin.nav.calendar',
    icon: CalendarClock,
  },
  { id: 'factories', path: '/firma-ayarlari/fabrikalar', labelKey: 'firmAdmin.nav.factories', icon: Building2 },
  { id: 'users', path: '/firma-ayarlari/kullanicilar', labelKey: 'firmAdmin.nav.users', icon: Users },
  {
    id: 'change-preview',
    path: '/firma-ayarlari/degisiklik',
    labelKey: 'firmAdmin.nav.changePreview',
    icon: FileDiff,
  },
  { id: 'security', path: '/firma-ayarlari/guvenlik', labelKey: 'firmAdmin.nav.security', icon: Shield },
]
