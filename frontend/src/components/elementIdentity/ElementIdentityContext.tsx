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
  loadTemplates,
  saveActiveFirmId,
  saveCounters,
  saveFirms,
  saveOverrides,
  saveProjectElements,
  saveTemplates,
} from '../../elementIdentity/firm/storage'
import { MOCK_FIRMS, MOCK_PROJECTS } from '../../elementIdentity/firm/mockFirms'
import type {
  FirmCodeOverride,
  FirmNamingTemplate,
  FirmProfile,
  ProjectElement,
  ProjectSequenceCounter,
} from '../../elementIdentity/types'
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
  const [activeProjectId, setActiveProjectId] = useState<string>(MOCK_PROJECTS[0].id)
  const [overrideTemplateId, setOverrideTemplateId] = useState<string | null>(null)

  useEffect(() => saveFirms(firms), [firms])
  useEffect(() => saveTemplates(templates), [templates])
  useEffect(() => saveOverrides(overrides), [overrides])
  useEffect(() => saveActiveFirmId(activeFirmId), [activeFirmId])
  useEffect(() => saveProjectElements(projectElements), [projectElements])
  useEffect(() => saveCounters(counters), [counters])

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

  const value: ElementIdentityContextValue = {
    firms,
    activeFirmId,
    setActiveFirmId,
    activeFirm,
    templates,
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
  }

  return (
    <ElementIdentityContext.Provider value={value}>{children}</ElementIdentityContext.Provider>
  )
}
