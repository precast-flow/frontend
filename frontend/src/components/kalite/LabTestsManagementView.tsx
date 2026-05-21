import { Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQualityManagement, type LabTestDraft } from '../../context/QualityManagementContext'
import { QUALITY_TEST_CATALOG } from '../../data/qualityTestCatalogMock'
import { useI18n } from '../../i18n/I18nProvider'
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
import type { LabTest, LabTestResultStatus } from '../../data/quality/qualityManagementTypes'
import { ValidityStatusBadge } from './shared/ValidityStatusBadge'
import {
  QualityDetailColumn,
  QualityDetailField,
  QualityDetailFieldsGrid,
  QualityDetailList,
  QualityDetailResultsTable,
  QualityDetailSection,
} from './QualityDetailColumn'
import { QualityExcelToolbar } from './shared/QualityExcelToolbar'
import { QualitySplitPaneResizer } from './QualitySplitPaneResizer'
import { useQualitySplitLayout } from './useQualitySplitLayout'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'

const LIST_PAGE_SIZE = 6

type DetailTab = 'general' | 'results' | 'links'

function labToDraft(lt: LabTest): LabTestDraft {
  const { id: _id, testCode: _c, createdAt: _ca, updatedAt: _ua, ...rest } = lt
  return rest
}

function emptyLabDraft(): LabTestDraft {
  const today = new Date().toISOString().slice(0, 10)
  const end = new Date()
  end.setMonth(end.getMonth() + 6)
  return {
    testTypeId: QUALITY_TEST_CATALOG[0]?.id ?? 'air_entrained',
    testDate: today,
    laboratory: '',
    responsible: '',
    resultStatus: 'pending',
    validityStartDate: today,
    validityEndDate: end.toISOString().slice(0, 10),
    links: {},
    results: [],
  }
}

