import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  allocateSequence,
  loadActiveFirmId,
  loadCounters,
  loadFirms,
  loadOverrides,
  loadProjectElements,
  loadProjectProducts,
  loadStandardSeriesTemplates,
  loadTemplates,
  saveActiveFirmId,
  saveCounters,
  saveFirms,
  saveOverrides,
  saveProjectElements,
  saveProjectProducts,
  saveStandardSeriesTemplates,
  saveTemplates,
} from '../../elementIdentity/firm/storage'
import { MOCK_FIRMS, MOCK_PROJECTS } from '../../elementIdentity/firm/mockFirms'
import type {
  FirmCodeOverride,
  FirmNamingTemplate,
  FirmProfile,
  ProjectElement,
  ProjectProduct,
  ProjectSequenceCounter,
  StandardSeriesTemplate,
} from '../../elementIdentity/types'
import { buildProjectProductFromTemplate } from '../../standardSeriesCatalog/instantiateTemplate'
import {
  ElementIdentityContext,
  type ElementIdentityContextValue,
} from './elementIdentityContextValue'

export function ElementIdentityProvider({ children }: { children: ReactNode }) {
  const [firms, setFirms] = useState<FirmProfile[]>(() => loadFirms())
  const [templates, setTemplates] = useState<FirmNamingTemplate[]>(() => loadTemplates())
  const [overrides, setOverrides] = useState<FirmCodeOverride[]>(() => loadOverrides())
  const [activeFirmId, setActiveFirmIdState] = useState<string>(() =>
    loadActiveFirmId(MOCK_FIRMS[0].id),
  )
  const [projectElements, setProjectElements] = useState<ProjectElement[]>(() =>
    loadProjectElements(),
  )
  const [counters, setCounters] = useState<ProjectSequenceCounter[]>(() => loadCounters())
  const [projectProducts, setProjectProducts] = useState<ProjectProduct[]>(() => loadProjectProducts())
  const [standardSeriesTemplates, setStandardSeriesTemplates] = useState<StandardSeriesTemplate[]>(() =>
    loadStandardSeriesTemplates(loadActiveFirmId(MOCK_FIRMS[0].id)),
  )
  const [activeProjectId, setActiveProjectId] = useState<string>(MOCK_PROJECTS[0]?.id ?? '')
  const [overrideTemplateId, setOverrideTemplateId] = useState<string | null>(null)

  useEffect(() => saveFirms(firms), [firms])
  useEffect(() => saveTemplates(templates), [templates])
  useEffect(() => saveOverrides(overrides), [overrides])
  useEffect(() => saveActiveFirmId(activeFirmId), [activeFirmId])
  useEffect(() => saveProjectElements(projectElements), [projectElements])
  useEffect(() => saveCounters(counters), [counters])
  useEffect(() => saveProjectProducts(projectProducts), [projectProducts])
  useEffect(() => saveStandardSeriesTemplates(standardSeriesTemplates), [standardSeriesTemplates])

  const activeFirm = useMemo<FirmProfile>(() => {
    return firms.find((f) => f.id === activeFirmId) ?? firms[0]
  }, [firms, activeFirmId])

  const firmTemplates = useMemo(
    () => templates.filter((t) => t.firmId === activeFirm.id),
    [templates, activeFirm.id],
  )

  const activeTemplate = useMemo<FirmNamingTemplate>(() => {
    if (overrideTemplateId) {
      const hit = templates.find((t) => t.id === overrideTemplateId)
      if (hit) return hit
    }
    return (
      firmTemplates.find((t) => t.id === activeFirm.defaultTemplateId) ??
      firmTemplates[0] ??
      templates[0]
    )
  }, [templates, firmTemplates, activeFirm.defaultTemplateId, overrideTemplateId])

  const setActiveFirmId = useCallback((id: string) => {
    setActiveFirmIdState(id)
    setOverrideTemplateId(null)
  }, [])

  const setActiveTemplateId = useCallback((id: string) => {
    setOverrideTemplateId(id)
  }, [])

  const activeProject = useMemo(
    () => MOCK_PROJECTS.find((p) => p.id === activeProjectId) ?? MOCK_PROJECTS[0],
    [activeProjectId],
  )

  const upsertOverride = useCallback((ov: FirmCodeOverride) => {
    setOverrides((prev) => {
      const idx = prev.findIndex((p) => p.id === ov.id)
      if (idx === -1) return [...prev, ov]
      const next = [...prev]
      next[idx] = ov
      return next
    })
  }, [])

  const removeOverride = useCallback((id: string) => {
    setOverrides((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updateTemplate = useCallback((next: FirmNamingTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === next.id ? next : t)))
  }, [])

  const addTemplate = useCallback((next: FirmNamingTemplate) => {
    setTemplates((prev) => [...prev, next])
  }, [])

  const updateFirm = useCallback((next: FirmProfile) => {
    setFirms((prev) => prev.map((f) => (f.id === next.id ? next : f)))
  }, [])

  const allocateNextSequence = useCallback(
    (projectId: string, scopeKey: string): number => {
      let nextValue = 1
      setCounters((prev) => {
        const alloc = allocateSequence(prev, projectId, scopeKey)
        nextValue = alloc.next
        return alloc.counters
      })
      return nextValue
    },
    [],
  )

  const addProjectElements = useCallback((els: ProjectElement[]) => {
    setProjectElements((prev) => [...prev, ...els])
  }, [])

  const removeProjectElement = useCallback((id: string) => {
    setProjectElements((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clearProjectElements = useCallback((projectId?: string) => {
    setProjectElements((prev) =>
      projectId ? prev.filter((p) => p.projectId !== projectId) : [],
    )
    setCounters((prev) =>
      projectId ? prev.filter((c) => c.projectId !== projectId) : [],
    )
  }, [])

  const addProjectProduct = useCallback((row: Omit<ProjectProduct, 'id' | 'createdAt'> & { id?: string }) => {
    const id = row.id ?? `prd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const createdAt = new Date().toISOString()
    const next: ProjectProduct = {
      ...row,
      id,
      createdAt,
      status: row.status ?? 'active',
      revision: row.revision ?? 1,
    }
    setProjectProducts((prev) => [...prev, next])
  }, [])

  const removeProjectProduct = useCallback((id: string) => {
    setProjectProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const replaceProjectProducts = useCallback((projectId: string, rows: ProjectProduct[]) => {
    setProjectProducts((prev) => [...prev.filter((p) => p.projectId !== projectId), ...rows])
  }, [])

  const updateProjectProduct = useCallback((next: ProjectProduct) => {
    setProjectProducts((prev) => prev.map((p) => (p.id === next.id ? next : p)))
  }, [])

  const addStandardSeriesTemplate = useCallback(
    (row: Omit<StandardSeriesTemplate, 'id' | 'updatedAt'> & { id?: string }) => {
      const id = row.id ?? `sst-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const updatedAt = new Date().toISOString()
      const next: StandardSeriesTemplate = {
        ...row,
        id,
        firmId: row.firmId || activeFirm.id,
        updatedAt,
      }
      setStandardSeriesTemplates((prev) => [...prev, next])
    },
    [activeFirm.id],
  )

  const updateStandardSeriesTemplate = useCallback((next: StandardSeriesTemplate) => {
    setStandardSeriesTemplates((prev) =>
      prev.map((t) => (t.id === next.id ? { ...next, updatedAt: new Date().toISOString() } : t)),
    )
  }, [])

  const removeStandardSeriesTemplate = useCallback((id: string) => {
    setStandardSeriesTemplates((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const instantiateStandardTemplateToProject = useCallback(
    (projectId: string, templateId: string, overrides?: { code?: string; name?: string }) => {
      const template = standardSeriesTemplates.find((t) => t.id === templateId)
      if (!template) return
      addProjectProduct(buildProjectProductFromTemplate(template, projectId, overrides ?? {}))
    },
    [standardSeriesTemplates, addProjectProduct],
  )

  const value: ElementIdentityContextValue = {
    firms,
    activeFirmId,
    setActiveFirmId,
    activeFirm,
    templates,
    firmTemplates,
    activeTemplate,
    setActiveTemplateId,
    overrides,
    projects: MOCK_PROJECTS,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    projectElements,
    counters,
    upsertOverride,
    removeOverride,
    updateTemplate,
    addTemplate,
    updateFirm,
    addProjectElements,
    allocateNextSequence,
    removeProjectElement,
    clearProjectElements,
    projectProducts,
    addProjectProduct,
    removeProjectProduct,
    replaceProjectProducts,
    updateProjectProduct,
    standardSeriesTemplates,
    addStandardSeriesTemplate,
    updateStandardSeriesTemplate,
    removeStandardSeriesTemplate,
    instantiateStandardTemplateToProject,
  }

  return (
    <ElementIdentityContext.Provider value={value}>{children}</ElementIdentityContext.Provider>
  )
}
