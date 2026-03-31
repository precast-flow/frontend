import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { MOCK_ENG_FACTORIES } from '../../data/engineeringWorkOrdersBie06Mock'

type Factory = (typeof MOCK_ENG_FACTORIES)[number]

type Props = {
  open: boolean
  workOrderCode: string
  projectLine: string
  summaryText: string
  factories: readonly Factory[]
  defaultFactoryId: string
  onClose: () => void
  onConfirm: (payload: { factoryId: string; dueDate: string }) => void
}

export function CreateProductionOrderModal({
  open,
  workOrderCode,
  projectLine,
  summaryText,
  factories,
  defaultFactoryId,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useI18n()
  const titleId = useId()
  const [factoryId, setFactoryId] = useState(defaultFactoryId)
  const [dueDate, setDueDate] = useState('2026-04-15')

  useEffect(() => {
    if (open) {
      setFactoryId(defaultFactoryId)
      setDueDate('2026-04-15')
    }
  }, [open, defaultFactoryId])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="gm-glass-modal-shell fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/25 backdrop-blur-[2px]"
        aria-label={t('eng.bie06.modal.close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg rounded-3xl bg-gray-100 p-5 shadow-neo-out dark:bg-gray-900"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {t('eng.bie06.modal.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 shadow-neo-out-sm hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
            aria-label={t('eng.bie06.modal.close')}
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{workOrderCode}</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{projectLine}</p>

        <label className="mt-4 block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('eng.bie06.modal.factory')}</span>
          <select
            value={factoryId}
            onChange={(e) => setFactoryId(e.target.value)}
            className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
          >
            {factories.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('eng.bie06.modal.due')}</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
          />
        </label>

        <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700 shadow-neo-in dark:bg-gray-950/90 dark:text-gray-200">
          <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('eng.bie06.modal.summary')}</p>
          <p className="mt-2 whitespace-pre-wrap text-gray-800 dark:text-gray-100">{summaryText}</p>
        </div>

        <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">{t('eng.bie06.modal.hint')}</p>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
          >
            {t('eng.bie06.modal.cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm({ factoryId, dueDate })
              onClose()
            }}
            className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
          >
            {t('eng.bie06.modal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
