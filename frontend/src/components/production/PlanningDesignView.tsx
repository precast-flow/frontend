import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  GripVertical,
  PauseCircle,
  PlayCircle,
  History,
  Redo2,
  Save,
  Send,
  Trash2,
  Undo2,
  Wrench,
  X,
  XCircle,
} from 'lucide-react'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import { useProductionRolePreviewOptional } from '../../context/ProductionRolePreviewContext'
import { useI18n } from '../../i18n/I18nProvider'
import { getRoleMatrixRow } from '../../data/productionRoleMatrixMock'
import {
  CONCRETE_RECIPES_MOCK,
  INITIAL_PLAN_ITEMS,
  PLANNING_MOLDS,
  PLANNING_SHIFTS,
  QUEUE_MOCK,
  STATUS_META,
  ZOOM_PRESETS,
  buildNDays,
  hourToShiftIndexUtc,
  isoFromSlotVisible,
  itemsOverlapSlotRange,
  mondayOfWeekUtc,
  spanSlotsFromDuration,
  type PlanItem,
  type PlanningDay,
  type PlanStatusKey,
} from '../../data/planningDesignMock'

const SHIFT_SHORT = ['S', 'Ö', 'G'] as const

const MAX_PLAN_CHECKPOINTS = 48

type PlanCheckpoint = {
  id: string
  items: PlanItem[]
  label: string
  note?: string
  atMs: number
}

function clonePlanItems(xs: PlanItem[]): PlanItem[] {
  return xs.map((x) => ({ ...x }))
}

function planItemsEqual(a: PlanItem[], b: PlanItem[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false
  }
  return true
}

/** Sol kalıp etiket sütunu — yatay kaydırmada sabit kalır. */
const MOLD_COL_PX = 200
/** Kartın minimum yüksekliği (minHeight ile aynı). */
const CELL_ROW_HEIGHT_PX = 56
/** Boş / tek katman satır için taban (hücre + etiket). */
const BODY_ROW_BASE_MIN = CELL_ROW_HEIGHT_PX

