import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Mail } from 'lucide-react'
import {
  SHIFT_POLICY_OPTIONS,
  WIZARD_SEED,
  type FirmWizardFormState,
} from '../../data/firmOnboardingWizardMock'
import { useI18n } from '../../i18n/I18nProvider'

const STEP_KEYS = ['welcome', 'company', 'shift', 'factory', 'admin', 'summary'] as const
type StepIndex = 0 | 1 | 2 | 3 | 4 | 5

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

const btnPrimary =
  'rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'

const btnSecondary =
  'rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition hover:bg-gray-200/90 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'

function simpleEmailOk(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

function taxIdOk(s: string): boolean {
  if (!s.trim()) return true
  return /^\d{10}$/.test(s.trim())
}

export function FirmOnboardingWizardPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [step, setStep] = useState<StepIndex>(0)
  const [form, setForm] = useState<FirmWizardFormState>(() => ({ ...WIZARD_SEED }))
  const [errors, setErrors] = useState<Partial<Record<keyof FirmWizardFormState | 'general', string>>>({})
  const [inviteOpen, setInviteOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2600)
  }, [])

  const validateCompany = useCallback(() => {
    const next: typeof errors = {}
    if (!form.legalName.trim()) next.legalName = t('firmWizard.err.legalName')
    if (!form.shortName.trim()) next.shortName = t('firmWizard.err.shortName')
    if (!taxIdOk(form.taxId)) next.taxId = t('firmWizard.err.taxId')
    setErrors(next)
    return Object.keys(next).length === 0
  }, [form.legalName, form.shortName, form.taxId, t])

  const validateFactory = useCallback(() => {
    const next: typeof errors = {}
    if (!form.factoryCode.trim()) next.factoryCode = t('firmWizard.err.factoryCode')
    if (!form.factoryName.trim()) next.factoryName = t('firmWizard.err.factoryName')
    if (!form.factoryCity.trim()) next.factoryCity = t('firmWizard.err.factoryCity')
    setErrors(next)
    return Object.keys(next).length === 0
  }, [form.factoryCode, form.factoryName, form.factoryCity, t])

  const validateAdmin = useCallback(() => {
    const next: typeof errors = {}
    if (!form.adminName.trim()) next.adminName = t('firmWizard.err.adminName')
    if (!form.adminEmail.trim()) next.adminEmail = t('firmWizard.err.adminEmail')
    else if (!simpleEmailOk(form.adminEmail)) next.adminEmail = t('firmWizard.err.emailFormat')
    if (!form.adminPhone.trim()) next.adminPhone = t('firmWizard.err.adminPhone')
    setErrors(next)
    return Object.keys(next).length === 0
  }, [form.adminName, form.adminEmail, form.adminPhone, t])

  const goNext = () => {
    if (step === 1 && !validateCompany()) return
    if (step === 3 && !validateFactory()) return
    if (step === 4 && !validateAdmin()) return
    setErrors({})
    setStep((s) => Math.min(5, s + 1) as StepIndex)
  }

  const goBack = () => {
    setErrors({})
    setStep((s) => Math.max(0, s - 1) as StepIndex)
  }

  const onFinish = () => {
    showToast(t('firmWizard.toastDone'))
    window.setTimeout(() => navigate('/firma-ayarlari'), 800)
  }

  const shiftLabel = useMemo(() => {
    const o = SHIFT_POLICY_OPTIONS.find((x) => x.id === form.shiftPolicy)
    return o ? t(o.labelKey) : form.shiftPolicy
  }, [form.shiftPolicy, t])

  return (
    <div className="min-h-dvh bg-pf-page">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/firma-ayarlari')}
            className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:shadow-neo-out-sm dark:text-gray-200 dark:hover:bg-gray-800/80"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t('firmWizard.backFirmAdmin')}
          </button>
          <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase text-amber-950 dark:bg-amber-900/50 dark:text-amber-100">
            {t('firmAdmin.envDemo')}
          </span>
        </header>

        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-2xl">
          {t('firmWizard.pageTitle')}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('firmWizard.pageDesc')}</p>

        {/* Stepper */}
        <ol className="mt-8 flex flex-wrap items-center gap-2" aria-label={t('firmWizard.stepperAria')}>
          {STEP_KEYS.map((key, i) => {
            const active = step === i
            const done = step > i
            return (
              <li key={key} className="flex items-center gap-2">
                <span
                  className={[
                    'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    done
                      ? 'bg-emerald-600 text-white shadow-neo-out-sm dark:bg-emerald-500'
                      : active
                        ? 'bg-gray-900 text-white shadow-neo-out-sm dark:bg-gray-100 dark:text-gray-900'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
                  ].join(' ')}
                >
                  {done ? <Check className="size-4" strokeWidth={2.5} aria-hidden /> : i + 1}
                </span>
                <span
                  className={`hidden text-xs font-medium sm:inline ${active ? 'text-gray-900 dark:text-gray-50' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  {t(`firmWizard.step.${key}`)}
                </span>
                {i < STEP_KEYS.length - 1 ? (
                  <span className="hidden h-px w-6 bg-gray-300 dark:bg-gray-600 sm:block" aria-hidden />
                ) : null}
              </li>
            )
          })}
        </ol>

        <div className="mt-8 rounded-3xl bg-pf-surface p-5 shadow-neo-out md:p-8">
          {step === 0 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{t('firmWizard.welcomeTitle')}</h2>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{t('firmWizard.welcomeBody')}</p>
            </section>
          ) : null}

          {step === 1 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{t('firmWizard.companyTitle')}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {t('firmWizard.label.legalName')}
                  </span>
                  <input
                    className={`${inset} mt-1`}
                    value={form.legalName}
                    onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))}
                  />
                  {errors.legalName ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.legalName}</p> : null}
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {t('firmWizard.label.shortName')}
                  </span>
                  <input
                    className={`${inset} mt-1`}
                    value={form.shortName}
                    onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
                  />
                  {errors.shortName ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.shortName}</p> : null}
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {t('firmWizard.label.taxId')}
                  </span>
                  <input
                    className={`${inset} mt-1 font-mono`}
                    value={form.taxId}
                    onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))}
                    inputMode="numeric"
                  />
                  {errors.taxId ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.taxId}</p> : null}
                </label>
              </div>
              <div className="rounded-xl border border-dashed border-gray-300/90 bg-gray-50/80 p-4 dark:border-gray-600 dark:bg-gray-950/50">
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('firmWizard.logoTitle')}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('firmWizard.logoHint')}</p>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-3 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-200 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:text-gray-300 dark:file:bg-gray-800"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    setForm((prev) => ({ ...prev, logoFileName: f ? f.name : null }))
                  }}
                />
                {form.logoFileName ? (
                  <p className="mt-2 text-xs text-gray-700 dark:text-gray-200">
                    {t('firmWizard.logoSelected', { name: form.logoFileName })}
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{t('firmWizard.shiftTitle')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('firmWizard.shiftIntro')}</p>
              <div className="space-y-3">
                {SHIFT_POLICY_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer flex-col rounded-xl border-2 p-4 transition ${
                      form.shiftPolicy === opt.id
                        ? 'border-gray-900 bg-gray-50 shadow-neo-in dark:border-gray-100 dark:bg-gray-900/80'
                        : 'border-transparent bg-gray-100 shadow-neo-in dark:bg-gray-950/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shift"
                        className="size-4 accent-gray-900 dark:accent-gray-100"
                        checked={form.shiftPolicy === opt.id}
                        onChange={() => setForm((f) => ({ ...f, shiftPolicy: opt.id }))}
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-50">{t(opt.labelKey)}</span>
                    </div>
                    <p className="mt-2 pl-7 text-xs text-gray-600 dark:text-gray-400">{t(opt.hintKey)}</p>
                  </label>
                ))}
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{t('firmWizard.factoryTitle')}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {t('firmWizard.label.factoryCode')}
                  </span>
                  <input
                    className={`${inset} mt-1 font-mono uppercase`}
                    value={form.factoryCode}
                    onChange={(e) => setForm((f) => ({ ...f, factoryCode: e.target.value.toUpperCase() }))}
                  />
                  {errors.factoryCode ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.factoryCode}</p> : null}
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {t('firmWizard.label.factoryCity')}
                  </span>
                  <input
                    className={`${inset} mt-1`}
                    value={form.factoryCity}
                    onChange={(e) => setForm((f) => ({ ...f, factoryCity: e.target.value }))}
                  />
                  {errors.factoryCity ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.factoryCity}</p> : null}
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {t('firmWizard.label.factoryName')}
                  </span>
                  <input
                    className={`${inset} mt-1`}
                    value={form.factoryName}
                    onChange={(e) => setForm((f) => ({ ...f, factoryName: e.target.value }))}
                  />
                  {errors.factoryName ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.factoryName}</p> : null}
                </label>
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{t('firmWizard.adminTitle')}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {t('firmWizard.label.adminName')}
                  </span>
                  <input
                    className={`${inset} mt-1`}
                    value={form.adminName}
                    onChange={(e) => setForm((f) => ({ ...f, adminName: e.target.value }))}
                  />
                  {errors.adminName ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.adminName}</p> : null}
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {t('firmWizard.label.adminEmail')}
                  </span>
                  <input
                    className={`${inset} mt-1 font-mono`}
                    type="email"
                    autoComplete="email"
                    value={form.adminEmail}
                    onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
                  />
                  {errors.adminEmail ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.adminEmail}</p> : null}
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {t('firmWizard.label.adminPhone')}
                  </span>
                  <input
                    className={`${inset} mt-1 font-mono`}
                    value={form.adminPhone}
                    onChange={(e) => setForm((f) => ({ ...f, adminPhone: e.target.value }))}
                  />
                  {errors.adminPhone ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.adminPhone}</p> : null}
                </label>
              </div>
            </section>
          ) : null}

          {step === 5 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{t('firmWizard.summaryTitle')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('firmWizard.summaryDesc')}</p>
              <div className="overflow-x-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-950/70">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200/80 dark:border-gray-700/80">
                      <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        {t('firmWizard.label.legalName')}
                      </th>
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-50">{form.legalName}</td>
                    </tr>
                    <tr className="border-b border-gray-200/80 dark:border-gray-700/80">
                      <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        {t('firmWizard.label.shortName')}
                      </th>
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-50">{form.shortName}</td>
                    </tr>
                    <tr className="border-b border-gray-200/80 dark:border-gray-700/80">
                      <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        {t('firmWizard.label.taxId')}
                      </th>
                      <td className="px-3 py-2 font-mono text-gray-800 dark:text-gray-100">{form.taxId}</td>
                    </tr>
                    <tr className="border-b border-gray-200/80 dark:border-gray-700/80">
                      <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        {t('firmWizard.summaryLogo')}
                      </th>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{form.logoFileName ?? '—'}</td>
                    </tr>
                    <tr className="border-b border-gray-200/80 dark:border-gray-700/80">
                      <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        {t('firmWizard.summaryShift')}
                      </th>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{shiftLabel}</td>
                    </tr>
                    <tr className="border-b border-gray-200/80 dark:border-gray-700/80">
                      <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        {t('firmWizard.summaryFactory')}
                      </th>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                        {form.factoryCode} · {form.factoryName} · {form.factoryCity}
                      </td>
                    </tr>
                    <tr>
                      <th className="whitespace-nowrap px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        {t('firmWizard.summaryAdmin')}
                      </th>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">
                        {form.adminName} · {form.adminEmail} · {form.adminPhone}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={`${btnSecondary} inline-flex items-center gap-2`} onClick={() => setInviteOpen(true)}>
                  <Mail className="size-4" aria-hidden />
                  {t('firmWizard.invitePreview')}
                </button>
              </div>
            </section>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/90 pt-6 dark:border-gray-700/90">
            <button type="button" className={btnSecondary} onClick={goBack} disabled={step === 0}>
              {t('firmWizard.back')}
            </button>
            {step < 5 ? (
              <button type="button" className={btnPrimary} onClick={goNext}>
                {t('firmWizard.next')}
              </button>
            ) : (
              <button type="button" className={btnPrimary} onClick={onFinish}>
                {t('firmWizard.finish')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* P2 — davet e-postası modal */}
      {inviteOpen ? (
        <div
          className="gm-glass-modal-shell fixed inset-0 z-[80] flex items-end justify-center bg-gray-900/40 p-4 backdrop-blur-[2px] sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="firm-wizard-invite-title"
        >
          <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-3xl bg-pf-surface p-6 shadow-neo-out">
            <h3 id="firm-wizard-invite-title" className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {t('firmWizard.inviteModalTitle')}
            </h3>
            <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-gray-100 p-4 font-sans text-xs text-gray-800 shadow-neo-in dark:bg-gray-950 dark:text-gray-200">
              {t('firmWizard.inviteModalBody', {
                admin: form.adminName,
                email: form.adminEmail,
                company: form.shortName,
              })}
            </pre>
            <button type="button" className={`${btnPrimary} mt-6 w-full sm:w-auto`} onClick={() => setInviteOpen(false)}>
              {t('firmWizard.inviteModalClose')}
            </button>
          </div>
        </div>
      ) : null}

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
