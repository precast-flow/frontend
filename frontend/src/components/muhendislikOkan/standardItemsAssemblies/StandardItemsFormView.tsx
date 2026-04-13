import { useEffect, useState, type ReactNode } from 'react'
import { useI18n } from '../../../i18n/I18nProvider'
import { SIA_LOCATIONS, SIA_UNITS } from './standardItemsAssembliesMock'

export type FormShape = {
  location: string
  itemCode: string
  description: string
  unitCode: string
  active: boolean
}

const empty: FormShape = {
  location: '',
  itemCode: '',
  description: '',
  unitCode: '',
  active: true,
}

type Props = {
  mode: 'new' | 'edit'
  initial: FormShape
  itemCodeLabel?: string
  onSave: (v: FormShape) => void
  onSaveAndClose: (v: FormShape) => void
  onRequestClose: () => void
}

export function StandardItemsFormView({ mode, initial, itemCodeLabel, onSave, onSaveAndClose, onRequestClose }: Props) {
  const { t } = useI18n()
  const [form, setForm] = useState<FormShape>(initial)
  const [baseline, setBaseline] = useState(JSON.stringify(initial))

  useEffect(() => {
    setForm(initial)
    setBaseline(JSON.stringify(initial))
  }, [initial])

  const dirty = JSON.stringify(form) !== baseline
  const [error, setError] = useState<string | null>(null)
  const [unsavedOpen, setUnsavedOpen] = useState(false)

  const validate = (): FormShape | null => {
    if (!form.location.trim() || !form.itemCode.trim() || !form.description.trim() || !form.unitCode.trim()) {
      setError(t('sia.form.required'))
      return null
    }
    setError(null)
    return form
  }

  const handleSave = () => {
    const v = validate()
    if (!v) return
    onSave(v)
    setBaseline(JSON.stringify(v))
  }

  const handleSaveClose = () => {
    const v = validate()
    if (!v) return
    onSaveAndClose(v)
  }

  const handleCloseClick = () => {
    if (dirty) setUnsavedOpen(true)
    else onRequestClose()
  }

  const field = (id: keyof FormShape, label: string, required: boolean, control: ReactNode) => (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(140px,180px)_1fr] sm:items-center">
      <label htmlFor={id} className="text-right text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
        {required ? <span className="text-red-600 dark:text-red-400"> *</span> : null}
      </label>
      <div className="min-w-0">{control}</div>
    </div>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="okan-liquid-panel-nested flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{t('sia.title')}</h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('sia.demoBadge')}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {mode === 'new' ? t('sia.form.new') : t('sia.form.edit', { code: itemCodeLabel ?? form.itemCode })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleSave} className="okan-liquid-btn-primary px-3 py-2 text-sm font-semibold">
            {t('sia.form.save')}
          </button>
          <button type="button" onClick={handleSaveClose} className="okan-liquid-btn-primary px-3 py-2 text-sm font-semibold">
            {t('sia.form.saveClose')}
          </button>
          <button type="button" onClick={handleCloseClick} className="okan-liquid-btn-secondary px-3 py-2 text-sm font-semibold">
            {t('sia.form.close')}
          </button>
        </div>
      </div>

      {error ? (
        <div className="okan-liquid-panel-nested border border-red-300/50 bg-red-50/80 px-4 py-2 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <div className="okan-liquid-panel-nested max-w-3xl space-y-4 p-5">
        {field(
          'location',
          t('sia.form.field.location'),
          true,
          <select
            id="location"
            className="okan-liquid-select w-full max-w-md px-3 py-2.5 text-sm"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          >
            <option value="">{t('sia.form.selectPlaceholder')}</option>
            {SIA_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>,
        )}
        {field(
          'itemCode',
          t('sia.form.field.itemCode'),
          true,
          <input
            id="itemCode"
            className="okan-liquid-input w-full max-w-xs px-3 py-2.5 font-mono text-sm"
            value={form.itemCode}
            onChange={(e) => setForm((f) => ({ ...f, itemCode: e.target.value }))}
          />,
        )}
        {field(
          'description',
          t('sia.form.field.description'),
          true,
          <input
            id="description"
            className="okan-liquid-input w-full max-w-md px-3 py-2.5 text-sm"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />,
        )}
        {field(
          'unitCode',
          t('sia.form.field.unit'),
          true,
          <select
            id="unitCode"
            className="okan-liquid-select w-full max-w-md px-3 py-2.5 text-sm"
            value={form.unitCode}
            onChange={(e) => setForm((f) => ({ ...f, unitCode: e.target.value }))}
          >
            <option value="">{t('sia.form.selectPlaceholder')}</option>
            {SIA_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>,
        )}
        {field(
          'active',
          t('sia.form.field.active'),
          false,
          <label className="inline-flex items-center gap-2 text-sm text-slate-800 dark:text-slate-100">
            <input
              id="active"
              type="checkbox"
              className="size-4 rounded border-slate-300 text-slate-800 focus:ring-sky-500"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            {form.active ? t('sia.filter.yes') : t('sia.filter.no')}
          </label>,
        )}
      </div>

      {unsavedOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="okan-liquid-panel-nested max-w-md p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{t('sia.form.unsavedTitle')}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t('sia.form.unsavedBody')}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUnsavedOpen(false)}
                className="okan-liquid-btn-secondary px-3 py-1.5 text-sm font-semibold"
              >
                {t('sia.delete.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setUnsavedOpen(false)
                  onRequestClose()
                }}
                className="okan-liquid-btn-primary px-3 py-1.5 text-sm font-semibold"
              >
                {t('sia.form.unsavedConfirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function formShapeFromInitial(over?: Partial<FormShape>): FormShape {
  return { ...empty, ...over }
}
