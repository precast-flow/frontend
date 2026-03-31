type Props = {
  label: string
  value: string
  hint?: string
}

export function GlassKpiWidget({ label, value, hint }: Props) {
  return (
    <div className="gm-glass-panel-l3 gm-motion flex flex-col gap-1 rounded-2xl px-4 py-3 md:rounded-2xl">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--glass-text-muted)]">
        {label}
      </p>
      <p className="text-2xl font-semibold text-[var(--glass-text-primary)]">{value}</p>
      {hint ? <p className="text-xs text-[var(--glass-text-muted)]">{hint}</p> : null}
    </div>
  )
}
