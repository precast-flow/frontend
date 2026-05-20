import { Factory, MapPin, Package, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { usePlanningWizard } from '../../PlanningWizardContext'
import type { ProjectPlanWizardKind } from '../../../../planlama/planPreviewBuilder'
import { PlanningActionButton } from './PlanningActionButton'
import { PlanningSideDrawer } from './PlanningSideDrawer'

const ACTION_ROWS: {
  kind: ProjectPlanWizardKind | 'create-production'
  labelKey: string
  descKey: string
  icon: LucideIcon
}[] = [
  {
    kind: 'create-production',
    labelKey: 'planningActions.action.createProduction',
    descKey: 'planningActions.action.createProductionDesc',
    icon: Plus,
  },
  {
    kind: 'project-production',
    labelKey: 'planningActions.action.createFromProjectProduction',
    descKey: 'planningActions.action.createFromProjectProductionDesc',
    icon: Factory,
  },
  {
    kind: 'project-dispatch',
    labelKey: 'planningActions.action.createFromProjectDispatch',
    descKey: 'planningActions.action.createFromProjectDispatchDesc',
    icon: Package,
  },
  {
    kind: 'project-assembly',
    labelKey: 'planningActions.action.createFromProjectField',
    descKey: 'planningActions.action.createFromProjectFieldDesc',
    icon: MapPin,
  },
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
      <ul className="space-y-2.5 px-1 pb-2" role="list">
        {ACTION_ROWS.map((row) => (
          <li key={row.labelKey}>
            <PlanningActionButton
              icon={row.icon}
              title={t(row.labelKey)}
              description={t(row.descKey)}
              onClick={() => handleAction(row)}
            />
          </li>
        ))}
      </ul>
    </PlanningSideDrawer>
  )
}
