import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useFactoryContext } from '../../../../context/FactoryContext'
import { projectManagementCardsMock } from '../../../../data/projectManagementCardsMock'
import { loadProjectProducts } from '../../../../elementIdentity/firm/storage'
import type { ProjectProduct } from '../../../../elementIdentity/types'
import {
  buildPlanPreviewItems,
  weekStartForDayIso,
  type ProjectPlanWizardKind,
} from '../../../../planlama/planPreviewBuilder'
import { PmStyleDialog } from '../../../shared/PmStyleDialog'
import { useGeneralPlanningOptional } from '../../GeneralPlanningContext'
import { usePlanningWizard } from '../../PlanningWizardContext'
import { DISPATCH_MAX_PRODUCTS_PER_TRIP } from '../../../../data/generalPlanningMock'

const GLASS_INPUT =
  'w-full rounded-lg border border-slate-200/50 bg-transparent px-3 py-2 text-sm dark:border-slate-600/50'

type Props = {
  onTimelinePage: boolean
}

function wizardTitleKey(kind: ProjectPlanWizardKind): string {
  switch (kind) {
    case 'project-production':
      return 'planningActions.wizardTitle.production'
    case 'project-dispatch':
      return 'planningActions.wizardTitle.dispatch'
    case 'project-assembly':
      return 'planningActions.wizardTitle.assembly'
    default:
      return 'planningActions.wizardTitle.production'
  }
}

