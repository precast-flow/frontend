/**
 * Checklist maddesi — NeoSwitch ile aynı aile: inset track + protrude thumb (Prompt 07 / 00b).
 */
type Props = {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  disabled?: boolean
}

export function ChecklistToggle({ checked, onChange, label, disabled }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-gray-50 dark:bg-gray-950/90/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative h-7 w-12 shrink-0 rounded-full bg-gray-100 dark:bg-gray-900 shadow-neo-in">
        <span
          className={[
            'absolute top-0.5 left-0.5 flex size-6 items-center justify-center rounded-full bg-gray-200 shadow-neo-out-sm transition-transform duration-200 ease-out',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        >
          <span
            className={[
              'size-1.5 rounded-full',
              checked ? 'bg-amber-500' : 'bg-gray-400',
            ].join(' ')}
            aria-hidden
          />
        </span>
      </span>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</span>
    </button>
  )
}
