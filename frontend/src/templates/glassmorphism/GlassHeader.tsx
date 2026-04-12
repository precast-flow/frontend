type Props = {
  children: React.ReactNode
}

/** İnce üst krom: tam geniş şerit, nav’dan ayrı “komut çubuğu” görünümü. */
export function GlassHeader({ children }: Props) {
  return (
    <div className="gm-glass-topbar-host gm-glass-topbar-okan gm-motion overflow-visible rounded-2xl border md:rounded-3xl">
      <div className="overflow-visible rounded-[inherit] [&>header]:rounded-[inherit] [&>header]:bg-transparent [&>header]:shadow-none">
        {children}
      </div>
    </div>
  )
}
