import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useThemeMode } from '../theme/ThemeProvider'
import { useI18n } from '../i18n/I18nProvider'

/** Logo + tema + uygulama linki — auth ve hata sayfaları */
export function PublicPageHeader() {
  const { mode, toggle } = useThemeMode()
  const { t } = useI18n()

  return (
    <header className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
      <Link
        to="/"
        className="flex items-center gap-3 rounded-xl p-2 text-gray-900 shadow-neo-out-sm transition hover:shadow-neo-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-800/80 dark:text-gray-100 dark:focus-visible:ring-offset-gray-900"
      >
        <span
          className="flex size-11 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold tabular-nums text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
          aria-hidden
        >
          PF
        </span>
        <span className="hidden text-sm font-semibold sm:inline">Precast Flow</span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className="flex size-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white dark:focus-visible:ring-offset-gray-900"
          aria-label={mode === 'dark' ? t('topbar.themeToLight') : t('topbar.themeToDark')}
        >
          {mode === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
        <Link
          to="/"
          className="text-sm font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-gray-100"
        >
          {t('public.backToApp')}
        </Link>
      </div>
    </header>
  )
}
