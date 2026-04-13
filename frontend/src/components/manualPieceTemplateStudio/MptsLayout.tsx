import type { ReactNode } from 'react'
import { ClipboardList, Layers, LayoutGrid, Package } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { ENGINEERING_BASE_PATH } from './constants'
import { useMptsBasePath } from './MptsContext'
import { MptsToast } from './components/MptsToast'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex min-h-[2.5rem] shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition md:px-4 md:text-sm',
    isActive
      ? 'okan-liquid-pill-active text-slate-900 shadow-sm ring-1 ring-sky-400/30 dark:text-slate-50 dark:ring-sky-400/20'
      : 'text-slate-700 hover:bg-white/25 dark:text-slate-300 dark:hover:bg-white/8',
  ].join(' ')

function NavDivider() {
  return (
    <span
      className="hidden h-7 w-px shrink-0 self-center bg-gradient-to-b from-transparent via-white/40 to-transparent sm:block dark:via-white/18"
      aria-hidden
    />
  )
}

type MptsLayoutProps = {
  /** Düz (flat) rotalarda sayfa; yoksa iç içe `<Route>` için `<Outlet />` */
  children?: ReactNode
}

export function MptsLayout({ children }: MptsLayoutProps) {
  const { t } = useI18n()
  const basePath = useMptsBasePath()
  const hideModuleNav = basePath === ENGINEERING_BASE_PATH
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 md:gap-4">
      <MptsToast />

      {hideModuleNav ? null : (
        <header className="okan-liquid-panel shrink-0 overflow-hidden rounded-2xl p-2 shadow-[var(--okan-panel-shadow)] sm:p-3">
          <nav
            className="okan-liquid-pill-track flex min-w-0 flex-col gap-2 rounded-2xl p-1.5 sm:flex-row sm:items-center sm:gap-1 sm:overflow-x-auto sm:rounded-full sm:p-1 sm:[-webkit-overflow-scrolling:touch]"
            aria-label={t('nav.manualPieceStudio')}
          >
            <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-1">
              <span className="px-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:hidden">
                {t('mpts.layout.catalog')}
              </span>
              <div className="flex flex-wrap gap-1 sm:flex-nowrap">
                <NavLink to={`${basePath}/catalog/material-items`} className={linkClass} end title={t('mpts.layout.nav.materialItems')}>
                  <Package className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  <span className="whitespace-nowrap">{t('mpts.layout.nav.materialItems')}</span>
                </NavLink>
                <NavLink to={`${basePath}/catalog/material-assemblies`} className={linkClass} title={t('mpts.layout.nav.assemblies')}>
                  <Layers className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  <span className="whitespace-nowrap">{t('mpts.layout.nav.assemblies')}</span>
                </NavLink>
              </div>
            </div>

            <NavDivider />

            <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-1">
              <span className="px-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:hidden">
                {t('mpts.layout.templates')}
              </span>
              <NavLink to={`${basePath}/templates/piece-mark-templates`} className={linkClass} title={t('mpts.layout.nav.pieceMarkTpl')}>
                <LayoutGrid className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <span className="whitespace-nowrap">{t('mpts.layout.nav.pieceMarkTpl')}</span>
              </NavLink>
            </div>

            <NavDivider />

            <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-1">
              <span className="px-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:hidden">
                {t('mpts.layout.production')}
              </span>
              <NavLink to={`${basePath}/production/piece-marks`} className={linkClass} title={t('mpts.layout.nav.pieceMarks')}>
                <ClipboardList className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <span className="whitespace-nowrap">{t('mpts.layout.nav.pieceMarks')}</span>
              </NavLink>
            </div>
          </nav>
        </header>
      )}

      <div className="okan-liquid-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl p-3 shadow-[var(--okan-panel-shadow)] sm:p-4">
        {children ?? <Outlet />}
      </div>
    </div>
  )
}
