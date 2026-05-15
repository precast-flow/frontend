import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus, Trash2, X } from 'lucide-react'
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
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'
import {
  ApprovalFlowDesignerEditorSection,
  ApprovalFlowDesignerPreviewPanel,
} from './ApprovalFlowDesignerSections'
import type { ApprovalFlowDesignerState } from './useApprovalFlowDesignerState'

const PAGE_SIZE_OPTIONS = [4, 6, 8, 10] as const
type RightDetailTabId = 'tasarim' | 'onizleme'

export function ApprovalFlowDesignerModuleView(props: ApprovalFlowDesignerState) {
  const { t } = useI18n()
  const { mode } = useThemeMode()
  const gl = mode === 'light'
  const location = useLocation()
  const neutralShell = activeModuleIdFromPathname(location.pathname) === 'approval-flow'
  const rightScrollRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const [listPage, setListPage] = useState(1)
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(6)
  const [rightDetailTab, setRightDetailTab] = useState<RightDetailTabId>('tasarim')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const { templates, editingId, draftName, openTemplate, resetToNewDraft, removeTemplate } = props
  const uiVariant = gl ? 'glass' : 'liquid'

  const scrollPanelTop = () => {
    requestAnimationFrame(() => rightScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
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

  const listPageCount = useMemo(
    () => Math.max(1, Math.ceil(filteredTemplates.length / pageSize)),
    [filteredTemplates.length, pageSize],
  )
  const safeListPage = Math.min(listPage, listPageCount)
  const visibleTemplates = useMemo(
    () => filteredTemplates.slice((safeListPage - 1) * pageSize, safeListPage * pageSize),
    [filteredTemplates, pageSize, safeListPage],
  )
  const listPageStart = filteredTemplates.length === 0 ? 0 : (safeListPage - 1) * pageSize + 1
  const listPageEnd = Math.min(filteredTemplates.length, safeListPage * pageSize)

  const selectedProcessLabel = useMemo(() => {
    const proc = PROCESS_TYPES.find((p) => p.id === props.processTypeId)
    return proc?.label ?? props.processTypeId
  }, [props.processTypeId])

  useEffect(() => {
    setListPage((p) => Math.min(p, listPageCount))
  }, [listPageCount])

  useEffect(() => {
    setListPage(1)
  }, [listSearch, pageSize])

  return (
    <>
      <div
        className="project-mgmt-glass-light flex min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden rounded-3xl"
        data-neutral-shell={neutralShell ? 'true' : undefined}
      >
        <ElementIdentityPieceCodesLikeSplit
          persistKey="approval-flow-designer"
          visualVariant="project-mgmt"
          neutralChrome={neutralShell}
          fillParentHeight
          listIndentWhenFilterOpen="18.5rem"
          listRef={listRef}
          listTitle={t('approvalFlowDesigner.listTitle')}
          filterToolbarSearch={
            <FilterToolbarSearch
              id="approval-flow-list-search"
              value={listSearch}
              onValueChange={(v) => {
                setListSearch(v)
                setListPage(1)
              }}
              placeholder={t('approvalFlowDesigner.listSearchPh')}
              ariaLabel={t('approvalFlowDesigner.listSearchAria')}
              className={gl ? 'project-mgmt-toolbar-search' : ''}
              inputClassName={gl ? 'glass-input' : ''}
            />
          }
          headerActions={
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
              <p
                className={
                  gl
                    ? 'text-xs leading-relaxed text-black/70 dark:text-white/75'
                    : 'text-xs leading-relaxed text-slate-600 dark:text-slate-300'
                }
              >
                {t('approvalFlowDesigner.filterBody')}
              </p>
              <label className="mt-3 block">
                <span
                  className={
                    gl
                      ? 'text-xs font-semibold uppercase tracking-wide text-black/75 dark:text-white/80'
                      : 'text-[11px] font-medium text-slate-600 dark:text-slate-300'
                  }
                >
                  {t('approvalFlowDesigner.listSearchLabel')}
                </span>
                <input
                  type="search"
                  value={listSearch}
                  onChange={(e) => {
                    setListSearch(e.target.value)
                    setListPage(1)
                  }}
                  placeholder={t('approvalFlowDesigner.listSearchPh')}
                  autoComplete="off"
                  className={
                    gl
                      ? 'glass-input mt-2 w-full'
                      : 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'
                  }
                />
              </label>
              <div className="mt-3 flex items-center justify-between border-t border-black/15 pt-2 dark:border-white/12">
                <span className="text-[11px] text-black/75 dark:text-white/80">
                  Sonuç: <span className="tabular-nums font-semibold">{filteredTemplates.length}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setListSearch('')
                    setListPage(1)
                    setFilterOpen(false)
                    requestAnimationFrame(() => {
                      listRef.current?.scrollTo({ top: 0, behavior: 'auto' })
                    })
                  }}
                  className={
                    gl
                      ? ['glass-btn', 'secondary', 'small'].join(' ')
                      : 'rounded-md border border-black/22 px-2 py-1 text-[11px] font-semibold text-black hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10'
                  }
                >
                  Temizle
                </button>
              </div>
            </div>
          }
          listBody={
            <>
              <li className="list-none">
                <button
                  type="button"
                  onClick={() => {
                    resetToNewDraft()
                    setRightDetailTab('tasarim')
                    scrollPanelTop()
                  }}
                  className={
                    gl
                      ? 'flex w-full items-center gap-2 rounded-xl border border-dashed border-black/25 bg-black/5 px-2.5 py-2 text-left text-xs font-semibold text-black transition hover:bg-black/8 dark:border-white/20 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10'
                      : 'flex w-full items-center gap-2 rounded-lg border border-dashed border-sky-300/60 bg-sky-50/40 px-2.5 py-2 text-left text-xs font-semibold text-sky-900 transition hover:bg-sky-100/50 dark:border-sky-700/40 dark:bg-sky-950/25 dark:text-sky-100 dark:hover:bg-sky-950/40'
                  }
                >
                  <Plus className="size-3.5 shrink-0" aria-hidden />
                  {t('approvalFlowDesigner.newTemplate')}
                </button>
              </li>
              {visibleTemplates.length > 0 ? (
                visibleTemplates.map((tpl) => {
                  const active = editingId === tpl.id
                  const procLabel = PROCESS_TYPES.find((p) => p.id === tpl.processTypeId)?.label ?? tpl.processTypeId
                  return (
                    <li
                      key={tpl.id}
                      className={[
                        gl
                          ? [
                              'glass-card',
                              'glass-card--static',
                              'project-mgmt-list-row-card',
                              'list-none',
                              'flex',
                              'min-h-0',
                              'shrink-0',
                              'items-stretch',
                              'gap-0',
                            ].join(' ')
                          : 'list-none flex min-h-0 shrink-0 items-stretch gap-0 rounded-lg border border-slate-200/50 bg-white/40 dark:border-slate-700/50 dark:bg-slate-900/30',
                        active ? 'okan-project-list-row--active' : '',
                      ].join(' ')}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          openTemplate(tpl)
                          setRightDetailTab('tasarim')
                          scrollPanelTop()
                        }}
                        aria-current={active ? 'true' : undefined}
                        className="min-w-0 flex-1 rounded-md px-2 py-2 text-left transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:hover:bg-white/8"
                      >
                        <p
                          className={
                            gl
                              ? 'truncate text-sm font-semibold leading-snug text-black dark:text-white'
                              : 'truncate text-xs font-semibold text-slate-900 dark:text-slate-50'
                          }
                        >
                          {tpl.name}
                        </p>
                        <p
                          className={
                            gl
                              ? 'mt-0.5 truncate text-xs text-black/70 dark:text-white/70'
                              : 'truncate text-[10px] text-slate-500 dark:text-slate-400'
                          }
                        >
                          {procLabel} · {tpl.steps.length} {t('approvalFlowDesigner.stepWord')}
                        </p>
                      </button>
                      <button
                        type="button"
                        title={t('approvalFlowDesigner.deleteTitle')}
                        aria-label={t('approvalFlowDesigner.deleteTitle')}
                        onClick={() => requestDelete(tpl.id)}
                        className={
                          gl
                            ? 'card-button mr-1 inline-flex shrink-0 items-center justify-center self-center px-2 py-1 text-rose-800 dark:text-rose-200'
                            : 'shrink-0 rounded-r-md px-2 text-rose-700 hover:bg-rose-50/80 dark:text-rose-300 dark:hover:bg-rose-950/30'
                        }
                      >
                        <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden />
                      </button>
                    </li>
                  )
                })
              ) : (
                <li
                  className={
                    gl
                      ? 'glass-card glass-card--static list-none px-3 py-2 text-sm text-black dark:text-white'
                      : 'list-none rounded-lg border border-slate-200/50 bg-white/60 px-3 py-2 text-xs text-slate-600 dark:border-slate-700/50 dark:bg-slate-900/35 dark:text-slate-300'
                  }
                >
                  Filtreye uygun şablon bulunamadı.
                </li>
              )}
            </>
          }
          footer={
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className={gl ? 'text-black dark:text-white/80' : 'text-slate-600 dark:text-slate-300'}>
                {filteredTemplates.length > 0 ? (
                  <>
                    <span className="tabular-nums font-semibold text-black dark:text-white">{listPageStart}</span>-
                    <span className="tabular-nums font-semibold text-black dark:text-white">{listPageEnd}</span> /{' '}
                    <span className="tabular-nums font-semibold text-black dark:text-white">{filteredTemplates.length}</span>{' '}
                    {t('approvalFlowDesigner.footerTemplates')}
                  </>
                ) : (
                  t('approvalFlowDesigner.footerTemplates')
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {filteredTemplates.length > 0 ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={safeListPage <= 1}
                      onClick={() => setListPage((p) => Math.max(1, p - 1))}
                      className={
                        gl
                          ? ['glass-btn', 'secondary', 'small', 'disabled:pointer-events-none disabled:opacity-35'].join(
                              ' ',
                            )
                          : 'rounded-md border border-black/22 bg-white px-2 py-1 text-[11px] font-semibold text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/15 dark:bg-black/80 dark:text-white dark:hover:bg-white/10'
                      }
                    >
                      Önceki
                    </button>
                    <span className={gl ? 'tabular-nums text-black/80 dark:text-white/75' : 'tabular-nums text-black/70 dark:text-white/75'}>
                      Sayfa {safeListPage}/{listPageCount}
                    </span>
                    <button
                      type="button"
                      disabled={safeListPage >= listPageCount}
                      onClick={() => setListPage((p) => Math.min(listPageCount, p + 1))}
                      className={
                        gl
                          ? ['glass-btn', 'secondary', 'small', 'disabled:pointer-events-none disabled:opacity-35'].join(
                              ' ',
                            )
                          : 'rounded-md border border-black/22 bg-white px-2 py-1 text-[11px] font-semibold text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/15 dark:bg-black/80 dark:text-white dark:hover:bg-white/10'
                      }
                    >
                      Sonraki
                    </button>
                  </div>
                ) : null}
                <label className={gl ? 'flex items-center gap-1 text-black dark:text-white/80' : 'flex items-center gap-1 text-slate-600 dark:text-slate-300'}>
                  <span className="text-[11px]">Sayfa boyutu</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])
                      setListPage(1)
                      requestAnimationFrame(() => {
                        listRef.current?.scrollTo({ top: 0, behavior: 'auto' })
                      })
                    }}
                    className={
                      gl
                        ? 'glass-input px-2 py-1 text-xs'
                        : 'rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] dark:border-slate-600 dark:bg-slate-900'
                    }
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          }
          rightPanelRef={rightScrollRef}
          rightAside={
            <div className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden sm:gap-4">
                <header
                  className={
                    gl
                      ? 'shrink-0 border-b border-black/12 pb-3 text-left dark:border-white/10'
                      : 'shrink-0 border-b border-slate-200/25 pb-3 text-left dark:border-white/10'
                  }
                >
                  <p
                    className={
                      gl
                        ? 'text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65'
                        : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                    }
                  >
                    Seçili onay akışı
                  </p>
                  <h3
                    className={
                      gl
                        ? 'mt-1.5 text-xl font-semibold leading-tight text-black dark:text-white'
                        : 'mt-1.5 text-lg font-semibold leading-tight text-slate-900 dark:text-slate-50'
                    }
                  >
                    {draftName.trim() || t('approvalFlowDesigner.newTemplate')}
                  </h3>
                  <p
                    className={
                      gl
                        ? 'mt-1 text-sm leading-snug text-black/75 dark:text-white/80'
                        : 'mt-1 text-sm leading-snug text-slate-600 dark:text-slate-300'
                    }
                  >
                    {selectedProcessLabel}
                    {editingId ? (
                      <>
                        {' '}
                        · <span className="font-mono text-xs">{editingId}</span>
                      </>
                    ) : (
                      ' · Yeni (kayıtsız)'
                    )}
                  </p>
                </header>

                <div className="sticky top-0 z-10 flex w-full shrink-0 justify-start pt-0.5">
                  <div
                    className={
                      gl
                        ? 'glass-nav w-full max-w-full flex-wrap justify-start overflow-x-auto p-0'
                        : 'okan-liquid-pill-track flex max-w-full gap-1 overflow-x-auto rounded-full p-1'
                    }
                    role="tablist"
                    aria-label="Onay akışı detay sekmeleri"
                  >
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
                        className={
                          gl
                            ? ['nav-item', 'shrink-0', rightDetailTab === id ? 'active' : ''].filter(Boolean).join(' ')
                            : `shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition ${
                                rightDetailTab === id
                                  ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
                                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
                              }`
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  ref={rightScrollRef}
                  role="tabpanel"
                  className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden text-left"
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

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-[95] flex items-end justify-center p-3 sm:items-center sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
            aria-label={t('approvalFlowDesigner.cancel')}
            onClick={() => setDeleteTarget(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('approvalFlowDesigner.dialogDeleteTitle')}
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xl dark:border-slate-700/70 dark:bg-slate-900"
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  {t('approvalFlowDesigner.dialogDeleteTitle')}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t('approvalFlowDesigner.dialogDeleteSubtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label={t('approvalFlowDesigner.cancel')}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300">
              {t('approvalFlowDesigner.dialogDeleteBody').replace('{{name}}', deleteTarget.name)}
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                {t('approvalFlowDesigner.cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                {t('approvalFlowDesigner.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
