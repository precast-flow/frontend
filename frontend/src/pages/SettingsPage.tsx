import { useOutletContext, useSearchParams } from 'react-router-dom'
import type { AppShellOutletContext } from '../appShellOutletContext'
import { ModuleShellFrame } from '../components/ModuleShellFrame'
import { SettingsModuleView } from '../components/settings/SettingsModuleView'
import { SettingsPageLegacy } from '../components/settings/SettingsPageLegacy'
import { useSettingsPageState } from '../components/settings/useSettingsPageState'
import { AppModuleBreadcrumb } from '../components/shared/AppModuleBreadcrumb'
import { accountPageBreadcrumbSegments } from '../components/shared/mainCanvasBreadcrumb'
import { useI18n } from '../i18n/I18nProvider'

export function SettingsPage() {
  const { t } = useI18n()
  const [sp] = useSearchParams()
  const { onNavigate } = useOutletContext<AppShellOutletContext>()
  const state = useSettingsPageState()

  const profileBtn = (
    <button
      type="button"
      onClick={() => onNavigate('profile')}
      className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900"
    >
      {t('settings.gotoProfile')}
    </button>
  )

  const settingsCrumbs = accountPageBreadcrumbSegments('settings')

  if (sp.get('legacy') === '1') {
    return (
      <ModuleShellFrame
        title={t('settings.pageTitle')}
        actions={profileBtn}
        breadcrumb={<AppModuleBreadcrumb segments={settingsCrumbs} />}
      >
        <SettingsPageLegacy {...state} />
      </ModuleShellFrame>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 py-1 md:px-1 md:py-2 gm-glass-main-canvas--okan-liquid h-[calc(100dvh-12.5rem)] min-h-[calc(100dvh-12.5rem)] max-h-[calc(100dvh-12.5rem)]">
      <div className="mb-2 shrink-0 pb-2 ps-[0.6875rem] pe-[0.6875rem]">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-2xl">
          {t('settings.pageTitle')}
        </h1>
        <div className="mt-1.5">
          <AppModuleBreadcrumb segments={settingsCrumbs} />
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <SettingsModuleView {...state} onNavigate={onNavigate} />
      </div>
    </div>
  )
}
