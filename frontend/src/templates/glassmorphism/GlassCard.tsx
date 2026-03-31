type Props = {
  children: React.ReactNode
  className?: string
  /** 2 = default card, 3 = chips/meta */
  level?: 2 | 3
}

export function GlassCard({ children, className = '', level = 2 }: Props) {
  const shell = level === 3 ? 'gm-glass-panel-l3' : 'gm-glass-panel-l2'
  return (
    <section
      className={[
        shell,
        'gm-motion rounded-2xl p-5 text-[var(--glass-text-primary)] md:rounded-3xl md:p-6',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  )
}
