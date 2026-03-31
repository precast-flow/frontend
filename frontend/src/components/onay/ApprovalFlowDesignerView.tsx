import { useEffect, useId, useMemo, useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight, ChevronUp, Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  MOCK_APPROVAL_ROLES,
  MOCK_APPROVAL_TEMPLATES,
  MOCK_APPROVAL_USERS,
  cloneApprovalTemplates,
  newEmptyStep,
  PROCESS_TYPES,
  type ApprovalStepDraft,
  type ApprovalTemplateMock,
  type ProcessTypeId,
} from '../../data/mockApprovalFlow'

const LS_KEY = 'precast-mvp-approval-templates-v1'

const insetSelect =
  'mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'
const btnPrimary =
  'rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900'
const btnSecondary =
  'rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-100 dark:hover:text-white dark:ring-offset-gray-900'

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

export function ApprovalFlowDesignerView() {
  const baseId = useId()
  const [templates, setTemplates] = useState<ApprovalTemplateMock[]>(() => {
    const stored = loadStoredTemplates()
    if (stored) return stored
    return cloneApprovalTemplates(MOCK_APPROVAL_TEMPLATES)
  })
  const [editingId, setEditingId] = useState<string | null>(null)

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

  const resetToNewDraft = () => {
    setEditingId(null)
    setProcessTypeId('quote')
    setDraftName('Yeni onay şablonu')
    setThreshold('250000')
    setCurrency('TRY')
    setSlaDays('3')
    setSteps(reorderSteps([newEmptyStep(1)]))
    setCopyTemplateId('')
  }

  const openTemplate = (tpl: ApprovalTemplateMock) => {
    setEditingId(tpl.id)
    setProcessTypeId(tpl.processTypeId)
    setDraftName(tpl.name)
    setSteps(reorderSteps(tpl.steps.map((s) => ({ ...s }))))
    if (tpl.thresholdAmount != null) setThreshold(String(tpl.thresholdAmount))
    else setThreshold('0')
    setCurrency(tpl.currency)
    setCopyTemplateId('')
  }

  const applyTemplateAsCopy = (tplId: string) => {
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
  }

  const updateStep = (id: string, patch: Partial<ApprovalStepDraft>) => {
    setSteps((prev) => reorderSteps(prev.map((s) => (s.id === id ? { ...s, ...patch } : s))))
  }

  const removeStep = (id: string) => {
    setSteps((prev) => reorderSteps(prev.filter((s) => s.id !== id)))
  }

  const moveStep = (id: string, delta: -1 | 1) => {
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
  }

  const addStep = () => {
    setSteps((prev) => reorderSteps([...prev, newEmptyStep(prev.length + 1)]))
  }

  const saveDraft = () => {
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
  }

  const deleteTemplate = (id: string) => {
    const tpl = templates.find((t) => t.id === id)
    if (!tpl) return
    const ok = window.confirm(`“${tpl.name}” şablonu silinsin mi? (prototip — geri al yok)`)
    if (!ok) return
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    if (editingId === id) {
      resetToNewDraft()
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div
        className="flex flex-col gap-2 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-neo-in dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        role="status"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300" />
          <div>
            <p className="font-semibold text-amber-950 dark:text-amber-50">Erişim (mock)</p>
            <p className="mt-1 text-amber-900/95 dark:text-amber-100/95">
              Bu ekranı yalnızca <strong className="font-semibold">Yönetici</strong> ve{' '}
              <strong className="font-semibold">Süreç yöneticisi</strong> rolleri görür (üretimde RBAC).
              Onay akışı yapılandırması, modül izin matrisinden ayrıdır: akış <em>kimin sırayla onayladığı</em>
              ; izinler <em>hangi ekran/aksiyon</em> anlamına gelir.
            </p>
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="flex flex-col gap-5">
          <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Şablon & süreç</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Süreç tipi değişince adımları gözden geçirin; Teklif için eşik alanı koşullu görünür (P1).
                </p>
              </div>
              <p className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-700 shadow-neo-in dark:bg-gray-900 dark:text-gray-300">
                {editingId ? (
                  <>
                    Düzenleniyor: <span className="font-mono">{editingId}</span>
                  </>
                ) : (
                  'Yeni şablon (henüz kayıtlı değil)'
                )}
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Şablon adı
                </span>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-4 py-3 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Süreç tipi (mock)
                </span>
                <select
                  className={insetSelect}
                  value={processTypeId}
                  onChange={(e) => setProcessTypeId(e.target.value as ProcessTypeId)}
                >
                  {PROCESS_TYPES.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.tier.toUpperCase()}] {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Kayıtlı şablondan kopyala
                </span>
                <div className="mt-1.5 flex gap-2">
                  <select
                    className={`${insetSelect} flex-1`}
                    value={copyTemplateId}
                    onChange={(e) => setCopyTemplateId(e.target.value)}
                    aria-label="Kayıtlı şablon"
                  >
                    <option value="">— Seçin —</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} · {t.steps.length} adım
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-100 dark:hover:text-white dark:ring-offset-gray-900"
                    onClick={() => copyTemplateId && applyTemplateAsCopy(copyTemplateId)}
                    disabled={!copyTemplateId}
                    title="Seçilen şablonu forma kopyala (yeni kayıt olarak kaydedebilirsiniz)"
                  >
                    <Copy className="size-4" strokeWidth={1.75} aria-hidden />
                    <span className="hidden sm:inline">Kopyala</span>
                  </button>
                </div>
              </label>
            </div>

            {isQuote ? (
              <div className="mt-4 rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-900/80">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Eşik — yalnızca Teklif (koşullu UI)
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Bu tutarın üzerindeki teklifler bu akışa girer; altı farklı şablonla eşleştirilebilir (mock).
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tutar</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      className="mt-1 w-full rounded-xl border-0 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in dark:bg-gray-950 dark:text-gray-100"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Para birimi</span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className={`${insetSelect} mt-1`}
                    >
                      <option value="TRY">TRY</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </label>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Eşik alanı bu süreç tipi için gizli (Teklif dışı).
              </p>
            )}

            <div className="mt-4 rounded-2xl border border-dashed border-gray-300/90 bg-gray-100/80 p-4 dark:border-gray-600 dark:bg-gray-900/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                P2 — SLA / hatırlatma (disabled mock)
              </p>
              <label className="mt-2 block max-w-xs">
                <span className="text-xs text-gray-600 dark:text-gray-400">Gün</span>
                <input
                  disabled
                  value={slaDays}
                  onChange={(e) => setSlaDays(e.target.value)}
                  className="mt-1 w-full cursor-not-allowed rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-500 shadow-neo-in opacity-70 dark:bg-gray-950 dark:text-gray-400"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Adımlar (sıralı)</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Sırayı <strong className="font-semibold text-gray-800 dark:text-gray-100">Yukarı / Aşağı</strong> ile
                  değiştirin; her adımda rol veya kullanıcı (mock).
                </p>
              </div>
              <button type="button" className={`${btnSecondary} inline-flex items-center gap-1.5`} onClick={addStep}>
                <Plus className="size-4" strokeWidth={1.75} aria-hidden />
                Adım ekle
              </button>
            </div>

            <ul className="mt-4 space-y-4">
              {steps.map((s, idx) => (
                <li key={s.id} className="rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-900/80">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-gray-50 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100">
                        {s.order}
                      </span>
                      <div className="flex items-center gap-0.5 rounded-xl bg-gray-50 p-0.5 shadow-neo-in dark:bg-gray-950/60">
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
                          onClick={() => moveStep(s.id, -1)}
                          disabled={idx === 0}
                          aria-label={`Adım ${s.order} yukarı taşı`}
                          title="Yukarı"
                        >
                          <ChevronUp className="size-4" strokeWidth={2} aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
                          onClick={() => moveStep(s.id, 1)}
                          disabled={idx >= steps.length - 1}
                          aria-label={`Adım ${s.order} aşağı taşı`}
                          title="Aşağı"
                        >
                          <ChevronDown className="size-4" strokeWidth={2} aria-hidden />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-300 dark:hover:bg-red-950/50"
                      onClick={() => removeStep(s.id)}
                      disabled={steps.length <= 1}
                      aria-label={`Adım ${s.order} kaldır`}
                    >
                      <Trash2 className="size-3.5" />
                      Kaldır
                    </button>
                  </div>

                  <fieldset className="mt-3">
                    <legend className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Atama türü
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-4">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                        <input
                          type="radio"
                          className="size-4 accent-gray-800 dark:accent-gray-200"
                          name={`assign-${s.id}`}
                          checked={s.assigneeType === 'role'}
                          onChange={() => updateStep(s.id, { assigneeType: 'role' })}
                        />
                        Rol bazlı
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                        <input
                          type="radio"
                          className="size-4 accent-gray-800 dark:accent-gray-200"
                          name={`assign-${s.id}`}
                          checked={s.assigneeType === 'user'}
                          onChange={() => updateStep(s.id, { assigneeType: 'user' })}
                        />
                        Kişi bazlı
                      </label>
                    </div>
                  </fieldset>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {s.assigneeType === 'role' ? (
                      <label className="block sm:col-span-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Rol seç</span>
                        <select
                          className={insetSelect}
                          value={s.roleId}
                          onChange={(e) => updateStep(s.id, { roleId: e.target.value })}
                        >
                          {MOCK_APPROVAL_ROLES.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <label className="block sm:col-span-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Kullanıcı seç</span>
                        <select
                          className={insetSelect}
                          value={s.userId}
                          onChange={(e) => updateStep(s.id, { userId: e.target.value })}
                        >
                          {MOCK_APPROVAL_USERS.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <label className="flex items-center gap-2 text-sm text-gray-800 dark:col-span-2 dark:text-gray-100">
                      <input
                        id={`${baseId}-req-${s.id}`}
                        type="checkbox"
                        className="size-4 rounded border-gray-300 accent-gray-800 dark:accent-gray-200"
                        checked={s.required}
                        onChange={(e) => updateStep(s.id, { required: e.target.checked })}
                      />
                      Zorunlu onay
                    </label>
                  </div>

                  {idx === 1 ? (
                    <div
                      className="mt-4 rounded-xl border border-gray-300/80 bg-gray-50/90 p-3 text-center text-xs font-medium text-gray-600 shadow-neo-in dark:border-gray-600 dark:bg-gray-950/60 dark:text-gray-300"
                      role="note"
                    >
                      P2 — Paralel onay placeholder:{' '}
                      <span className="font-semibold text-gray-800 dark:text-gray-100">Dal A</span>
                      <span className="mx-2 text-gray-400">|</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">Dal B</span>
                      <span className="mt-1 block font-normal text-gray-500 dark:text-gray-400">
                        Üretimde paralel kolonlar ve eşik kuralları ayrı motor (mock görsel).
                      </span>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-200/90 pt-4 dark:border-gray-700/90">
              <button type="button" className={btnPrimary} onClick={saveDraft}>
                {editingId ? 'Kaydet (güncelle)' : 'Kaydet (yeni)'}
              </button>
              <button type="button" className={btnSecondary} onClick={resetToNewDraft}>
                Yeni şablon
              </button>
              <button type="button" className={btnSecondary} disabled title="Taslak — P2 (mock)">
                Taslak
              </button>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Kayıtlı onay akışları</h2>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Yerel tarayıcı (mock)</span>
            </div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Listeden düzenlemek için açın; silmek için çöp kutusu. Değişiklikler bu cihazda saklanır.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {templates.map((t) => {
                const active = editingId === t.id
                return (
                  <li
                    key={t.id}
                    className={[
                      'rounded-xl px-2 py-2 shadow-neo-in dark:bg-gray-900/80',
                      active ? 'bg-gray-200/90 dark:bg-gray-800/90' : 'bg-gray-100 dark:bg-gray-900/80',
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => openTemplate(t)}
                        className="min-w-0 flex-1 rounded-lg px-2 py-1.5 text-left transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:hover:bg-gray-950/80"
                      >
                        <p className="font-medium text-gray-900 dark:text-gray-50">{t.name}</p>
                        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                          {PROCESS_TYPES.find((p) => p.id === t.processTypeId)?.label ?? t.processTypeId} ·{' '}
                          {t.steps.length} adım
                          {t.thresholdAmount != null ? ` · eşik ${t.thresholdAmount} ${t.currency}` : ''}
                        </p>
                      </button>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:text-gray-300 dark:hover:bg-gray-950"
                          title="Düzenle"
                          aria-label={`${t.name} düzenle`}
                          onClick={() => openTemplate(t)}
                        >
                          <Pencil className="size-4" strokeWidth={1.75} aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-lg p-2 text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-300 dark:hover:bg-red-950/40"
                          title="Sil"
                          aria-label={`${t.name} sil`}
                          onClick={() => deleteTemplate(t.id)}
                        >
                          <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            {templates.length === 0 ? (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Kayıtlı şablon yok.</p>
            ) : null}
          </section>

          <section className="rounded-2xl bg-gray-100 p-5 shadow-neo-in dark:bg-gray-900/80">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Önizleme</h2>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Yatay stepper — sıra ve kısa etiket (mock).
            </p>
            <div className="mt-4 overflow-x-auto pb-2">
              <div className="flex min-w-min items-center gap-1">
                {previewLabels.map((label, i) => (
                  <div key={steps[i]?.id ?? `step-${i}`} className="flex items-center gap-1">
                    {i > 0 ? (
                      <ChevronRight className="size-4 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden />
                    ) : null}
                    <div className="flex flex-col items-center gap-1">
                      <span className="flex size-10 items-center justify-center rounded-full bg-gray-50 text-xs font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100">
                        {i + 1}
                      </span>
                      <span className="max-w-[5.5rem] text-center text-[11px] leading-tight text-gray-700 dark:text-gray-300">
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-gray-700 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-300">
              {previewLabels.join(' → ')}
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
