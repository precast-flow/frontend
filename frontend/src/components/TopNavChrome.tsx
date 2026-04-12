import { useEffect, useId, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Moon, Sun, User } from 'lucide-react'
import { useThemeMode } from '../theme/ThemeProvider'
import { useFactoryContext } from '../context/FactoryContext'
import { useI18n } from '../i18n/I18nProvider'
import { notificationFeedItems } from '../data/dashboardMock'

export type ChromeMenu = null | 'notif' | 'user'

type Props = {
  chromeMenu: ChromeMenu
  setChromeMenu: (v: ChromeMenu) => void
  onModuleNavigate?: (moduleId: string) => void
}

export function TopNavChrome({ chromeMenu, setChromeMenu, onModuleNavigate }: Props) {
  const { t } = useI18n()
  const menuId = useId()
  const navigate = useNavigate()
  const { mode, toggle: toggleTheme } = useThemeMode()
  const { selectedCodes } = useFactoryContext()

  const notifWrapRef = useRef<HTMLDivElement>(null)
  const userWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chromeMenu) return
    const onDoc = (e: MouseEvent) => {
      const node = e.target as Node
      if (notifWrapRef.current?.contains(node) || userWrapRef.current?.contains(node)) return
      setChromeMenu(null)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [chromeMenu, setChromeMenu])

  return (
    <div className="gm-topnav-chrome-wrap flex shrink-0 items-center gap-1 border-l pl-2 md:gap-1.5 md:pl-3">
      <button
        type="button"
        onClick={() => toggleTheme()}
        className="gm-topnav-chrome-btn flex size-10 shrink-0 items-center justify-center rounded-xl border backdrop-blur-sm transition hover:brightness-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 dark:focus-visible:ring-cyan-400/50"
        aria-label={mode === 'dark' ? t('topbar.themeToLight') : t('topbar.themeToDark')}
        title={mode === 'dark' ? t('topbar.themeLight') : t('topbar.themeDark')}
      >
        {mode === 'dark' ? (
          <Sun className="size-5" strokeWidth={2} aria-hidden />
        ) : (
          <Moon className="size-5" strokeWidth={2} aria-hidden />
        )}
      </button>

      <div className="relative" ref={notifWrapRef}>
        <button
          type="button"
          id={`${menuId}-notif-trigger`}
          aria-haspopup="menu"
          aria-expanded={chromeMenu === 'notif'}
          aria-controls={`${menuId}-notif-panel`}
          onClick={() => setChromeMenu(chromeMenu === 'notif' ? null : 'notif')}
          className={[
            'gm-topnav-chrome-btn relative flex size-10 shrink-0 items-center justify-center rounded-xl border backdrop-blur-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 dark:focus-visible:ring-cyan-400/50',
            chromeMenu === 'notif' ? 'gm-topnav-chrome-btn--open' : '',
          ].join(' ')}
          aria-label={t('topbar.notifications')}
        >
          <Bell className="size-5" strokeWidth={2} aria-hidden />
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white dark:bg-violet-500">
            {notificationFeedItems.length}
          </span>
        </button>

        {chromeMenu === 'notif' ? (
          <div
            id={`${menuId}-notif-panel`}
            role="menu"
            aria-labelledby={`${menuId}-notif-trigger`}
            className="gm-topnav-dropdown-panel absolute right-0 top-[calc(100%+6px)] z-[125] max-h-[min(70dvh,24rem)] w-[min(100vw-2rem,22rem)] overflow-y-auto rounded-2xl p-2"
          >
            <p className="border-b border-slate-200/90 px-2 pb-2 text-xs font-semibold text-slate-900 dark:border-white/10 dark:text-slate-100">
              {t('topbar.notifTitle')}
            </p>
            <ul className="py-1">
              {notificationFeedItems.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    role="menuitem"
                    className="gm-topnav-dd-item flex w-full flex-col gap-0.5 rounded-xl px-2 py-2.5 text-left text-sm text-slate-800 focus-visible:outline-none dark:text-[var(--glass-text-primary)]"
                    onClick={() => {
                      setChromeMenu(null)
                      onModuleNavigate?.(n.moduleId)
                    }}
                  >
                    <span className="font-semibold">{n.title}</span>
                    <span className="text-xs text-slate-600 dark:text-[var(--glass-text-muted)]">{n.detail}</span>
                    <span className="text-[11px] text-slate-500 dark:text-[var(--glass-text-muted)]">{n.time}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="gm-topnav-dd-muted border-t border-slate-200/90 px-2 pt-2 text-[11px] dark:border-white/10">
              {t('topbar.notifFoot')}
            </p>
          </div>
        ) : null}
      </div>

      <div className="relative" ref={userWrapRef}>
        <button
          type="button"
          id={`${menuId}-user-trigger`}
          aria-haspopup="menu"
          aria-expanded={chromeMenu === 'user'}
          aria-controls={`${menuId}-user-panel`}
          onClick={() => setChromeMenu(chromeMenu === 'user' ? null : 'user')}
          className={[
            'gm-topnav-chrome-btn flex h-10 max-w-[10rem] shrink-0 items-center gap-1 rounded-xl border pl-2 pr-1.5 backdrop-blur-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 dark:focus-visible:ring-cyan-400/50 md:max-w-[12rem] md:pl-2.5',
            chromeMenu === 'user' ? 'gm-topnav-chrome-btn--open' : '',
          ].join(' ')}
        >
          <User className="size-4 shrink-0 opacity-90" aria-hidden />
          <span className="hidden min-w-0 flex-1 truncate text-left text-xs font-medium sm:inline">
            ayse@acme.com
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-slate-500 transition-transform dark:text-[var(--glass-text-muted)] ${chromeMenu === 'user' ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

        {chromeMenu === 'user' ? (
          <div
            id={`${menuId}-user-panel`}
            role="menu"
            aria-labelledby={`${menuId}-user-trigger`}
            className="gm-topnav-dropdown-panel absolute right-0 top-[calc(100%+6px)] z-[125] w-56 rounded-2xl py-2"
          >
            <p className="gm-topnav-dd-heading border-b border-slate-200/90 px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:text-[var(--glass-text-muted)]">
              {t('topbar.userLoggedIn')}{' '}
              <span className="font-medium text-slate-900 dark:text-[var(--glass-text-primary)]">ayse@acme.com</span>
            </p>
            <p className="px-3 py-2 text-[11px] leading-relaxed text-slate-600 dark:text-[var(--glass-text-muted)]">
              {t('topbar.userCompany')}{' '}
              <span className="font-medium text-slate-800 dark:text-[var(--glass-text-primary)]">
                {selectedCodes.join(', ')}
              </span>
            </p>
            <button
              type="button"
              role="menuitem"
              className="gm-topnav-dd-item flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-800 dark:text-[var(--glass-text-primary)]"
              onClick={() => {
                setChromeMenu(null)
                navigate('/profile')
              }}
            >
              <User className="size-4 opacity-70" aria-hidden />
              {t('topbar.profile')}
            </button>
            <button
              type="button"
              role="menuitem"
              className="gm-topnav-dd-item flex w-full px-3 py-2.5 text-left text-sm text-slate-800 dark:text-[var(--glass-text-primary)]"
              onClick={() => {
                setChromeMenu(null)
                navigate('/settings')
              }}
            >
              {t('topbar.settings')}
            </button>
            <div className="my-1 h-px bg-slate-200/90 dark:bg-white/15" role="separator" />
            <button
              type="button"
              role="menuitem"
              className="gm-topnav-dd-item flex w-full px-3 py-2.5 text-left text-sm text-slate-500 dark:text-[var(--glass-text-muted)]"
              onClick={() => {
                setChromeMenu(null)
                navigate('/login')
              }}
            >
              {t('topbar.logout')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