function makeThumbDataUri(label: string, a: string, b: string): string {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='240' height='120' viewBox='0 0 240 120'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${a}'/>
        <stop offset='1' stop-color='${b}'/>
      </linearGradient>
    </defs>
    <rect x='6' y='6' width='228' height='108' rx='18' fill='url(#g)'/>
    <path d='M18 86 C 55 58, 90 96, 126 70 S 195 66, 222 44' fill='none' stroke='rgba(255,255,255,0.55)' stroke-width='3' stroke-linecap='round'/>
    <text x='120' y='60' text-anchor='middle' dominant-baseline='middle'
      font-family='ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial'
      font-size='18' font-weight='800' fill='rgba(255,255,255,0.95)'>${label}</text>
    <text x='120' y='84' text-anchor='middle'
      font-family='ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial'
      font-size='10' font-weight='600' fill='rgba(255,255,255,0.85)'>örnek</text>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const PRODUCT_SAMPLE_THUMBS = [
  makeThumbDataUri('DW', '#4f46e5', '#0ea5e9'),
  makeThumbDataUri('PR', '#f97316', '#f43f5e'),
  makeThumbDataUri('K', '#16a34a', '#84cc16'),
  makeThumbDataUri('PL', '#111827', '#6b7280'),
  makeThumbDataUri('OS', '#7c3aed', '#06b6d4'),
] as const

function statusIcon(key: PlanStatusKey) {
  const meta = STATUS_META[key]
  const cls = 'h-3.5 w-3.5 shrink-0'
  switch (meta.icon) {
    case 'calendar':
      return <Calendar className={cls} aria-hidden />
    case 'blueprint':
      return <FileText className={cls} aria-hidden />
    case 'play':
      return <PlayCircle className={cls} aria-hidden />
    case 'check':
      return <CheckCircle2 className={cls} aria-hidden />
    case 'pause':
      return <PauseCircle className={cls} aria-hidden />
    case 'wrench':
      return <Wrench className={cls} aria-hidden />
    case 'x':
      return <XCircle className={cls} aria-hidden />
    case 'trash':
      return <Trash2 className={cls} aria-hidden />
    default:
      return <Calendar className={cls} aria-hidden />
  }
}

export function PlanningDesignView() {
  const { t } = useI18n()
  const preview = useProductionRolePreviewOptional()
  const matrixRow = preview?.previewRoleId ? getRoleMatrixRow(preview.previewRoleId) : null
  const canEdit = !matrixRow || matrixRow.editIds.includes('planning-design')

  const [weekStartMonday, setWeekStartMonday] = useState(() =>
    mondayOfWeekUtc(new Date('2026-03-24T12:00:00.000Z')),
  )
  const [dayCount] = useState(14)
  const [zoom, setZoom] = useState(55)
  const [workdaysOnly, setWorkdaysOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [draftState, setDraftState] = useState<'draft' | 'published'>('draft')
  const [items, setItems] = useState<PlanItem[]>(() => INITIAL_PLAN_ITEMS.map((x) => ({ ...x })))
  const [planHistory, setPlanHistory] = useState<{
    checkpoints: PlanCheckpoint[]
    cursor: number
  }>(() => ({
    checkpoints: [
      {
        id: 'cp-init',
        items: clonePlanItems(INITIAL_PLAN_ITEMS),
        label: 'Başlangıç',
        atMs: Date.now(),
      },
    ],
    cursor: 0,
  }))
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false)

  const [dragId, setDragId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ moldId: string; slot: number } | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dayDetailDate, setDayDetailDate] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    itemId: string
    moldId: string
  } | null>(null)
  /** Kaydır alt menüsü kök panelin içinde değil (body’de kardeş fixed) — backdrop sayfayı örnekler. */
  const [shiftSubmenuOpen, setShiftSubmenuOpen] = useState(false)
  const [shiftSubmenuPos, setShiftSubmenuPos] = useState<{ left: number; top: number } | null>(null)
  const contextShiftAnchorRef = useRef<HTMLDivElement>(null)
  const shiftCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [queueOpen, setQueueOpen] = useState(true)
  const [assignOpen, setAssignOpen] = useState<{ moldId: string; slot: number } | null>(null)
  const [nonProdModal, setNonProdModal] = useState<{ moldId: string; slot: number; itemId: string } | null>(
    null,
  )
  const planningAssignMockTitleId = useId()
  const planningNonProdMockTitleId = useId()

  const [statusFilter, setStatusFilter] = useState<PlanStatusKey[]>([])
  const [moldFilter, setMoldFilter] = useState<string[]>([])

  const gridScrollRef = useRef<HTMLDivElement>(null)

  const activePlanningFilterCount = useMemo(
    () =>
      moldFilter.length +
      statusFilter.length +
      (search.trim() ? 1 : 0) +
      (workdaysOnly ? 1 : 0),
    [moldFilter, statusFilter, search, workdaysOnly],
  )

  const itemsRef = useRef(items)
  const planHistoryRef = useRef(planHistory)
  useEffect(() => {
    itemsRef.current = items
  }, [items])
  useEffect(() => {
    planHistoryRef.current = planHistory
  }, [planHistory])

  const updateShiftSubmenuPos = useCallback(() => {
    const el = contextShiftAnchorRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setShiftSubmenuPos({ left: r.right + 4, top: r.top })
  }, [])

  const cancelShiftClose = useCallback(() => {
    if (shiftCloseTimerRef.current) {
      clearTimeout(shiftCloseTimerRef.current)
      shiftCloseTimerRef.current = null
    }
  }, [])

  const scheduleShiftClose = useCallback(() => {
    cancelShiftClose()
    shiftCloseTimerRef.current = setTimeout(() => setShiftSubmenuOpen(false), 180)
  }, [cancelShiftClose])

  const onShiftRowEnter = useCallback(() => {
    cancelShiftClose()
    setShiftSubmenuOpen(true)
    queueMicrotask(() => updateShiftSubmenuPos())
  }, [cancelShiftClose, updateShiftSubmenuPos])

  const onShiftRowLeave = useCallback(() => {
    scheduleShiftClose()
  }, [scheduleShiftClose])

  useLayoutEffect(() => {
    if (!contextMenu || !shiftSubmenuOpen) return
    updateShiftSubmenuPos()
  }, [contextMenu, shiftSubmenuOpen, updateShiftSubmenuPos])

  useEffect(() => {
    if (!contextMenu) {
      setShiftSubmenuOpen(false)
      setShiftSubmenuPos(null)
    }
  }, [contextMenu])

  useEffect(() => {
    if (!contextMenu || !shiftSubmenuOpen) return
    const onScrollOrResize = () => updateShiftSubmenuPos()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [contextMenu, shiftSubmenuOpen, updateShiftSubmenuPos])

  const daysFull = useMemo(() => buildNDays(weekStartMonday, dayCount), [weekStartMonday, dayCount])
  const visibleDays: PlanningDay[] = useMemo(
    () => (workdaysOnly ? daysFull.filter((d) => !d.isNonProduction) : daysFull),
    [daysFull, workdaysOnly],
  )

  const totalSlots = visibleDays.length * PLANNING_SHIFTS.length
  const minShiftPx = Math.min(...ZOOM_PRESETS.map((p) => p.minShiftColumnPx))
  const colW = Math.max(minShiftPx * 0.35, 22 + Math.round((zoom / 100) * 78))
  const headerFontClass = zoom < 36 ? 'text-[9px]' : zoom < 50 ? 'text-[10px]' : 'text-xs'
  const shiftCompact = colW < 44

  const slotIndexForItem = useCallback(
    (iso: string) => {
      const t = new Date(iso)
      const isoDate = t.toISOString().slice(0, 10)
      const dayIdx = visibleDays.findIndex((d) => d.date === isoDate)
      if (dayIdx < 0) return -1
      const shift = hourToShiftIndexUtc(t.getUTCHours())
      return dayIdx * PLANNING_SHIFTS.length + shift
    },
    [visibleDays],
  )

  const placementByItem = useMemo(() => {
    const map = new Map<
      string,
      { slotStart: number; span: number; moldId: string; visible: boolean }
    >()
    for (const it of items) {
      const slotStart = slotIndexForItem(it.startAt)
      const span = Math.min(spanSlotsFromDuration(it.durationHours), totalSlots)
      const visible = slotStart >= 0 && slotStart < totalSlots
      map.set(it.id, {
        slotStart: visible ? slotStart : -1,
        span: visible ? Math.min(span, totalSlots - slotStart) : 0,
        moldId: it.moldId,
        visible,
      })
    }
    return map
  }, [items, slotIndexForItem, totalSlots])

  const capacityIssue = useMemo(() => {
    const bad = new Set<string>()
    const mold = new Map(PLANNING_MOLDS.map((m) => [m.moldId, m]))
    for (const it of items) {
      const meta = mold.get(it.moldId)
      if (!meta) continue
      const slotStart = slotIndexForItem(it.startAt)
      const span = Math.min(spanSlotsFromDuration(it.durationHours), totalSlots)
      if (slotStart < 0) continue
      const concurrent = items.filter((o) => {
        if (o.moldId !== it.moldId || o.id === it.id) return false
        const oStart = slotIndexForItem(o.startAt)
        const oSpan = Math.min(spanSlotsFromDuration(o.durationHours), totalSlots)
        if (oStart < 0) return false
        return itemsOverlapSlotRange(slotStart, span, oStart, oSpan)
      }).length
      if (concurrent + 1 > meta.maxConcurrent) bad.add(it.id)
    }
    return bad
  }, [items, slotIndexForItem, totalSlots])

  const filteredItems = useMemo(() => {
    let list = items
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          (it.orderId ?? '').toLowerCase().includes(q) ||
          (it.projectId ?? '').toLowerCase().includes(q),
      )
    }
    if (moldFilter.length) list = list.filter((it) => moldFilter.includes(it.moldId))
    if (statusFilter.length) list = list.filter((it) => statusFilter.includes(it.status))
    return list
  }, [items, search, moldFilter, statusFilter])

  /** maxConcurrent=1 kuralında satır yüksekliği sabit tutulur (kartlar tek hizada). */
  const moldRowHeights = useMemo(() => {
    const heights: Record<string, number> = {}
    for (const mold of PLANNING_MOLDS) {
      heights[mold.moldId] = BODY_ROW_BASE_MIN
    }
    return heights
  }, [])

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const dailyTotals = useMemo(() => {
    return visibleDays.map((d) => {
      const dayItems = items.filter((it) => it.startAt.startsWith(d.date))
      const pieces = dayItems.length
      const volumeM3 = dayItems.reduce((s, it) => s + it.estimatedVolumeM3, 0)
      const steelKg = dayItems.reduce((s, it) => s + it.estimatedSteelKg, 0)
      const warningsCount = dayItems.reduce((s, it) => s + it.warnings.length, 0)
      const moldIds = new Set(dayItems.map((i) => i.moldId))
      const riskyJobs = dayItems.filter((i) => i.priority <= 2 || i.tags.includes('priority-low')).length
      return {
        date: d.date,
        pieces,
        volumeM3,
        steelKg,
        warningsCount,
        activeMolds: moldIds.size,
        riskyJobs,
      }
    })
  }, [items, visibleDays])

  const dayDetailData = useMemo(() => {
    if (!dayDetailDate) return null
    const d = visibleDays.find((x) => x.date === dayDetailDate)
    if (!d) return null
    const dayItems = items.filter((it) => it.startAt.startsWith(dayDetailDate))
    const byMold = new Map<string, { jobCount: number; volumeM3: number }>()
    for (const m of PLANNING_MOLDS) byMold.set(m.moldId, { jobCount: 0, volumeM3: 0 })
    for (const it of dayItems) {
      const cur = byMold.get(it.moldId) ?? { jobCount: 0, volumeM3: 0 }
      cur.jobCount += 1
      cur.volumeM3 += it.estimatedVolumeM3
      byMold.set(it.moldId, cur)
    }
    const moldRows = PLANNING_MOLDS.map((m) => ({
      moldId: m.moldId,
      jobCount: byMold.get(m.moldId)?.jobCount ?? 0,
      volumeM3: byMold.get(m.moldId)?.volumeM3 ?? 0,
    })).filter((r) => r.jobCount > 0)
    const jobRows = dayItems.map((it) => {
      const slot = slotIndexForItem(it.startAt)
      const si = Math.max(0, slot % PLANNING_SHIFTS.length)
      return {
        itemId: it.id,
        title: it.title,
        shiftLabel: PLANNING_SHIFTS[si]?.label ?? '—',
        statusKey: it.status,
      }
    })
    return { day: d, moldRows, jobRows, dayItems }
  }, [dayDetailDate, items, visibleDays, slotIndexForItem])

  const appendCheckpoint = useCallback((nextItems: PlanItem[], label: string, note?: string) => {
    const cloned = clonePlanItems(nextItems)
    setPlanHistory((ph) => {
      const trimmed = ph.checkpoints.slice(0, ph.cursor + 1)
      const cp: PlanCheckpoint = {
        id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        items: clonePlanItems(cloned),
        label,
        note,
        atMs: Date.now(),
      }
      let checkpoints = [...trimmed, cp]
      if (checkpoints.length > MAX_PLAN_CHECKPOINTS) {
        checkpoints = checkpoints.slice(-MAX_PLAN_CHECKPOINTS)
      }
      return { checkpoints, cursor: checkpoints.length - 1 }
    })
    setItems(cloned)
  }, [])

  const restoreCheckpoint = useCallback((index: number) => {
    setPlanHistory((ph) => {
      if (index < 0 || index >= ph.checkpoints.length) return ph
      const nextItems = clonePlanItems(ph.checkpoints[index].items)
      setItems(nextItems)
      return { ...ph, cursor: index }
    })
  }, [])

  const updateCheckpointNote = useCallback((index: number, note: string) => {
    const trimmed = note.trim()
    setPlanHistory((ph) => {
      if (index < 0 || index >= ph.checkpoints.length) return ph
      const checkpoints = ph.checkpoints.map((c, i) =>
        i === index ? { ...c, note: trimmed || undefined } : c,
      )
      return { ...ph, checkpoints }
    })
  }, [])

  const saveDraftAndResetHistory = useCallback(() => {
    if (!canEdit) return
    const ok = window.confirm(
      'Taslağı kaydetmek istiyor musunuz? Kaydettikten sonra yerel adım geçmişi sıfırlanır; bundan sonra yalnızca bu kayıtlı plan üzerinde yeni geçmiş tutulur.',
    )
    if (!ok) return
    const snapshot = clonePlanItems(itemsRef.current)
    setDraftState('draft')
    setPlanHistory({
      checkpoints: [
        {
          id: `cp-saved-${Date.now()}`,
          items: snapshot,
          label: 'Kayıt sonrası',
          atMs: Date.now(),
        },
      ],
      cursor: 0,
    })
  }, [canEdit])

  const wouldViolateMaxConcurrent = useCallback(
    (candidateItemId: string | null, moldId: string, slotStart: number, span: number) => {
      const meta = PLANNING_MOLDS.find((m) => m.moldId === moldId)
      if (!meta) return false

      const concurrent = items
        .filter((it) => it.moldId === moldId && it.id !== candidateItemId)
        .map((it) => {
          const otherStart = slotIndexForItem(it.startAt)
          if (otherStart < 0) return null
          return { otherStart, otherSpan: spanSlotsFromDuration(it.durationHours) }
        })
        .filter((x): x is { otherStart: number; otherSpan: number } => x !== null)
        .filter(({ otherStart, otherSpan }) =>
          itemsOverlapSlotRange(slotStart, span, otherStart, otherSpan),
        ).length

      return concurrent + 1 > meta.maxConcurrent
    },
    [items, slotIndexForItem],
  )

  const shiftMoldItems = useCallback(
    (moldId: string, deltaSlots: number) => {
      if (!canEdit || deltaSlots === 0) return
      const moldItems = items.filter((it) => it.moldId === moldId)
      if (!moldItems.length) return

      const plan = moldItems.map((it) => {
        const oldSlot = slotIndexForItem(it.startAt)
        if (oldSlot < 0) return null
        const nextSlot = oldSlot + deltaSlots
        if (nextSlot < 0 || nextSlot >= totalSlots) return null
        return { itemId: it.id, nextSlot }
      })
      if (plan.some((x) => x === null)) return

      const slotById = new Map(plan.map((x) => [x!.itemId, x!.nextSlot]))
      const nextItems = items.map((it) => {
        if (it.moldId !== moldId) return it
        const nextSlot = slotById.get(it.id)
        if (nextSlot === undefined) return it
        const { startAt } = isoFromSlotVisible(visibleDays, nextSlot)
        const start = new Date(startAt)
        const end = new Date(start.getTime() + it.durationHours * 3600000)
        return { ...it, startAt: start.toISOString(), endAt: end.toISOString() }
      })
      if (planItemsEqual(nextItems, items)) return
      appendCheckpoint(
        nextItems,
        deltaSlots > 0 ? 'Hat kaydırıldı (sağa)' : 'Hat kaydırıldı (sola)',
      )
    },
    [appendCheckpoint, canEdit, items, slotIndexForItem, totalSlots, visibleDays],
  )

  const applyMove = useCallback(
    (itemId: string, moldId: string, slot: number, skipNonProdCheck?: boolean) => {
      const prev = items.find((i) => i.id === itemId)
      const { startAt, durationHours: slotDur } = isoFromSlotVisible(visibleDays, slot)
      const dur = prev?.durationHours ?? slotDur
      const span = spanSlotsFromDuration(dur)

      if (wouldViolateMaxConcurrent(itemId, moldId, slot, span)) return

      const day = visibleDays[Math.floor(slot / PLANNING_SHIFTS.length)]
      if (day?.isNonProduction && !skipNonProdCheck) {
        setNonProdModal({ moldId, slot, itemId })
        return
      }

      const start = new Date(startAt)
      const end = new Date(start.getTime() + dur * 3600000)
      const nextItems = items.map((it) =>
        it.id === itemId
          ? {
              ...it,
              moldId,
              startAt: start.toISOString(),
              endAt: end.toISOString(),
              durationHours: dur,
            }
          : it,
      )
      appendCheckpoint(nextItems, 'Plan öğesi taşındı')
    },
    [appendCheckpoint, items, visibleDays, wouldViolateMaxConcurrent],
  )

  /** Tarayıcılar çoğu zaman yalnızca text/plain taşır; özel MIME yedeklenir. */
  const readQueueIdFromDrop = (e: React.DragEvent): string | null => {
    let qid = e.dataTransfer.getData('text/plan-queue-id')
    if (qid) return qid
    const plain = e.dataTransfer.getData('text/plain')
    if (plain.startsWith('queue:')) return plain.slice('queue:'.length)
    return null
  }

  const handleDropPlanItem = (moldId: string, slot: number, e: React.DragEvent) => {
    e.preventDefault()
    const plain = e.dataTransfer.getData('text/plain')
    const idFromPlain = plain && !plain.startsWith('queue:') ? plain : null
    const id =
      e.dataTransfer.getData('text/plan-item-id') ||
      idFromPlain ||
      (dragId && !String(dragId).startsWith('queue:') ? dragId : null)
    setDragId(null)
    setDropTarget(null)
    if (!id || !canEdit) return
    applyMove(id, moldId, slot)
  }

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setFilterOpen(false)
        setHistoryPanelOpen(false)
        setAssignOpen(null)
        setDayDetailDate(null)
        setDropTarget(null)
        setDragId(null)
        setContextMenu(null)
        setNonProdModal(null)
      }
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'z') {
        const ph = planHistoryRef.current
        if (ev.shiftKey) {
          if (ph.cursor < ph.checkpoints.length - 1) {
            ev.preventDefault()
            restoreCheckpoint(ph.cursor + 1)
          }
        } else if (ph.cursor > 0) {
          ev.preventDefault()
          restoreCheckpoint(ph.cursor - 1)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [restoreCheckpoint])

  useEffect(() => {
    const onGlobalPointer = () => setContextMenu(null)
    window.addEventListener('click', onGlobalPointer)
    return () => window.removeEventListener('click', onGlobalPointer)
  }, [])

  useEffect(() => {
    const el = gridScrollRef.current
    if (!el) return
    const onWheel = (ev: WheelEvent) => {
      if (!ev.ctrlKey && !ev.metaKey) return
      ev.preventDefault()
      const fine = ev.shiftKey
      const step = fine ? 1.2 : 3.2
      setZoom((z) => Math.min(100, Math.max(15, z + (ev.deltaY > 0 ? -step : step))))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const beginResize = (e: React.MouseEvent, itemId: string, slotStart: number, startSpan: number) => {
    if (!canEdit) return
    e.stopPropagation()
    e.preventDefault()
    const beforeItems = clonePlanItems(itemsRef.current)
    const resizingItem = itemsRef.current.find((it) => it.id === itemId)
    const startX = e.clientX
    const slotW = Math.max(colW, 24)
    const onMove = (ev: MouseEvent) => {
      const add = Math.round((ev.clientX - startX) / slotW)
      const next = Math.max(1, Math.min(startSpan + add, totalSlots - slotStart))
      if (!resizingItem) return
      // maxConcurrent=1 kuralı: aynı kalıpta çakışmaya izin vermiyoruz.
      if (wouldViolateMaxConcurrent(itemId, resizingItem.moldId, slotStart, next)) return
      setItems((list) =>
        list.map((x) => {
          if (x.id !== itemId) return x
          const dur = next * 8
          const start = new Date(x.startAt)
          const end = new Date(start.getTime() + dur * 3600000)
          return { ...x, durationHours: dur, endAt: end.toISOString() }
        }),
      )
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      const after = itemsRef.current
      if (!planItemsEqual(beforeItems, after)) {
        appendCheckpoint(after, 'Süre (vardiya) güncellendi')
      }
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const goToday = () => setWeekStartMonday(mondayOfWeekUtc(new Date()))
  const goPrev = () => {
    const d = new Date(weekStartMonday)
    d.setUTCDate(d.getUTCDate() - 7)
    setWeekStartMonday(d)
  }
  const goNext = () => {
    const d = new Date(weekStartMonday)
    d.setUTCDate(d.getUTCDate() + 7)
    setWeekStartMonday(d)
  }

  const selected = items.find((i) => i.id === selectedId) ?? null

  return (
    <>
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[1.25rem]">
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2">
        <div className="px-[0.6875rem] py-1">
          <nav aria-label={t('project.breadcrumbAria')} className="mb-0">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link
                  to="/planlama"
                  className="font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400"
                >
                  {t('nav.sidebar.section.planning')}
                </Link>
              </li>
              <li className="flex items-center gap-1" aria-hidden>
                <ChevronRight className="size-3.5 shrink-0 opacity-70" />
              </li>
              <li className="font-semibold text-slate-800 dark:text-slate-100" aria-current="page">
                {t('nav.planningDesign')}
              </li>
            </ol>
          </nav>
        </div>

        <div className="okan-liquid-root flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.25rem]">
      <div className="okan-liquid-blobs" aria-hidden>
        <div className="okan-liquid-blob okan-liquid-blob--a" />
        <div className="okan-liquid-blob okan-liquid-blob--b" />
        <div className="okan-liquid-blob okan-liquid-blob--c" />
      </div>
      <div className="okan-liquid-content flex min-h-0 flex-1 flex-col">
    <div
      className="gm-planning-design-view flex min-h-0 flex-1 flex-col"
      style={{ ['--gm-planning-mold-rail' as string]: `${MOLD_COL_PX}px` }}
    >
      <div className="okan-liquid-panel gm-planning-design-shell flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="gm-planning-toolbar relative z-[75] grid min-h-11 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 overflow-visible border-b border-[var(--okan-panel-border-soft)] px-3 py-2 md:gap-3">
        <div className="flex min-w-0 items-center justify-self-start gap-2">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border-0 bg-transparent px-3 py-2 text-sm font-semibold text-slate-800 shadow-none transition hover:bg-slate-200/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:text-slate-100 dark:hover:bg-white/10"
            aria-expanded={filterOpen}
            aria-controls="gm-planning-filter-panel"
          >
            <Filter className="size-4 shrink-0 opacity-80" aria-hidden />
            <span>Filtrele</span>
            {activePlanningFilterCount > 0 ? (
              <span className="rounded-full bg-sky-500/25 px-1.5 py-0.5 text-xs font-bold tabular-nums text-sky-900 dark:bg-sky-400/20 dark:text-sky-100">
                {activePlanningFilterCount}
              </span>
            ) : null}
            <ChevronDown
              className={`size-4 shrink-0 opacity-70 transition ${filterOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
        </div>
        <div className="flex shrink-0 items-center justify-center gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={() => goToday()}
            className="okan-liquid-btn-secondary px-2 py-1.5 text-sm font-semibold md:px-3 md:py-2"
          >
            Bugün
          </button>
          <button
            type="button"
            onClick={goPrev}
            className="okan-liquid-btn-secondary p-1.5 md:p-2"
            aria-label="Önceki hafta"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="okan-liquid-btn-secondary p-1.5 md:p-2"
            aria-label="Sonraki hafta"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end justify-self-end gap-1.5 md:gap-2">
          <button
            type="button"
            disabled={!canEdit || planHistory.cursor <= 0}
            onClick={() => restoreCheckpoint(planHistory.cursor - 1)}
            className="inline-flex shrink-0 items-center rounded-lg border-0 bg-transparent p-2 text-slate-700 hover:bg-slate-200/40 disabled:opacity-35 dark:text-slate-200 dark:hover:bg-white/10"
            title="Önceki adım (⌘Z / Ctrl+Z)"
            aria-label="Önceki adım"
          >
            <Undo2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            disabled={!canEdit || planHistory.cursor >= planHistory.checkpoints.length - 1}
            onClick={() => restoreCheckpoint(planHistory.cursor + 1)}
            className="inline-flex shrink-0 items-center rounded-lg border-0 bg-transparent p-2 text-slate-700 hover:bg-slate-200/40 disabled:opacity-35 dark:text-slate-200 dark:hover:bg-white/10"
            title="İleri (⇧⌘Z / Ctrl+Shift+Z)"
            aria-label="İleri"
          >
            <Redo2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setHistoryPanelOpen((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border-0 bg-transparent px-2 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200/35 dark:text-slate-100 dark:hover:bg-white/10"
            aria-expanded={historyPanelOpen}
            aria-controls="gm-planning-history-panel"
          >
            <History className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            <span className="hidden sm:inline">Geçmiş</span>
            <ChevronDown
              className={`hidden size-4 shrink-0 opacity-70 transition sm:block ${historyPanelOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
          <button
            type="button"
            disabled={!canEdit}
            onClick={saveDraftAndResetHistory}
            className="okan-liquid-btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Kaydet
          </button>
          <button
            type="button"
            disabled={!canEdit || draftState === 'published'}
            onClick={() => {
              if (!canEdit) return
              setDraftState('published')
            }}
            className="okan-liquid-btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Yayınla
          </button>
        </div>
      </div>

      {filterOpen ? (
        <div
          id="gm-planning-filter-panel"
          className="max-h-[min(52vh,28rem)] shrink-0 space-y-4 overflow-y-auto border-t border-[var(--okan-panel-border-soft)] bg-transparent px-3 pb-3 pt-3"
          role="region"
          aria-label="Planlama filtreleri"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Ara</p>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün / emir / proje…"
              title="Ürün / emir / proje"
              className="mt-2 w-full border-x-0 border-b border-t-0 border-slate-200/80 bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-sky-500/60 focus:ring-0 dark:border-slate-600/70 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-sky-400/50"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Kalıp</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {PLANNING_MOLDS.map((m) => {
                const on = moldFilter.includes(m.moldId)
                return (
                  <button
                    key={m.moldId}
                    type="button"
                    onClick={() =>
                      setMoldFilter((prev) =>
                        on ? prev.filter((x) => x !== m.moldId) : [...prev, m.moldId],
                      )
                    }
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      on
                        ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                        : 'bg-transparent text-slate-700 ring-1 ring-slate-300/60 dark:text-slate-200 dark:ring-slate-500/35'
                    }`}
                  >
                    {m.moldId}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Durum</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(Object.keys(STATUS_META) as PlanStatusKey[]).map((k) => {
                const on = statusFilter.includes(k)
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() =>
                      setStatusFilter((prev) => (on ? prev.filter((x) => x !== k) : [...prev, k]))
                    }
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      on
                        ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                        : 'bg-transparent text-slate-700 ring-1 ring-slate-300/60 dark:text-slate-200 dark:ring-slate-500/35'
                    }`}
                  >
                    {STATUS_META[k].label}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              İş günleri
            </p>
            <label
              className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
              title="Yalnızca iş günlerini göster"
            >
              <input
                type="checkbox"
                checked={workdaysOnly}
                onChange={(e) => setWorkdaysOnly(e.target.checked)}
                className="size-4 shrink-0 rounded border-slate-400 text-sky-600 focus:ring-sky-500/40 dark:border-slate-500 dark:bg-slate-900/80"
              />
              <span>Yalnızca iş günlerini göster</span>
            </label>
          </div>
        </div>
      ) : null}

      {historyPanelOpen ? (
        <div
          id="gm-planning-history-panel"
          className="max-h-[min(40vh,22rem)] shrink-0 overflow-y-auto border-t border-[var(--okan-panel-border-soft)] bg-transparent px-3 pb-3 pt-3"
          role="region"
          aria-label="Plan değişiklik geçmişi"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Kayıtlı sürümler
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Bir sürüme dönünce daha sonraki sürümler yeni düzenleme yapılana kadar gizlenir. ⌘Z / Ctrl+Z ile önceki
            adım, ⇧⌘Z ile ileri.
          </p>
          <ol className="mt-3 list-none space-y-2 p-0">
            {[...planHistory.checkpoints.slice(0, planHistory.cursor + 1)]
              .map((cp, idx) => ({ cp, index: idx }))
              .reverse()
              .map(({ cp, index }) => {
                const isCurrent = index === planHistory.cursor
                return (
                  <li
                    key={cp.id}
                    className={`rounded-lg border px-2.5 py-2 text-sm ${
                      isCurrent
                        ? 'border-sky-400/50 bg-sky-500/10 dark:border-sky-500/35'
                        : 'border-slate-200/60 bg-transparent dark:border-slate-600/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-50">{cp.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(cp.atMs).toLocaleString('tr-TR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                          {isCurrent ? ' · Şu an' : null}
                        </div>
                        {cp.note ? (
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{cp.note}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        disabled={!canEdit || isCurrent}
                        onClick={() => restoreCheckpoint(index)}
                        className="shrink-0 rounded-md bg-slate-200/80 px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-300/80 disabled:cursor-default disabled:opacity-40 dark:bg-slate-700/80 dark:text-slate-100"
                      >
                        Bu sürüme dön
                      </button>
                    </div>
                  </li>
                )
              })}
          </ol>
          {canEdit ? (
            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Seçili sürüm notu
              </span>
              <textarea
                key={planHistory.checkpoints[planHistory.cursor]?.id ?? 'cur'}
                defaultValue={planHistory.checkpoints[planHistory.cursor]?.note ?? ''}
                onBlur={(e) => updateCheckpointNote(planHistory.cursor, e.target.value)}
                rows={2}
                placeholder="Bu sürüm için kısa not (isteğe bağlı)…"
                className="mt-1 w-full resize-y rounded-md border border-slate-200/80 bg-transparent px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-sky-500/50 dark:border-slate-600/70 dark:text-slate-100"
              />
            </label>
          ) : null}
        </div>
      ) : null}

      {!canEdit ? (
        <div className="okan-liquid-banner-warn shrink-0 border-b border-amber-200/50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/40 dark:text-amber-100">
          Salt okunur: sürükle-bırak ve yeniden boyutlandırma kapalı.
        </div>
      ) : null}

      <div
        className={`relative z-0 grid min-h-0 flex-1 grid-cols-1 gap-0 ${
          queueOpen ? 'lg:grid-cols-[1fr_280px]' : 'lg:grid-cols-[1fr_2.75rem]'
        }`}
      >
        <div
          ref={gridScrollRef}
          className="gm-planning-scroll-host min-h-0 min-w-0 overflow-auto p-0 lg:min-h-0"
          title="Ctrl/⌘ + fare tekerleği: yakınlaştır / uzaklaştır"
        >
          <div className="flex min-h-0 min-w-full w-max flex-col">
            {/* Üst: tarih başlığı — sol kalıp köşesi yatayda sabit + opak */}
            <div className="flex w-max min-w-full">
              <div
                className="gm-planning-corner-cell sticky left-0 top-0 z-[60] flex shrink-0 flex-col justify-center border-b border-r border-slate-200/70 px-2 py-2 text-xs font-medium text-slate-600 dark:border-slate-600/50 dark:text-slate-400"
                style={{ width: MOLD_COL_PX, minWidth: MOLD_COL_PX }}
              >
                Kalıp
              </div>
              <div
                className="gm-planning-timeline-canvas sticky top-0 z-40 grid shrink-0 border-b border-slate-200/70 bg-transparent dark:border-slate-600/45"
                style={{
                  width: totalSlots * colW,
                  minWidth: totalSlots * colW,
                  gridTemplateColumns: `repeat(${totalSlots}, minmax(${colW}px, 1fr))`,
                }}
              >
                {visibleDays.map((d) => {
                  const isToday = d.date === todayIso
                  return (
                    <div
                      key={d.id}
                      className={`col-span-3 border-r border-slate-200/75 text-center dark:border-slate-600/50 ${
                        d.isNonProduction
                          ? 'bg-slate-200/50 dark:bg-slate-900/55'
                          : 'bg-slate-50/80 dark:bg-slate-950/35'
                      } ${isToday ? 'ring-2 ring-sky-500/40 ring-inset dark:ring-sky-400/35' : ''}`}
                    >
                      <div
                        className={`px-1 py-2 font-semibold text-gray-900 dark:text-gray-50 ${headerFontClass}`}
                      >
                        {d.date} · {d.weekdayShort}
                      </div>
                      <div
                        className="grid grid-cols-3 border-t border-slate-200/70 px-0.5 py-1 text-slate-600 dark:border-slate-600/50 dark:text-slate-300"
                        style={{ fontSize: zoom < 40 ? '9px' : '11px' }}
                      >
                        {PLANNING_SHIFTS.map((s, si) => (
                          <div
                            key={s.id}
                            className="min-w-0 border-r border-slate-200/55 px-0.5 dark:border-slate-600/45"
                            title={s.label}
                          >
                            {shiftCompact ? SHIFT_SHORT[si] : s.label}
                          </div>
                        ))}
                      </div>
                      {d.isNonProduction ? (
                        <div className="border-t border-slate-200/70 bg-slate-100/60 px-1 py-0.5 text-[9px] text-slate-600 dark:border-slate-600/50 dark:bg-slate-900/45 dark:text-slate-400">
                          Üretim yok
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            {PLANNING_MOLDS.map((mold, moldIdx) => {
              const rowItems = filteredItems.filter((it) => it.moldId === mold.moldId)
              const rowMinH = moldRowHeights[mold.moldId] ?? BODY_ROW_BASE_MIN
              const prevMold = PLANNING_MOLDS[moldIdx - 1]
              const isHatStart = !prevMold || prevMold.hatNo !== mold.hatNo

              return (
                <div
                  key={mold.moldId}
                  className={`flex w-max min-w-full border-b border-slate-200/65 dark:border-slate-600/45 ${
                    isHatStart ? 'border-t border-slate-200/65 dark:border-slate-600/45' : ''
                  }`}
                >
                  <div
                    className="gm-planning-sticky-mold-label sticky left-0 z-[60] flex shrink-0 flex-col justify-start border-r border-slate-200/70 px-2 py-2 text-xs dark:border-slate-600/50"
                    style={{ width: MOLD_COL_PX, minWidth: MOLD_COL_PX, minHeight: rowMinH }}
                  >
                    {isHatStart ? (
                      <div className="mb-1 text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                        {mold.hatNo}. hat
                      </div>
                    ) : (
                      <div className="mb-1 text-[10px] font-semibold text-transparent dark:text-transparent">
                        {mold.hatNo}. hat
                      </div>
                    )}
                    <div className="font-semibold leading-tight text-gray-900 dark:text-gray-50">{mold.moldId}</div>
                    <div className="truncate text-[10px] leading-tight text-gray-600 dark:text-gray-300">
                      {mold.name}
                    </div>
                  </div>
                  <div
                    className="gm-planning-timeline-canvas relative z-0 isolate shrink-0"
                    style={{ width: totalSlots * colW, minWidth: totalSlots * colW, minHeight: rowMinH }}
                  >
                    <div
                      className="grid h-full min-h-0 items-stretch"
                      style={{
                        gridTemplateColumns: `repeat(${totalSlots}, minmax(${colW}px, 1fr))`,
                      }}
                    >
                      {Array.from({ length: totalSlots }).map((_, slot) => {
                        const dayIdx = Math.floor(slot / PLANNING_SHIFTS.length)
                        const day = visibleDays[dayIdx]
                        const non = day?.isNonProduction
                        const hl =
                          dropTarget?.moldId === mold.moldId && dropTarget.slot === slot
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              if (!canEdit) return
                              setAssignOpen({ moldId: mold.moldId, slot })
                            }}
                            onDragOver={(e) => {
                              if (!canEdit) return
                              e.preventDefault()
                              if (dragId) setDropTarget({ moldId: mold.moldId, slot })
                              e.dataTransfer.dropEffect = dragId?.startsWith('queue:') ? 'copy' : 'move'
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              setDropTarget(null)
                              const qid = readQueueIdFromDrop(e)
                              if (qid) {
                                const q = QUEUE_MOCK.find((x) => x.queueId === qid)
                                if (!q) return
                                const { startAt, endAt, durationHours } = isoFromSlotVisible(visibleDays, slot)
                                const span = spanSlotsFromDuration(durationHours)
                                if (wouldViolateMaxConcurrent(null, mold.moldId, slot, span)) return
                                const newId = `P-${Date.now()}`
                                const np = day?.isNonProduction
                                const newRow: PlanItem = {
                                  id: newId,
                                  title: q.title,
                                  productId: 'MOCK-PROD',
                                  imageUrl: null,
                                  moldId: mold.moldId,
                                  startAt,
                                  endAt,
                                  durationHours,
                                  status: 'PLANNED',
                                  priority: q.priority,
                                  concreteRecipeId: 'RC-C30-01',
                                  estimatedVolumeM3: 8,
                                  estimatedSteelKg: 600,
                                  tags: ['queue'],
                                  warnings: np ? ['Üretim dışı güne yerleşim (mock)'] : [],
                                }
                                const nextItems = [...itemsRef.current, newRow]
                                if (np) {
                                  setNonProdModal({ moldId: mold.moldId, slot, itemId: newId })
                                }
                                appendCheckpoint(nextItems, 'Kuyruktan plana eklendi')
                                return
                              }
                              handleDropPlanItem(mold.moldId, slot, e)
                            }}
                        className={`gm-planning-cell h-full min-h-[44px] border-r border-slate-200/50 text-left dark:border-slate-600/45 ${
                          non
                            ? 'bg-slate-200/40 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300'
                            : 'bg-slate-50/45 hover:bg-slate-100/60 dark:bg-slate-950/20 dark:hover:bg-slate-900/30'
                        } ${hl ? 'bg-slate-200/55 ring-2 ring-inset ring-sky-500/45 dark:bg-slate-800/40 dark:ring-sky-400/30' : ''}`}
                        aria-label={`Hücre ${mold.moldId} slot ${slot}`}
                      />
                    )
                  })}
                    </div>

                  <div
                    className="pointer-events-none absolute inset-0 z-10 grid items-start"
                    style={{
                      gridTemplateColumns: `repeat(${totalSlots}, minmax(${colW}px, 1fr))`,
                    }}
                  >
                    {rowItems.map((it) => {
                      const p = placementByItem.get(it.id)
                      if (!p || !p.visible || p.slotStart < 0) return null
                      const st = STATUS_META[it.status]
                      const cap = capacityIssue.has(it.id)
                      const isDragSource = dragId === it.id
                      const passThroughDrag =
                        dragId !== null && (dragId.startsWith('queue:') || !isDragSource)
                      return (
                        <div
                          key={it.id}
                          className={`relative z-20 flex h-full min-h-0 flex-col rounded-xl border border-slate-200/70 ${st.borderClass} border-l-4 ${st.bgClass} shadow-neo-out-sm dark:border-slate-600/45 ${
                            cap ? 'ring-2 ring-red-500/70' : ''
                          } ${passThroughDrag ? 'pointer-events-none' : 'pointer-events-auto'}`}
                          style={{
                            gridColumn: `${p.slotStart + 1} / span ${p.span}`,
                            // Kartların birbirini ikinci grid satırına itmesini engelle.
                            gridRow: '1 / 2',
                            marginTop: 0,
                            height: `${CELL_ROW_HEIGHT_PX}px`,
                            minHeight: `${CELL_ROW_HEIGHT_PX}px`,
                          }}
                          title={`${it.title} · ${it.durationHours} saat · öncelik ${it.priority}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedId(it.id)
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              itemId: it.id,
                              moldId: it.moldId,
                            })
                          }}
                          draggable={canEdit}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', it.id)
                            e.dataTransfer.setData('text/plan-item-id', it.id)
                            e.dataTransfer.effectAllowed = 'move'
                            setDragId(it.id)
                          }}
                          onDragEnd={() => {
                            setDragId(null)
                            setDropTarget(null)
                          }}
                        >
                          <div className="flex min-h-0 flex-1 items-stretch gap-0">
                            {canEdit ? (
                              <span className="flex w-5 shrink-0 cursor-grab items-center justify-center text-gray-400">
                                <GripVertical className="h-4 w-4" />
                              </span>
                            ) : null}
                            <div className="min-w-0 flex-1 py-1 pr-1">
                              <div className="flex items-center gap-1">
                                {statusIcon(it.status)}
                                <span className="truncate text-[11px] font-semibold leading-tight text-gray-900 dark:text-gray-50">
                                  {it.title}
                                </span>
                              </div>
                              {it.orderId ? (
                                <div className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                                  {it.orderId}
                                </div>
                              ) : null}
                            </div>
                            {canEdit ? (
                              <div
                                role="separator"
                                aria-orientation="vertical"
                                aria-label="Süreyi uzat"
                                title="Sağa sürükleyerek uzat"
                                onMouseDown={(e) => beginResize(e, it.id, p.slotStart, p.span)}
                                className="relative z-30 w-1.5 shrink-0 cursor-ew-resize self-stretch border-l border-slate-200/70 bg-slate-200/40 hover:bg-slate-300/55 dark:border-slate-600 dark:bg-slate-700/45 dark:hover:bg-slate-600/55"
                              />
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                </div>
              )
            })}

            <div className="gm-planning-summary-strip sticky bottom-0 z-30 flex w-max min-w-full border-t border-slate-200/70 bg-transparent dark:border-slate-600/45">
              <div
                className="gm-planning-corner-cell sticky left-0 z-[45] flex shrink-0 flex-col justify-center border-r border-slate-200/70 px-2 py-2 text-[10px] font-medium text-slate-600 dark:border-slate-600/50 dark:text-slate-400"
                style={{ width: MOLD_COL_PX, minWidth: MOLD_COL_PX }}
              >
                Gün özeti
              </div>
              <div
                className="gm-planning-timeline-canvas grid shrink-0 border-slate-200/70 dark:border-slate-600/45"
                style={{
                  width: totalSlots * colW,
                  minWidth: totalSlots * colW,
                  gridTemplateColumns: `repeat(${totalSlots}, minmax(${colW}px, 1fr))`,
                }}
              >
              {visibleDays.map((d) => {
                const t = dailyTotals.find((x) => x.date === d.date)!
                return (
                  <button
                    key={`sum-${d.id}`}
                    type="button"
                    onClick={() => setDayDetailDate(d.date)}
                    className="col-span-3 border-r border-slate-200/65 px-1 py-2 text-left text-[10px] transition hover:bg-slate-100/75 dark:border-slate-600/45 dark:hover:bg-slate-900/35"
                  >
                    <div className="rounded-md bg-slate-100/55 px-2 py-1.5 dark:bg-slate-800/45">
                      <div className="font-semibold leading-snug text-slate-900 dark:text-slate-50">
                        {t.pieces} iş · {t.activeMolds} kalıp
                      </div>
                      <div className="mt-0.5 text-slate-700 dark:text-slate-300">
                        {t.volumeM3.toFixed(1)} m³ · {(t.steelKg / 1000).toFixed(1)} t çelik
                      </div>
                      <div className="mt-0.5 text-[9px] text-slate-500 dark:text-slate-400">
                        Risk/öncelik: {t.riskyJobs} · Uyarı: {t.warningsCount}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        </div>

        <aside
          className={`gm-planning-queue-aside flex min-h-0 flex-col border-t border-[var(--okan-panel-border-soft)] lg:min-h-0 lg:border-l lg:border-t-0 ${
            queueOpen ? 'p-3' : 'p-2 lg:items-center lg:overflow-hidden lg:p-1.5'
          }`}
        >
          {queueOpen ? (
            <>
              <div className="flex shrink-0 items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Bekleyen iş (mock)</h2>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Tıklayın veya sürükleyip hücreye bırakın. Esc iptal.
                  </p>
                </div>
                <button
                  type="button"
                  aria-expanded={queueOpen}
                  aria-controls="gm-planning-queue-list"
                  onClick={() => setQueueOpen(false)}
                  className="shrink-0 rounded-lg border-0 bg-transparent p-1.5 text-slate-600 hover:bg-slate-200/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:text-slate-300 dark:hover:bg-white/10"
                  title="Kuyruğu gizle"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                  <span className="sr-only">Kuyruğu gizle</span>
                </button>
              </div>
              <ul
                id="gm-planning-queue-list"
                className="mt-3 max-h-[420px] min-h-0 flex-1 divide-y divide-slate-200/40 overflow-auto pr-1 dark:divide-white/10 lg:max-h-none"
              >
                {QUEUE_MOCK.map((q) => (
                  <li
                    key={q.queueId}
                    draggable={canEdit}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', `queue:${q.queueId}`)
                      e.dataTransfer.setData('text/plan-queue-id', q.queueId)
                      e.dataTransfer.effectAllowed = 'copy'
                      setDragId(`queue:${q.queueId}`)
                    }}
                    onDragEnd={() => {
                      setDragId(null)
                      setDropTarget(null)
                    }}
                    className="cursor-grab py-2.5 text-xs first:pt-0 last:pb-0 active:cursor-grabbing"
                  >
                    <div className="font-medium text-slate-900 dark:text-slate-50">{q.title}</div>
                    <div className="mt-1 text-slate-500 dark:text-slate-400">
                      Öncelik {q.priority} · risk {q.risk}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <button
              type="button"
              aria-expanded={false}
              onClick={() => setQueueOpen(true)}
              className="flex w-full flex-1 flex-col items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:text-slate-200 dark:hover:bg-white/10 lg:min-h-0 lg:py-4"
              title="Bekleyen işi göster"
            >
              <ChevronLeft className="h-5 w-5 shrink-0 lg:rotate-180" aria-hidden />
              <span className="lg:hidden">Bekleyen işi göster</span>
              <span className="hidden max-w-[3rem] text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-slate-500 dark:text-slate-400 lg:block lg:[writing-mode:vertical-rl] lg:rotate-180">
                Bekleyen iş
              </span>
            </button>
          )}
        </aside>
      </div>
      </div>
    </div>
      </div>
    </div>
      </div>
    </div>

      {typeof document !== 'undefined'
        ? createPortal(
            <>
      {selected ? (
        <div
          className="gm-glass-drawer-root gm-glass-drawer-root--module-scrim pointer-events-none fixed inset-0 z-[60] flex justify-end"
          role="presentation"
        >
          <button
            type="button"
            className="gm-glass-drawer-backdrop pointer-events-auto absolute inset-0 z-0 cursor-default border-0 p-0"
            aria-label="Kapat"
            onClick={() => setSelectedId(null)}
          />
          <div
            className="gm-glass-drawer-panel pointer-events-auto relative z-10 flex h-full min-h-0 w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/45 bg-white/75 shadow-[0_12px_40px_rgb(15_23_42/0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_12px_48px_rgb(0_0_0/0.45)]"
            role="dialog"
            aria-label="Plan öğesi detayı"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-2 p-4 pb-0">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{selected.title}</h2>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-xl border border-slate-200/70 bg-white/70 p-2 text-slate-700 shadow-sm hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-4">
              <div className="space-y-3 text-sm">
              <div className="okan-liquid-panel-nested p-3">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ürün örnekleri</h3>
                <div className="mt-2 flex gap-2 overflow-auto pb-1">
                  {PRODUCT_SAMPLE_THUMBS.map((src, idx) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Ürün örneği ${idx + 1}`}
                      className="h-24 w-32 shrink-0 rounded-xl border border-slate-200/65 bg-slate-50/60 object-cover dark:border-slate-600/50 dark:bg-slate-900/40"
                      draggable={false}
                    />
                  ))}
                </div>
              </div>
              <div className="okan-liquid-panel-nested p-3">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Genel</h3>
                <dl className="mt-2 space-y-1 text-slate-800 dark:text-slate-200">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">id</dt>
                    <dd className="font-mono text-xs">{selected.id}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Ürün</dt>
                    <dd>{selected.productId}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Durum</dt>
                    <dd>{STATUS_META[selected.status].label}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Öncelik</dt>
                    <dd>{selected.priority}</dd>
                  </div>
                </dl>
              </div>
              <div className="okan-liquid-panel-nested p-3">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Zaman</h3>
                <dl className="mt-2 space-y-1 text-slate-800 dark:text-slate-200">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Başlangıç</dt>
                    <dd className="font-mono text-xs">{selected.startAt}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Bitiş</dt>
                    <dd className="font-mono text-xs">{selected.endAt}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Süre</dt>
                    <dd>{selected.durationHours} saat</dd>
                  </div>
                </dl>
              </div>
              <div className="okan-liquid-panel-nested p-3">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kalıp & beton</h3>
                <dl className="mt-2 space-y-1 text-slate-800 dark:text-slate-200">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Kalıp</dt>
                    <dd>{selected.moldId}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Reçete</dt>
                    <dd className="font-mono text-xs">{selected.concreteRecipeId}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Hacim</dt>
                    <dd>{selected.estimatedVolumeM3} m³</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Çelik</dt>
                    <dd>{selected.estimatedSteelKg} kg</dd>
                  </div>
                </dl>
              </div>
              <div className="okan-liquid-panel-nested p-3">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Reçete havuzu (mock)</h3>
                <ul className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {CONCRETE_RECIPES_MOCK.map((r) => (
                    <li key={r.recipeId}>
                      {r.recipeId} — {r.label} ({r.strengthClass})
                    </li>
                  ))}
                </ul>
              </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {contextMenu ? (
        <>
          <div
            className="gm-glass-context-menu-root fixed inset-0 z-[72]"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault()
              setContextMenu(null)
            }}
          >
            <div
              className="gm-glass-dropdown-panel gm-glass-context-menu-panel fixed z-[130] min-w-52 rounded-xl p-1 text-xs"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="gm-glass-context-menu-item w-full rounded-lg px-2 py-2 text-left"
                onClick={() => {
                  setSelectedId(contextMenu.itemId)
                  setContextMenu(null)
                }}
              >
                Detay görüntüle
              </button>

              <div
                ref={contextShiftAnchorRef}
                className="relative"
                onMouseEnter={onShiftRowEnter}
                onMouseLeave={onShiftRowLeave}
              >
                <button
                  type="button"
                  className="gm-glass-context-menu-item flex w-full items-center justify-between rounded-lg px-2 py-2 text-left"
                >
                  <span>Kaydır</span>
                  <span className="text-[10px] opacity-70">▶</span>
                </button>
              </div>

              <button
                type="button"
                className="gm-glass-context-menu-item gm-glass-context-menu-item--danger w-full rounded-lg px-2 py-2 text-left"
                onClick={() => {
                  if (!canEdit) {
                    setContextMenu(null)
                    return
                  }
                  appendCheckpoint(
                    itemsRef.current.filter((it) => it.id !== contextMenu.itemId),
                    'Plan öğesi kaldırıldı',
                  )
                  setContextMenu(null)
                }}
              >
                Kaldır
              </button>
            </div>
          </div>

          {shiftSubmenuOpen && shiftSubmenuPos ? (
            <div
              className="gm-glass-dropdown-panel gm-glass-context-menu-panel fixed z-[140] w-40 rounded-xl p-1 text-xs"
              style={{ left: shiftSubmenuPos.left, top: shiftSubmenuPos.top }}
              onMouseEnter={cancelShiftClose}
              onMouseLeave={scheduleShiftClose}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="gm-glass-context-menu-item w-full rounded-lg px-2 py-2 text-left"
                onClick={() => {
                  shiftMoldItems(contextMenu.moldId, 1)
                  setContextMenu(null)
                }}
              >
                Tümünü sağa kaydır
              </button>
              <button
                type="button"
                className="gm-glass-context-menu-item w-full rounded-lg px-2 py-2 text-left"
                onClick={() => {
                  shiftMoldItems(contextMenu.moldId, -1)
                  setContextMenu(null)
                }}
              >
                Tümünü sola kaydır
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {dayDetailDate && dayDetailData ? (
        <div
          className="gm-glass-drawer-root gm-glass-drawer-root--module-scrim pointer-events-none fixed inset-0 z-[58] flex justify-end"
          role="presentation"
        >
          <button
            type="button"
            className="gm-glass-drawer-backdrop pointer-events-auto absolute inset-0 z-0 cursor-default border-0 p-0"
            aria-label="Kapat"
            onClick={() => setDayDetailDate(null)}
          />
          <div
            className="gm-glass-drawer-panel pointer-events-auto relative z-10 flex h-full min-h-0 w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/45 bg-white/75 shadow-[0_12px_40px_rgb(15_23_42/0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_12px_48px_rgb(0_0_0/0.45)]"
            role="dialog"
            aria-label="Gün özeti detayı"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-2 p-4 pb-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {dayDetailData.day.date} · {dayDetailData.day.weekdayShort}
                </h2>
                <p className="text-xs text-gray-500">Günlük kırılım (plan-09)</p>
              </div>
              <button
                type="button"
                onClick={() => setDayDetailDate(null)}
                className="rounded-xl bg-gray-100 p-2 text-gray-700 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-4">
            {dayDetailData.dayItems.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-600 shadow-neo-in dark:bg-gray-950/50 dark:text-gray-300">
                Bu gün için plan yok.
                <button
                  type="button"
                  className="mt-3 w-full rounded-xl bg-gray-800 py-2 text-sm font-semibold text-white dark:bg-gray-200 dark:text-gray-900"
                  onClick={() => {
                    setDayDetailDate(null)
                    setAssignOpen({ moldId: PLANNING_MOLDS[0]!.moldId, slot: 0 })
                  }}
                >
                  İş ekle (mock)
                </button>
              </div>
            ) : (
              <>
                <section className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Kalıp kırılımı
                  </h3>
                  <table className="mt-2 w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-1">Kalıp</th>
                        <th className="py-1">İş</th>
                        <th className="py-1">m³</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayDetailData.moldRows.map((r) => (
                        <tr key={r.moldId} className="border-t border-gray-200/80 dark:border-gray-700">
                          <td className="py-1 font-mono">{r.moldId}</td>
                          <td className="py-1">{r.jobCount}</td>
                          <td className="py-1">{r.volumeM3.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
                <section className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">İş listesi</h3>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs">
                    {dayDetailData.jobRows.map((j) => (
                      <li
                        key={j.itemId}
                        className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-950/50"
                      >
                        <span className="min-w-0 truncate font-medium text-gray-900 dark:text-gray-100">
                          {j.title}
                        </span>
                        <span className="shrink-0 text-gray-500">{j.shiftLabel}</span>
                        <span className="shrink-0 rounded bg-gray-200 px-1 text-[10px] dark:bg-gray-800">
                          {STATUS_META[j.statusKey].label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="okan-liquid-panel-nested mt-4 p-3">
                  <h3 className="text-xs font-semibold text-gray-500">Toplamlar</h3>
                  <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                    {dailyTotals.find((x) => x.date === dayDetailDate)?.pieces ?? 0} iş ·{' '}
                    {dailyTotals.find((x) => x.date === dayDetailDate)?.volumeM3.toFixed(1)} m³ ·{' '}
                    {((dailyTotals.find((x) => x.date === dayDetailDate)?.steelKg ?? 0) / 1000).toFixed(1)}{' '}
                    t çelik
                  </p>
                </section>
              </>
            )}
            </div>
          </div>
        </div>
      ) : null}

      {assignOpen && canEdit ? (
        <div className="gm-glass-modal-shell fixed inset-0 z-[55] flex items-center justify-center p-4" role="presentation">
          <button
            type="button"
            className="absolute inset-0 cursor-default border-0 p-0 bg-gray-900/25 backdrop-blur-[2px]"
            aria-label="Kapat"
            onClick={() => setAssignOpen(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={planningAssignMockTitleId}
            className="gm-glass-modal-shell relative z-10 w-full max-w-sm rounded-2xl border border-gray-200/90 bg-gray-100 p-4 shadow-neo-out dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id={planningAssignMockTitleId} className="font-semibold text-gray-900 dark:text-gray-50">
              Buraya ata (mock)
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Kalıp {assignOpen.moldId}, slot {assignOpen.slot}.
            </p>
            <ul className="mt-3 max-h-48 space-y-1 overflow-auto text-sm">
              {QUEUE_MOCK.map((q) => (
                <li key={q.queueId}>
                  <button
                    type="button"
                    className="gm-glass-card-inset w-full px-2 py-2 text-left text-sm text-gray-800 transition hover:opacity-95 dark:text-gray-100"
                    onClick={() => {
                      const { startAt, endAt, durationHours } = isoFromSlotVisible(visibleDays, assignOpen.slot)
                      const span = spanSlotsFromDuration(durationHours)
                      if (wouldViolateMaxConcurrent(null, assignOpen.moldId, assignOpen.slot, span)) return
                      const day = visibleDays[Math.floor(assignOpen.slot / PLANNING_SHIFTS.length)]
                      const np = day?.isNonProduction
                      const newId = `P-${Date.now()}`
                      const newRow: PlanItem = {
                        id: newId,
                        title: q.title,
                        productId: 'MOCK-PROD',
                        imageUrl: null,
                        moldId: assignOpen.moldId,
                        startAt,
                        endAt,
                        durationHours,
                        status: 'PLANNED',
                        priority: q.priority,
                        concreteRecipeId: 'RC-C30-01',
                        estimatedVolumeM3: 8,
                        estimatedSteelKg: 600,
                        tags: ['queue'],
                        warnings: np ? ['Üretim dışı güne yerleşim (mock)'] : [],
                      }
                      appendCheckpoint([...itemsRef.current, newRow], 'Hücreye atandı (mock)')
                      if (np) setNonProdModal({ moldId: assignOpen.moldId, slot: assignOpen.slot, itemId: newId })
                      setAssignOpen(null)
                    }}
                  >
                    {q.title}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setAssignOpen(null)}
              className="mt-3 w-full rounded-xl bg-gray-800 py-2 text-sm font-semibold text-white dark:bg-gray-200 dark:text-gray-900"
            >
              Kapat
            </button>
          </div>
        </div>
      ) : null}

      {nonProdModal ? (
        <div className="gm-glass-modal-shell fixed inset-0 z-[70] flex items-center justify-center p-4" role="presentation">
          <button
            type="button"
            className="absolute inset-0 cursor-default border-0 p-0 bg-gray-900/25 backdrop-blur-[2px]"
            aria-label="Kapat"
            onClick={() => setNonProdModal(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={planningNonProdMockTitleId}
            className="gm-glass-modal-shell relative z-10 w-full max-w-md rounded-2xl border border-gray-200/90 bg-gray-100 p-5 shadow-neo-out dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id={planningNonProdMockTitleId} className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              Üretim dışı gün (mock)
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Bu gün üretim dışıdır. Yine de yerleştirmek istiyor musunuz?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  appendCheckpoint(
                    itemsRef.current.filter((x) => x.id !== nonProdModal.itemId),
                    'Üretim dışı yerleşim iptal',
                  )
                  setNonProdModal(null)
                }}
                className="gm-glass-btn-secondary rounded-xl px-4 py-2 text-sm font-medium"
              >
                İptal (geri al)
              </button>
              <button
                type="button"
                onClick={() => setNonProdModal(null)}
                className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white dark:bg-gray-200 dark:text-gray-900"
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      ) : null}
            </>,
            document.body,
          )
        : null}
    </>
  )
}
