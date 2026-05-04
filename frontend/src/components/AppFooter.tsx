import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'

export function AppFooter() {
  const { t } = useI18n()
  return (
    <footer className="relative z-0 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 md:gap-x-3 md:px-3 md:py-2">
      <span className="text-gray-600 dark:text-gray-300">
        {t('footer.version')}{' '}
        <strong className="font-medium text-gray-800 dark:text-gray-100">0.1.0-proto</strong>
      </span>
      <span className="hidden sm:inline">{t('footer.syncPlaceholder')}</span>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link
          to="/login"
          className="font-medium text-gray-700 underline-offset-2 hover:text-gray-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:ring-offset-gray-900"
        >
          {t('footer.login')}
        </Link>
        <Link
          to="/register"
          className="font-medium text-gray-700 underline-offset-2 hover:text-gray-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:ring-offset-gray-900"
        >
          {t('footer.register')}
        </Link>
        <Link
          to="/profile"
          className="font-medium text-gray-700 underline-offset-2 hover:text-gray-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:ring-offset-gray-900"
        >
          {t('footer.profile')}
        </Link>
        <Link
          to="/settings"
          className="font-medium text-gray-700 underline-offset-2 hover:text-gray-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:ring-offset-gray-900"
        >
          {t('footer.settings')}
        </Link>
        <Link
          to="/403"
          className="font-medium text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:ring-offset-gray-900"
        >
          {t('footer.demo403')}
        </Link>
        <a
          href="#"
          className="rounded-sm font-medium text-gray-700 underline-offset-2 hover:text-gray-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:ring-offset-gray-900"
        >
          {t('footer.support')}
        </a>
      </div>
    </footer>
  )
}
