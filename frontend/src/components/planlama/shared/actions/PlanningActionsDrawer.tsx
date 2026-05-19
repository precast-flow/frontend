import { useI18n } from '../../../../i18n/I18nProvider'
import { eiSplitHeaderButtonPassive } from '../../../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { usePlanningWizard } from '../../PlanningWizardContext'
import type { ProjectPlanWizardKind } from '../../../../planlama/planPreviewBuilder'
import { PlanningSideDrawer } from './PlanningSideDrawer'

const ACTION_ROWS: { kind: ProjectPlanWizardKind | 'create-production'; labelKey: string }[] = [
  { kind: 'create-production', labelKey: 'planningActions.action.createProduction' },
  { kind: 'project-production', labelKey: 'planningActions.action.createFromProjectProduction' },
  { kind: 'project-dispatch', labelKey: 'planningActions.action.createFromProjectDispatch' },
  { kind: 'project-assembly', labelKey: 'planningActions.action.createFromProjectField' },
]

type Props = {
  onOpenWizard?: (kind: ProjectPlanWizardKind) => void
  placement?: 'inline' | 'fixed'
}

export function PlanningActionsDrawer({ onOpenWizard, placement = 'inline' }: Props) {
  const { t } = useI18n()
  const { actionsDrawerOpen, setActionsDrawerOpen, openWizard } = usePlanningWizard()

  const handleAction = (row: (typeof ACTION_ROWS)[number]) => {
    const kind = row.kind === 'create-production' ? 'project-production' : row.kind
    onOpenWizard?.(kind)
    openWizard(kind)
  }

  return (
    <PlanningSideDrawer
      id="gm-planning-actions-drawer"
      placement={placement}
      open={actionsDrawerOpen}
      onClose={() => setActionsDrawerOpen(false)}
      title={t('planningActions.drawerTitle')}
      hint={t('planningActions.drawerHint')}
    >
      <ul className="space-y-2" role="list">
        {ACTION_ROWS.map((row) => (
          <li key={row.labelKey}>
            <button
              type="button"
              onClick={() => handleAction(row)}
              className={`${eiSplitHeaderButtonPassive} w-full justify-start px-3 py-2.5 text-left`}
            >
              {t(row.labelKey)}
            </button>
          </li>
        ))}
      </ul>
    </PlanningSideDrawer>
  )
}
