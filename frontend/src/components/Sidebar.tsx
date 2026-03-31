import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import type { NavGroup, NavItem } from '../data/navigation'
import { NavItemIcon } from './sidebarNavIcons'

type Props = {
  /** “Başlangıç” — Genel bakış ve birim iş kuyruğu vb. */
  startItems: NavItem[]
  groups: NavGroup[]
  /** Hesap (profil / ayarlar) — URL ile eşleşen ek grup */
  accountGroup?: NavGroup
  activeId: string
  onSelect: (id: string) => void
  collapsed: boolean
  onToggleCollapsed: () => void
  /**
   * Desktop dar modda hover ile geçici açılma bilgisini dışarı raporlar.
   * (Alttaki barın "itme" davranışı için.)
   */
  onDesktopHoverExpandedChange?: (hoveredExpanded: boolean) => void
}

function NavModuleButton({
  item,
  active,
  collapsed,
  onSelect,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onSelect: (id: string) => void
}) {
  const { t } = useI18n()
  const label = t(item.labelKey)
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      title={collapsed ? label : undefined}
      className={[
        'flex w-full items-center rounded-xl text-sm transition',
        'justify-start gap-2 px-3 py-2.5 text-left',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900',
        active
          ? 'bg-gray-100 font-medium text-gray-900 shadow-neo-in dark:bg-gray-950 dark:text-gray-50'
          : 'text-gray-700 shadow-none hover:bg-gray-100/80 hover:shadow-neo-out-sm dark:text-gray-200 dark:hover:bg-gray-800/80',
      ].join(' ')}
    >
      <NavItemIcon id={item.id} className="size-5 shrink-0 text-gray-700 dark:text-gray-200" />
      <span
        className={[
          'min-w-0 flex-1 truncate whitespace-nowrap transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          collapsed ? 'max-w-0 -translate-x-1 opacity-0' : 'max-w-[14rem] translate-x-0 opacity-100',
        ].join(' ')}
        aria-hidden={collapsed}
      >
        {label}
      </span>
      {collapsed ? <span className="sr-only">{label}</span> : null}
    </button>
  )
}

/**
 * Yüzen [protrude] panel — daraltılmış modda yalnızca ikonlar (md+).
 */
export function Sidebar({
  startItems,
  groups,
  accountGroup,
  activeId,
  onSelect,
  collapsed,
  onToggleCollapsed,
  onDesktopHoverExpandedChange,
}: Props) {
  const { t } = useI18n()
  const [isHoverExpanded, setIsHoverExpanded] = useState(false)
  const isExpanded = !collapsed || isHoverExpanded

  useEffect(() => {
    onDesktopHoverExpandedChange?.(isHoverExpanded)
  }, [isHoverExpanded, onDesktopHoverExpandedChange])

  useEffect(() => {
    if (!collapsed) setIsHoverExpanded(false)
  }, [collapsed])

  return (
    <aside
      className={[
        'flex shrink-0 flex-col gap-1 rounded-3xl bg-pf-surface shadow-neo-out',
        'transition-[width,min-width,padding,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
        'md:absolute md:left-0 md:top-0 md:z-[60]',
        'w-[min(280px,calc(100vw-1.5rem))]',
        collapsed && !isHoverExpanded
          ? 'p-3 md:w-[4.75rem] md:min-w-[4.75rem] md:overflow-hidden md:px-3 md:pb-3 md:pt-2 md:hover:w-[280px] md:hover:min-w-[280px] md:hover:overflow-visible md:hover:pt-3'
          : 'p-3 md:w-[280px] md:min-w-[280px] md:overflow-visible md:px-3 md:pb-3 md:pt-3',
      ].join(' ')}
      aria-label={t('sidebar.menu')}
      onMouseEnter={() => {
        if (!collapsed) return
        setIsHoverExpanded(true)
      }}
      onMouseLeave={() => {
        if (!collapsed) return
        setIsHoverExpanded(false)
      }}
    >
      <div className="mb-1 flex min-h-[44px] items-center gap-2 justify-between">
        <div
          className={[
            'min-w-0 flex-1 overflow-hidden px-0.5',
            'transition-[max-width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
            isExpanded ? 'max-w-full' : 'max-w-0',
          ].join(' ')}
        >
          <div className="flex flex-col justify-center gap-0.5 py-0.5">
            <p
              className={[
                'text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400',
                'transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
                isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0',
              ].join(' ')}
            >
              {t('sidebar.modulesTitle')}
            </p>
            <p
              className={[
                'text-sm text-gray-700 dark:text-gray-300',
                'transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:delay-0 motion-reduce:transition-none',
                isExpanded ? 'translate-x-0 opacity-100 delay-[130ms]' : '-translate-x-2 opacity-0 delay-0',
              ].join(' ')}
            >
              {t('sidebar.modulesSubtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          className="hidden shrink-0 rounded-xl bg-gray-100 p-2.5 text-gray-700 shadow-neo-out-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white md:flex md:items-center md:justify-start md:gap-2"
        >
          <span
            className="flex size-7 items-center justify-center rounded-xl bg-gray-900/5 text-sm font-bold tabular-nums text-gray-900 dark:bg-gray-900/10 dark:text-gray-100"
            aria-hidden
          >
            PF
          </span>
          <span
            className={[
              'min-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold tabular-nums transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
              isExpanded ? 'max-w-[10rem] opacity-100 translate-x-0' : 'max-w-0 opacity-0 -translate-x-1',
            ].join(' ')}
          >
            Precast Flow
          </span>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden pr-0.5 md:gap-4">
        <div>
          <div className="mb-1.5 flex h-4 items-center px-2">
            {isExpanded ? (
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none dark:text-gray-400 md:translate-x-0 md:opacity-100">
                {t('sidebar.start')}
              </p>
            ) : (
              <div className="h-px w-full rounded-full bg-gray-300/70 dark:bg-gray-700/70" aria-hidden />
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {startItems.map((item) => (
              <li key={item.id}>
                <NavModuleButton
                  item={item}
                  active={activeId === item.id}
                  collapsed={!isExpanded}
                  onSelect={onSelect}
                />
              </li>
            ))}
          </ul>
        </div>

        {groups.map((group) => (
          <div key={group.id}>
            <div className="mb-1.5 flex h-4 items-center px-2">
              {isExpanded ? (
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none dark:text-gray-400 md:translate-x-0 md:opacity-100">
                  {t(group.titleKey)}
                </p>
              ) : (
                <div className="h-px w-full rounded-full bg-gray-300/70 dark:bg-gray-700/70" aria-hidden />
              )}
            </div>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  <NavModuleButton
                    item={item}
                    active={item.id === activeId}
                    collapsed={!isExpanded}
                    onSelect={onSelect}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}

        {accountGroup ? (
          <div>
            <div className="mb-1.5 flex h-4 items-center px-2">
              {isExpanded ? (
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none dark:text-gray-400 md:translate-x-0 md:opacity-100">
                  {t(accountGroup.titleKey)}
                </p>
              ) : (
                <div className="h-px w-full rounded-full bg-gray-300/70 dark:bg-gray-700/70" aria-hidden />
              )}
            </div>
            <ul className="flex flex-col gap-1">
              {accountGroup.items.map((item) => (
                <li key={item.id}>
                  <NavModuleButton
                    item={item}
                    active={item.id === activeId}
                    collapsed={!isExpanded}
                    onSelect={onSelect}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </nav>
    </aside>
  )
}
