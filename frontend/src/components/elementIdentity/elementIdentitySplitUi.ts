/** Kullanıcı yönetimi / roller ile aynı split liste ve sekme stilleri */

export function eiSplitListRowButton(active: boolean) {
  return [
    'flex w-full flex-col gap-0.5 rounded-lg border px-2.5 py-2 text-left text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
    active
      ? 'border-sky-400/60 bg-sky-500/10 dark:border-sky-500/40 dark:bg-sky-500/15'
      : 'border-slate-200/50 bg-white/40 hover:bg-white/70 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-slate-900/50',
  ].join(' ')
}

/** İlerleme çubuğu / yan aksiyonlu satırlar için dış kabuk */
export function eiSplitListRowShell(active: boolean) {
  return [
    'rounded-lg border px-2.5 py-2 transition',
    active
      ? 'border-sky-400/60 bg-sky-500/10 dark:border-sky-500/40 dark:bg-sky-500/15'
      : 'border-slate-200/50 bg-white/40 hover:bg-white/70 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-slate-900/50',
  ].join(' ')
}

export function eiTabPill(active: boolean) {
  return [
    'shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
    active
      ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
      : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100',
  ].join(' ')
}
