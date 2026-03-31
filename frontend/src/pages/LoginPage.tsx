import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import { AuthLayout } from './AuthLayout'

export function LoginPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-4 py-3 text-sm text-gray-900 shadow-neo-in placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
            placeholder="••••••••"
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="size-4 rounded border-gray-300 text-gray-800 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-900"
            />
            {t('auth.remember')}
          </label>
          <button
            type="button"
            className="font-medium text-gray-700 underline-offset-2 hover:underline dark:text-gray-300"
          >
            {t('auth.forgot')}
          </button>
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-gray-800 py-3.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:focus-visible:ring-offset-gray-900"
        >
          {t('auth.submitLogin')}
        </button>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t('auth.noAccount')}{' '}
          <Link
            to="/register"
            className="font-semibold text-gray-900 underline-offset-2 hover:underline dark:text-gray-100"
          >
            {t('auth.registerLink')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
