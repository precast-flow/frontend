import { createContext, useContext } from 'react'
import type {
  FirmCodeOverride,
  FirmNamingTemplate,
  FirmProfile,
  ProjectElement,
  ProjectSequenceCounter,
} from '../../elementIdentity/types'

export type ProjectLite = { id: string; code: string; name?: string }

export type ElementIdentityContextValue = {
  firms: FirmProfile[]
  activeFirmId: string
  setActiveFirmId: (id: string) => void
  activeFirm: FirmProfile
  templates: FirmNamingTemplate[]
  activeTemplate: FirmNamingTemplate
  setActiveTemplateId: (id: string) => void
  overrides: FirmCodeOverride[]
  projects: ProjectLite[]
  activeProjectId: string
  setActiveProjectId: (id: string) => void
  activeProject: ProjectLite
  projectElements: ProjectElement[]
  counters: ProjectSequenceCounter[]
  upsertOverride: (ov: FirmCodeOverride) => void
  removeOverride: (id: string) => void
  updateTemplate: (next: FirmNamingTemplate) => void
  addTemplate: (next: FirmNamingTemplate) => void
  updateFirm: (next: FirmProfile) => void
  addProjectElements: (els: ProjectElement[]) => void
  allocateNextSequence: (projectId: string, scopeKey: string) => number
  removeProjectElement: (id: string) => void
  clearProjectElements: (projectId?: string) => void
}

export const ElementIdentityContext = createContext<ElementIdentityContextValue | null>(null)

export function useElementIdentity(): ElementIdentityContextValue {
  const ctx = useContext(ElementIdentityContext)
  if (!ctx) {
    throw new Error('useElementIdentity must be used within ElementIdentityProvider')
  }
  return ctx
}
