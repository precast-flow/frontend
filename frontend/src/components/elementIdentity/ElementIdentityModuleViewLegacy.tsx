import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useElementIdentity } from './elementIdentityContextValue'
import { FirmSettingsPanel } from './FirmSettingsPanel'
import { TemplateBuilderPanel } from './TemplateBuilderPanel'
import { IfcImportWizardPanel } from './IfcImportWizardPanel'
import { ProjectElementsPanel } from './ProjectElementsPanel'

type TabId = 'firm-settings' | 'template' | 'ifc-import' | 'project-elements'

/** Önceki tek ekran düzeni — karşılaştırma / referans (ElementIdentityProvider içinde kullanın). */
export function ElementIdentityModuleViewLegacy() {
  const { t } = useI18n()
  const [tab, setTab] = useState<TabId>('firm-settings')
  const {
    firms,
    activeFirmId,
    setActiveFirmId,
    projects,
    activeProjectId,
    setActiveProjectId,
  } = useElementIdentity()

  const tabs: { id: TabId; labelKey: string }[] = [
    { id: 'firm-settings', labelKey: 'elementIdentity.tab.firmSettings' },
    { id: 'template', labelKey: 'elementIdentity.tab.template' },
    { id: 'ifc-import', labelKey: 'elementIdentity.tab.ifcImport' },
    { id: 'project-elements', labelKey: 'elementIdentity.tab.projectElements' },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-700/70 dark:bg-slate-900/40">
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {t('elementIdentity.demoData')}
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('elementIdentity.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[12rem] flex-col gap-1 text-xs">
            <span className="font-semibold text-gray-600 dark:text-gray-300">{t('elementIdentity.firmSelector')}</span>
            <select
              value={activeFirmId}
              onChange={(e) => setActiveFirmId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {firms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.firmCodePrefix})
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[12rem] flex-col gap-1 text-xs">
            <span className="font-semibold text-gray-600 dark:text-gray-300">{t('elementIdentity.projectSelector')}</span>
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div
        role="tablist"
        className="flex flex-wrap gap-2 rounded-xl border border-slate-200/70 bg-white/70 p-2 dark:border-slate-700/70 dark:bg-slate-900/40"
      >
        {tabs.map((tab_) => {
          const isActive = tab === tab_.id
          return (
            <button
              key={tab_.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(tab_.id)}
              className={[
                'rounded-xl px-4 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-slate-100 text-gray-900 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-gray-50 dark:ring-slate-600/70'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100',
              ].join(' ')}
            >
              {t(tab_.labelKey)}
            </button>
          )
        })}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {tab === 'firm-settings' ? (
          <FirmSettingsPanel />
        ) : tab === 'template' ? (
          <TemplateBuilderPanel />
        ) : tab === 'ifc-import' ? (
          <IfcImportWizardPanel onNavigateToList={() => setTab('project-elements')} />
        ) : (
          <ProjectElementsPanel />
        )}
      </div>
    </div>
  )
}
