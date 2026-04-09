import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { AppShellOutletContext } from '../../appShellOutletContext'
import { activeModuleIdFromPathname, moduleIdToPath, navGroups, startNavItems } from '../../data/navigation'
import { useFactoryContext } from '../../context/FactoryContext'
import { useProductionRolePreview } from '../../context/ProductionRolePreviewContext'
import { filterNavGroupsForPreview, getRoleMatrixRow } from '../../data/productionRoleMatrixMock'
import { AppFooter } from '../../components/AppFooter'
import { FactorySummaryDrawer } from '../../components/FactorySummaryDrawer'
import { ProductionRolePreviewBanner } from '../../components/production/ProductionRolePreviewBanner'
import { Sidebar } from '../../components/Sidebar'
import { TopBar } from '../../components/TopBar'
import { GlassHeader } from './GlassHeader'
import { GlassLayout } from './GlassLayout'
import { GlassSidebar } from './GlassSidebar'

function GlassAppShellInner() {
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedFactory, factoryDrawerOpen, closeFactoryDrawer } = useFactoryContext()
  const { previewRoleId } = useProductionRolePreview()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  /** false = geniş menü (marka kutusu); true = dar şerit (yalnızca PF) */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  /** Dar şeritte hover ile menü genişken üst çubuk kayması */
  const [sidebarHoverExpanded, setSidebarHoverExpanded] = useState(false)

  const effectiveActiveId = useMemo(() => activeModuleIdFromPathname(location.pathname), [location.pathname])

  const filteredNavGroups = useMemo(
    () => filterNavGroupsForPreview(navGroups, previewRoleId),
    [previewRoleId],
  )

  useEffect(() => {
    if (!previewRoleId) return
    const row = getRoleMatrixRow(previewRoleId)
    if (!row) return
    if (effectiveActiveId === 'production-role-preview') return
    const prodIds = navGroups.find((g) => g.id === 'production')?.items.map((i) => i.id) ?? []
    if (prodIds.includes(effectiveActiveId) && !row.menuIds.includes(effectiveActiveId)) {
      navigate('/')
    }
  }, [previewRoleId, effectiveActiveId, navigate])

  const select = useCallback(
    (id: string) => {
      setMobileNavOpen(false)
      navigate(moduleIdToPath(id))
    },
    [navigate],
  )

  const outletContext: AppShellOutletContext = { onNavigate: select }

  const sidebarCollapsedEffective = sidebarCollapsed && !mobileNavOpen
  const topBarLeftPadding =
    sidebarCollapsedEffective && !sidebarHoverExpanded ? 'calc(4.75rem + 1rem)' : 'calc(280px + 1rem)'

  const expandSidebar = useCallback(() => setSidebarCollapsed(false), [])
  /** Masaüstü grid: banner varsa nav ile main aynı satırda (banner yalnızca içerik sütununda) */
  const hasPreviewBanner = Boolean(previewRoleId)

  return (
    <GlassLayout>
      {mobileNavOpen ? (
        <button
          type="button"
          className="gm-glass-shell-mobile-overlay fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] md:hidden"
          aria-label="Menüyü kapat"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <div className="mx-auto flex min-h-dvh max-w-[1600px] flex-col gap-3 p-3 text-[var(--glass-text-primary)] md:gap-4 md:p-5">
        <div
          className={[
            'relative z-0 flex min-h-0 min-w-0 flex-1 flex-col gap-3 pt-20 md:min-h-0 md:grid md:grid-cols-[4.75rem_minmax(0,1fr)] md:gap-x-4 md:gap-y-4 md:pt-24',
            /* Mobil: banner → main → footer; masaüstü: nav ile main aynı satır (banner üstte yalnız sağda) */
          ].join(' ')}
        >
          <div
            className={[
              'z-50 md:z-[80]',
              'md:relative md:block md:w-[4.75rem] md:min-w-[4.75rem] md:overflow-visible md:self-start',
              hasPreviewBanner ? 'md:col-start-1 md:row-start-2' : 'md:col-start-1 md:row-start-1',
              mobileNavOpen
                ? 'fixed inset-y-3 left-3 flex md:static'
                : 'hidden md:block',
            ].join(' ')}
          >
            <GlassSidebar>
              <Sidebar
                startItems={startNavItems}
                groups={filteredNavGroups}
                activeId={effectiveActiveId}
                onSelect={select}
                collapsed={sidebarCollapsedEffective}
                onExpandSidebar={expandSidebar}
                onDesktopHoverExpandedChange={setSidebarHoverExpanded}
              />
            </GlassSidebar>
          </div>

          {previewRoleId ? (
            <div className="order-1 md:col-start-2 md:row-start-1">
              <ProductionRolePreviewBanner />
            </div>
          ) : null}

          <main
            id="main-module"
            className={[
              'gm-glass-panel-l1 gm-motion relative z-0 flex min-h-[60vh] flex-1 flex-col overflow-visible rounded-2xl p-1 md:min-h-[62vh] md:rounded-3xl',
              hasPreviewBanner ? 'order-2 md:col-start-2 md:row-start-2' : 'order-1 md:col-start-2 md:row-start-1',
            ].join(' ')}
            aria-label="Modül içeriği"
          >
            <div
              id="gm-glass-outlet"
              className="gm-glass-outlet-scope flex min-h-0 flex-1 flex-col overflow-visible rounded-[1.25rem] p-2 md:rounded-[1.35rem] md:p-3"
            >
              <Outlet context={outletContext} />
            </div>
          </main>

          <div
            className={[
              'gm-glass-footer-host gm-glass-panel-l2 gm-motion rounded-2xl md:rounded-3xl',
              hasPreviewBanner
                ? 'order-3 md:col-start-2 md:row-start-3'
                : 'order-2 md:col-start-2 md:row-start-2',
            ].join(' ')}
          >
            <div className="[&>footer]:rounded-2xl [&>footer]:bg-transparent [&>footer]:shadow-none md:[&>footer]:rounded-3xl">
              <AppFooter />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed top-3 left-0 right-0 z-[95] md:top-5">
        <div className="mx-auto max-w-[1600px] px-3 md:px-5">
          <div
            className="hidden md:block motion-reduce:transition-none transition-[padding-left] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ paddingLeft: topBarLeftPadding }}
          >
            <div className="pointer-events-auto">
              <GlassHeader>
                <TopBar onMenuToggle={() => setMobileNavOpen((o) => !o)} onModuleNavigate={select} />
              </GlassHeader>
            </div>
          </div>
          <div className="pointer-events-auto md:hidden">
            <GlassHeader>
              <TopBar onMenuToggle={() => setMobileNavOpen((o) => !o)} onModuleNavigate={select} />
            </GlassHeader>
          </div>
        </div>
      </div>

      <FactorySummaryDrawer
        open={factoryDrawerOpen}
        factory={selectedFactory}
        onClose={closeFactoryDrawer}
      />
    </GlassLayout>
  )
}

export function GlassAppShell() {
  return <GlassAppShellInner />
}

export default GlassAppShell
