import { Search } from 'lucide-react'

export type FilterToolbarSearchProps = {
  id: string
  value: string
  onValueChange: (next: string) => void
  placeholder: string
  ariaLabel: string
  className?: string
  inputClassName?: string
}

/**
 * «Filtrele» satırında dışarıdan hızlı arama — filtre çekmecesindeki arama alanı ile aynı state’e bağlanır.
 */
export function FilterToolbarSearch({
  id,
  value,
  onValueChange,
  placeholder,
  ariaLabel,
  className = '',
  inputClassName = '',
}: FilterToolbarSearchProps) {
  return (
    <div
      className={[
        'relative min-h-[2.25rem] min-w-0 flex-1 basis-full sm:max-w-xs sm:basis-auto',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        aria-label={ariaLabel}
        className={[
          'h-full w-full rounded-lg border border-slate-200/80 bg-white/80 py-1.5 pl-8 pr-2.5 text-xs text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/30 dark:border-slate-600/80 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 sm:text-sm',
          inputClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </div>
  )
}
