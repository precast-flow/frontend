import { useRef, useState } from 'react'
import { LayoutGrid, Pencil, Plus, Redo2, Undo2 } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useDashboard } from '../../context/DashboardContext'
import { DashboardBoardMenu } from './DashboardBoardMenu'
import { dashBtnIcon, dashBtnPrimary, dashBtnSecondary } from './dashboardButtons'

export function DashboardToolbar() {
  const { t } = useI18n()
  const {
    editMode,
    setEditMode,
    setCatalogOpen,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDashboard()
  const boardMenuRef = useRef<HTMLButtonElement>(null)
  const [boardMenuOpen, setBoardMenuOpen] = useState(false)

  if (!editMode) {
    return (
      <div className="pointer-events-none absolute right-3 top-3 z-30">
        <button
          type="button"
          className={`${dashBtnIcon} dash-edit-toolbar pointer-events-auto !size-9`}
          aria-label={t('dashboard.toolbar.edit')}
          title={t('dashboard.toolbar.edit')}
          onClick={() => setEditMode(true)}
        >
          <Pencil className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="pointer-events-none absolute right-3 top-3 z-30 flex flex-wrap items-center justify-end gap-1.5">
        <div className="dash-edit-toolbar pointer-events-auto flex flex-wrap items-center gap-1 rounded-xl p-1">
          <button
            type="button"
            className={`${dashBtnIcon} !size-8`}
            disabled={!canUndo}
            aria-label={t('dashboard.toolbar.undo')}
            title={t('dashboard.toolbar.undoHint')}
            onClick={() => undo()}
          >
            <Undo2 className="size-4" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            className={`${dashBtnIcon} !size-8`}
            disabled={!canRedo}
            aria-label={t('dashboard.toolbar.redo')}
            title={t('dashboard.toolbar.redoHint')}
            onClick={() => redo()}
          >
            <Redo2 className="size-4" strokeWidth={2} aria-hidden />
          </button>
          <span className="mx-0.5 hidden h-6 w-px bg-slate-200/80 sm:block dark:bg-white/12" aria-hidden />
          <button type="button" className={dashBtnSecondary} onClick={() => setCatalogOpen(true)}>
            <Plus className="size-3.5 shrink-0" aria-hidden />
            <span>{t('dashboard.toolbar.addWidget')}</span>
          </button>
          <button
            ref={boardMenuRef}
            type="button"
            className={dashBtnSecondary}
            aria-expanded={boardMenuOpen}
            onClick={() => setBoardMenuOpen((v) => !v)}
          >
            <LayoutGrid className="size-3.5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{t('dashboard.menu.boards')}</span>
          </button>
          <button
            type="button"
            className={dashBtnPrimary}
            onClick={() => {
              setEditMode(false)
              setCatalogOpen(false)
            }}
          >
            {t('dashboard.toolbar.done')}
          </button>
        </div>
      </div>
      <DashboardBoardMenu
        open={boardMenuOpen}
        onOpenChange={setBoardMenuOpen}
        triggerRef={boardMenuRef}
      />
    </>
  )
}
