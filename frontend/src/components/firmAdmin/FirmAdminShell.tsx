import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeft, ChevronDown, User } from 'lucide-react'
import { FIRM_ADMIN_NAV } from '../../data/firmAdminNav'
import { FIRM_ADMIN_TENANT } from '../../data/firmAdminMock'
import { useI18n } from '../../i18n/I18nProvider'

function breadcrumbSegmentKey(pathname: string): string {
  if (pathname.endsWith('/takvim')) return 'firmAdmin.breadcrumb.calendar'
  if (pathname.endsWith('/fabrikalar')) return 'firmAdmin.breadcrumb.factories'
  if (pathname.endsWith('/kullanicilar')) return 'firmAdmin.breadcrumb.users'
  if (pathname.endsWith('/guvenlik')) return 'firmAdmin.breadcrumb.security'
  if (pathname.endsWith('/degisiklik')) return 'firmAdmin.breadcrumb.changePreview'
  return 'firmAdmin.breadcrumb.general'
}

export function FirmAdminShell() {
  const { t } = useI18n()
  const location = useLocation()
  const segmentKey = breadcrumbSegmentKey(location.pathname)

  const navBtn =
    'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900'
  const navActive = 'bg-gray-100 font-medium text-gray-900 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-50'
  const navIdle =
    'text-gray-700 hover:bg-gray-100/80 dark:text-gray-200 dark:hover:bg-gray-900/80'

  return (
    <div className="min-h-dvh bg-pf-page">
      <div className="mx-auto flex min-h-dvh max-w-[1600px] flex-col gap-4 p-4 md:flex-row md:gap-5 md:p-5">
        <aside
          className="flex w-full shrink-0 flex-col rounded-3xl bg-pf-surface p-3 shadow-neo-out md:w-[min(280px,100%)] md:min-w-[260px]"
          aria-label={t('firmAdmin.sidebarAria')}
        >
          <div className="mb-3 border-b border-gray-200/90 pb-3 dark:border-gray-700/90">
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-gray-700 shadow-none transition hover:bg-gray-100 hover:shadow-neo-out-sm dark:text-gray-200 dark:hover:bg-gray-800/80"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              {t('firmAdmin.backToApp')}
            </NavLink>
          </div>
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('firmAdmin.sidebarTitle')}
          </p>
          <nav className="flex flex-col gap-1">
            {FIRM_ADMIN_NAV.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.id === 'general'}
                className={({ isActive }) => `${navBtn} ${isActive ? navActive : navIdle}`}
              >
                <item.icon className="size-5 shrink-0 text-gray-600 dark:text-gray-300" strokeWidth={1.75} />
                <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
          {/* Üst bar — P0 */}
          <header className="flex flex-col gap-3 rounded-3xl bg-pf-surface px-4 py-3 shadow-neo-out-sm md:flex-row md:items-center md:justify-between md:px-5">
            <div className="min-w-0">
              <nav className="text-xs text-gray-500 dark:text-gray-400" aria-label={t('firmAdmin.breadcrumbAria')}>
                <ol className="flex flex-wrap items-center gap-1.5">
                  <li>
                    <span className="font-medium text-gray-700 dark:text-gray-200">{t('firmAdmin.breadcrumbRoot')}</span>
                  </li>
                  <li aria-hidden className="text-gray-400">
                    /
                  </li>
                  <li className="font-medium text-gray-900 dark:text-gray-50">{t(segmentKey)}</li>
                </ol>
              </nav>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-xl">
                  {FIRM_ADMIN_TENANT.shortName}
                </h1>
                <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-950 dark:bg-amber-900/50 dark:text-amber-100">
                  {t('firmAdmin.envDemo')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 shadow-neo-in dark:bg-gray-900 dark:text-gray-50"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                  <User className="size-4" strokeWidth={2} aria-hidden />
                </span>
                <span className="hidden sm:inline">{t('firmAdmin.userMock')}</span>
                <ChevronDown className="size-4 text-gray-500" aria-hidden />
              </button>
            </div>
          </header>

          {/* P1 — eksik bilgi */}
          {FIRM_ADMIN_TENANT.logoMissing ? (
            <div
              className="rounded-2xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-neo-in dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100"
              role="status"
            >
              <p className="font-medium">{t('firmAdmin.missingBannerTitle')}</p>
              <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">{t('firmAdmin.missingBannerBody')}</p>
            </div>
          ) : null}

          <main className="min-h-0 flex-1 rounded-3xl bg-pf-surface p-5 shadow-neo-out md:p-6">
            <Outlet />
          </main>

          {/* P2 — süper admin */}
          <p className="text-center text-[11px] text-gray-500 dark:text-gray-400">{t('firmAdmin.superAdminNote')}</p>
        </div>
      </div>
    </div>
  )
}
