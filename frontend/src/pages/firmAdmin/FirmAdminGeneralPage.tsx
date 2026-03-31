import { useCallback, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageIcon } from 'lucide-react'
import {
  DATE_FORMAT_OPTIONS,
  FIRM_GENERAL_SETTINGS_SEED,
  TIMEZONE_OPTIONS,
  type FirmGeneralSettingsState,
} from '../../data/firmGeneralSettingsMock'
import { useI18n, type Locale } from '../../i18n/I18nProvider'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

const btnPrimary =
  'rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'

const btnSecondary =
  'rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition hover:bg-gray-200/90 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'

type TabId = 'general' | 'regional'

export function FirmAdminGeneralPage() {
  const { t, setLocale } = useI18n()
  const navigate = useNavigate()
  const baseId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<TabId>('general')
  const [form, setForm] = useState<FirmGeneralSettingsState>(() => ({ ...FIRM_GENERAL_SETTINGS_SEED }))
  const [baseline, setBaseline] = useState<FirmGeneralSettingsState>(() => ({ ...FIRM_GENERAL_SETTINGS_SEED }))
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2400)
  }, [])

  const onLogoFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) {
      setForm((f) => ({ ...f, logoDataUrl: null }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : null
      setForm((f) => ({ ...f, logoDataUrl: url }))
    }
    reader.readAsDataURL(file)
  }

  const save = () => {
    setBaseline({ ...form })
    if (form.locale === 'tr' || form.locale === 'en') {
      setLocale(form.locale as Locale)
    }
    showToast(t('firmGeneral.toastSaved'))
  }

  const cancel = () => {
    setForm({ ...baseline })
    showToast(t('firmGeneral.toastCancelled'))
  }

  const tabBtn = (id: TabId, labelKey: string) => {
    const active = tab === id
    return (
      <button
        key={id}
        type="button"
        role="tab"
        aria-selected={active}
        onClick={() => setTab(id)}
        className={[
          'rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
          active
            ? 'bg-gray-900 text-white shadow-neo-out-sm dark:bg-gray-100 dark:text-gray-900'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
        ].join(' ')}
      >
        {t(labelKey)}
      </button>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('firmAdmin.generalTitle')}</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('firmGeneral.pageDesc')}</p>
      </div>

      <div className="rounded-2xl border border-gray-200/90 bg-gray-100/80 p-4 dark:border-gray-700 dark:bg-gray-900/50">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{t('firmAdmin.wizardTeaserTitle')}</p>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t('firmAdmin.wizardTeaserDesc')}</p>
        <button
          type="button"
          onClick={() => navigate('/firma-kurulum')}
          className="mt-3 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
        >
          {t('firmAdmin.gotoWizard')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('firmGeneral.tabsAria')}>
        {tabBtn('general', 'firmGeneral.tabGeneral')}
        {tabBtn('regional', 'firmGeneral.tabRegional')}
      </div>

      <div className="rounded-2xl bg-gray-50 p-5 shadow-neo-in dark:bg-gray-950/70 md:p-6">
        {tab === 'general' ? (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('firmGeneral.label.legalName')}
                </span>
                <input
                  id={`${baseId}-legal`}
                  className={`${inset} mt-1`}
                  value={form.legalName}
                  onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('firmGeneral.label.shortName')}
                </span>
                <input
                  className={`${inset} mt-1`}
                  value={form.shortName}
                  onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('firmGeneral.label.taxId')}
                </span>
                <input
                  className={`${inset} mt-1 font-mono`}
                  value={form.taxId}
                  onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))}
                  inputMode="numeric"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('firmGeneral.label.address')}
                </span>
                <textarea
                  className={`${inset} mt-1 min-h-[5rem] resize-y`}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('firmGeneral.label.phone')}
                </span>
                <input
                  className={`${inset} mt-1 font-mono`}
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('firmGeneral.label.email')}
                </span>
                <input
                  type="email"
                  className={`${inset} mt-1 font-mono`}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                />
              </label>
            </section>

            {/* P1 — logo */}
            <section className="rounded-2xl border border-gray-200/90 bg-gray-100/80 p-4 dark:border-gray-700 dark:bg-gray-900/50">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('firmGeneral.logoSection')}</h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t('firmGeneral.logoHint')}</p>
              <div className="mt-4 flex flex-wrap items-start gap-4">
                <div
                  className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-200 shadow-neo-in dark:bg-gray-800"
                  aria-hidden={!form.logoDataUrl}
                >
                  {form.logoDataUrl ? (
                    <img src={form.logoDataUrl} alt="" className="size-full object-contain" />
                  ) : (
                    <ImageIcon className="size-10 text-gray-500 dark:text-gray-400" strokeWidth={1.25} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onLogoFile(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-neo-out-sm hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
                  >
                    {t('firmGeneral.logoUpload')}
                  </button>
                  {form.logoDataUrl ? (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, logoDataUrl: null }))}
                      className="ml-2 text-sm text-gray-600 underline dark:text-gray-300"
                    >
                      {t('firmGeneral.logoRemove')}
                    </button>
                  ) : null}
                </div>
              </div>
            </section>

            {/* P1 — KVKK */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-gray-100/90 p-4 shadow-neo-in dark:bg-gray-900/60">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded accent-gray-900 dark:accent-gray-100"
                checked={form.kvkkAccepted}
                onChange={(e) => setForm((f) => ({ ...f, kvkkAccepted: e.target.checked }))}
              />
              <span className="text-sm text-gray-800 dark:text-gray-100">
                <span className="font-medium">{t('firmGeneral.kvkkTitle')}</span>
                <span className="mt-1 block text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {t('firmGeneral.kvkkBody')}
                </span>
              </span>
            </label>

            {/* P2 — slug */}
            <section>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('firmGeneral.label.slug')}
                </span>
                <input
                  className={`${inset} mt-1 cursor-not-allowed opacity-60`}
                  disabled
                  value={form.tenantSlug}
                  readOnly
                />
              </label>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{t('firmGeneral.slugNote')}</p>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('firmGeneral.label.timezone')}
                </span>
                <select
                  className={`${inset} mt-1`}
                  value={form.timezone}
                  onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                >
                  {TIMEZONE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('firmGeneral.label.locale')}
                </span>
                <select
                  className={`${inset} mt-1`}
                  value={form.locale}
                  onChange={(e) => setForm((f) => ({ ...f, locale: e.target.value }))}
                >
                  <option value="tr">{t('settings.lang.tr')}</option>
                  <option value="en">{t('settings.lang.en')}</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('firmGeneral.label.dateFormat')}
                </span>
                <select
                  className={`${inset} mt-1`}
                  value={form.dateFormat}
                  onChange={(e) => setForm((f) => ({ ...f, dateFormat: e.target.value }))}
                >
                  {DATE_FORMAT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="rounded-2xl border border-gray-200/90 bg-gray-100/80 p-4 dark:border-gray-700 dark:bg-gray-900/50">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('firmGeneral.renderImpactTitle')}</h3>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{t('firmGeneral.renderImpactIntro')}</p>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                <li>{t('firmGeneral.renderTz')}</li>
                <li>{t('firmGeneral.renderLocale')}</li>
                <li>{t('firmGeneral.renderDate')}</li>
              </ul>
            </section>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-200/90 pt-6 dark:border-gray-700/90">
          <button type="button" className={btnPrimary} onClick={save}>
            {t('firmGeneral.save')}
          </button>
          <button type="button" className={btnSecondary} onClick={cancel}>
            {t('firmGeneral.cancel')}
          </button>
        </div>
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
