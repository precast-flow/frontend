import { useId } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import type { AppShellOutletContext } from '../../appShellOutletContext'
import { useFactoryContext } from '../../context/FactoryContext'
import { useI18n, type Locale } from '../../i18n/I18nProvider'
import { NeoSwitch } from '../NeoSwitch'
import { SettingsFactoriesPanel } from './SettingsFactoriesPanel'
import { e2eScenarioSteps } from '../../data/e2eScenarioMock'
import { DEFAULT_FACTORY_CODE } from '../../data/mockFactories'
import { moduleSimOptions } from '../../data/futureLicenseMock'
import type { SettingsPageState } from './useSettingsPageState'

const futureAscii = `+------------------------------------------------------------------+
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
`

type Appearance = 'legacy' | 'module'

function usePanelStyles(appearance: Appearance) {
  if (appearance === 'legacy') {
    return {
      select:
        'mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-4 py-3 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100',
      section: 'rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80',
      sectionInset: 'rounded-2xl bg-gray-50 p-5 shadow-neo-in dark:bg-gray-950/80',
      teaserBox: 'rounded-xl border border-gray-200/90 bg-gray-100/80 p-4 dark:border-gray-700 dark:bg-gray-900/50',
      divider: 'mt-5 space-y-4 border-t border-gray-200/80 pt-4 dark:border-gray-700/80',
      tableWrap: 'mt-4 overflow-x-auto rounded-xl border border-gray-200/80 dark:border-gray-700/80',
      thead:
        'border-b border-gray-200/90 bg-gray-100/80 text-left text-xs font-semibold text-gray-600 dark:border-gray-700/90 dark:bg-gray-900/80 dark:text-gray-300',
      row: 'border-b border-gray-200/70 dark:border-gray-700/70 odd:bg-white/50 even:bg-gray-50/50 dark:odd:bg-gray-950/40 dark:even:bg-gray-900/40',
      futureSimFieldset:
        'mt-4 rounded-xl border border-gray-200/80 bg-gray-100/50 p-4 dark:border-gray-700/80 dark:bg-gray-900/50',
      simLabelRow: 'flex cursor-pointer items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-950/60',
      pre: 'mt-4 overflow-x-auto rounded-xl bg-gray-100 p-4 text-[11px] leading-snug text-gray-800 shadow-neo-in dark:bg-gray-900 dark:text-gray-200',
      scenarioIntro: 'rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80',
      scenarioLi:
        'rounded-2xl border border-gray-200/80 bg-gray-50 p-4 shadow-neo-in dark:border-gray-700/80 dark:bg-gray-950/60',
      btnGhost:
        'rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-800 shadow-neo-out-sm transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
      btnPrimary:
        'rounded-xl bg-gray-800 px-3 py-2 text-xs font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white',
      footerBtnGhost:
        'rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:ring-offset-gray-900',
      footerBtnPrimary:
        'rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900',
      labelUpper: 'text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400',
      h2: 'text-sm font-semibold text-gray-900 dark:text-gray-50',
      h3upper: 'text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300',
      body: 'mt-1 text-sm text-gray-600 dark:text-gray-300',
      bodyRelaxed: 'mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300',
      tierP0: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
      tierOther: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-100',
    }
  }
  return {
    select:
      'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100',
    section: 'rounded-xl border border-slate-200/70 bg-white/55 p-4 dark:border-slate-600/60 dark:bg-slate-900/45',
    sectionInset: 'rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-600/60 dark:bg-slate-900/35',
    teaserBox: 'rounded-lg border border-slate-200/80 bg-slate-100/80 p-3 dark:border-slate-600/50 dark:bg-slate-900/50',
    divider: 'mt-4 space-y-4 border-t border-slate-200/60 pt-4 dark:border-slate-700/60',
    tableWrap: 'mt-4 overflow-x-auto rounded-lg border border-slate-200/70 dark:border-slate-600/50',
    thead:
      'border-b border-slate-200/90 bg-slate-100/90 text-left text-xs font-semibold text-slate-600 dark:border-slate-700/90 dark:bg-slate-900/70 dark:text-slate-300',
    row: 'border-b border-slate-200/60 dark:border-slate-700/60 odd:bg-white/40 even:bg-slate-50/50 dark:odd:bg-slate-950/30 dark:even:bg-slate-900/35',
    futureSimFieldset:
      'mt-4 rounded-lg border border-slate-200/80 bg-white/50 p-3 dark:border-slate-600/50 dark:bg-slate-900/40',
    simLabelRow:
      'flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200/50 bg-white/60 px-2.5 py-2 text-sm dark:border-slate-600/40 dark:bg-slate-950/40',
    pre: 'mt-3 overflow-x-auto rounded-lg border border-slate-200/70 bg-slate-950 p-3 text-[11px] leading-snug text-slate-100 dark:border-slate-600',
    scenarioIntro: 'rounded-xl border border-slate-200/70 bg-white/55 p-4 dark:border-slate-600/60 dark:bg-slate-900/45',
    scenarioLi:
      'rounded-xl border border-slate-200/70 bg-white/50 p-3 shadow-sm dark:border-slate-600/50 dark:bg-slate-900/40',
    btnGhost:
      'rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    btnPrimary:
      'rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
    footerBtnGhost:
      'rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800',
    footerBtnPrimary:
      'rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
    labelUpper: 'text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400',
    h2: 'text-sm font-semibold text-slate-900 dark:text-slate-50',
    h3upper: 'text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300',
    body: 'mt-1 text-sm text-slate-600 dark:text-slate-300',
    bodyRelaxed: 'mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300',
    tierP0: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
    tierOther: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-100',
  }
}

