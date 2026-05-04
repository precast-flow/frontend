/**
 * mvp-16 — uçtan uca mock senaryo: metinler i18n anahtarları `e2e.step.{id}.{screen|control|mock}`.
 */
export type E2eScenarioTier = 'P0' | 'P1'

export type E2eScenarioStep = {
  id: number
  tier: E2eScenarioTier
  /** Ana modül — `MainCanvas` / sidebar */
  moduleId?:
    | 'dashboard'
    | 'crm'
    | 'quote'
    | 'project'
    | 'element-identity'
    | 'mes'
    | 'quality'
    | 'yard'
    | 'dispatch'
    | 'field'
    | 'approval-flow'
    | 'roles-permissions'
    | 'user-management'
    | 'profile'
  /** Bileşende özel düğüm (giriş URL, fabrika seçimi, bildirim) */
  special?: 'login' | 'factory' | 'notifications'
}

export const e2eScenarioSteps: E2eScenarioStep[] = [
  { id: 1, tier: 'P0', special: 'login' },
  { id: 2, tier: 'P0', moduleId: 'roles-permissions' },
  { id: 3, tier: 'P0', moduleId: 'approval-flow' },
  { id: 4, tier: 'P0', moduleId: 'user-management' },
  { id: 5, tier: 'P1', moduleId: 'profile' },
  { id: 6, tier: 'P0', moduleId: 'crm' },
  { id: 7, tier: 'P0', moduleId: 'crm' },
  { id: 8, tier: 'P0', moduleId: 'crm' },
  { id: 9, tier: 'P1', moduleId: 'crm' },
  { id: 10, tier: 'P0', moduleId: 'project' },
  { id: 11, tier: 'P0', moduleId: 'element-identity' },
  { id: 12, tier: 'P0', moduleId: 'mes' },
  { id: 13, tier: 'P0', moduleId: 'quality' },
  { id: 14, tier: 'P0', moduleId: 'yard' },
  { id: 15, tier: 'P0', moduleId: 'dispatch' },
  { id: 16, tier: 'P0', moduleId: 'field' },
  { id: 17, tier: 'P0', moduleId: 'dashboard' },
  { id: 18, tier: 'P0', special: 'notifications' },
]
