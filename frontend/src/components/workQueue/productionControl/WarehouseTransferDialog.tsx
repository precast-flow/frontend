import { useState } from 'react'
import { useI18n } from '../../../i18n/I18nProvider'
import { getWarehousesForFactory } from '../../../data/productionWarehouseMock'
import type { WorkQueueItem } from '../../../data/workQueueMock'
import { PmStyleDialog } from '../../shared/PmStyleDialog'

type Props = {
  open: boolean
  item: WorkQueueItem
  gl: boolean
  onClose: () => void
  onConfirm: (warehouseId: string) => void
}

export function WarehouseTransferDialog({ open, item, gl, onClose, onConfirm }: Props) {
  const { t } = useI18n()
  const warehouses = getWarehousesForFactory(item.factoryCode)
  const [selectedId, setSelectedId] = useState(warehouses[0]?.id ?? '')

  if (!open) return null

  const selectCls = gl
    ? 'w-full rounded-lg border border-black/15 bg-white/80 px-3 py-2 text-sm text-black dark:border-white/15 dark:bg-slate-900/60 dark:text-white'
    : 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900/50'

  return (
    <PmStyleDialog
      title={t('unitWorkQueue.warehouse.dialogTitle')}
      subtitle={`${item.productName ?? item.title} · ${item.orderNo}`}
      closeLabel={t('unitWorkQueue.close')}
      onClose={onClose}
      variant={gl ? 'glass' : 'default'}
      maxWidthClass="max-w-md"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold dark:border-white/15"
            onClick={onClose}
          >
            {t('unitWorkQueue.nonconformance.cancel')}
          </button>
          <button
            type="button"
            disabled={!selectedId}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-45"
            onClick={() => {
              if (selectedId) onConfirm(selectedId)
            }}
          >
            {t('unitWorkQueue.warehouse.confirm')}
          </button>
        </div>
      }
    >
      <div className="space-y-3 text-left">
        <p className="text-sm text-black/70 dark:text-white/75">
          {t('unitWorkQueue.warehouse.dialogHint')}
        </p>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-black/70 dark:text-white/75">
            {t('unitWorkQueue.warehouse.selectLabel')}
          </span>
          <select
            className={selectCls}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </PmStyleDialog>
  )
}
