type Props = {
  children: React.ReactNode
}

/** Üst krom ile aynı cam şerit: alta yapışık tam genişlik (ayrı kart yok). */
export function GlassFooter({ children }: Props) {
  return (
    <div className="relative gm-glass-footer-host gm-glass-footer-okan gm-glass-footer-flush gm-motion w-full overflow-visible rounded-none border-0 shadow-none">
      <div className="gm-footer-strip-accent pointer-events-none absolute inset-x-0 top-0 h-px" aria-hidden />
      <div className="overflow-visible [&>footer]:bg-transparent [&>footer]:shadow-none">{children}</div>
    </div>
  )
}
