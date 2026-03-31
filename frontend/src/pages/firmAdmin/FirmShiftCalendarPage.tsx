import { useCallback, useId, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  HOLIDAY_BEHAVIOR_OPTIONS,
  SHIFT_CALENDAR_SEED,
  type FirmShiftCalendarState,
  type ShiftModelId,
  type ShiftTableRow,
  isShiftFilterVisible,
  isProductionShiftFilterVisible,
} from '../../data/firmShiftCalendarMock'
import { NeoSwitch } from '../../components/NeoSwitch'
import { useI18n } from '../../i18n/I18nProvider'

const inset =
  'rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

const btnPrimary =
  'rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'

const btnSecondary =
  'rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 shadow-neo-out-sm hover:bg-gray-200/90 dark:bg-gray-800 dark:text-gray-100'

const SHIFT_MODELS: { id: ShiftModelId; labelKey: string }[] = [
  { id: 'day_single', labelKey: 'firmShift.model.daySingle' },
  { id: 'two_shift', labelKey: 'firmShift.model.two' },
  { id: 'three_shift', labelKey: 'firmShift.model.three' },
  { id: 'night_day', labelKey: 'firmShift.model.nightDay' },
]

let rowId = 100

export function FirmShiftCalendarPage() {
  const { t } = useI18n()
  const baseId = useId()
  const [form, setForm] = useState<FirmShiftCalendarState>(() => ({
    ...SHIFT_CALENDAR_SEED,
    shiftRows: SHIFT_CALENDAR_SEED.shiftRows.map((r) => ({ ...r })),
    factoryOverrides: SHIFT_CALENDAR_SEED.factoryOverrides.map((o) => ({ ...o })),
  }))
  const [baseline, setBaseline] = useState<FirmShiftCalendarState>(() => ({
    ...SHIFT_CALENDAR_SEED,
    shiftRows: SHIFT_CALENDAR_SEED.shiftRows.map((r) => ({ ...r })),
    factoryOverrides: SHIFT_CALENDAR_SEED.factoryOverrides.map((o) => ({ ...o })),
  }))
  const [toast, setToast] = useState<string | null>(null)
  const [previewFactoryCode, setPreviewFactoryCode] = useState('IST-HAD')

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }, [])

  const filterVisible = isProductionShiftFilterVisible(form)

  const updateRow = (id: string, patch: Partial<ShiftTableRow>) => {
    setForm((f) => ({
      ...f,
      shiftRows: f.shiftRows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }))
  }

  const removeRow = (id: string) => {
    setForm((f) => ({ ...f, shiftRows: f.shiftRows.filter((r) => r.id !== id) }))
  }

  const addShiftRow = () => {
    rowId += 1
    setForm((f) => ({
      ...f,
      shiftRows: [...f.shiftRows, { id: `r-${rowId}`, name: '', start: '08:00', end: '16:00' }],
    }))
  }

  const addOverride = () => {
    rowId += 1
    setForm((f) => ({
      ...f,
      factoryOverrides: [
        ...f.factoryOverrides,
          { id: `new-${rowId}`, factoryCode: '', shiftModel: 'two_shift', note: t('firmShift.overridePlaceholder') },
      ],
    }))
  }

  const updateOverride = (id: string, patch: { factoryCode?: string; shiftModel?: ShiftModelId; note?: string }) => {
    setForm((f) => ({
      ...f,
      factoryOverrides: f.factoryOverrides.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }))
  }

  const removeOverride = (id: string) => {
    setForm((f) => ({ ...f, factoryOverrides: f.factoryOverrides.filter((o) => o.id !== id) }))
  }

  const selectedOverride = form.factoryOverrides.find((o) => o.factoryCode === previewFactoryCode)
  const selectedFactoryFilterVisible = isShiftFilterVisible(
    form.useShifts,
    selectedOverride?.shiftModel ?? form.shiftModel,
  )

  const save = () => {
    setBaseline({
      ...form,
      shiftRows: form.shiftRows.map((r) => ({ ...r })),
      factoryOverrides: form.factoryOverrides.map((o) => ({ ...o })),
    })
    showToast(t('firmShift.toastSaved'))
  }

  const cancel = () => {
    setForm({
      ...baseline,
      shiftRows: baseline.shiftRows.map((r) => ({ ...r })),
      factoryOverrides: baseline.factoryOverrides.map((o) => ({ ...o })),
    })
    showToast(t('firmShift.toastCancelled'))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('firmShift.pageTitle')}</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('firmShift.pageDesc')}</p>
      </div>

      {/* P0 — Soru 1 */}
      <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-in dark:bg-gray-950/70">
        <NeoSwitch
          id={`${baseId}-use-shifts`}
          label={t('firmShift.q1')}
          checked={form.useShifts}
          onChange={(v) => setForm((f) => ({ ...f, useShifts: v }))}
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('firmShift.q1Hint')}</p>
      </section>

      {/* P0 — Hayır: tek gündüz aralığı */}
      {!form.useShifts ? (
        <section className="rounded-2xl border border-gray-200/90 bg-gray-100/80 p-5 dark:border-gray-700 dark:bg-gray-900/50">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('firmShift.singleDayTitle')}</h3>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                {t('firmShift.label.dayStart')}
              </span>
              <input
                type="time"
                className={`${inset} mt-1 font-mono`}
                value={form.singleDayStart}
                onChange={(e) => setForm((f) => ({ ...f, singleDayStart: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                {t('firmShift.label.dayEnd')}
              </span>
              <input
                type="time"
                className={`${inset} mt-1 font-mono`}
                value={form.singleDayEnd}
                onChange={(e) => setForm((f) => ({ ...f, singleDayEnd: e.target.value }))}
              />
            </label>
          </div>
        </section>
      ) : null}

      {/* P0 — Evet: model + tablo */}
      {form.useShifts ? (
        <>
          <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-in dark:bg-gray-950/70">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('firmShift.q3Title')}</h3>
            <div className="mt-4 space-y-2">
              {SHIFT_MODELS.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${
                    form.shiftModel === m.id
                      ? 'border-gray-900 bg-white shadow-neo-in dark:border-gray-100 dark:bg-gray-900/80'
                      : 'border-transparent bg-gray-100 dark:bg-gray-900/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="shiftModel"
                    className="size-4 accent-gray-900 dark:accent-gray-100"
                    checked={form.shiftModel === m.id}
                    onChange={() => setForm((f) => ({ ...f, shiftModel: m.id }))}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{t(m.labelKey)}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="overflow-x-auto rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-900/80">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('firmShift.col.name')}</th>
                  <th className="px-4 py-3 font-semibold">{t('firmShift.col.start')}</th>
                  <th className="px-4 py-3 font-semibold">{t('firmShift.col.end')}</th>
                  <th className="w-12 px-2 py-3 font-semibold">
                    <span className="sr-only">{t('firmShift.col.remove')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {form.shiftRows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                    <td className="px-4 py-2">
                      <input
                        className={`${inset} w-full min-w-[6rem]`}
                        value={row.name}
                        onChange={(e) => updateRow(row.id, { name: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="time"
                        className={`${inset} font-mono`}
                        value={row.start}
                        onChange={(e) => updateRow(row.id, { start: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="time"
                        className={`${inset} font-mono`}
                        value={row.end}
                        onChange={(e) => updateRow(row.id, { end: e.target.value })}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                        onClick={() => removeRow(row.id)}
                        aria-label={t('firmShift.col.remove')}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-200/80 p-3 dark:border-gray-700/80">
              <button type="button" className={`${btnSecondary} inline-flex items-center gap-2`} onClick={addShiftRow}>
                <Plus className="size-4" aria-hidden />
                {t('firmShift.addShiftRow')}
              </button>
            </div>
          </section>
        </>
      ) : null}

      {/* P0 — Hafta sonu */}
      <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-in dark:bg-gray-950/70">
        <NeoSwitch
          id={`${baseId}-weekend`}
          label={t('firmShift.weekend')}
          checked={form.weekendProduction}
          onChange={(v) => setForm((f) => ({ ...f, weekendProduction: v }))}
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('firmShift.weekendHint')}</p>
      </section>

      {/* P1 — Resmi tatil */}
      <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-in dark:bg-gray-950/70">
        <label className="block">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('firmShift.holidayTitle')}</span>
          <select
            className={`${inset} mt-2 max-w-md`}
            value={form.holidayBehavior}
            onChange={(e) => setForm((f) => ({ ...f, holidayBehavior: e.target.value }))}
          >
            {HOLIDAY_BEHAVIOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.labelKey)}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* P1 — Önizleme metni */}
      <div className="rounded-2xl border border-blue-200/90 bg-blue-50/90 px-4 py-3 text-sm text-blue-950 shadow-neo-in dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-100">
        <p className="font-medium">{t('firmShift.previewTitle')}</p>
        <p className="mt-1">
          {t('firmShift.previewFilter', {
            state: filterVisible ? t('firmShift.previewVisible') : t('firmShift.previewHidden'),
          })}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold uppercase text-blue-800/80 dark:text-blue-200/90">
            {t('firmShift.previewFactoryLabel')}
          </label>
          <select
            className={`${inset} w-auto min-w-[9rem] bg-white/80 dark:bg-gray-950/70`}
            value={previewFactoryCode}
            onChange={(e) => setPreviewFactoryCode(e.target.value.toUpperCase())}
          >
            {form.factoryOverrides.map((o) => (
              <option key={o.id} value={o.factoryCode}>
                {o.factoryCode || '—'}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-xs">
          {t('firmShift.previewFactoryFilter', {
            code: previewFactoryCode || '—',
            state: selectedFactoryFilterVisible ? t('firmShift.previewVisible') : t('firmShift.previewHidden'),
          })}
        </p>
      </div>

      {/* P2 — Fabrika override */}
      <section className="rounded-2xl border border-gray-200/90 bg-gray-100/80 p-5 dark:border-gray-700 dark:bg-gray-900/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('firmShift.overrideTitle')}</h3>
          <button type="button" className={`${btnSecondary} inline-flex items-center gap-2`} onClick={addOverride}>
            <Plus className="size-4" aria-hidden />
            {t('firmShift.overrideAdd')}
          </button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-950/60">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-semibold">{t('firmShift.overrideCode')}</th>
                <th className="px-3 py-2 font-semibold">{t('firmShift.overrideModel')}</th>
                <th className="px-3 py-2 font-semibold">{t('firmShift.overrideNote')}</th>
                <th className="w-12 py-2" />
              </tr>
            </thead>
            <tbody>
              {form.factoryOverrides.map((o) => (
                <tr key={o.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                  <td className="px-3 py-2">
                    <input
                      className={`${inset} font-mono uppercase`}
                      value={o.factoryCode}
                      onChange={(e) => updateOverride(o.id, { factoryCode: e.target.value.toUpperCase() })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className={`${inset} min-w-[12rem]`}
                      value={o.shiftModel}
                      onChange={(e) => updateOverride(o.id, { shiftModel: e.target.value as ShiftModelId })}
                    >
                      {SHIFT_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {t(m.labelKey)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={inset}
                      value={o.note}
                      onChange={(e) => updateOverride(o.id, { note: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                      onClick={() => removeOverride(o.id)}
                      aria-label={t('firmShift.col.remove')}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 12 üretim fazı özeti */}
      <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-in dark:bg-gray-950/70">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('firmShift.phasesTitle')}</h3>
        <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-gray-600 dark:text-gray-300">
          {t('firmShift.phasesBlock')}
        </p>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-gray-200/90 pt-6 dark:border-gray-700/90">
        <button type="button" className={btnPrimary} onClick={save}>
          {t('firmGeneral.save')}
        </button>
        <button type="button" className={btnSecondary} onClick={cancel}>
          {t('firmGeneral.cancel')}
        </button>
      </div>

      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-gray-200/90 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 shadow-neo-out dark:border-gray-600 dark:bg-gray-900 dark:text-gray-50"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
