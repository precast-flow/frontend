/** Kullanıcı yönetimi / roller split panelleri ile aynı liste ve sekme stilleri. */

type SplitTabOpts = { gl?: boolean }

export function splitTabPill(active: boolean, opts?: SplitTabOpts) {
  const gl = opts?.gl ?? false
  return [
    'shrink-0 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
    active
      ? gl
        ? 'border-sky-400/45 bg-sky-500/14 text-slate-900 shadow-sm dark:border-sky-400/40 dark:bg-sky-500/22 dark:text-slate-50'
        : 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
      : gl
        ? 'border-black/10 bg-black/[0.04] text-black/70 hover:border-black/15 hover:bg-black/[0.07] hover:text-black dark:border-white/12 dark:bg-white/[0.06] dark:text-white/75 dark:hover:bg-white/[0.09] dark:hover:text-white'
        : 'border-slate-200/70 bg-slate-50/90 text-slate-600 hover:border-slate-300/80 hover:bg-slate-100/90 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:text-slate-100',
  ].join(' ')
}

export function splitTabPillLocked(active: boolean, locked: boolean, opts?: SplitTabOpts) {
  return [
    splitTabPill(active, opts),
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

export { StickyDetailTabBar } from './layout/StickyDetailTabBar'
export { DetailTwoColumnLayout } from './layout/DetailTwoColumnLayout'
export {
  useSplitPaneRatio,
  SPLIT_PANE_DEFAULT_RATIO,
  clampSplitPaneRatio,
  readSplitPaneRatio,
  writeSplitPaneRatio,
} from './layout/useSplitPaneRatio'
export { useSplitPaneDrag } from './layout/useSplitPaneDrag'
export {
  ManagementModuleShell,
  managementModuleOuterClass,
  managementModuleGridClass,
  managementModuleBreadcrumbClass,
  managementModuleContentClass,
  managementModuleSplitRowClass,
  managementModuleListPanelClass,
  managementModuleDetailPanelClass,
  managementModuleListToolbarClass,
  managementModuleListTitleClass,
  splitPanePanelMinHeightClass,
} from './layout/ManagementModuleShell'
