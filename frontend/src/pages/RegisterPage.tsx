import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import { AuthLayout } from './AuthLayout'

export function RegisterPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [company, setCompany] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <AuthLayout title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            {t('auth.company')}
          </span>
          <input
            type="text"
            name="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-4 py-3 text-sm text-gray-900 shadow-neo-in placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
            placeholder={t('auth.companyPh')}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            {t('auth.fullName')}
          </span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-4 py-3 text-sm text-gray-900 shadow-neo-in placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
            placeholder={t('auth.namePh')}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            {t('auth.email')}
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-4 py-3 text-sm text-gray-900 shadow-neo-in placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
            placeholder="ornek@sirket.com"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            {t('auth.password')}
          </span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-4 py-3 text-sm text-gray-900 shadow-neo-in placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
            placeholder={t('auth.passwordPh')}
          />
        </label>
        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-500">
          {t('auth.registerTerms')}{' '}
          <button type="button" className="font-medium text-gray-700 underline dark:text-gray-400">
            {t('auth.registerTermsLink')}
          </button>{' '}
          {t('auth.registerTermsEnd')}
        </p>
        <button
          type="submit"
          className="mt-1 w-full rounded-xl bg-gray-800 py-3.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:focus-visible:ring-offset-gray-900"
        >
          {t('auth.submitRegister')}
        </button>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t('auth.haveAccount')}{' '}
          <Link
            to="/login"
            className="font-semibold text-gray-900 underline-offset-2 hover:underline dark:text-gray-100"
          >
            {t('auth.loginLink')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
