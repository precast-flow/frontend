import { useId } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight, ChevronUp, Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  MOCK_APPROVAL_ROLES,
  MOCK_APPROVAL_USERS,
  PROCESS_TYPES,
  type ProcessTypeId,
} from '../../data/mockApprovalFlow'
import type { ApprovalFlowDesignerState } from './useApprovalFlowDesignerState'

type Variant = 'neo' | 'liquid'

function editorStyles(v: Variant) {
  if (v === 'neo') {
    return {
      alertWrap:
        'flex flex-col gap-2 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-neo-in dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100',
      section: 'rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80',
      sectionInset: 'rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-900/80',
      insetSelect:
        'mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100',
      input: 'mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-4 py-3 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100',
      thresholdBox: 'mt-4 rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-900/80',
      slaBox: 'mt-4 rounded-2xl border border-dashed border-gray-300/90 bg-gray-100/80 p-4 dark:border-gray-600 dark:bg-gray-900/60',
      stepCard: 'rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-900/80',
      btnPrimary:
        'rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900',
      btnSecondary:
        'rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-100 dark:hover:text-white dark:ring-offset-gray-900',
      badge: 'rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-700 shadow-neo-in dark:bg-gray-900 dark:text-gray-300',
      labelUpper: 'text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400',
      h2: 'text-sm font-semibold text-gray-900 dark:text-gray-50',
      muted: 'text-sm text-gray-600 dark:text-gray-300',
      mutedXs: 'text-xs text-gray-600 dark:text-gray-400',
    }
  }
  return {
    alertWrap:
      'flex flex-col gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100',
    section: 'rounded-xl border border-slate-200/70 bg-white/55 p-4 dark:border-slate-600/60 dark:bg-slate-900/45',
    sectionInset: 'rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-600/60 dark:bg-slate-900/35',
    insetSelect:
      'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100',
    input:
      'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100',
    thresholdBox: 'mt-3 rounded-lg border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-600/50 dark:bg-slate-900/40',
    slaBox: 'mt-3 rounded-lg border border-dashed border-slate-300/80 bg-white/40 p-3 dark:border-slate-600 dark:bg-slate-900/30',
    stepCard: 'rounded-xl border border-slate-200/60 bg-white/50 p-3 dark:border-slate-600/50 dark:bg-slate-900/40',
    btnPrimary:
      'rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
    btnSecondary:
      'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    badge: 'rounded-full border border-slate-200/80 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
    labelUpper: 'text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400',
    h2: 'text-sm font-semibold text-slate-900 dark:text-slate-50',
    muted: 'text-sm text-slate-600 dark:text-slate-300',
    mutedXs: 'text-xs text-slate-600 dark:text-slate-400',
  }
}

