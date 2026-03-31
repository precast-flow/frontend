import { useId, useMemo, useState } from 'react'
import { Bookmark, PenLine } from 'lucide-react'
import {
  QUALITY_TEST_CATALOG,
  findCatalogTest,
  type CatalogField,
} from '../../data/qualityTestCatalogMock'
import { useI18n } from '../../i18n/I18nProvider'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

const well = 'rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70'

const btnPrimary =
  'rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'

const btnSecondary =
  'rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm hover:bg-gray-200/90 dark:bg-gray-800 dark:text-gray-100'

function parseNum(s: string): number | null {
  const n = Number.parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function fieldOutOfRange(v: number, f: CatalogField): boolean {
  return v < f.min || v > f.max
}

export function QualityTestResultFormView() {
  const { t } = useI18n()
  const baseId = useId()

  const [typeId, setTypeId] = useState(QUALITY_TEST_CATALOG[0].id)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const test of QUALITY_TEST_CATALOG) {
      for (const f of test.fields) {
        init[`${test.id}:${f.id}`] = f.demoValue
      }
    }
    return init
  })

  const [toast, setToast] = useState<string | null>(null)
  const [signOff, setSignOff] = useState(false)
  const [signedName, setSignedName] = useState('')

  const active = findCatalogTest(typeId) ?? QUALITY_TEST_CATALOG[0]

  const valueKey = (f: CatalogField) => `${typeId}:${f.id}`

  const limitIssues = useMemo(() => {
    const issues: { field: CatalogField; value: number }[] = []
    for (const f of active.fields) {
      const raw = values[valueKey(f)] ?? ''
      const v = parseNum(raw)
      if (v != null && fieldOutOfRange(v, f)) issues.push({ field: f, value: v })
    }
    return issues
  }, [active.fields, typeId, values])

  const setField = (f: CatalogField, next: string) => {
    setValues((prev) => ({ ...prev, [valueKey(f)]: next }))
  }

  const showToast = (msg: string, ms = 2600) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), ms)
  }

  const onSaveTemplate = () => {
    showToast(t('qualityTestForm.templateToast', { name: t(active.labelKey) }))
  }

  const onSave = () => {
    for (const f of active.fields) {
      const raw = values[valueKey(f)] ?? ''
      if (parseNum(raw) == null) {
        showToast(t('qualityTestForm.toastNeedValues'), 2400)
        return
      }
    }
    if (limitIssues.length > 0) {
      showToast(t('qualityTestForm.toastSavedWarn'))
    } else {
      showToast(t('qualityTestForm.toastSavedOk'))
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">qual-05:</strong> {t('qualityTestForm.intro')}
      </p>

      {/* P0 — test tipi */}
      <div>
        <label className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400" htmlFor={`${baseId}-type`}>
          {t('qualityTestForm.typeLabel')}
        </label>
        <select
          id={`${baseId}-type`}
          className={`${inset} mt-1.5 font-medium`}
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
        >
          {QUALITY_TEST_CATALOG.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {t(opt.labelKey)} ({opt.catalogRef})
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{t('qualityTestForm.catalogHint')}</p>
      </div>

      {/* Dinamik alanlar — inset well */}
      <section className={well} aria-labelledby={`${baseId}-fields-title`}>
        <h3 id={`${baseId}-fields-title`} className="text-sm font-semibold text-gray-900 dark:text-gray-50">
          {t('qualityTestForm.fieldsTitle')}
        </h3>
        <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
          {t('qualityTestForm.fieldsSubtitle', { ref: active.catalogRef })}
        </p>

        <div className="mt-4 space-y-4">
          {active.fields.map((f) => {
            const raw = values[valueKey(f)] ?? ''
            const v = parseNum(raw)
            const out = v != null && fieldOutOfRange(v, f)
            return (
              <div key={f.id}>
                <label className="block" htmlFor={`${baseId}-f-${f.id}`}>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                    {t(f.labelKey)} ({t(f.unitKey)})
                  </span>
                  <input
                    id={`${baseId}-f-${f.id}`}
                    className={`${inset} mt-1.5 font-mono text-base font-semibold`}
                    value={raw}
                    onChange={(e) => setField(f, e.target.value)}
                    inputMode="decimal"
                    aria-invalid={out}
                  />
                </label>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  {t('qualityTestForm.limitLine', {
                    min: String(f.min),
                    max: String(f.max),
                  })}
                </p>
                {out ? (
                  <p className="mt-1 text-xs font-medium text-amber-800 dark:text-amber-200" role="alert">
                    {t('qualityTestForm.fieldWarn', { min: String(f.min), max: String(f.max) })}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      {limitIssues.length > 0 ? (
        <div
          className="rounded-2xl border border-amber-400/90 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-neo-in dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          {t('qualityTestForm.bannerLimit')}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPrimary} onClick={onSave}>
          {t('qualityTestForm.save')}
        </button>
        <button type="button" className={btnSecondary} onClick={onSaveTemplate}>
          <span className="inline-flex items-center gap-2">
            <Bookmark className="size-4" strokeWidth={1.75} aria-hidden />
            {t('qualityTestForm.saveTemplate')}
          </span>
        </button>
      </div>

      {/* P2 — imza / onay */}
      <section className={`${well} border border-dashed border-gray-300 dark:border-gray-600`}>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
          <PenLine className="size-4 text-gray-500" strokeWidth={1.75} aria-hidden />
          {t('qualityTestForm.signTitle')}
        </h3>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{t('qualityTestForm.signHint')}</p>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
          <input
            type="checkbox"
            className="size-4 rounded border-gray-400 text-gray-900 focus:ring-gray-400"
            checked={signOff}
            onChange={(e) => setSignOff(e.target.checked)}
          />
          {t('qualityTestForm.signCheckbox')}
        </label>
        <div className="mt-3 rounded-xl border border-dashed border-gray-300 bg-gray-100/80 px-3 py-6 text-center dark:border-gray-600 dark:bg-gray-900/60">
          <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">{t('qualityTestForm.signPad')}</p>
          <input
            type="text"
            className={`${inset} mt-3 max-w-xs text-center font-serif text-lg italic text-gray-700 dark:text-gray-200`}
            value={signedName}
            onChange={(e) => setSignedName(e.target.value)}
            placeholder={t('qualityTestForm.signPlaceholder')}
            disabled={!signOff}
          />
        </div>
      </section>

      {toast ? (
        <div
          className="rounded-2xl border border-gray-200/90 bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-900 shadow-neo-out dark:border-gray-600 dark:bg-gray-900 dark:text-gray-50"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
