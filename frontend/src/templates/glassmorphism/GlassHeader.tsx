type Props = {
  children: React.ReactNode
}

/** İnce üst krom: üste yapışık tam geniş şerit (ayrı kart sarmalayıcısı yok). */
export function GlassHeader({ children }: Props) {
  return (
    <div className="gm-glass-topbar-host gm-glass-topbar-okan gm-glass-topbar-flush gm-motion w-full overflow-visible rounded-none border-0 shadow-none">
      <div className="overflow-visible [&>header]:bg-transparent [&>header]:shadow-none">
        {children}
      </div>
    </div>
  )
}
