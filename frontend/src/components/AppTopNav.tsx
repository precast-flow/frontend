import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, LayoutGrid, Menu } from 'lucide-react'
import type { NavGroup, NavItem } from '../data/navigation'
import { moduleIdToPath } from '../data/navigation'
import { useI18n } from '../i18n/I18nProvider'
import { NavItemIcon, NavSectionIcon } from './sidebarNavIcons'
import { TopNavChrome, type ChromeMenu } from './TopNavChrome'

type Props = {
  /** Kenar çubuğu yoksa verilmez; mobil hamburger gösterilmez. */
  onMenuToggle?: () => void
  onModuleNavigate?: (moduleId: string) => void
  startItems: NavItem[]
  groups: NavGroup[]
  activeId: string
}

function startHasActiveItem(items: NavItem[], activeId: string) {
  return items.some((i) => i.id === activeId)
}

function groupHasActiveItem(group: NavGroup, activeId: string) {
  return group.items.some((i) => i.id === activeId)
}

function TopNavDropdownLink({
  item,
  activeId,
  onPick,
}: {
  item: NavItem
  activeId: string
  onPick: () => void
}) {
  const { t } = useI18n()
  const path = moduleIdToPath(item.id)
  const active = activeId === item.id

  return (
    <NavLink
      to={path}
      end={path === '/' || path === '/settings' || path === '/profile'}
      title={t(item.labelKey)}
      onClick={onPick}
      className={() =>
        [
          /* text-gray-* : glassmorphism.css [role=menu] ile uyumlu (!important ile okunur renk) */
          'gm-topnav-dd-item flex w-full min-w-[12rem] max-w-[min(100vw-2rem,20rem)] items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition',
          active
            ? 'bg-sky-500/15 font-medium text-gray-900 shadow-sm ring-1 ring-sky-500/25 dark:bg-white/12 dark:text-gray-50 dark:ring-white/10'
            : 'text-gray-800 hover:bg-gray-100/90 dark:text-gray-100 dark:hover:bg-white/10',
        ].join(' ')
      }
    >
        <NavItemIcon id={item.id} className="size-4 shrink-0 opacity-90" />
      <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
    </NavLink>
  )
}

type DropdownProps = {
  ddId: string
  openKey: string | null
  setOpenKey: (k: string | null) => void
  triggerLabel: string
  triggerIcon?: ReactNode
  hasActive: boolean
  children: React.ReactNode
  menuId: string
}

function TopNavDropdown({
  ddId,
  openKey,
  setOpenKey,
  triggerLabel,
  triggerIcon,
  hasActive,
  children,
  menuId,
}: DropdownProps) {
  const open = openKey === ddId
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpenKey(null)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, setOpenKey])

  return (
    <div className="relative shrink-0" data-topnav-dd={ddId}>
      <button
        ref={triggerRef}
        type="button"
        id={`${menuId}-trigger-${ddId}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${menuId}-panel-${ddId}`}
        onClick={() => setOpenKey(open ? null : ddId)}
        className={[
          'gm-topnav-trigger inline-flex max-w-[10rem] items-center gap-1.5 rounded-lg border-0 bg-transparent px-2.5 py-2 text-left text-xs font-semibold shadow-none transition md:max-w-[12rem] md:px-3 md:text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 dark:focus-visible:ring-cyan-400/60',
          hasActive || open ? 'gm-topnav-trigger--active' : '',
        ].join(' ')}
      >
        {triggerIcon ? <span className="shrink-0">{triggerIcon}</span> : null}
        <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-slate-500 transition-transform dark:text-[var(--glass-text-muted)] ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={`${menuId}-panel-${ddId}`}
          role="menu"
          aria-labelledby={`${menuId}-trigger-${ddId}`}
          className="gm-topnav-dropdown-panel absolute left-0 top-[calc(100%+6px)] z-[120] max-h-[min(70dvh,22rem)] min-w-[13rem] overflow-y-auto rounded-2xl p-1.5"
        >
          <div className="flex flex-col gap-0.5">{children}</div>
        </div>
      ) : null}
    </div>
  )
}