function asideStyles(v: Variant) {
  if (v === 'neo') {
    return {
      section: 'rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80',
      sectionPreview: 'rounded-2xl bg-gray-100 p-5 shadow-neo-in dark:bg-gray-900/80',
      li: (active: boolean) =>
        [
          'rounded-xl px-2 py-2 shadow-neo-in dark:bg-gray-900/80',
          active ? 'bg-gray-200/90 dark:bg-gray-800/90' : 'bg-gray-100 dark:bg-gray-900/80',
        ].join(' '),
      h2: 'text-sm font-semibold text-gray-900 dark:text-gray-50',
      hint: 'mt-1 text-xs text-gray-600 dark:text-gray-400',
      name: 'font-medium text-gray-900 dark:text-gray-50',
      sub: 'mt-0.5 text-xs text-gray-600 dark:text-gray-400',
      stepCircle: 'flex size-10 items-center justify-center rounded-full bg-gray-50 text-xs font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100',
      stepLabel: 'max-w-[5.5rem] text-center text-[11px] leading-tight text-gray-700 dark:text-gray-300',
      monoJoin: 'mt-3 rounded-lg bg-gray-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-gray-700 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-300',
    }
  }
  return {
    section: 'rounded-xl border border-slate-200/70 bg-white/55 p-4 dark:border-slate-600/60 dark:bg-slate-900/45',
    sectionPreview: 'rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-600/60 dark:bg-slate-900/35',
    li: (active: boolean) =>
      [
        'rounded-lg border px-2 py-2 text-left transition',
        active
          ? 'border-sky-400/60 bg-sky-500/10 dark:border-sky-500/40 dark:bg-sky-500/15'
          : 'border-slate-200/50 bg-white/40 dark:border-slate-700/50 dark:bg-slate-900/30',
      ].join(' '),
    h2: 'text-sm font-semibold text-slate-900 dark:text-slate-50',
    hint: 'mt-1 text-xs text-slate-600 dark:text-slate-400',
    name: 'font-medium text-slate-900 dark:text-slate-50',
    sub: 'mt-0.5 text-[11px] text-slate-600 dark:text-slate-400',
    stepCircle: 'flex size-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-[11px] font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
    stepLabel: 'max-w-[5rem] text-center text-[10px] leading-tight text-slate-700 dark:text-slate-300',
    monoJoin: 'mt-2 rounded-lg border border-slate-200/70 bg-slate-950 px-2 py-2 font-mono text-[10px] leading-relaxed text-slate-100 dark:border-slate-600',
  }
}

type EditorProps = ApprovalFlowDesignerState & { variant: Variant }

