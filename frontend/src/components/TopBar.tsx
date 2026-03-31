import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Info, Moon, Search, Sun, User } from 'lucide-react'
import { useThemeMode } from '../theme/ThemeProvider'
import { useFactoryContext } from '../context/FactoryContext'
import { useI18n } from '../i18n/I18nProvider'
import { notificationFeedItems } from '../data/dashboardMock'
import { useFixedMenuPosition } from './useFixedMenuPosition'

type Props = {
  onMenuToggle?: () => void
  /** mvp-14 — bildirimden modüle git */
  onModuleNavigate?: (moduleId: string) => void
}

export function TopBar({ onMenuToggle, onModuleNavigate }: Props) {
  const { t } = useI18n()
  const menuId = useId()
  const navigate = useNavigate()
  const [userOpen, setUserOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [factoryOpen, setFactoryOpen] = useState(false)
  const userWrapRef = useRef<HTMLDivElement>(null)
  const notifWrapRef = useRef<HTMLDivElement>(null)
  const factoryWrapRef = useRef<HTMLDivElement>(null)
  const factoryMenuRef = useRef<HTMLDivElement>(null)
  const notifMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const factoryPos = useFixedMenuPosition(factoryWrapRef, factoryOpen)
  const notifPos = useFixedMenuPosition(notifWrapRef, notifOpen)
  const userPos = useFixedMenuPosition(userWrapRef, userOpen)
  const { mode, toggle: toggleTheme } = useThemeMode()
  const {
    factories,
    selectedCodes,
    toggleSelectedCode,
    lastSyncLabel,
    openFactoryDrawer,
  } = useFactoryContext()

  useEffect(() => {
    if (!userOpen) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (userWrapRef.current?.contains(t) || userMenuRef.current?.contains(t)) return
      setUserOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [userOpen])

  useEffect(() => {
    if (!notifOpen) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (notifWrapRef.current?.contains(t) || notifMenuRef.current?.contains(t)) return
      setNotifOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [notifOpen])

  useEffect(() => {
    if (!factoryOpen) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (factoryWrapRef.current?.contains(t) || factoryMenuRef.current?.contains(t)) return
      setFactoryOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [factoryOpen])

  const selectedFactoryLabel =
    selectedCodes.length === 1
      ? factories.find((f) => f.code === selectedCodes[0])?.name ?? selectedCodes[0]
      : t('topbar.factoryMultiSelected', { count: String(selectedCodes.length) })

  const factoryMenu =
    factoryOpen ? (
      <div
        ref={factoryMenuRef}
        role="menu"
        className="gm-glass-dropdown-panel gm-glass-topbar-menu-portal fixed z-[130] max-h-64 overflow-y-auto rounded-2xl p-2"
        style={{
          top: factoryPos.top,
          left: factoryPos.left,
          width: factoryPos.width,
        }}
      >
        {factories.map((f) => {
          const checked = selectedCodes.includes(f.code)
          return (
            <label
              key={f.code}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-950/80"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleSelectedCode(f.code)}
                className="size-4 rounded border-gray-400 text-gray-800 focus:ring-gray-400"
              />
              <span className="font-mono text-xs">{f.code}</span>
              <span className="truncate">{f.name}</span>
            </label>
          )
        })}
      </div>
    ) : null

  const notifMenu =
    notifOpen ? (
      <div
        ref={notifMenuRef}
        role="menu"
        className="gm-glass-dropdown-panel gm-glass-topbar-menu-portal fixed z-[130] w-[min(100vw-2rem,22rem)] max-h-[min(70dvh,24rem)] overflow-y-auto rounded-2xl py-1"
        style={{
          top: notifPos.top,
          right: notifPos.rightInset,
        }}
      >
        <p className="border-b border-gray-200/80 px-3 py-2 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-100">
          {t('topbar.notifTitle')}
        </p>
        <ul className="py-1">
          {notificationFeedItems.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                role="menuitem"
                className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-sm hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none dark:hover:bg-gray-950/80 dark:focus-visible:bg-gray-950/80"
                onClick={() => {
                  setNotifOpen(false)
                  onModuleNavigate?.(n.moduleId)
                }}
              >
                <span className="font-semibold text-gray-900 dark:text-gray-50">{n.title}</span>
                <span className="text-xs text-gray-600 dark:text-gray-300">{n.detail}</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{n.time}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-gray-200/80 px-3 py-2 text-[11px] text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {t('topbar.notifFoot')}
        </p>
      </div>
    ) : null

  const userMenu =
    userOpen ? (
      <div
        ref={userMenuRef}
        id={`user-menu-${menuId}`}
        role="menu"
        aria-labelledby={`user-trigger-${menuId}`}
        className="gm-glass-dropdown-panel gm-glass-topbar-menu-portal fixed z-[130] w-56 rounded-2xl py-1"
        style={{
          top: userPos.top,
          right: userPos.rightInset,
        }}
      >
        <p className="border-b border-gray-200/80 px-3 py-2.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400">
          {t('topbar.userLoggedIn')}{' '}
          <span className="font-medium text-gray-800 dark:text-gray-200">ayse@acme.com</span>
        </p>
        <p className="px-3 py-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
          {t('topbar.userCompany')}{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">{selectedCodes.join(', ')}</span>
        </p>
        <button
          type="button"
          role="menuitem"
          className="flex w-full px-3 py-2.5 text-left text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:bg-gray-950/90/90 focus-visible:bg-gray-50 dark:bg-gray-950/90/90 focus-visible:outline-none dark:text-gray-200 dark:hover:bg-gray-800/90 dark:focus-visible:bg-gray-800/90"
          onClick={() => {
            setUserOpen(false)
            navigate('/profile')
          }}
        >
          {t('topbar.profile')}
        </button>
        <button
          type="button"
          role="menuitem"
          className="flex w-full px-3 py-2.5 text-left text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:bg-gray-950/90/90 focus-visible:bg-gray-50 dark:bg-gray-950/90/90 focus-visible:outline-none dark:text-gray-200 dark:hover:bg-gray-800/90 dark:focus-visible:bg-gray-800/90"
          onClick={() => {
            setUserOpen(false)
            navigate('/settings')
          }}
        >
          {t('topbar.settings')}
        </button>
        <div className="my-1 h-px bg-gray-200/90 dark:bg-gray-700" role="separator" />
        <button
          type="button"
          role="menuitem"
          className="flex w-full px-3 py-2.5 text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-950/90/90 focus-visible:bg-gray-50 dark:bg-gray-950/90/90 focus-visible:outline-none dark:text-gray-400 dark:hover:bg-gray-800/90 dark:focus-visible:bg-gray-800/90"
          onClick={() => {
            setUserOpen(false)
            navigate('/login')
          }}
        >
          {t('topbar.logout')}
        </button>
      </div>
    ) : null

  return (
    <header className="relative z-[100] flex w-full flex-wrap items-center justify-end gap-x-3 gap-y-2.5 overflow-visible rounded-3xl bg-pf-surface px-4 py-3 shadow-neo-out-sm md:gap-x-4 md:gap-y-2.5 md:px-5">
      {/* Marka — mobil menü; masaüstünde boş slot */}
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          className="shrink-0 rounded-xl bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white md:hidden"
          onClick={onMenuToggle}
          aria-label={t('topbar.openMenu')}
        >
          {t('topbar.menu')}
        </button>
      </div>

      {/* Fabrika + senk + özet — dar ekranda satır içi veya alt satıra kırılır */}
      <div className="flex min-w-0 max-w-full flex-[1_1_auto] flex-wrap items-center justify-end gap-2">
        <div className="relative min-w-[10rem] max-w-full flex-[1_1_14rem]" ref={factoryWrapRef}>
          <button
            type="button"
            onClick={() => setFactoryOpen((o) => !o)}
            className="flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-full border-0 bg-gray-100 px-4 text-left text-sm font-medium text-gray-800 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-950 dark:text-gray-100 dark:ring-offset-gray-900"
            aria-expanded={factoryOpen}
            aria-haspopup="menu"
            aria-label={t('topbar.factorySelect')}
          >
            <span className="truncate">
              {selectedFactoryLabel}
            </span>
            <ChevronDown
              className={`size-4 shrink-0 text-gray-500 dark:text-gray-400 transition-transform ${factoryOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
        </div>
        <span
          className="inline-flex h-9 max-w-full shrink-0 items-center rounded-full bg-gray-100 px-2.5 text-[11px] font-medium tabular-nums text-gray-600 shadow-neo-in dark:bg-gray-950 dark:text-gray-300"
          title={t('topbar.syncTitle')}
        >
          <span className="truncate">
            {t('topbar.sync')}: {lastSyncLabel}
          </span>
        </span>
        <button
          type="button"
          onClick={openFactoryDrawer}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 disabled:cursor-not-allowed disabled:opacity-50 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white dark:ring-offset-gray-900"
          aria-label={t('topbar.factorySummary')}
          title={t('topbar.factorySummary')}
        >
          <Info className="size-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Global arama — sığmazsa blok olarak alta kayar; satırda esnek genişlik */}
      <div className="relative min-h-11 min-w-[min(100%,12rem)] max-w-[22rem] flex-[1_1_16rem] max-sm:max-w-none max-sm:flex-[1_1_100%] max-sm:min-w-0">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          aria-hidden
        />
        <input
          type="search"
          placeholder={t('topbar.searchPlaceholder')}
          className="h-11 w-full rounded-full border-0 bg-gray-100 dark:bg-gray-900 pl-10 pr-4 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in placeholder:text-gray-500 dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:text-gray-400 dark:ring-offset-gray-900"
          aria-label={t('topbar.globalSearchAria')}
        />
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <span
          className="rounded-full border border-gray-300/80 dark:border-gray-600/80 bg-gray-50 dark:bg-gray-950/90/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-300"
          title={t('topbar.envTitle')}
        >
          {t('topbar.demo')}
        </span>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-neo-out-sm transition hover:text-gray-900 dark:text-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white dark:ring-offset-gray-900"
          aria-label={mode === 'dark' ? t('topbar.themeToLight') : t('topbar.themeToDark')}
          title={mode === 'dark' ? t('topbar.themeLight') : t('topbar.themeDark')}
        >
          {mode === 'dark' ? (
            <Sun className="size-5" strokeWidth={1.75} aria-hidden />
          ) : (
            <Moon className="size-5" strokeWidth={1.75} aria-hidden />
          )}
        </button>

        <div className="relative" ref={notifWrapRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            aria-expanded={notifOpen}
            aria-haspopup="menu"
            className="relative flex size-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white dark:ring-offset-gray-900"
            aria-label={t('topbar.notifications')}
          >
            <Bell className="size-5" strokeWidth={1.75} />
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-white dark:bg-gray-200 dark:text-gray-900">
              {notificationFeedItems.length}
            </span>
          </button>
        </div>

        <div className="relative" ref={userWrapRef}>
          <button
            type="button"
            id={`user-trigger-${menuId}`}
            aria-haspopup="menu"
            aria-expanded={userOpen}
            aria-controls={`user-menu-${menuId}`}
            onClick={() => setUserOpen((o) => !o)}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-gray-100 dark:bg-gray-900 pl-3 pr-2 text-gray-800 dark:text-gray-100 shadow-neo-out-sm transition hover:text-gray-900 dark:text-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-100 dark:hover:text-white dark:ring-offset-gray-900"
          >
            <User className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="hidden max-w-[9rem] truncate text-left text-sm font-medium sm:inline">
              ayse@acme.com
            </span>
            <ChevronDown
              className={`size-4 shrink-0 text-gray-500 dark:text-gray-400 transition-transform dark:text-gray-400 ${userOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
        </div>
      </div>
      {typeof document !== 'undefined'
        ? createPortal(
            <>
              {factoryMenu}
              {notifMenu}
              {userMenu}
            </>,
            document.body,
          )
        : null}
    </header>
  )
}
