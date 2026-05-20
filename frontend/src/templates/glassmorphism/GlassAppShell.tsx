import { useCallback, useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { AppShellOutletContext } from '../../appShellOutletContext'
import { activeModuleIdFromPathname, moduleIdToPath, navGroups, startNavItems } from '../../data/navigation'
import { useFactoryContext } from '../../context/FactoryContext'
import { useThemeMode } from '../../theme/ThemeProvider'
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
  const { mode } = useThemeMode()
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

  /**
   * Açık tema: tüm cam kabukta mor/cyan gradyan ve renkli blob yok — düz nötr zemin (`GlassLayout`).
   */
  const useNeutralGlassBackdrop = mode === 'light'

  /** Proje/CRM/Teklif (alt path dahil) + Üretim planlama: üst boşluk (proje listesi hariç) `pt-14 md:pt-16`, outlet padding 0 — navbar–başlık hizası */
  const isDashboardHome = location.pathname === '/'

  /** Pano: tek iç kaydırma, kabuk viewport’ta sabit (alt gri boşluk / çift scroll önlenir). */
  const isDashboardViewportLock = isDashboardHome

  const isOkanPlanSplitPage =
    isDashboardHome ||
    location.pathname.startsWith('/proje') ||
    location.pathname.startsWith('/proje-detay') ||
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
    location.pathname.startsWith('/kalite-kontrol-raporu') ||
    location.pathname.startsWith('/gunluk-uretim-raporu') ||
    location.pathname.startsWith('/planlama') ||
    location.pathname.startsWith('/genel-planlama') ||
    location.pathname.startsWith('/uretim-planlama') ||
    location.pathname.startsWith('/sevkiyat-planlama') ||
    location.pathname === '/profile' ||
    location.pathname === '/settings' ||
    effectiveActiveId === 'planning-design' ||
    effectiveActiveId === 'general-planning' ||
    effectiveActiveId === 'production-planning' ||
    effectiveActiveId === 'dispatch-planning'

  /** Proje / Görev / Müşteri liste modülleri: üst padding ve dış gap aynı (navbar altı hizası). */
  const isProjectListRoute =
    location.pathname === '/proje' || location.pathname === '/proje/'
  const isWorkQueueListRoute =
    location.pathname === '/birim-is-kuyrugu' || location.pathname === '/birim-is-kuyrugu/'
  const isCrmListRoute = location.pathname === '/crm' || location.pathname === '/crm/'
  const isSystemListRoute =
    location.pathname === '/onay-akisi' ||
    location.pathname === '/onay-akisi/' ||
    location.pathname === '/roller-izinler' ||
    location.pathname === '/roller-izinler/' ||
    location.pathname === '/kullanicilar' ||
    location.pathname === '/kullanicilar/'
  const isDefinitionsListRoute =
    location.pathname.startsWith('/eleman-kimlik') ||
    location.pathname.startsWith('/malzeme-katalogu') ||
    location.pathname.startsWith('/standart-seri-urunler')
  const isAccountListRoute =
    location.pathname === '/profile' ||
    location.pathname === '/profile/' ||
    location.pathname === '/settings' ||
    location.pathname === '/settings/' ||
    location.pathname.startsWith('/admin/eleman-kimlik')
  const isTightListShellRoute =
    isDashboardViewportLock ||
    isProjectListRoute ||
    isWorkQueueListRoute ||
    isCrmListRoute ||
    isSystemListRoute ||
    isDefinitionsListRoute ||
    isAccountListRoute
  /**
   * Tam sayfa detay (kalite raporu): kabuk viewport’ta sabit, kaydırma üst sütunda;
   * main/outlet flex-1 ile içeriği kırpmaz — başlık + kart birlikte kayar.
   */
  const isPageScrollDetailRoute =
    location.pathname.startsWith('/kalite-kontrol-raporu') ||
    location.pathname.startsWith('/gunluk-uretim-raporu')

  const shellPadding =
    isTightListShellRoute && isOkanPlanSplitPage
      ? 'gap-1.5 px-3 pt-0 pb-3 md:gap-2 md:px-5 md:pt-0 md:pb-5'
      : 'gap-3 p-3 md:gap-4 md:p-5'

  const contentTopPadding = isOkanPlanSplitPage
    ? isTightListShellRoute
      ? 'pt-[calc(env(safe-area-inset-top,0px)+3.5rem+1rem)] md:pt-[calc(env(safe-area-inset-top,0px)+3.625rem+1.125rem)]'
      : 'pt-14 md:pt-16'
    : 'pt-20 md:pt-24'

  const contentGap =
    isTightListShellRoute && isOkanPlanSplitPage ? 'gap-1 md:gap-1.5' : 'gap-3 md:gap-4'

  useEffect(() => {
    const root = document.documentElement
    if (isPageScrollDetailRoute) {
      root.classList.add('gm-shell--document-scroll')
    } else {
      root.classList.remove('gm-shell--document-scroll')
    }
    return () => root.classList.remove('gm-shell--document-scroll')
  }, [isPageScrollDetailRoute])

  const shellOuterClass = isPageScrollDetailRoute
    ? 'flex min-h-dvh w-full min-w-0 flex-col'
    : 'flex h-dvh max-h-dvh min-h-0 w-full min-w-0 flex-col overflow-hidden'

  const shellScrollClass = isPageScrollDetailRoute
    ? 'relative z-0 flex w-full min-w-0 flex-col pb-[var(--gm-footer-clear)]'
    : isDashboardViewportLock
      ? 'relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-[var(--gm-footer-clear)] md:min-h-0'
      : 'relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-[var(--gm-footer-clear)] md:min-h-0'

  return (
    <GlassLayout backdrop={useNeutralGlassBackdrop ? 'neutral-grid' : 'blobs'}>
      <div
        data-gm-shell-outer
        className={[shellOuterClass, 'text-[var(--glass-text-primary)]', shellPadding].join(' ')}
      >
        <div
          className={[shellScrollClass, contentGap, contentTopPadding].join(' ')}
          data-gm-shell-scroll={isPageScrollDetailRoute ? 'page' : undefined}
        >
          <main
            id="main-module"
            className={[
              'gm-motion relative z-0 w-full overflow-visible rounded-2xl md:rounded-3xl',
              isOkanPlanSplitPage ? 'p-0 md:p-0' : 'p-1',
              isPageScrollDetailRoute ? '' : 'flex min-h-0 flex-1 flex-col md:min-h-0',
            ].join(' ')}
            aria-label="Modül içeriği"
          >
            <div
              id="gm-glass-outlet"
              className={[
                'gm-glass-outlet-scope w-full overflow-visible rounded-[1.25rem] md:rounded-[1.35rem]',
                isOkanPlanSplitPage ? 'p-0 md:p-0' : 'p-2 md:p-3',
                isPageScrollDetailRoute ? '' : 'flex min-h-0 flex-1 flex-col',
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

      <div className="pointer-events-none fixed inset-x-0 top-0 z-[180] pt-[env(safe-area-inset-top,0px)]">
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
