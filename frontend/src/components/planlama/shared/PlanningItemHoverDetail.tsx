import { useLayoutEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { STATUS_META } from '../../../data/planningDesignMock'
import {
  PLANNING_PRODUCTION_STAGE_META,
  type PlanningProductionStage,
} from '../../../data/planningProductionStage'
import type { PlanningItemHoverPayload } from './planningItemDetail'

type Props = {
  anchorRef: RefObject<HTMLElement | null>
  panelRef?: RefObject<HTMLDivElement | null>
  open: boolean
  payload: PlanningItemHoverPayload | null
  onClose?: () => void
  /** Click-opened detail: panel receives pointer events and shows close control. */
  interactive?: boolean
}

function stageLabel(t: (k: string) => string, stage?: PlanningProductionStage): string | null {
  if (!stage) return null
  return t(PLANNING_PRODUCTION_STAGE_META[stage].labelKey)
}

export function PlanningItemHoverDetail({
  anchorRef,
  panelRef,
  open,
  payload,
  onClose,
  interactive = false,
}: Props) {
  const { t } = useI18n()
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' })

  useLayoutEffect(() => {
    if (!open || !payload) return

    const update = () => {
      const el = anchorRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const boxW = 280
      const margin = 8
      let left = rect.left + rect.width / 2 - boxW / 2
      left = Math.max(margin, Math.min(left, window.innerWidth - boxW - margin))

      const spaceAbove = rect.top
      const showAbove = spaceAbove > 120
      const top = showAbove ? rect.top - margin : rect.bottom + margin

      setStyle({
        position: 'fixed',
        top: showAbove ? top : top,
        left,
        width: boxW,
        transform: showAbove ? 'translateY(-100%)' : 'none',
        zIndex: 10000,
        visibility: 'visible',
      })
    }

    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, payload, anchorRef])

  if (!open || !payload) return null

  const statusLabel = STATUS_META[payload.statusKey]?.label ?? payload.statusKey
  const prodStage = stageLabel(t, payload.productionStage)

  const rows: { label: string; value: string }[] = [
    { label: t('planning.hover.productCode'), value: payload.productCode },
    { label: t('planning.hover.productName'), value: payload.productName },
  ]
  if (payload.projectName) {
    rows.push({ label: t('planning.hover.project'), value: payload.projectName })
  }
  rows.push({ label: t('planning.hover.planDate'), value: payload.planDate })
  if (payload.shiftLabel) {
    rows.push({ label: t('planning.hover.shift'), value: payload.shiftLabel })
  }
  rows.push({ label: t('planning.hover.status'), value: statusLabel })
  if (prodStage) {
    rows.push({ label: t('planning.hover.stage'), value: prodStage })
  }
  if (payload.dispatchInfo) {
    rows.push({ label: t('planning.hover.dispatch'), value: payload.dispatchInfo })
  }
  if (payload.moldId && payload.unit !== 'dispatch') {
    rows.push({ label: t('planning.hover.mold'), value: payload.moldId })
  }
  if (payload.orderId) {
    rows.push({ label: t('planning.hover.order'), value: payload.orderId })
  }
  if (payload.volumeM3 != null) {
    rows.push({
      label: t('planning.hover.volume'),
      value: `${payload.volumeM3} m³`,
    })
  }

  return createPortal(
    <div
      ref={panelRef}
      className={[
        'rounded-xl border border-slate-200/90 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-sm dark:border-slate-600/70 dark:bg-slate-900/95',
        interactive ? 'pointer-events-auto' : 'pointer-events-none',
      ].join(' ')}
      style={style}
      role={interactive ? 'dialog' : 'tooltip'}
      aria-modal={interactive ? true : undefined}
    >
      {interactive && onClose ? (
        <div className="mb-2 flex items-start justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-6 items-center justify-center rounded-md border border-slate-200/80 text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={t('planning.hover.close')}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : null}
      {payload.groupProducts && payload.groupProducts.length > 1 ? (
        <>
          <p className="mb-2 font-semibold text-slate-900 dark:text-slate-50">
            {t('planning.hover.groupTitle', { count: String(payload.groupProducts.length) })}
          </p>
          <ul className="max-h-40 space-y-1 overflow-y-auto">
            {payload.groupProducts.map((p) => (
              <li
                key={p.code}
                className="truncate text-[11px] text-slate-700 dark:text-slate-300"
              >
                <span className="font-medium text-slate-900 dark:text-slate-100">{p.code}</span>
                {' · '}
                {p.name}
              </li>
            ))}
          </ul>
          {payload.dispatchInfo ? (
            <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
              {t('planning.hover.dispatch')}: {payload.dispatchInfo}
            </p>
          ) : null}
        </>
      ) : (
        <dl className="space-y-1.5">
          {rows.map((row) => (
            <div key={row.label} className="flex gap-2">
              <dt className="w-24 shrink-0 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {row.label}
              </dt>
              <dd className="min-w-0 flex-1 truncate font-medium text-slate-800 dark:text-slate-100">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>,
    document.body,
  )
}
