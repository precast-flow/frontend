import type { FormEvent, ReactNode } from 'react'

type Props = {
  title?: string
  children: ReactNode
  onSubmit?: (e: FormEvent) => void
}

export function GlassForm({ title, children, onSubmit }: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="gm-glass-panel-l2 gm-motion space-y-4 rounded-2xl p-5 md:rounded-3xl md:p-6"
    >
      {title ? (
        <div>
          <h2 className="text-lg font-semibold text-[var(--glass-text-primary)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--glass-text-muted)]">Cam katmanlı form örneği (proto).</p>
        </div>
      ) : null}
      <div className="space-y-3">{children}</div>
    </form>
  )
}
