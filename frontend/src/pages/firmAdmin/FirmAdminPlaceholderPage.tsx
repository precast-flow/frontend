import { useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'

const PLACEHOLDER_KEYS: Record<string, { titleKey: string; bodyKey: string }> = {
  '/firma-ayarlari/takvim': {
    titleKey: 'firmAdmin.placeholder.calendarTitle',
    bodyKey: 'firmAdmin.placeholder.calendarBody',
  },
  '/firma-ayarlari/fabrikalar': {
    titleKey: 'firmAdmin.placeholder.factoriesTitle',
    bodyKey: 'firmAdmin.placeholder.factoriesBody',
  },
  '/firma-ayarlari/kullanicilar': {
    titleKey: 'firmAdmin.placeholder.usersTitle',
    bodyKey: 'firmAdmin.placeholder.usersBody',
  },
  '/firma-ayarlari/guvenlik': {
    titleKey: 'firmAdmin.placeholder.securityTitle',
    bodyKey: 'firmAdmin.placeholder.securityBody',
  },
}

export function FirmAdminPlaceholderPage() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const keys = PLACEHOLDER_KEYS[pathname] ?? {
    titleKey: 'firmAdmin.placeholder.fallbackTitle',
    bodyKey: 'firmAdmin.placeholder.fallbackBody',
  }

  return (
    <div className="rounded-2xl bg-gray-50 p-6 shadow-neo-in dark:bg-gray-950/70">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t(keys.titleKey)}</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t(keys.bodyKey)}</p>
      <div className="mt-6 h-32 rounded-xl bg-gray-200/80 shadow-neo-in dark:bg-gray-900/80" aria-hidden />
    </div>
  )
}
