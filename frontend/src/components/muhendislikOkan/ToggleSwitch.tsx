type Props = {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  id?: string
  'aria-label'?: string
}

export function ToggleSwitch({ checked, onChange, disabled, id, 'aria-label': ariaLabel }: Props) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
        checked
          ? 'bg-emerald-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] dark:bg-emerald-500'
          : 'bg-gray-300 shadow-neo-in dark:bg-gray-600',
        disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer active:scale-[0.98]',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none block size-5 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 dark:ring-white/10',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}
