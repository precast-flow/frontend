import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { ProjectProduct } from '../../elementIdentity/types'
import { useI18n } from '../../i18n/I18nProvider'
import { PmStyleDialog, AppDialogButton } from '../shared/PmStyleDialog'
import { useElementIdentity } from './elementIdentityContextValue'
import { newRowId } from './productEditorUtils'
import {
  PRODUCT_TRANSFER_REASON_ORDER,
  type ProductTransferLogEntry,
  type ProductTransferReasonKey,
  transferReasonI18nKey,
} from './productTransferTypes'

type Step = 'select' | 'target' | 'confirm' | 'done'

type Props = {
  open: boolean
  sourceProjectId: string
  sourceProjectLabel: string
  activeProducts: ProjectProduct[]
  onClose: () => void
  onTransferred: (log: ProductTransferLogEntry) => void
}

export function ProductTransferDialog({
  open,
  sourceProjectId,
  sourceProjectLabel,
  activeProducts,
  onClose,
  onTransferred,
}: Props) {
  const { t, locale } = useI18n()
  const { projects, updateProjectProduct } = useElementIdentity()

  const [step, setStep] = useState<Step>('select')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [targetProjectId, setTargetProjectId] = useState('')
  const [reason, setReason] = useState<ProductTransferReasonKey | ''>('')
  const [reasonNote, setReasonNote] = useState('')
  const [query, setQuery] = useState('')

  const targetOptions = useMemo(
    () => projects.filter((p) => p.id !== sourceProjectId),
    [projects, sourceProjectId],
  )

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR')
    if (!q) return activeProducts
    return activeProducts.filter((p) => {
      const hay = `${p.code} ${p.name}`.toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR')
      return hay.includes(q)
    })
  }, [activeProducts, query, locale])

  const selectedProducts = useMemo(
    () => activeProducts.filter((p) => selectedIds.has(p.id)),
    [activeProducts, selectedIds],
  )

  const targetProject = useMemo(
    () => projects.find((p) => p.id === targetProjectId) ?? null,
    [projects, targetProjectId],
  )

  const targetLabel = targetProject
    ? `${targetProject.code}${targetProject.name ? ` · ${targetProject.name}` : ''}`
    : '—'

  const reasonLabel = reason ? t(transferReasonI18nKey(reason)) : '—'

  const otherNoteRequired = reason === 'other'
  const otherNoteValid = !otherNoteRequired || reasonNote.trim().length > 0

  const canGoTarget = selectedIds.size > 0
  const canGoConfirm = Boolean(targetProjectId && reason && otherNoteValid)
  const canExecute = canGoConfirm && selectedProducts.length > 0

  const reset = useCallback(() => {
    setStep('select')
    setSelectedIds(new Set())
    setTargetProjectId('')
    setReason('')
    setReasonNote('')
    setQuery('')
  }, [])

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const toggleAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(filteredProducts.map((p) => p.id)))
    else setSelectedIds(new Set())
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const executeTransfer = useCallback(() => {
    if (!canExecute || !targetProject) return

    const at = new Date().toLocaleString(locale === 'en' ? 'en-GB' : 'tr-TR')
    const noteSuffix =
      reason === 'other' && reasonNote.trim() ? ` — ${reasonNote.trim()}` : ''
    const activityText = t('elementIdentity.transfer.activityLine', {
      from: sourceProjectLabel,
      to: targetLabel,
      reason: reasonLabel + noteSuffix,
    })

    for (const product of selectedProducts) {
      updateProjectProduct({
        ...product,
        projectId: targetProjectId,
        activities: [
          {
            id: newRowId('act'),
            at,
            text: activityText,
            by: locale === 'en' ? 'You' : 'Siz',
          },
          ...(product.activities ?? []),
        ],
      })
    }

    const log: ProductTransferLogEntry = {
      id: `txf-${Date.now()}`,
      at,
      fromProjectId: sourceProjectId,
      toProjectId: targetProjectId,
      toProjectLabel: targetLabel,
      productIds: selectedProducts.map((p) => p.id),
      productSummaries: selectedProducts.map((p) => `${p.code} · ${p.name}`),
      reason: reason as ProductTransferReasonKey,
      reasonNote: reason === 'other' ? reasonNote.trim() : undefined,
    }

    onTransferred(log)
    setStep('done')
  }, [
    canExecute,
    targetProject,
    locale,
    t,
    sourceProjectLabel,
    targetLabel,
    reasonLabel,
    reason,
    reasonNote,
    selectedProducts,
    updateProjectProduct,
    targetProjectId,
    sourceProjectId,
    onTransferred,
  ])

  const resetAndClose = () => {
    reset()
    onClose()
  }

  if (!open) return null

  const stepLabels: Record<Step, string> = {
    select: t('elementIdentity.transfer.stepSelect'),
    target: t('elementIdentity.transfer.stepTarget'),
    confirm: t('elementIdentity.transfer.stepConfirm'),
    done: t('elementIdentity.transfer.stepDone'),
  }

  const footer = (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <span className="text-[11px] text-slate-500">
        {step !== 'done' ? stepLabels[step] : null}
      </span>
      <div className="flex flex-wrap justify-end gap-2">
        <AppDialogButton variant="secondary" onClick={resetAndClose}>
          {t('elementIdentity.cancel')}
        </AppDialogButton>
        {step === 'select' ? (
          <AppDialogButton variant="primary" disabled={!canGoTarget} onClick={() => setStep('target')}>
            {t('elementIdentity.ifc.next')}
          </AppDialogButton>
        ) : null}
        {step === 'target' ? (
          <>
            <AppDialogButton variant="secondary" onClick={() => setStep('select')}>
              {t('elementIdentity.transfer.back')}
            </AppDialogButton>
            <AppDialogButton variant="primary" disabled={!canGoConfirm} onClick={() => setStep('confirm')}>
              {t('elementIdentity.transfer.review')}
            </AppDialogButton>
          </>
        ) : null}
        {step === 'confirm' ? (
          <>
            <AppDialogButton variant="secondary" onClick={() => setStep('target')}>
              {t('elementIdentity.transfer.back')}
            </AppDialogButton>
            <AppDialogButton variant="primary" disabled={!canExecute} onClick={executeTransfer}>
              {t('elementIdentity.transfer.confirmAction')}
            </AppDialogButton>
          </>
        ) : null}
      </div>
    </div>
  )

  const inputCls =
    'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'
  const labelCls = 'text-xs font-medium text-slate-600 dark:text-slate-300'

  return (
    <PmStyleDialog
      title={t('elementIdentity.transfer.title')}
      subtitle={t('elementIdentity.transfer.subtitle')}
      closeLabel={t('elementIdentity.cancel')}
      onClose={resetAndClose}
      footer={footer}
      size="md"
      ariaLabel={t('elementIdentity.transfer.title')}
    >
      <div className="flex flex-col gap-4 text-sm">
        <ol className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {(['select', 'target', 'confirm'] as const).map((s, i) => (
            <li
              key={s}
              className={[
                'rounded-full px-2.5 py-1',
                step === s || (step === 'done' && s === 'confirm')
                  ? 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
              ].join(' ')}
            >
              {i + 1}. {stepLabels[s]}
            </li>
          ))}
        </ol>

        {step === 'select' ? (
          <>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t('elementIdentity.transfer.selectHint', { project: sourceProjectLabel })}
            </p>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('elementIdentity.detail.productSearchPh')}
              className={inputCls}
            />
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2 dark:border-slate-700/60">
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={
                    filteredProducts.length > 0 &&
                    filteredProducts.every((p) => selectedIds.has(p.id))
                  }
                  onChange={(e) => toggleAll(e.target.checked)}
                />
                {t('elementIdentity.transfer.selectAll')}
              </label>
              <span className="tabular-nums text-xs text-slate-500">
                {selectedIds.size} / {activeProducts.length}
              </span>
            </div>
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <li className="py-6 text-center text-xs text-slate-500">
                  {t('elementIdentity.products.empty')}
                </li>
              ) : (
                filteredProducts.map((p) => (
                  <li key={p.id}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200/70 px-2.5 py-2 hover:bg-slate-50 dark:border-slate-700/60 dark:hover:bg-slate-900/40">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleOne(p.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-xs font-semibold text-slate-900 dark:text-slate-50">
                          {p.code}
                        </span>
                        <span className="block truncate text-xs text-slate-600 dark:text-slate-300">
                          {p.name}
                        </span>
                      </span>
                    </label>
                  </li>
                ))
              )}
            </ul>
          </>
        ) : null}

        {step === 'target' ? (
          <>
            <div className="rounded-lg border border-slate-200/70 bg-slate-50/80 px-3 py-2 text-xs dark:border-slate-700/60 dark:bg-slate-900/40">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {t('elementIdentity.transfer.selectedCount', { count: String(selectedProducts.length) })}
              </span>
            </div>
            <label className="block">
              <span className={labelCls}>{t('elementIdentity.transfer.targetProject')}</span>
              <select
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                className={inputCls}
              >
                <option value="">{t('elementIdentity.transfer.targetPlaceholder')}</option>
                {targetOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code}
                    {p.name ? ` · ${p.name}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend className={`${labelCls} mb-2`}>
                {t('elementIdentity.transfer.reasonLabel')}
                <span className="text-red-600 dark:text-red-400"> *</span>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {PRODUCT_TRANSFER_REASON_ORDER.map((key) => (
                  <label
                    key={key}
                    className={[
                      'flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-xs transition',
                      reason === key
                        ? 'border-sky-400/70 bg-sky-50/90 dark:border-sky-500/50 dark:bg-sky-950/30'
                        : 'border-slate-200/70 hover:border-slate-300 dark:border-slate-700/60',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="transfer-reason"
                      className="mt-0.5"
                      checked={reason === key}
                      onChange={() => setReason(key)}
                    />
                    <span>{t(transferReasonI18nKey(key))}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {otherNoteRequired ? (
              <label className="block">
                <span className={labelCls}>
                  {t('elementIdentity.transfer.otherNote')}
                  <span className="text-red-600 dark:text-red-400"> *</span>
                </span>
                <textarea
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  rows={3}
                  className={inputCls}
                  placeholder={t('elementIdentity.transfer.otherNotePh')}
                />
              </label>
            ) : null}
            {!reason ? (
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                {t('elementIdentity.transfer.reasonRequired')}
              </p>
            ) : null}
          </>
        ) : null}

        {step === 'confirm' ? (
          <div className="space-y-3 rounded-xl border border-slate-200/70 bg-white/60 p-4 dark:border-slate-700/60 dark:bg-slate-950/30">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              {t('elementIdentity.transfer.summaryTitle')}
            </h3>
            <dl className="grid gap-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">{t('elementIdentity.transfer.summaryFrom')}</dt>
                <dd className="text-end font-semibold text-slate-900 dark:text-slate-100">
                  {sourceProjectLabel}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">{t('elementIdentity.transfer.summaryTo')}</dt>
                <dd className="text-end font-semibold text-slate-900 dark:text-slate-100">{targetLabel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">{t('elementIdentity.transfer.summaryReason')}</dt>
                <dd className="text-end text-slate-800 dark:text-slate-200">{reasonLabel}</dd>
              </div>
              {reason === 'other' && reasonNote.trim() ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">{t('elementIdentity.transfer.summaryNote')}</dt>
                  <dd className="max-w-[14rem] text-end text-slate-800 dark:text-slate-200">
                    {reasonNote.trim()}
                  </dd>
                </div>
              ) : null}
            </dl>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('elementIdentity.transfer.summaryProducts')} ({selectedProducts.length})
              </p>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs">
                {selectedProducts.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-md border border-slate-200/60 bg-slate-50/80 px-2 py-1 font-mono dark:border-slate-700/50 dark:bg-slate-900/50"
                  >
                    {p.code} · {p.name}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('elementIdentity.transfer.summaryDisclaimer')}
            </p>
          </div>
        ) : null}

        {step === 'done' ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="size-12 text-emerald-600 dark:text-emerald-400" aria-hidden />
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              {t('elementIdentity.transfer.doneTitle')}
            </p>
            <p className="max-w-sm text-xs text-slate-600 dark:text-slate-300">
              {t('elementIdentity.transfer.doneBody', {
                count: String(selectedProducts.length),
                target: targetLabel,
              })}
            </p>
          </div>
        ) : null}
      </div>
    </PmStyleDialog>
  )
}
