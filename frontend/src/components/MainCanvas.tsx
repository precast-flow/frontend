import { findNavItem } from '../data/navigation'
import { useI18n } from '../i18n/I18nProvider'
import { CrmModuleView } from './crm/CrmModuleView'
import { DashboardView } from './DashboardView'
import { MobilePreviewModuleView } from './mobil/MobilePreviewModuleView'
import { ReportingModuleView } from './raporlama/ReportingModuleView'
import { FieldModuleView } from './saha/FieldModuleView'
import { DispatchModuleView } from './sevkiyat/DispatchModuleView'
import { YardModuleView } from './yard/YardModuleView'
import { QualityModuleView } from './kalite/QualityModuleView'
import { MoldBoardView } from './production/MoldBoardView'
import { PendingPriorityReportView } from './production/PendingPriorityReportView'
import { ConcreteRecipeSelectionView } from './production/ConcreteRecipeSelectionView'
import { BatchPlantOperatorView } from './production/BatchPlantOperatorView'
import { ProductionRolePreviewView } from './production/ProductionRolePreviewView'
import { ProductionFactoryOpsView } from './production/ProductionFactoryOpsView'
import { PlanningDesignView } from './production/PlanningDesignView'
import { ProductionSummaryDashboard } from './production/ProductionSummaryDashboard'
import { MesModuleView } from './mes/MesModuleView'
import { EngineeringIntegrationOkanPage } from './muhendislikOkan/EngineeringIntegrationOkanPage'
import { ManualPieceTemplateStudioModule } from './manualPieceTemplateStudio/ManualPieceTemplateStudioModule'
import { ProjectManagementModuleView } from './proje/ProjectManagementModuleView'
import { PlanningHubView } from './planlama/PlanningHubView'
import { QuoteModuleView } from './teklif/QuoteModuleView'
import { StartWorkWizardView } from './satis/StartWorkWizardView'
import { ApprovalFlowDesignerView } from './onay/ApprovalFlowDesignerView'
import { RolesAndPermissionsView } from './rbac/RolesAndPermissionsView'
import { UnitWorkQueueView } from './unitWorkQueue/UnitWorkQueueView'
import { LogisticsFieldUnitQueuesView } from './unitWorkQueue/LogisticsFieldUnitQueuesView'
import { UserManagementView } from './users/UserManagementView'

type Props = {
  activeId: string
  onNavigate: (moduleId: string) => void
}

