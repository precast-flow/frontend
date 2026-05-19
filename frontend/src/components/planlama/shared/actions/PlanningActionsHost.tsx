import { usePlanningWizardOptional } from '../../PlanningWizardContext'
import { PlanningActionsDrawer } from './PlanningActionsDrawer'
import { PlanningFromProjectWizard } from './PlanningFromProjectWizard'

type Props = {
  onTimelinePage: boolean
}

export function PlanningActionsHost({ onTimelinePage }: Props) {
  const wizard = usePlanningWizardOptional()
  if (!wizard) return null

  return (
    <>
      <PlanningActionsDrawer placement={onTimelinePage ? 'inline' : 'fixed'} />
      {wizard.activeWizard ? (
        <PlanningFromProjectWizard onTimelinePage={onTimelinePage} />
      ) : null}
    </>
  )
}