export function LabTestsManagementView() {
  const { t } = useI18n()
  const {
    labTests,
    addLabTest,
    updateLabTest,
    inputMaterials,
    recipes,
    findInputMaterial,
    findRecipe,
  } = useQualityManagement()
  const layout = useQualitySplitLayout('quality-lab-tests', 'quality-lab-tests')
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
  const [selectedId, setSelectedId] = useState(labTests[0]?.id ?? '')
  const [detailTab, setDetailTab] = useState<DetailTab>('general')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState<LabTestDraft>(emptyLabDraft)

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return labTests
    return labTests.filter(
      (lt) =>
        lt.testCode.toLowerCase().includes(q) ||
        lt.laboratory.toLowerCase().includes(q) ||
        lt.responsible.toLowerCase().includes(q),
    )
  }, [labTests, search])

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
    if (list.length && !list.some((lt) => lt.id === selectedId)) setSelectedId(list[0]!.id)
  }, [list, selectedId])
  useEffect(() => {
    setDetailTab('general')
  }, [selectedId])
  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }, [safeListPage])

  const selected = useMemo(
    () => list.find((lt) => lt.id === selectedId) ?? list[0] ?? null,
    [list, selectedId],
  )

  const catalogLabel = (testTypeId: string) => {
    const cat = QUALITY_TEST_CATALOG.find((c) => c.id === testTypeId)
    return cat ? t(cat.labelKey) : testTypeId
  }

  const detailTabs = [
    { id: 'general', label: t('qualityShared.tab.general') },
    { id: 'results', label: t('qualityLab.field.results') },
    { id: 'links', label: t('qualityLab.field.links') },
  ]

  const openCreate = () => {
    setEditId(null)
    setDraft(emptyLabDraft())
    setDialogOpen(true)
  }

  const openEdit = () => {
    if (!selected) return
    setEditId(selected.id)
    setDraft(labToDraft(selected))
    setDialogOpen(true)
  }

  const saveForm = () => {
    const cat = QUALITY_TEST_CATALOG.find((c) => c.id === draft.testTypeId)
    const results =
      draft.results.length > 0
        ? draft.results
        : (cat?.fields.map((f) => ({
            fieldId: f.id,
            label: t(f.labelKey),
            value: f.demoValue,
            unit: f.unitKey ? t(f.unitKey) : undefined,
          })) ?? [])
    if (editId) {
      updateLabTest(editId, { ...draft, results })
    } else {
      const row = addLabTest({ ...draft, results })
      setSelectedId(row.id)
    }
    setDialogOpen(false)
  }

  const updateResult = (fieldId: string, value: string) => {
    if (!selected) return
    updateLabTest(selected.id, {
      results: selected.results.map((r) => (r.fieldId === fieldId ? { ...r, value } : r)),
    })
  }

  const linkLabels = selected ? buildLinkLabels(selected, findInputMaterial, findRecipe) : []

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
                      {t('qualityShared.listTitleTests')}
                    </h2>
                  </div>
                  <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                    <FilterToolbarSearch
                      id="quality-lab-search"
                      value={search}
                      onValueChange={setSearch}
                      placeholder={t('qualityInput.searchPlaceholder')}
                      ariaLabel={t('qualityInput.searchAria')}
                      className={gl ? 'project-mgmt-toolbar-search' : ''}
                      inputClassName={gl ? 'glass-input' : ''}
                    />
                    <QualityExcelToolbar module="lab_tests" tests={labTests} />
                    <button type="button" onClick={openCreate} className={eiSplitHeaderButtonPassive}>
                      <Plus className="size-3.5 shrink-0" aria-hidden />
                      <span>{t('qualityLab.addNew')}</span>
                    </button>
                  </div>
                </div>

                {list.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-6 text-sm text-black/70">
                    {t('qualityLab.emptyList')}
                  </div>
                ) : (
                  <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                    <ul ref={listRef} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
                      {listPageSlice.map((lt) => (
                        <li
                          key={lt.id}
                          className={splitListCardClass(
                            selected?.id === lt.id,
                            'flex min-h-0 shrink-0 px-2 py-1.5',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedId(lt.id)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="text-sm font-semibold text-black dark:text-white">{lt.testCode}</p>
                            <p className="text-xs text-black/70 dark:text-white/70">
                              {catalogLabel(lt.testTypeId)}
                            </p>
                            <ValidityStatusBadge
                              startDate={lt.validityStartDate}
                              endDate={lt.validityEndDate}
                              className="mt-1"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                    {gl ? (
                      <div className="glass-card glass-card--static project-mgmt-footer-panel sticky bottom-0 z-10 mt-2 shrink-0 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p>
                            {listPageStart}-{listPageEnd} / {list.length}
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
                      <div className="mt-1.5 flex shrink-0 justify-between border-t border-black/15 pt-2.5 text-[11px]">
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
                panelIdPrefix="quality-lab"
                selectedLabel={t('qualityShared.selectedRecord')}
                title={selected.testCode}
                subtitle={catalogLabel(selected.testTypeId)}
                headerActions={
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={openEdit} className={eiSplitHeaderButtonPassive}>
                      {t('qualityInput.edit')}
                    </button>
                    <ValidityStatusBadge
                      startDate={selected.validityStartDate}
                      endDate={selected.validityEndDate}
                    />
                  </div>
                }
                tabs={detailTabs}
                activeTab={detailTab}
                onTabChange={(id) => setDetailTab(id as DetailTab)}
              >
                {detailTab === 'general' ? (
                  <QualityDetailFieldsGrid>
                    <QualityDetailField
                      label={t('qualityLab.field.testDate')}
                      value={selected.testDate}
                    />
                    <QualityDetailField
                      label={t('qualityLab.field.laboratory')}
                      value={selected.laboratory}
                    />
                    <QualityDetailField
                      label={t('qualityLab.field.responsible')}
                      value={selected.responsible}
                    />
                    <QualityDetailField
                      label={t('qualityLab.field.validityStart')}
                      value={selected.validityStartDate}
                    />
                    <QualityDetailField
                      label={t('qualityLab.field.validityEnd')}
                      value={selected.validityEndDate}
                    />
                    <QualityDetailField
                      label={t('qualityLab.field.resultStatus')}
                      value={t(`qualityLab.result.${selected.resultStatus}`)}
                    />
                  </QualityDetailFieldsGrid>
                ) : null}
                {detailTab === 'results' ? (
                  <QualityDetailSection title={t('qualityLab.section.results')}>
                    <QualityDetailResultsTable
                      rows={selected.results}
                      onValueChange={updateResult}
                    />
                  </QualityDetailSection>
                ) : null}
                {detailTab === 'links' ? (
                  <QualityDetailSection title={t('qualityLab.section.links')}>
                    <QualityDetailList
                      emptyLabel={t('qualityShared.selectEmpty')}
                      items={linkLabels.map((line, i) => ({
                        id: `link-${i}`,
                        title: line,
                      }))}
                    />
                  </QualityDetailSection>
                ) : null}
              </QualityDetailColumn>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-sm text-black/70">
                {t('qualityLab.emptyList')}
              </div>
            )}
          </aside>
        </div>
      </ManagementModuleShell>

      {dialogOpen ? (
        <AppDialog
          open
          title={editId ? t('qualityInput.edit') : t('qualityLab.addNew')}
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
          <LabTestForm draft={draft} setDraft={setDraft} t={t} materials={inputMaterials} recipes={recipes} />
        </AppDialog>
      ) : null}
    </>
  )
}

function buildLinkLabels(
  test: LabTest,
  findMaterial: (id: string) => { systemMaterialCode: string } | undefined,
  findRec: (id: string) => { recipeCode: string } | undefined,
): string[] {
  const parts: string[] = []
  if (test.links.materialId) {
    const m = findMaterial(test.links.materialId)
    parts.push(`Girdi: ${m ? m.systemMaterialCode : test.links.materialId}`)
  }
  if (test.links.recipeId) {
    const r = findRec(test.links.recipeId)
    parts.push(`Reçete: ${r ? r.recipeCode : test.links.recipeId}`)
  }
  if (test.links.sampleId) parts.push(`Numune: ${test.links.sampleId}`)
  if (test.links.workOrderId) parts.push(`Üretim emri: ${test.links.workOrderId}`)
  if (test.links.projectId) parts.push(`Proje: ${test.links.projectId}`)
  return parts
}

function LabTestForm({
  draft,
  setDraft,
  t,
  materials,
  recipes,
}: {
  draft: LabTestDraft
  setDraft: (d: LabTestDraft) => void
  t: (k: string) => string
  materials: { id: string; systemMaterialCode: string }[]
  recipes: { id: string; recipeCode: string }[]
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={appDialogLabelClass}>
        {t('qualityLab.field.testType')}
        <select
          className={appDialogFieldClass}
          value={draft.testTypeId}
          onChange={(e) => setDraft({ ...draft, testTypeId: e.target.value })}
        >
          {QUALITY_TEST_CATALOG.map((c) => (
            <option key={c.id} value={c.id}>
              {t(c.labelKey)}
            </option>
          ))}
        </select>
      </label>
      <label className={appDialogLabelClass}>
        Sonuç
        <select
          className={appDialogFieldClass}
          value={draft.resultStatus}
          onChange={(e) =>
            setDraft({ ...draft, resultStatus: e.target.value as LabTestResultStatus })
          }
        >
          <option value="pending">{t('qualityLab.result.pending')}</option>
          <option value="pass">{t('qualityLab.result.pass')}</option>
          <option value="fail">{t('qualityLab.result.fail')}</option>
        </select>
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityLab.field.testDate')}
        <input
          type="date"
          className={appDialogFieldClass}
          value={draft.testDate}
          onChange={(e) => setDraft({ ...draft, testDate: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityLab.field.laboratory')}
        <input
          className={appDialogFieldClass}
          value={draft.laboratory}
          onChange={(e) => setDraft({ ...draft, laboratory: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityLab.field.responsible')}
        <input
          className={appDialogFieldClass}
          value={draft.responsible}
          onChange={(e) => setDraft({ ...draft, responsible: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityLab.field.validityStart')}
        <input
          type="date"
          className={appDialogFieldClass}
          value={draft.validityStartDate}
          onChange={(e) => setDraft({ ...draft, validityStartDate: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityLab.field.validityEnd')}
        <input
          type="date"
          className={appDialogFieldClass}
          value={draft.validityEndDate}
          onChange={(e) => setDraft({ ...draft, validityEndDate: e.target.value })}
        />
      </label>
      <label className={appDialogLabelClass}>
        Girdi malzeme
        <select
          className={appDialogFieldClass}
          value={draft.links.materialId ?? ''}
          onChange={(e) =>
            setDraft({
              ...draft,
              links: { ...draft.links, materialId: e.target.value || undefined },
            })
          }
        >
          <option value="">{t('qualityShared.selectEmpty')}</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.systemMaterialCode}
            </option>
          ))}
        </select>
      </label>
      <label className={appDialogLabelClass}>
        Beton reçete
        <select
          className={appDialogFieldClass}
          value={draft.links.recipeId ?? ''}
          onChange={(e) =>
            setDraft({
              ...draft,
              links: { ...draft.links, recipeId: e.target.value || undefined },
            })
          }
        >
          <option value="">{t('qualityShared.selectEmpty')}</option>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.recipeCode}
            </option>
          ))}
        </select>
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityLab.field.workOrderId')}
        <input
          className={appDialogFieldClass}
          value={draft.links.workOrderId ?? ''}
          onChange={(e) =>
            setDraft({
              ...draft,
              links: { ...draft.links, workOrderId: e.target.value.trim() || undefined },
            })
          }
          placeholder="UE-2026-0142"
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityLab.field.projectId')}
        <input
          className={appDialogFieldClass}
          value={draft.links.projectId ?? ''}
          onChange={(e) =>
            setDraft({
              ...draft,
              links: { ...draft.links, projectId: e.target.value.trim() || undefined },
            })
          }
          placeholder="PRJ-ANK-01"
        />
      </label>
      <label className={`${appDialogLabelClass} sm:col-span-2`}>
        Numune id (mock)
        <input
          className={appDialogFieldClass}
          value={draft.links.sampleId ?? ''}
          onChange={(e) =>
            setDraft({
              ...draft,
              links: { ...draft.links, sampleId: e.target.value || undefined },
            })
          }
          placeholder="s1"
        />
      </label>
    </div>
  )
}
