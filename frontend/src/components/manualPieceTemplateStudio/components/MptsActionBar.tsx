import type { ReactNode } from 'react'

export function MptsActionBar({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <div className="okan-liquid-panel-nested sticky top-0 z-20 mb-2 flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">{left}</div>
      <div className="flex flex-wrap items-center justify-end gap-2">{right}</div>
    </div>
  )
}
