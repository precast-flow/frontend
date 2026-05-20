import type { DashboardDoc, ResponsiveLayouts, WidgetInstance } from './types'

export type DashboardEditSnapshot = {
  widgets: WidgetInstance[]
  layouts: ResponsiveLayouts
}

const MAX_STACK = 50

export function cloneSnapshot(doc: DashboardDoc): DashboardEditSnapshot {
  return {
    widgets: doc.widgets.map((w) => ({ ...w, settings: { ...w.settings } })),
    layouts: cloneLayouts(doc.layouts),
  }
}

function cloneLayouts(layouts: ResponsiveLayouts): ResponsiveLayouts {
  const out: ResponsiveLayouts = {}
  for (const [bp, items] of Object.entries(layouts)) {
    out[bp] = items?.map((item) => ({ ...item })) ?? []
  }
  return out
}

export function applySnapshot(doc: DashboardDoc, snap: DashboardEditSnapshot): DashboardDoc {
  return {
    ...doc,
    widgets: snap.widgets.map((w) => ({ ...w, settings: { ...w.settings } })),
    layouts: cloneLayouts(snap.layouts),
    updatedAt: Date.now(),
  }
}

export type DashboardHistoryStacks = {
  past: DashboardEditSnapshot[]
  future: DashboardEditSnapshot[]
}

export function createHistoryStacks(): DashboardHistoryStacks {
  return { past: [], future: [] }
}

export function pushHistoryStack(
  stacks: DashboardHistoryStacks,
  snap: DashboardEditSnapshot,
): DashboardHistoryStacks {
  const past = [...stacks.past, snap]
  if (past.length > MAX_STACK) past.shift()
  return { past, future: [] }
}

export function undoStack(stacks: DashboardHistoryStacks, current: DashboardEditSnapshot) {
  if (stacks.past.length === 0) return null
  const past = [...stacks.past]
  const prev = past.pop()!
  return {
    stacks: { past, future: [current, ...stacks.future] },
    snapshot: prev,
  }
}

export function redoStack(stacks: DashboardHistoryStacks, current: DashboardEditSnapshot) {
  if (stacks.future.length === 0) return null
  const future = [...stacks.future]
  const next = future.shift()!
  return {
    stacks: { past: [...stacks.past, current], future },
    snapshot: next,
  }
}
