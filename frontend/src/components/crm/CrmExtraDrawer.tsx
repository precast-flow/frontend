import { X } from 'lucide-react'
import type { CrmCustomer } from '../../data/crmCustomers'

type Props = {
  open: boolean
  customer: CrmCustomer | null
  onClose: () => void
}

export function CrmExtraDrawer({ open, customer, onClose }: Props) {
  if (!open) return null

  return (
    <div className="gm-glass-drawer-root fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="gm-glass-drawer-backdrop absolute inset-0 border-0 p-0"
        aria-label="Paneli kapat"
        onClick={onClose}
      />
      <aside
        className="gm-glass-drawer-panel relative z-10 flex h-full min-h-0 w-full max-w-md flex-col overflow-hidden rounded-l-3xl border-l border-gray-200/90 bg-gray-100 p-5 shadow-neo-out dark:border-gray-700 dark:bg-gray-900 md:m-3 md:rounded-3xl md:border"
        aria-label="Ek alanlar"
      >
        <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">Ek kolonlar</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 shadow-neo-out-sm hover:text-gray-900 dark:text-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {customer ? (
            <dl className="space-y-3 text-sm">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-950/90/90 p-3 shadow-neo-in">
                <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Vergi no</dt>
                <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">{customer.taxId}</dd>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-950/90/90 p-3 shadow-neo-in">
                <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Oluşturulma</dt>
                <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">{customer.createdAt}</dd>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-950/90/90 p-3 shadow-neo-in">
                <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Atanan satış</dt>
                <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">{customer.owner}</dd>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-950/90/90 p-3 shadow-neo-in">
                <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Şehir</dt>
                <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">{customer.city}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">Önce listeden müşteri seçin.</p>
          )}
        </div>
      </aside>
    </div>
  )
}
