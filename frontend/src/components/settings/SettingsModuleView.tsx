import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import {
  eiSplitHeaderButtonPassive,
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import { SettingsTabPanels } from './SettingsTabPanels'
import { SETTINGS_TAB_DEFS, type SettingsPageState, type SettingsTabId } from './useSettingsPageState'
import type { AppShellOutletContext } from '../../appShellOutletContext'

type Props = SettingsPageState & Pick<AppShellOutletContext, 'onNavigate'>

export function SettingsModuleView(props: Props) {
  const { t } = useI18n()
  const rightRef = useRef<HTMLDivElement | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const { onNavigate, tab, setTab } = props

  const visibleTabDefs = useMemo(() => {
    const q = listSearch.trim().toLocaleLowerCase('tr-TR')
    if (!q) return SETTINGS_TAB_DEFS
    return SETTINGS_TAB_DEFS.filter((d) => {
      const label = t(d.labelKey).toLocaleLowerCase('tr-TR')
      const hint = t(d.hintKey).toLocaleLowerCase('tr-TR')
      return label.includes(q) || hint.includes(q)
    })
  }, [listSearch, t])

  const scrollPanelTop = () => {
    requestAnimationFrame(() => rightRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const pickTab = (id: SettingsTabId) => {
    setTab(id)
    scrollPanelTop()
  }

  return (
    <ElementIdentityPieceCodesLikeSplit
      persistKey="settings-page"
      listTitle={t('settingsModule.listTitle')}
      filterToolbarSearch={
        <FilterToolbarSearch
          id="settings-module-list-search"
          value={listSearch}
          onValueChange={setListSearch}
          placeholder={t('settingsModule.listSearchPh')}
          ariaLabel={t('settingsModule.listSearchAria')}
        />
      }
      headerActions={
        <>
          <button type="button" onClick={() => onNavigate('profile')} className={eiSplitHeaderButtonPassive}>
            {t('settings.gotoProfile')}
          </button>
          <Link to="/settings?legacy=1" className={`${eiSplitHeaderButtonPassive} no-underline`}>
            {t('settingsModule.legacyLink')}
          </Link>
        </>
      }
      isFilterOpen={filterOpen}
      onFilterOpenChange={setFilterOpen}
      filterAside={
        <div>
          <ElementIdentityFilterSheetHeader
            title={t('settingsModule.filtersTitle')}
            subtitle={t('settingsModule.filtersSubtitle')}
            onClose={() => setFilterOpen(false)}
          />
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{t('settingsModule.filterBody')}</p>
          <label className="mt-3 block">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t('settingsModule.listSearchLabel')}</span>
            <input
              type="search"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder={t('settingsModule.listSearchPh')}
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
        </div>
      }
      listBody={
        <>
          {visibleTabDefs.map((tabDef) => {
            const active = tab === tabDef.id
            return (
              <li key={tabDef.id}>
                <button
                  type="button"
                  onClick={() => pickTab(tabDef.id)}
                  className={`flex w-full flex-col gap-0.5 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                    active
                      ? 'border-sky-400/60 bg-sky-500/10 dark:border-sky-500/40 dark:bg-sky-500/15'
                      : 'border-slate-200/50 bg-white/40 hover:bg-white/70 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <span className="font-semibold text-slate-900 dark:text-slate-50">{t(tabDef.labelKey)}</span>
                  <span className="text-[10px] leading-snug text-slate-500 dark:text-slate-400">{t(tabDef.hintKey)}</span>
                </button>
              </li>
            )
          })}
        </>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-600 dark:text-slate-300">
          <p>{t('settingsModule.footerHint')}</p>
        </div>
      }
      rightPanelRef={rightRef}
      rightAside={
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <p className="mb-2 shrink-0 px-0.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 sm:px-1">
            {t('settingsModule.intro')}
          </p>
          <div className="min-h-0 flex-1">
            <SettingsTabPanels appearance="module" stickyFooter {...props} />
          </div>
        </div>
      }
    />
  )
}