export function AppTopNav({ onMenuToggle, onModuleNavigate, startItems, groups, activeId }: Props) {
  const { t } = useI18n()
  const location = useLocation()
  const menuInstanceId = useId()
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null)
  const [chromeMenu, setChromeMenu] = useState<ChromeMenu>(null)

  const setNavDropdownKey = (k: string | null) => {
    setChromeMenu(null)
    setOpenGroupKey(k)
  }

  useEffect(() => {
    setOpenGroupKey(null)
    setChromeMenu(null)
  }, [location.pathname])

  const closeDropdowns = () => setOpenGroupKey(null)

  return (
    <header className="relative z-[100] flex w-full min-w-0 flex-col overflow-visible">
      <div className="gm-topnav-header-accent pointer-events-none absolute inset-x-0 bottom-0 h-px" aria-hidden />

      <div className="relative flex w-full min-w-0 flex-col gap-2 px-2 py-1.5 md:flex-row md:items-center md:gap-3 md:px-3 md:py-2">
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          {onMenuToggle ? (
            <button
              type="button"
              className="gm-topnav-icon-btn pointer-events-auto shrink-0 rounded-xl border px-2.5 py-2 shadow-sm backdrop-blur-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 dark:focus-visible:ring-cyan-400/70 md:hidden"
              onClick={onMenuToggle}
              aria-label={t('topbar.openMenu')}
            >
              <Menu className="size-5" strokeWidth={2} aria-hidden />
            </button>
          ) : null}

          <div
            className="gm-topnav-brand pointer-events-none flex min-w-0 max-w-[min(100%,15rem)] items-center gap-2.5 border-0 bg-transparent px-2 py-2 shadow-none sm:max-w-[17rem] sm:gap-3 sm:px-2.5 md:max-w-[19rem]"
            role="img"
            aria-label={`${t('sidebar.brandPrimary')}. ${t('sidebar.brandProduct')}`}
          >
            <span
              className="gm-topnav-brand-mark flex size-9 shrink-0 items-center justify-center border-0 bg-transparent text-xs font-bold tabular-nums tracking-tight shadow-none md:size-10 md:text-sm"
              aria-hidden
            >
              PF
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
              <span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-[var(--glass-text-muted)]">
                {t('sidebar.brandPrimary')}
              </span>
              <span className="truncate text-sm font-semibold tracking-tight text-slate-900 md:text-[0.95rem] dark:text-[var(--glass-text-primary)]">
                {t('sidebar.brandProduct')}
              </span>
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-2">
          <nav
            className="flex min-h-0 min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-2 overflow-visible md:flex-nowrap md:gap-x-2"
            aria-label={t('topNav.aria')}
          >
            <TopNavDropdown
              ddId="start"
              openKey={openGroupKey}
              setOpenKey={setNavDropdownKey}
              triggerLabel={t('sidebar.start')}
              triggerIcon={
                <LayoutGrid className="size-4 shrink-0 text-slate-500 dark:text-[var(--glass-text-muted)]" strokeWidth={2} aria-hidden />
              }
              hasActive={startHasActiveItem(startItems, activeId)}
              menuId={menuInstanceId}
            >
              {startItems.map((item) => (
                <TopNavDropdownLink key={item.id} item={item} activeId={activeId} onPick={closeDropdowns} />
              ))}
            </TopNavDropdown>

            {groups.map((group) => (
              <TopNavDropdown
                key={group.id}
                ddId={group.id}
                openKey={openGroupKey}
                setOpenKey={setNavDropdownKey}
                triggerLabel={t(group.titleKey)}
                triggerIcon={
                <NavSectionIcon
                  groupId={group.id}
                  className="size-4 text-slate-500 dark:text-[var(--glass-text-muted)]"
                />
              }
                hasActive={groupHasActiveItem(group, activeId)}
                menuId={menuInstanceId}
              >
                {group.items.map((item) => (
                  <TopNavDropdownLink key={item.id} item={item} activeId={activeId} onPick={closeDropdowns} />
                ))}
              </TopNavDropdown>
            ))}
          </nav>

          <TopNavChrome
            chromeMenu={chromeMenu}
            setChromeMenu={(v) => {
              if (v !== null) setOpenGroupKey(null)
              setChromeMenu(v)
            }}
            onModuleNavigate={onModuleNavigate}
          />
        </div>
      </div>
    </header>
  )
}
