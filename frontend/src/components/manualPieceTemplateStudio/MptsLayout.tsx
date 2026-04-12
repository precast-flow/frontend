import { ClipboardList, Layers, LayoutGrid, Package, Settings2 } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { MPTS_BASE_PATH } from './constants'
import { MptsToast } from './components/MptsToast'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
    isActive
      ? 'bg-white/55 text-slate-900 shadow-sm ring-1 ring-sky-400/35 dark:bg-white/10 dark:text-slate-50 dark:ring-sky-400/25'
      : 'text-slate-700 hover:bg-white/30 dark:text-slate-300 dark:hover:bg-white/5',
  ].join(' ')

export function MptsLayout() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-5">
      <MptsToast />
      <aside className="okan-liquid-panel flex max-h-[min(40vh,320px)] shrink-0 flex-col overflow-hidden p-3 lg:max-h-none lg:w-56">
        <div className="mb-2 flex items-center gap-2 border-b border-white/20 pb-2 dark:border-white/10">
          <Settings2 className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            {t('mpts.layout.studio')}
          </span>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden lg:space-y-0">
          <span className="mb-1 block px-2 pt-1 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            {t('mpts.layout.catalog')}
          </span>
          <NavLink to={`${MPTS_BASE_PATH}/catalog/material-items`} className={navClass} end>
            <Package className="h-4 w-4 shrink-0" />
            {t('mpts.layout.nav.materialItems')}
          </NavLink>
          <NavLink to={`${MPTS_BASE_PATH}/catalog/material-assemblies`} className={navClass}>
            <Layers className="h-4 w-4 shrink-0" />
            {t('mpts.layout.nav.assemblies')}
          </NavLink>
          <span className="mb-1 mt-3 block px-2 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            {t('mpts.layout.templates')}
          </span>
          <NavLink to={`${MPTS_BASE_PATH}/templates/piece-mark-templates`} className={navClass}>
            <LayoutGrid className="h-4 w-4 shrink-0" />
            {t('mpts.layout.nav.pieceMarkTpl')}
          </NavLink>
          <span className="mb-1 mt-3 block px-2 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            {t('mpts.layout.production')}
          </span>
          <NavLink to={`${MPTS_BASE_PATH}/production/piece-marks`} className={navClass}>
            <ClipboardList className="h-4 w-4 shrink-0" />
            {t('mpts.layout.nav.pieceMarks')}
          </NavLink>
        </nav>
        <div className="mt-2 hidden border-t border-white/15 pt-2 text-[10px] leading-snug text-slate-600 dark:border-white/10 dark:text-slate-400 lg:block">
          {t('mpts.layout.flowHint')}
        </div>
      </aside>
      <div className="okan-liquid-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">
        <Outlet />
      </div>
    </div>
  )
}
