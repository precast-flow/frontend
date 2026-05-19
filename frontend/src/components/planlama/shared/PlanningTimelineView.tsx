import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Filter,
  Lock,
  GripVertical,
  Layers,
  ListOrdered,
  Package,
  PauseCircle,
  PlayCircle,
  History,
  Redo2,
  Save,
  Send,
  Trash2,
  Undo2,
  Sparkles,
  Wrench,
  X,
  XCircle,
} from 'lucide-react'
import '../../muhendislikOkan/engineeringOkanLiquid.css'
import { useI18n } from '../../../i18n/I18nProvider'
import { FilterToolbarSearch } from '../../shared/FilterToolbarSearch'
import {
  eiSplitFilterToggleClass,
  eiSplitHeaderButtonPassive,
} from '../../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import {
  previewItemsForUnit,
  usePlanningWizardOptional,
} from '../PlanningWizardContext'
import { PlanningActionsHost } from './actions/PlanningActionsHost'
import {
  planCardToneClasses,
  type PlanCardDisplayMode,
  type TimelineDisplayItem,
} from './planningTimelineTypes'
import type { PlanVisualTone } from '../../../data/generalPlanningMock'
import { useGeneralPlanningOptional } from '../GeneralPlanningContext'
import { DailyProductionReportDialog } from '../DailyProductionReportDialog'
import { DailyProductionWorkOrderDialog } from '../DailyProductionWorkOrderDialog'
import { previousBusinessDayIso } from '../../../planlama/previousBusinessDay'
import { resolveDefaultProductionDayIso } from '../../../planlama/productionDailyWorkOrder'
import { useFactoryContext } from '../../../context/FactoryContext'
import { useWorkQueue } from '../../../context/WorkQueueContext'
import { formatDailyReportDateTime } from '../../../data/dailyProductionReport'
import {
  isManufacturedProductReady,
  manufacturedProductToQueueItem,
  parseManufacturedQueueId,
} from '../../../data/manufacturedProduct'
import { useGeneralPlanningAccess } from '../../../hooks/useGeneralPlanningAccess'
import {
  GENERAL_PLAN_QUEUE,
  PLANNING_UNIT_LABEL_KEYS,
  crossUnitConsistencyWarnings,
  linkedPlansForProduct,
  resourcesForUnit,
  type GeneralPlanItem,
  type PlanningUnitKey,
} from '../../../data/generalPlanningMock'
import {
  TOOLBAR_ACTION_PERMISSIONS,
  getUnitConfig,
  type PlanningToolbarActionId,
} from '../../../data/generalPlanningUnitConfig'
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
  isoFromSlotVisibleForMode,
  itemsOverlapSlotRange,
  mondayOfWeekUtc,
  planItemsOnSameVehicleTrip,
  snapTimelineSlot,
  spanSlotsFromDurationForMode,
  type PlanItem,
  type PlanningDay,
  type PlanStatusKey,
} from '../../../data/planningDesignMock'
import { projectManagementByCode } from '../../../data/projectManagementCardsMock'
import {
  DISPATCH_VEHICLE_TONES,
  type DispatchVehicleType,
} from '../../../data/dispatchVehicleStyles'

const SHIFT_SHORT = ['S', 'Ö', 'G'] as const

type TimelineResourceRow = {
  moldId: string
  name: string
  lineHint: string
  hatNo: number
  maxConcurrent: number
  vehicleType?: DispatchVehicleType
}

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

export type PlanningTimelineVariant =
  | 'legacy-design'
  | 'general'
  | 'production'
  | 'dispatch'

type LockedUnitPageMeta = {
  sectionLabelKey: string
  pageLabelKey: string
  toolbarSearchId: string
}

const LOCKED_UNIT_PAGE_META: Partial<Record<PlanningTimelineVariant, LockedUnitPageMeta>> = {
  production: {
    sectionLabelKey: 'nav.sidebar.section.production',
    pageLabelKey: 'nav.productionPlanning',
    toolbarSearchId: 'production-planning-toolbar-search',
  },
  dispatch: {
    sectionLabelKey: 'nav.sidebar.section.logistics',
    pageLabelKey: 'nav.dispatchPlanning',
    toolbarSearchId: 'dispatch-planning-toolbar-search',
  },
}

export type PlanningTimelineProps = {
  variant: PlanningTimelineVariant
}

function generalToPlanItem(g: GeneralPlanItem): TimelineDisplayItem {
  const tone: PlanVisualTone = g.visualTone ?? 'committed'
  return {
    id: g.id,
    title: g.title,
    productId: g.productId,
    imageUrl: g.imageUrl,
    moldId: g.resourceId,
    startAt: g.startAt,
    endAt: g.endAt,
    durationHours: g.durationHours,
    status: g.status,
    priority: g.priority,
    concreteRecipeId: g.concreteRecipeId,
    estimatedVolumeM3: g.estimatedVolumeM3,
    estimatedSteelKg: g.estimatedSteelKg,
    projectId: g.projectId,
    orderId: g.orderId,
    tags: g.tags,
    warnings: g.warnings,
    visualTone: tone,
    isPreview: tone === 'preview',
  }
}

function planToGeneral(p: PlanItem, unit: PlanningUnitKey, linkedProductId: string): GeneralPlanItem {
  return {
    id: p.id,
    unit,
    resourceId: p.moldId,
    linkedProductId,
    title: p.title,
    productId: p.productId,
    imageUrl: p.imageUrl,
    startAt: p.startAt,
    endAt: p.endAt,
    durationHours: p.durationHours,
    status: p.status,
    priority: p.priority,
    concreteRecipeId: p.concreteRecipeId,
    estimatedVolumeM3: p.estimatedVolumeM3,
    estimatedSteelKg: p.estimatedSteelKg,
    projectId: p.projectId,
    orderId: p.orderId,
    tags: p.tags,
    warnings: p.warnings,
  }
}

