import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { PROCESS_TYPES } from '../../data/mockApprovalFlow'
import { activeModuleIdFromPathname } from '../../data/navigation'
import { useI18n } from '../../i18n/I18nProvider'
import { useThemeMode } from '../../theme/ThemeProvider'
import {
  eiSplitHeaderButtonPassive,
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import { PmStyleDialog } from '../shared/PmStyleDialog'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'
import {
  ApprovalFlowDesignerEditorSection,
  ApprovalFlowDesignerPreviewPanel,
} from './ApprovalFlowDesignerSections'
import type { ApprovalFlowDesignerState } from './useApprovalFlowDesignerState'

const inputCls =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none ring-sky-300/50 focus:ring-2 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'

function tabPill(active: boolean) {
  return [
    'shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
    active
      ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
      : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100',
  ].join(' ')
}

type RightDetailTabId = 'tasarim' | 'onizleme'

export function ApprovalFlowDesignerModuleView(props: ApprovalFlowDesignerState) {
  const { t } = useI18n()
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const location = useLocation()
  const neutralShell = activeModuleIdFromPathname(location.pathname) === 'approval-flow'
  const rightScrollRef = useRef<HTMLDivElement | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const [rightDetailTab, setRightDetailTab] = useState<RightDetailTabId>('tasarim')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const { templates, editingId, draftName, openTemplate, resetToNewDraft, removeTemplate } = props
  const uiVariant = gl ? 'glass' : 'liquid'

  const scrollPanelTop = () => {
    requestAnimationFrame(() => rightScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const requestDelete = () => {
    if (!editingId) return
    const tpl = templates.find((x) => x.id === editingId)
    if (!tpl) return
    setDeleteTarget({ id: tpl.id, name: tpl.name })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    removeTemplate(deleteTarget.id)
    setDeleteTarget(null)
  }

  useEffect(() => {
    if (!deleteTarget) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDeleteTarget(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [deleteTarget])

  const filteredTemplates = useMemo(() => {
    const q = listSearch.trim().toLocaleLowerCase('tr-TR')
    if (!q) return templates
    return templates.filter((tpl) => {
      const proc = PROCESS_TYPES.find((p) => p.id === tpl.processTypeId)?.label ?? tpl.processTypeId
      const hay = `${tpl.name} ${proc}`.toLocaleLowerCase('tr-TR')
      return hay.includes(q)
    })
  }, [listSearch, templates])

  const selectedProcessLabel = useMemo(() => {
    const proc = PROCESS_TYPES.find((p) => p.id === props.processTypeId)
    return proc?.label ?? props.processTypeId
  }, [props.processTypeId])

  return (
    <>
      <div
        className="project-mgmt-glass-light flex min-h-0 min-w-0 flex-1 basis-0 flex-col gap-0 overflow-hidden rounded-3xl"
        data-neutral-shell={neutralShell ? 'true' : undefined}
      >
        <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden">
          <div
            className={[
              'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
              gl
                ? 'rounded-3xl bg-transparent p-0'
                : 'rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5',
            ].join(' ')}
          >
            <ElementIdentityPieceCodesLikeSplit
              persistKey="approval-flow-designer"
              visualVariant="project-mgmt"
              neutralChrome={neutralShell}
              listIndentWhenFilterOpen="18.5rem"
              listTitle={t('approvalFlowDesigner.listTitle')}
              filterToolbarSearch={
                <FilterToolbarSearch
                  id="approval-flow-list-search"
                  value={listSearch}
                  onValueChange={setListSearch}
                  placeholder={t('approvalFlowDesigner.listSearchPh')}
                  ariaLabel={t('approvalFlowDesigner.listSearchAria')}
                  className={gl ? 'project-mgmt-toolbar-search' : ''}
                  inputClassName={gl ? 'glass-input' : ''}
                />
              }
              headerActions={
                <>
                  <button
                    type="button"
                    onClick={() => {
                      resetToNewDraft()
                      setRightDetailTab('tasarim')
                      scrollPanelTop()
                    }}
                    className={
                      gl
                        ? ['glass-btn', 'primary', 'small', 'inline-flex', 'items-center', 'gap-1.5'].join(' ')
                        : 'inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
                    }
                  >
                    <Plus className="size-3.5 shrink-0" aria-hidden />
                    {t('approvalFlowDesigner.newTemplate')}
                  </button>
                  <Link
                    to="/onay-akisi?legacy=1"
                    className={
                      gl
                        ? ['glass-btn', 'secondary', 'small', 'inline-flex', 'items-center', 'gap-1.5', 'no-underline'].join(
                            ' ',
                          )
                        : `${eiSplitHeaderButtonPassive} no-underline`
                    }
                  >
                    {t('approvalFlowDesigner.legacyLink')}
                  </Link>
                </>
              }
              isFilterOpen={filterOpen}
              onFilterOpenChange={setFilterOpen}
              filterAside={
                <div>
                  <ElementIdentityFilterSheetHeader
                    glass={gl}
                    title={t('approvalFlowDesigner.filtersTitle')}
                    subtitle={t('approvalFlowDesigner.filtersSubtitle')}
                    onClose={() => setFilterOpen(false)}
                  />
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {t('approvalFlowDesigner.filterBody')}
                  </p>
                  <label className="mt-3 block">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      {t('approvalFlowDesigner.listSearchLabel')}
                    </span>
                    <input
                      type="search"
                      value={listSearch}
                      onChange={(e) => setListSearch(e.target.value)}
                      placeholder={t('approvalFlowDesigner.listSearchPh')}
                      autoComplete="off"
                      className={gl ? 'glass-input mt-2 w-full' : `${inputCls} text-xs`}
                    />
                  </label>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      Sonuç: <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">{filteredTemplates.length}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setListSearch('')
                        setFilterOpen(false)
                      }}
                      className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
                    >
                      Temizle
                    </button>
                  </div>
                </div>
              }
              listBody={
                <>
                  {filteredTemplates.length > 0 ? (
                    filteredTemplates.map((tpl) => {
                      const active = editingId === tpl.id
                      const procLabel = PROCESS_TYPES.find((p) => p.id === tpl.processTypeId)?.label ?? tpl.processTypeId
                      return (
                        <li key={tpl.id}>
                          <button
                            type="button"
                            onClick={() => {
                              openTemplate(tpl)
                              setRightDetailTab('tasarim')
                              scrollPanelTop()
                            }}
                            className={`flex w-full flex-col gap-0.5 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                              active
                                ? 'border-sky-400/60 bg-sky-500/10 dark:border-sky-500/40 dark:bg-sky-500/15'
                                : 'border-slate-200/50 bg-white/40 hover:bg-white/70 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-slate-900/50'
                            }`}
                          >
                            <span className="truncate font-semibold text-slate-900 dark:text-slate-50">{tpl.name}</span>
                            <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                              {procLabel} · {tpl.steps.length} {t('approvalFlowDesigner.stepWord')}
                            </span>
                          </button>
                        </li>
                      )
                    })
                  ) : (
                    <li className="rounded-lg border border-slate-200/50 bg-white/60 px-3 py-2 text-xs text-slate-600 dark:border-slate-700/50 dark:bg-slate-900/35 dark:text-slate-300">
                      Filtreye uygun şablon bulunamadı.
                    </li>
                  )}
                </>
              }
              footer={
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <p>
                    <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">{filteredTemplates.length}</span>{' '}
                    {t('approvalFlowDesigner.footerTemplates')}
                  </p>
                </div>
              }
              rightAside={
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                  <div
                    ref={rightScrollRef}
                    className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-2"
                  >
                    <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Seçili onay akışı
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
                        {draftName.trim() || t('approvalFlowDesigner.newTemplate')}
                      </h3>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        {selectedProcessLabel}
                        {editingId ? (
                          <>
                            {' '}
                            · <span className="font-mono text-[11px]">{editingId}</span>
                          </>
                        ) : (
                          ' · Yeni (kayıtsız)'
                        )}
                      </p>
                      {editingId ? (
                        <div className="mt-3 flex justify-center">
                          <button
                            type="button"
                            onClick={requestDelete}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300/70 bg-rose-50/90 px-2 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-600/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/60"
                          >
                            <Trash2 className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                            {t('approvalFlowDesigner.deleteTitle')}
                          </button>
                        </div>
                      ) : null}
                    </header>

                    <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
                      <div className="flex max-w-full gap-1 overflow-x-auto" role="tablist" aria-label="Onay akışı detay sekmeleri">
                        {(
                          [
                            ['tasarim', 'Tasarım'],
                            ['onizleme', 'Önizleme'],
                          ] as const
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={rightDetailTab === id}
                            onClick={() => {
                              setRightDetailTab(id)
                              scrollPanelTop()
                            }}
                            className={tabPill(rightDetailTab === id)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      role="tabpanel"
                      className="okan-project-tab-panel mt-3 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-left sm:px-1"
                    >
                      {rightDetailTab === 'tasarim' ? (
                        <ApprovalFlowDesignerEditorSection variant={uiVariant} {...props} />
                      ) : (
                        <ApprovalFlowDesignerPreviewPanel
                          variant={uiVariant}
                          previewLabels={props.previewLabels}
                          steps={props.steps}
                        />
                      )}
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>

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
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
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
