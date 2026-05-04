import { useOutletContext, useSearchParams } from 'react-router-dom'
import type { AppShellOutletContext } from '../appShellOutletContext'
import { ModuleShellFrame } from '../components/ModuleShellFrame'
import { ProfileModuleView } from '../components/profile/ProfileModuleView'
import { ProfilePageLegacy } from '../components/profile/ProfilePageLegacy'
import { useProfilePageState } from '../components/profile/useProfilePageState'
import { AppModuleBreadcrumb } from '../components/shared/AppModuleBreadcrumb'
import { accountPageBreadcrumbSegments } from '../components/shared/mainCanvasBreadcrumb'
import { useI18n } from '../i18n/I18nProvider'

export function ProfilePage() {
  const { t } = useI18n()
  const [sp] = useSearchParams()
  const { onNavigate } = useOutletContext<AppShellOutletContext>()
  const state = useProfilePageState()

  const gotoSettingsBtn = (
    <button
      type="button"
      onClick={() => onNavigate('settings')}
      className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900"
    >
      {t('profile.gotoSettings')}
    </button>
  )

  const profileCrumbs = accountPageBreadcrumbSegments('profile')

  if (sp.get('legacy') === '1') {
    return (
      <ModuleShellFrame
        title={t('profile.title')}
        actions={gotoSettingsBtn}
        breadcrumb={<AppModuleBreadcrumb segments={profileCrumbs} />}
      >
        <ProfilePageLegacy {...state} />
      </ModuleShellFrame>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 py-1 md:px-1 md:py-2 gm-glass-main-canvas--okan-liquid h-[calc(100dvh-12.5rem)] min-h-[calc(100dvh-12.5rem)] max-h-[calc(100dvh-12.5rem)]">
      <div className="mb-2 shrink-0 pb-2 ps-[0.6875rem] pe-[0.6875rem]">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-2xl">
          {t('profile.title')}
        </h1>
        <div className="mt-1.5">
          <AppModuleBreadcrumb segments={profileCrumbs} />
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ProfileModuleView {...state} onNavigate={onNavigate} />
      </div>
    </div>
  )
}
