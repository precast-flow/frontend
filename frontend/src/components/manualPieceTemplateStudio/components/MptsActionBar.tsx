import type { ReactNode } from 'react'

type Props = {
  left?: ReactNode
  /** Arama / kategori / aktif vb. — sağdaki aksiyonlarla aynı satırda */
  filters?: ReactNode
  right?: ReactNode
}

export function MptsActionBar({ left, filters, right }: Props) {
  return (
    <div className="okan-liquid-panel-nested sticky top-0 z-20 mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5 px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
        {left ? <div className="shrink-0 text-xs text-slate-600 dark:text-slate-400">{left}</div> : null}
        {filters ? <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">{filters}</div> : null}
      </div>
      {right ? <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{right}</div> : null}
    </div>
  )
}
