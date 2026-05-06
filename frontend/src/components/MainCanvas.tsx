import { Link } from 'react-router-dom'
import { findNavItem } from '../data/navigation'
import { useI18n } from '../i18n/I18nProvider'
import { AppModuleBreadcrumb } from './shared/AppModuleBreadcrumb'
import { mainCanvasBreadcrumbSegments } from './shared/mainCanvasBreadcrumb'
import { CrmModuleView } from './crm/CrmModuleView'
import { ElementIdentityModuleView } from './elementIdentity/ElementIdentityModuleView'
import { ProjectManagementModuleView } from './proje/ProjectManagementModuleView'
import { PlanningHubView } from './planlama/PlanningHubView'
import { PlanningDesignView } from './planlama/PlanningDesignView'
import { StartWorkWizardView } from './satis/StartWorkWizardView'
import { ApprovalFlowDesignerView } from './onay/ApprovalFlowDesignerView'
import { RolesAndPermissionsView } from './rbac/RolesAndPermissionsView'
import { UserManagementView } from './users/UserManagementView'
import { MaterialCatalogProvider } from './materialCatalog/MaterialCatalogContext'
import { MaterialCatalogModuleView } from './materialCatalog/MaterialCatalogModuleView'
import { StandardSeriesCatalogModuleView } from './standardSeriesCatalog/StandardSeriesCatalogModuleView'
import { AdminElementIdentityModuleView } from './admin/elementIdentity/AdminElementIdentityModuleView'
import { UnitWorkQueueModuleView } from './workQueue/UnitWorkQueueModuleView'

type Props = {
  activeId: string
  onNavigate: (moduleId: string) => void
}

export function MainCanvas({ activeId, onNavigate }: Props) {
  const { t } = useI18n()
  const breadcrumbSegments = mainCanvasBreadcrumbSegments(activeId)
  const item = findNavItem(activeId)
  const title = item ? t(item.labelKey) : t('main.moduleFallback')
  const isCrm = activeId === 'crm'
  const isWorkStart = activeId === 'work-start'
  const isProject = activeId === 'project'
  const isPlanningHub = activeId === 'planning-hub'
  const isUnitWorkQueue = activeId === 'unit-work-queue'
  const isConfigurationCenter = activeId === 'configuration-center'
  const isElementIdentity = activeId === 'element-identity'
  const isElementIdentityAdmin = activeId === 'element-identity-admin'
  const isMaterialCatalog = activeId === 'material-catalog'
  const isStandardSeriesCatalog = activeId === 'standard-series-catalog'
  const isPlanningDesign = activeId === 'planning-design'
  const isApprovalFlow = activeId === 'approval-flow'
  const isRolesPermissions = activeId === 'roles-permissions'
  const isUserManagement = activeId === 'user-management'

  const fullBleedInMainModule = isPlanningDesign
  const okanSplitHeadingAlign =
    isProject ||
    isCrm ||
    isPlanningDesign ||
    isMaterialCatalog ||
    isStandardSeriesCatalog ||
    isApprovalFlow ||
    isRolesPermissions ||
    isUserManagement ||
    isElementIdentityAdmin ||
    isUnitWorkQueue

  return (
    <div
      className={
        fullBleedInMainModule
          ? 'gm-glass-main-canvas gm-glass-main-canvas--full gm-glass-main-canvas--okan-liquid flex min-h-0 flex-1 flex-col overflow-hidden'
          : [
              `gm-glass-main-canvas flex min-h-0 flex-1 flex-col rounded-3xl ${
                isProject || isCrm || isMaterialCatalog || isStandardSeriesCatalog || isApprovalFlow || isRolesPermissions || isUserManagement || isElementIdentityAdmin || isUnitWorkQueue
                  ? 'px-0 py-1 md:px-1 md:py-2'
                  : 'p-5 md:p-6'
              }`,
              isProject || isCrm || isMaterialCatalog || isStandardSeriesCatalog || isApprovalFlow || isRolesPermissions || isUserManagement || isElementIdentityAdmin || isUnitWorkQueue
                ? 'gm-glass-main-canvas--okan-liquid h-[calc(100dvh-12.5rem)] min-h-[calc(100dvh-12.5rem)] max-h-[calc(100dvh-12.5rem)]'
                : isPlanningHub ||
                    isConfigurationCenter || isElementIdentity
                  ? 'gm-glass-main-canvas--okan-liquid min-h-[min(100%,42rem)]'
                  : 'bg-pf-surface shadow-neo-out',
            ].join(' ')
      }
    >
      <div
        className={[
          fullBleedInMainModule ? 'mb-2 shrink-0 pb-2' : 'mb-2 pb-2',
          okanSplitHeadingAlign ? 'ps-[0.6875rem] pe-[0.6875rem]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-2xl">
          {title}
        </h1>
        {breadcrumbSegments ? (
          <div className="mt-1.5">
            <AppModuleBreadcrumb segments={breadcrumbSegments} />
          </div>
        ) : null}
      </div>

      {isCrm ? (
        <CrmModuleView onNavigate={onNavigate} />
      ) : isPlanningHub ? (
        <PlanningHubView />
      ) : isUnitWorkQueue ? (
        <UnitWorkQueueModuleView onNavigate={onNavigate} />
      ) : isWorkStart ? (
        <StartWorkWizardView onNavigate={onNavigate} />
      ) : isProject ? (
        <ProjectManagementModuleView onNavigate={onNavigate} />
      ) : isConfigurationCenter ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            onClick={() => onNavigate('element-identity')}
            className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-left transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t('definitions.hub.elementIdentityTitle')}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t('definitions.hub.elementIdentityDesc')}</p>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('material-catalog')}
            className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-left transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t('definitions.hub.materialCatalogTitle')}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t('definitions.hub.materialCatalogDesc')}</p>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('standard-series-catalog')}
            className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-left transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t('definitions.hub.standardSeriesTitle')}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t('definitions.hub.standardSeriesDesc')}</p>
          </button>
          <div className="flex flex-col justify-between gap-2 rounded-2xl border border-dashed border-slate-300/60 bg-white/40 p-4 dark:border-slate-600/50 dark:bg-slate-900/25">
            <p className="text-xs text-slate-600 dark:text-slate-400">{t('definitions.hub.legacyLink')}</p>
            <Link
              to="/eleman-kimlik?legacy=1"
              className="text-sm font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
            >
              /eleman-kimlik?legacy=1
            </Link>
          </div>
        </div>
      ) : isElementIdentity ? (
        <ElementIdentityModuleView />
      ) : isElementIdentityAdmin ? (
        <AdminElementIdentityModuleView />
      ) : isMaterialCatalog ? (
        <MaterialCatalogProvider>
          <MaterialCatalogModuleView />
        </MaterialCatalogProvider>
      ) : isStandardSeriesCatalog ? (
        <StandardSeriesCatalogModuleView />
      ) : isPlanningDesign ? (
        <PlanningDesignView />
      ) : isApprovalFlow ? (
        <ApprovalFlowDesignerView />
      ) : isRolesPermissions ? (
        <RolesAndPermissionsView />
      ) : isUserManagement ? (
        <UserManagementView />
      ) : (
        <div className="grid flex-1 gap-4 lg:grid-cols-3">
          <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/50 lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('main.placeholderTitle')}</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('main.placeholderBody')}</p>
            <div className="mt-4 h-24 rounded-xl bg-gray-100 shadow-neo-in dark:bg-gray-900/80" aria-hidden />
          </section>
          <section className="rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-800/90">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('main.summaryTitle')}</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{t('main.summaryBody')}</p>
          </section>
        </div>
      )}
    </div>
  )
}
