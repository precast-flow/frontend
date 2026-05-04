import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MOCK_APPROVAL_ROLES,
  MOCK_APPROVAL_TEMPLATES,
  MOCK_APPROVAL_USERS,
  cloneApprovalTemplates,
  newEmptyStep,
  type ApprovalStepDraft,
  type ApprovalTemplateMock,
  type ProcessTypeId,
} from '../../data/mockApprovalFlow'

const LS_KEY = 'precast-mvp-approval-templates-v1'

function reorderSteps(list: ApprovalStepDraft[]): ApprovalStepDraft[] {
  return list
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((s, i) => ({ ...s, order: i + 1 }))
}

function loadStoredTemplates(): ApprovalTemplateMock[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ApprovalTemplateMock[]
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return cloneApprovalTemplates(parsed)
  } catch {
    return null
  }
}

function persistTemplates(templates: ApprovalTemplateMock[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(templates))
  } catch {
    /* ignore */
  }
}

export function useApprovalFlowDesignerState() {
  const [templates, setTemplates] = useState<ApprovalTemplateMock[]>(() => {
    const stored = loadStoredTemplates()
    if (stored) return stored
    return cloneApprovalTemplates(MOCK_APPROVAL_TEMPLATES)
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const editingIdRef = useRef(editingId)
  editingIdRef.current = editingId

  const [processTypeId, setProcessTypeId] = useState<ProcessTypeId>('quote')
  const [draftName, setDraftName] = useState('Yeni onay şablonu')
  const [copyTemplateId, setCopyTemplateId] = useState<string>('')
  const [threshold, setThreshold] = useState('250000')
  const [currency, setCurrency] = useState('TRY')
  const [slaDays, setSlaDays] = useState('3')
  const [steps, setSteps] = useState<ApprovalStepDraft[]>(() =>
    reorderSteps(MOCK_APPROVAL_TEMPLATES[0]?.steps.map((s) => ({ ...s })) ?? [newEmptyStep(1)]),
  )

  useEffect(() => {
    persistTemplates(templates)
  }, [templates])

  const isQuote = processTypeId === 'quote'

  const previewLabels = useMemo(() => {
    return steps.map((s) => {
      if (s.assigneeType === 'role') {
        const r = MOCK_APPROVAL_ROLES.find((x) => x.id === s.roleId)
        return r?.label ?? 'Rol'
      }
      const u = MOCK_APPROVAL_USERS.find((x) => x.id === s.userId)
      return u?.label.split('(')[0]?.trim() ?? 'Kullanıcı'
    })
  }, [steps])

  const resetToNewDraft = useCallback(() => {
    setEditingId(null)
    setProcessTypeId('quote')
    setDraftName('Yeni onay şablonu')
    setThreshold('250000')
    setCurrency('TRY')
    setSlaDays('3')
    setSteps(reorderSteps([newEmptyStep(1)]))
    setCopyTemplateId('')
  }, [])

  const openTemplate = useCallback((tpl: ApprovalTemplateMock) => {
    setEditingId(tpl.id)
    setProcessTypeId(tpl.processTypeId)
    setDraftName(tpl.name)
    setSteps(reorderSteps(tpl.steps.map((s) => ({ ...s }))))
    if (tpl.thresholdAmount != null) setThreshold(String(tpl.thresholdAmount))
    else setThreshold('0')
    setCurrency(tpl.currency)
    setCopyTemplateId('')
  }, [])

  const applyTemplateAsCopy = useCallback(
    (tplId: string) => {
      const tpl = templates.find((t) => t.id === tplId)
      if (!tpl) return
      setEditingId(null)
      setProcessTypeId(tpl.processTypeId)
      setDraftName(`${tpl.name} (kopya)`)
      setSteps(
        reorderSteps(
          tpl.steps.map((s) => ({
            ...s,
            id: `${s.id}-copy-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          })),
        ),
      )
      if (tpl.thresholdAmount != null) setThreshold(String(tpl.thresholdAmount))
      setCurrency(tpl.currency)
    },
    [templates],
  )

  const updateStep = useCallback((id: string, patch: Partial<ApprovalStepDraft>) => {
    setSteps((prev) => reorderSteps(prev.map((s) => (s.id === id ? { ...s, ...patch } : s))))
  }, [])

  const removeStep = useCallback((id: string) => {
    setSteps((prev) => reorderSteps(prev.filter((s) => s.id !== id)))
  }, [])

  const moveStep = useCallback((id: string, delta: -1 | 1) => {
    setSteps((prev) => {
      const ordered = reorderSteps(prev)
      const idx = ordered.findIndex((s) => s.id === id)
      if (idx < 0) return prev
      const j = idx + delta
      if (j < 0 || j >= ordered.length) return prev
      const arr = [...ordered]
      ;[arr[idx], arr[j]] = [arr[j], arr[idx]]
      return reorderSteps(arr)
    })
  }, [])

  const addStep = useCallback(() => {
    setSteps((prev) => reorderSteps([...prev, newEmptyStep(prev.length + 1)]))
  }, [])

  const saveDraft = useCallback(() => {
    if (steps.length < 1) {
      window.alert('En az bir adım gerekli (mock).')
      return
    }
    const name = draftName.trim() || 'Adsız şablon'
    const nextSteps = reorderSteps(steps.map((s) => ({ ...s })))
    const payload: ApprovalTemplateMock = {
      id: editingId ?? `tpl-${Date.now()}`,
      name,
      processTypeId,
      stepCount: nextSteps.length,
      thresholdAmount: processTypeId === 'quote' ? Number(threshold) || undefined : undefined,
      currency,
      steps: nextSteps,
    }
    setTemplates((prev) => {
      if (editingId && prev.some((t) => t.id === editingId)) {
        return prev.map((t) => (t.id === editingId ? payload : t))
      }
      return [...prev, payload]
    })
    setEditingId(payload.id)
  }, [currency, draftName, editingId, processTypeId, steps, threshold])

  /** Silme onayı çağıran tarafta verildikten sonra çağrılır. */
  const removeTemplate = useCallback(
    (id: string) => {
      setTemplates((prev) => prev.filter((t) => t.id !== id))
      if (editingIdRef.current === id) {
        resetToNewDraft()
      }
    },
    [resetToNewDraft],
  )

  return {
    templates,
    editingId,
    processTypeId,
    setProcessTypeId,
    draftName,
    setDraftName,
    copyTemplateId,
    setCopyTemplateId,
    threshold,
    setThreshold,
    currency,
    setCurrency,
    slaDays,
    setSlaDays,
    steps,
    isQuote,
    previewLabels,
    resetToNewDraft,
    openTemplate,
    applyTemplateAsCopy,
    updateStep,
    removeStep,
    moveStep,
    addStep,
    saveDraft,
    removeTemplate,
  }
}

export type ApprovalFlowDesignerState = ReturnType<typeof useApprovalFlowDesignerState>
