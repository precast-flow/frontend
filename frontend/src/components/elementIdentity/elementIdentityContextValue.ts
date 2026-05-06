import { createContext, useContext } from 'react'
import type {
  ElementTypeCatalogEntry,
  FirmCodeOverride,
  FirmNamingTemplate,
  FirmProfile,
  IdentifyingDimension,
  IfcMappingRule,
  ProjectElement,
  ProjectProduct,
  ProjectSequenceCounter,
  SizeFormat,
  StandardSeriesTemplate,
  Typology,
} from '../../elementIdentity/types'

export type ProjectLite = { id: string; code: string; name?: string; customer?: string }

export type ElementIdentityContextValue = {
  firms: FirmProfile[]
  activeFirmId: string
  setActiveFirmId: (id: string) => void
  activeFirm: FirmProfile
  templates: FirmNamingTemplate[]
  firmTemplates: FirmNamingTemplate[]
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
  removeTemplate: (id: string) => void
  addFirm: (next: FirmProfile) => void
  updateFirm: (next: FirmProfile) => void
  removeFirm: (id: string) => void
  addProjectElements: (els: ProjectElement[]) => void
  allocateNextSequence: (projectId: string, scopeKey: string) => number
  removeProjectElement: (id: string) => void
  clearProjectElements: (projectId?: string) => void
  projectProducts: ProjectProduct[]
  addProjectProduct: (row: Omit<ProjectProduct, 'id' | 'createdAt'> & { id?: string }) => void
  removeProjectProduct: (id: string) => void
  replaceProjectProducts: (projectId: string, rows: ProjectProduct[]) => void
  updateProjectProduct: (next: ProjectProduct) => void
  standardSeriesTemplates: StandardSeriesTemplate[]
  addStandardSeriesTemplate: (row: Omit<StandardSeriesTemplate, 'id' | 'updatedAt'> & { id?: string }) => void
  updateStandardSeriesTemplate: (next: StandardSeriesTemplate) => void
  removeStandardSeriesTemplate: (id: string) => void
  instantiateStandardTemplateToProject: (
    projectId: string,
    templateId: string,
    overrides?: { code?: string; name?: string },
  ) => void

  // --- Sistem kataloğu (admin tarafından düzenlenebilir; mock + localStorage)
  elementTypesData: ElementTypeCatalogEntry[]
  addElementType: (row: ElementTypeCatalogEntry) => void
  updateElementType: (row: ElementTypeCatalogEntry) => void
  removeElementType: (id: string) => void
  typologiesData: Typology[]
  addTypology: (row: Typology) => void
  updateTypology: (row: Typology) => void
  removeTypology: (id: string) => void
  dimensionsData: IdentifyingDimension[]
  addDimension: (row: IdentifyingDimension) => void
  updateDimension: (row: IdentifyingDimension) => void
  removeDimension: (id: string) => void
  sizeFormatsData: SizeFormat[]
  addSizeFormat: (row: SizeFormat) => void
  updateSizeFormat: (row: SizeFormat) => void
  removeSizeFormat: (id: string) => void
  ifcMappingRulesData: IfcMappingRule[]
  addIfcMappingRule: (row: IfcMappingRule) => void
  updateIfcMappingRule: (row: IfcMappingRule) => void
  removeIfcMappingRule: (id: string) => void
}

export const ElementIdentityContext = createContext<ElementIdentityContextValue | null>(null)

export function useElementIdentity(): ElementIdentityContextValue {
  const ctx = useContext(ElementIdentityContext)
  if (!ctx) {
    throw new Error('useElementIdentity must be used within ElementIdentityProvider')
  }
  return ctx
}
