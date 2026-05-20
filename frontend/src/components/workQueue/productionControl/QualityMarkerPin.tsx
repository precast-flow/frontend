import { AlertTriangle, Check, X } from 'lucide-react'
import type { MarkerKind, QualityMarker } from '../../../data/productionQualityControl'

type Props = {
  marker: QualityMarker
  selected?: boolean
}

const KIND_STYLES: Record<
  MarkerKind,
  { ring: string; bg: string; Icon: typeof Check }
> = {
  pass: {
    ring: 'ring-emerald-600/75',
    bg: 'bg-emerald-500/50 text-white',
    Icon: Check,
  },
  warning: {
    ring: 'ring-amber-600/75',
    bg: 'bg-amber-500/50 text-white',
    Icon: AlertTriangle,
  },
  error: {
    ring: 'ring-red-600/75',
    bg: 'bg-red-600/50 text-white',
    Icon: X,
  },
}

export function QualityMarkerPin({ marker, selected = false }: Props) {
  const style = KIND_STYLES[marker.kind]
  const { Icon } = style
  const hasNote = Boolean(marker.note?.trim())

  return (
    <span
      role="img"
      aria-label={marker.kind}
      className={[
        'pointer-events-none relative z-10 flex size-7 items-center justify-center rounded-full shadow-sm ring-2',
        style.ring,
        style.bg,
        selected ? 'scale-110 ring-offset-1 ring-offset-white/90 dark:ring-offset-slate-900/90' : '',
        hasNote ? 'ring-[2.5px]' : '',
      ].join(' ')}
    >
      <Icon className="size-3.5 shrink-0 drop-shadow-sm" strokeWidth={2.75} aria-hidden />
    </span>
  )
}