export function ApprovalFlowDesignerEditorSection(props: EditorProps) {
  const baseId = useId()
  const s = editorStyles(props.variant)
  const {
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
    templates,
    applyTemplateAsCopy,
    updateStep,
    removeStep,
    moveStep,
    addStep,
    saveDraft,
    resetToNewDraft,
  } = props

  return (
    <>
      <div className={s.alertWrap} role="status">
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

      <section className={s.section}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className={s.h2}>Şablon & süreç</h2>
            <p className={`mt-1 ${s.muted}`}>
              Süreç tipi değişince adımları gözden geçirin; Teklif için eşik alanı koşullu görünür (P1).
            </p>
          </div>
          <p className={s.badge}>
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
            <span className={s.labelUpper}>Şablon adı</span>
            <input value={draftName} onChange={(e) => setDraftName(e.target.value)} className={s.input} />
          </label>
          <label className="block">
            <span className={s.labelUpper}>Süreç tipi (mock)</span>
            <select className={s.insetSelect} value={processTypeId} onChange={(e) => setProcessTypeId(e.target.value as ProcessTypeId)}>
              {PROCESS_TYPES.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.tier.toUpperCase()}] {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={s.labelUpper}>Kayıtlı şablondan kopyala</span>
            <div className={props.variant === 'neo' ? 'mt-1.5 flex gap-2' : 'mt-1 flex gap-2'}>
              <select
                className={`${s.insetSelect} flex-1`}
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
                className={`${s.btnSecondary} flex shrink-0 items-center gap-1.5 px-3 ${props.variant === 'neo' ? 'py-2.5' : 'py-2'}`}
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
          <div className={s.thresholdBox}>
            <p className={s.labelUpper}>Eşik — yalnızca Teklif (koşullu UI)</p>
            <p className={`mt-1 text-xs ${s.mutedXs}`}>
              Bu tutarın üzerindeki teklifler bu akışa girer; altı farklı şablonla eşleştirilebilir (mock).
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="block">
                <span className={`text-xs font-medium ${s.mutedXs}`}>Tutar</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className={
                    props.variant === 'neo'
                      ? 'mt-1 w-full rounded-xl border-0 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in dark:bg-gray-950 dark:text-gray-100'
                      : 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'
                  }
                />
              </label>
              <label className="block">
                <span className={`text-xs font-medium ${s.mutedXs}`}>Para birimi</span>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`${s.insetSelect} mt-1`}>
                  <option value="TRY">TRY</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </label>
            </div>
          </div>
        ) : (
          <p className={`mt-4 text-xs ${props.variant === 'neo' ? 'text-gray-500 dark:text-gray-400' : 'text-slate-500 dark:text-slate-400'}`}>
            Eşik alanı bu süreç tipi için gizli (Teklif dışı).
          </p>
        )}

        <div className={s.slaBox}>
          <p className={s.labelUpper}>P2 — SLA / hatırlatma (disabled mock)</p>
          <label className="mt-2 block max-w-xs">
            <span className={`text-xs ${s.mutedXs}`}>Gün</span>
            <input
              disabled
              value={slaDays}
              onChange={(e) => setSlaDays(e.target.value)}
              className={
                props.variant === 'neo'
                  ? 'mt-1 w-full cursor-not-allowed rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-500 shadow-neo-in opacity-70 dark:bg-gray-950 dark:text-gray-400'
                  : 'mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-2 text-sm text-slate-500 opacity-70 dark:bg-slate-900'
              }
            />
          </label>
        </div>
      </section>

      <section className={s.section}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={s.h2}>Adımlar (sıralı)</h2>
            <p className={`mt-1 ${s.muted}`}>
              Sırayı <strong className="font-semibold">Yukarı / Aşağı</strong> ile değiştirin; her adımda rol veya kullanıcı (mock).
            </p>
          </div>
          <button type="button" className={`${s.btnSecondary} inline-flex items-center gap-1.5`} onClick={addStep}>
            <Plus className="size-4" strokeWidth={1.75} aria-hidden />
            Adım ekle
          </button>
        </div>

        <ul className="mt-4 space-y-4">
          {steps.map((st, idx) => (
            <li key={st.id} className={s.stepCard}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      props.variant === 'neo'
                        ? 'inline-flex size-8 items-center justify-center rounded-full bg-gray-50 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100'
                        : 'inline-flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
                    }
                  >
                    {st.order}
                  </span>
                  <div
                    className={
                      props.variant === 'neo'
                        ? 'flex items-center gap-0.5 rounded-xl bg-gray-50 p-0.5 shadow-neo-in dark:bg-gray-950/60'
                        : 'flex items-center gap-0.5 rounded-lg border border-slate-200/80 bg-white p-0.5 dark:border-slate-600'
                    }
                  >
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
                      onClick={() => moveStep(st.id, -1)}
                      disabled={idx === 0}
                      aria-label={`Adım ${st.order} yukarı taşı`}
                      title="Yukarı"
                    >
                      <ChevronUp className="size-4" strokeWidth={2} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
                      onClick={() => moveStep(st.id, 1)}
                      disabled={idx >= steps.length - 1}
                      aria-label={`Adım ${st.order} aşağı taşı`}
                      title="Aşağı"
                    >
                      <ChevronDown className="size-4" strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-300 dark:hover:bg-red-950/50"
                  onClick={() => removeStep(st.id)}
                  disabled={steps.length <= 1}
                  aria-label={`Adım ${st.order} kaldır`}
                >
                  <Trash2 className="size-3.5" />
                  Kaldır
                </button>
              </div>

              <fieldset className="mt-3">
                <legend className={s.labelUpper}>Atama türü</legend>
                <div className="mt-2 flex flex-wrap gap-4">
                  <label className={`flex cursor-pointer items-center gap-2 text-sm ${props.variant === 'neo' ? 'text-gray-800 dark:text-gray-100' : 'text-slate-800 dark:text-slate-100'}`}>
                    <input
                      type="radio"
                      className="size-4 accent-gray-800 dark:accent-gray-200"
                      name={`assign-${st.id}`}
                      checked={st.assigneeType === 'role'}
                      onChange={() => updateStep(st.id, { assigneeType: 'role' })}
                    />
                    Rol bazlı
                  </label>
                  <label className={`flex cursor-pointer items-center gap-2 text-sm ${props.variant === 'neo' ? 'text-gray-800 dark:text-gray-100' : 'text-slate-800 dark:text-slate-100'}`}>
                    <input
                      type="radio"
                      className="size-4 accent-gray-800 dark:accent-gray-200"
                      name={`assign-${st.id}`}
                      checked={st.assigneeType === 'user'}
                      onChange={() => updateStep(st.id, { assigneeType: 'user' })}
                    />
                    Kişi bazlı
                  </label>
                </div>
              </fieldset>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {st.assigneeType === 'role' ? (
                  <label className="block sm:col-span-2">
                    <span className={`text-xs font-medium ${s.mutedXs}`}>Rol seç</span>
                    <select className={s.insetSelect} value={st.roleId} onChange={(e) => updateStep(st.id, { roleId: e.target.value })}>
                      {MOCK_APPROVAL_ROLES.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="block sm:col-span-2">
                    <span className={`text-xs font-medium ${s.mutedXs}`}>Kullanıcı seç</span>
                    <select className={s.insetSelect} value={st.userId} onChange={(e) => updateStep(st.id, { userId: e.target.value })}>
                      {MOCK_APPROVAL_USERS.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className={`flex items-center gap-2 text-sm sm:col-span-2 ${props.variant === 'neo' ? 'text-gray-800 dark:text-gray-100' : 'text-slate-800 dark:text-slate-100'}`}>
                  <input
                    id={`${baseId}-req-${st.id}`}
                    type="checkbox"
                    className="size-4 rounded border-gray-300 accent-gray-800 dark:accent-gray-200"
                    checked={st.required}
                    onChange={(e) => updateStep(st.id, { required: e.target.checked })}
                  />
                  Zorunlu onay
                </label>
              </div>

              {idx === 1 ? (
                <div
                  className={
                    props.variant === 'neo'
                      ? 'mt-4 rounded-xl border border-gray-300/80 bg-gray-50/90 p-3 text-center text-xs font-medium text-gray-600 shadow-neo-in dark:border-gray-600 dark:bg-gray-950/60 dark:text-gray-300'
                      : 'mt-3 rounded-lg border border-slate-200/80 bg-slate-50/90 p-2.5 text-center text-[11px] font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-300'
                  }
                  role="note"
                >
                  P2 — Paralel onay placeholder: <span className="font-semibold">Dal A</span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="font-semibold">Dal B</span>
                  <span className="mt-1 block font-normal text-gray-500 dark:text-gray-400">
                    Üretimde paralel kolonlar ve eşik kuralları ayrı motor (mock görsel).
                  </span>
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        <div
          className={
            props.variant === 'neo'
              ? 'mt-6 flex flex-wrap gap-2 border-t border-gray-200/90 pt-4 dark:border-gray-700/90'
              : 'mt-4 flex flex-wrap gap-2 border-t border-slate-200/60 pt-3 dark:border-slate-700/60'
          }
        >
          <button type="button" className={s.btnPrimary} onClick={saveDraft}>
            {props.editingId ? 'Kaydet (güncelle)' : 'Kaydet (yeni)'}
          </button>
          <button type="button" className={s.btnSecondary} onClick={resetToNewDraft}>
            Yeni şablon
          </button>
          <button type="button" className={s.btnSecondary} disabled title="Taslak — P2 (mock)">
            Taslak
          </button>
        </div>
      </section>
    </>
  )
}

type AsideProps = ApprovalFlowDesignerState & {
  variant: Variant
  onDeleteTemplate: (id: string) => void
  showPreview: boolean
}

export function ApprovalFlowDesignerTemplateAside(props: AsideProps) {
  const { templates, editingId, openTemplate, onDeleteTemplate, previewLabels, steps, variant, showPreview } = props
  const a = asideStyles(variant)

  return (
    <>
      <section className={a.section}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={a.h2}>Kayıtlı onay akışları</h2>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">Yerel tarayıcı (mock)</span>
        </div>
        <p className={a.hint}>Listeden düzenlemek için açın; silmek için çöp kutusu. Değişiklikler bu cihazda saklanır.</p>
        <ul className="mt-3 space-y-2 text-sm">
          {templates.map((t) => {
            const active = editingId === t.id
            return (
              <li key={t.id} className={a.li(active)}>
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => openTemplate(t)}
                    className={
                      variant === 'neo'
                        ? 'min-w-0 flex-1 rounded-lg px-2 py-1.5 text-left transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:hover:bg-gray-950/80'
                        : 'min-w-0 flex-1 rounded-md px-2 py-1.5 text-left transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:hover:bg-slate-900/50'
                    }
                  >
                    <p className={a.name}>{t.name}</p>
                    <p className={a.sub}>
                      {PROCESS_TYPES.find((p) => p.id === t.processTypeId)?.label ?? t.processTypeId} · {t.steps.length} adım
                      {t.thresholdAmount != null ? ` · eşik ${t.thresholdAmount} ${t.currency}` : ''}
                    </p>
                  </button>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      className={
                        variant === 'neo'
                          ? 'inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:text-gray-300 dark:hover:bg-gray-950'
                          : 'inline-flex items-center justify-center rounded-md p-1.5 text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800/80'
                      }
                      title="Düzenle"
                      aria-label={`${t.name} düzenle`}
                      onClick={() => openTemplate(t)}
                    >
                      <Pencil className="size-4" strokeWidth={1.75} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={
                        variant === 'neo'
                          ? 'inline-flex items-center justify-center rounded-lg p-2 text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-300 dark:hover:bg-red-950/40'
                          : 'inline-flex items-center justify-center rounded-md p-1.5 text-rose-700 hover:bg-rose-50/80 dark:text-rose-300 dark:hover:bg-rose-950/30'
                      }
                      title="Sil"
                      aria-label={`${t.name} sil`}
                      onClick={() => onDeleteTemplate(t.id)}
                    >
                      <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        {templates.length === 0 ? <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Kayıtlı şablon yok.</p> : null}
      </section>

      {showPreview ? (
        <section className={a.sectionPreview}>
          <h2 className={a.h2}>Önizleme</h2>
          <p className={a.hint}>Yatay stepper — sıra ve kısa etiket (mock).</p>
          <div className="mt-4 overflow-x-auto pb-2">
            <div className="flex min-w-min items-center gap-1">
              {previewLabels.map((label, i) => (
                <div key={steps[i]?.id ?? `step-${i}`} className="flex items-center gap-1">
                  {i > 0 ? <ChevronRight className="size-4 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden /> : null}
                  <div className="flex flex-col items-center gap-1">
                    <span className={a.stepCircle}>{i + 1}</span>
                    <span className={a.stepLabel}>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className={a.monoJoin}>{previewLabels.join(' → ')}</p>
        </section>
      ) : null}
    </>
  )
}

export function ApprovalFlowDesignerPreviewPanel({
  variant,
  previewLabels,
  steps,
}: {
  variant: Variant
  previewLabels: string[]
  steps: { id: string }[]
}) {
  const a = asideStyles(variant)
  return (
    <section className={a.sectionPreview}>
      <h2 className={a.h2}>Önizleme</h2>
      <p className={a.hint}>Yatay stepper — sıra ve kısa etiket (mock).</p>
      <div className="mt-4 overflow-x-auto pb-2">
        <div className="flex min-w-min items-center gap-1">
          {previewLabels.map((label, i) => (
            <div key={steps[i]?.id ?? `step-${i}`} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight className="size-4 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden /> : null}
              <div className="flex flex-col items-center gap-1">
                <span className={a.stepCircle}>{i + 1}</span>
                <span className={a.stepLabel}>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className={a.monoJoin}>{previewLabels.join(' → ')}</p>
    </section>
  )
}
