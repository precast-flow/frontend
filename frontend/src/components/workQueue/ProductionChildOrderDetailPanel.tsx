import { useI18n } from '../../i18n/I18nProvider'
import { childOrderRoleLabelKey } from '../../data/productionWorkOrderFlow'
import { resolveWorkQueueName, WORK_QUEUE_ORG_SEQUENCE, type WorkQueueItem } from '../../data/workQueueMock'
import { splitDetailPanelBodyClass } from '../shared/splitModuleStyles'

type Props = {
  item: WorkQueueItem
  gl: boolean
}

export function ProductionChildOrderDetailPanel({ item, gl }: Props) {
  const { t } = useI18n()

  const cardCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  const unitLabel = (orgId: WorkQueueItem['targetUnit']) => {
    const hit = WORK_QUEUE_ORG_SEQUENCE.find((u) => u.id === orgId)
    return hit ? t(hit.labelKey) : orgId
  }

  const hintKey =
    item.kind === 'pour_order'
      ? 'unitWorkQueue.productionFlow.child.pourHint'
      : 'unitWorkQueue.productionFlow.child.sampleHint'

  return (
    <div className={`${splitDetailPanelBodyClass} space-y-4 pb-4`}>
      <div className={cardCls}>
        <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
          {t(childOrderRoleLabelKey(item.kind))}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-black/80 dark:text-white/85">{item.detailBody}</p>
      </div>

      <dl className={`${cardCls} grid gap-3 sm:grid-cols-2`}>
        <div>
          <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.assigneePerson')}</dt>
          <dd className="font-medium text-black dark:text-white">
            {item.assigneeUserId ? resolveWorkQueueName(item.assigneeUserId) : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.colTargetUnit')}</dt>
          <dd className="font-medium text-black dark:text-white">{unitLabel(item.targetUnit)}</dd>
        </div>
        {item.sourceProductionOrderNo ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-black/55 dark:text-white/60">
              {t('unitWorkQueue.productionFlow.spawnParentRef')}
            </dt>
            <dd className="font-mono font-medium text-black dark:text-white">{item.sourceProductionOrderNo}</dd>
          </div>
        ) : null}
        {item.productName ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-black/55 dark:text-white/60">
              {t('unitWorkQueue.productionFlow.document.productName')}
            </dt>
            <dd className="font-medium text-black dark:text-white">{item.productName}</dd>
          </div>
        ) : null}
      </dl>

      <p className="text-center text-xs text-black/55 dark:text-white/60">{t(hintKey)}</p>
    </div>
  )
}
