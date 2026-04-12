type Variant = 'default' | 'success' | 'neutral' | 'warn' | 'template' | 'asm' | 'job'

const map: Record<Variant, string> = {
  default: 'bg-blue-600 text-white',
  success: 'bg-emerald-600 text-white',
  neutral: 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-white',
  warn: 'bg-amber-500 text-slate-900',
  template: 'border border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200',
  asm: 'border border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-100',
  job: 'border border-amber-400 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100',
}

export function MptsBadge({ children, variant = 'default' }: { children: React.ReactNode; variant?: Variant }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${map[variant]}`}>
      {children}
    </span>
  )
}
