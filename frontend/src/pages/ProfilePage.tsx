import { useOutletContext } from 'react-router-dom'
import type { AppShellOutletContext } from '../appShellOutletContext'
import { ProfileModuleView } from '../components/profile/ProfileModuleView'
import { useProfilePageState } from '../components/profile/useProfilePageState'
import { AppModuleBreadcrumb } from '../components/shared/AppModuleBreadcrumb'
import { accountPageBreadcrumbSegments } from '../components/shared/mainCanvasBreadcrumb'
import { useI18n } from '../i18n/I18nProvider'

export function ProfilePage() {
  const { t } = useI18n()
  const { onNavigate } = useOutletContext<AppShellOutletContext>()
  const state = useProfilePageState()
  const profileCrumbs = accountPageBreadcrumbSegments('profile')

  return (
    <div className="gm-glass-main-canvas project-mgmt-page-root flex min-h-0 flex-1 flex-col overflow-hidden px-0 pt-0 pb-1 md:px-1 md:pt-0 md:pb-2 gm-glass-main-canvas--okan-liquid h-full min-h-0">
      <div className="mb-2 shrink-0 pt-1 pb-2 md:pt-1.5 ps-[0.6875rem] pe-[0.6875rem]">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-2xl">
          {t('profile.title')}
        </h1>
        <div className="mt-1.5">
          <AppModuleBreadcrumb segments={profileCrumbs} />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <ProfileModuleView {...state} onNavigate={onNavigate} />
      </div>
    </div>
  )
}
