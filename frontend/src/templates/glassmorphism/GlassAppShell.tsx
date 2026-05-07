import { useCallback, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { AppShellOutletContext } from '../../appShellOutletContext'
import { activeModuleIdFromPathname, moduleIdToPath, navGroups, startNavItems } from '../../data/navigation'
import { useFactoryContext } from '../../context/FactoryContext'
import { AppFooter } from '../../components/AppFooter'
import { FactorySummaryDrawer } from '../../components/FactorySummaryDrawer'
import { AppTopNav } from '../../components/AppTopNav'
import { ElementIdentityProvider } from '../../components/elementIdentity/ElementIdentityContext'
import { GlassFooter } from './GlassFooter'
import { GlassHeader } from './GlassHeader'
import { GlassLayout } from './GlassLayout'

function GlassAppShellInner() {
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedFactory, factoryDrawerOpen, closeFactoryDrawer } = useFactoryContext()

  const effectiveActiveId = useMemo(() => activeModuleIdFromPathname(location.pathname), [location.pathname])

  const select = useCallback(
    (id: string) => {
      navigate(moduleIdToPath(id))
    },
    [navigate],
  )

  const outletContext: AppShellOutletContext = { onNavigate: select }

  const topBarLeftPadding = '0px'
  /** Proje/CRM/Teklif (alt path dahil) + Üretim planlama: üst boşluk `pt-14 md:pt-16`, outlet padding 0 — navbar–başlık hizası */
  const isOkanPlanSplitPage =
    location.pathname.startsWith('/proje') ||
    location.pathname.startsWith('/crm') ||
    location.pathname.startsWith('/musteri-detay') ||
    location.pathname.startsWith('/teklif') ||
    location.pathname.startsWith('/eleman-kimlik') ||
    location.pathname.startsWith('/admin/eleman-kimlik') ||
    location.pathname.startsWith('/malzeme-katalogu') ||
    location.pathname.startsWith('/standart-seri-urunler') ||
    location.pathname.startsWith('/kullanicilar') ||
    location.pathname.startsWith('/roller-izinler') ||
    location.pathname.startsWith('/onay-akisi') ||
    location.pathname.startsWith('/birim-is-kuyrugu') ||
    location.pathname === '/profile' ||
    location.pathname === '/settings' ||
    effectiveActiveId === 'planning-design'

  return (
    <GlassLayout>
      <div className="flex min-h-dvh w-full min-w-0 flex-col gap-3 p-3 text-[var(--glass-text-primary)] md:gap-4 md:p-5">
        <div
          className={[
            'relative z-0 flex min-h-0 min-w-0 flex-1 flex-col gap-3 pb-[var(--gm-footer-clear)] md:min-h-0 md:gap-4',
            isOkanPlanSplitPage ? 'pt-14 md:pt-16' : 'pt-20 md:pt-24',
          ].join(' ')}
        >
          <main
            id="main-module"
            className={[
              `gm-motion relative z-0 flex min-h-0 flex-1 flex-col overflow-visible rounded-2xl ${
                isOkanPlanSplitPage ? 'p-0 md:p-0' : 'p-1'
              } md:min-h-0 md:rounded-3xl`,
            ].join(' ')}
            aria-label="Modül içeriği"
          >
            <div
              id="gm-glass-outlet"
              className={[
                'gm-glass-outlet-scope flex min-h-0 flex-1 flex-col overflow-visible rounded-[1.25rem] md:rounded-[1.35rem]',
                isOkanPlanSplitPage ? 'p-0 md:p-0' : 'p-2 md:p-3',
              ].join(' ')}
            >
              <ElementIdentityProvider>
                <Outlet context={outletContext} />
              </ElementIdentityProvider>
            </div>
          </main>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[92] pb-[env(safe-area-inset-bottom,0px)]">
        <div className="pointer-events-auto w-full min-w-0">
          <GlassFooter>
            <AppFooter />
          </GlassFooter>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-0 z-[95] pt-[env(safe-area-inset-top,0px)]">
        <div className="w-full min-w-0">
          <div
            className="hidden md:block motion-reduce:transition-none transition-[padding-left] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ paddingLeft: topBarLeftPadding }}
          >
            <div className="pointer-events-auto">
              <GlassHeader>
                <AppTopNav
                  onModuleNavigate={select}
                  startItems={startNavItems}
                  groups={navGroups}
                  activeId={effectiveActiveId}
                />
              </GlassHeader>
            </div>
          </div>
          <div className="pointer-events-auto md:hidden">
            <GlassHeader>
              <AppTopNav
                onModuleNavigate={select}
                startItems={startNavItems}
                groups={navGroups}
                activeId={effectiveActiveId}
              />
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
