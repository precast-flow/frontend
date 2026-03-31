/**
 * firm-03 — Firma genel ayarlar (mock seed).
 * Grup 1–2 alan kataloğu ile uyumlu örnek değerler.
 */

export type FirmGeneralSettingsState = {
  legalName: string
  shortName: string
  taxId: string
  address: string
  phone: string
  email: string
  timezone: string
  locale: string
  dateFormat: string
  /** P1 — data URL veya null */
  logoDataUrl: string | null
  kvkkAccepted: boolean
  /** P2 — salt okunur mock */
  tenantSlug: string
}

export const FIRM_GENERAL_SETTINGS_SEED: FirmGeneralSettingsState = {
  legalName: 'Acme Prefabrik A.Ş.',
  shortName: 'Acme',
  taxId: '1234567890',
  address: 'Organize Sanayi Bölgesi 12. Cad. No: 4, Hadımköy / İstanbul',
  phone: '+90 212 555 01 00',
  email: 'info@acme-prefabrik.example',
  timezone: 'Europe/Istanbul',
  locale: 'tr',
  dateFormat: 'DD.MM.YYYY',
  logoDataUrl: null,
  kvkkAccepted: true,
  tenantSlug: 'acme-prefabrik',
}

export const TIMEZONE_OPTIONS = [
  { value: 'Europe/Istanbul', labelKey: 'firmGeneral.tz.istanbul' },
  { value: 'Europe/Berlin', labelKey: 'firmGeneral.tz.berlin' },
  { value: 'UTC', labelKey: 'firmGeneral.tz.utc' },
] as const

export const DATE_FORMAT_OPTIONS = [
  { value: 'DD.MM.YYYY', labelKey: 'firmGeneral.date.dmy' },
  { value: 'YYYY-MM-DD', labelKey: 'firmGeneral.date.ymd' },
  { value: 'MM/DD/YYYY', labelKey: 'firmGeneral.date.mdy' },
] as const