type Props = SettingsPageState & {
  appearance: Appearance
  /** Modül görünümünde alt çubuk `mt-auto` ile yapışsın */
  stickyFooter?: boolean
}

export function SettingsTabPanels(props: Props) {
  const { appearance, stickyFooter, ...state } = props
  const s = usePanelStyles(appearance)
  const { t, locale, setLocale } = useI18n()
  const baseId = useId()
  const navigate = useNavigate()
  const { onNavigate } = useOutletContext<AppShellOutletContext>()
  const { setSelectedCode } = useFactoryContext()

  const {
    tab,
    compactTables,
    setCompactTables,
    openLinksNewTab,
    setOpenLinksNewTab,
    emailDigest,
    setEmailDigest,
    pushMes,
    setPushMes,
    pushDispatch,
    setPushDispatch,
    ncrRows,
    showModuleSim,
    setShowModuleSim,
    moduleSimState,
    toggleModuleSim,
  } = state

  const footerBorder =
    appearance === 'legacy' ? 'border-gray-200/90 dark:border-gray-700/90' : 'border-slate-200/60 dark:border-slate-700/60'
  const footerWrap = ['flex flex-wrap justify-end gap-2 border-t pt-4', footerBorder, stickyFooter ? 'shrink-0' : '']
    .filter(Boolean)
    .join(' ')

  const footerEl = (
    <div className={footerWrap}>
      <button type="button" className={s.footerBtnGhost}>
        {t('settings.resetDefaults')}
      </button>
      <button type="button" className={s.footerBtnPrimary}>
        {t('settings.saveProto')}
      </button>
    </div>
  )

  const mainBlocks = (
    <>
      {tab === 'factories' ? <SettingsFactoriesPanel /> : null}

      {tab === 'general' ? (
        <section className={s.section}>
          <h2 className={s.h2}>{t('settings.generalTitle')}</h2>
          <p className={s.body}>{t('settings.generalDesc')}</p>
          <div className={`mt-4 ${s.teaserBox}`}>
            <p className={`text-sm font-medium ${appearance === 'legacy' ? 'text-gray-900 dark:text-gray-50' : 'text-slate-900 dark:text-slate-50'}`}>
              {t('settings.firmAdminTeaserTitle')}
            </p>
            <p className={`mt-1 text-xs ${appearance === 'legacy' ? 'text-gray-600 dark:text-gray-400' : 'text-slate-600 dark:text-slate-400'}`}>
              {t('settings.firmAdminTeaserDesc')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/firma-ayarlari')}
              className={s.btnPrimary + ' mt-3 px-4 py-2.5 text-sm'}
            >
              {t('settings.gotoFirmAdmin')}
            </button>
          </div>
          <div className={s.divider}>
            <NeoSwitch id={`${baseId}-compact`} label={t('settings.compactRows')} checked={compactTables} onChange={setCompactTables} />
            <NeoSwitch id={`${baseId}-links`} label={t('settings.linksNewTab')} checked={openLinksNewTab} onChange={setOpenLinksNewTab} />
          </div>
        </section>
      ) : null}

      {tab === 'notifications' ? (
        <section className={s.section}>
          <h2 className={s.h2}>{t('settings.notifTitle')}</h2>
          <p className={s.body}>{t('settings.notifDesc')}</p>
          <div className={s.divider}>
            <NeoSwitch id={`${baseId}-digest`} label={t('settings.digestEmail')} checked={emailDigest} onChange={setEmailDigest} />
            <NeoSwitch id={`${baseId}-mes`} label={t('settings.pushMes')} checked={pushMes} onChange={setPushMes} />
            <NeoSwitch id={`${baseId}-dispatch`} label={t('settings.pushDispatch')} checked={pushDispatch} onChange={setPushDispatch} />
          </div>
        </section>
      ) : null}

      {tab === 'locale' ? (
        <section className={s.section}>
          <h2 className={s.h2}>{t('settings.localeTitle')}</h2>
          <p className={s.body}>{t('settings.localeDesc')}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={s.labelUpper}>{t('settings.interfaceLanguage')}</span>
              <select
                id={`${baseId}-lang`}
                className={s.select}
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
              >
                <option value="tr">{t('settings.lang.tr')}</option>
                <option value="en">{t('settings.lang.en')}</option>
              </select>
            </label>
            <label className="block">
              <span className={s.labelUpper}>{t('settings.timezone')}</span>
              <select id={`${baseId}-tz`} className={s.select} defaultValue="europe-istanbul">
                <option value="europe-istanbul">Europe/Istanbul (UTC+3)</option>
                <option value="utc">UTC</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className={s.labelUpper}>{t('settings.dateFormat')}</span>
              <select id={`${baseId}-date`} className={s.select} defaultValue="dmy">
                <option value="dmy">GG.AA.YYYY</option>
                <option value="mdy">AA/GG/YYYY</option>
                <option value="iso">YYYY-AA-GG</option>
              </select>
            </label>
          </div>
        </section>
      ) : null}

      {tab === 'dictionaries' ? (
        <section className={s.section}>
          <h2 className={s.h2}>{t('settings.dictTitle')}</h2>
          <p className={s.body}>{t('settings.dictDesc')}</p>
          <div className={s.tableWrap}>
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className={s.thead}>
                  <th className="px-3 py-2">{t('settings.table.code')}</th>
                  <th className="px-3 py-2">{t('settings.table.label')}</th>
                  <th className="px-3 py-2">{t('settings.table.severity')}</th>
                  <th className="px-3 py-2">{t('settings.table.active')}</th>
                </tr>
              </thead>
              <tbody>
                {ncrRows.map((row) => (
                  <tr key={row.id} className={s.row}>
                    <td className="px-3 py-2 font-mono text-xs font-semibold">{row.code}</td>
                    <td
                      className={
                        appearance === 'legacy' ? 'px-3 py-2 text-gray-800 dark:text-gray-100' : 'px-3 py-2 text-slate-800 dark:text-slate-100'
                      }
                    >
                      {row.label}
                    </td>
                    <td
                      className={
                        appearance === 'legacy'
                          ? 'px-3 py-2 text-xs capitalize text-gray-600 dark:text-gray-300'
                          : 'px-3 py-2 text-xs capitalize text-slate-600 dark:text-slate-300'
                      }
                    >
                      {row.severity}
                    </td>
                    <td className="px-3 py-2 text-xs">{row.active ? t('settings.yes') : t('settings.no')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === 'future' ? (
        <div className="space-y-5">
          <section className={s.section}>
            <h2 className={s.h2}>{t('settings.futureTitle')}</h2>
            <p className={s.bodyRelaxed}>{t('settings.futureBody')}</p>
          </section>

          <section className={appearance === 'legacy' ? s.sectionInset : s.section}>
            <h3 className={s.h3upper}>{t('settings.futureSimTitle')}</h3>
            <NeoSwitch id={`${baseId}-mod-sim`} label={t('settings.futureSimSwitch')} checked={showModuleSim} onChange={setShowModuleSim} />
            <p className={`mt-3 text-sm ${appearance === 'legacy' ? 'text-gray-600 dark:text-gray-300' : 'text-slate-600 dark:text-slate-300'}`}>
              {t('settings.futureSimNote')}
            </p>
            {showModuleSim ? (
              <fieldset className={s.futureSimFieldset}>
                <legend className={`px-1 text-xs font-semibold ${appearance === 'legacy' ? 'text-gray-700 dark:text-gray-200' : 'text-slate-700 dark:text-slate-200'}`}>
                  {t('settings.futureSimLegend')}
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {moduleSimOptions.map((m) => (
                    <label key={m.id} className={s.simLabelRow}>
                      <input
                        type="checkbox"
                        className={
                          appearance === 'legacy'
                            ? 'size-4 rounded border-gray-400'
                            : 'size-4 rounded border-slate-400 accent-sky-600 dark:accent-sky-500'
                        }
                        checked={moduleSimState[m.id] ?? false}
                        onChange={(e) => toggleModuleSim(m.id, e.target.checked)}
                      />
                      <span
                        className={`font-medium ${appearance === 'legacy' ? 'text-gray-900 dark:text-gray-50' : 'text-slate-900 dark:text-slate-50'}`}
                      >
                        {t(m.labelKey)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
          </section>

          <section className={s.section}>
            <h3 className={s.h3upper}>{t('settings.futureWireTitle')}</h3>
            <p className={s.body}>{t('settings.futureWireDesc')}</p>
            <pre className={s.pre}>{futureAscii}</pre>
          </section>
        </div>
      ) : null}

      {tab === 'scenario' ? (
        <div className="space-y-4">
          <section className={s.scenarioIntro}>
            <h2 className={s.h2}>{t('settings.scenarioTitle')}</h2>
            <p className={s.bodyRelaxed}>{t('settings.scenarioIntro')}</p>
          </section>

          <ol className="space-y-3">
            {e2eScenarioSteps.map((step) => (
              <li key={step.id} className={s.scenarioLi}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-mono text-xs font-semibold ${appearance === 'legacy' ? 'text-gray-500 dark:text-gray-400' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      #{step.id.toString().padStart(2, '0')}
                    </span>
                    <span
                      className={[
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        step.tier === 'P0' ? s.tierP0 : s.tierOther,
                      ].join(' ')}
                    >
                      {step.tier}
                    </span>
                    <h3 className={`text-sm font-semibold ${appearance === 'legacy' ? 'text-gray-900 dark:text-gray-50' : 'text-slate-900 dark:text-slate-50'}`}>
                      {t(`e2e.step.${step.id}.screen`)}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {step.special === 'login' ? (
                      <>
                        <button type="button" onClick={() => navigate('/login')} className={s.btnGhost}>
                          {t('settings.scenario.gotoLogin')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCode(DEFAULT_FACTORY_CODE)
                            onNavigate('project')
                          }}
                          className={s.btnPrimary}
                        >
                          {t('settings.scenario.gotoApp')}
                        </button>
                      </>
                    ) : null}
                    {step.moduleId ? (
                      <button type="button" onClick={() => onNavigate(step.moduleId!)} className={s.btnPrimary}>
                        {t('settings.scenario.gotoModule')}
                      </button>
                    ) : null}
                    {step.special === 'notifications' ? (
                      <button type="button" onClick={() => onNavigate('project')} className={s.btnGhost}>
                        {t('settings.scenario.gotoNotif')}
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className={`mt-2 text-sm ${appearance === 'legacy' ? 'text-gray-700 dark:text-gray-200' : 'text-slate-700 dark:text-slate-200'}`}>
                  <span className={`font-medium ${appearance === 'legacy' ? 'text-gray-800 dark:text-gray-100' : 'text-slate-800 dark:text-slate-100'}`}>
                    {t('settings.scenario.control')}
                  </span>{' '}
                  {t(`e2e.step.${step.id}.control`)}
                </p>
                <p className={`mt-1.5 text-xs leading-relaxed ${appearance === 'legacy' ? 'text-gray-600 dark:text-gray-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  <span className={`font-semibold ${appearance === 'legacy' ? 'text-gray-700 dark:text-gray-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {t('settings.scenario.mock')}
                  </span>{' '}
                  {t(`e2e.step.${step.id}.mock`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </>
  )

  if (stickyFooter) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 pb-3 sm:px-1">
          <div className="space-y-5">{mainBlocks}</div>
        </div>
        {footerEl}
      </div>
    )
  }

  return (
    <div className="min-w-0 flex-1 space-y-5">
      {mainBlocks}
      {footerEl}
    </div>
  )
}
