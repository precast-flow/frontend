import { SiteSpinner } from './SiteSpinner'

/** İlk chunk / Suspense fallback — tam ekran, gri zemin */
export function SiteLoadingOverlay() {
  return (
    <div
      className="gm-glass-modal-shell fixed inset-0 z-[200] flex items-center justify-center bg-pf-page"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative h-16 w-16">
        <SiteSpinner size="lg" center />
      </div>
      <span className="sr-only">Precast Flow yükleniyor</span>
    </div>
  )
}
