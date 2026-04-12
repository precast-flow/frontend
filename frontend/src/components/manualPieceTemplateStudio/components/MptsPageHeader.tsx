import type { ReactNode } from 'react'

export function MptsPageHeader({
  breadcrumb,
  title,
  subtitle,
  badge,
}: {
  breadcrumb: string
  title: string
  subtitle?: string
  badge?: ReactNode
}) {
  return (
    <div className="okan-liquid-panel-nested mb-3 shrink-0 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">{breadcrumb}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">{title}</h2>
        {badge}
      </div>
      {subtitle ? <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
    </div>
  )
}
