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
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-1 transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        checked
          ? 'border-emerald-400/40 bg-gradient-to-b from-emerald-500/90 to-emerald-600/95 shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_2px_10px_rgb(16_185_129/0.35)] dark:from-emerald-500/80 dark:to-emerald-600/85'
          : 'border-white/35 bg-white/35 shadow-[inset_0_2px_6px_rgb(15_23_42/0.06)] backdrop-blur-md dark:border-white/15 dark:bg-white/10',
        disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer active:scale-[0.98]',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none block size-5 rounded-full border border-white/40 bg-gradient-to-b from-white to-slate-50 shadow-[0_2px_8px_rgb(15_23_42/0.12),inset_0_1px_0_rgb(255_255_255/0.9)] transition-transform duration-200 dark:from-white dark:to-slate-200 dark:shadow-[0_2px_10px_rgb(0_0_0/0.35)]',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}
