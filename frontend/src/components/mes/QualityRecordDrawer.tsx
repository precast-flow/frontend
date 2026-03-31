import { useEffect, useId } from 'react'
import { X } from 'lucide-react'
import type { WorkOrder } from '../../data/mesMock'
import { QualityInspectionPanel } from '../kalite/QualityInspectionPanel'

type Props = {
  open: boolean
  workOrder: WorkOrder | null
  onClose: () => void
  onApprove: () => void
  onRejectClick: () => void
}

export function QualityRecordDrawer({ open, workOrder, onClose, onApprove, onRejectClick }: Props) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !workOrder) return null

  const canAct = workOrder.status === 'kalite_bekliyor'

  return (
    <div className="gm-glass-drawer-root fixed inset-0 z-[75] flex justify-end">
      <button
        type="button"
        className="gm-glass-drawer-backdrop absolute inset-0 border-0 p-0"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="gm-glass-drawer-panel relative z-10 flex h-full min-h-0 w-full max-w-md flex-col overflow-hidden bg-gray-100 shadow-neo-out dark:bg-gray-900 sm:max-w-lg"
      >
        <div className="flex items-start justify-between gap-2 border-b border-gray-200/90 px-4 py-4 dark:border-gray-700/90">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              Kalite kaydı
            </h2>
            <p className="mt-1 font-mono text-sm text-gray-800 dark:text-gray-100">{workOrder.code}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {workOrder.element} · {workOrder.project}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 shadow-neo-out-sm hover:text-gray-900 dark:text-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <QualityInspectionPanel
            workOrder={workOrder}
            readOnly={!canAct}
            showActions={canAct}
            onApprove={() => {
              onApprove()
              onClose()
            }}
            onRejectClick={onRejectClick}
          />
        </div>
      </div>
    </div>
  )
}
