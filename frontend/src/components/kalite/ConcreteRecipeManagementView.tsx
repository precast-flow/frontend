import { Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQualityManagement, type ConcreteRecipeDraft } from '../../context/QualityManagementContext'
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
import type { ConcreteRecipeStatus } from '../../data/quality/qualityManagementTypes'
import { RecipeStatusBadge } from './shared/RecipeStatusBadge'
import {
  QualityDetailCard,
  QualityDetailColumn,
  QualityDetailField,
  QualityDetailFieldsGrid,
  QualityDetailList,
  QualityDetailSection,
} from './QualityDetailColumn'
import { QualitySplitPaneResizer } from './QualitySplitPaneResizer'
import { useQualitySplitLayout } from './useQualitySplitLayout'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import '../proje/projectManagementGlassLight.css'

const LIST_PAGE_SIZE = 6

type DetailTab = 'general' | 'trials' | 'approval'

function emptyRecipeDraft(): ConcreteRecipeDraft {
  return {
    recipeCode: '',
    strengthClass: '',
    usagePurpose: '',
    targetStrength: '',
    slump: '',
    cementType: '',
    cementKg: 320,
    aggregates: [{ id: 'a1', name: 'Kum', quantityKg: 750 }],
    waterKg: 165,
    admixtures: [],
    waterCementRatio: 0.5,
    status: 'draft',
  }
}

