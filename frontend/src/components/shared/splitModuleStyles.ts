/** Kullanıcı yönetimi / roller split panelleri ile aynı liste ve sekme stilleri. */

export function splitTabPill(active: boolean) {
  return [
    'shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
    active
      ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
      : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100',
  ].join(' ')
}

export function splitTabPillLocked(active: boolean, locked: boolean) {
  return [
    splitTabPill(active),
    locked ? 'opacity-80' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export function splitListCardClass(active: boolean, extra = '') {
  return [
    'rounded-lg border text-left transition',
    active
      ? 'border-sky-400/60 bg-sky-500/10 dark:border-sky-500/40 dark:bg-sky-500/15'
      : 'border-slate-200/50 bg-white/40 hover:bg-white/70 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-slate-900/50',
    extra,
  ]
    .filter(Boolean)
    .join(' ')
}

export const splitListEmptyClass =
  'rounded-lg border border-dashed border-slate-300/60 bg-white/30 px-3 py-8 text-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/20'

export const splitDetailHeaderClass =
  'shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10'

/** Sağ detay gövdesi — üst kartın tam genişliğini kullanır. */
export const splitDetailPanelBodyClass = 'w-full min-w-0'
