import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useQualityManagement } from '../../context/QualityManagementContext'
import { useWorkQueue } from '../../context/WorkQueueContext'
import { splitDetailPanelBodyClass } from '../shared/splitModuleStyles'
import type { WorkQueueItem } from '../../data/workQueueMock'
import { ConcreteActionDialog } from './productionControl/ConcreteActionDialog'
import { WorkOrderListProgress } from './WorkOrderListProgress'

type Props = {
  item: WorkQueueItem
  gl: boolean
}

function recipeLabel(recipeId?: string): string {
  if (!recipeId) return '—'
  return recipeId.replace(/^RC-/, '').replace(/-/g, ' ')
}

export function PourOrderDetailPanel({ item, gl }: Props) {
  const { t } = useI18n()
  const { getPourFlowState, approvePourOrder, reportPourDelay, cancelPourOrder } = useWorkQueue()
  const { isRecipePublished, findRecipe } = useQualityManagement()
  const flow = getPourFlowState(item.id)
  const recipePublished = item.recipeId ? isRecipePublished(item.recipeId) : true
  const recipe = item.recipeId ? findRecipe(item.recipeId) : undefined
  const [dialog, setDialog] = useState<'delay' | 'cancel' | null>(null)

  const cardCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 text-left dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 text-left dark:border-slate-600/60 dark:bg-slate-900/40'

  const primaryBtn =
    'rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-45'

  const canAct = flow.status === 'beklemede' && recipePublished

  return (
    <div className={`${splitDetailPanelBodyClass} space-y-4 pb-4`}>
      <div className="flex items-start justify-between gap-3">
        <WorkOrderListProgress item={item} compact={false} />
      </div>

      <dl className={`${cardCls} grid gap-3 sm:grid-cols-2`}>
        <div>
          <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.pour.volume')}</dt>
          <dd className="font-medium text-black dark:text-white">
            {item.volumeM3 != null ? `${item.volumeM3} m³` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.pour.recipe')}</dt>
          <dd className="font-medium text-black dark:text-white">
            {recipe?.recipeCode ?? recipeLabel(item.recipeId)}
            {recipe?.status === 'published' ? (
              <span className="ms-2 text-xs text-emerald-700 dark:text-emerald-300">
                ({t('qualityRecipe.publishedBadge')})
              </span>
            ) : null}
          </dd>
          {!recipePublished && item.recipeId ? (
            <p className="mt-1 text-xs font-medium text-amber-800 dark:text-amber-200">
              {t('qualityRecipe.notPublishedWarning')}
            </p>
          ) : null}
        </div>
        <div>
          <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.pour.mold')}</dt>
          <dd className="font-medium text-black dark:text-white">{item.moldName ?? item.moldId ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.productionFlow.document.productCode')}</dt>
          <dd className="font-mono text-sm text-black dark:text-white">{item.productCode ?? '—'}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-black/55 dark:text-white/60">{t('unitWorkQueue.productionFlow.document.productName')}</dt>
          <dd className="font-medium text-black dark:text-white">{item.productName ?? item.title}</dd>
        </div>
      </dl>

      {flow.note ? (
        <p className="rounded-lg bg-amber-500/12 px-3 py-2 text-xs font-medium text-amber-950 dark:text-amber-100">
          {flow.note}
        </p>
      ) : null}

      {flow.status === 'beklemede' && !recipePublished && item.recipeId ? (
        <p className="rounded-lg bg-rose-500/12 px-3 py-2 text-xs font-medium text-rose-950 dark:text-rose-100">
          {t('qualityRecipe.approveBlocked')}
        </p>
      ) : null}

      {canAct ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={primaryBtn} onClick={() => approvePourOrder(item)}>
            {t('unitWorkQueue.pour.approve')}
          </button>
          <button
            type="button"
            className="rounded-lg border border-amber-400/60 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-950 dark:text-amber-100"
            onClick={() => setDialog('delay')}
          >
            {t('unitWorkQueue.pour.reportDelay')}
          </button>
          <button
            type="button"
            className="rounded-lg border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-900 dark:text-red-100"
            onClick={() => setDialog('cancel')}
          >
            {t('unitWorkQueue.pour.cancel')}
          </button>
        </div>
      ) : null}

      <ConcreteActionDialog
        open={dialog === 'delay'}
        kind="delay"
        title={t('unitWorkQueue.pour.delayDialogTitle')}
        subtitle={t('unitWorkQueue.pour.delayDialogSubtitle')}
        noteLabel={t('unitWorkQueue.pour.noteLabel')}
        noteRequiredHint={t('unitWorkQueue.pour.noteRequired')}
        confirmLabel={t('unitWorkQueue.pour.delayConfirm')}
        cancelLabel={t('planningActions.cancel')}
        closeLabel={t('common.close')}
        onClose={() => setDialog(null)}
        onConfirm={(note) => reportPourDelay(item, note)}
      />
      <ConcreteActionDialog
        open={dialog === 'cancel'}
        kind="cancel"
        title={t('unitWorkQueue.pour.cancelDialogTitle')}
        subtitle={t('unitWorkQueue.pour.cancelDialogSubtitle')}
        noteLabel={t('unitWorkQueue.pour.noteLabel')}
        noteRequiredHint={t('unitWorkQueue.pour.noteRequired')}
        confirmLabel={t('unitWorkQueue.pour.cancelConfirm')}
        cancelLabel={t('planningActions.cancel')}
        closeLabel={t('common.close')}
        onClose={() => setDialog(null)}
        onConfirm={(note) => cancelPourOrder(item, note)}
      />
    </div>
  )
}
