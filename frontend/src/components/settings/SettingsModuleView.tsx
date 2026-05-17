import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronsLeftRight, Filter, GripVertical, X } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useThemeMode } from '../../theme/ThemeProvider'
import type { AppShellOutletContext } from '../../appShellOutletContext'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import { SettingsTabPanels } from './SettingsTabPanels'
import { SETTINGS_TAB_DEFS, type SettingsPageState, type SettingsTabId } from './useSettingsPageState'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'
import { eiSplitFilterToggleClass, eiSplitHeaderButtonPassive } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'

const SETTINGS_SPLIT_STATE_KEY = 'settings-page:split-state'
const SETTINGS_DEFAULT_SPLIT_RATIO = 40

type Props = SettingsPageState & Pick<AppShellOutletContext, 'onNavigate'>

export function SettingsModuleView(props: Props) {
  const { t } = useI18n()
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const splitRef = useRef<HTMLDivElement | null>(null)
  const rightPanelRef = useRef<HTMLElement | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const [splitRatio, setSplitRatio] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SETTINGS_SPLIT_STATE_KEY)
      if (!raw) return SETTINGS_DEFAULT_SPLIT_RATIO
      const parsed = JSON.parse(raw) as { splitRatio?: number }
      return typeof parsed.splitRatio === 'number'
        ? Math.min(55, Math.max(30, parsed.splitRatio))
        : SETTINGS_DEFAULT_SPLIT_RATIO
    } catch {
      return SETTINGS_DEFAULT_SPLIT_RATIO
    }
  })
  const [isResizing, setIsResizing] = useState(false)
  const [isResizerHover, setIsResizerHover] = useState(false)

  const { onNavigate, tab, setTab } = props

  const headerBtnCls = `${eiSplitHeaderButtonPassive} inline-flex items-center gap-1.5`

  const filterBtnCls = eiSplitFilterToggleClass(filterOpen)

  const visibleTabDefs = useMemo(() => {
    const q = listSearch.trim().toLocaleLowerCase('tr-TR')
    if (!q) return SETTINGS_TAB_DEFS
    return SETTINGS_TAB_DEFS.filter((d) => {
      const label = t(d.labelKey).toLocaleLowerCase('tr-TR')
      const hint = t(d.hintKey).toLocaleLowerCase('tr-TR')
      return label.includes(q) || hint.includes(q)
    })
  }, [listSearch, t])

  const activeTabDef = useMemo(() => SETTINGS_TAB_DEFS.find((d) => d.id === tab), [tab])

  const scrollPanelTop = () => {
    requestAnimationFrame(() => rightPanelRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const pickTab = (id: SettingsTabId) => {
    setTab(id)
    scrollPanelTop()
  }

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
      sessionStorage.setItem(SETTINGS_SPLIT_STATE_KEY, JSON.stringify({ splitRatio }))
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
                gl ? 'glass-card glass-card--static project-mgmt-split-panel min-h-0' : 'p-3',
              ].join(' ')}
              style={{ width: `calc(${splitRatio}% - 5px)` }}
            >
              <div className="mb-2 flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
                <h2 className="min-w-0 shrink-0 text-sm font-semibold text-black dark:text-white sm:text-base">
                  {t('settingsModule.listTitle')}
                </h2>
                <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                  <FilterToolbarSearch
                    id="settings-module-list-search"
                    value={listSearch}
                    onValueChange={setListSearch}
                    placeholder={t('settingsModule.listSearchPh')}
                    ariaLabel={t('settingsModule.listSearchAria')}
                    className={gl ? 'project-mgmt-toolbar-search' : ''}
                    inputClassName={gl ? 'glass-input' : ''}
                  />
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button type="button" onClick={() => onNavigate('profile')} className={headerBtnCls}>
                      {t('settings.gotoProfile')}
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
                        {t('settingsModule.filtersTitle')}
                      </h4>
                      <p className="mt-1 text-[11px] text-black/60 dark:text-white/65">
                        {t('settingsModule.filtersSubtitle')}
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
                    {t('settingsModule.filterBody')}
                  </p>
                  <label className="mt-3 block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-black/75 dark:text-white/80">
                      {t('settingsModule.listSearchLabel')}
                    </span>
                    <input
                      type="search"
                      value={listSearch}
                      onChange={(e) => setListSearch(e.target.value)}
                      placeholder={t('settingsModule.listSearchPh')}
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
                  aria-label={t('settingsModule.listTitle')}
                >
                  {visibleTabDefs.map((tabDef) => {
                    const active = tab === tabDef.id
                    return (
                      <li
                        key={tabDef.id}
                        className={[
                          gl
                            ? 'glass-card glass-card--static project-mgmt-list-row-card flex min-h-0 shrink-0 items-stretch gap-1.5'
                            : 'flex min-h-0 shrink-0 items-stretch gap-1.5 rounded-lg border border-black/15 bg-white/70 px-2 py-1.5 dark:border-white/12 dark:bg-black/45',
                          active ? 'okan-project-list-row--active' : '',
                        ].join(' ')}
                      >
                        <button
                          type="button"
                          onClick={() => pickTab(tabDef.id)}
                          aria-current={active ? 'true' : undefined}
                          className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-md px-0.5 py-0.5 text-left transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:hover:bg-white/8"
                        >
                          <span className="truncate text-sm font-semibold leading-snug text-black dark:text-white">
                            {t(tabDef.labelKey)}
                          </span>
                          <span className="truncate text-[11px] leading-snug text-black/65 dark:text-white/70">
                            {t(tabDef.hintKey)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {gl ? (
                <div className="glass-card glass-card--static project-mgmt-footer-panel mt-2 shrink-0 text-xs">
                  <p className="text-black dark:text-white/80">{t('settingsModule.footerHint')}</p>
                </div>
              ) : (
                <div className="mt-1 shrink-0 border-t border-black/15 pt-2 text-xs text-black/75 dark:border-white/12 dark:text-white/80">
                  <p>{t('settingsModule.footerHint')}</p>
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
                  setSplitRatio(SETTINGS_DEFAULT_SPLIT_RATIO)
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
                      {t('settingsModule.listTitle')}
                    </p>
                    <h3 className="mt-1.5 text-xl font-semibold leading-tight text-black dark:text-white">
                      {activeTabDef ? t(activeTabDef.labelKey) : ''}
                    </h3>
                    {activeTabDef ? (
                      <p className="mt-1 text-sm leading-snug text-black/75 dark:text-white/80">
                        {t(activeTabDef.hintKey)}
                      </p>
                    ) : null}
                  </header>

                  <p className="shrink-0 px-0.5 text-center text-[11px] leading-relaxed text-black/70 dark:text-white/70 sm:px-1">
                    {t('settingsModule.intro')}
                  </p>

                  <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <SettingsTabPanels stickyFooter {...props} />
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
