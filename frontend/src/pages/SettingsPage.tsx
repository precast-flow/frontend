import { useEffect, useId, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import type { AppShellOutletContext } from '../appShellOutletContext'
import { useFactoryContext } from '../context/FactoryContext'
import { ModuleShellFrame } from '../components/ModuleShellFrame'
import { SettingsFactoriesPanel } from '../components/settings/SettingsFactoriesPanel'
import { NeoSwitch } from '../components/NeoSwitch'
import { e2eScenarioSteps } from '../data/e2eScenarioMock'
import { initialNcrCatalog, type NcrCatalogRow } from '../data/ncrCatalogMock'
import {
  LS_MODULE_SIM_STATE,
  LS_SHOW_MODULE_SIM,
  moduleSimOptions,
} from '../data/futureLicenseMock'
import { DEFAULT_FACTORY_CODE } from '../data/mockFactories'
import { useI18n, type Locale } from '../i18n/I18nProvider'

type TabId = 'general' | 'factories' | 'notifications' | 'locale' | 'dictionaries' | 'future' | 'scenario'

const SETTINGS_TAB_DEFS: { id: TabId; labelKey: string; hintKey: string }[] = [
  { id: 'general', labelKey: 'settings.tab.general', hintKey: 'settings.tab.generalHint' },
  { id: 'factories', labelKey: 'settings.tab.factories', hintKey: 'settings.tab.factoriesHint' },
  { id: 'notifications', labelKey: 'settings.tab.notifications', hintKey: 'settings.tab.notificationsHint' },
  { id: 'locale', labelKey: 'settings.tab.locale', hintKey: 'settings.tab.localeHint' },
  { id: 'dictionaries', labelKey: 'settings.tab.dictionaries', hintKey: 'settings.tab.dictionariesHint' },
  { id: 'future', labelKey: 'settings.tab.future', hintKey: 'settings.tab.futureHint' },
  { id: 'scenario', labelKey: 'settings.tab.scenario', hintKey: 'settings.tab.scenarioHint' },
]

const selectClass =
  'mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-4 py-3 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

export function SettingsPage() {
  const { locale, setLocale, t } = useI18n()
  const baseId = useId()
  const navigate = useNavigate()
  const { onNavigate } = useOutletContext<AppShellOutletContext>()
  const { setSelectedCode } = useFactoryContext()
  const [tab, setTab] = useState<TabId>('general')

  const [compactTables, setCompactTables] = useState(false)
  const [openLinksNewTab, setOpenLinksNewTab] = useState(true)
  const [emailDigest, setEmailDigest] = useState(true)
  const [pushMes, setPushMes] = useState(true)
  const [pushDispatch, setPushDispatch] = useState(false)
  const [ncrRows] = useState<NcrCatalogRow[]>(() => initialNcrCatalog.map((r) => ({ ...r })))

  const [showModuleSim, setShowModuleSim] = useState(() => {
    try {
      return localStorage.getItem(LS_SHOW_MODULE_SIM) === '1'
    } catch {
      return false
    }
  })
  const [moduleSimState, setModuleSimState] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(LS_MODULE_SIM_STATE)
      if (!raw) {
        return Object.fromEntries(moduleSimOptions.map((m) => [m.id, true])) as Record<string, boolean>
      }
      return { ...JSON.parse(raw) } as Record<string, boolean>
    } catch {
      return Object.fromEntries(moduleSimOptions.map((m) => [m.id, true])) as Record<string, boolean>
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(LS_SHOW_MODULE_SIM, showModuleSim ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [showModuleSim])

  useEffect(() => {
    try {
      localStorage.setItem(LS_MODULE_SIM_STATE, JSON.stringify(moduleSimState))
    } catch {
      /* ignore */
    }
  }, [moduleSimState])

  const toggleModuleSim = (id: string, checked: boolean) => {
    setModuleSimState((prev) => ({ ...prev, [id]: checked }))
  }

  return (
    <ModuleShellFrame
      title={t('settings.pageTitle')}
      actions={
        <>
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900"
          >
            {t('settings.gotoProfile')}
          </button>
        </>
      }
    >
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

        <div className="min-w-0 flex-1 space-y-5">
          {tab === 'factories' ? <SettingsFactoriesPanel /> : null}

          {tab === 'general' ? (
            <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('settings.generalTitle')}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('settings.generalDesc')}</p>
              <div className="mt-4 rounded-xl border border-gray-200/90 bg-gray-100/80 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{t('settings.firmAdminTeaserTitle')}</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t('settings.firmAdminTeaserDesc')}</p>
                <button
                  type="button"
                  onClick={() => navigate('/firma-ayarlari')}
                  className="mt-3 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
                >
                  {t('settings.gotoFirmAdmin')}
                </button>
              </div>
              <div className="mt-5 space-y-4 border-t border-gray-200/80 pt-4 dark:border-gray-700/80">
                <NeoSwitch
                  id={`${baseId}-compact`}
                  label={t('settings.compactRows')}
                  checked={compactTables}
                  onChange={setCompactTables}
                />
                <NeoSwitch
                  id={`${baseId}-links`}
                  label={t('settings.linksNewTab')}
                  checked={openLinksNewTab}
                  onChange={setOpenLinksNewTab}
                />
              </div>
            </section>
          ) : null}

          {tab === 'notifications' ? (
            <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('settings.notifTitle')}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('settings.notifDesc')}</p>
              <div className="mt-5 space-y-4 border-t border-gray-200/80 pt-4 dark:border-gray-700/80">
                <NeoSwitch
                  id={`${baseId}-digest`}
                  label={t('settings.digestEmail')}
                  checked={emailDigest}
                  onChange={setEmailDigest}
                />
                <NeoSwitch
                  id={`${baseId}-mes`}
                  label={t('settings.pushMes')}
                  checked={pushMes}
                  onChange={setPushMes}
                />
                <NeoSwitch
                  id={`${baseId}-dispatch`}
                  label={t('settings.pushDispatch')}
                  checked={pushDispatch}
                  onChange={setPushDispatch}
                />
              </div>
            </section>
          ) : null}

          {tab === 'locale' ? (
            <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('settings.localeTitle')}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('settings.localeDesc')}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    {t('settings.interfaceLanguage')}
                  </span>
                  <select
                    id={`${baseId}-lang`}
                    className={selectClass}
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as Locale)}
                  >
                    <option value="tr">{t('settings.lang.tr')}</option>
                    <option value="en">{t('settings.lang.en')}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    {t('settings.timezone')}
                  </span>
                  <select id={`${baseId}-tz`} className={selectClass} defaultValue="europe-istanbul">
                    <option value="europe-istanbul">Europe/Istanbul (UTC+3)</option>
                    <option value="utc">UTC</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    {t('settings.dateFormat')}
                  </span>
                  <select id={`${baseId}-date`} className={selectClass} defaultValue="dmy">
                    <option value="dmy">GG.AA.YYYY</option>
                    <option value="mdy">AA/GG/YYYY</option>
                    <option value="iso">YYYY-AA-GG</option>
                  </select>
                </label>
              </div>
            </section>
          ) : null}

          {tab === 'dictionaries' ? (
            <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('settings.dictTitle')}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('settings.dictDesc')}</p>
              <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200/80 dark:border-gray-700/80">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200/90 bg-gray-100/80 text-left text-xs font-semibold text-gray-600 dark:border-gray-700/90 dark:bg-gray-900/80 dark:text-gray-300">
                      <th className="px-3 py-2">{t('settings.table.code')}</th>
                      <th className="px-3 py-2">{t('settings.table.label')}</th>
                      <th className="px-3 py-2">{t('settings.table.severity')}</th>
                      <th className="px-3 py-2">{t('settings.table.active')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ncrRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-200/70 dark:border-gray-700/70 odd:bg-white/50 even:bg-gray-50/50 dark:odd:bg-gray-950/40 dark:even:bg-gray-900/40"
                      >
                        <td className="px-3 py-2 font-mono text-xs font-semibold">{row.code}</td>
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{row.label}</td>
                        <td className="px-3 py-2 text-xs capitalize text-gray-600 dark:text-gray-300">{row.severity}</td>
                        <td className="px-3 py-2 text-xs">
                          {row.active ? t('settings.yes') : t('settings.no')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {tab === 'future' ? (
            <div className="space-y-5">
              <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('settings.futureTitle')}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {t('settings.futureBody')}
                </p>
              </section>

              <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-in dark:bg-gray-950/80">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  {t('settings.futureSimTitle')}
                </h3>
                <NeoSwitch
                  id={`${baseId}-mod-sim`}
                  label={t('settings.futureSimSwitch')}
                  checked={showModuleSim}
                  onChange={setShowModuleSim}
                />
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{t('settings.futureSimNote')}</p>
                {showModuleSim ? (
                  <fieldset className="mt-4 rounded-xl border border-gray-200/80 bg-gray-100/50 p-4 dark:border-gray-700/80 dark:bg-gray-900/50">
                    <legend className="px-1 text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {t('settings.futureSimLegend')}
                    </legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {moduleSimOptions.map((m) => (
                        <label
                          key={m.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-950/60"
                        >
                          <input
                            type="checkbox"
                            className="size-4 rounded border-gray-400"
                            checked={moduleSimState[m.id] ?? false}
                            onChange={(e) => toggleModuleSim(m.id, e.target.checked)}
                          />
                          <span className="font-medium text-gray-900 dark:text-gray-50">{t(m.labelKey)}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : null}
              </section>

              <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  {t('settings.futureWireTitle')}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('settings.futureWireDesc')}</p>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-100 p-4 text-[11px] leading-snug text-gray-800 shadow-neo-in dark:bg-gray-900 dark:text-gray-200">
                  {`+------------------------------------------------------------------+
|  Global admin (gelecek)                                          |
+----------------------------+---------------------------------------+
|  [ Şirket listesi ]        |  [ Modül matrisi — lisans / açık kapa ]|
|  +----------------------+  |  +------+---+---+---+---+---+---+--+
|  | Acme Prefabrik       |  |  |      |CRM|Tkf|MES| QC|Yrd|Sev|Rap|
|  | Beta Yapı            |  |  +------+---+---+---+---+---+---+--+
|  | ...                  |  |  | Acme | x | x | x | x | x | x | x |
|  +----------------------+  |  | Beta | x |   | x | x |   | x | x |
|  [ + Şirket ekle ]         |  | ...  |   |   |   |   |   |   |   |
|                            |  +------+---+---+---+---+---+---+--+
+----------------------------+---------------------------------------+
|  [ Kaydet taslak ]   [ İptal ]                                     |
+------------------------------------------------------------------+
`}
                </pre>
              </section>
            </div>
          ) : null}

          {tab === 'scenario' ? (
            <div className="space-y-4">
              <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('settings.scenarioTitle')}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {t('settings.scenarioIntro')}
                </p>
              </section>

              <ol className="space-y-3">
                {e2eScenarioSteps.map((step) => (
                  <li
                    key={step.id}
                    className="rounded-2xl border border-gray-200/80 bg-gray-50 p-4 shadow-neo-in dark:border-gray-700/80 dark:bg-gray-950/60"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
                          #{step.id.toString().padStart(2, '0')}
                        </span>
                        <span
                          className={[
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            step.tier === 'P0'
                              ? 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                              : 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-100',
                          ].join(' ')}
                        >
                          {step.tier}
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                          {t(`e2e.step.${step.id}.screen`)}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {step.special === 'login' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate('/login')}
                              className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-800 shadow-neo-out-sm transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                            >
                              {t('settings.scenario.gotoLogin')}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCode(DEFAULT_FACTORY_CODE)
                                onNavigate('project')
                              }}
                              className="rounded-xl bg-gray-800 px-3 py-2 text-xs font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
                            >
                              {t('settings.scenario.gotoApp')}
                            </button>
                          </>
                        ) : null}
                        {step.moduleId ? (
                          <button
                            type="button"
                            onClick={() => onNavigate(step.moduleId!)}
                            className="rounded-xl bg-gray-800 px-3 py-2 text-xs font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
                          >
                            {t('settings.scenario.gotoModule')}
                          </button>
                        ) : null}
                        {step.special === 'notifications' ? (
                          <button
                            type="button"
                            onClick={() => onNavigate('project')}
                            className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-800 shadow-neo-out-sm transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                          >
                            {t('settings.scenario.gotoNotif')}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                      <span className="font-medium text-gray-800 dark:text-gray-100">{t('settings.scenario.control')}</span>{' '}
                      {t(`e2e.step.${step.id}.control`)}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{t('settings.scenario.mock')}</span>{' '}
                      {t(`e2e.step.${step.id}.mock`)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200/90 pt-4 dark:border-gray-700/90">
            <button
              type="button"
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:ring-offset-gray-900"
            >
              {t('settings.resetDefaults')}
            </button>
            <button
              type="button"
              className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900"
            >
              {t('settings.saveProto')}
            </button>
          </div>
        </div>
      </div>
    </ModuleShellFrame>
  )
}
