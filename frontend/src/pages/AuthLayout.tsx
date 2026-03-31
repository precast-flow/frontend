import { PublicPageHeader } from './PublicPageHeader'

type Props = {
  children: React.ReactNode
  title: string
  subtitle?: string
}

/** Ortak auth zemin — neumorphism, gri palet */
export function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="flex min-h-dvh flex-col bg-pf-page">
      <PublicPageHeader />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-12 pt-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            ) : null}
          </div>
          <div className="rounded-3xl bg-pf-surface p-6 shadow-neo-out md:p-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
