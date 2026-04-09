import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { navGroupIdForModuleId, type NavGroup, type NavItem } from '../data/navigation'
import { useI18n } from '../i18n/I18nProvider'
import { NavItemIcon, NavSectionIcon } from './sidebarNavIcons'

const SIDEBAR_SECTION_STORAGE_KEY = 'pf-sidebar-open-section'

type Props = {
  /** “Başlangıç” — Genel bakış ve birim iş kuyruğu vb. */
  startItems: NavItem[]
  /** Akordeon grupları (Üretim … Hesap) */
  groups: NavGroup[]
  activeId: string
  onSelect: (id: string) => void
  collapsed: boolean
  /** Dar modda PF tıklanınca genişletme */
  onExpandSidebar: () => void
  /**
   * Masaüstü dar modda hover ile geçici genişleme — üst çubuk sol padding’i ile senkron.
   */
  onDesktopHoverExpandedChange?: (hoveredExpanded: boolean) => void
}

function readStoredSectionId(validIds: Set<string>): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SIDEBAR_SECTION_STORAGE_KEY)
    if (raw && validIds.has(raw)) return raw
  } catch {
    /* ignore */
  }
  return null
}

function NavModuleButton({
  item,
  active,
  collapsed,
  onSelect,
  variant = 'default',
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onSelect: (id: string) => void
  variant?: 'default' | 'child'
}) {
  const { t } = useI18n()
  const label = t(item.labelKey)
  const isChild = variant === 'child'
  /** Dar şeritte akordeon altı — yalnızca ikon, ortalanmış */
  const isRail = isChild && collapsed

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      title={collapsed ? label : undefined}
      className={[
        'flex w-full items-center text-left transition-[background,box-shadow,border-color,transform] duration-150 ease-out motion-reduce:transition-none',
        isRail
          ? [
              'justify-center rounded-lg px-1.5 py-2',
              active
                ? 'bg-sky-500/15 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.35)] dark:bg-sky-400/15 dark:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.35)]'
                : 'hover:bg-gray-100/90 dark:hover:bg-gray-800/80',
            ].join(' ')
          : isChild
            ? [
                'gap-2.5 rounded-lg border border-transparent py-2 pr-2 text-[13px] leading-snug tracking-tight',
                'justify-start',
                active
                  ? 'border-l-[3px] border-sky-500 bg-gradient-to-r from-sky-500/[0.15] via-sky-500/[0.07] to-transparent pl-2 font-medium text-gray-900 dark:border-sky-400 dark:from-sky-400/[0.18] dark:via-sky-400/[0.09] dark:to-transparent dark:text-gray-50'
                  : 'pl-2.5 text-gray-600 hover:border-gray-200/80 hover:bg-gray-100/90 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-600/60 dark:hover:bg-gray-800/65 dark:hover:text-gray-100',
              ].join(' ')
            : [
                'justify-start gap-2 rounded-xl px-3 py-2.5 text-sm',
                active
                  ? 'bg-gray-100 font-medium text-gray-900 shadow-neo-in dark:bg-gray-950 dark:text-gray-50'
                  : 'text-gray-700 shadow-none hover:bg-gray-100/80 hover:shadow-neo-out-sm dark:text-gray-200 dark:hover:bg-gray-800/80',
              ].join(' '),
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900',
      ].join(' ')}
    >
      <NavItemIcon
        id={item.id}
        className={[
          'shrink-0 transition-colors duration-150',
          isRail
            ? active
              ? 'size-5 text-sky-600 dark:text-sky-300'
              : 'size-5 text-gray-600 dark:text-gray-400'
            : isChild
              ? active
                ? 'size-4 text-sky-600 dark:text-sky-300'
                : 'size-4 text-gray-500 opacity-90 dark:text-gray-500'
              : 'size-5 text-gray-700 dark:text-gray-200',
        ].join(' ')}
      />
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

function SidebarAccordionSection({
  group,
  isOpen,
  onToggle,
  activeId,
  isExpanded,
  onSelect,
}: {
  group: NavGroup
  isOpen: boolean
  onToggle: () => void
  activeId: string
  isExpanded: boolean
  onSelect: (id: string) => void
}) {
  const { t } = useI18n()
  const headingId = `sidebar-section-${group.id}`
  const panelId = `sidebar-panel-${group.id}`

  if (!isExpanded) {
    const sectionLabel = t(group.titleKey)
    return (
      <div className="rounded-xl border border-gray-200/80 bg-gray-50/40 dark:border-gray-700/80 dark:bg-gray-900/40">
        <button
          type="button"
          id={headingId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          title={sectionLabel}
          aria-label={sectionLabel}
          className={[
            'flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition',
            'text-gray-900 dark:text-gray-50',
            isOpen ? 'bg-gray-100/90 dark:bg-gray-800/90' : 'hover:bg-gray-100/90 dark:hover:bg-gray-800/80',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900',
          ].join(' ')}
        >
          <NavSectionIcon groupId={group.id} className="size-5 shrink-0 text-gray-700 dark:text-gray-200" />
          <ChevronDown
            className={[
              'size-3.5 shrink-0 text-gray-500 transition-transform duration-200 ease-out motion-reduce:transition-none dark:text-gray-400',
              isOpen ? 'rotate-180' : 'rotate-0',
            ].join(' ')}
            aria-hidden
          />
        </button>
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
          style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
        >
          <div id={panelId} role="region" aria-labelledby={headingId} className="min-h-0 overflow-hidden">
            <ul className="flex flex-col gap-1 pb-1.5 pt-0.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <NavModuleButton
                    item={item}
                    active={item.id === activeId}
                    collapsed
                    onSelect={onSelect}
                    variant="child"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200/80 bg-gray-50/40 dark:border-gray-700/80 dark:bg-gray-900/40">
      <button
        type="button"
        id={headingId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className={[
          'flex h-11 w-full items-center gap-2 rounded-xl px-2.5 text-left transition',
          'font-semibold text-gray-900 dark:text-gray-50',
          'hover:bg-gray-100/90 dark:hover:bg-gray-800/80',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900',
        ].join(' ')}
      >
        <NavSectionIcon groupId={group.id} className="size-5 shrink-0 text-gray-700 dark:text-gray-200" />
        <span className="min-w-0 flex-1 truncate text-sm">{t(group.titleKey)}</span>
        <ChevronDown
          className={[
            'size-4 shrink-0 text-gray-500 transition-transform duration-200 ease-out motion-reduce:transition-none dark:text-gray-400',
            isOpen ? 'rotate-180' : 'rotate-0',
          ].join(' ')}
          aria-hidden
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div id={panelId} role="region" aria-labelledby={headingId} className="min-h-0 overflow-hidden">
          <div
            className={[
              'mx-1 mb-2 mt-0.5 rounded-lg border border-gray-200/70 bg-gradient-to-b from-white/60 to-gray-50/40 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] dark:border-gray-700/70 dark:from-gray-950/55 dark:to-gray-900/35 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
              'opacity-100 transition-opacity duration-200 ease-out motion-reduce:transition-none',
              isOpen ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          >
            <ul className="flex flex-col gap-px">
              {group.items.map((item) => (
                <li key={item.id}>
                  <NavModuleButton
                    item={item}
                    active={item.id === activeId}
                    collapsed={false}
                    onSelect={onSelect}
                    variant="child"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Yüzen [protrude] panel — daraltılmış modda yalnızca ikonlar (md+).
 */
export function Sidebar({
  startItems,
  groups,
  activeId,
  onSelect,
  collapsed,
  onExpandSidebar,
  onDesktopHoverExpandedChange,
}: Props) {
  const { t } = useI18n()
  const [isHoverExpanded, setIsHoverExpanded] = useState(false)
  const isExpanded = !collapsed || isHoverExpanded

  const validSectionIds = useMemo(() => new Set(groups.map((g) => g.id)), [groups])

  const [openSectionId, setOpenSectionId] = useState<string | null>(() => {
    const first = groups[0]?.id ?? null
    const ids = new Set(groups.map((g) => g.id))
    const stored = readStoredSectionId(ids)
    return stored ?? first
  })

  const prevActiveIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    onDesktopHoverExpandedChange?.(isHoverExpanded)
  }, [isHoverExpanded, onDesktopHoverExpandedChange])

  useEffect(() => {
    if (!collapsed) setIsHoverExpanded(false)
  }, [collapsed])

  useEffect(() => {
    if (prevActiveIdRef.current === undefined) {
      prevActiveIdRef.current = activeId
      const gid = navGroupIdForModuleId(activeId, groups)
      if (gid) setOpenSectionId(gid)
      return
    }
    if (prevActiveIdRef.current !== activeId) {
      prevActiveIdRef.current = activeId
      const gid = navGroupIdForModuleId(activeId, groups)
      if (gid) setOpenSectionId(gid)
    }
  }, [activeId, groups])

  useEffect(() => {
    if (openSectionId && !validSectionIds.has(openSectionId)) {
      setOpenSectionId(groups[0]?.id ?? null)
    }
  }, [groups, openSectionId, validSectionIds])

  useEffect(() => {
    if (!openSectionId) return
    try {
      window.localStorage.setItem(SIDEBAR_SECTION_STORAGE_KEY, openSectionId)
    } catch {
      /* ignore */
    }
  }, [openSectionId])

  const toggleSection = useCallback(
    (id: string) => {
      setOpenSectionId((prev) => (prev === id ? null : id))
    },
    [],
  )

  return (
    <aside
      className={[
        'flex min-h-0 shrink-0 flex-col gap-1 rounded-3xl bg-pf-surface shadow-neo-out',
        'transition-[width,min-width,padding,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
        'md:absolute md:left-0 md:top-0 md:z-[60]',
        'w-[min(280px,calc(100vw-1.5rem))]',
        collapsed && !isHoverExpanded
          ? 'p-3 md:w-[4.75rem] md:min-w-[4.75rem] md:overflow-hidden md:px-3 md:pb-3 md:pt-2'
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
      <div className="mb-1 flex min-h-[44px] shrink-0 items-center">
        {isExpanded ? (
          <div className="min-w-0 flex-1">
            <div className="rounded-xl border border-gray-200/80 bg-gray-100/70 px-3 py-2 shadow-neo-in dark:border-gray-700/80 dark:bg-gray-800/60">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                {t('sidebar.brandPrimary')}
              </p>
              <p className="mt-0.5 min-w-0 truncate text-sm font-semibold tabular-nums tracking-tight text-gray-900 dark:text-gray-50">
                {t('sidebar.brandProduct')}
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onExpandSidebar}
            className="flex w-full items-center justify-center rounded-xl py-1 text-gray-700 transition hover:bg-gray-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/70 dark:focus-visible:ring-offset-gray-900"
            aria-label={t('sidebar.expand')}
            title={t('sidebar.expand')}
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-gray-900/5 text-sm font-bold tabular-nums text-gray-900 dark:bg-gray-900/10 dark:text-gray-100">
              PF
            </span>
          </button>
        )}
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto pr-0.5 md:gap-3">
        <div className="shrink-0">
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

        <div
          className={[
            'flex min-h-0 flex-1 flex-col gap-2.5',
            isExpanded ? 'pb-1' : '',
          ].join(' ')}
        >
          {groups.map((group) => (
            <SidebarAccordionSection
              key={group.id}
              group={group}
              isOpen={openSectionId === group.id}
              onToggle={() => toggleSection(group.id)}
              activeId={activeId}
              isExpanded={isExpanded}
              onSelect={onSelect}
            />
          ))}
        </div>
      </nav>
    </aside>
  )
}
