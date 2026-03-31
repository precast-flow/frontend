const BLADES = 12

type Props = {
  /** `sm` 20px, `md` 28px (varsayılan), `lg` 36px — em tabanlı bıçaklar */
  size?: 'sm' | 'md' | 'lg'
  /** Üst konteyneri tamamen doldurur; parent `position: relative` + boyut verin */
  center?: boolean
  className?: string
}

const sizeToClass: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-[20px]',
  md: 'text-[28px]',
  lg: 'text-[36px]',
}

/**
 * 12 bıçaklı fade spinner — site yükleme ve inline bekleme durumları.
 * Stiller: `index.css` içinde `.spinner` / `.spinner-blade`.
 */
export function SiteSpinner({ size = 'md', center = false, className = '' }: Props) {
  return (
    <span
      className={[
        'spinner inline-block',
        sizeToClass[size],
        center ? 'center' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-label="Yükleniyor"
    >
      {Array.from({ length: BLADES }, (_, i) => (
        <span key={i} className="spinner-blade" />
      ))}
    </span>
  )
}
