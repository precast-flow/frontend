import { Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  useQualityManagement,
  type InputMaterialDraft,
} from '../../context/QualityManagementContext'
import { useI18n } from '../../i18n/I18nProvider'
import { printReportInIframe } from '../shared/printableReport/printReportInIframe'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import { SplitListPaginationNav } from '../shared/SplitListPaginationNav'
import { eiSplitHeaderButtonPassive } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import {
  ManagementModuleShell,
  managementModuleDetailPanelClass,
  managementModuleListPanelClass,
  managementModuleListTitleClass,
  managementModuleListToolbarClass,
  managementModuleSplitRowClass,
  splitListCardClass,
} from '../shared/splitModuleStyles'
import { SplitListCollapseToggle } from '../shared/layout/SplitListCollapseToggle'
import {
  AppDialog,
  AppDialogButton,
  AppDialogFooter,
  appDialogFieldClass,
  appDialogLabelClass,
} from '../shared/AppDialog'
import { isRebarMaterialType, type InputMaterialType, type QualityInputMaterial } from '../../data/quality/qualityManagementTypes'
import { PrintCopyCountDialog } from './shared/PrintCopyCountDialog'
import { RebarRegistryCardPrintSheet } from './RebarRegistryCardPrintSheet'
import {
  QualityDetailActions,
  QualityDetailColumn,
  QualityDetailField,
  QualityDetailFieldsGrid,
  QualityDetailNote,
  QualityDetailSection,
} from './QualityDetailColumn'
import { QualitySplitPaneResizer } from './QualitySplitPaneResizer'
import { useQualitySplitLayout } from './useQualitySplitLayout'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'

const LIST_PAGE_SIZE = 6
const MATERIAL_TYPES: InputMaterialType[] = ['rebar', 'mesh', 'prestress', 'accessory', 'other']
const STATUSES = ['active', 'quarantine', 'consumed', 'rejected'] as const

type DetailTab = 'general' | 'actions'

function emptyDraft(): InputMaterialDraft {
  const today = new Date().toISOString().slice(0, 10)
  return {
    materialType: 'rebar',
    name: '',
    systemMaterialCode: '',
    supplierId: '',
    supplierMaterialCode: '',
    diameterOrSize: '',
    qualityClass: '',
    lotNo: '',
    certificateNo: '',
    entryDate: today,
    quantity: 0,
    unit: 'ton',
    description: '',
    status: 'active',
  }
}

function materialToDraft(m: QualityInputMaterial): InputMaterialDraft {
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = m
  return rest
}

