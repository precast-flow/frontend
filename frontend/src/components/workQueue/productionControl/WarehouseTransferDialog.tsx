import { useState } from 'react'
import { useI18n } from '../../../i18n/I18nProvider'
import { getWarehousesForFactory } from '../../../data/productionWarehouseMock'
import type { WorkQueueItem } from '../../../data/workQueueMock'
import { appDialogInputClass, PmStyleDialog, AppDialogButton } from '../../shared/PmStyleDialog'

type Props = {
  open: boolean
  item: WorkQueueItem
  gl: boolean
  onClose: () => void
  onConfirm: (warehouseId: string) => void
}

export function WarehouseTransferDialog({ open, item, gl: _gl, onClose, onConfirm }: Props) {
  const { t } = useI18n()
  const warehouses = getWarehousesForFactory(item.factoryCode)
  const [selectedId, setSelectedId] = useState(warehouses[0]?.id ?? '')

  if (!open) return null

  const selectCls = appDialogInputClass

  return (
    <PmStyleDialog
      open={open}
      title={t('unitWorkQueue.warehouse.dialogTitle')}
      subtitle={`${item.productName ?? item.title} · ${item.orderNo}`}
      closeLabel={t('unitWorkQueue.close')}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <AppDialogButton variant="secondary" onClick={onClose}>
            {t('unitWorkQueue.nonconformance.cancel')}
          </AppDialogButton>
          <AppDialogButton
            variant="primary"
            disabled={!selectedId}
            onClick={() => {
              if (selectedId) onConfirm(selectedId)
            }}
          >
            {t('unitWorkQueue.warehouse.confirm')}
          </AppDialogButton>
        </>
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
