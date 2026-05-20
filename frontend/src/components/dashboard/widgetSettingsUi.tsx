import type { ReactNode } from 'react'
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react'

const fieldClass =
  'w-full rounded-lg border border-slate-200/80 bg-white/80 px-2.5 py-2 text-sm text-[var(--glass-text-primary)] shadow-sm focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/25 dark:border-white/12 dark:bg-white/8'

const labelClass = 'text-xs font-medium text-[var(--glass-text-muted)]'

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-[10px] font-semibold uppercase tracking-wide text-[var(--glass-text-muted)]">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function SettingsField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? <span className="text-[10px] leading-snug text-[var(--glass-text-muted)]">{hint}</span> : null}
    </label>
  )
}

export function SettingsInput({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={[fieldClass, className].filter(Boolean).join(' ')} {...props} />
}

export function SettingsTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldClass} min-h-[5rem] resize-y`} {...props} />
}

export function SettingsSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={fieldClass} {...props} />
}

/** Kompakt açık/kapalı — pano ayarları için */
export function SettingsToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/70 bg-slate-50/50 px-3 py-2.5 dark:border-white/10 dark:bg-white/4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--glass-text-primary)]">{label}</p>
        {description ? (
          <p className="mt-0.5 text-[10px] leading-snug text-[var(--glass-text-muted)]">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-sky-600 dark:bg-cyan-600' : 'bg-slate-300 dark:bg-slate-600',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

export function SettingsCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200/60 px-3 py-2 dark:border-white/10">
      <input
        type="checkbox"
        className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500/30"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-xs text-[var(--glass-text-primary)]">{label}</span>
    </label>
  )
}

type Align = 'left' | 'center' | 'right'

export function SettingsAlignButtons({
  value,
  onChange,
  labels,
}: {
  value: Align
  onChange: (v: Align) => void
  labels: { left: string; center: string; right: string }
}) {
  const items: { id: Align; icon: typeof AlignLeft; label: string }[] = [
    { id: 'left', icon: AlignLeft, label: labels.left },
    { id: 'center', icon: AlignCenter, label: labels.center },
    { id: 'right', icon: AlignRight, label: labels.right },
  ]
  return (
    <div className="flex gap-1 rounded-lg border border-slate-200/70 bg-slate-50/40 p-1 dark:border-white/10 dark:bg-white/4">
      {items.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={[
            'flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition',
            value === id
              ? 'bg-white text-sky-800 shadow-sm dark:bg-slate-800 dark:text-cyan-200'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
          ].join(' ')}
        >
          <Icon className="size-3.5" aria-hidden />
        </button>
      ))}
    </div>
  )
}
