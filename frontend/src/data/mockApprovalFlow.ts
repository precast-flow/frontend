export type ProcessTypeId =
  | 'quote'
  | 'dispatch'
  | 'mes_publish'
  | 'quality_rework'
  | 'project_revision'

export type ProcessTypeDef = {
  id: ProcessTypeId
  label: string
  tier: 'p0' | 'p1'
}

/** mvp-02 — süreç tipi listesi (P0 + P1) */
export const PROCESS_TYPES: ProcessTypeDef[] = [
  { id: 'quote', label: 'Teklif', tier: 'p0' },
  { id: 'dispatch', label: 'Sevkiyat çıkışı', tier: 'p0' },
  { id: 'mes_publish', label: 'Üretim emri yayınlama', tier: 'p0' },
  { id: 'quality_rework', label: 'Kalite ret sonrası yeniden üretim', tier: 'p1' },
  { id: 'project_revision', label: 'Proje revizyonu', tier: 'p1' },
]

export type AssigneeType = 'role' | 'user'

export type ApprovalStepDraft = {
  id: string
  order: number
  assigneeType: AssigneeType
  roleId: string
  userId: string
  required: boolean
}

export type ApprovalTemplateMock = {
  id: string
  name: string
  processTypeId: ProcessTypeId
  stepCount: number
  /** Eşik — yalnızca Teklif şablonlarında anlamlı */
  thresholdAmount?: number
  currency: string
  steps: ApprovalStepDraft[]
}

const step = (
  id: string,
  order: number,
  assigneeType: AssigneeType,
  roleId: string,
  userId: string,
  required: boolean,
): ApprovalStepDraft => ({ id, order, assigneeType, roleId, userId, required })

/** En az 2 kayıtlı şablon — listeden biri seçilince adımlar dolu */
export const MOCK_APPROVAL_TEMPLATES: ApprovalTemplateMock[] = [
  {
    id: 'tpl-teklif-std',
    name: 'Teklif — standart hiyerarşi',
    processTypeId: 'quote',
    stepCount: 3,
    thresholdAmount: 250_000,
    currency: 'TRY',
    steps: [
      step('s1', 1, 'role', 'sales_manager', '', true),
      step('s2', 2, 'role', 'cfo', '', true),
      step('s3', 3, 'user', '', 'u-ayse', false),
    ],
  },
  {
    id: 'tpl-sevk-hizli',
    name: 'Sevkiyat çıkışı — hızlı hat',
    processTypeId: 'dispatch',
    stepCount: 2,
    currency: 'TRY',
    steps: [
      step('a1', 1, 'role', 'yard_lead', '', true),
      step('a2', 2, 'user', '', 'u-mehmet', true),
    ],
  },
]

export const MOCK_APPROVAL_ROLES: { id: string; label: string }[] = [
  { id: 'sales_manager', label: 'Satış müdürü' },
  { id: 'cfo', label: 'Mali işler (CFO)' },
  { id: 'yard_lead', label: 'Yard lideri' },
  { id: 'process_admin', label: 'Süreç yöneticisi' },
  { id: 'plant_manager', label: 'Fabrika müdürü' },
]

export const MOCK_APPROVAL_USERS: { id: string; label: string }[] = [
  { id: 'u-ayse', label: 'Ayşe Kaya (ayse@acme.com)' },
  { id: 'u-mehmet', label: 'Mehmet Öz (mehmet@acme.com)' },
  { id: 'u-can', label: 'Can Arslan (can@acme.com)' },
]

export function newEmptyStep(order: number): ApprovalStepDraft {
  return {
    id: `new-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    order,
    assigneeType: 'role',
    roleId: MOCK_APPROVAL_ROLES[0]?.id ?? 'sales_manager',
    userId: MOCK_APPROVAL_USERS[0]?.id ?? 'u-ayse',
    required: true,
  }
}

/** Yerel state / localStorage için derin kopya — stepCount güncellenir */
export function cloneApprovalTemplates(templates: ApprovalTemplateMock[]): ApprovalTemplateMock[] {
  return templates.map((t) => ({
    ...t,
    stepCount: t.steps.length,
    steps: t.steps.map((s) => ({ ...s })),
  }))
}
