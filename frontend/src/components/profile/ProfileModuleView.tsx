import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Briefcase,
  ChevronsLeftRight,
  Factory,
  Filter,
  GripVertical,
  LayoutGrid,
  Lock,
  Mail,
  Shield,
  UserCircle,
  X,
} from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useThemeMode } from '../../theme/ThemeProvider'
import type { AppShellOutletContext } from '../../appShellOutletContext'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import {
  eiSplitFilterToggleClass,
  eiSplitHeaderButtonPassive,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'
import type { ProfilePageState, ProfileSectionId } from './useProfilePageState'

const SECTIONS: { id: ProfileSectionId; labelKey: string; icon: typeof UserCircle }[] = [
  { id: 'overview', labelKey: 'profileModule.secOverview', icon: LayoutGrid },
  { id: 'factories', labelKey: 'profileModule.secFactories', icon: Factory },
  { id: 'personal', labelKey: 'profileModule.secPersonal', icon: UserCircle },
  { id: 'work', labelKey: 'profileModule.secWork', icon: Briefcase },
  { id: 'security', labelKey: 'profileModule.secSecurity', icon: Lock },
]

const PROFILE_SPLIT_STATE_KEY = 'profile-page:split-state'
const PROFILE_DEFAULT_SPLIT_RATIO = 40

function initials(first: string, last: string) {
  const a = first.trim().charAt(0)
  const b = last.trim().charAt(0)
  const s = (a + b).toUpperCase()
  return s || '—'
}

type Props = ProfilePageState & Pick<AppShellOutletContext, 'onNavigate'>

export function ProfileModuleView(props: Props) {
  const { t } = useI18n()
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const splitRef = useRef<HTMLDivElement | null>(null)
  const rightPanelRef = useRef<HTMLElement | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const [splitRatio, setSplitRatio] = useState(() => {
    try {
      const raw = sessionStorage.getItem(PROFILE_SPLIT_STATE_KEY)
      if (!raw) return PROFILE_DEFAULT_SPLIT_RATIO
      const parsed = JSON.parse(raw) as { splitRatio?: number }
      return typeof parsed.splitRatio === 'number'
        ? Math.min(55, Math.max(30, parsed.splitRatio))
        : PROFILE_DEFAULT_SPLIT_RATIO
    } catch {
      return PROFILE_DEFAULT_SPLIT_RATIO
    }
  })
  const [isResizing, setIsResizing] = useState(false)
  const [isResizerHover, setIsResizerHover] = useState(false)

  const {
    onNavigate,
    section,
    setSection,
    profileFactories,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    title,
    setTitle,
    department,
    setDepartment,
  } = props

  const inputCls = gl
    ? 'glass-input mt-1 w-full'
    : 'mt-1 w-full rounded-lg border border-black/22 bg-white px-3 py-2 text-sm text-black dark:border-white/15 dark:bg-black/80 dark:text-white'

  const headerBtnCls = `${eiSplitHeaderButtonPassive} inline-flex items-center gap-1.5`

  const filterBtnCls = eiSplitFilterToggleClass(filterOpen)

  const scrollPanelTop = () => {
    requestAnimationFrame(() => rightPanelRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const pickSection = (id: ProfileSectionId) => {
    setSection(id)
    scrollPanelTop()
  }

  const visibleSections = useMemo(() => {
    const q = listSearch.trim().toLocaleLowerCase('tr-TR')
    if (!q) return SECTIONS
    return SECTIONS.filter((s) => t(s.labelKey).toLocaleLowerCase('tr-TR').includes(q))
  }, [listSearch, t])

  const activeSectionLabel = useMemo(() => {
    const found = SECTIONS.find((s) => s.id === section)
    return found ? t(found.labelKey) : ''
  }, [section, t])

  useEffect(() => {
    if (!isResizing) return
    let rafId = 0
    const onMouseMove = (event: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const host = splitRef.current
        if (!host) return
        const rect = host.getBoundingClientRect()
        if (rect.width <= 0) return
        const next = ((event.clientX - rect.left) / rect.width) * 100
        setSplitRatio(Math.min(55, Math.max(30, Number(next.toFixed(2)))))
      })
    }
    const onMouseUp = () => {
      cancelAnimationFrame(rafId)
      setIsResizing(false)
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      cancelAnimationFrame(rafId)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isResizing])

  useEffect(() => {
    if (!filterOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFilterOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [filterOpen])

  useEffect(() => {
    if (isResizing) return
    try {
      sessionStorage.setItem(PROFILE_SPLIT_STATE_KEY, JSON.stringify({ splitRatio }))
    } catch {
      /* ignore */
    }
  }, [isResizing, splitRatio])

  return (
    <div className="project-mgmt-glass-light flex min-h-0 flex-1 flex-col gap-1 overflow-hidden rounded-3xl">
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] gap-1">
        <div
          className={[
            'min-h-0 overflow-hidden',
            gl
              ? 'flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-3xl bg-transparent p-1 md:p-1.5'
              : 'rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5',
          ].join(' ')}
        >
          <div
            ref={splitRef}
            data-split-dragging={isResizing ? 'true' : undefined}
            className={[
              'relative flex h-full min-h-0 min-w-0 overflow-hidden',
              gl ? 'gap-3 rounded-3xl lg:gap-4' : 'gap-0',
            ].join(' ')}
          >
            <section
              className={[
                'okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden',
                gl
                  ? 'glass-card glass-card--static project-mgmt-split-panel min-h-0'
                  : 'p-3',
              ].join(' ')}
              style={{ width: `calc(${splitRatio}% - 5px)` }}
            >
              <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
                <h2 className="min-w-0 shrink-0 text-sm font-semibold text-black dark:text-white sm:text-base">
                  {t('profileModule.listTitle')}
                </h2>
                <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                  <FilterToolbarSearch
                    id="profile-module-list-search"
                    value={listSearch}
                    onValueChange={setListSearch}
                    placeholder={t('profileModule.listSearchPh')}
                    ariaLabel={t('profileModule.listSearchAria')}
                    className={gl ? 'project-mgmt-toolbar-search' : ''}
                    inputClassName={gl ? 'glass-input' : ''}
                  />
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('settings')}
                      className={headerBtnCls}
                    >
                      {t('profile.gotoSettings')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterOpen((v) => !v)}
                      aria-expanded={filterOpen}
                      className={filterBtnCls}
                    >
                      <Filter className="size-3.5 shrink-0" aria-hidden />
                      Filtrele
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative min-h-0 flex-1 overflow-hidden">
                <aside
                  className={[
                    'absolute inset-y-0 left-0 z-20 w-72 overflow-y-auto shadow-xl backdrop-blur-sm transition-transform duration-150 ease-out',
                    gl
                      ? 'glass-card glass-card--static project-mgmt-split-panel project-mgmt-filter-drawer'
                      : 'rounded-xl border border-black/15 bg-white/95 p-3 dark:border-white/12 dark:bg-black/70',
                    filterOpen ? 'translate-x-0' : '-translate-x-[105%]',
                  ].join(' ')}
                  aria-hidden={!filterOpen}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-black dark:text-white">
                        {t('profileModule.filtersTitle')}
                      </h4>
                      <p className="mt-1 text-[11px] text-black/60 dark:text-white/65">
                        {t('profileModule.filtersSubtitle')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFilterOpen(false)}
                      className={
                        gl
                          ? 'card-button inline-flex size-7 items-center justify-center p-0'
                          : 'inline-flex size-7 items-center justify-center rounded-lg border border-black/20 text-black/80 hover:bg-black/5 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/10'
                      }
                      aria-label="Filtreyi kapat"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-black/70 dark:text-white/75">
                    {t('profileModule.filterBody')}
                  </p>
                  <label className="mt-3 block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">
                      {t('profileModule.listSearchLabel')}
                    </span>
                    <input
                      type="search"
                      value={listSearch}
                      onChange={(e) => setListSearch(e.target.value)}
                      placeholder={t('profileModule.listSearchPh')}
                      autoComplete="off"
                      className={
                        gl
                          ? 'glass-input mt-2 w-full'
                          : 'mt-2 w-full rounded-lg border border-black/22 bg-white px-3 py-2 text-xs text-black dark:border-white/15 dark:bg-black/80 dark:text-white'
                      }
                    />
                  </label>
                </aside>

                <ul
                  className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto pr-1 transition-[padding] duration-100 ease-out"
                  style={{ paddingLeft: filterOpen ? '18.5rem' : '0' }}
                  role="list"
                  aria-label={t('profileModule.listTitle')}
                >
                  {visibleSections.map((s) => {
                    const Icon = s.icon
                    const active = section === s.id
                    return (
                      <li
                        key={s.id}
                        className={[
                          gl
                            ? 'glass-card glass-card--static project-mgmt-list-row-card flex min-h-0 shrink-0 items-stretch gap-1.5'
                            : 'flex min-h-0 shrink-0 items-stretch gap-1.5 rounded-lg border border-black/15 bg-white/70 px-2 py-1.5 dark:border-white/12 dark:bg-black/45',
                          active ? 'okan-project-list-row--active' : '',
                        ].join(' ')}
                      >
                        <button
                          type="button"
                          onClick={() => pickSection(s.id)}
                          aria-current={active ? 'true' : undefined}
                          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-0.5 py-0.5 text-left transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:hover:bg-white/8"
                        >
                          <Icon className="size-4 shrink-0 text-black/70 dark:text-white/75" aria-hidden />
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-snug text-black dark:text-white">
                            {t(s.labelKey)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {gl ? (
                <div className="glass-card glass-card--static project-mgmt-footer-panel mt-2 shrink-0 text-xs">
                  <p className="text-black dark:text-white/80">{t('profileModule.footerSections')}</p>
                </div>
              ) : (
                <div className="mt-1 shrink-0 border-t border-black/15 pt-2 text-xs text-black/75 dark:border-white/12 dark:text-white/80">
                  <p>{t('profileModule.footerSections')}</p>
                </div>
              )}
            </section>

            <div className="relative z-10 mx-1 hidden w-2 shrink-0 cursor-col-resize lg:flex">
              <button
                type="button"
                aria-label="Paneller arası genişliği ayarla"
                title="Çift tıklayarak varsayılan sütun genişliğine dön"
                onMouseDown={() => setIsResizing(true)}
                onDoubleClick={(e) => {
                  e.preventDefault()
                  setIsResizing(false)
                  setSplitRatio(PROFILE_DEFAULT_SPLIT_RATIO)
                }}
                onMouseEnter={() => setIsResizerHover(true)}
                onMouseLeave={() => setIsResizerHover(false)}
                className={[
                  'group absolute inset-y-3 left-1/2 -translate-x-1/2 rounded-full border transition',
                  isResizing || isResizerHover
                    ? 'w-6 border-black/35 bg-black/12 dark:border-white/18 dark:bg-black/60'
                    : 'w-3 border-black/18 bg-white/70 dark:border-white/12 dark:bg-black/55',
                ].join(' ')}
              >
                <span className="pointer-events-none flex h-full items-center justify-center text-black/55 dark:text-white/70">
                  {isResizing || isResizerHover ? (
                    <ChevronsLeftRight className="size-3.5" />
                  ) : (
                    <GripVertical className="size-3.5" />
                  )}
                </span>
              </button>
            </div>

            <aside
              ref={rightPanelRef}
              className={
                gl
                  ? 'okan-project-split-aside glass-card glass-card--static project-mgmt-split-panel flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
                  : 'okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2'
              }
            >
              <div className="okan-project-detail-column flex h-full min-h-0 min-w-0 flex-1 flex-col">
                <div className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 overflow-hidden lg:max-w-3xl">
                  <header className="shrink-0 border-b border-black/12 pb-3 text-center dark:border-white/10">
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                      {t('profileModule.listTitle')}
                    </p>
                    <h3 className="mt-1.5 text-xl font-semibold leading-tight text-black dark:text-white">
                      {firstName} {lastName}
                    </h3>
                    <p className="mt-1 text-sm leading-snug text-black/75 dark:text-white/80">{activeSectionLabel}</p>
                  </header>

                  <p className="shrink-0 px-0.5 text-center text-[11px] leading-relaxed text-black/70 dark:text-white/70 sm:px-1">
                    {t('profileModule.intro')}
                  </p>

                  <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <div
                      role="tabpanel"
                      className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-0.5 text-center sm:px-1"
                    >
                    {section === 'overview' ? (
                      <div className="flex flex-col divide-y divide-black/12 dark:divide-white/10">
                        <div className="flex flex-col items-center pb-4 pt-0">
                          <div className="flex size-20 items-center justify-center rounded-full border border-black/18 bg-white/70 text-xl font-bold text-black shadow-inner dark:border-white/15 dark:bg-black/55 dark:text-white">
                            {initials(firstName, lastName)}
                          </div>
                          <p className="mt-3 text-center text-base font-semibold text-black dark:text-white">
                            {firstName} {lastName}
                          </p>
                          <p className="mt-1 text-center text-sm text-black/75 dark:text-white/80">{title}</p>
                          <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-wide text-black/60 dark:text-white/65">
                            {department}
                          </p>
                          <div className="mt-4 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full border border-black/15 bg-white/70 px-3 py-2 text-xs text-black/80 dark:border-white/12 dark:bg-black/45 dark:text-white/85">
                            <Mail className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                            <span className="truncate">{email}</span>
                          </div>
                        </div>

                        <div className="flex justify-center pt-4">
                          <div className="flex max-w-md items-start gap-2 text-left text-sm leading-relaxed text-black/85 dark:text-white/85">
                            <Shield className="mt-0.5 size-4 shrink-0 text-black/65 dark:text-white/70" strokeWidth={2} />
                            <p>{t('profile.roleNote')}</p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {section === 'factories' ? (
                      <div className="flex flex-col">
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                          {t('profile.factoriesTitle')}
                        </p>
                        <p className="mx-auto mt-2 max-w-lg text-sm text-black/75 dark:text-white/80">
                          {t('profile.factoriesDesc')}
                        </p>
                        <ul className="mx-auto mt-4 max-w-lg divide-y divide-black/12 text-left dark:divide-white/10">
                          {profileFactories.map((f) => (
                            <li
                              key={f.code}
                              className="flex items-center justify-between gap-3 py-2.5 text-sm text-black first:pt-0 dark:text-white"
                            >
                              <span className="min-w-0 flex-1 truncate">
                                <span className="font-mono text-xs text-black/60 dark:text-white/65">{f.code}</span> {f.name}
                              </span>
                              <span className="shrink-0 text-xs font-medium text-black/60 dark:text-white/65">{f.city}</span>
                            </li>
                          ))}
                          <li
                            className="flex items-center justify-between gap-3 py-2.5 text-sm text-black/65 dark:text-white/70"
                            title={t('profile.restrictedTitle')}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <Lock className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                              <span className="truncate">
                                <span className="font-mono text-xs">ANK-01</span> Ankara Fabrika
                              </span>
                            </span>
                            <span className="shrink-0 text-[11px] font-medium">{t('profile.restrictedBadge')}</span>
                          </li>
                        </ul>
                        <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-black/65 dark:text-white/70">
                          {t('profile.restrictedNote')}
                        </p>
                      </div>
                    ) : null}

                    {section === 'personal' ? (
                      <div className="flex flex-col">
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                          {t('profile.personalTitle')}
                        </p>
                        <p className="mx-auto mt-2 max-w-lg text-sm text-black/75 dark:text-white/80">
                          {t('profile.personalDesc')}
                        </p>
                        <div className="mx-auto mt-4 grid max-w-lg gap-3 text-left sm:grid-cols-2">
                          <label className="block">
                            <span className="text-[11px] font-medium text-black/75 dark:text-white/80">
                              {t('profile.firstName')}
                            </span>
                            <input
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className={inputCls}
                              autoComplete="given-name"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[11px] font-medium text-black/75 dark:text-white/80">
                              {t('profile.lastName')}
                            </span>
                            <input
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className={inputCls}
                              autoComplete="family-name"
                            />
                          </label>
                          <label className="block sm:col-span-2">
                            <span className="text-[11px] font-medium text-black/75 dark:text-white/80">{t('auth.email')}</span>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className={inputCls}
                              autoComplete="email"
                            />
                          </label>
                          <label className="block sm:col-span-2">
                            <span className="text-[11px] font-medium text-black/75 dark:text-white/80">{t('profile.phone')}</span>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className={inputCls}
                              autoComplete="tel"
                            />
                          </label>
                        </div>
                      </div>
                    ) : null}

                    {section === 'work' ? (
                      <div className="flex flex-col">
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                          {t('profile.workTitle')}
                        </p>
                        <p className="mx-auto mt-2 max-w-lg text-sm text-black/75 dark:text-white/80">
                          {t('profile.workDesc')}
                        </p>
                        <div className="mx-auto mt-4 grid max-w-lg gap-3 text-left">
                          <label className="block">
                            <span className="text-[11px] font-medium text-black/75 dark:text-white/80">{t('profile.jobTitle')}</span>
                            <input
                              type="text"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className={inputCls}
                            />
                          </label>
                          <label className="block">
                            <span className="text-[11px] font-medium text-black/75 dark:text-white/80">
                              {t('profile.department')}
                            </span>
                            <input
                              type="text"
                              value={department}
                              onChange={(e) => setDepartment(e.target.value)}
                              className={inputCls}
                            />
                          </label>
                        </div>
                      </div>
                    ) : null}

                    {section === 'security' ? (
                      <div className="flex flex-col">
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                          {t('profile.securityTitle')}
                        </p>
                        <p className="mx-auto mt-2 max-w-lg text-sm text-black/75 dark:text-white/80">
                          {t('profile.securityDesc')}
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            className={
                              gl
                                ? 'glass-btn small secondary'
                                : 'rounded-lg border border-black/22 bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-black/5 dark:border-white/15 dark:bg-black/80 dark:text-white dark:hover:bg-white/10'
                            }
                          >
                            {t('profile.changePassword')}
                          </button>
                          <button
                            type="button"
                            className={
                              gl
                                ? 'glass-btn small secondary'
                                : 'rounded-lg border border-black/22 bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-black/5 dark:border-white/15 dark:bg-black/80 dark:text-white dark:hover:bg-white/10'
                            }
                          >
                            {t('profile.manageSessions')}
                          </button>
                        </div>
                      </div>
                    ) : null}
                    </div>

                  <div className="mt-auto flex shrink-0 flex-wrap justify-end gap-2 border-t border-black/12 pt-3 dark:border-white/10">
                    <button
                      type="button"
                      className={
                        gl
                          ? 'glass-btn small secondary'
                          : 'rounded-lg border border-black/22 px-3 py-2 text-xs font-semibold text-black dark:border-white/15 dark:text-white'
                      }
                    >
                      {t('profile.cancel')}
                    </button>
                    <button
                      type="button"
                      className={
                        gl
                          ? 'glass-btn small primary'
                          : `${eiSplitHeaderButtonPassive} px-3 py-2 text-xs`
                      }
                    >
                      {t('profile.save')}
                    </button>
                  </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