export function PlanningFromProjectWizard({ onTimelinePage }: Props) {
  const { t } = useI18n()
  const location = useLocation()
  const gp = useGeneralPlanningOptional()
  const { factories, selectedFactory } = useFactoryContext()
  const {
    activeWizard,
    closeWizard,
    updateWizard,
    setPreview,
    discardPreview,
    commitPreview,
    navigateToPreviewTarget,
    previewItems,
  } = usePlanningWizard()

  const [projectSearch, setProjectSearch] = useState('')

  useEffect(() => {
    const resume = (location.state as { planningWizardResume?: ProjectPlanWizardKind } | null)
      ?.planningWizardResume
    if (resume && previewItems.length > 0 && gp) {
      const unit = previewItems[0]?.unit
      if (unit) gp.setActiveUnit(unit)
    }
  }, [location.state, previewItems, gp])

  const projects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase()
    if (!q) return projectManagementCardsMock
    return projectManagementCardsMock.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q),
    )
  }, [projectSearch])

  const products = useMemo(() => {
    if (!activeWizard?.projectId) return []
    return loadProjectProducts().filter(
      (p) => p.projectId === activeWizard.projectId && p.status === 'active',
    )
  }, [activeWizard?.projectId])

  const selectedProducts = useMemo(
    () => products.filter((p) => activeWizard?.selectedProductIds.includes(p.id)),
    [products, activeWizard?.selectedProductIds],
  )

  const dispatchGroups = useMemo(() => {
    if (activeWizard?.kind !== 'project-dispatch' || selectedProducts.length === 0) return []
    const max = activeWizard.maxProductsPerTrip || DISPATCH_MAX_PRODUCTS_PER_TRIP
    const groups: ProjectProduct[][] = []
    for (let i = 0; i < selectedProducts.length; i += max) {
      groups.push(selectedProducts.slice(i, i + max))
    }
    return groups
  }, [activeWizard?.kind, activeWizard?.maxProductsPerTrip, selectedProducts])

  if (!activeWizard) return null

  const kind = activeWizard.kind
  const step = activeWizard.step

  const goNext = () => {
    if (step === 'project') updateWizard({ step: 'products' })
    else if (step === 'products') updateWizard({ step: 'config' })
    else if (step === 'config') updateWizard({ step: 'summary' })
  }

  const goBack = () => {
    if (step === 'summary') updateWizard({ step: 'config' })
    else if (step === 'config') updateWizard({ step: 'products' })
    else if (step === 'products') updateWizard({ step: 'project' })
  }

  const buildPreview = () => {
    if (selectedProducts.length === 0) return
    const weekStartMonday =
      gp?.weekStartMonday ?? weekStartForDayIso(activeWizard.startDayIso)
    const projectCode = activeWizard.projectCode

    let items
    if (kind === 'project-production') {
      const factoryByProductId: Record<string, string> = { ...activeWizard.factoryByProductId }
      for (const p of selectedProducts) {
        if (!factoryByProductId[p.id]) {
          factoryByProductId[p.id] = selectedFactory.code
        }
      }
      items = buildPlanPreviewItems({
        kind: 'project-production',
        products: selectedProducts,
        projectCode,
        factoryByProductId,
        startDayIso: activeWizard.startDayIso,
        weekStartMonday,
      })
    } else if (kind === 'project-dispatch') {
      items = buildPlanPreviewItems({
        kind: 'project-dispatch',
        products: selectedProducts,
        projectCode,
        startDayIso: activeWizard.startDayIso,
        weekStartMonday,
        maxProductsPerTrip: activeWizard.maxProductsPerTrip,
      })
    } else {
      items = buildPlanPreviewItems({
        kind: 'project-assembly',
        products: selectedProducts,
        projectCode,
        startDayIso: activeWizard.startDayIso,
        weekStartMonday,
      })
    }

    setPreview(items)
    if (!onTimelinePage) {
      navigateToPreviewTarget(kind)
    }
    updateWizard({ step: 'summary' })
  }

  const handleComplete = () => {
    if (previewItems.length === 0) {
      buildPreview()
      return
    }
    if (commitPreview()) {
      closeWizard()
    }
  }

  const handleClose = () => {
    discardPreview()
    closeWizard()
  }

  const canNextProject = Boolean(activeWizard.projectId)
  const canNextProducts = activeWizard.selectedProductIds.length > 0
  const canNextConfig = Boolean(activeWizard.startDayIso)

  return (
    <PmStyleDialog
      variant="planning"
      title={t(wizardTitleKey(kind))}
      subtitle={activeWizard.projectName || undefined}
      closeLabel={t('planningActions.cancel')}
      onClose={handleClose}
      maxWidthClass="max-w-3xl"
      footer={
        <footer className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {step !== 'project' ? (
              <button
                type="button"
                onClick={goBack}
                className="rounded-lg border border-slate-200/60 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600/50 dark:text-slate-200"
              >
                ←
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200/60 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600/50 dark:text-slate-200"
            >
              {t('planningActions.cancel')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {step === 'summary' ? (
              <>
                <button
                  type="button"
                  onClick={() => discardPreview()}
                  className="rounded-lg border border-slate-200/60 px-4 py-2 text-sm font-medium"
                >
                  {t('planningActions.discardPreview')}
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white dark:bg-sky-500"
                >
                  {t('planningActions.complete')}
                </button>
              </>
            ) : step === 'config' ? (
              <>
                <button
                  type="button"
                  onClick={buildPreview}
                  disabled={!canNextConfig || selectedProducts.length === 0}
                  className="rounded-lg border border-sky-400/60 px-4 py-2 text-sm font-semibold text-sky-800 disabled:opacity-40 dark:text-sky-100"
                >
                  {t('planningActions.previewOnCalendar')}
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canNextConfig}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-sky-500"
                >
                  →
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={
                  (step === 'project' && !canNextProject) ||
                  (step === 'products' && !canNextProducts)
                }
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-sky-500"
              >
                →
              </button>
            )}
          </div>
        </footer>
      }
    >
      <div className="space-y-4 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {step === 'project'
            ? t('planningActions.step.project')
            : step === 'products'
              ? t('planningActions.step.products')
              : step === 'config'
                ? t('planningActions.step.config')
                : t('planningActions.step.summary')}
        </p>

        {step === 'project' ? (
          <>
            <input
              type="search"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              placeholder={t('planningActions.searchProject')}
              className={GLASS_INPUT}
            />
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() =>
                      updateWizard({
                        projectId: p.id,
                        projectCode: p.code,
                        projectName: p.name,
                        selectedProductIds: [],
                        factoryByProductId: {},
                      })
                    }
                    className={[
                      'w-full rounded-lg px-3 py-2 text-left transition',
                      activeWizard.projectId === p.id
                        ? 'bg-sky-500/15 ring-1 ring-sky-400/50'
                        : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                    ].join(' ')}
                  >
                    <span className="font-semibold">{p.code}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{p.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {step === 'products' ? (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border px-2 py-1 text-xs font-semibold"
                onClick={() =>
                  updateWizard({ selectedProductIds: products.map((p) => p.id) })
                }
              >
                {t('planningActions.selectAll')}
              </button>
              <button
                type="button"
                className="rounded-lg border px-2 py-1 text-xs font-semibold"
                onClick={() => updateWizard({ selectedProductIds: [] })}
              >
                {t('planningActions.clearSelection')}
              </button>
              <span className="text-xs text-slate-500">
                {t('planningActions.productCount', {
                  count: String(activeWizard.selectedProductIds.length),
                })}
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-600/45">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="bg-black/[0.04] text-[10px] font-bold uppercase dark:bg-white/[0.06]">
                  <tr>
                    <th className="px-3 py-2 w-8" />
                    <th className="px-3 py-2">Kod</th>
                    <th className="px-3 py-2">Ad</th>
                    <th className="px-3 py-2">Adet</th>
                    <th className="px-3 py-2">m³</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-600/40">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={activeWizard.selectedProductIds.includes(p.id)}
                          onChange={(e) => {
                            const ids = new Set(activeWizard.selectedProductIds)
                            if (e.target.checked) ids.add(p.id)
                            else ids.delete(p.id)
                            updateWizard({ selectedProductIds: [...ids] })
                          }}
                        />
                      </td>
                      <td className="px-3 py-2 font-mono font-semibold">{p.code}</td>
                      <td className="px-3 py-2">{p.name}</td>
                      <td className="px-3 py-2 tabular-nums">{p.quantity ?? '—'}</td>
                      <td className="px-3 py-2 tabular-nums">{p.volumeM3 ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 ? (
                <p className="p-4 text-center text-slate-500">Bu projede aktif ürün yok.</p>
              ) : null}
            </div>
          </>
        ) : null}

        {step === 'config' ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">
                {t('planningActions.startDate')}
              </span>
              <input
                type="date"
                value={activeWizard.startDayIso}
                onChange={(e) => updateWizard({ startDayIso: e.target.value })}
                className={`mt-1 ${GLASS_INPUT}`}
              />
            </label>

            {kind === 'project-production' ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-600/45">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/[0.04] text-[10px] font-bold uppercase dark:bg-white/[0.06]">
                    <tr>
                      <th className="px-3 py-2">Ürün</th>
                      <th className="px-3 py-2">{t('planningActions.factory')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50">
                    {selectedProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2 font-mono">{p.code}</td>
                        <td className="px-3 py-2">
                          <select
                            value={activeWizard.factoryByProductId[p.id] ?? selectedFactory.code}
                            onChange={(e) =>
                              updateWizard({
                                factoryByProductId: {
                                  ...activeWizard.factoryByProductId,
                                  [p.id]: e.target.value,
                                },
                              })
                            }
                            className={GLASS_INPUT}
                          >
                            {factories.map((f) => (
                              <option key={f.code} value={f.code}>
                                {f.name} ({f.code})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {kind === 'project-dispatch' ? (
              <>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    {t('planningActions.maxPerTrip')}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={DISPATCH_MAX_PRODUCTS_PER_TRIP}
                    value={activeWizard.maxProductsPerTrip}
                    onChange={(e) =>
                      updateWizard({
                        maxProductsPerTrip: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className={`mt-1 ${GLASS_INPUT}`}
                  />
                </label>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500">
                    {t('planningActions.dispatchGroupsTitle')}
                  </h4>
                  <ul className="mt-2 space-y-2">
                    {dispatchGroups.map((group, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-slate-200/50 px-3 py-2 text-xs dark:border-slate-600/45"
                      >
                        Kamyon {i + 1}: {group.length} ürün ·{' '}
                        {group.map((p) => p.code).join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {step === 'summary' ? (
          <div className="rounded-xl border border-sky-200/60 bg-sky-50/40 p-4 dark:border-sky-800/40 dark:bg-sky-950/20">
            <p className="font-medium text-slate-900 dark:text-slate-50">
              {previewItems.length > 0
                ? `${previewItems.length} plan öğesi takvimde önizleniyor.`
                : 'Ön izleme için «Takvimde ön izle» adımına dönün.'}
            </p>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              {t('planningActions.complete')} ile plan kaydedilir; mevcut planlar soluk, önizleme canlı
              görünür.
            </p>
          </div>
        ) : null}
      </div>
    </PmStyleDialog>
  )
}
