import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { MPTS_BASE_PATH } from '../constants'
import { useMpts } from '../MptsContext'
import type { CostRow, MaterialCategory, PieceMarkTemplate } from '../types'
import { createEmptyTemplate } from '../templateEmpty'
import { MptsActionBar } from '../components/MptsActionBar'
import { MptsBadge } from '../components/MptsBadge'
import { MptsDenseTable, MptsTd, MptsTh } from '../components/MptsDenseTable'
import { MptsFormSection } from '../components/MptsFormSection'
import { MptsPageHeader } from '../components/MptsPageHeader'
import { MptsTabPanel, MptsTabs, type TabItem } from '../components/MptsTabs'
import { useMptsBreadcrumb } from '../useMptsBreadcrumb'

const cats: MaterialCategory[] = [
  'Rebar',
  'Strand',
  'Insert',
  'Lifting Loop',
  'Miscellaneous Items',
  'Assembly Kit',
]

function uid(p: string) {
  return `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
}

export function PieceMarkTemplateDetailPage({ onCloseModule }: { onCloseModule: () => void }) {
  const { t } = useI18n()
  const bc = useMptsBreadcrumb()
  const tabs: TabItem[] = useMemo(
    () => [
      { id: 'piece-mark', label: t('mpts.tpl.tab.pieceMark') },
      { id: 'material-items', label: t('mpts.tpl.tab.materialItems') },
      { id: 'material-assemblies', label: t('mpts.tpl.tab.materialAssemblies') },
      { id: 'costs', label: t('mpts.tpl.tab.costs') },
    ],
    [t],
  )
  const { templateId } = useParams<{ templateId: string }>()
  const isNew = templateId === 'new'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'piece-mark'
  const setTab = (id: string) => {
    setSearchParams({ tab: id }, { replace: true })
  }

  const { materialItems, materialAssemblies, saveTemplate, templates } = useMpts()
  const [form, setForm] = useState<PieceMarkTemplate>(() => createEmptyTemplate('new-draft'))

  useEffect(() => {
    if (isNew) {
      setForm(createEmptyTemplate(uid('tpl')))
      return
    }
    const found = templates.find((x) => x.id === templateId)
    if (found) {
      setForm({
        ...found,
        header: { ...found.header, addWork: [...found.header.addWork] },
        materialItems: found.materialItems.map((m) => ({ ...m })),
        materialAssemblies: found.materialAssemblies.map((m) => ({ ...m })),
        costs: found.costs.map((c) => ({ ...c })),
      })
    }
  }, [templateId, isNew, templates])

  const totalCy = useMemo(
    () => (form.header.structCy + form.header.archCy).toFixed(2),
    [form.header.structCy, form.header.archCy],
  )
  const totalSf = useMemo(
    () => (form.header.structSf + form.header.archSf).toFixed(1),
    [form.header.structSf, form.header.archSf],
  )

  const syncListFromHeader = (h: PieceMarkTemplate['header']): Partial<PieceMarkTemplate> => ({
    description: h.description,
    pieceMark: h.pieceMark,
    active: h.active,
    location: h.location,
    productCategory: h.productCategory,
    productCode: h.productCode,
    crossSection: h.crossSection,
  })

  const save = (close: boolean) => {
    if (!form.header.pieceMark.trim() || !form.header.location.trim()) {
      return
    }
    const payload: PieceMarkTemplate = {
      ...form,
      ...syncListFromHeader(form.header),
      header: { ...form.header },
    }
    saveTemplate(payload)
    if (isNew) {
      navigate(`${MPTS_BASE_PATH}/templates/piece-mark-templates/${payload.id}`, { replace: true })
    }
    if (close) navigate(`${MPTS_BASE_PATH}/templates/piece-mark-templates`)
  }

  const pickMaterial = (cat: MaterialCategory, materialNum: string) => {
    const mi = materialItems.find((m) => m.category === cat && m.materialNum === materialNum)
    if (!mi) return { description: '', cost: 0, weight: 0, unit: 'EA', bendType: '—', embed: '', dl: 0 }
    return {
      description: mi.description,
      cost: mi.materialCost,
      weight: mi.matWeight,
      unit: mi.bomUnit,
      bendType: mi.bendType,
      embed: mi.embedLabel,
      dl: mi.dimLength,
    }
  }

  const pickAsm = (materialNum: string) => {
    const a = materialAssemblies.find((x) => x.materialNum === materialNum)
    if (!a)
      return { description: '', cost: 0, weight: 0, unit: 'EA', bend: '—', embed: '', dl: 0 }
    return {
      description: a.description,
      cost: a.materialCost,
      weight: a.matWeight,
      unit: a.bomUnit,
      bend: a.bendType,
      embed: a.embedLabel,
      dl: 0,
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <MptsPageHeader
        breadcrumb={bc.templateDetail}
        title={form.pieceMark || t('mpts.tpl.newTitle')}
        badge={<MptsBadge variant="template">{t('mpts.tpl.badge.template')}</MptsBadge>}
      />
      <div className="okan-liquid-panel-nested mb-2 border-sky-400/20 bg-sky-50/40 px-3 py-2 text-xs text-slate-800 dark:bg-sky-950/30 dark:text-slate-100">
        <span className="font-semibold">{form.description || t('mpts.common.dash')}</span>
        <span className="mx-2 text-slate-400">|</span>
        {form.header.pieceMark || t('mpts.common.dash')} · {form.header.location} · {t('mpts.tpl.revLabel', { rev: form.header.rev })}
      </div>
      <MptsActionBar
        left={null}
        right={
          <>
            <button type="button" className="okan-liquid-btn-primary px-3 py-2 text-xs font-semibold" onClick={() => save(false)}>
              {t('mpts.common.save')}
            </button>
            <button
              type="button"
              className="okan-liquid-btn-secondary px-3 py-2 text-xs font-semibold"
              onClick={() => save(true)}
            >
              {t('mpts.common.saveClose')}
            </button>
            <button
              type="button"
              className="okan-liquid-btn-secondary px-3 py-2 text-xs font-semibold"
              onClick={() => navigate(`${MPTS_BASE_PATH}/templates/piece-mark-templates`)}
            >
              {t('mpts.common.close')}
            </button>
            <button type="button" className="okan-liquid-btn-secondary px-3 py-2 text-xs font-semibold" onClick={onCloseModule}>
              {t('mpts.common.exitModule')}
            </button>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <MptsTabs tabs={tabs} active={tab} onChange={setTab} />

      <MptsTabPanel active={tab} id="piece-mark">
        <div className="space-y-3">
          <MptsFormSection title={t('mpts.tpl.section.identity')}>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-[11px] font-medium">
                {t('mpts.field.description')}
                <textarea
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  rows={2}
                  value={form.header.description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      header: { ...f.header, description: e.target.value },
                      description: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.field.pieceMark')} *
                <input
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.pieceMark}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      header: { ...f.header, pieceMark: e.target.value },
                      pieceMark: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-[11px] font-medium">
                <input
                  type="checkbox"
                  checked={form.header.active}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      header: { ...f.header, active: e.target.checked },
                      active: e.target.checked,
                    }))
                  }
                />
                {t('mpts.common.active')}
              </label>
              <label className="text-[11px] font-medium md:col-span-2">
                {t('mpts.tpl.label.file')}
                <input
                  type="file"
                  className="mt-0.5 block text-xs"
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      header: { ...f.header, fileName: e.target.files?.[0]?.name ?? null },
                    }))
                  }
                />
                {form.header.fileName ? <span className="ml-2 text-[11px]">{form.header.fileName}</span> : null}
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.field.location')} *
                <input
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.location}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      header: { ...f.header, location: e.target.value },
                      location: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.field.productCategory')}
                <input
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.productCategory}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      header: { ...f.header, productCategory: e.target.value },
                      productCategory: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.field.productCode')}
                <input
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.productCode}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      header: { ...f.header, productCode: e.target.value },
                      productCode: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.field.crossSection')}
                <input
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.crossSection}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      header: { ...f.header, crossSection: e.target.value },
                      crossSection: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-[11px] font-medium md:col-span-3">
                {t('mpts.field.note')}
                <textarea
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  rows={2}
                  value={form.header.note}
                  onChange={(e) => setForm((f) => ({ ...f, header: { ...f.header, note: e.target.value } }))}
                />
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.field.rev')}
                <input
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.rev}
                  onChange={(e) => setForm((f) => ({ ...f, header: { ...f.header, rev: e.target.value } }))}
                />
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.tpl.label.revText')}
                <input
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.revText}
                  onChange={(e) => setForm((f) => ({ ...f, header: { ...f.header, revText: e.target.value } }))}
                />
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.tpl.label.revDate')}
                <input
                  type="date"
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.revDate}
                  onChange={(e) => setForm((f) => ({ ...f, header: { ...f.header, revDate: e.target.value } }))}
                />
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.tpl.label.returnLegs')}
                <input
                  type="number"
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.returnLegs}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, header: { ...f.header, returnLegs: Number(e.target.value) } }))
                  }
                />
              </label>
            </div>
          </MptsFormSection>

          <MptsFormSection title={t('mpts.tpl.section.dimensions')}>
            <div className="grid gap-3 md:grid-cols-3">
              <DimTriplet
                label={t('mpts.piece.edit.dim.length')}
                ft={form.header.lengthFt}
                inch={form.header.lengthIn}
                frac={form.header.lengthFrac}
                onFt={(v) => setForm((f) => ({ ...f, header: { ...f.header, lengthFt: v } }))}
                onIn={(v) => setForm((f) => ({ ...f, header: { ...f.header, lengthIn: v } }))}
                onFrac={(v) => setForm((f) => ({ ...f, header: { ...f.header, lengthFrac: v } }))}
              />
              <DimTriplet
                label={t('mpts.piece.edit.dim.width')}
                ft={form.header.widthFt}
                inch={form.header.widthIn}
                frac={form.header.widthFrac}
                onFt={(v) => setForm((f) => ({ ...f, header: { ...f.header, widthFt: v } }))}
                onIn={(v) => setForm((f) => ({ ...f, header: { ...f.header, widthIn: v } }))}
                onFrac={(v) => setForm((f) => ({ ...f, header: { ...f.header, widthFrac: v } }))}
              />
              <DimTriplet
                label={t('mpts.piece.edit.dim.depth')}
                ft={form.header.depthFt}
                inch={form.header.depthIn}
                frac={form.header.depthFrac}
                onFt={(v) => setForm((f) => ({ ...f, header: { ...f.header, depthFt: v } }))}
                onIn={(v) => setForm((f) => ({ ...f, header: { ...f.header, depthIn: v } }))}
                onFrac={(v) => setForm((f) => ({ ...f, header: { ...f.header, depthFrac: v } }))}
              />
              <label className="text-[11px] font-medium">
                {t('mpts.piece.edit.label.weight')}
                <input
                  type="number"
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.weight}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, header: { ...f.header, weight: Number(e.target.value) } }))
                  }
                />
              </label>
            </div>
          </MptsFormSection>

          <MptsFormSection title={t('mpts.tpl.section.volumes')}>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-[11px] font-medium">
                {t('mpts.tpl.label.structCy')}
                <input
                  type="number"
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.structCy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, header: { ...f.header, structCy: Number(e.target.value) } }))
                  }
                />
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.tpl.label.archCy')}
                <input
                  type="number"
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.archCy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, header: { ...f.header, archCy: Number(e.target.value) } }))
                  }
                />
              </label>
              <div className="text-[11px] font-medium">
                {t('mpts.tpl.label.totalCy')}{' '}
                <span className="text-[10px] text-slate-500">{t('mpts.common.calculated')}</span>
                <div className="mt-0.5 rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs tabular-nums dark:border-slate-600 dark:bg-slate-800">
                  {totalCy}
                </div>
              </div>
              <label className="text-[11px] font-medium">
                {t('mpts.tpl.label.releaseStr')}
                <input
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.releaseStr}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, header: { ...f.header, releaseStr: e.target.value } }))
                  }
                />
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.tpl.label.structSf')}
                <input
                  type="number"
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.structSf}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, header: { ...f.header, structSf: Number(e.target.value) } }))
                  }
                />
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.tpl.label.archSf')}
                <input
                  type="number"
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.archSf}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, header: { ...f.header, archSf: Number(e.target.value) } }))
                  }
                />
              </label>
              <div className="text-[11px] font-medium">
                {t('mpts.tpl.label.totalSf')}{' '}
                <span className="text-[10px] text-slate-500">{t('mpts.common.calculated')}</span>
                <div className="mt-0.5 rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs tabular-nums dark:border-slate-600 dark:bg-slate-800">
                  {totalSf}
                </div>
              </div>
              <label className="text-[11px] font-medium">
                {t('mpts.tpl.label.day28Release')}
                <input
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.day28Release}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, header: { ...f.header, day28Release: e.target.value } }))
                  }
                />
              </label>
            </div>
          </MptsFormSection>

          <MptsFormSection title={t('mpts.tpl.section.brace')}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-[11px] font-medium">
                {t('mpts.tpl.label.braceType')}
                <input
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.braceType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, header: { ...f.header, braceType: e.target.value } }))
                  }
                />
              </label>
              <label className="text-[11px] font-medium">
                {t('mpts.tpl.label.braceQty')}
                <input
                  type="number"
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.braceQty}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, header: { ...f.header, braceQty: Number(e.target.value) } }))
                  }
                />
              </label>
              <div className="md:col-span-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {form.header.addWork.map((v, i) => (
                  <label key={i} className="flex items-center gap-2 text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={v}
                      onChange={(e) =>
                        setForm((f) => {
                          const aw = [...f.header.addWork]
                          aw[i] = e.target.checked
                          return { ...f, header: { ...f.header, addWork: aw } }
                        })
                      }
                    />
                    {t('mpts.tpl.addWorkN', { n: String(i + 1) })}
                  </label>
                ))}
              </div>
            </div>
          </MptsFormSection>
        </div>
      </MptsTabPanel>

      <MptsTabPanel active={tab} id="material-items">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="okan-liquid-panel-nested px-2 py-1 text-[11px] text-slate-800 dark:text-slate-200">
          {form.description} · {form.header.location}
        </div>
        <button
          type="button"
          className="okan-liquid-btn-primary mb-0 w-fit px-2 py-1 text-[11px]"
          onClick={() =>
            setForm((f) => ({
              ...f,
              materialItems: [
                ...f.materialItems,
                {
                  id: uid('tm'),
                  category: 'Rebar',
                  materialNum: '',
                  embedLabel: '',
                  description: '',
                  qty: 1,
                  cost: 0,
                  weight: 0,
                  unit: 'LB',
                  bendType: 'Std',
                  dimLength: 0,
                },
              ],
            }))
          }
        >
          <Plus className="mr-1 inline h-3 w-3" />
          {t('mpts.tpl.addRow')}
        </button>
        <div className="min-h-0 flex-1 overflow-auto">
          <MptsDenseTable>
            <thead>
              <tr>
                <MptsTh />
                <MptsTh>{t('mpts.tpl.th.type')}</MptsTh>
                <MptsTh>{t('mpts.common.category')}</MptsTh>
                <MptsTh>{t('mpts.field.materialNum')}</MptsTh>
                <MptsTh>{t('mpts.tpl.th.embed')}</MptsTh>
                <MptsTh>{t('mpts.field.description')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.field.qty')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.th.cost')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.th.total')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.th.weight')}</MptsTh>
                <MptsTh>{t('mpts.tpl.th.unit')}</MptsTh>
                <MptsTh>{t('mpts.tpl.th.bend')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.th.dimL')}</MptsTh>
              </tr>
            </thead>
            <tbody>
              {form.materialItems.map((row) => {
                const total = row.qty * row.cost
                return (
                  <tr key={row.id} className="border-l-4 border-amber-400">
                    <MptsTd>
                      <button
                        type="button"
                        className="text-red-600"
                        aria-label={t('mpts.common.delete')}
                        onClick={() => setForm((f) => ({ ...f, materialItems: f.materialItems.filter((x) => x.id !== row.id) }))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </MptsTd>
                    <MptsTd>
                      <MptsBadge variant="default">{t('mpts.matRow.type.mat')}</MptsBadge>
                    </MptsTd>
                    <MptsTd>
                      <select
                        className="max-w-[110px] rounded border px-1 py-0.5 text-[11px]"
                        value={row.category}
                        onChange={(e) => {
                          const cat = e.target.value as MaterialCategory
                          setForm((f) => ({
                            ...f,
                            materialItems: f.materialItems.map((x) =>
                              x.id === row.id ? { ...x, category: cat, materialNum: '', description: '' } : x,
                            ),
                          }))
                        }}
                      >
                        {cats.map((c) => (
                          <option key={c} value={c}>
                            {t(`mpts.cat.${c}`)}
                          </option>
                        ))}
                      </select>
                    </MptsTd>
                    <MptsTd>
                      <select
                        className="max-w-[120px] font-mono text-[11px]"
                        value={row.materialNum}
                        onChange={(e) => {
                          const num = e.target.value
                          const p = pickMaterial(row.category, num)
                          setForm((f) => ({
                            ...f,
                            materialItems: f.materialItems.map((x) =>
                              x.id === row.id
                                ? {
                                    ...x,
                                    materialNum: num,
                                    description: p.description,
                                    cost: p.cost,
                                    weight: p.weight,
                                    unit: p.unit,
                                    bendType: p.bendType,
                                    embedLabel: p.embed,
                                    dimLength: p.dl,
                                  }
                                : x,
                            ),
                          }))
                        }}
                      >
                        <option value="">{t('mpts.common.dash')}</option>
                        {materialItems
                          .filter((m) => m.category === row.category)
                          .map((m) => (
                            <option key={m.id} value={m.materialNum}>
                              {m.materialNum}
                            </option>
                          ))}
                      </select>
                    </MptsTd>
                    <MptsTd>{row.embedLabel}</MptsTd>
                    <MptsTd>{row.description}</MptsTd>
                    <MptsTd className="text-right">
                      <input
                        type="number"
                        className="w-16 rounded border px-1 py-0.5 text-right text-[11px]"
                        value={row.qty}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            materialItems: f.materialItems.map((x) =>
                              x.id === row.id ? { ...x, qty: Number(e.target.value) } : x,
                            ),
                          }))
                        }
                      />
                    </MptsTd>
                    <MptsTd className="text-right tabular-nums">{row.cost.toFixed(2)}</MptsTd>
                    <MptsTd className="text-right tabular-nums font-medium">{total.toFixed(2)}</MptsTd>
                    <MptsTd className="text-right tabular-nums">{row.weight.toFixed(2)}</MptsTd>
                    <MptsTd>{row.unit}</MptsTd>
                    <MptsTd>{row.bendType}</MptsTd>
                    <MptsTd className="text-right tabular-nums">{row.dimLength}</MptsTd>
                  </tr>
                )
              })}
            </tbody>
          </MptsDenseTable>
        </div>
        <div className="mt-2 flex justify-end gap-4 border-t border-slate-200 pt-2 text-xs dark:border-slate-700">
          <span>
            {t('mpts.tpl.totalCost')}:{' '}
            <strong className="tabular-nums">
              {form.materialItems.reduce((s, r) => s + r.qty * r.cost, 0).toFixed(2)}
            </strong>
          </span>
          <span>
            {t('mpts.tpl.totalWeight')}:{' '}
            <strong className="tabular-nums">
              {form.materialItems.reduce((s, r) => s + r.weight * r.qty, 0).toFixed(2)}
            </strong>
          </span>
        </div>
        </div>
      </MptsTabPanel>

      <MptsTabPanel active={tab} id="material-assemblies">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="okan-liquid-panel-nested px-2 py-1 text-[11px] text-slate-800 dark:text-slate-200">
          {form.description} · {form.header.location}
        </div>
        <button
          type="button"
          className="okan-liquid-btn-primary mb-0 w-fit px-2 py-1 text-[11px]"
          onClick={() =>
            setForm((f) => ({
              ...f,
              materialAssemblies: [
                ...f.materialAssemblies,
                {
                  id: uid('ta'),
                  category: 'Assembly Kit',
                  materialNum: '',
                  embedLabel: '',
                  description: '',
                  qty: 1,
                  cost: 0,
                  weight: 0,
                  unit: 'EA',
                  bendType: 'Std',
                  dimLength: 0,
                },
              ],
            }))
          }
        >
          <Plus className="mr-1 inline h-3 w-3" />
          {t('mpts.tpl.addRow')}
        </button>
        <div className="min-h-0 flex-1 overflow-auto">
          <MptsDenseTable>
            <thead>
              <tr>
                <MptsTh />
                <MptsTh>{t('mpts.tpl.th.type')}</MptsTh>
                <MptsTh>{t('mpts.common.category')}</MptsTh>
                <MptsTh>{t('mpts.field.materialNum')}</MptsTh>
                <MptsTh>{t('mpts.tpl.th.embed')}</MptsTh>
                <MptsTh>{t('mpts.field.description')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.field.qty')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.th.cost')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.th.total')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.th.weight')}</MptsTh>
                <MptsTh>{t('mpts.tpl.th.unit')}</MptsTh>
                <MptsTh>{t('mpts.tpl.th.bend')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.th.dimL')}</MptsTh>
                <MptsTh>{t('mpts.tpl.th.preview')}</MptsTh>
              </tr>
            </thead>
            <tbody>
              {form.materialAssemblies.map((row) => {
                const total = row.qty * row.cost
                const asm = materialAssemblies.find((a) => a.materialNum === row.materialNum)
                return (
                  <tr key={row.id} className="border-l-4 border-indigo-300 bg-indigo-50/40 dark:bg-indigo-950/40">
                    <MptsTd>
                      <button
                        type="button"
                        className="text-red-600"
                        aria-label={t('mpts.common.delete')}
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            materialAssemblies: f.materialAssemblies.filter((x) => x.id !== row.id),
                          }))
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </MptsTd>
                    <MptsTd>
                      <MptsBadge variant="asm">{t('mpts.matRow.type.asm')}</MptsBadge>
                    </MptsTd>
                    <MptsTd>
                      <select
                        className="max-w-[110px] rounded border px-1 py-0.5 text-[11px]"
                        value={row.category}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            materialAssemblies: f.materialAssemblies.map((x) =>
                              x.id === row.id ? { ...x, category: e.target.value as MaterialCategory, materialNum: '' } : x,
                            ),
                          }))
                        }
                      >
                        {cats.map((c) => (
                          <option key={c} value={c}>
                            {t(`mpts.cat.${c}`)}
                          </option>
                        ))}
                      </select>
                    </MptsTd>
                    <MptsTd>
                      <select
                        className="max-w-[120px] font-mono text-[11px]"
                        value={row.materialNum}
                        onChange={(e) => {
                          const num = e.target.value
                          const p = pickAsm(num)
                          setForm((f) => ({
                            ...f,
                            materialAssemblies: f.materialAssemblies.map((x) =>
                              x.id === row.id
                                ? {
                                    ...x,
                                    materialNum: num,
                                    description: p.description,
                                    cost: p.cost,
                                    weight: p.weight,
                                    unit: p.unit,
                                    bendType: p.bend,
                                    embedLabel: p.embed,
                                    dimLength: p.dl,
                                  }
                                : x,
                            ),
                          }))
                        }}
                      >
                        <option value="">{t('mpts.common.dash')}</option>
                        {materialAssemblies
                          .filter((a) => a.category === row.category)
                          .map((a) => (
                            <option key={a.id} value={a.materialNum}>
                              {a.materialNum}
                            </option>
                          ))}
                      </select>
                    </MptsTd>
                    <MptsTd>{row.embedLabel}</MptsTd>
                    <MptsTd>{row.description}</MptsTd>
                    <MptsTd className="text-right">
                      <input
                        type="number"
                        className="w-16 rounded border px-1 py-0.5 text-right text-[11px]"
                        value={row.qty}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            materialAssemblies: f.materialAssemblies.map((x) =>
                              x.id === row.id ? { ...x, qty: Number(e.target.value) } : x,
                            ),
                          }))
                        }
                      />
                    </MptsTd>
                    <MptsTd className="text-right tabular-nums">{row.cost.toFixed(2)}</MptsTd>
                    <MptsTd className="text-right tabular-nums font-medium">{total.toFixed(2)}</MptsTd>
                    <MptsTd className="text-right tabular-nums">{row.weight.toFixed(2)}</MptsTd>
                    <MptsTd>{row.unit}</MptsTd>
                    <MptsTd>{row.bendType}</MptsTd>
                    <MptsTd className="text-right tabular-nums">{row.dimLength}</MptsTd>
                    <MptsTd className="text-[10px] text-slate-600" title={t('mpts.tpl.previewTitle')}>
                      {asm ? t('mpts.tpl.previewLines', { count: String(asm.lines.length) }) : t('mpts.common.dash')}
                    </MptsTd>
                  </tr>
                )
              })}
            </tbody>
          </MptsDenseTable>
        </div>
        <div className="mt-2 flex justify-end gap-4 border-t border-slate-200 pt-2 text-xs dark:border-slate-700">
          <span>
            {t('mpts.tpl.assemblyRows')}: <strong>{form.materialAssemblies.length}</strong>
          </span>
          <span>
            {t('mpts.tpl.totalCost')}:{' '}
            <strong className="tabular-nums">
              {form.materialAssemblies.reduce((s, r) => s + r.qty * r.cost, 0).toFixed(2)}
            </strong>
          </span>
        </div>
        </div>
      </MptsTabPanel>

      <MptsTabPanel active={tab} id="costs">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
        <button
          type="button"
          className="okan-liquid-btn-primary mb-0 w-fit px-2 py-1 text-[11px]"
          onClick={() =>
            setForm((f) => ({
              ...f,
              costs: [
                ...f.costs,
                {
                  id: uid('c'),
                  costType: 'Custom',
                  section: 'Misc',
                  qty: 1,
                  unit: 'LS',
                  cost: 0,
                  calcType: 'Manual',
                  overhead: 0,
                  profit: 0,
                  margin: 0,
                  useTax: false,
                  salesTax: false,
                },
              ],
            }))
          }
        >
          <Plus className="mr-1 inline h-3 w-3" />
          {t('mpts.tpl.addRow')}
        </button>
        <div className="min-h-0 flex-1 overflow-auto">
          <MptsDenseTable>
            <thead>
              <tr>
                <MptsTh />
                <MptsTh>{t('mpts.tpl.cost.costType')}</MptsTh>
                <MptsTh>{t('mpts.tpl.cost.section')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.field.qty')}</MptsTh>
                <MptsTh>{t('mpts.tpl.th.unit')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.th.cost')}</MptsTh>
                <MptsTh>{t('mpts.tpl.cost.calcType')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.cost.overhead')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.cost.profit')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.cost.margin')}</MptsTh>
                <MptsTh>{t('mpts.tpl.cost.useTax')}</MptsTh>
                <MptsTh>{t('mpts.tpl.cost.salesTax')}</MptsTh>
              </tr>
            </thead>
            <tbody>
              {form.costs.map((row: CostRow) => (
                <tr key={row.id}>
                  <MptsTd>
                    <button
                      type="button"
                      className="text-red-600"
                      aria-label={t('mpts.common.delete')}
                      onClick={() => setForm((f) => ({ ...f, costs: f.costs.filter((x) => x.id !== row.id) }))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </MptsTd>
                  <MptsTd>
                    <input
                      className="w-full min-w-[100px] rounded border px-1 py-0.5 text-[11px]"
                      value={row.costType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costs: f.costs.map((x) => (x.id === row.id ? { ...x, costType: e.target.value } : x)),
                        }))
                      }
                    />
                  </MptsTd>
                  <MptsTd>
                    <input
                      className="w-full min-w-[80px] rounded border px-1 py-0.5 text-[11px]"
                      value={row.section}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costs: f.costs.map((x) => (x.id === row.id ? { ...x, section: e.target.value } : x)),
                        }))
                      }
                    />
                  </MptsTd>
                  <MptsTd className="text-right">
                    <input
                      type="number"
                      className="w-16 rounded border px-1 py-0.5 text-right text-[11px]"
                      value={row.qty}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costs: f.costs.map((x) => (x.id === row.id ? { ...x, qty: Number(e.target.value) } : x)),
                        }))
                      }
                    />
                  </MptsTd>
                  <MptsTd>
                    <input
                      className="w-14 rounded border px-1 py-0.5 text-[11px]"
                      value={row.unit}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costs: f.costs.map((x) => (x.id === row.id ? { ...x, unit: e.target.value } : x)),
                        }))
                      }
                    />
                  </MptsTd>
                  <MptsTd className="text-right">
                    <input
                      type="number"
                      className="w-20 rounded border px-1 py-0.5 text-right text-[11px]"
                      value={row.cost}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costs: f.costs.map((x) => (x.id === row.id ? { ...x, cost: Number(e.target.value) } : x)),
                        }))
                      }
                    />
                  </MptsTd>
                  <MptsTd>
                    <select
                      className="rounded border px-1 py-0.5 text-[11px]"
                      value={row.calcType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costs: f.costs.map((x) =>
                            x.id === row.id ? { ...x, calcType: e.target.value as CostRow['calcType'] } : x,
                          ),
                        }))
                      }
                    >
                      <option value="Manual">{t('mpts.tpl.cost.calcManual')}</option>
                      <option value="Rollup">{t('mpts.tpl.cost.calcRollup')}</option>
                      <option value="Formula">{t('mpts.tpl.cost.calcFormula')}</option>
                    </select>
                  </MptsTd>
                  <MptsTd className="text-right">
                    <input
                      type="number"
                      className="w-16 rounded border px-1 py-0.5 text-right text-[11px]"
                      value={row.overhead}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costs: f.costs.map((x) => (x.id === row.id ? { ...x, overhead: Number(e.target.value) } : x)),
                        }))
                      }
                    />
                  </MptsTd>
                  <MptsTd className="text-right">
                    <input
                      type="number"
                      className="w-16 rounded border px-1 py-0.5 text-right text-[11px]"
                      value={row.profit}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costs: f.costs.map((x) => (x.id === row.id ? { ...x, profit: Number(e.target.value) } : x)),
                        }))
                      }
                    />
                  </MptsTd>
                  <MptsTd className="text-right">
                    <input
                      type="number"
                      className="w-14 rounded border px-1 py-0.5 text-right text-[11px]"
                      value={row.margin}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costs: f.costs.map((x) => (x.id === row.id ? { ...x, margin: Number(e.target.value) } : x)),
                        }))
                      }
                    />
                  </MptsTd>
                  <MptsTd>
                    <input
                      type="checkbox"
                      checked={row.useTax}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costs: f.costs.map((x) => (x.id === row.id ? { ...x, useTax: e.target.checked } : x)),
                        }))
                      }
                    />
                  </MptsTd>
                  <MptsTd>
                    <input
                      type="checkbox"
                      checked={row.salesTax}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          costs: f.costs.map((x) => (x.id === row.id ? { ...x, salesTax: e.target.checked } : x)),
                        }))
                      }
                    />
                  </MptsTd>
                </tr>
              ))}
            </tbody>
          </MptsDenseTable>
        </div>
        <div className="mt-2 flex justify-end border-t border-slate-200 pt-2 text-xs dark:border-slate-700">
          <span>
            {t('mpts.tpl.grandTotal')}:{' '}
            <strong className="tabular-nums text-base">
              {form.costs.reduce((s, r) => s + r.cost * r.qty + r.overhead + r.profit, 0).toFixed(2)}
            </strong>
          </span>
        </div>
        </div>
      </MptsTabPanel>
      </div>
    </div>
  )
}

function DimTriplet({
  label,
  ft,
  inch,
  frac,
  onFt,
  onIn,
  onFrac,
}: {
  label: string
  ft: number
  inch: number
  frac: string
  onFt: (n: number) => void
  onIn: (n: number) => void
  onFrac: (s: string) => void
}) {
  return (
    <div className="rounded border border-slate-200 p-2 dark:border-slate-600">
      <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">{label}</p>
      <div className="flex gap-1">
        <input
          type="number"
          className="w-full rounded border px-1 py-0.5 text-[11px]"
          value={ft}
          onChange={(e) => onFt(Number(e.target.value))}
        />
        <input
          type="number"
          className="w-full rounded border px-1 py-0.5 text-[11px]"
          value={inch}
          onChange={(e) => onIn(Number(e.target.value))}
        />
        <input
          className="w-full rounded border px-1 py-0.5 text-[11px]"
          value={frac}
          onChange={(e) => onFrac(e.target.value)}
        />
      </div>
    </div>
  )
}