export function ConcreteRecipeManagementView() {
  const { t } = useI18n()
  const { recipes, addRecipe, publishRecipe, submitRecipeForApproval, addRecipeTrial } =
    useQualityManagement()
  const layout = useQualitySplitLayout('quality-concrete-recipes', 'quality-concrete-recipes')
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
  const [selectedId, setSelectedId] = useState(recipes[0]?.id ?? '')
  const [detailTab, setDetailTab] = useState<DetailTab>('general')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [draft, setDraft] = useState<ConcreteRecipeDraft>(emptyRecipeDraft)
  const [trialOpen, setTrialOpen] = useState(false)
  const [trialSummary, setTrialSummary] = useState('')
  const [trialDate, setTrialDate] = useState(new Date().toISOString().slice(0, 10))

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return recipes
    return recipes.filter(
      (r) =>
        r.recipeCode.toLowerCase().includes(q) ||
        r.strengthClass.toLowerCase().includes(q) ||
        r.usagePurpose.toLowerCase().includes(q),
    )
  }, [recipes, search])

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
    if (list.length && !list.some((r) => r.id === selectedId)) setSelectedId(list[0]!.id)
  }, [list, selectedId])
  useEffect(() => {
    setDetailTab('general')
  }, [selectedId])
  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }, [safeListPage])

  const selected = useMemo(
    () => list.find((r) => r.id === selectedId) ?? list[0] ?? null,
    [list, selectedId],
  )

  const detailTabs = [
    { id: 'general', label: t('qualityRecipe.tab.general') },
    { id: 'trials', label: t('qualityRecipe.tab.trials') },
    { id: 'approval', label: t('qualityRecipe.tab.approval') },
  ]

  const saveNew = () => {
    const row = addRecipe({ ...draft, recipeCode: draft.recipeCode || `RC-NEW-${Date.now()}` })
    setSelectedId(row.id)
    setDialogOpen(false)
  }

  const addTrial = () => {
    if (!selected || !trialSummary.trim()) return
    addRecipeTrial(selected.id, { trialDate, summary: trialSummary, results: [] })
    setTrialOpen(false)
    setTrialSummary('')
  }

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
                      {t('qualityShared.listTitleRecipes')}
                    </h2>
                  </div>
                  <div className="flex min-w-0 w-full flex-wrap items-stretch justify-end gap-2 sm:w-auto sm:flex-1 sm:justify-end">
                    <FilterToolbarSearch
                      id="quality-recipe-search"
                      value={search}
                      onValueChange={setSearch}
                      placeholder={t('qualityInput.searchPlaceholder')}
                      ariaLabel={t('qualityInput.searchAria')}
                      className={gl ? 'project-mgmt-toolbar-search' : ''}
                      inputClassName={gl ? 'glass-input' : ''}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(emptyRecipeDraft())
                        setDialogOpen(true)
                      }}
                      className={eiSplitHeaderButtonPassive}
                    >
                      <Plus className="size-3.5 shrink-0" aria-hidden />
                      <span>{t('qualityRecipe.addNew')}</span>
                    </button>
                  </div>
                </div>

                {list.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-6 text-sm text-black/70">
                    {t('qualityRecipe.emptyList')}
                  </div>
                ) : (
                  <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                    <ul ref={listRef} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
                      {listPageSlice.map((r) => (
                        <li
                          key={r.id}
                          className={splitListCardClass(
                            selected?.id === r.id,
                            'flex min-h-0 shrink-0 items-stretch px-2 py-1.5',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedId(r.id)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-semibold text-black dark:text-white">
                                {r.recipeCode}
                              </span>
                              <RecipeStatusBadge status={r.status} />
                            </p>
                            <p className="mt-0.5 truncate text-xs text-black/70 dark:text-white/70">
                              {r.strengthClass}
                            </p>
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
                panelIdPrefix="quality-recipe"
                selectedLabel={t('qualityShared.selectedRecord')}
                title={selected.recipeCode}
                subtitle={`${selected.strengthClass} · ${selected.usagePurpose}`}
                headerActions={<RecipeStatusBadge status={selected.status} />}
                tabs={detailTabs}
                activeTab={detailTab}
                onTabChange={(id) => setDetailTab(id as DetailTab)}
              >
                {detailTab === 'general' ? (
                  <>
                    <QualityDetailFieldsGrid>
                      <QualityDetailField
                        label={t('qualityRecipe.field.targetStrength')}
                        value={selected.targetStrength}
                      />
                      <QualityDetailField label={t('qualityRecipe.field.slump')} value={selected.slump} />
                      <QualityDetailField
                        label={t('qualityRecipe.field.cementType')}
                        value={selected.cementType}
                      />
                      <QualityDetailField
                        label={t('qualityRecipe.field.cementKg')}
                        value={String(selected.cementKg)}
                      />
                      <QualityDetailField
                        label={t('qualityRecipe.field.waterKg')}
                        value={String(selected.waterKg)}
                      />
                      <QualityDetailField
                        label={t('qualityRecipe.field.wcr')}
                        value={String(selected.waterCementRatio)}
                      />
                    </QualityDetailFieldsGrid>
                    <QualityDetailSection title={t('qualityRecipe.section.aggregates')}>
                      <QualityDetailList
                        items={selected.aggregates.map((a) => ({
                          id: a.id,
                          title: a.name,
                          meta: `${a.quantityKg} kg`,
                        }))}
                      />
                    </QualityDetailSection>
                  </>
                ) : null}
                {detailTab === 'trials' ? (
                  <QualityDetailSection
                    title={t('qualityRecipe.section.trials')}
                    action={
                      <button
                        type="button"
                        disabled={selected.status === 'published'}
                        onClick={() => setTrialOpen(true)}
                        className={eiSplitHeaderButtonPassive}
                      >
                        {t('qualityRecipe.addTrial')}
                      </button>
                    }
                  >
                    <QualityDetailList
                      items={selected.trials.map((tr) => ({
                        id: tr.id,
                        title: tr.trialDate,
                        subtitle: tr.summary,
                      }))}
                    />
                  </QualityDetailSection>
                ) : null}
                {detailTab === 'approval' ? (
                  <QualityDetailSection title={t('qualityRecipe.section.approval')}>
                    <QualityDetailCard className="flex flex-col items-stretch gap-3 sm:items-start">
                      {selected.status === 'draft' ? (
                        <button
                          type="button"
                          onClick={() => submitRecipeForApproval(selected.id)}
                          className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
                        >
                          {t('qualityRecipe.submitApproval')}
                        </button>
                      ) : null}
                      {selected.status === 'pending_approval' ? (
                        <button
                          type="button"
                          onClick={() => publishRecipe(selected.id)}
                          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          {t('qualityRecipe.publish')}
                        </button>
                      ) : null}
                      {selected.status === 'published' ? (
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          {t('qualityRecipe.publishedBadge')}
                        </p>
                      ) : null}
                    </QualityDetailCard>
                  </QualityDetailSection>
                ) : null}
              </QualityDetailColumn>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-sm text-black/70">
                {t('qualityRecipe.emptyList')}
              </div>
            )}
          </aside>
        </div>
      </ManagementModuleShell>

      {dialogOpen ? (
        <AppDialog
          open
          title={t('qualityRecipe.addNew')}
          closeLabel={t('qualityShared.close')}
          onClose={() => setDialogOpen(false)}
          size="lg"
          footer={
            <AppDialogFooter>
              <AppDialogButton variant="secondary" onClick={() => setDialogOpen(false)}>
                {t('qualityShared.cancel')}
              </AppDialogButton>
              <AppDialogButton variant="primary" onClick={saveNew}>
                {t('qualityShared.save')}
              </AppDialogButton>
            </AppDialogFooter>
          }
        >
          <RecipeFormFields draft={draft} setDraft={setDraft} t={t} />
        </AppDialog>
      ) : null}

      {trialOpen && selected ? (
        <AppDialog
          open
          title={t('qualityRecipe.addTrial')}
          closeLabel={t('qualityShared.close')}
          onClose={() => setTrialOpen(false)}
          size="md"
          footer={
            <AppDialogFooter>
              <AppDialogButton variant="secondary" onClick={() => setTrialOpen(false)}>
                {t('qualityShared.cancel')}
              </AppDialogButton>
              <AppDialogButton variant="primary" onClick={addTrial}>
                {t('qualityShared.save')}
              </AppDialogButton>
            </AppDialogFooter>
          }
        >
          <label className={appDialogLabelClass}>
            {t('qualityLab.field.testDate')}
            <input
              type="date"
              className={appDialogFieldClass}
              value={trialDate}
              onChange={(e) => setTrialDate(e.target.value)}
            />
          </label>
          <label className={appDialogLabelClass}>
            Özet
            <textarea
              className={appDialogFieldClass}
              rows={3}
              value={trialSummary}
              onChange={(e) => setTrialSummary(e.target.value)}
            />
          </label>
        </AppDialog>
      ) : null}
    </>
  )
}

function RecipeFormFields({
  draft,
  setDraft,
  t,
}: {
  draft: ConcreteRecipeDraft
  setDraft: (fn: (d: ConcreteRecipeDraft) => ConcreteRecipeDraft) => void
  t: (k: string) => string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={appDialogLabelClass}>
        {t('qualityRecipe.field.recipeCode')}
        <input
          className={appDialogFieldClass}
          value={draft.recipeCode}
          onChange={(e) => setDraft((d) => ({ ...d, recipeCode: e.target.value }))}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityRecipe.field.strengthClass')}
        <input
          className={appDialogFieldClass}
          value={draft.strengthClass}
          onChange={(e) => setDraft((d) => ({ ...d, strengthClass: e.target.value }))}
        />
      </label>
      <label className={`${appDialogLabelClass} sm:col-span-2`}>
        {t('qualityRecipe.field.usage')}
        <input
          className={appDialogFieldClass}
          value={draft.usagePurpose}
          onChange={(e) => setDraft((d) => ({ ...d, usagePurpose: e.target.value }))}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityRecipe.field.targetStrength')}
        <input
          className={appDialogFieldClass}
          value={draft.targetStrength}
          onChange={(e) => setDraft((d) => ({ ...d, targetStrength: e.target.value }))}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityRecipe.field.slump')}
        <input
          className={appDialogFieldClass}
          value={draft.slump}
          onChange={(e) => setDraft((d) => ({ ...d, slump: e.target.value }))}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityRecipe.field.cementType')}
        <input
          className={appDialogFieldClass}
          value={draft.cementType}
          onChange={(e) => setDraft((d) => ({ ...d, cementType: e.target.value }))}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityRecipe.field.cementKg')}
        <input
          type="number"
          className={appDialogFieldClass}
          value={draft.cementKg}
          onChange={(e) => setDraft((d) => ({ ...d, cementKg: Number(e.target.value) || 0 }))}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityRecipe.field.waterKg')}
        <input
          type="number"
          className={appDialogFieldClass}
          value={draft.waterKg}
          onChange={(e) => setDraft((d) => ({ ...d, waterKg: Number(e.target.value) || 0 }))}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityRecipe.field.wcr')}
        <input
          type="number"
          step="0.01"
          className={appDialogFieldClass}
          value={draft.waterCementRatio}
          onChange={(e) => setDraft((d) => ({ ...d, waterCementRatio: Number(e.target.value) || 0 }))}
        />
      </label>
      <label className={appDialogLabelClass}>
        {t('qualityInput.field.status')}
        <select
          className={appDialogFieldClass}
          value={draft.status ?? 'draft'}
          onChange={(e) =>
            setDraft((d) => ({ ...d, status: e.target.value as ConcreteRecipeStatus }))
          }
        >
          <option value="draft">{t('qualityRecipe.status.draft')}</option>
          <option value="pending_approval">{t('qualityRecipe.status.pending')}</option>
        </select>
      </label>
    </div>
  )
}