export function InputMaterialManagementView() {
  const { t } = useI18n()
  const {
    inputMaterials,
    suppliers,
    addInputMaterial,
    updateInputMaterial,
    supplierName,
  } = useQualityManagement()
  const layout = useQualitySplitLayout('quality-input-materials', 'quality-input-materials')
  const {
    gl,
    neutralShell,
    splitRef,
    listCollapsed,
    toggleListCollapsed,
    listPanelStyle,
    isResizing,
    setIsResizing,
    resetRatio,
    isResizerHover,
    setIsResizerHover,
  } = layout

  const listRef = useRef<HTMLUListElement | null>(null)
  const [search, setSearch] = useState('')
  const [listPage, setListPage] = useState(1)
  const [selectedId, setSelectedId] = useState(inputMaterials[0]?.id ?? '')
  const [detailTab, setDetailTab] = useState<DetailTab>('general')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState<InputMaterialDraft>(emptyDraft)
  const [formError, setFormError] = useState<string | null>(null)
  const [printOpen, setPrintOpen] = useState(false)
  const [printCopies, setPrintCopies] = useState(1)
  const [printReportId, setPrintReportId] = useState('')

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return inputMaterials
    return inputMaterials.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.systemMaterialCode.toLowerCase().includes(q) ||
        m.supplierMaterialCode.toLowerCase().includes(q) ||
        m.lotNo.toLowerCase().includes(q),
    )
  }, [inputMaterials, search])

  const listTotalPages = Math.max(1, Math.ceil(list.length / LIST_PAGE_SIZE))
  const safeListPage = Math.min(listPage, listTotalPages)
  const listPageSlice = useMemo(() => {
    const start = (safeListPage - 1) * LIST_PAGE_SIZE
    return list.slice(start, start + LIST_PAGE_SIZE)
  }, [list, safeListPage])
  const listPageStart = list.length === 0 ? 0 : (safeListPage - 1) * LIST_PAGE_SIZE + 1
  const listPageEnd = Math.min(list.length, safeListPage * LIST_PAGE_SIZE)

  useEffect(() => {
    setListPage(1)
  }, [search])

  useEffect(() => {
    setListPage((p) => Math.min(p, listTotalPages))
  }, [listTotalPages])

  useEffect(() => {
    if (list.length && !list.some((m) => m.id === selectedId)) {
      setSelectedId(list[0]!.id)
    }
  }, [list, selectedId])

  useEffect(() => {
    setDetailTab('general')
  }, [selectedId])

  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }, [safeListPage])

  const selected = useMemo(
    () => list.find((m) => m.id === selectedId) ?? list[0] ?? null,
    [list, selectedId],
  )

  const openCreate = () => {
    setEditId(null)
    setDraft(emptyDraft())
    setFormError(null)
    setDialogOpen(true)
  }

  const openEdit = () => {
    if (!selected) return
    setEditId(selected.id)
    setDraft(materialToDraft(selected))
    setFormError(null)
    setDialogOpen(true)
  }

  const saveForm = () => {
    if (!draft.supplierMaterialCode.trim()) {
      setFormError(t('qualityInput.field.supplierCodeRequired'))
      return
    }
    if (!draft.name.trim() || !draft.systemMaterialCode.trim() || !draft.supplierId) {
      setFormError(t('qualityShared.selectEmpty'))
      return
    }
    if (editId) {
      updateInputMaterial(editId, draft)
    } else {
      const row = addInputMaterial(draft)
      setSelectedId(row.id)
    }
    setDialogOpen(false)
  }

  const handlePrint = (copies: number) => {
    if (!selected) return
    const id = `rebar-registry-${selected.id}-${Date.now()}`
    setPrintCopies(copies)
    setPrintReportId(id)
    window.setTimeout(() => printReportInIframe(id), 120)
  }

  const detailTabs = [
    { id: 'general', label: t('qualityShared.tab.general') },
    { id: 'actions', label: t('qualityShared.tab.actions') },
  ]

  return (
    <>
      <ManagementModuleShell neutralShell={neutralShell} gl={gl}>
        <div
          ref={splitRef}
          data-split-dragging={isResizing ? 'true' : undefined}
          className={managementModuleSplitRowClass(gl)}
        >
          <section className={managementModuleListPanelClass(gl)} style={listPanelStyle}>
            {listCollapsed ? (
              <div className="flex h-full flex-col items-center gap-2 py-2">
                <SplitListCollapseToggle collapsed={listCollapsed} onToggle={toggleListCollapsed} />
              </div>
            ) : (
              <>
                <div className={managementModuleListToolbarClass}>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <SplitListCollapseToggle collapsed={listCollapsed} onToggle={toggleListCollapsed} />
                    <h2 className={managementModuleListTitleClass}>
                      {t('qualityShared.listTitleMaterials')}
                    </h2>
                  </div>
                  <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                    <FilterToolbarSearch
                      id="quality-input-search"
                      value={search}
                      onValueChange={setSearch}
                      placeholder={t('qualityInput.searchPlaceholder')}
                      ariaLabel={t('qualityInput.searchAria')}
                      className={gl ? 'project-mgmt-toolbar-search' : ''}
                      inputClassName={gl ? 'glass-input' : ''}
                    />
                    <button type="button" onClick={openCreate} className={eiSplitHeaderButtonPassive}>
                      <Plus className="size-3.5 shrink-0" aria-hidden />
                      <span>{t('qualityInput.addNew')}</span>
                    </button>
                  </div>
                </div>

                {list.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-6 text-center">
                    <p className="text-sm text-black/80 dark:text-white/80">{t('qualityInput.emptyList')}</p>
                    <button type="button" onClick={openCreate} className={eiSplitHeaderButtonPassive}>
                      {t('qualityInput.addNew')}
                    </button>
                  </div>
                ) : (
                  <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                    <ul
                      ref={listRef}
                      className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1"
                    >
                      {listPageSlice.map((m) => (
                        <li
                          key={m.id}
                          className={splitListCardClass(
                            selected?.id === m.id,
                            'flex min-h-0 shrink-0 items-stretch gap-1.5 px-2 py-1.5',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedId(m.id)}
                            aria-current={selected?.id === m.id ? 'true' : undefined}
                            className="min-w-0 flex-1 rounded-md px-0.5 py-0.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                          >
                            <p className="truncate text-sm font-semibold leading-snug text-black dark:text-white">
                              {m.systemMaterialCode}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-black/70 dark:text-white/70">{m.name}</p>
                            <p className="mt-0.5 truncate text-[10px] text-black/55 dark:text-white/65">
                              {supplierName(m.supplierId)} · {m.supplierMaterialCode}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {gl ? (
                      <div className="glass-card glass-card--static project-mgmt-footer-panel sticky bottom-0 z-10 mt-2 shrink-0 text-xs">
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                          <p className="text-black dark:text-white/80">
                            <span className="tabular-nums font-semibold">{listPageStart}</span>-
                            <span className="tabular-nums font-semibold">{listPageEnd}</span> /{' '}
                            <span className="tabular-nums font-semibold">{list.length}</span>
                          </p>
                          <SplitListPaginationNav
                            safePage={safeListPage}
                            pageCount={listTotalPages}
                            onPrev={() => setListPage((p) => Math.max(1, p - 1))}
                            onNext={() => setListPage((p) => Math.min(listTotalPages, p + 1))}
                            gl
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1.5 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-black/15 pt-2.5 text-[11px] dark:border-white/12">
                        <span>
                          {listPageStart}-{listPageEnd} / {list.length}
                        </span>
                        <SplitListPaginationNav
                          safePage={safeListPage}
                          pageCount={listTotalPages}
                          onPrev={() => setListPage((p) => Math.max(1, p - 1))}
                          onNext={() => setListPage((p) => Math.min(listTotalPages, p + 1))}
                          buttonStyle="legacy"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          {!listCollapsed ? (
            <QualitySplitPaneResizer
              gl={gl}
              neutralShell={neutralShell}
              isResizing={isResizing}
              isResizerHover={isResizerHover}
              onMouseDown={() => setIsResizing(true)}
              onDoubleClick={() => {
                setIsResizing(false)
                resetRatio()
              }}
              onMouseEnter={() => setIsResizerHover(true)}
              onMouseLeave={() => setIsResizerHover(false)}
            />
          ) : null}

          <aside className={managementModuleDetailPanelClass(gl)}>
            {selected ? (
              <QualityDetailColumn
                gl={gl}
                entityKey={selected.id}
                panelIdPrefix="quality-input"
                selectedLabel={t('qualityShared.selectedRecord')}
                title={selected.name}
                subtitle={`${selected.systemMaterialCode} · ${supplierName(selected.supplierId)}`}
                headerActions={
                  <button type="button" onClick={openEdit} className={eiSplitHeaderButtonPassive}>
                    {t('qualityInput.edit')}
                  </button>
                }
                tabs={detailTabs}
                activeTab={detailTab}
                onTabChange={(id) => setDetailTab(id as DetailTab)}
              >
                {detailTab === 'general' ? (
                  <QualityDetailFieldsGrid>
                    <QualityDetailField
                      label={t('qualityInput.field.materialType')}
                      value={t(`qualityInput.type.${selected.materialType}`)}
                    />
                    <QualityDetailField
                      label={t('qualityInput.field.status')}
                      value={t(`qualityInput.status.${selected.status}`)}
                    />
                    <QualityDetailField
                      label={t('qualityInput.field.supplierCode')}
                      value={selected.supplierMaterialCode}
                    />
                    <QualityDetailField
                      label={t('qualityInput.field.diameter')}
                      value={selected.diameterOrSize}
                    />
                    <QualityDetailField
                      label={t('qualityInput.field.qualityClass')}
                      value={selected.qualityClass}
                    />
                    <QualityDetailField label={t('qualityInput.field.lot')} value={selected.lotNo} />
                    <QualityDetailField
                      label={t('qualityInput.field.certificate')}
                      value={selected.certificateNo}
                    />
                    <QualityDetailField
                      label={t('qualityInput.field.entryDate')}
                      value={selected.entryDate}
                    />
                    <QualityDetailField
                      label={t('qualityInput.field.quantity')}
                      value={`${selected.quantity} ${selected.unit}`}
                    />
                  </QualityDetailFieldsGrid>
                ) : null}
                {detailTab === 'actions' ? (
                  <>
                    <QualityDetailSection title={t('qualityShared.tab.actions')}>
                      <QualityDetailActions>
                        {isRebarMaterialType(selected.materialType) ? (
                          <button
                            type="button"
                            onClick={() => setPrintOpen(true)}
                            className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 sm:w-auto"
                          >
                            {t('qualityInput.registryCard')}
                          </button>
                        ) : (
                          <p className="text-sm text-black/70 dark:text-white/75">
                            {t('qualityInput.field.materialType')}:{' '}
                            {t(`qualityInput.type.${selected.materialType}`)}
                          </p>
                        )}
                      </QualityDetailActions>
                    </QualityDetailSection>
                    {selected.description ? (
                      <QualityDetailSection title={t('qualityShared.section.notes')}>
                        <QualityDetailNote>{selected.description}</QualityDetailNote>
                      </QualityDetailSection>
                    ) : null}
                  </>
                ) : null}
              </QualityDetailColumn>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-sm text-black/70 dark:text-white/70">
                {t('qualityInput.emptyList')}
              </div>
            )}
          </aside>
        </div>
      </ManagementModuleShell>

      {printReportId && selected && isRebarMaterialType(selected.materialType) ? (
        <RebarRegistryCardPrintSheet
          material={selected}
          supplierName={supplierName(selected.supplierId)}
          reportId={printReportId}
          copies={printCopies}
        />
      ) : null}

      {dialogOpen ? (
        <AppDialog
          open
          title={editId ? t('qualityInput.edit') : t('qualityInput.addNew')}
          closeLabel={t('qualityShared.close')}
          onClose={() => setDialogOpen(false)}
          size="lg"
          footer={
            <AppDialogFooter>
              <AppDialogButton variant="secondary" onClick={() => setDialogOpen(false)}>
                {t('qualityShared.cancel')}
              </AppDialogButton>
              <AppDialogButton variant="primary" onClick={saveForm}>
                {t('qualityShared.save')}
              </AppDialogButton>
            </AppDialogFooter>
          }
        >
          <InputMaterialForm draft={draft} setDraft={setDraft} suppliers={suppliers} t={t} />
          {formError ? (
            <p className="mt-2 text-sm text-rose-600" role="alert">
              {formError}
            </p>
          ) : null}
        </AppDialog>
      ) : null}

      <PrintCopyCountDialog
        open={printOpen}
        title={t('qualityInput.registryCard')}
        onClose={() => setPrintOpen(false)}
        onConfirm={handlePrint}
      />
    </>
  )
}

function InputMaterialForm({
  draft,
  setDraft,
  suppliers,
  t,
}: {
  draft: InputMaterialDraft
  setDraft: (d: InputMaterialDraft) => void
  suppliers: { id: string; name: string; code: string }[]
  t: (k: string) => string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={appDialogLabelClass}>
        {t('qualityInput.field.materialType')}
        <select
          className={appDialogFieldClass}
          value={draft.materialType}
          onChange={(e) => setDraft({ ...draft, materialType: e.target.value as InputMaterialType })}
        >
          {MATERIAL_TYPES.map((mt) => (
            <option key={mt} value={mt}>
              {t(`qualityInput.type.${mt}`)}
            </option>
          ))}
        </select>
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityInput.field.status')}
        <select
          className={appDialogFieldClass}
          value={draft.status}
          onChange={(e) => setDraft({ ...draft, status: e.target.value as (typeof STATUSES)[number] })}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`qualityInput.status.${s}`)}
            </option>
          ))}
        </select>
      </label>
      <label className={`${appDialogLabelClass} sm:col-span-2`}>
        {t('qualityInput.field.name')}
        <input
          className={appDialogFieldClass}
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityInput.field.systemCode')}
        <input
          className={appDialogFieldClass}
          value={draft.systemMaterialCode}
          onChange={(e) => setDraft({ ...draft, systemMaterialCode: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityInput.field.supplier')}
        <select
          className={appDialogFieldClass}
          value={draft.supplierId}
          onChange={(e) => setDraft({ ...draft, supplierId: e.target.value })}
        >
          <option value="">{t('qualityShared.selectEmpty')}</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </label>
      <label className={`${appDialogLabelClass} sm:col-span-2`}>
        {t('qualityInput.field.supplierCode')} *
        <input
          className={appDialogFieldClass}
          value={draft.supplierMaterialCode}
          onChange={(e) => setDraft({ ...draft, supplierMaterialCode: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityInput.field.diameter')}
        <input
          className={appDialogFieldClass}
          value={draft.diameterOrSize}
          onChange={(e) => setDraft({ ...draft, diameterOrSize: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityInput.field.qualityClass')}
        <input
          className={appDialogFieldClass}
          value={draft.qualityClass}
          onChange={(e) => setDraft({ ...draft, qualityClass: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityInput.field.lot')}
        <input
          className={appDialogFieldClass}
          value={draft.lotNo}
          onChange={(e) => setDraft({ ...draft, lotNo: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityInput.field.certificate')}
        <input
          className={appDialogFieldClass}
          value={draft.certificateNo}
          onChange={(e) => setDraft({ ...draft, certificateNo: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityInput.field.entryDate')}
        <input
          type="date"
          className={appDialogFieldClass}
          value={draft.entryDate}
          onChange={(e) => setDraft({ ...draft, entryDate: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityInput.field.quantity')}
        <input
          type="number"
          className={appDialogFieldClass}
          value={draft.quantity || ''}
          onChange={(e) => setDraft({ ...draft, quantity: Number(e.target.value) || 0 })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityInput.field.unit')}
        <input
          className={appDialogFieldClass}
          value={draft.unit}
          onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
        />
      </label>
      <label className={`${appDialogLabelClass} sm:col-span-2`}>
        {t('qualityInput.field.description')}
        <textarea
          className={appDialogFieldClass}
          rows={2}
          value={draft.description ?? ''}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </label>
    </div>
  )
}
