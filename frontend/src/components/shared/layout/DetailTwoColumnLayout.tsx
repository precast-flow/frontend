import type { ReactNode } from 'react'

type Props = {
  primary: ReactNode
  secondary: ReactNode
  className?: string
}

/** İçerik kartları için tutarlı iki kolon düzeni (varsayılan 2fr / 3fr). */
export function DetailTwoColumnLayout({ primary, secondary, className = '' }: Props) {
  return (
    <div
      className={[
        'grid min-h-0 min-w-0 items-stretch gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]',
        className,
      ].join(' ')}
    >
      <div className="flex min-h-0 min-w-0 flex-col">{primary}</div>
      <div className="flex min-h-0 min-w-0 flex-col">{secondary}</div>
    </div>
  )
}
