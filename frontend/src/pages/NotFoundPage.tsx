import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'
import { PublicPageHeader } from './PublicPageHeader'

export function NotFoundPage() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-dvh flex-col bg-pf-page">
      <PublicPageHeader />
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg text-center">
          <div
            className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-pf-muted text-gray-700 shadow-neo-out dark:text-gray-200"
            aria-hidden
          >
            <Search className="size-10" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            {t('error404.label')}
          </p>
          <h1 className="mt-2 text-6xl font-black tabular-nums tracking-tight text-gray-900 dark:text-gray-50">
            404
          </h1>
          <p className="mt-4 text-lg font-medium text-gray-800 dark:text-gray-200">{t('error404.title')}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {t('error404.body')}
          </p>
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-800 px-6 py-3.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:focus-visible:ring-offset-gray-900"
            >
              <Home className="size-4" strokeWidth={2} aria-hidden />
              {t('error404.home')}
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-xl bg-gray-100 px-6 py-3.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-100 dark:ring-offset-gray-900"
            >
              {t('error404.back')}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
