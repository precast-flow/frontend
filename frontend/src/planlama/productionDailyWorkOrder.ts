import {
  hourToShiftIndexUtc,
  PLANNING_SHIFTS,
  type PlanItem,
} from '../data/planningDesignMock'
import {
  projectManagementByCode,
  projectManagementCardsMock,
} from '../data/projectManagementCardsMock'
import {
  MOCK_WORK_QUEUE_VIEWER_ID,
  type WorkQueueItem,
  type WorkQueuePriority,
} from '../data/workQueueMock'

/** Vardiya amiri ataması (mock): Sabah / Öğle / Gece. */
export const SHIFT_SUPERVISOR_USER_IDS = ['u5', 'u-emre', 'u-emre'] as const

export type DailyProductionPreviewLine = {
  planItemId: string
  productId: string
  title: string
  projectCode: string
  projectName: string
  projectRouteId: string | null
  moldId: string
  moldName: string
  shiftIndex: number
  shiftLabel: string
  volumeM3: number
  steelKg: number
  recipeId: string
  priority: number
}

export type ShiftProductionGroup = {
  shiftIndex: number
  shiftLabel: string
  supervisorUserId: string
  lines: DailyProductionPreviewLine[]
}

/** Üretim başlangıç günü (UTC tarih parçası). */
export function productionStartDayIso(startAt: string): string {
  return startAt.slice(0, 10)
}

/** Yalnızca üretim başlangıcı seçilen güne denk gelen plan öğeleri. */
export function planItemsStartingOnDay(items: readonly PlanItem[], dayIso: string): PlanItem[] {
  return items.filter((it) => productionStartDayIso(it.startAt) === dayIso)
}

export function resolveProjectMeta(projectId: string | undefined): {
  projectCode: string
  projectName: string
  projectRouteId: string | null
} {
  if (!projectId) {
    return { projectCode: '—', projectName: '—', projectRouteId: null }
  }
  const byCode = projectManagementByCode.get(projectId)
  if (byCode) {
    return { projectCode: byCode.code, projectName: byCode.name, projectRouteId: byCode.id }
  }
  const byId = projectManagementCardsMock.find((p) => p.id === projectId)
  if (byId) {
    return { projectCode: byId.code, projectName: byId.name, projectRouteId: byId.id }
  }
  return { projectCode: projectId, projectName: projectId, projectRouteId: null }
}

export function planItemToPreviewLine(
  item: PlanItem,
  moldName: string,
): DailyProductionPreviewLine {
  const shiftIndex = hourToShiftIndexUtc(new Date(item.startAt).getUTCHours())
  const project = resolveProjectMeta(item.projectId)
  return {
    planItemId: item.id,
    productId: item.productId,
    title: item.title,
    projectCode: project.projectCode,
    projectName: project.projectName,
    projectRouteId: project.projectRouteId,
    moldId: item.moldId,
    moldName,
    shiftIndex,
    shiftLabel: PLANNING_SHIFTS[shiftIndex]?.label ?? `Vardiya ${shiftIndex + 1}`,
    volumeM3: item.estimatedVolumeM3,
    steelKg: item.estimatedSteelKg,
    recipeId: item.concreteRecipeId,
    priority: item.priority,
  }
}

export function groupPreviewByShift(lines: DailyProductionPreviewLine[]): ShiftProductionGroup[] {
  const map = new Map<number, DailyProductionPreviewLine[]>()
  for (const line of lines) {
    const bucket = map.get(line.shiftIndex) ?? []
    bucket.push(line)
    map.set(line.shiftIndex, bucket)
  }
  return PLANNING_SHIFTS.map((shift, shiftIndex) => ({
    shiftIndex,
    shiftLabel: shift.label,
    supervisorUserId: SHIFT_SUPERVISOR_USER_IDS[shiftIndex] ?? SHIFT_SUPERVISOR_USER_IDS[0],
    lines: (map.get(shiftIndex) ?? []).sort((a, b) => a.title.localeCompare(b.title, 'tr')),
  })).filter((g) => g.lines.length > 0)
}

