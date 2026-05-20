import { findNavItem } from '../data/navigation'
import { useI18n } from '../i18n/I18nProvider'
import { AppModuleBreadcrumb } from './shared/AppModuleBreadcrumb'
import { mainCanvasBreadcrumbSegments } from './shared/mainCanvasBreadcrumb'
import { CrmModuleView } from './crm/CrmModuleView'
import { ElementIdentityModuleView } from './elementIdentity/ElementIdentityModuleView'
import { ProjectManagementModuleView } from './proje/ProjectManagementModuleView'
import { PlanningHubView } from './planlama/PlanningHubView'
import { PlanningModulesShell } from './planlama/PlanningModulesShell'
import { GeneralPlanningView } from './planlama/GeneralPlanningView'
import { ProductionPlanningView } from './planlama/ProductionPlanningView'
import { DispatchPlanningView } from './planlama/DispatchPlanningView'
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
  const isManagementModule = isProject || isCrm || isUnitWorkQueue
  const isElementIdentity = activeId === 'element-identity'
  const isElementIdentityAdmin = activeId === 'element-identity-admin'
  const isMaterialCatalog = activeId === 'material-catalog'
  const isStandardSeriesCatalog = activeId === 'standard-series-catalog'
  const isGeneralPlanning = activeId === 'general-planning'
  const isProductionPlanning = activeId === 'production-planning'
  const isDispatchPlanning = activeId === 'dispatch-planning'
  const isApprovalFlow = activeId === 'approval-flow'
  const isRolesPermissions = activeId === 'roles-permissions'
  const isUserManagement = activeId === 'user-management'
  const isSystemModule = isApprovalFlow || isRolesPermissions || isUserManagement
  const isDefinitionsModule = isElementIdentity || isMaterialCatalog || isStandardSeriesCatalog
  const isAdminModule = isElementIdentityAdmin
  const isSplitModulePage = isManagementModule || isSystemModule || isDefinitionsModule || isAdminModule

  const fullBleedInMainModule =
    isGeneralPlanning ||
    isProductionPlanning ||
    isDispatchPlanning
  /** `GlassAppShell` zaten `--gm-footer-clear` veriyor; sabit `100dvh-12.5rem` ile çift kısaltmayı önle. */
  const fillsMainCanvasViewportHeight =
    isUserManagement ||
    isApprovalFlow ||
    isRolesPermissions ||
    isProject ||
    isCrm ||
    isUnitWorkQueue ||
    isDefinitionsModule ||
    isAdminModule

  const okanSplitHeadingAlign =
    isProject ||
    isCrm ||
    isGeneralPlanning ||
    isProductionPlanning ||
    isDispatchPlanning ||
    isDefinitionsModule ||
    isAdminModule ||
    isApprovalFlow ||
    isRolesPermissions ||
    isUserManagement ||
    isElementIdentity ||
    isUnitWorkQueue

  return (
    <div
      className={
        fullBleedInMainModule
          ? 'gm-glass-main-canvas gm-glass-main-canvas--full gm-glass-main-canvas--okan-liquid flex min-h-0 flex-1 flex-col overflow-hidden'
          : [
              `gm-glass-main-canvas flex min-h-0 flex-1 flex-col rounded-3xl ${
                isProject ||
                isCrm ||
                isUnitWorkQueue ||
                isSplitModulePage
                  ? 'project-mgmt-page-root overflow-hidden '
                  : ''
              }${
                isSplitModulePage
                  ? 'px-0 pt-0 pb-1 md:px-1 md:pt-0 md:pb-2'
                  : 'p-5 md:p-6'
              }`,
              fillsMainCanvasViewportHeight
                ? 'gm-glass-main-canvas--okan-liquid h-full min-h-0 flex-1 overflow-hidden'
                : isPlanningHub
                    ? 'gm-glass-main-canvas--okan-liquid min-h-[min(100%,42rem)]'
                    : 'bg-pf-surface shadow-neo-out',
            ].join(' ')
      }
    >
      <div
        className={[
          fullBleedInMainModule
            ? 'mb-2 shrink-0 pb-2'
            : isSplitModulePage
              ? 'mb-2 shrink-0 pt-1 pb-2 md:pt-1.5'
              : 'mb-2 pb-2',
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
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <CrmModuleView onNavigate={onNavigate} />
        </div>
      ) : isPlanningHub ? (
        <PlanningModulesShell>
          <PlanningHubView />
        </PlanningModulesShell>
      ) : isUnitWorkQueue ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <UnitWorkQueueModuleView onNavigate={onNavigate} />
        </div>
      ) : isWorkStart ? (
        <StartWorkWizardView onNavigate={onNavigate} />
      ) : isProject ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <ProjectManagementModuleView onNavigate={onNavigate} />
        </div>
      ) : isElementIdentity ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <ElementIdentityModuleView />
        </div>
      ) : isElementIdentityAdmin ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AdminElementIdentityModuleView />
        </div>
      ) : isMaterialCatalog ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <MaterialCatalogProvider>
            <MaterialCatalogModuleView />
          </MaterialCatalogProvider>
        </div>
      ) : isStandardSeriesCatalog ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <StandardSeriesCatalogModuleView />
        </div>
      ) : isGeneralPlanning ? (
        <PlanningModulesShell>
          <GeneralPlanningView />
        </PlanningModulesShell>
      ) : isProductionPlanning ? (
        <PlanningModulesShell>
          <ProductionPlanningView />
        </PlanningModulesShell>
      ) : isDispatchPlanning ? (
        <PlanningModulesShell>
          <DispatchPlanningView />
        </PlanningModulesShell>
      ) : isApprovalFlow ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <ApprovalFlowDesignerView />
        </div>
      ) : isRolesPermissions ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <RolesAndPermissionsView />
        </div>
      ) : isUserManagement ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <UserManagementView />
        </div>
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
