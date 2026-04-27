import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Building2,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  Factory,
  FileText,
  FolderKanban,
  HardHat,
  LayoutDashboard,
  LayoutGrid,
  ListOrdered,
  PanelsTopLeft,
  PlayCircle,
  FlaskConical,
  Gauge,
  ScanEye,
  Settings,
  Shield,
  Smartphone,
  Sunrise,
  Tags,
  Truck,
  UserCircle,
  Users,
  Warehouse,
  ShieldCheck,
  Waypoints,
  MapPinned,
  KeyRound,
  UsersRound,
} from 'lucide-react'

const NAV_ICONS: Record<string, LucideIcon> = {
  'planning-hub': PanelsTopLeft,
  dashboard: LayoutDashboard,
  profile: UserCircle,
  settings: Settings,
  crm: Users,
  quote: FileText,
  'work-start': PlayCircle,
  project: FolderKanban,
  engineering: ClipboardCheck,
  'element-identity': Tags,
  'production-summary': Sunrise,
  mes: Factory,
  'mold-board': LayoutGrid,
  'pending-priority': ListOrdered,
  'concrete-recipe': FlaskConical,
  'batch-plant': Gauge,
  'production-role-preview': ScanEye,
  'planning-design': CalendarRange,
  'production-factory-ops': Building2,
  quality: ShieldCheck,
  yard: Warehouse,
  dispatch: Truck,
  field: HardHat,
  reporting: BarChart3,
  mobile: Smartphone,
  'approval-flow': Waypoints,
  'roles-permissions': KeyRound,
  'user-management': UsersRound,
  'unit-work-queue': ClipboardList,
  'logistics-field-queues': MapPinned,
}

export function NavItemIcon({ id, className }: { id: string; className?: string }) {
  const Icon = NAV_ICONS[id] ?? LayoutDashboard
  return <Icon className={className ?? 'size-5 shrink-0'} strokeWidth={1.75} aria-hidden />
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  production: Factory,
  planning: FolderKanban,
  quality: ShieldCheck,
  logistics: Truck,
  system: Shield,
  account: UserCircle,
}

export function NavSectionIcon({ groupId, className }: { groupId: string; className?: string }) {
  const Icon = SECTION_ICONS[groupId] ?? LayoutDashboard
  return <Icon className={className ?? 'size-5 shrink-0'} strokeWidth={1.75} aria-hidden />
}
