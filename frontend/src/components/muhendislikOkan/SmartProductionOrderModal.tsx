import { useState } from 'react'
import { X } from 'lucide-react'
import type { OkanEngJob } from './engineeringIntegrationOkanMock'
import { CHECKLIST_ITEMS_OKAN, MOCK_OKAN_FACTORIES } from './engineeringIntegrationOkanMock'
import { computeReadinessPercent, hasCriticalChecklistGap } from './readinessEngine'

type TFn = (key: string, params?: Record<string, string>) => string

type Props = {
  open: boolean
  job: OkanEngJob
  t: TFn
  nextPrd: number
  onClose: () => void
  onConfirm: (payload: { factoryId: string; dueDate: string; prdId: string }) => void
}

const formNest =
  'grid gap-3 rounded-xl border border-white/25 bg-white/25 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5'

export function SmartProductionOrderModal({ open, job, t, nextPrd, onClose, onConfirm }: Props) {
  const [factoryId, setFactoryId] = useState<string>(MOCK_OKAN_FACTORIES[0]!.id)
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [forceConfirm, setForceConfirm] = useState(false)

  if (!open) return null

  const score = computeReadinessPercent(job)
  const criticalGap = hasCriticalChecklistGap(job.checklist)
  const missingLabels = CHECKLIST_ITEMS_OKAN.filter((c) => !job.checklist[c.id]).map((c) => t(`okanEng.chk.${c.id}`))

  const warnings: string[] = []
  if (job.files.some((f) => f.fileType.toUpperCase() === 'IFC' && f.integrationStatus !== 'hazir')) {
    warnings.push(t('okanEng.risk.ifcPending'))
  }
  if (job.manual.toleranceNote.trim().length < 3) {
    warnings.push(t('okanEng.risk.tolerance'))
  }

  const handlePrimary = () => {
    if (criticalGap || score < 70) {
      if (!forceConfirm) {
        setForceConfirm(true)
        return
      }
    }
    const prdId = `PRD-${nextPrd}`
    onConfirm({ factoryId, dueDate, prdId })
    setForceConfirm(false)
    onClose()
  }

  const handleFixFirst = () => {
    setForceConfirm(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={t('okanEng.modal.close')}
        className="okan-liquid-modal-backdrop absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        className="okan-liquid-modal-panel relative z-10 w-full max-w-lg p-5"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{t('okanEng.modal.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/35 text-slate-600 shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] backdrop-blur-md hover:text-slate-900 dark:border-white/12 dark:bg-white/10 dark:text-slate-200 dark:hover:text-white"
            aria-label={t('okanEng.modal.close')}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-2 space-y-3 text-sm">
          <div>
            <span className="font-medium text-slate-700 dark:text-slate-200">{t('okanEng.modal.missing')}</span>
            {missingLabels.length === 0 ? (
              <p className="mt-1 text-emerald-700 dark:text-emerald-300">{t('okanEng.modal.missingNone')}</p>
            ) : (
              <ul className="mt-1 list-inside list-disc text-slate-700 dark:text-slate-200">
                {missingLabels.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <span className="font-medium text-slate-700 dark:text-slate-200">{t('okanEng.modal.warnings')}</span>
            {warnings.length === 0 ? (
              <p className="mt-1 text-slate-600 dark:text-slate-300">{t('okanEng.modal.warningsNone')}</p>
            ) : (
              <ul className="mt-1 list-inside list-disc text-amber-900 dark:text-amber-100">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {t('okanEng.modal.readinessLine', { score: String(score) })}
          </p>
        </div>

        <div className={`mt-4 ${formNest}`}>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t('okanEng.modal.factory')}
            <select
              value={factoryId}
              onChange={(e) => setFactoryId(e.target.value)}
              className="okan-liquid-select mt-1 w-full border-0 px-3 py-2.5 text-sm shadow-none"
            >
              {MOCK_OKAN_FACTORIES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t('okanEng.modal.due')}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="okan-liquid-input mt-1 w-full border-0 px-3 py-2.5 text-sm shadow-none"
            />
          </label>
        </div>

        {forceConfirm ? (
          <p className="okan-liquid-banner-warn mt-3 px-3 py-2.5 text-sm text-amber-950 dark:text-amber-100">
            {t('okanEng.modal.forceWarn')}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleFixFirst}
            className="okan-liquid-btn-secondary px-4 py-2.5 text-sm font-semibold"
          >
            {t('okanEng.modal.fixFirst')}
          </button>
          <button
            type="button"
            onClick={handlePrimary}
            className="okan-liquid-btn-primary px-4 py-2.5 text-sm font-semibold"
          >
            {forceConfirm && (criticalGap || score < 70) ? t('okanEng.modal.confirmForce') : t('okanEng.modal.proceed')}
          </button>
        </div>
      </div>
    </div>
  )
}
