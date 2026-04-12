import type { ReactNode } from 'react'

/** Okan sayfasındaki iç içe cam paneller ile uyumlu */
export function MptsFormSection({
  title,
  children,
  className = '',
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`okan-liquid-panel-nested p-4 ${className}`}
    >
      <h3 className="mb-3 border-b border-white/25 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-white/10 dark:text-slate-300">
        {title}
      </h3>
      <div className="grid gap-3">{children}</div>
    </section>
  )
}
