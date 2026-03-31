import { X } from 'lucide-react'
import type { MockFactory } from '../data/mockFactories'

type Props = {
  open: boolean
  factory: MockFactory
  onClose: () => void
}

/**
 * P1 — Fabrika özeti drawer (adres, vardiya, sorumlu mock)
 * `gm-glass-drawer-root`: üst menü altı + sağ kenar kabuk ile hizalı (GlassAppShell).
 */
export function FactorySummaryDrawer({ open, factory, onClose }: Props) {
  if (!open) return null

  return (
    <div className="gm-glass-drawer-root fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="gm-glass-drawer-backdrop absolute inset-0 z-0 cursor-default border-0 p-0"
        aria-label="Paneli kapat"
        onClick={onClose}
      />
      <aside
        className="gm-glass-drawer-panel relative z-10 flex h-full min-h-0 w-full max-w-md flex-col overflow-hidden rounded-3xl border border-gray-200/90 bg-gray-100 p-6 shadow-neo-out dark:border-gray-700 dark:bg-gray-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="factory-drawer-title"
      >
        <div className="shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Fabrika özeti
              </p>
              <h2
                id="factory-drawer-title"
                className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50"
              >
                {factory.name}
              </h2>
              <p className="mt-0.5 font-mono text-sm text-gray-600 dark:text-gray-300">
                {factory.code} · {factory.city}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white"
              aria-label="Kapat"
            >
              <X className="size-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
          <dl className="space-y-4 text-sm">
            <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Adres
              </dt>
              <dd className="mt-1.5 leading-relaxed text-gray-800 dark:text-gray-100">
                {factory.address}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Vardiya (mock)
                </dt>
                <dd className="mt-1.5 text-lg font-semibold tabular-nums text-gray-900 dark:text-gray-50">
                  {factory.shiftCount}
                </dd>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Durum
                </dt>
                <dd className="mt-1.5 text-gray-800 dark:text-gray-100">
                  {factory.active ? 'Aktif' : 'Pasif'}
                </dd>
              </div>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-out-sm dark:bg-gray-950/80">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Saha / tesis sorumlusu (mock)
              </dt>
              <dd className="mt-1.5 font-medium text-gray-900 dark:text-gray-50">
                {factory.siteManager}
              </dd>
            </div>
          </dl>
        </div>

        <p className="shrink-0 pt-6 text-xs text-gray-500 dark:text-gray-400">
          Bu panel gerçek ERP verisi taşımaz; Adım 11 MVP prototip alanıdır.
        </p>
      </aside>
    </div>
  )
}
