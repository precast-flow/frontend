type Props = {
  children: React.ReactNode
  /** Softer blur stack on low-power / user preference */
  lite?: boolean
  /**
   * `neutral-grid`: renkli blob yok; düz nötr zemin (açık: #dbdbdb, koyu: #121212). Açık temada tüm kabuk.
   * `blobs`: varsayılan cam zemin + cyan / violet / indigo blob’lar (koyu tema).
   */
  backdrop?: 'blobs' | 'neutral-grid'
}

/**
 * Level-0 shell: gradient field + soft light blobs behind glass panels,
 * veya düz nötr zemin (Proje Yönetimi gibi sayfalar).
 */
export function GlassLayout({ children, lite, backdrop = 'blobs' }: Props) {
  const neutral = backdrop === 'neutral-grid'
  return (
    <div
      className={[
        /* mobilde blob taşması için clip */
        'relative isolate min-h-dvh gm-glass-page max-md:overflow-x-hidden',
        lite ? 'gm-glass-lite' : '',
        neutral ? 'gm-glass-page--neutral-grid' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {neutral ? (
        <div
          className="gm-glass-neutral-grid-fill pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <div
            className="gm-glass-blob -left-24 -top-24 size-[22rem] bg-cyan-300/40 dark:bg-cyan-400/25"
            style={{ animation: 'none' }}
          />
          <div className="gm-glass-blob bottom-0 right-0 size-[26rem] bg-violet-400/35 dark:bg-violet-500/20" />
          <div className="gm-glass-blob left-1/3 top-1/2 size-[18rem] -translate-y-1/2 bg-indigo-300/30 dark:bg-indigo-500/18" />
        </div>
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
