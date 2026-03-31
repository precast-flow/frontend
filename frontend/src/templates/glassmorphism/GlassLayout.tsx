type Props = {
  children: React.ReactNode
  /** Softer blur stack on low-power / user preference */
  lite?: boolean
}

/**
 * Level-0 shell: gradient field + soft light blobs behind glass panels.
 */
export function GlassLayout({ children, lite }: Props) {
  return (
    <div
      className={[
        /* md+: yatay taşınır — dar sidebar hover genişlemesi kesilmesin; mobilde blob taşması için clip */
        'relative isolate min-h-dvh gm-glass-page max-md:overflow-x-hidden',
        lite ? 'gm-glass-lite' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="gm-glass-blob -left-24 -top-24 size-[22rem] bg-cyan-300/40 dark:bg-cyan-400/25"
          style={{ animation: 'none' }}
        />
        <div className="gm-glass-blob bottom-0 right-0 size-[26rem] bg-violet-400/35 dark:bg-violet-500/20" />
        <div className="gm-glass-blob left-1/3 top-1/2 size-[18rem] -translate-y-1/2 bg-indigo-300/30 dark:bg-indigo-500/18" />
      </div>
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
