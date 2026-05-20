import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useDashboard } from '../../context/DashboardContext'
import { dashBtnIcon } from './dashboardButtons'
import type { WidgetInstance } from './types'
import { WidgetContent, widgetTitle } from './WidgetContent'

type Props = {
  widget: WidgetInstance
  onModuleNavigate?: (id: string) => void
}

function shouldShowHeader(widget: WidgetInstance): boolean {
  if (widget.type === 'text' || widget.type === 'markdown') return false
  return widget.settings.showHeader === true
}

export function WidgetFrame({ widget, onModuleNavigate }: Props) {
  const { t } = useI18n()
  const { editMode, removeWidget, setSettingsWidgetId } = useDashboard()
  const showHeader = shouldShowHeader(widget)
  const title = widgetTitle(widget, t)

  return (
    <div
      className={[
        'dash-widget-shell gm-glass-panel-l3 relative flex h-full min-h-0 flex-col overflow-hidden',
        editMode ? 'dash-widget-shell--edit' : '',
      ].join(' ')}
    >
      {editMode ? (
        <>
          <div
            className="dash-drag dash-widget-drag-bar absolute inset-x-0 top-0 z-10 flex items-center justify-center"
            title={t('dashboard.editHint')}
          >
            <GripVertical className="size-3 text-slate-400 dark:text-slate-500" aria-hidden />
          </div>
          <div className="absolute right-1 top-0.5 z-20 flex items-center gap-0.5">
            <button
              type="button"
              className={`${dashBtnIcon} !size-7 !border-0 !bg-transparent !shadow-none`}
              aria-label={t('dashboard.widget.settings')}
              onClick={() => setSettingsWidgetId(widget.id)}
            >
              <Pencil className="size-3.5" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              className={`${dashBtnIcon} dash-widget-delete !size-7 !border-0 !bg-transparent !shadow-none text-red-600 hover:!bg-red-50 dark:text-red-400 dark:hover:!bg-red-500/10`}
              aria-label={t('dashboard.widget.remove')}
              onClick={(e) => {
                e.stopPropagation()
                removeWidget(widget.id)
              }}
            >
              <Trash2 className="size-3.5" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </>
      ) : null}

      {showHeader ? (
        <header
          className={[
            'flex shrink-0 items-center gap-1.5 border-b border-slate-200/50 px-3 py-2 dark:border-white/8',
            editMode ? 'mt-6' : '',
          ].join(' ')}
        >
          <h3 className="dash-widget-title min-w-0 flex-1 truncate">{title}</h3>
        </header>
      ) : null}

      <div
        className={[
          'min-h-0 flex-1 overflow-hidden p-3',
          editMode && !showHeader ? 'pt-7' : '',
        ].join(' ')}
      >
        <WidgetContent widget={widget} onModuleNavigate={onModuleNavigate} />
      </div>
    </div>
  )
}
