import { useI18n } from '../../i18n/I18nProvider'
import { SettingsTabPanels } from './SettingsTabPanels'
import { SETTINGS_TAB_DEFS, type SettingsPageState } from './useSettingsPageState'

/** Eski neo yan menü + içerik — karşılaştırma için `?legacy=1`. */
export function SettingsPageLegacy(props: SettingsPageState) {
  const { t } = useI18n()
  const { tab, setTab } = props

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <nav
        className="flex shrink-0 flex-col gap-1 rounded-2xl bg-gray-50 p-2 shadow-neo-in dark:bg-gray-950/70 lg:w-56"
        aria-label={t('settings.navAria')}
      >
        {SETTINGS_TAB_DEFS.map((tabDef) => {
          const active = tab === tabDef.id
          return (
            <button
              key={tabDef.id}
              type="button"
              onClick={() => setTab(tabDef.id)}
              className={[
                'rounded-xl px-3 py-2.5 text-left transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900',
                active
                  ? 'bg-gray-100 font-medium text-gray-900 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-50'
                  : 'text-gray-700 hover:bg-gray-100/80 dark:text-gray-200 dark:hover:bg-gray-900/80',
              ].join(' ')}
            >
              <span className="block text-sm">{t(tabDef.labelKey)}</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{t(tabDef.hintKey)}</span>
            </button>
          )
        })}
      </nav>

      <SettingsTabPanels appearance="legacy" stickyFooter={false} {...props} />
    </div>
  )
}
