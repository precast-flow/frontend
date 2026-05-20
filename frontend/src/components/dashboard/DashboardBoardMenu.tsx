import { useEffect, useId, useRef, useState } from 'react'
import { Check, Copy, Plus, Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useDashboard } from '../../context/DashboardContext'
import { TopNavMenuPortal } from '../TopNavMenuPortal'
import { dashBtnIcon, dashBtnPrimary } from './dashboardButtons'
import { DASHBOARD_TEMPLATES, type DashboardTemplateId } from './dashboardDefaults'

const menuBtnClass =
  'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition hover:bg-slate-100/90 dark:hover:bg-white/10'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

export function DashboardBoardMenu({ open, onOpenChange, triggerRef }: Props) {
  const { t } = useI18n()
  const menuId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [templateId, setTemplateId] = useState<DashboardTemplateId>('default')

  const { dashboards, activeDashboardId, selectDashboard, duplicateDashboard, deleteDashboard, addDashboardFromTemplate } =
    useDashboard()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return
      onOpenChange(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange, triggerRef])

  const close = () => onOpenChange(false)

  return (
    <TopNavMenuPortal
      open={open}
      anchorRef={triggerRef}
      panelRef={panelRef}
      id={`${menuId}-panel`}
      labelledBy={`${menuId}-trigger`}
      align="end"
      className="gm-glass-dropdown-panel gm-glass-context-menu-panel w-[min(100vw-1.5rem,17.5rem)] rounded-xl p-1.5 shadow-lg"
    >
      <p className="px-2.5 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--glass-text-muted)]">
        {t('dashboard.menu.boards')}
      </p>
      <ul className="max-h-[9.5rem] space-y-0.5 overflow-y-auto overscroll-y-auto px-0.5" role="group">
        {dashboards.map((d) => {
          const active = d.id === activeDashboardId
          const canDelete = dashboards.length > 1
          return (
            <li key={d.id} className="flex items-center gap-0.5">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={[
                  'min-w-0 flex-1 truncate rounded-lg px-2.5 py-1.5 text-left text-xs transition',
                  active
                    ? 'bg-sky-500/12 font-semibold text-sky-900 ring-1 ring-sky-500/20 dark:text-sky-100'
                    : 'hover:bg-slate-100/90 dark:hover:bg-white/10',
                ].join(' ')}
                onClick={() => {
                  selectDashboard(d.id)
                  close()
                }}
              >
                <span className="flex items-center gap-1.5">
                  {active ? <Check className="size-3 shrink-0 text-sky-600 dark:text-cyan-400" /> : null}
                  <span className="truncate">{d.name}</span>
                </span>
              </button>
              <button
                type="button"
                className={`${dashBtnIcon} !size-7 border-0 shadow-none hover:text-red-600`}
                disabled={!canDelete}
                aria-label={t('dashboard.toolbar.deleteBoard')}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteDashboard(d.id)
                  if (dashboards.length <= 2) close()
                }}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>

      <div className="my-1 border-t border-slate-200/60 dark:border-white/10" role="separator" />

      <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--glass-text-muted)]">
        {t('dashboard.menu.template')}
      </p>
      <div className="flex items-center gap-1 px-0.5">
        <select
          className="min-w-0 flex-1 rounded-lg border border-slate-200/70 bg-white/60 px-2 py-1.5 text-xs font-medium dark:border-white/10 dark:bg-white/5"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value as DashboardTemplateId)}
          aria-label={t('dashboard.menu.template')}
        >
          {DASHBOARD_TEMPLATES.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {t(tpl.nameKey)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`${dashBtnPrimary} !px-2 !py-1.5`}
          aria-label={t('dashboard.menu.createFromTemplate')}
          onClick={() => {
            addDashboardFromTemplate(templateId)
            close()
          }}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>

      <div className="my-1 border-t border-slate-200/60 dark:border-white/10" role="separator" />

      <button
        type="button"
        role="menuitem"
        className={menuBtnClass}
        onClick={() => {
          duplicateDashboard(activeDashboardId)
          close()
        }}
      >
        <Copy className="size-3.5 shrink-0 opacity-70" aria-hidden />
        {t('dashboard.toolbar.duplicate')}
      </button>
    </TopNavMenuPortal>
  )
}
