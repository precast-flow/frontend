type Props = {
  title?: string
  children: React.ReactNode
}

export function GlassTable({ title, children }: Props) {
  return (
    <div className="gm-glass-panel-l2 gm-motion overflow-hidden rounded-2xl md:rounded-3xl">
      {title ? (
        <div className="border-b border-[var(--glass-border-muted)] px-4 py-3 text-sm font-semibold text-[var(--glass-text-primary)] md:px-5">
          {title}
        </div>
      ) : null}
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}
