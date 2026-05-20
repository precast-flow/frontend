import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  /** Proje yönetimi / iş kuyruğu cam paneli */
  gl?: boolean
  'aria-label'?: string
}

/** Scroll alanının dışında sabit kalır; yalnızca alt içerik kayar. */
export function StickyDetailTabBar({
  children,
  className = '',
  gl = false,
  'aria-label': ariaLabel,
}: Props) {
  return (
    <div
      className={[
        'z-10 shrink-0 -mx-0.5',
        gl
          ? 'pb-2 pt-1'
          : 'border-b border-slate-200/35 pb-2 pt-1.5 dark:border-white/10',
        className,
      ].join(' ')}
    >
      <div
        className="mx-auto flex w-full max-w-full justify-center gap-1 overflow-x-auto overscroll-x-contain px-0.5"
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
      >
        {children}
      </div>
    </div>
  )
}