export function PlanningTimelineView({ variant }: PlanningTimelineProps) {
  const gp = useGeneralPlanningOptional()
  const lockedPageMeta = LOCKED_UNIT_PAGE_META[variant]
  const isLockedUnitPage = lockedPageMeta != null
  const isGeneral = (variant === 'general' || isLockedUnitPage) && gp != null
  const { t, locale } = useI18n()
  const loc = locale === 'en' ? 'en-GB' : 'tr-TR'
  const access = useGeneralPlanningAccess()
  const { selectedFactory } = useFactoryContext()
  const workQueue = useWorkQueue()
  const planningWizard = usePlanningWizardOptional()

  const crossUnitPlanItems: GeneralPlanItem[] = gp?.items ?? []

  const cardDisplayMode: PlanCardDisplayMode =
    isGeneral && gp?.activeUnit === 'planning' ? 'coordinator' : 'ops'

  const unitConfig = isGeneral && gp ? getUnitConfig(gp.activeUnit) : null
  const timelineUsesShifts =
    !isGeneral || !unitConfig ? true : unitConfig.timelineUsesShifts !== false
  const isDispatchTimeline =
    variant === 'dispatch' || (isGeneral && gp?.activeUnit === 'dispatch')
  const isProductionTimeline =
    variant === 'production' || (isGeneral && gp?.activeUnit === 'production')
  const slotsPerDay = PLANNING_SHIFTS.length
  const PLANNING_RESOURCES: TimelineResourceRow[] = isGeneral && gp
    ? resourcesForUnit(gp.activeUnit).map((r) => ({
        moldId: r.resourceId,
        name: r.name,
        lineHint: r.lineHint,
        hatNo: r.hatNo,
        maxConcurrent: r.maxConcurrent,
        vehicleType: r.vehicleType,
      }))
    : PLANNING_MOLDS.map((m) => ({
        moldId: m.moldId,
        name: m.name,
        lineHint: m.lineHint,
        hatNo: m.hatNo,
        maxConcurrent: m.maxConcurrent,
      }))

  const canEdit = isGeneral && gp ? access.canEditUnit(gp.activeUnit) : true

  const showToolbarAction = (id: PlanningToolbarActionId) => {
    if (!isGeneral) return true
    if (!unitConfig?.toolbarActions.includes(id)) return false
    const perm = TOOLBAR_ACTION_PERMISSIONS[id]
    return access.hasPermission(perm)
  }

  const [weekStartMondayLocal, setWeekStartMondayLocal] = useState(() =>
    mondayOfWeekUtc(new Date('2026-03-24T12:00:00.000Z')),
  )
  const weekStartMonday = isGeneral && gp ? gp.weekStartMonday : weekStartMondayLocal
  const setWeekStartMonday =
    isGeneral && gp ? gp.setWeekStartMonday : setWeekStartMondayLocal

  const [dayCount] = useState(14)
  const [zoom, setZoom] = useState(55)
  const [workdaysOnly, setWorkdaysOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [dailyWorkOrderOpen, setDailyWorkOrderOpen] = useState(false)
  const [dailyWorkOrderToast, setDailyWorkOrderToast] = useState<string | null>(null)
  const [dailyReportOpen, setDailyReportOpen] = useState(false)
  const [dailyReportToast, setDailyReportToast] = useState<string | null>(null)
  const [planningQueueToast, setPlanningQueueToast] = useState<string | null>(null)
  const [draftStateLocal, setDraftStateLocal] = useState<'draft' | 'published'>('draft')
  const draftState = isGeneral && gp ? gp.draftState : draftStateLocal
  const setDraftState = isGeneral && gp ? gp.setDraftState : setDraftStateLocal

  const [itemsLocal, setItemsLocal] = useState<PlanItem[]>(() => INITIAL_PLAN_ITEMS.map((x) => ({ ...x })))
  const allGeneralItems = gp?.items ?? []
  const unitFilteredGeneral = useMemo(() => {
    if (!isGeneral || !gp) return []
    return allGeneralItems.filter((it) => it.unit === gp.activeUnit).map(generalToPlanItem)
  }, [allGeneralItems, gp, isGeneral])

  const items: PlanItem[] = isGeneral && gp ? unitFilteredGeneral : itemsLocal

  const displayItems: TimelineDisplayItem[] = useMemo(() => {
    const committed: TimelineDisplayItem[] = items.map((it) => ({
      ...it,
      visualTone: 'committed' as const,
      isPreview: false,
    }))
    if (!isGeneral || !gp || !planningWizard) return committed
    const previews = previewItemsForUnit(planningWizard.previewItems, gp.activeUnit).map(
      (g) => generalToPlanItem(g),
    )
    return [...committed, ...previews]
  }, [items, isGeneral, gp, planningWizard?.previewItems])

  const setItems = useCallback(
    (action: React.SetStateAction<PlanItem[]>) => {
      if (!isGeneral || !gp) {
        setItemsLocal(action)
        return
      }
      const prevUnit = unitFilteredGeneral
      const nextUnit =
        typeof action === 'function' ? (action as (p: PlanItem[]) => PlanItem[])(prevUnit) : action
      gp.setItems((all) => {
        const other = all.filter((it) => it.unit !== gp.activeUnit)
        const mapped = nextUnit.map((p) => planToGeneral(p, gp.activeUnit, p.productId))
        return [...other, ...mapped]
      })
    },
    [gp, isGeneral, unitFilteredGeneral],
  )

  const [planHistoryLocal, setPlanHistoryLocal] = useState<{
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

  const planHistory = isGeneral && gp ? gp.planHistory : planHistoryLocal

  const manufacturedQueueItems = useMemo(() => {
    if (!isGeneral || !gp) return []
    if (gp.activeUnit !== 'dispatch' && gp.activeUnit !== 'assembly') return []
    return workQueue
      .getManufacturedProducts(selectedFactory.code)
      .map((mp) =>
        manufacturedProductToQueueItem(
          mp,
          gp.activeUnit === 'assembly' ? 'assembly' : 'dispatch',
        ),
      )
  }, [gp, isGeneral, selectedFactory.code, workQueue])

  const queueItems = useMemo(() => {
    if (!isGeneral || !gp) return QUEUE_MOCK
    const base = GENERAL_PLAN_QUEUE[gp.activeUnit]
    if (gp.activeUnit === 'dispatch' || gp.activeUnit === 'assembly') {
      return [...manufacturedQueueItems, ...base]
    }
    return base
  }, [gp, isGeneral, manufacturedQueueItems])

  const resourceColumnLabel = isGeneral && unitConfig
    ? t(unitConfig.resourceColumnLabelKey)
    : 'Kalıp'

  const filterResourceLabel = isGeneral && unitConfig
    ? t(unitConfig.filterResourceLabelKey)
    : 'Kalıp'

  const showProjectFilter = Boolean(isGeneral && unitConfig?.filters.includes('project'))
  const filtersDrawerHint = showProjectFilter
    ? t('dispatchPlanning.filtersDrawerHint')
    : 'Arama, kalıp, durum ve iş günü'

  const statusKeysForFilter = isGeneral && unitConfig
    ? unitConfig.statusOptions
    : (Object.keys(STATUS_META) as PlanStatusKey[])
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [leftDrawerTab, setLeftDrawerTab] = useState<'filters' | 'queue' | 'truckLoad'>('filters')
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)

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
  const [assignOpen, setAssignOpen] = useState<{ moldId: string; slot: number } | null>(null)
  const [truckLoadOpen, setTruckLoadOpen] = useState<{ moldId: string; slotStart: number } | null>(
    null,
  )
  /** Sevkiyat: false → özet kart + modal; true → klasik görünüm (ürün başına ayrı kart). */
  const [dispatchExpandedTimeline, setDispatchExpandedTimeline] = useState(false)
  const [nonProdModal, setNonProdModal] = useState<{ moldId: string; slot: number; itemId: string } | null>(
    null,
  )
  const planningAssignMockTitleId = useId()
  const planningNonProdMockTitleId = useId()

  const [statusFilter, setStatusFilter] = useState<PlanStatusKey[]>([])
  const [moldFilter, setMoldFilter] = useState<string[]>([])
  const [projectFilter, setProjectFilter] = useState<string[]>([])

  const gridScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setProjectFilter([])
    setDispatchExpandedTimeline(false)
  }, [gp?.activeUnit])

  const projectFilterOptions = useMemo(() => {
    if (!showProjectFilter) return []
    const codes = new Set<string>()
    for (const it of items) {
      if (it.projectId) codes.add(it.projectId)
    }
    return [...codes]
      .sort((a, b) => a.localeCompare(b, 'tr'))
      .map((code) => {
        const card = projectManagementByCode.get(code)
        return {
          code,
          label: card ? `${card.code} · ${card.name}` : code,
        }
      })
  }, [items, showProjectFilter])

  const activePlanningFilterCount = useMemo(
    () =>
      moldFilter.length +
      statusFilter.length +
      projectFilter.length +
      (search.trim() ? 1 : 0) +
      (workdaysOnly ? 1 : 0),
    [moldFilter, statusFilter, projectFilter, search, workdaysOnly],
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

  const totalSlots = visibleDays.length * slotsPerDay
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
      if (!timelineUsesShifts) return dayIdx * slotsPerDay
      const shift = hourToShiftIndexUtc(t.getUTCHours())
      return dayIdx * slotsPerDay + shift
    },
    [visibleDays, timelineUsesShifts, slotsPerDay],
  )

  const placementByItem = useMemo(() => {
    const map = new Map<
      string,
      { slotStart: number; span: number; moldId: string; visible: boolean }
    >()
    for (const it of displayItems) {
      const slotStart = slotIndexForItem(it.startAt)
      const span = Math.min(
        spanSlotsFromDurationForMode(it.durationHours, timelineUsesShifts),
        totalSlots,
      )
      const visible = slotStart >= 0 && slotStart < totalSlots
      map.set(it.id, {
        slotStart: visible ? slotStart : -1,
        span: visible ? Math.min(span, totalSlots - slotStart) : 0,
        moldId: it.moldId,
        visible,
      })
    }
    return map
  }, [displayItems, slotIndexForItem, totalSlots, timelineUsesShifts])

  const capacityIssue = useMemo(() => {
    const bad = new Set<string>()
    const mold = new Map(PLANNING_RESOURCES.map((m) => [m.moldId, m]))
    for (const it of displayItems) {
      const meta = mold.get(it.moldId)
      if (!meta) continue
      const slotStart = slotIndexForItem(it.startAt)
      const span = Math.min(
        spanSlotsFromDurationForMode(it.durationHours, timelineUsesShifts),
        totalSlots,
      )
      if (slotStart < 0) continue
      const concurrent = displayItems.filter((o) => {
        if (o.moldId !== it.moldId || o.id === it.id) return false
        const oStart = slotIndexForItem(o.startAt)
        const oSpan = Math.min(
          spanSlotsFromDurationForMode(o.durationHours, timelineUsesShifts),
          totalSlots,
        )
        if (oStart < 0) return false
        return itemsOverlapSlotRange(slotStart, span, oStart, oSpan)
      }).length
      if (concurrent + 1 > meta.maxConcurrent) bad.add(it.id)
    }
    return bad
  }, [displayItems, slotIndexForItem, totalSlots, timelineUsesShifts, PLANNING_RESOURCES])

  const filteredItems = useMemo(() => {
    let list = displayItems
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
    if (projectFilter.length) {
      list = list.filter((it) => it.projectId != null && projectFilter.includes(it.projectId))
    }
    return list
  }, [displayItems, search, moldFilter, statusFilter, projectFilter])

  /** Sevkiyat: kamyon + gün hücresindeki ürün grupları (sayfa uzamasın diye tek kart). */
  const dispatchTripGroups = useMemo(() => {
    const groups = new Map<string, TimelineDisplayItem[]>()
    if (!isDispatchTimeline) return groups

    const assigned = new Set<string>()
    for (const it of filteredItems) {
      if (assigned.has(it.id)) continue
      const peers = planItemsOnSameVehicleTrip(
        displayItems,
        it,
        slotIndexForItem,
        timelineUsesShifts,
      ) as TimelineDisplayItem[]
      peers.forEach((p) => assigned.add(p.id))
      const slotStart = slotIndexForItem(it.startAt)
      if (slotStart < 0) continue
      const snapped = snapTimelineSlot(slotStart, timelineUsesShifts)
      groups.set(`${it.moldId}:${snapped}`, peers)
    }
    return groups
  }, [filteredItems, isDispatchTimeline, displayItems, slotIndexForItem, timelineUsesShifts])

  const moldRowHeights = useMemo(() => {
    const heights: Record<string, number> = {}
    for (const mold of PLANNING_RESOURCES) {
      heights[mold.moldId] = BODY_ROW_BASE_MIN
    }
    return heights
  }, [PLANNING_RESOURCES])

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const moldNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of PLANNING_RESOURCES) map.set(m.moldId, m.name)
    return map
  }, [PLANNING_RESOURCES])

  useEffect(() => {
    if (!dailyWorkOrderToast) return
    const timer = window.setTimeout(() => setDailyWorkOrderToast(null), 5000)
    return () => window.clearTimeout(timer)
  }, [dailyWorkOrderToast])

  useEffect(() => {
    if (!dailyReportToast) return
    const timer = window.setTimeout(() => setDailyReportToast(null), 5000)
    return () => window.clearTimeout(timer)
  }, [dailyReportToast])

  useEffect(() => {
    if (!planningQueueToast) return
    const timer = window.setTimeout(() => setPlanningQueueToast(null), 4500)
    return () => window.clearTimeout(timer)
  }, [planningQueueToast])

  const dailyWorkOrderDefaultDay = useMemo(
    () =>
      resolveDefaultProductionDayIso(
        items,
        visibleDays.map((d) => d.date),
        todayIso,
        dayDetailDate,
      ),
    [items, visibleDays, todayIso, dayDetailDate],
  )

  const dailyWorkOrderVisibleRange = useMemo(() => {
    if (visibleDays.length === 0) return undefined
    return { min: visibleDays[0]!.date, max: visibleDays[visibleDays.length - 1]!.date }
  }, [visibleDays])

  const dailyReportDefaultDay = useMemo(
    () =>
      previousBusinessDayIso(new Date(), {
        skipNonProductionDays: (iso) =>
          visibleDays.some((d) => d.date === iso && d.isNonProduction),
      }),
    [visibleDays],
  )

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
    for (const m of PLANNING_RESOURCES) byMold.set(m.moldId, { jobCount: 0, volumeM3: 0 })
    for (const it of dayItems) {
      const cur = byMold.get(it.moldId) ?? { jobCount: 0, volumeM3: 0 }
      cur.jobCount += 1
      cur.volumeM3 += it.estimatedVolumeM3
      byMold.set(it.moldId, cur)
    }
    const moldRows = PLANNING_RESOURCES.map((m) => ({
      moldId: m.moldId,
      jobCount: byMold.get(m.moldId)?.jobCount ?? 0,
      volumeM3: byMold.get(m.moldId)?.volumeM3 ?? 0,
    })).filter((r) => r.jobCount > 0)
    const jobRows = dayItems.map((it) => {
      const slot = slotIndexForItem(it.startAt)
      const si = Math.max(0, slot % slotsPerDay)
      return {
        itemId: it.id,
        title: it.title,
        shiftLabel: timelineUsesShifts ? (PLANNING_SHIFTS[si]?.label ?? '—') : null,
        statusKey: it.status,
      }
    })
    return { day: d, moldRows, jobRows, dayItems }
  }, [dayDetailDate, items, visibleDays, slotIndexForItem, slotsPerDay, timelineUsesShifts])

  const appendCheckpoint = useCallback(
    (nextItems: PlanItem[], label: string, note?: string) => {
      if (isGeneral && gp) {
        const other = gp.items.filter((it) => it.unit !== gp.activeUnit)
        const mapped = nextItems.map((p) => planToGeneral(p, gp.activeUnit, p.productId))
        gp.appendCheckpoint([...other, ...mapped], label, note)
        return
      }
      const cloned = clonePlanItems(nextItems)
      setPlanHistoryLocal((ph) => {
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
      setItemsLocal(cloned)
    },
    [gp, isGeneral],
  )

  const restoreCheckpoint = useCallback(
    (index: number) => {
      if (isGeneral && gp) {
        gp.restoreCheckpoint(index)
        return
      }
      setPlanHistoryLocal((ph) => {
        if (index < 0 || index >= ph.checkpoints.length) return ph
        const nextItems = clonePlanItems(ph.checkpoints[index].items)
        setItemsLocal(nextItems)
        return { ...ph, cursor: index }
      })
    },
    [gp, isGeneral],
  )

  const updateCheckpointNote = useCallback(
    (index: number, note: string) => {
      if (isGeneral && gp) {
        gp.updateCheckpointNote(index, note)
        return
      }
      const trimmed = note.trim()
      setPlanHistoryLocal((ph) => {
        if (index < 0 || index >= ph.checkpoints.length) return ph
        const checkpoints = ph.checkpoints.map((c, i) =>
          i === index ? { ...c, note: trimmed || undefined } : c,
        )
        return { ...ph, checkpoints }
      })
    },
    [gp, isGeneral],
  )

  const saveDraftAndResetHistory = useCallback(() => {
    if (!canEdit) return
    const ok = window.confirm(
      'Taslağı kaydetmek istiyor musunuz? Kaydettikten sonra yerel adım geçmişi sıfırlanır; bundan sonra yalnızca bu kayıtlı plan üzerinde yeni geçmiş tutulur.',
    )
    if (!ok) return
    const snapshot = clonePlanItems(itemsRef.current)
    setDraftState('draft')
    if (isGeneral && gp) {
      gp.setPlanHistory({
        checkpoints: [
          {
            id: `gp-cp-saved-${Date.now()}`,
            items: gp.items.map((x) => ({ ...x })),
            label: 'Kayıt sonrası',
            atMs: Date.now(),
          },
        ],
        cursor: 0,
      })
    } else {
      setPlanHistoryLocal({
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
    }
  }, [canEdit, gp, isGeneral])

  const wouldViolateMaxConcurrent = useCallback(
    (candidateItemId: string | null, moldId: string, slotStart: number, span: number) => {
      const meta = PLANNING_RESOURCES.find((m) => m.moldId === moldId)
      if (!meta) return false

      const concurrent = items
        .filter((it) => it.moldId === moldId && it.id !== candidateItemId)
        .map((it) => {
          const otherStart = slotIndexForItem(it.startAt)
          if (otherStart < 0) return null
          return {
            otherStart,
            otherSpan: spanSlotsFromDurationForMode(it.durationHours, timelineUsesShifts),
          }
        })
        .filter((x): x is { otherStart: number; otherSpan: number } => x !== null)
        .filter(({ otherStart, otherSpan }) =>
          itemsOverlapSlotRange(slotStart, span, otherStart, otherSpan),
        ).length

      return concurrent + 1 > meta.maxConcurrent
    },
    [items, slotIndexForItem, timelineUsesShifts],
  )

  const shiftMoldItems = useCallback(
    (moldId: string, deltaSlots: number) => {
      if (!canEdit || deltaSlots === 0) return
      const moldItems = items.filter((it) => it.moldId === moldId)
      if (!moldItems.length) return
      const delta = timelineUsesShifts ? deltaSlots : deltaSlots * slotsPerDay

      const plan = moldItems.map((it) => {
        const oldSlot = slotIndexForItem(it.startAt)
        if (oldSlot < 0) return null
        const nextSlot = oldSlot + delta
        if (nextSlot < 0 || nextSlot >= totalSlots) return null
        return { itemId: it.id, nextSlot }
      })
      if (plan.some((x) => x === null)) return

      const slotById = new Map(plan.map((x) => [x!.itemId, x!.nextSlot]))
      const nextItems = items.map((it) => {
        if (it.moldId !== moldId) return it
        const nextSlot = slotById.get(it.id)
        if (nextSlot === undefined) return it
        const { startAt } = isoFromSlotVisibleForMode(visibleDays, nextSlot, timelineUsesShifts)
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
    [
      appendCheckpoint,
      canEdit,
      items,
      slotIndexForItem,
      slotsPerDay,
      timelineUsesShifts,
      totalSlots,
      visibleDays,
    ],
  )

  const applyMove = useCallback(
    (itemId: string, moldId: string, slot: number, skipNonProdCheck?: boolean) => {
      const snapped = snapTimelineSlot(slot, timelineUsesShifts)
      const prev = items.find((i) => i.id === itemId)
      const { startAt, durationHours: slotDur } = isoFromSlotVisibleForMode(
        visibleDays,
        snapped,
        timelineUsesShifts,
      )
      const dur = prev?.durationHours ?? slotDur
      const span = spanSlotsFromDurationForMode(dur, timelineUsesShifts)

      if (wouldViolateMaxConcurrent(itemId, moldId, snapped, span)) return

      const day = visibleDays[Math.floor(snapped / slotsPerDay)]
      if (day?.isNonProduction && !skipNonProdCheck) {
        setNonProdModal({ moldId, slot: snapped, itemId })
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
    [
      appendCheckpoint,
      items,
      slotsPerDay,
      timelineUsesShifts,
      visibleDays,
      wouldViolateMaxConcurrent,
    ],
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
        setLeftDrawerOpen(false)
        setHistoryDrawerOpen(false)
        setSelectedId(null)
        setAssignOpen(null)
        setTruckLoadOpen(null)
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
      let next = Math.max(1, Math.min(startSpan + add, totalSlots - slotStart))
      if (!timelineUsesShifts) {
        next = Math.max(slotsPerDay, Math.round(next / slotsPerDay) * slotsPerDay)
      }
      if (!resizingItem) return
      // maxConcurrent=1 kuralı: aynı kalıpta çakışmaya izin vermiyoruz.
      if (wouldViolateMaxConcurrent(itemId, resizingItem.moldId, slotStart, next)) return
      setItems((list) =>
        list.map((x) => {
          if (x.id !== itemId) return x
          const dur = timelineUsesShifts ? next * 8 : (next / slotsPerDay) * 24
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
        appendCheckpoint(
          after,
          timelineUsesShifts ? 'Süre (vardiya) güncellendi' : 'Süre (gün) güncellendi',
        )
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

  const selected = displayItems.find((i) => i.id === selectedId) ?? null

  const selectedTruckLoad = useMemo(() => {
    if (!selected || !isDispatchTimeline) return []
    return planItemsOnSameVehicleTrip(displayItems, selected, slotIndexForItem, timelineUsesShifts)
  }, [items, isDispatchTimeline, selected, slotIndexForItem, timelineUsesShifts])

  const assignTruckLoad = useMemo(() => {
    if (!assignOpen || !isDispatchTimeline) return []
    const snapped = snapTimelineSlot(assignOpen.slot, timelineUsesShifts)
    return dispatchTripGroups.get(`${assignOpen.moldId}:${snapped}`) ?? []
  }, [assignOpen, dispatchTripGroups, isDispatchTimeline, timelineUsesShifts])

  const truckLoadOpenItems = useMemo(() => {
    if (!truckLoadOpen) return []
    return dispatchTripGroups.get(`${truckLoadOpen.moldId}:${truckLoadOpen.slotStart}`) ?? []
  }, [dispatchTripGroups, truckLoadOpen])

  const truckLoadDrawerTone = useMemo(() => {
    if (!truckLoadOpen) return null
    const mold = PLANNING_RESOURCES.find((m) => m.moldId === truckLoadOpen.moldId)
    return mold?.vehicleType ? DISPATCH_VEHICLE_TONES[mold.vehicleType] : null
  }, [PLANNING_RESOURCES, truckLoadOpen])

  const openTruckLoadDrawer = useCallback(
    (payload: { moldId: string; slotStart: number }) => {
      setTruckLoadOpen(payload)
      setLeftDrawerTab('truckLoad')
      setLeftDrawerOpen(true)
    },
    [],
  )

  const closeLeftDrawer = useCallback(() => {
    setLeftDrawerOpen(false)
    setTruckLoadOpen(null)
  }, [])

  const openLeftDrawerTab = useCallback((tab: 'filters' | 'queue') => {
    setTruckLoadOpen(null)
    setLeftDrawerTab(tab)
    setLeftDrawerOpen(true)
  }, [])

  const rightInsightOpen =
    historyDrawerOpen || Boolean(dayDetailDate && dayDetailData) || Boolean(selected)

  return (
    <>
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[1.25rem]">
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2">
        <div className="px-[0.6875rem] py-1">
          <nav aria-label={t('project.breadcrumbAria')} className="mb-0">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              {lockedPageMeta ? (
                <>
                  <li className="font-medium text-slate-600 dark:text-slate-300">
                    {t(lockedPageMeta.sectionLabelKey)}
                  </li>
                  <li className="flex items-center gap-1" aria-hidden>
                    <ChevronRight className="size-3.5 shrink-0 opacity-70" />
                  </li>
                  <li
                    className="font-semibold text-slate-800 dark:text-slate-100"
                    aria-current="page"
                  >
                    {t(lockedPageMeta.pageLabelKey)}
                  </li>
                </>
              ) : (
                <>
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
                  <li
                    className="font-semibold text-slate-800 dark:text-slate-100"
                    aria-current="page"
                  >
                    {variant === 'general' ? t('nav.generalPlanning') : t('nav.planningDesign')}
                  </li>
                </>
              )}
            </ol>
          </nav>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/45">
          <div
            className="gm-planning-design-view flex min-h-0 flex-1 flex-col"
            style={{ ['--gm-planning-mold-rail' as string]: `${MOLD_COL_PX}px` }}
          >
            <div className="gm-planning-design-shell flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
              <div className="gm-planning-toolbar relative z-[75] grid min-h-11 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 overflow-visible border-b border-slate-200/70 px-3 py-2 dark:border-slate-700/50 md:gap-3">
                <div className="flex min-w-0 flex-wrap items-center justify-self-start gap-2">
                  {variant === 'general' && gp ? (
                    <div
                      className="flex flex-wrap gap-1 rounded-lg border border-slate-200/70 bg-white/60 p-0.5 dark:border-slate-700/70 dark:bg-slate-900/40"
                      role="tablist"
                      aria-label={t('generalPlanning.unitPickerAria')}
                    >
                      {access.allowedUnits.map((u) => (
                        <button
                          key={u}
                          type="button"
                          role="tab"
                          aria-selected={gp.activeUnit === u}
                          onClick={() => gp.setActiveUnit(u)}
                          className={[
                            'rounded-md px-2 py-1 text-[11px] font-semibold transition',
                            gp.activeUnit === u
                              ? 'bg-sky-600 text-white dark:bg-sky-500'
                              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80',
                          ].join(' ')}
                        >
                          {t(PLANNING_UNIT_LABEL_KEYS[u])}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {planningWizard ? (
                    <button
                      type="button"
                      onClick={() => {
                        const next = !planningWizard.actionsDrawerOpen
                        planningWizard.setActionsDrawerOpen(next)
                        if (next) closeLeftDrawer()
                      }}
                      aria-expanded={planningWizard.actionsDrawerOpen}
                      aria-controls="gm-planning-actions-drawer"
                      className={eiSplitFilterToggleClass(planningWizard.actionsDrawerOpen)}
                    >
                      <Sparkles className="size-3.5 shrink-0" aria-hidden />
                      {t('planningActions.cta')}
                    </button>
                  ) : null}
                  {showToolbarAction('filters') ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (planningWizard?.actionsDrawerOpen) {
                        planningWizard.setActionsDrawerOpen(false)
                      }
                      if (leftDrawerOpen && leftDrawerTab === 'filters') closeLeftDrawer()
                      else openLeftDrawerTab('filters')
                    }}
                    aria-expanded={leftDrawerOpen && leftDrawerTab === 'filters'}
                    aria-controls="gm-planning-left-drawer"
                    className={eiSplitFilterToggleClass(leftDrawerOpen && leftDrawerTab === 'filters')}
                  >
                    <Filter className="size-3.5 shrink-0" aria-hidden />
                    Filtrele
                    {activePlanningFilterCount > 0 ? (
                      <span className="rounded-full bg-sky-500/25 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-sky-900 dark:bg-sky-400/20 dark:text-sky-100">
                        {activePlanningFilterCount}
                      </span>
                    ) : null}
                  </button>
                  ) : null}
                  <FilterToolbarSearch
                    id={
                      lockedPageMeta?.toolbarSearchId ??
                      (variant === 'general'
                        ? 'general-planning-toolbar-search'
                        : 'planning-design-toolbar-search')
                    }
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Ürün / emir / proje…"
                    ariaLabel={t('planningDesign.toolbarSearchAria')}
                    className="min-w-[12rem] flex-1 basis-[14rem] sm:max-w-xs sm:flex-initial"
                  />
                  {showToolbarAction('queue') && (!isGeneral || unitConfig?.queueEnabled) ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (leftDrawerOpen && leftDrawerTab === 'queue') closeLeftDrawer()
                      else openLeftDrawerTab('queue')
                    }}
                    aria-expanded={leftDrawerOpen && leftDrawerTab === 'queue'}
                    aria-controls="gm-planning-left-drawer"
                    className={[
                      'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40',
                      leftDrawerOpen && leftDrawerTab === 'queue'
                        ? 'border-sky-300/70 bg-sky-100/70 text-sky-900 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100'
                        : 'border-slate-200/70 bg-white/70 text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200',
                    ].join(' ')}
                  >
                    <ListOrdered className="size-3.5 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">Bekleyen iş</span>
                    <span className="sm:hidden">Kuyruk</span>
                  </button>
                  ) : null}
                  {isDispatchTimeline ? (
                    <button
                      type="button"
                      onClick={() => setDispatchExpandedTimeline((v) => !v)}
                      aria-pressed={dispatchExpandedTimeline}
                      title={
                        dispatchExpandedTimeline
                          ? t('dispatchPlanning.timelineView.compactHint')
                          : t('dispatchPlanning.timelineView.expandedHint')
                      }
                      className={[
                        'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40',
                        dispatchExpandedTimeline
                          ? 'border-sky-300/70 bg-sky-100/70 text-sky-900 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100'
                          : 'border-slate-200/70 bg-white/70 text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200',
                      ].join(' ')}
                    >
                      <Layers className="size-3.5 shrink-0" aria-hidden />
                      <span className="hidden sm:inline">
                        {dispatchExpandedTimeline
                          ? t('dispatchPlanning.timelineView.compact')
                          : t('dispatchPlanning.timelineView.expanded')}
                      </span>
                    </button>
                  ) : null}
                  {isDispatchTimeline && !dispatchExpandedTimeline ? (
                    <div
                      className="hidden items-center gap-2 border-l border-slate-200/70 pl-2 dark:border-slate-700/70 lg:flex"
                      aria-label={t('dispatchPlanning.vehicleType.legendAria')}
                    >
                      {(['tir', 'kamyon', 'lowbed'] as const).map((vt) => (
                        <span
                          key={vt}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                        >
                          <span
                            className={`size-2.5 shrink-0 rounded-sm ${
                              vt === 'tir'
                                ? 'bg-sky-500'
                                : vt === 'kamyon'
                                  ? 'bg-amber-500'
                                  : 'bg-violet-500'
                            }`}
                            aria-hidden
                          />
                          {t(`dispatchPlanning.vehicleType.${vt}`)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center justify-center gap-1.5 md:gap-2">
                  <button
                    type="button"
                    onClick={() => goToday()}
                    className="inline-flex items-center rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-800/80 md:px-3 md:py-2 md:text-sm"
                  >
                    Bugün
                  </button>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200/70 bg-white/70 p-1.5 text-slate-700 transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-800/80 md:p-2"
                    aria-label="Önceki hafta"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200/70 bg-white/70 p-1.5 text-slate-700 transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-800/80 md:p-2"
                    aria-label="Sonraki hafta"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex min-w-0 flex-wrap items-center justify-end justify-self-end gap-1.5 md:gap-2">
                  {isProductionTimeline ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setDailyWorkOrderOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300/70 bg-sky-600 px-2 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:border-sky-500/60 dark:bg-sky-500 dark:hover:bg-sky-600 md:py-2 md:text-sm"
                      >
                        <ClipboardList className="size-3.5 shrink-0" aria-hidden />
                        <span className="hidden lg:inline">{t('productionPlanning.dailyOrder.cta')}</span>
                        <span className="lg:hidden">{t('productionPlanning.dailyOrder.ctaShort')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDailyReportOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/70 bg-white/80 px-2 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:border-slate-600/60 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-800/80 md:py-2 md:text-sm"
                      >
                        <FileText className="size-3.5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
                        <span className="hidden lg:inline">{t('productionPlanning.dailyReport.cta')}</span>
                        <span className="lg:hidden">{t('productionPlanning.dailyReport.ctaShort')}</span>
                      </button>
                    </>
                  ) : null}
                  {showToolbarAction('undo') ? (
                  <button
                    type="button"
                    disabled={!canEdit || planHistory.cursor <= 0}
                    onClick={() => restoreCheckpoint(planHistory.cursor - 1)}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 bg-white/70 text-slate-700 transition hover:bg-white disabled:opacity-35 dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-800/80"
                    title="Önceki adım (⌘Z / Ctrl+Z)"
                    aria-label="Önceki adım"
                  >
                    <Undo2 className="h-4 w-4" aria-hidden />
                  </button>
                  ) : null}
                  {showToolbarAction('redo') ? (
                  <button
                    type="button"
                    disabled={!canEdit || planHistory.cursor >= planHistory.checkpoints.length - 1}
                    onClick={() => restoreCheckpoint(planHistory.cursor + 1)}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 bg-white/70 text-slate-700 transition hover:bg-white disabled:opacity-35 dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-800/80"
                    title="İleri (⇧⌘Z / Ctrl+Shift+Z)"
                    aria-label="İleri"
                  >
                    <Redo2 className="h-4 w-4" aria-hidden />
                  </button>
                  ) : null}
                  {showToolbarAction('history') ? (
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryDrawerOpen((prev) => {
                        const next = !prev
                        if (next) {
                          setDayDetailDate(null)
                          setSelectedId(null)
                        }
                        return next
                      })
                    }}
                    aria-expanded={historyDrawerOpen}
                    aria-controls="gm-planning-history-drawer"
                    className={[
                      'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40',
                      historyDrawerOpen
                        ? 'border-sky-300/70 bg-sky-100/70 text-sky-900 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100'
                        : 'border-slate-200/70 bg-white/70 text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200',
                    ].join(' ')}
                  >
                    <History className="size-3.5 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">Geçmiş</span>
                  </button>
                  ) : null}
                  {showToolbarAction('save') ? (
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={saveDraftAndResetHistory}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 disabled:opacity-50 dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-800/80 md:py-2 md:text-sm"
                  >
                    <Save className="h-4 w-4" />
                    Kaydet
                  </button>
                  ) : null}
                  {showToolbarAction('publish') ? (
                  <button
                    type="button"
                    disabled={!canEdit || draftState === 'published'}
                    onClick={() => {
                      if (!canEdit) return
                      setDraftState('published')
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 disabled:opacity-50 dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-800/80 md:py-2 md:text-sm"
                  >
                    <Send className="h-4 w-4" />
                    Yayınla
                  </button>
                  ) : null}
                </div>
              </div>

              {!canEdit ? (
                <div className="shrink-0 border-b border-amber-200/60 bg-amber-50/90 px-3 py-2 text-xs font-medium text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                  Salt okunur: sürükle-bırak ve yeniden boyutlandırma kapalı.
                </div>
              ) : null}

              {dailyWorkOrderToast ? (
                <div className="shrink-0 border-b border-emerald-200/70 bg-emerald-50/95 px-3 py-2 text-xs font-medium text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/35 dark:text-emerald-100">
                  {dailyWorkOrderToast}
                </div>
              ) : null}

              {dailyReportToast ? (
                <div className="shrink-0 border-b border-sky-200/70 bg-sky-50/95 px-3 py-2 text-xs font-medium text-sky-950 dark:border-sky-900/40 dark:bg-sky-950/35 dark:text-sky-100">
                  {dailyReportToast}
                </div>
              ) : null}

              {planningQueueToast ? (
                <div className="shrink-0 border-b border-amber-200/70 bg-amber-50/95 px-3 py-2 text-xs font-medium text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/35 dark:text-amber-100">
                  {planningQueueToast}
                </div>
              ) : null}

              <div className="relative z-0 min-h-0 flex-1 overflow-hidden">
                {planningWizard ? <PlanningActionsHost onTimelinePage /> : null}
                <aside
                  id="gm-planning-left-drawer"
                  className={[
                    'absolute inset-y-0 left-0 z-20 w-80 overflow-y-auto rounded-r-xl border border-slate-200/70 bg-white p-3 shadow-xl transition-transform duration-200 ease-out will-change-transform dark:border-slate-700/70 dark:bg-slate-900',
                    leftDrawerOpen ? 'translate-x-0' : '-translate-x-[105%] pointer-events-none',
                  ].join(' ')}
                  aria-hidden={!leftDrawerOpen}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {leftDrawerTab === 'filters'
                          ? 'Plan filtreleri'
                          : leftDrawerTab === 'queue'
                            ? 'Bekleyen iş'
                            : truckLoadOpen
                              ? t('dispatchPlanning.truckLoad.title', {
                                  vehicle: truckLoadOpen.moldId,
                                  count: String(truckLoadOpenItems.length),
                                })
                              : t('dispatchPlanning.truckLoad.viewProducts')}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {leftDrawerTab === 'filters'
                          ? filtersDrawerHint
                          : leftDrawerTab === 'queue'
                            ? 'Sürükleyip takvime bırakın · Esc ile kapat'
                            : t('dispatchPlanning.truckLoad.hint')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeLeftDrawer}
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      aria-label="Paneli kapat"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  {leftDrawerTab === 'filters' ? (
                    <div className="space-y-4" role="region" aria-label="Üretim planı filtreleri">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                          Arama
                        </label>
                        <input
                          type="search"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Ürün / emir / proje…"
                          title="Ürün / emir / proje"
                          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                      {showProjectFilter ? (
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                              {t('generalPlanning.filter.project')}
                            </p>
                            {projectFilter.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => setProjectFilter([])}
                                className="text-[11px] font-medium text-sky-700 hover:underline dark:text-sky-300"
                              >
                                Temizle
                              </button>
                            ) : null}
                          </div>
                          {projectFilterOptions.length ? (
                            <div className="mt-2 flex flex-col gap-1.5">
                              {projectFilterOptions.map((p) => {
                                const on = projectFilter.includes(p.code)
                                return (
                                  <button
                                    key={p.code}
                                    type="button"
                                    onClick={() =>
                                      setProjectFilter((prev) =>
                                        on ? prev.filter((x) => x !== p.code) : [...prev, p.code],
                                      )
                                    }
                                    title={p.label}
                                    className={`rounded-lg px-2.5 py-1.5 text-left text-xs font-medium leading-snug ${
                                      on
                                        ? 'border border-sky-300/70 bg-sky-100/70 text-sky-900 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100'
                                        : 'bg-white text-slate-700 ring-1 ring-slate-300/70 dark:bg-slate-900/50 dark:text-slate-200 dark:ring-slate-600/60'
                                    }`}
                                  >
                                    {p.label}
                                  </button>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                              Plan kayıtlarında proje kodu bulunamadı.
                            </p>
                          )}
                        </div>
                      ) : null}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                          {filterResourceLabel}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {PLANNING_RESOURCES.map((m) => {
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
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  on
                                    ? 'border border-sky-300/70 bg-sky-100/70 text-sky-900 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100'
                                    : 'bg-white text-slate-700 ring-1 ring-slate-300/70 dark:bg-slate-900/50 dark:text-slate-200 dark:ring-slate-600/60'
                                }`}
                              >
                                {m.moldId}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                          Durum
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {statusKeysForFilter.map((k) => {
                            const on = statusFilter.includes(k)
                            return (
                              <button
                                key={k}
                                type="button"
                                onClick={() =>
                                  setStatusFilter((prev) => (on ? prev.filter((x) => x !== k) : [...prev, k]))
                                }
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  on
                                    ? 'border border-sky-300/70 bg-sky-100/70 text-sky-900 dark:border-sky-600/60 dark:bg-sky-900/35 dark:text-sky-100'
                                    : 'bg-white text-slate-700 ring-1 ring-slate-300/70 dark:bg-slate-900/50 dark:text-slate-200 dark:ring-slate-600/60'
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
                        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
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
                  ) : leftDrawerTab === 'queue' ? (
                    <ul
                      id="gm-planning-queue-list"
                      className="divide-y divide-slate-200/50 dark:divide-slate-700/50"
                      role="list"
                    >
                      {queueItems.map((q) => {
                        const mfgRow = q as {
                          ready?: boolean
                          eligibleShipAt?: string
                          reportNo?: string
                        }
                        const mfgReady = mfgRow.ready ?? true
                        return (
                          <li
                            key={q.queueId}
                            draggable={canEdit && mfgReady}
                            onDragStart={(e) => {
                              if (!mfgReady) {
                                e.preventDefault()
                                return
                              }
                              e.dataTransfer.setData('text/plain', `queue:${q.queueId}`)
                              e.dataTransfer.setData('text/plan-queue-id', q.queueId)
                              e.dataTransfer.effectAllowed = 'copy'
                              setDragId(`queue:${q.queueId}`)
                            }}
                            onDragEnd={() => {
                              setDragId(null)
                              setDropTarget(null)
                            }}
                            className={`py-3 text-xs first:pt-0 ${mfgReady ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-80'}`}
                          >
                            <div className="flex items-start gap-1.5 font-medium text-slate-900 dark:text-slate-50">
                              {!mfgReady ? (
                                <Lock className="mt-0.5 size-3 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                              ) : null}
                              <span>{q.title}</span>
                            </div>
                            <div className="mt-1 text-slate-500 dark:text-slate-400">
                              Öncelik {q.priority} · risk {q.risk}
                              {mfgRow.reportNo ? (
                                <span className="mt-0.5 block">
                                  {t('productionPlanning.dailyReport.queueSourceReport', {
                                    reportNo: mfgRow.reportNo,
                                  })}
                                </span>
                              ) : null}
                              {mfgRow.eligibleShipAt && !mfgReady ? (
                                <span className="mt-0.5 block tabular-nums">
                                  {t('productionPlanning.dailyReport.colMovableDate')}:{' '}
                                  {formatDailyReportDateTime(mfgRow.eligibleShipAt, loc)}
                                </span>
                              ) : null}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <ol
                      id="gm-planning-truck-load-list"
                      className="list-none divide-y divide-slate-200/50 p-0 dark:divide-slate-700/50"
                      role="list"
                      aria-label={t('dispatchPlanning.truckLoad.viewProducts')}
                    >
                      {truckLoadOpenItems.map((loadItem, idx) => {
                        const meta = [
                          loadItem.orderId,
                          STATUS_META[loadItem.status].label,
                          loadItem.projectId,
                        ]
                          .filter(Boolean)
                          .join(' · ')
                        return (
                          <li key={loadItem.id}>
                            <button
                              type="button"
                              className={[
                                'group w-full border-0 bg-transparent py-2.5 pr-0.5 text-left transition',
                                'hover:bg-slate-50/90 dark:hover:bg-slate-800/45',
                                truckLoadDrawerTone?.rowAccent ??
                                  'border-l-2 border-l-slate-200/70 pl-2.5 dark:border-l-slate-600',
                                truckLoadDrawerTone ? 'pl-2' : '',
                              ].join(' ')}
                              aria-label={t('dispatchPlanning.truckLoad.position', {
                                index: String(idx + 1),
                              })}
                              onClick={() => {
                                closeLeftDrawer()
                                setDayDetailDate(null)
                                setHistoryDrawerOpen(false)
                                setSelectedId(loadItem.id)
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <span
                                  className={`mt-px w-4 shrink-0 tabular-nums text-[10px] font-semibold ${
                                    truckLoadDrawerTone?.icon ?? 'text-slate-400 dark:text-slate-500'
                                  }`}
                                  aria-hidden
                                >
                                  {idx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`truncate text-xs font-medium leading-snug ${
                                      truckLoadDrawerTone?.title ??
                                      'text-slate-900 dark:text-slate-50'
                                    }`}
                                  >
                                    {loadItem.title}
                                  </p>
                                  {meta ? (
                                    <p className="mt-0.5 truncate text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                                      {meta}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </button>
                          </li>
                        )
                      })}
                    </ol>
                  )}
                </aside>

                <aside
                  id="gm-planning-history-drawer"
                  className={[
                    'absolute inset-y-0 right-0 z-20 w-[min(100vw-2rem,22rem)] overflow-y-auto rounded-l-xl border border-slate-200/70 bg-white/95 p-3 shadow-xl backdrop-blur-sm transition-transform dark:border-slate-700/70 dark:bg-slate-900/95',
                    historyDrawerOpen ? 'translate-x-0' : 'translate-x-[105%]',
                  ].join(' ')}
                  aria-hidden={!historyDrawerOpen}
                  role="region"
                  aria-label="Plan değişiklik geçmişi"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Kayıtlı sürümler</h4>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        ⌘Z / Ctrl+Z önceki adım · ⇧⌘Z ileri
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHistoryDrawerOpen(false)}
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      aria-label="Geçmişi kapat"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  <ol className="list-none space-y-2 p-0">
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
                                : 'border-slate-200/60 bg-white/50 dark:border-slate-600/50 dark:bg-slate-950/30'
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
                                className="shrink-0 rounded-lg border border-slate-200/70 bg-white/80 px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-white disabled:cursor-default disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
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
                        className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-sky-500/50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </label>
                  ) : null}
                </aside>

                <aside
                  id="gm-planning-day-drawer"
                  className={[
                    'absolute inset-y-0 right-0 z-[21] flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-l-xl border border-slate-200/70 bg-white/95 shadow-xl backdrop-blur-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-slate-700/70 dark:bg-slate-900/95',
                    dayDetailDate && dayDetailData ? 'translate-x-0' : 'pointer-events-none translate-x-[105%]',
                  ].join(' ')}
                  aria-hidden={!(dayDetailDate && dayDetailData)}
                  role="region"
                  aria-label="Gün özeti"
                >
                  {dayDetailDate && dayDetailData ? (
                    <>
                      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-200/60 p-3 pb-2 dark:border-slate-700/60">
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {dayDetailData.day.date} · {dayDetailData.day.weekdayShort}
                          </h4>
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Günlük özet</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDayDetailDate(null)}
                          className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          aria-label="Kapat"
                        >
                          <X className="size-3.5" aria-hidden />
                        </button>
                      </div>
                      <div className="min-h-0 flex-1 overflow-y-auto p-3">
                        {dayDetailData.dayItems.length === 0 ? (
                          <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-4 text-center text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-950/40 dark:text-slate-300">
                            Bu gün için plan yok.
                            <button
                              type="button"
                              className={`${eiSplitHeaderButtonPassive} mt-3 w-full justify-center py-2 text-sm`}
                              onClick={() => {
                                setDayDetailDate(null)
                                setAssignOpen({ moldId: PLANNING_RESOURCES[0]!.moldId, slot: 0 })
                              }}
                            >
                              İş ekle (mock)
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4 text-sm">
                            <section>
                              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Kalıp kırılımı
                              </h3>
                              <table className="mt-2 w-full text-xs">
                                <thead>
                                  <tr className="text-left text-slate-500 dark:text-slate-400">
                                    <th className="py-1">Kalıp</th>
                                    <th className="py-1">İş</th>
                                    <th className="py-1">m³</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dayDetailData.moldRows.map((r) => (
                                    <tr key={r.moldId} className="border-t border-slate-200/70 dark:border-slate-700/60">
                                      <td className="py-1 font-mono text-slate-800 dark:text-slate-200">{r.moldId}</td>
                                      <td className="py-1 text-slate-700 dark:text-slate-300">{r.jobCount}</td>
                                      <td className="py-1 text-slate-700 dark:text-slate-300">{r.volumeM3.toFixed(1)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </section>
                            <section>
                              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                İş listesi
                              </h3>
                              <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs">
                                {dayDetailData.jobRows.map((j) => (
                                  <li
                                    key={j.itemId}
                                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/60 bg-white/60 px-2 py-1.5 dark:border-slate-700/50 dark:bg-slate-950/35"
                                  >
                                    <span className="min-w-0 truncate font-medium text-slate-900 dark:text-slate-50">
                                      {j.title}
                                    </span>
                                    {j.shiftLabel ? (
                                      <span className="shrink-0 text-slate-500 dark:text-slate-400">
                                        {j.shiftLabel}
                                      </span>
                                    ) : null}
                                    <span className="shrink-0 rounded bg-slate-200 px-1 text-[10px] dark:bg-slate-700">
                                      {STATUS_META[j.statusKey].label}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </section>
                            <section className="rounded-lg border border-slate-200/70 p-3 dark:border-slate-700/60">
                              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Toplamlar</h3>
                              <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">
                                {dailyTotals.find((x) => x.date === dayDetailDate)?.pieces ?? 0} iş ·{' '}
                                {dailyTotals.find((x) => x.date === dayDetailDate)?.volumeM3.toFixed(1)} m³ ·{' '}
                                {((dailyTotals.find((x) => x.date === dayDetailDate)?.steelKg ?? 0) / 1000).toFixed(1)}{' '}
                                t çelik
                              </p>
                            </section>
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </aside>

                <aside
                  id="gm-planning-item-drawer"
                  className={[
                    'absolute inset-y-0 right-0 z-[21] flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-l-xl border border-slate-200/70 bg-white/95 shadow-xl backdrop-blur-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-slate-700/70 dark:bg-slate-900/95',
                    selected ? 'translate-x-0' : 'pointer-events-none translate-x-[105%]',
                  ].join(' ')}
                  aria-hidden={!selected}
                  role="region"
                  aria-label="Plan öğesi detayı"
                >
                  {selected ? (
                    <>
                      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-200/60 p-3 pb-2 dark:border-slate-700/60">
                        <h4 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">
                          {selected.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setSelectedId(null)}
                          className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          aria-label="Kapat"
                        >
                          <X className="size-3.5" aria-hidden />
                        </button>
                      </div>
                      <div className="min-h-0 flex-1 overflow-y-auto p-3">
                        <div className="space-y-3 text-sm">
                          <div className="rounded-lg border border-slate-200/70 p-3 dark:border-slate-700/60">
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ürün örnekleri</h3>
                            <div className="mt-2 flex gap-2 overflow-auto pb-1">
                              {PRODUCT_SAMPLE_THUMBS.map((src, idx) => (
                                <img
                                  key={src}
                                  src={src}
                                  alt={`Ürün örneği ${idx + 1}`}
                                  className="h-24 w-32 shrink-0 rounded-lg border border-slate-200/65 bg-slate-50/60 object-cover dark:border-slate-600/50 dark:bg-slate-900/40"
                                  draggable={false}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="rounded-lg border border-slate-200/70 p-3 dark:border-slate-700/60">
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
                          <div className="rounded-lg border border-slate-200/70 p-3 dark:border-slate-700/60">
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
                          {isDispatchTimeline && selectedTruckLoad.length > 1 ? (
                            <div className="rounded-lg border border-sky-200/70 bg-sky-50/40 p-3 dark:border-sky-800/50 dark:bg-sky-950/25">
                              <button
                                type="button"
                                className="w-full rounded-lg border border-sky-400/60 bg-white/90 px-3 py-2 text-sm font-semibold text-sky-900 shadow-sm transition hover:bg-sky-100 dark:border-sky-500/50 dark:bg-sky-900/50 dark:text-sky-50 dark:hover:bg-sky-900"
                                onClick={() => {
                                  const slotStart = snapTimelineSlot(
                                    slotIndexForItem(selected.startAt),
                                    timelineUsesShifts,
                                  )
                                  openTruckLoadDrawer({
                                    moldId: selected.moldId,
                                    slotStart,
                                  })
                                }}
                              >
                                {t('dispatchPlanning.truckLoad.viewProducts')} ({selectedTruckLoad.length})
                              </button>
                            </div>
                          ) : null}
                          <div className="rounded-lg border border-slate-200/70 p-3 dark:border-slate-700/60">
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {isDispatchTimeline ? t('dispatchPlanning.truckLoad.resourceSection') : 'Kalıp & beton'}
                            </h3>
                            <dl className="mt-2 space-y-1 text-slate-800 dark:text-slate-200">
                              <div className="flex justify-between gap-2">
                                <dt className="text-slate-500 dark:text-slate-400">
                                  {isDispatchTimeline ? resourceColumnLabel : 'Kalıp'}
                                </dt>
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
                          {isGeneral && gp ? (
                            <div className="rounded-lg border border-sky-200/70 bg-sky-50/50 p-3 dark:border-sky-800/50 dark:bg-sky-950/20">
                              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {t('generalPlanning.detail.linkedPlans')}
                              </h3>
                              <ul className="mt-2 space-y-2 text-xs">
                                {linkedPlansForProduct(crossUnitPlanItems, selected.productId).map((lp) => (
                                  <li
                                    key={lp.id}
                                    className="rounded-md border border-slate-200/60 bg-white/70 px-2 py-1.5 dark:border-slate-700/50 dark:bg-slate-900/40"
                                  >
                                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                                      {t(PLANNING_UNIT_LABEL_KEYS[lp.unit])}
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-300">
                                      {new Date(lp.startAt).toLocaleDateString('tr-TR', {
                                        day: '2-digit',
                                        month: 'short',
                                      })}{' '}
                                      –{' '}
                                      {new Date(lp.endAt).toLocaleDateString('tr-TR', {
                                        day: '2-digit',
                                        month: 'short',
                                      })}
                                    </div>
                                    <div className="text-slate-500">{lp.resourceId}</div>
                                  </li>
                                ))}
                              </ul>
                              {crossUnitConsistencyWarnings(crossUnitPlanItems, selected.productId).length > 0 ? (
                                <ul className="mt-2 space-y-1 text-[11px] font-medium text-amber-800 dark:text-amber-200">
                                  {crossUnitConsistencyWarnings(crossUnitPlanItems, selected.productId).map((w) => (
                                    <li key={w}>⚠ {w}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ) : null}
                          <div className="rounded-lg border border-slate-200/70 p-3 dark:border-slate-700/60">
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
                    </>
                  ) : null}
                </aside>

                <div
                  ref={gridScrollRef}
                  className="gm-planning-scroll-host box-border h-full min-h-0 min-w-0 overflow-auto"
                  style={{
                    paddingLeft:
                      leftDrawerOpen || planningWizard?.actionsDrawerOpen ? '20rem' : 0,
                    paddingRight: rightInsightOpen ? 'min(22rem, calc(100vw - 2rem))' : 0,
                  }}
                  title="Ctrl/⌘ + fare tekerleği: yakınlaştır / uzaklaştır"
                >
          <div className="flex min-h-0 min-w-full w-max flex-col">
            {/* Üst: tarih başlığı — sol kalıp köşesi yatayda sabit + opak */}
            <div className="flex w-max min-w-full">
              <div
                className="gm-planning-corner-cell sticky left-0 top-0 z-[60] flex shrink-0 flex-col justify-center border-b border-r border-slate-200/70 px-2 py-2 text-xs font-medium text-slate-600 dark:border-slate-600/50 dark:text-slate-400"
                style={{ width: MOLD_COL_PX, minWidth: MOLD_COL_PX }}
              >
                {resourceColumnLabel}
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
                      {timelineUsesShifts ? (
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
                      ) : null}
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

            {PLANNING_RESOURCES.map((mold, moldIdx) => {
              const rowItems = filteredItems.filter((it) => it.moldId === mold.moldId)
              const rowMinH = moldRowHeights[mold.moldId] ?? BODY_ROW_BASE_MIN
              const prevMold = PLANNING_RESOURCES[moldIdx - 1]
              const isHatStart = !prevMold || prevMold.hatNo !== mold.hatNo
              const rowVehicleTone =
                isDispatchTimeline && !dispatchExpandedTimeline && mold.vehicleType
                  ? DISPATCH_VEHICLE_TONES[mold.vehicleType]
                  : null

              return (
                <div
                  key={mold.moldId}
                  className={`flex w-max min-w-full border-b border-slate-200/65 dark:border-slate-600/45 ${
                    isHatStart ? 'border-t border-slate-200/65 dark:border-slate-600/45' : ''
                  }`}
                >
                  <div
                    className={`gm-planning-sticky-mold-label sticky left-0 z-[60] flex shrink-0 flex-col justify-start border-r border-slate-200/70 px-2 py-2 text-xs dark:border-slate-600/50 ${
                      rowVehicleTone?.rowAccent ?? ''
                    }`}
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
                        const dayIdx = Math.floor(slot / slotsPerDay)
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
                              setAssignOpen({
                                moldId: mold.moldId,
                                slot: snapTimelineSlot(slot, timelineUsesShifts),
                              })
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
                                const mfgKey = parseManufacturedQueueId(qid)
                                if (mfgKey) {
                                  const mp = workQueue.getManufacturedProductById(mfgKey)
                                  if (mp && !isManufacturedProductReady(mp)) {
                                    setPlanningQueueToast(
                                      t('productionPlanning.dailyReport.notReadyForDispatch', {
                                        date: formatDailyReportDateTime(mp.eligibleShipAt, loc),
                                      }),
                                    )
                                    return
                                  }
                                }
                                const q = queueItems.find((x) => x.queueId === qid)
                                if (!q) return
                                const snapped = snapTimelineSlot(slot, timelineUsesShifts)
                                const { startAt, endAt, durationHours } = isoFromSlotVisibleForMode(
                                  visibleDays,
                                  snapped,
                                  timelineUsesShifts,
                                )
                                const span = spanSlotsFromDurationForMode(
                                  durationHours,
                                  timelineUsesShifts,
                                )
                                if (wouldViolateMaxConcurrent(null, mold.moldId, snapped, span)) return
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
                                  projectId: undefined,
                                  tags: ['queue'],
                                  warnings: np ? ['Üretim dışı güne yerleşim (mock)'] : [],
                                }
                                const nextItems = [...itemsRef.current, newRow]
                                if (np) {
                                  setNonProdModal({ moldId: mold.moldId, slot: snapped, itemId: newId })
                                }
                                appendCheckpoint(nextItems, 'Kuyruktan plana eklendi')
                                return
                              }
                              handleDropPlanItem(mold.moldId, snapTimelineSlot(slot, timelineUsesShifts), e)
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
                      const slotSnapped = snapTimelineSlot(p.slotStart, timelineUsesShifts)
                      const tripGroup = isDispatchTimeline
                        ? dispatchTripGroups.get(`${it.moldId}:${slotSnapped}`)
                        : null
                      const tripCount = tripGroup?.length ?? 1
                      const useCompactDispatch =
                        isDispatchTimeline && !dispatchExpandedTimeline
                      if (useCompactDispatch && tripGroup && tripGroup[0]?.id !== it.id) {
                        return null
                      }
                      const isMultiTrip = Boolean(useCompactDispatch && tripCount > 1)
                      const summaryTone =
                        isMultiTrip && mold.vehicleType
                          ? DISPATCH_VEHICLE_TONES[mold.vehicleType]
                          : null
                      const tripIndex = tripGroup?.findIndex((x) => x.id === it.id) ?? 0
                      const cardZIndex =
                        isDispatchTimeline && dispatchExpandedTimeline && tripCount > 1
                          ? 20 + tripIndex
                          : 20
                      return (
                        <div
                          key={it.id}
                          className={`relative flex h-full min-h-0 flex-col rounded-xl border border-slate-200/70 ${
                            summaryTone
                              ? summaryTone.card
                              : `${st.borderClass} border-l-4 ${st.bgClass}`
                          } shadow-neo-out-sm dark:border-slate-600/45 ${planCardToneClasses(it.visualTone)} ${
                            cap ? 'ring-2 ring-red-500/70' : ''
                          } ${passThroughDrag ? 'pointer-events-none' : 'pointer-events-auto'}`}
                          style={{
                            gridColumn: `${p.slotStart + 1} / span ${p.span}`,
                            gridRow: '1 / 2',
                            zIndex: cardZIndex,
                            height: `${CELL_ROW_HEIGHT_PX}px`,
                            minHeight: `${CELL_ROW_HEIGHT_PX}px`,
                          }}
                          title={
                            isMultiTrip
                              ? t('dispatchPlanning.truckLoad.summaryTitle', {
                                  count: String(tripCount),
                                  vehicle: it.moldId,
                                })
                              : `${it.title} · ${it.durationHours} saat · öncelik ${it.priority}`
                          }
                          onClick={(e) => {
                            if (isMultiTrip) return
                            e.stopPropagation()
                            setDayDetailDate(null)
                            setHistoryDrawerOpen(false)
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
                          draggable={canEdit && !isMultiTrip && !it.isPreview}
                          onDragStart={(e) => {
                            if (isMultiTrip) return
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
                            {canEdit && !isMultiTrip ? (
                              <span className="flex w-5 shrink-0 cursor-grab items-center justify-center text-gray-400">
                                <GripVertical className="h-4 w-4" />
                              </span>
                            ) : null}
                            <div
                              className={`min-w-0 flex-1 ${isMultiTrip ? 'py-0.5' : 'py-1 pr-1'}`}
                            >
                              {isMultiTrip ? (
                                <>
                                  <div className="flex items-center gap-1">
                                    <Package
                                      className={`size-3.5 shrink-0 ${summaryTone?.icon ?? 'text-sky-700 dark:text-sky-300'}`}
                                      aria-hidden
                                    />
                                    <span
                                      className={`truncate text-[11px] font-semibold leading-tight ${summaryTone?.title ?? 'text-sky-950 dark:text-sky-50'}`}
                                    >
                                      {t('dispatchPlanning.truckLoad.summaryLabel', {
                                        count: String(tripCount),
                                      })}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    className={`mt-0.5 w-full rounded-md border px-1.5 py-0.5 text-[10px] font-semibold shadow-sm transition ${
                                      summaryTone?.button ??
                                      'border-sky-400/60 bg-white/90 text-sky-800 hover:bg-sky-100 dark:border-sky-500/50 dark:bg-sky-900/60 dark:text-sky-100 dark:hover:bg-sky-900'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openTruckLoadDrawer({
                                        moldId: it.moldId,
                                        slotStart: slotSnapped,
                                      })
                                    }}
                                  >
                                    {t('dispatchPlanning.truckLoad.viewProducts')}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1">
                                    {!it.isPreview ? statusIcon(it.status) : null}
                                    <span className="truncate text-[11px] font-semibold leading-tight text-gray-900 dark:text-gray-50">
                                      {it.title}
                                    </span>
                                    {it.isPreview ? (
                                      <span className="shrink-0 rounded bg-sky-500/20 px-1 py-0.5 text-[9px] font-bold uppercase text-sky-800 dark:text-sky-100">
                                        {t('planningActions.previewBadge')}
                                      </span>
                                    ) : null}
                                  </div>
                                  {cardDisplayMode === 'ops' && it.orderId ? (
                                    <div className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                                      {it.orderId}
                                    </div>
                                  ) : cardDisplayMode === 'coordinator' && it.projectId ? (
                                    <div className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                                      {it.projectId}
                                    </div>
                                  ) : null}
                                </>
                              )}
                            </div>
                            {canEdit && !isMultiTrip ? (
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
                    onClick={() => {
                      setHistoryDrawerOpen(false)
                      setSelectedId(null)
                      setDayDetailDate(d.date)
                    }}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {isProductionTimeline ? (
        <>
          <DailyProductionWorkOrderDialog
            open={dailyWorkOrderOpen}
            onClose={() => setDailyWorkOrderOpen(false)}
            planItems={items}
            moldNameById={moldNameById}
            defaultDayIso={dailyWorkOrderDefaultDay}
            visibleDayRange={dailyWorkOrderVisibleRange}
            onConfirmed={(count) =>
              setDailyWorkOrderToast(
                t('productionPlanning.dailyOrder.toast', { count: String(count) }),
              )
            }
          />
          <DailyProductionReportDialog
            open={dailyReportOpen}
            onClose={() => setDailyReportOpen(false)}
            defaultDayIso={dailyReportDefaultDay}
            visibleDayRange={dailyWorkOrderVisibleRange}
            onConfirmed={(reportNo) =>
              setDailyReportToast(
                t('productionPlanning.dailyReport.toast', { reportNo }),
              )
            }
          />
        </>
      ) : null}

      {typeof document !== 'undefined'
        ? createPortal(
            <>
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
                  setDayDetailDate(null)
                  setHistoryDrawerOpen(false)
                  setSelectedId(contextMenu.itemId)
                  setContextMenu(null)
                }}
              >
                Detay
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
              {isDispatchTimeline
                ? `${resourceColumnLabel} ${assignOpen.moldId}`
                : `Kalıp ${assignOpen.moldId}, slot ${assignOpen.slot}.`}
            </p>
            {isDispatchTimeline && assignTruckLoad.length > 0 ? (
              <div className="mt-2 rounded-lg border border-sky-200/70 bg-sky-50/50 px-2 py-2 text-xs dark:border-sky-800/50 dark:bg-sky-950/30">
                <p className="font-semibold text-sky-900 dark:text-sky-100">
                  {t('dispatchPlanning.assign.existingLoad', {
                    count: String(assignTruckLoad.length),
                  })}
                </p>
                <ul className="mt-1 max-h-24 space-y-0.5 overflow-auto text-slate-700 dark:text-slate-200">
                  {assignTruckLoad.map((loadItem) => (
                    <li key={loadItem.id} className="truncate">
                      {loadItem.title}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
              {isDispatchTimeline
                ? t('dispatchPlanning.assign.addProduct')
                : 'Kuyruktan ata (mock)'}
            </p>
            <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-sm">
              {queueItems.map((q) => (
                <li key={q.queueId}>
                  <button
                    type="button"
                    className="gm-glass-card-inset w-full px-2 py-2 text-left text-sm text-gray-800 transition hover:opacity-95 dark:text-gray-100"
                    onClick={() => {
                      const mfgKey = parseManufacturedQueueId(q.queueId)
                      if (mfgKey) {
                        const mp = workQueue.getManufacturedProductById(mfgKey)
                        if (mp && !isManufacturedProductReady(mp)) {
                          setPlanningQueueToast(
                            t('productionPlanning.dailyReport.notReadyForDispatch', {
                              date: formatDailyReportDateTime(mp.eligibleShipAt, loc),
                            }),
                          )
                          return
                        }
                      }
                      const { startAt, endAt, durationHours } = isoFromSlotVisibleForMode(
                        visibleDays,
                        assignOpen.slot,
                        timelineUsesShifts,
                      )
                      const span = spanSlotsFromDurationForMode(durationHours, timelineUsesShifts)
                      if (wouldViolateMaxConcurrent(null, assignOpen.moldId, assignOpen.slot, span)) return
                      const day = visibleDays[Math.floor(assignOpen.slot / slotsPerDay)]
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
                        projectId: undefined,
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
              className={`${eiSplitHeaderButtonPassive} mt-3 w-full justify-center py-2 text-sm`}
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
                className={`${eiSplitHeaderButtonPassive} px-4 py-2 text-sm`}
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
