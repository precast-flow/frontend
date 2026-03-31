import type { MockRole } from './mockRbac'
import { MOCK_ROLES } from './mockRbac'

export type InviteStatus = 'none' | 'pending' | 'sent'

export type MockSessionRow = {
  id: string
  device: string
  location: string
  lastActivity: string
}

/** mvp-04 + mvp-17 (reports_to, durum satırı) */
export type MockManagedUser = {
  id: string
  name: string
  email: string
  title: string
  active: boolean
  roleIds: string[]
  factoryCodes: string[]
  /** P1 — varsayılan fabrika (erişilenlerden biri olmalı) */
  defaultFactoryCode: string
  lastLogin: string
  inviteStatus: InviteStatus
  sessions: MockSessionRow[]
  /**
   * mvp-17 — Rapor gönderimi (`reports_to`). `null` = üst yok (örn. müdür).
   */
  reportsToId: string | null
  /** mvp-17 — “Benim durumum” (serbest metin veya özet) */
  workStatusLine?: string
}

export const MOCK_MANAGED_USERS: MockManagedUser[] = [
  {
    id: 'u-tahir',
    name: 'Tahir Yılmaz',
    email: 'tahir@acme.com',
    title: 'Genel müdür yardımcısı · Üretim',
    active: true,
    roleIds: ['admin'],
    factoryCodes: ['IST-HAD', 'KOC-01'],
    defaultFactoryCode: 'IST-HAD',
    lastLogin: '21.03.2025 08:00',
    inviteStatus: 'sent',
    sessions: [{ id: 'st', device: 'Chrome · macOS', location: 'İstanbul', lastActivity: 'Bugün 07:58' }],
    reportsToId: null,
    workStatusLine: 'Ofiste — toplantı günü',
  },
  {
    id: 'u-sen',
    name: 'Sen Uzman (Ahmet Y.)',
    email: 'ahmet.sen@acme.com',
    title: 'Planlama uzmanı',
    active: true,
    roleIds: ['planning'],
    factoryCodes: ['IST-HAD'],
    defaultFactoryCode: 'IST-HAD',
    lastLogin: '21.03.2025 08:30',
    inviteStatus: 'sent',
    sessions: [{ id: 'ss', device: 'Edge · Windows', location: 'İstanbul', lastActivity: 'Bugün 08:28' }],
    reportsToId: 'u-tahir',
    workStatusLine: 'Uzaktan',
  },
  {
    id: 'u-emre',
    name: 'Emre Aydın',
    email: 'emre@acme.com',
    title: 'İş atama · MES koordinasyon',
    active: true,
    roleIds: ['planning', 'production'],
    factoryCodes: ['IST-HAD', 'KOC-01'],
    defaultFactoryCode: 'IST-HAD',
    lastLogin: '21.03.2025 07:45',
    inviteStatus: 'sent',
    sessions: [{ id: 'se', device: 'Chrome · Windows', location: 'İstanbul', lastActivity: 'Bugün 07:42' }],
    reportsToId: 'u-tahir',
    workStatusLine: 'Sahada',
  },
  {
    id: 'u1',
    name: 'Ayşe Kaya',
    email: 'ayse@acme.com',
    title: 'Operasyon koordinatörü',
    active: true,
    roleIds: ['admin'],
    factoryCodes: ['IST-HAD'],
    defaultFactoryCode: 'IST-HAD',
    lastLogin: '21.03.2025 08:12',
    inviteStatus: 'sent',
    sessions: [
      { id: 's1', device: 'Chrome · macOS', location: 'İstanbul', lastActivity: 'Bugün 08:10' },
      { id: 's2', device: 'Safari · iPhone', location: 'İstanbul', lastActivity: 'Dün 19:40' },
    ],
    reportsToId: 'u-tahir',
    workStatusLine: 'Ofiste',
  },
  {
    id: 'u2',
    name: 'Mehmet Yılmaz',
    email: 'mehmet@acme.com',
    title: 'Satış temsilcisi',
    active: true,
    roleIds: ['sales'],
    factoryCodes: ['IST-HAD', 'KOC-01'],
    defaultFactoryCode: 'IST-HAD',
    lastLogin: '20.03.2025 16:44',
    inviteStatus: 'sent',
    sessions: [
      { id: 's3', device: 'Edge · Windows 11', location: 'Kocaeli', lastActivity: '20.03.2025 16:40' },
    ],
    reportsToId: 'u-emre',
  },
  {
    id: 'u3',
    name: 'Zeynep Ak',
    email: 'zeynep@acme.com',
    title: 'Satış müdür yardımcısı',
    active: true,
    roleIds: ['sales', 'planning'],
    factoryCodes: ['IST-HAD', 'KOC-01'],
    defaultFactoryCode: 'KOC-01',
    lastLogin: '21.03.2025 07:55',
    inviteStatus: 'none',
    sessions: [
      { id: 's4', device: 'Chrome · Windows 11', location: 'İstanbul', lastActivity: 'Bugün 07:50' },
      { id: 's5', device: 'Firefox · Linux', location: 'VPN', lastActivity: '18.03.2025 11:02' },
    ],
    reportsToId: 'u-emre',
  },
  {
    id: 'u4',
    name: 'Can Demir',
    email: 'can@acme.com',
    title: 'Planlama mühendisi',
    active: true,
    roleIds: ['planning'],
    factoryCodes: ['KOC-01'],
    defaultFactoryCode: 'KOC-01',
    lastLogin: '19.03.2025 14:20',
    inviteStatus: 'pending',
    sessions: [{ id: 's6', device: 'Chrome · macOS', location: 'Kocaeli', lastActivity: '19.03.2025 14:18' }],
    reportsToId: 'u-emre',
  },
  {
    id: 'u5',
    name: 'Ali Veli',
    email: 'ali@acme.com',
    title: 'Üretim vardiya amiri',
    active: false,
    roleIds: ['production'],
    factoryCodes: ['IST-HAD'],
    defaultFactoryCode: 'IST-HAD',
    lastLogin: '10.02.2025 06:01',
    inviteStatus: 'sent',
    sessions: [{ id: 's7', device: 'Safari · iPad', location: 'İstanbul', lastActivity: '10.02.2025 05:58' }],
    reportsToId: 'u-emre',
  },
  {
    id: 'u6',
    name: 'Selin Koç',
    email: 'selin@acme.com',
    title: 'Kalite mühendisi',
    active: true,
    roleIds: ['quality'],
    factoryCodes: ['ANK-01'],
    defaultFactoryCode: 'ANK-01',
    lastLogin: '21.03.2025 09:30',
    inviteStatus: 'sent',
    sessions: [
      { id: 's8', device: 'Chrome · Android', location: 'Ankara', lastActivity: 'Bugün 09:28' },
      { id: 's9', device: 'Chrome · Windows 11', location: 'Ankara', lastActivity: '15.03.2025 17:12' },
    ],
    reportsToId: 'u-emre',
  },
]

export function roleLabel(id: string, roles: MockRole[] = MOCK_ROLES): string {
  return roles.find((r) => r.id === id)?.label ?? id
}

export function userNameById(id: string, users: MockManagedUser[]): string {
  return users.find((u) => u.id === id)?.name ?? id
}
