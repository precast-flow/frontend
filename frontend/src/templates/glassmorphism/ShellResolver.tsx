import { lazy, Suspense } from 'react'
import { SiteLoadingOverlay } from '../../components/SiteLoadingOverlay'

const GlassAppShell = lazy(() => import('./GlassAppShell'))

/** Ana uygulama kabuğu — yalnızca glass şablon. */
export function ShellResolver() {
  return (
    <Suspense fallback={<SiteLoadingOverlay />}>
      <GlassAppShell />
    </Suspense>
  )
}

export default ShellResolver
