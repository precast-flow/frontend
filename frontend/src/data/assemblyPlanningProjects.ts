import type { GeneralPlanItem } from './generalPlanningMock'
import { GENERAL_PLAN_QUEUE, type PlanningUnitKey } from './generalPlanningMock'
import type { QueueItem } from './planningDesignMock'
import { projectManagementCardsMock } from './projectManagementCardsMock'

export type AssemblyPlanningProjectOption = {
  code: string
  name: string
  customer: string
  cardId: string | null
  assemblyPlanCount: number
}

const ASSEMBLY_UNIT: PlanningUnitKey = 'assembly'

export function assemblyItemsForProject(
  items: GeneralPlanItem[],
  projectCode: string,
): GeneralPlanItem[] {
  return items.filter(
    (it) => it.unit === ASSEMBLY_UNIT && (it.projectId ?? '') === projectCode,
  )
}

export function listAssemblyPlanningProjects(items: GeneralPlanItem[]): AssemblyPlanningProjectOption[] {
  const assembly = items.filter((it) => it.unit === ASSEMBLY_UNIT && it.projectId)
  const codes = [...new Set(assembly.map((it) => it.projectId!))]

  return codes
    .map((code) => {
      const card = projectManagementCardsMock.find((c) => c.code === code)
      return {
        code,
        name: card?.name ?? code,
        customer: card?.customer ?? '',
        cardId: card?.id ?? null,
        assemblyPlanCount: assembly.filter((it) => it.projectId === code).length,
      }
    })
    .sort((a, b) => a.code.localeCompare(b.code, 'tr'))
}

export function assemblyQueueForProject(
  projectCode: string,
  allItems: GeneralPlanItem[],
): QueueItem[] {
  const projectAssembly = assemblyItemsForProject(allItems, projectCode)
  const productTokens = new Set(
    projectAssembly.map((it) => {
      const raw = it.productId.replace(/^PROD-/, '')
      return raw.split('-')[0]?.toLowerCase() ?? ''
    }),
  )

  const fromStatic = GENERAL_PLAN_QUEUE[ASSEMBLY_UNIT].filter((q) => {
    const t = q.title.toLowerCase()
    return [...productTokens].some((tok) => tok.length > 0 && t.includes(tok))
  })

  if (fromStatic.length > 0) return fromStatic

  const dispatchForProject = allItems.filter(
    (it) => it.unit === 'dispatch' && it.projectId === projectCode,
  )
  const assemblyLinked = new Set(projectAssembly.map((it) => it.linkedProductId))

  const pending = dispatchForProject
    .filter((d) => !assemblyLinked.has(d.linkedProductId))
    .map(
      (d, i): QueueItem => ({
        queueId: `GQ-M-P-${d.id}`,
        title: d.title.replace(/ — sevkiyat$/i, ' — montaj bekliyor'),
        priority: d.priority,
        risk: i % 3 === 0 ? 'yüksek' : 'orta',
      }),
    )

  return pending.length > 0 ? pending : GENERAL_PLAN_QUEUE[ASSEMBLY_UNIT].slice(0, 3)
}

export function defaultAssemblyProjectCode(items: GeneralPlanItem[]): string | null {
  const options = listAssemblyPlanningProjects(items)
  if (!options.length) return null
  const preferred = projectManagementCardsMock.find((c) => c.status === 'devam')?.code
  if (preferred && options.some((o) => o.code === preferred)) return preferred
  return options[0]!.code
}
