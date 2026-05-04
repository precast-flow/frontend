import { Factory, Lock, Mail, Shield } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import type { ProfilePageState } from './useProfilePageState'

const inputClass =
  'mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-4 py-3 text-sm text-gray-900 shadow-neo-in placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

/** Eski neo iki sütun düzen — karşılaştırma için `?legacy=1`. */
export function ProfilePageLegacy(props: ProfilePageState) {
  const { t } = useI18n()
  const {
    profileFactories,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    title,
    setTitle,
    department,
    setDepartment,
  } = props

  return (
    <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,280px)_1fr]">
      <aside className="flex flex-col gap-4">
        <div className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold tracking-tight text-gray-800 shadow-neo-out dark:bg-gray-800 dark:text-gray-100">
            {(firstName.trim().charAt(0) + lastName.trim().charAt(0)).toUpperCase() || '—'}
          </div>
          <p className="mt-4 text-center text-base font-semibold text-gray-900 dark:text-gray-50">
            {firstName} {lastName}
          </p>
          <p className="mt-1 text-center text-sm text-gray-600 dark:text-gray-300">{title}</p>
          <p className="mt-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {department}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-600 shadow-neo-in dark:bg-gray-900 dark:text-gray-300">
            <Mail className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
            <span className="truncate">{email}</span>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-950/60">
          <div className="flex items-start gap-2">
            <Shield className="mt-0.5 size-4 shrink-0 text-gray-600 dark:text-gray-400" strokeWidth={2} />
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">{t('profile.roleNote')}</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-5">
        <section className="rounded-2xl bg-gray-100 p-5 shadow-neo-in dark:bg-gray-900/80">
          <div className="flex items-start gap-2">
            <Factory className="mt-0.5 size-4 shrink-0 text-gray-600 dark:text-gray-400" strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('profile.factoriesTitle')}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('profile.factoriesDesc')}</p>
              <ul className="mt-4 space-y-2">
                {profileFactories.map((f) => (
                  <li
                    key={f.code}
                    className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-800 shadow-neo-out-sm dark:bg-gray-950/80 dark:text-gray-100"
                  >
                    <span>
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{f.code}</span> {f.name}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">{f.city}</span>
                  </li>
                ))}
                <li
                  className="flex items-center justify-between gap-3 rounded-xl bg-gray-100/90 px-3 py-2.5 text-sm text-gray-600 opacity-90 dark:bg-gray-900/50 dark:text-gray-400"
                  title={t('profile.restrictedTitle')}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Lock className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                    <span className="truncate">
                      <span className="font-mono text-xs">ANK-01</span> Ankara Fabrika
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] font-medium">{t('profile.restrictedBadge')}</span>
                </li>
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{t('profile.restrictedNote')}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('profile.personalTitle')}</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('profile.personalDesc')}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {t('profile.firstName')}
              </span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                autoComplete="given-name"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {t('profile.lastName')}
              </span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                autoComplete="family-name"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {t('auth.email')}
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                autoComplete="email"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {t('profile.phone')}
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                autoComplete="tel"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-out-sm dark:bg-gray-950/80">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('profile.workTitle')}</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('profile.workDesc')}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {t('profile.jobTitle')}
              </span>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {t('profile.department')}
              </span>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl bg-gray-100 p-5 shadow-neo-in dark:bg-gray-900/80">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('profile.securityTitle')}</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('profile.securityDesc')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-100 dark:ring-offset-gray-900"
            >
              {t('profile.changePassword')}
            </button>
            <button
              type="button"
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-100 dark:ring-offset-gray-900"
            >
              {t('profile.manageSessions')}
            </button>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200/90 pt-4 dark:border-gray-700/90">
          <button
            type="button"
            className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:ring-offset-gray-900"
          >
            {t('profile.cancel')}
          </button>
          <button
            type="button"
            className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900"
          >
            {t('profile.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
