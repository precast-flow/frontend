import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  title: string
  description?: string
  onClick: () => void
}

export function PlanningActionButton({ icon: Icon, title, description, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-3.5 text-left shadow-sm transition hover:border-sky-300/70 hover:bg-sky-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 dark:border-slate-600/55 dark:bg-slate-900/45 dark:hover:border-sky-500/50 dark:hover:bg-sky-950/35"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sky-200/70 bg-sky-50 text-sky-700 transition group-hover:border-sky-300/80 group-hover:bg-sky-100 dark:border-sky-700/50 dark:bg-sky-950/50 dark:text-sky-300 dark:group-hover:bg-sky-900/60">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="block text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">
          {title}
        </span>
        {description ? (
          <span className="mt-0.5 block text-[11px] leading-snug text-slate-500 dark:text-slate-400">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  )
}
