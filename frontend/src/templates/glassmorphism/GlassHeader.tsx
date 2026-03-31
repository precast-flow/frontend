type Props = {
  children: React.ReactNode
}

/** Glass frame around the existing top bar (additive styling via shell). */
export function GlassHeader({ children }: Props) {
  return (
    <div className="gm-glass-topbar-host gm-glass-panel-l1 gm-motion rounded-[1.35rem] py-px shadow-none md:rounded-3xl">
      <div className="overflow-visible rounded-[1.15rem] md:rounded-[1.35rem] [&>header]:rounded-2xl [&>header]:bg-transparent [&>header]:shadow-none">
        {children}
      </div>
    </div>
  )
}
