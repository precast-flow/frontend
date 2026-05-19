import type { ReactNode } from 'react'
import { PlanningWizardProvider } from './PlanningWizardContext'

/** Planlama hub ve takvim sayfaları — sihirbaz + aksiyon çekmecesi state. */
export function PlanningModulesShell({ children }: { children: ReactNode }) {
  return <PlanningWizardProvider>{children}</PlanningWizardProvider>
}
