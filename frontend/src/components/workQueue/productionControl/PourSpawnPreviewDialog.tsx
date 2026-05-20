import { useI18n } from '../../../i18n/I18nProvider'
import { childOrderRoleLabelKey } from '../../../data/productionWorkOrderFlow'
import {
  resolveWorkQueueName,
  WORK_QUEUE_ORG_SEQUENCE,
  type WorkQueueItem,
  type WorkQueueOrgUnit,
} from '../../../data/workQueueMock'
import { PmStyleDialog } from '../../shared/PmStyleDialog'

type Props = {
  open: boolean
  parent: WorkQueueItem
  previewRows: WorkQueueItem[]
  onConfirm: () => void
  onClose: () => void
  confirming?: boolean
}

const KIND_BADGE: Record<string, string> = {
  pour_order: 'bg-amber-500/15 text-amber-950 ring-amber-500/30 dark:text-amber-100',
  sample_order: 'bg-violet-500/15 text-violet-950 ring-violet-500/30 dark:text-violet-100',
  curing_order: 'bg-cyan-500/15 text-cyan-950 ring-cyan-500/30 dark:text-cyan-100',
}

export function PourSpawnPreviewDialog({
  open,
  parent,
  previewRows,
  onConfirm,
  onClose,
  confirming = false,
}: Props) {
  const { t } = useI18n()

  if (!open) return null

  const unitLabel = (orgId: WorkQueueOrgUnit) => {
    const hit = WORK_QUEUE_ORG_SEQUENCE.find((u) => u.id === orgId)
    return hit ? t(hit.labelKey) : orgId
  }

  return (
    <PmStyleDialog
      title={t('unitWorkQueue.productionFlow.spawnPreviewTitle')}
      subtitle={t('unitWorkQueue.productionFlow.spawnPreviewSubtitle', {
        orderNo: parent.orderNo,
      })}
      closeLabel={t('unitWorkQueue.productionFlow.spawnPreviewCancel')}
      onClose={onClose}
      size="md"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 dark:border-slate-600/60 dark:bg-slate-900/50 dark:text-slate-100"
          >
            {t('unitWorkQueue.productionFlow.spawnPreviewCancel')}
          </button>
          <button
            type="button"
            disabled={confirming}
            onClick={onConfirm}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-45 dark:bg-sky-500 dark:hover:bg-sky-600"
          >
            {t('unitWorkQueue.productionFlow.spawnPreviewConfirm')}
          </button>
        </div>
      }
    >
      <ul className="space-y-3">
        {previewRows.map((row) => (
          <li
            key={row.id}
            className="rounded-xl border border-slate-200/70 bg-white/50 p-3 dark:border-slate-600/50 dark:bg-slate-900/30"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${KIND_BADGE[row.kind] ?? ''}`}
              >
                {t(childOrderRoleLabelKey(row.kind))}
              </span>
              <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">
                {row.orderNo}
              </span>
            </div>
            <dl className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2">
              <PreviewField label={t('unitWorkQueue.productionFlow.spawnPreviewCard.unit')} value={unitLabel(row.targetUnit)} />
              <PreviewField
                label={t('unitWorkQueue.productionFlow.spawnPreviewCard.assignee')}
                value={row.assigneeUserId ? resolveWorkQueueName(row.assigneeUserId) : '—'}
              />
              <PreviewField label={t('unitWorkQueue.productionFlow.spawnPreviewCard.project')} value={`${row.projectName ?? '—'} (${row.projectCode ?? '—'})`} />
              <PreviewField label={t('unitWorkQueue.productionFlow.spawnPreviewCard.product')} value={row.productName ?? parent.title} />
              <PreviewField label={t('unitWorkQueue.productionFlow.spawnPreviewCard.parentOrder')} value={parent.orderNo} />
              <PreviewField label={t('unitWorkQueue.productionFlow.spawnPreviewCard.shift')} value={row.shiftLabel ?? '—'} />
              {row.volumeM3 != null ? (
                <PreviewField label={t('unitWorkQueue.productionFlow.spawnPreviewCard.volume')} value={`${row.volumeM3.toFixed(1)} m³`} />
              ) : null}
              {row.moldName || row.moldId ? (
                <PreviewField label={t('unitWorkQueue.productionFlow.spawnPreviewCard.mold')} value={row.moldName ?? row.moldId ?? '—'} />
              ) : null}
              {row.recipeId ? (
                <PreviewField label={t('unitWorkQueue.productionFlow.spawnPreviewCard.recipe')} value={row.recipeId} />
              ) : null}
            </dl>
          </li>
        ))}
      </ul>
    </PmStyleDialog>
  )
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="truncate font-medium text-slate-800 dark:text-slate-100">{value}</dd>
    </div>
  )
}