export function MainCanvas({ activeId, onNavigate }: Props) {
  const { t } = useI18n()
  const item = findNavItem(activeId)
  const title = item ? t(item.labelKey) : t('main.moduleFallback')
  const isDashboard = activeId === 'dashboard'
  const isCrm = activeId === 'crm'
  const isQuote = activeId === 'quote'
  const isWorkStart = activeId === 'work-start'
  const isProject = activeId === 'project'
  const isPlanningHub = activeId === 'planning-hub'
  const isEngineering = activeId === 'engineering'
  const isManualPieceStudio = activeId === 'manual-piece-studio'
  const isProductionSummary = activeId === 'production-summary'
  const isMes = activeId === 'mes'
  const isPlanningDesign = activeId === 'planning-design'
  const isMoldBoard = activeId === 'mold-board'
  const isPendingPriority = activeId === 'pending-priority'
  const isConcreteRecipe = activeId === 'concrete-recipe'
  const isBatchPlant = activeId === 'batch-plant'
  const isProductionRolePreview = activeId === 'production-role-preview'
  const isProductionFactoryOps = activeId === 'production-factory-ops'
  const isQuality = activeId === 'quality'
  const isYard = activeId === 'yard'
  const isDispatch = activeId === 'dispatch'
  const isField = activeId === 'field'
  const isReporting = activeId === 'reporting'
  const isMobile = activeId === 'mobile'
  const isApprovalFlow = activeId === 'approval-flow'
  const isRolesPermissions = activeId === 'roles-permissions'
  const isUserManagement = activeId === 'user-management'
  const isUnitWorkQueue = activeId === 'unit-work-queue'
  const isLogisticsFieldQueues = activeId === 'logistics-field-queues'

  /** Tek kart: ana modül kabuğu yeterli; planlama cetveli doğrudan outlet içinde. */
  const fullBleedInMainModule = isPlanningDesign
  /** Split modülde panel içi liste başlığına göre hafif girinti: tam sütun hizasının yarısı (0.6875rem) */
  const okanSplitHeadingAlign = isProject || isCrm || isQuote || isPlanningDesign

  return (
    <div
      className={
        fullBleedInMainModule
          ? 'gm-glass-main-canvas gm-glass-main-canvas--full gm-glass-main-canvas--okan-liquid flex min-h-0 flex-1 flex-col overflow-hidden'
          : [
              `gm-glass-main-canvas flex min-h-0 flex-1 flex-col rounded-3xl ${
                isProject || isCrm || isQuote ? 'px-0 py-1 md:px-1 md:py-2' : 'p-5 md:p-6'
              }`,
              isProject || isCrm || isQuote
                ? 'gm-glass-main-canvas--okan-liquid h-[calc(100dvh-12.5rem)] min-h-[calc(100dvh-12.5rem)] max-h-[calc(100dvh-12.5rem)]'
                : isEngineering || isManualPieceStudio || isPlanningHub
                  ? 'gm-glass-main-canvas--okan-liquid min-h-[min(100%,42rem)]'
                  : 'bg-pf-surface shadow-neo-out',
            ].join(' ')
      }
    >
      <div
        className={[
          fullBleedInMainModule
            ? 'mb-2 shrink-0 pb-2'
            : 'mb-2 pb-2',
          okanSplitHeadingAlign ? 'ps-[0.6875rem] pe-[0.6875rem]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-2xl">
          {title}
        </h1>
      </div>

      {isDashboard ? (
        <DashboardView onNavigate={onNavigate} />
      ) : isCrm ? (
        <CrmModuleView onNavigate={onNavigate} />
      ) : isQuote ? (
        <QuoteModuleView onNavigate={onNavigate} />
      ) : isPlanningHub ? (
        <PlanningHubView />
      ) : isWorkStart ? (
        <StartWorkWizardView onNavigate={onNavigate} />
      ) : isProject ? (
        <ProjectManagementModuleView onNavigate={onNavigate} />
      ) : isEngineering ? (
        <EngineeringIntegrationOkanPage onCloseModule={() => onNavigate('dashboard')} />
      ) : isManualPieceStudio ? (
        <ManualPieceTemplateStudioModule onCloseModule={() => onNavigate('dashboard')} />
      ) : isProductionSummary ? (
        <ProductionSummaryDashboard onNavigate={onNavigate} />
      ) : isMes ? (
        <MesModuleView onNavigate={onNavigate} />
      ) : isPlanningDesign ? (
        <PlanningDesignView />
      ) : isMoldBoard ? (
        <MoldBoardView />
      ) : isPendingPriority ? (
        <PendingPriorityReportView />
      ) : isConcreteRecipe ? (
        <ConcreteRecipeSelectionView />
      ) : isBatchPlant ? (
        <BatchPlantOperatorView />
      ) : isProductionRolePreview ? (
        <ProductionRolePreviewView />
      ) : isProductionFactoryOps ? (
        <ProductionFactoryOpsView />
      ) : isQuality ? (
        <QualityModuleView onNavigate={onNavigate} />
      ) : isYard ? (
        <YardModuleView onNavigate={onNavigate} />
      ) : isDispatch ? (
        <DispatchModuleView onNavigate={onNavigate} />
      ) : isField ? (
        <FieldModuleView onNavigate={onNavigate} />
      ) : isReporting ? (
        <ReportingModuleView />
      ) : isMobile ? (
        <MobilePreviewModuleView />
      ) : isApprovalFlow ? (
        <ApprovalFlowDesignerView />
      ) : isRolesPermissions ? (
        <RolesAndPermissionsView />
      ) : isUserManagement ? (
        <UserManagementView />
      ) : isUnitWorkQueue ? (
        <UnitWorkQueueView onNavigate={onNavigate} />
      ) : isLogisticsFieldQueues ? (
        <LogisticsFieldUnitQueuesView onNavigate={onNavigate} />
      ) : (
        <div className="grid flex-1 gap-4 lg:grid-cols-3">
          <section className="rounded-2xl bg-gray-50 dark:bg-gray-950/90/80 p-4 shadow-neo-in dark:bg-gray-950/50 lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('main.placeholderTitle')}</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('main.placeholderBody')}</p>
            <div className="mt-4 h-24 rounded-xl bg-gray-100 dark:bg-gray-900/90 shadow-neo-in dark:bg-gray-900/80" aria-hidden />
          </section>
          <section className="rounded-2xl bg-gray-100 dark:bg-gray-900 p-4 shadow-neo-out-sm dark:bg-gray-800/90">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('main.summaryTitle')}</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{t('main.summaryBody')}</p>
          </section>
        </div>
      )}
    </div>
  )
}
