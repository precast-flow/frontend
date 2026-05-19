import { AlertTriangle, Check, X } from 'lucide-react'
import type { MarkerKind, QualityMarker } from '../../../data/productionQualityControl'

type Props = {
  marker: QualityMarker
  onSelect?: (marker: QualityMarker) => void
}

const KIND_STYLES: Record<MarkerKind, { ring: string; bg: string; Icon: typeof Check }> = {
  pass: {
    ring: 'ring-emerald-500/50',
    bg: 'bg-emerald-500 text-white',
    Icon: Check,
  },
  warning: {
    ring: 'ring-amber-500/50',
    bg: 'bg-amber-500 text-white',
    Icon: AlertTriangle,
  },
  error: {
    ring: 'ring-red-500/50',
    bg: 'bg-red-600 text-white',
    Icon: X,
  },
}

export function QualityMarkerPin({ marker, onSelect }: Props) {
  const style = KIND_STYLES[marker.kind]
  const { Icon } = style

  const hasNote = Boolean(marker.note?.trim())

  return (
    <button
      type="button"
      className={`absolute z-10 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-md ring-2 ${style.ring} ${style.bg} transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${hasNote ? 'ring-offset-1 ring-offset-white dark:ring-offset-slate-900' : ''}`}
      style={{ left: `${marker.xPct}%`, top: `${marker.yPct}%` }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(marker)
      }}
      aria-label={marker.kind}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
    </button>
  )
}
