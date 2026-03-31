import { X } from 'lucide-react'
import type { Quote, QuoteStatus } from '../../data/quotesMock'

type Props = {
  open: boolean
  quote: Quote | null
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}

/**
 * Onay akışı: ayrı sayfa yerine drawer — liste/detay bağlamı korunur (Prompt 05 gerekçe).
 */
export function QuoteApprovalDrawer({
  open,
  quote,
  onClose,
  onApprove,
  onReject,
}: Props) {
  if (!open) return null

  const canAct = quote?.status === 'onay_bekliyor'

  return (
    <div className="gm-glass-drawer-root fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="gm-glass-drawer-backdrop absolute inset-0 border-0 p-0"
        aria-label="Paneli kapat"
        onClick={onClose}
      />
      <aside
        className="gm-glass-drawer-panel relative z-10 flex h-full min-h-0 w-full max-w-md flex-col overflow-hidden rounded-l-3xl bg-gray-100 dark:bg-gray-900 shadow-neo-out md:m-3 md:rounded-3xl"
        aria-label="Versiyon ve onay"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200/90 dark:border-gray-700/90 p-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">Versiyon & onay</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 shadow-neo-out-sm hover:text-gray-900 dark:text-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {quote ? (
            <div className="space-y-4 text-sm">
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-900 dark:text-gray-50">{quote.number}</span> ·{' '}
                {quote.customer}
              </p>

              {/* Versiyon diff — inset */}
              <div className="rounded-xl bg-gray-50 dark:bg-gray-950/90/90 p-3 shadow-neo-in">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  Değişiklik özeti
                </h3>
                <p className="mt-2 text-gray-800 dark:text-gray-100">
                  <span className="font-mono text-gray-700 dark:text-gray-200">v1 → {quote.version}</span>
                  <br />
                  {quote.versionNote}
                </p>
              </div>

              <div className="rounded-xl bg-gray-100 dark:bg-gray-900 p-3 shadow-neo-in">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  Versiyon geçmişi
                </h3>
                <ol className="mt-2 space-y-2 text-gray-700 dark:text-gray-200">
                  <li className="flex justify-between gap-2">
                    <span>{quote.version}</span>
                    <span className="text-gray-600 dark:text-gray-300">Güncel</span>
                  </li>
                  <li className="flex justify-between gap-2 text-gray-600 dark:text-gray-300">
                    <span>v1</span>
                    <span>12 Mar 2026</span>
                  </li>
                </ol>
              </div>

              <div className="rounded-xl border border-gray-300/80 dark:border-gray-600/80 bg-gray-50 dark:bg-gray-950/90/80 p-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Rol notu (örnek)</p>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  Onaylayıcı: <strong className="font-medium text-gray-800 dark:text-gray-100">Finans</strong> +{' '}
                  <strong className="font-medium text-gray-800 dark:text-gray-100">Satış müdürü</strong> — çift imza
                  gerekli. Sadece yetkili roller <strong>Onayla</strong> / <strong>Reddet</strong>{' '}
                  görür.
                </p>
              </div>

              {canAct ? (
                <div className="flex flex-col gap-2 pt-2">
                  {/* Ana ekranda tek güçlü primary (Onaya gönder); drawer’da ikisi protrude secondary */}
                  <button
                    type="button"
                    onClick={onApprove}
                    className="w-full rounded-xl bg-gray-100 dark:bg-gray-900 py-3 text-sm font-semibold text-gray-900 dark:text-gray-50 shadow-neo-out-sm transition active:shadow-neo-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900"
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    onClick={onReject}
                    className="w-full rounded-xl bg-gray-100 dark:bg-gray-900 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-neo-out-sm transition active:shadow-neo-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900"
                  >
                    Reddet
                  </button>
                </div>
              ) : (
                <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                  Bu teklif durumu:{' '}
                  <strong className="text-gray-800 dark:text-gray-100">{statusShort(quote.status)}</strong> — onay
                  aksiyonları yalnızca “Onay bekliyor” iken açılır.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">Teklif seçin.</p>
          )}
        </div>
      </aside>
    </div>
  )
}

function statusShort(s: QuoteStatus): string {
  switch (s) {
    case 'taslak':
      return 'Taslak'
    case 'onay_bekliyor':
      return 'Onay bekliyor'
    case 'onayli':
      return 'Onaylı'
    case 'red':
      return 'Red'
  }
}
