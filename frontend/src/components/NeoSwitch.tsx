/**
 * Inset track + protrude thumb — 00b referansı; LED için amber isteğe bağlı.
 */
type Props = {
  id: string
  /** Boşsa erişilebilir ad için `ariaLabel` kullanın */
  label?: string
  ariaLabel?: string
  checked: boolean
  onChange: (next: boolean) => void
}

export function NeoSwitch({ id, label, ariaLabel, checked, onChange }: Props) {
  const name = ariaLabel ?? label ?? 'Anahtar'
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ? undefined : name}
        id={id}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-9 w-[3.25rem] shrink-0 rounded-full bg-gray-100 dark:bg-gray-900 shadow-neo-in transition dark:bg-gray-950',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-1 left-1 flex size-7 items-center justify-center rounded-full bg-gray-200 shadow-neo-out-sm transition-transform duration-200 ease-out dark:bg-gray-600',
            checked ? 'translate-x-[1.35rem]' : 'translate-x-0',
          ].join(' ')}
        >
          <span
            className={[
              'size-1.5 rounded-full',
              checked ? 'bg-amber-500' : 'bg-gray-400 dark:bg-gray-50 dark:bg-gray-950/900',
            ].join(' ')}
            aria-hidden
          />
        </span>
      </button>
      {label ? (
        <label htmlFor={id} className="text-sm text-gray-700 dark:text-gray-200">
          {label}
        </label>
      ) : null}
    </div>
  )
}
