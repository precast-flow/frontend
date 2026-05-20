import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  createDashboardFromTemplate,
  createDefaultDashboard,
  createEmptyDashboard,
  DASHBOARD_STORAGE_KEY,
  layoutItemAt,
  layoutsFromLg,
  nextWidgetLayout,
  type DashboardTemplateId,
} from '../components/dashboard/dashboardDefaults'
import {
  applySnapshot,
  cloneSnapshot,
  createHistoryStacks,
  pushHistoryStack,
  redoStack,
  undoStack,
  type DashboardHistoryStacks,
} from '../components/dashboard/dashboardHistory'
import { catalogEntryFor } from '../components/dashboard/widgetCatalog'
import type {
  DashboardDoc,
  DashboardPersistedState,
  ResponsiveLayouts,
  WidgetInstance,
  WidgetSettings,
  WidgetType,
} from '../components/dashboard/types'

type PatchOptions = { skipHistory?: boolean }

type DashboardContextValue = {
  dashboards: DashboardDoc[]
  activeDashboard: DashboardDoc | null
  activeDashboardId: string
  editMode: boolean
  setEditMode: (v: boolean) => void
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  beginLayoutGesture: () => void
  endLayoutGesture: () => void
  beginSettingsSession: () => void
  selectDashboard: (id: string) => void
  addDashboard: (name?: string) => void
  addDashboardFromTemplate: (templateId: DashboardTemplateId, name?: string) => void
  duplicateDashboard: (id: string) => void
  renameDashboard: (id: string, name: string) => void
  deleteDashboard: (id: string) => void
  addWidget: (
    type: WidgetType,
    opts?: {
      position?: { x: number; y: number }
      size?: { w: number; h: number }
    },
  ) => void
  removeWidget: (widgetId: string) => void
  updateWidgetSettings: (widgetId: string, patch: Partial<WidgetSettings>, opts?: PatchOptions) => void
  setLayouts: (layouts: ResponsiveLayouts, opts?: PatchOptions) => void
  settingsWidgetId: string | null
  setSettingsWidgetId: (id: string | null) => void
  catalogOpen: boolean
  setCatalogOpen: (open: boolean) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

function readPersisted(): DashboardPersistedState | null {
  try {
    const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DashboardPersistedState
  } catch {
    return null
  }
}

function writePersisted(state: DashboardPersistedState) {
  try {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function cloneLayouts(layouts: ResponsiveLayouts): ResponsiveLayouts {
  const out: ResponsiveLayouts = {}
  for (const [bp, items] of Object.entries(layouts)) {
    out[bp] = items?.map((item) => ({ ...item })) ?? []
  }
  return out
}

function getInitialDashboardState(): DashboardPersistedState {
  const stored = readPersisted()
  if (stored?.dashboards?.length) {
    const activeId =
      stored.activeDashboardId && stored.dashboards.some((d) => d.id === stored.activeDashboardId)
        ? stored.activeDashboardId
        : stored.dashboards[0]!.id
    return { dashboards: stored.dashboards, activeDashboardId: activeId }
  }
  const defaultDoc = createDefaultDashboard()
  return { dashboards: [defaultDoc], activeDashboardId: defaultDoc.id }
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => getInitialDashboardState(), [])
  const [dashboards, setDashboards] = useState<DashboardDoc[]>(initial.dashboards)
  const [activeDashboardId, setActiveDashboardId] = useState(initial.activeDashboardId)
  const [editMode, setEditMode] = useState(false)
  const [settingsWidgetId, setSettingsWidgetId] = useState<string | null>(null)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [historyTick, setHistoryTick] = useState(0)

  const historyMapRef = useRef<Record<string, DashboardHistoryStacks>>({})
  const skipHistoryRef = useRef(false)
  const layoutGestureRecordedRef = useRef(false)
  const settingsSessionRecordedRef = useRef(false)

  useEffect(() => {
    writePersisted({ dashboards, activeDashboardId })
  }, [dashboards, activeDashboardId])

  const activeDashboard = useMemo(
    () => dashboards.find((d) => d.id === activeDashboardId) ?? dashboards[0] ?? null,
    [dashboards, activeDashboardId],
  )

  const stacks = activeDashboard
    ? (historyMapRef.current[activeDashboard.id] ?? createHistoryStacks())
    : createHistoryStacks()

  const canUndo = stacks.past.length > 0
  const canRedo = stacks.future.length > 0

  const bumpHistory = useCallback(() => setHistoryTick((n) => n + 1), [])

  const recordHistory = useCallback(
    (doc: DashboardDoc) => {
      if (skipHistoryRef.current) return
      const id = doc.id
      const current = historyMapRef.current[id] ?? createHistoryStacks()
      historyMapRef.current[id] = pushHistoryStack(current, cloneSnapshot(doc))
      bumpHistory()
    },
    [bumpHistory],
  )

  const patchActive = useCallback(
    (fn: (doc: DashboardDoc) => DashboardDoc, opts?: PatchOptions) => {
      setDashboards((prev) =>
        prev.map((d) => {
          if (d.id !== activeDashboardId) return d
          if (!opts?.skipHistory) recordHistory(d)
          return fn(d)
        }),
      )
    },
    [activeDashboardId, recordHistory],
  )

  const applyHistorySnapshot = useCallback(
    (snap: ReturnType<typeof cloneSnapshot>) => {
      skipHistoryRef.current = true
      patchActive((doc) => applySnapshot(doc, snap), { skipHistory: true })
      skipHistoryRef.current = false
      bumpHistory()
    },
    [patchActive, bumpHistory],
  )

  const undo = useCallback(() => {
    const doc = dashboards.find((d) => d.id === activeDashboardId)
    if (!doc) return
    const id = doc.id
    const currentStacks = historyMapRef.current[id] ?? createHistoryStacks()
    const result = undoStack(currentStacks, cloneSnapshot(doc))
    if (!result) return
    historyMapRef.current[id] = result.stacks
    applyHistorySnapshot(result.snapshot)
  }, [dashboards, activeDashboardId, applyHistorySnapshot])

  const redo = useCallback(() => {
    const doc = dashboards.find((d) => d.id === activeDashboardId)
    if (!doc) return
    const id = doc.id
    const currentStacks = historyMapRef.current[id] ?? createHistoryStacks()
    const result = redoStack(currentStacks, cloneSnapshot(doc))
    if (!result) return
    historyMapRef.current[id] = result.stacks
    applyHistorySnapshot(result.snapshot)
  }, [dashboards, activeDashboardId, applyHistorySnapshot])

  const beginLayoutGesture = useCallback(() => {
    if (layoutGestureRecordedRef.current) return
    const doc = dashboards.find((d) => d.id === activeDashboardId)
    if (doc) {
      recordHistory(doc)
      layoutGestureRecordedRef.current = true
    }
  }, [dashboards, activeDashboardId, recordHistory])

  const endLayoutGesture = useCallback(() => {
    layoutGestureRecordedRef.current = false
  }, [])

  const beginSettingsSession = useCallback(() => {
    if (settingsSessionRecordedRef.current) return
    const doc = dashboards.find((d) => d.id === activeDashboardId)
    if (doc) {
      recordHistory(doc)
      settingsSessionRecordedRef.current = true
    }
  }, [dashboards, activeDashboardId, recordHistory])

  useEffect(() => {
    if (!settingsWidgetId) settingsSessionRecordedRef.current = false
  }, [settingsWidgetId])

  const selectDashboard = useCallback((id: string) => {
    setActiveDashboardId(id)
    setSettingsWidgetId(null)
  }, [])

  const addDashboard = useCallback((name?: string) => {
    const doc = createEmptyDashboard(name ?? `Pano ${dashboards.length + 1}`)
    historyMapRef.current[doc.id] = createHistoryStacks()
    setDashboards((prev) => [...prev, doc])
    setActiveDashboardId(doc.id)
  }, [dashboards.length])

  const addDashboardFromTemplate = useCallback(
    (templateId: DashboardTemplateId, name?: string) => {
      const doc = createDashboardFromTemplate(templateId, name ?? `Pano ${dashboards.length + 1}`)
      historyMapRef.current[doc.id] = createHistoryStacks()
      setDashboards((prev) => [...prev, doc])
      setActiveDashboardId(doc.id)
    },
    [dashboards.length],
  )

  const duplicateDashboard = useCallback((id: string) => {
    const source = dashboards.find((d) => d.id === id)
    if (!source) return
    const newId = `dash-${crypto.randomUUID().slice(0, 8)}`
    const widgetIdMap = new Map<string, string>()
    const widgets = source.widgets.map((w) => {
      const newWid = `w-${crypto.randomUUID().slice(0, 8)}`
      widgetIdMap.set(w.id, newWid)
      return { ...w, id: newWid }
    })
    const layouts = cloneLayouts(source.layouts)
    for (const bp of Object.keys(layouts)) {
      layouts[bp] = layouts[bp]?.map((item) => ({
        ...item,
        i: widgetIdMap.get(item.i) ?? item.i,
      }))
    }
    const copy: DashboardDoc = {
      id: newId,
      name: `${source.name} (kopya)`,
      widgets,
      layouts,
      updatedAt: Date.now(),
    }
    historyMapRef.current[newId] = createHistoryStacks()
    setDashboards((prev) => [...prev, copy])
    setActiveDashboardId(newId)
  }, [dashboards])

  const renameDashboard = useCallback((id: string, name: string) => {
    setDashboards((prev) =>
      prev.map((d) => (d.id === id ? { ...d, name: name.trim() || d.name, updatedAt: Date.now() } : d)),
    )
  }, [])

  const deleteDashboard = useCallback((id: string) => {
    setDashboards((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.filter((d) => d.id !== id)
      delete historyMapRef.current[id]
      if (activeDashboardId === id) {
        setActiveDashboardId(next[0]!.id)
      }
      return next
    })
  }, [activeDashboardId])

  const addWidget = useCallback(
    (
      type: WidgetType,
      opts?: {
        position?: { x: number; y: number }
        size?: { w: number; h: number }
      },
    ) => {
      const entry = catalogEntryFor(type)
      if (entry.comingSoon) return
      const w = opts?.size?.w ?? entry.defaultW
      const h = opts?.size?.h ?? entry.defaultH
      const widgetId = `w-${crypto.randomUUID().slice(0, 8)}`
      const widget: WidgetInstance = {
        id: widgetId,
        type,
        settings: { ...(entry.defaultSettings ?? {}) },
      }
      patchActive((doc) => {
        const lg = [...(doc.layouts.lg ?? [])]
        const newItem = opts?.position
          ? layoutItemAt(
              widgetId,
              opts.position.x,
              opts.position.y,
              w,
              h,
              12,
              entry.minW ?? 2,
              entry.minH ?? 2,
            )
          : nextWidgetLayout(lg, widgetId, w, h, entry.minW ?? 2, entry.minH ?? 2)
        const nextLg = [...lg, newItem]
        return {
          ...doc,
          widgets: [...doc.widgets, widget],
          layouts: layoutsFromLg(nextLg),
        }
      })
    },
    [patchActive],
  )

  const removeWidget = useCallback(
    (widgetId: string) => {
      patchActive((doc) => {
        const layouts: ResponsiveLayouts = {}
        for (const [bp, items] of Object.entries(doc.layouts)) {
          layouts[bp] = items?.filter((item) => item.i !== widgetId) ?? []
        }
        return {
          ...doc,
          widgets: doc.widgets.filter((w) => w.id !== widgetId),
          layouts,
        }
      })
      if (settingsWidgetId === widgetId) setSettingsWidgetId(null)
    },
    [patchActive, settingsWidgetId],
  )

  const updateWidgetSettings = useCallback(
    (widgetId: string, patch: Partial<WidgetSettings>, opts?: PatchOptions) => {
      patchActive(
        (doc) => ({
          ...doc,
          widgets: doc.widgets.map((w) =>
            w.id === widgetId ? { ...w, settings: { ...w.settings, ...patch } } : w,
          ),
        }),
        opts,
      )
    },
    [patchActive],
  )

  const setLayouts = useCallback(
    (layouts: ResponsiveLayouts, opts?: PatchOptions) => {
      patchActive((doc) => ({ ...doc, layouts }), opts)
    },
    [patchActive],
  )

  const value = useMemo(
    (): DashboardContextValue => ({
      dashboards,
      activeDashboard,
      activeDashboardId,
      editMode,
      setEditMode,
      canUndo,
      canRedo,
      undo,
      redo,
      beginLayoutGesture,
      endLayoutGesture,
      beginSettingsSession,
      selectDashboard,
      addDashboard,
      addDashboardFromTemplate,
      duplicateDashboard,
      renameDashboard,
      deleteDashboard,
      addWidget,
      removeWidget,
      updateWidgetSettings,
      setLayouts,
      settingsWidgetId,
      setSettingsWidgetId,
      catalogOpen,
      setCatalogOpen,
    }),
    [
      dashboards,
      activeDashboard,
      activeDashboardId,
      editMode,
      canUndo,
      canRedo,
      undo,
      redo,
      beginLayoutGesture,
      endLayoutGesture,
      beginSettingsSession,
      selectDashboard,
      addDashboard,
      addDashboardFromTemplate,
      duplicateDashboard,
      renameDashboard,
      deleteDashboard,
      addWidget,
      removeWidget,
      updateWidgetSettings,
      setLayouts,
      settingsWidgetId,
      catalogOpen,
      historyTick,
    ],
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
