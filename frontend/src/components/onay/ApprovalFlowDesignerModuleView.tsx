import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { PROCESS_TYPES } from '../../data/mockApprovalFlow'
import { useI18n } from '../../i18n/I18nProvider'
import { PmStyleDialog } from '../shared/PmStyleDialog'
import {
  eiSplitHeaderButtonPassive,
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import {
  ApprovalFlowDesignerEditorSection,
  ApprovalFlowDesignerPreviewPanel,
} from './ApprovalFlowDesignerSections'
import type { ApprovalFlowDesignerState } from './useApprovalFlowDesignerState'

export function ApprovalFlowDesignerModuleView(props: ApprovalFlowDesignerState) {
  const { t } = useI18n()
  const rightRef = useRef<HTMLDivElement | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const { templates, editingId, openTemplate, resetToNewDraft, removeTemplate } = props

  const scrollPanelTop = () => {
    requestAnimationFrame(() => rightRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const requestDelete = (id: string) => {
    const tpl = templates.find((x) => x.id === id)
    if (!tpl) return
    setDeleteTarget({ id, name: tpl.name })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    removeTemplate(deleteTarget.id)
    setDeleteTarget(null)
  }

  const visibleTemplates = useMemo(() => {
    const q = listSearch.trim().toLocaleLowerCase('tr-TR')
    if (!q) return templates
    return templates.filter((tpl) => {
      const proc = PROCESS_TYPES.find((p) => p.id === tpl.processTypeId)?.label ?? tpl.processTypeId
      const hay = `${tpl.name} ${proc}`.toLocaleLowerCase('tr-TR')
      return hay.includes(q)
    })
  }, [listSearch, templates])

  return (
    <>
      <ElementIdentityPieceCodesLikeSplit
        persistKey="approval-flow-designer"
        listTitle={t('approvalFlowDesigner.listTitle')}
        filterToolbarSearch={
          <FilterToolbarSearch
            id="approval-flow-list-search"
            value={listSearch}
            onValueChange={setListSearch}
            placeholder={t('approvalFlowDesigner.listSearchPh')}
            ariaLabel={t('approvalFlowDesigner.listSearchAria')}
          />
        }
        headerActions={
          <Link to="/onay-akisi?legacy=1" className={`${eiSplitHeaderButtonPassive} no-underline`}>
            {t('approvalFlowDesigner.legacyLink')}
          </Link>
        }
        isFilterOpen={filterOpen}
        onFilterOpenChange={setFilterOpen}
        filterAside={
          <div>
            <ElementIdentityFilterSheetHeader
              title={t('approvalFlowDesigner.filtersTitle')}
              subtitle={t('approvalFlowDesigner.filtersSubtitle')}
              onClose={() => setFilterOpen(false)}
            />
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{t('approvalFlowDesigner.filterBody')}</p>
            <label className="mt-3 block">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t('approvalFlowDesigner.listSearchLabel')}</span>
              <input
                type="search"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder={t('approvalFlowDesigner.listSearchPh')}
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>
          </div>
        }
        listBody={
          <>
            <li>
              <button
                type="button"
                onClick={() => {
                  resetToNewDraft()
                  scrollPanelTop()
                }}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-sky-300/60 bg-sky-50/40 px-2.5 py-2 text-left text-xs font-semibold text-sky-900 transition hover:bg-sky-100/50 dark:border-sky-700/40 dark:bg-sky-950/25 dark:text-sky-100 dark:hover:bg-sky-950/40"
              >
                <Plus className="size-3.5 shrink-0" aria-hidden />
                {t('approvalFlowDesigner.newTemplate')}
              </button>
            </li>
            {visibleTemplates.map((tpl) => {
              const active = editingId === tpl.id
              return (
                <li key={tpl.id}>
                  <div
                    className={`flex items-stretch gap-1 rounded-lg border transition ${
                      active
                        ? 'border-sky-400/60 bg-sky-500/10 dark:border-sky-500/40 dark:bg-sky-500/15'
                        : 'border-slate-200/50 bg-white/40 dark:border-slate-700/50 dark:bg-slate-900/30'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        openTemplate(tpl)
                        scrollPanelTop()
                      }}
                      className="flex min-w-0 flex-1 flex-col gap-0.5 px-2 py-2 text-left text-xs hover:bg-white/50 dark:hover:bg-slate-900/50"
                    >
                      <span className="truncate font-semibold text-slate-900 dark:text-slate-50">{tpl.name}</span>
                      <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                        {PROCESS_TYPES.find((p) => p.id === tpl.processTypeId)?.label ?? tpl.processTypeId} · {tpl.steps.length}{' '}
                        {t('approvalFlowDesigner.stepWord')}
                      </span>
                    </button>
                    <button
                      type="button"
                      title={t('approvalFlowDesigner.deleteTitle')}
                      aria-label={t('approvalFlowDesigner.deleteTitle')}
                      onClick={() => requestDelete(tpl.id)}
                      className="shrink-0 rounded-r-md px-2 text-rose-700 hover:bg-rose-50/80 dark:text-rose-300 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden />
                    </button>
                  </div>
                </li>
              )
            })}
          </>
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-600 dark:text-slate-300">
            <p>
              <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">{templates.length}</span>{' '}
              {t('approvalFlowDesigner.footerTemplates')}
            </p>
          </div>
        }
        rightPanelRef={rightRef}
        rightAside={
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <p className="mb-2 shrink-0 px-0.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 sm:px-1">
              {t('approvalFlowDesigner.intro')}
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 pb-2 sm:px-1">
              <div className="flex flex-col gap-4">
                <ApprovalFlowDesignerEditorSection variant="liquid" {...props} />
                <ApprovalFlowDesignerPreviewPanel variant="liquid" previewLabels={props.previewLabels} steps={props.steps} />
              </div>
            </div>
          </div>
        }
      />

      {deleteTarget ? (
        <PmStyleDialog
          title={t('approvalFlowDesigner.dialogDeleteTitle')}
          subtitle={t('approvalFlowDesigner.dialogDeleteSubtitle')}
          closeLabel={t('approvalFlowDesigner.cancel')}
          onClose={() => setDeleteTarget(null)}
          footer={
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 dark:border-slate-600 dark:text-slate-200"
              >
                {t('approvalFlowDesigner.cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg border border-rose-300 bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 dark:border-rose-700 dark:bg-rose-700"
              >
                {t('approvalFlowDesigner.confirmDelete')}
              </button>
            </div>
          }
        >
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {t('approvalFlowDesigner.dialogDeleteBody').replace('{{name}}', deleteTarget.name)}
          </p>
        </PmStyleDialog>
      ) : null}
    </>
  )
}