function planPriorityToWorkQueue(priority: number): WorkQueuePriority {
  if (priority <= 1) return 'acil'
  if (priority <= 2) return 'yuksek'
  if (priority <= 4) return 'normal'
  return 'dusuk'
}

function formatNowLabel(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

export function buildWorkQueueItemsFromPreview(
  lines: DailyProductionPreviewLine[],
  opts: { planDayIso: string; factoryCode: string },
): WorkQueueItem[] {
  const stamp = Date.now()
  return lines.map((line, index) => {
    const orderNo = `IW-${opts.planDayIso.replace(/-/g, '')}-${String(stamp + index).slice(-4)}`
    return {
      id: `wq-daily-${stamp}-${line.planItemId}`,
      orderNo,
      title: `${line.title} · ${line.shiftLabel}`,
      summary: `${line.moldName} · ${line.volumeM3.toFixed(1)} m³ · ${line.projectCode}`,
      detailBody: [
        `Günlük üretim emri (planlama) — ${opts.planDayIso}`,
        `Ürün: ${line.productId} — ${line.title}`,
        `Proje: ${line.projectName} (${line.projectCode})`,
        `Kalıp: ${line.moldId} (${line.moldName})`,
        `Vardiya: ${line.shiftLabel}`,
        `Hacim: ${line.volumeM3.toFixed(1)} m³ · Çelik: ${(line.steelKg / 1000).toFixed(2)} t`,
        `Reçete: ${line.recipeId}`,
        `Plan öğesi: ${line.planItemId}`,
      ].join('\n'),
      kind: 'production',
      status: 'beklemede',
      priority: planPriorityToWorkQueue(line.priority),
      targetUnit: 'production',
      fromUnit: 'planning',
      toUnit: 'production',
      assigneeUserId: SHIFT_SUPERVISOR_USER_IDS[line.shiftIndex] ?? SHIFT_SUPERVISOR_USER_IDS[0],
      assignerUserId: MOCK_WORK_QUEUE_VIEWER_ID,
      projectCode: line.projectCode,
      projectName: line.projectName,
      projectRouteId: line.projectRouteId,
      factoryCode: opts.factoryCode,
      daysOnDesk: 0,
      lastUpdatedLabel: formatNowLabel(),
      dueToday: opts.planDayIso === new Date().toISOString().slice(0, 10),
      productCode: line.productId,
      productName: line.title,
      moldId: line.moldId,
      moldName: line.moldName,
      shiftLabel: line.shiftLabel,
      volumeM3: line.volumeM3,
      steelKg: line.steelKg,
      recipeId: line.recipeId,
      planDayIso: opts.planDayIso,
      fieldNotes: `Plan öğesi ${line.planItemId}; günlük üretim emri.`,
    }
  })
}

export function buildDailyProductionPreview(
  items: readonly PlanItem[],
  dayIso: string,
  moldNameById: ReadonlyMap<string, string>,
): ShiftProductionGroup[] {
  const starting = planItemsStartingOnDay(items, dayIso)
  const lines = starting.map((it) =>
    planItemToPreviewLine(it, moldNameById.get(it.moldId) ?? it.moldId),
  )
  return groupPreviewByShift(lines)
}

/**
 * Günlük emir modalı varsayılan günü — takvimde görünen aralıkla hizalı (mock + gerçek tarih).
 * Öncelik: açık gün detayı → gerçek bugün (görünür aralıktaysa) → görünürde dolu ilk gün → ilk görünür gün.
 */
export function resolveDefaultProductionDayIso(
  items: readonly PlanItem[],
  visibleDayIsos: readonly string[],
  calendarTodayIso: string,
  preferredDayIso?: string | null,
): string {
  if (preferredDayIso && visibleDayIsos.includes(preferredDayIso)) {
    return preferredDayIso
  }
  if (visibleDayIsos.length === 0) return calendarTodayIso
  if (visibleDayIsos.includes(calendarTodayIso)) return calendarTodayIso
  for (const day of visibleDayIsos) {
    if (planItemsStartingOnDay(items, day).length > 0) return day
  }
  return visibleDayIsos[0]!
}
