import type { ReactNode } from 'react'

type Props = {
  title: string
  children: ReactNode
  actions?: ReactNode
}

/**
 * Ana modül sahnesi ile aynı dış kabuk — profil / ayarlar gibi shell içi sayfalar için.
 */
export function ModuleShellFrame({ title, children, actions }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-3xl bg-pf-surface p-5 shadow-neo-out md:p-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-gray-200/90 pb-4 dark:border-gray-700/90 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-2xl">{title}</h1>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  )
}
