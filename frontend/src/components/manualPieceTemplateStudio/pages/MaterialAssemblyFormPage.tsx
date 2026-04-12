import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { MPTS_BASE_PATH } from '../constants'
import { useMpts } from '../MptsContext'
import type { AssemblyLine, MaterialAssembly, MaterialCategory } from '../types'
import { MptsActionBar } from '../components/MptsActionBar'
import { MptsFormSection } from '../components/MptsFormSection'
import { MptsDenseTable, MptsTd, MptsTh } from '../components/MptsDenseTable'
import { MptsPageHeader } from '../components/MptsPageHeader'
import { useMptsBreadcrumb } from '../useMptsBreadcrumb'

const categories: MaterialCategory[] = [
  'Rebar',
  'Strand',
  'Insert',
  'Lifting Loop',
  'Miscellaneous Items',
  'Assembly Kit',
]

function newLine(): AssemblyLine {
  return {
    id: `ln-${Date.now()}`,
    category: 'Rebar',
    itemId: '',
    materialNum: '',
    orderBy: 10,
    qty: 1,
    dimLength: 0,
    bendType: 'Std',
    dimA: 0,
    dimB: 0,
    dimC: 0,
    dimD: 0,
    dimE: 0,
    dimF: 0,
  }
}

function emptyAsm(): MaterialAssembly {
  return {
    id: `ma-${Date.now()}`,
    category: 'Assembly Kit',
    materialNum: '',
    embedLabel: '',
    description: '',
    bendType: 'Std',
    glCode: '',
    bomUnit: 'EA',
    purchaseUnit: 'EA',
    unitConversion: 1,
    materialWaste: 0,
    orderBy: 1,
    materialCost: 0,
    matWeight: 0,
    fileName: null,
    advanceOrder: false,
    active: true,
    production: true,
    cip: false,
    erection: false,
    lines: [newLine()],
  }
}

export function MaterialAssemblyFormPage({ onCloseModule }: { onCloseModule: () => void }) {
  const { t } = useI18n()
  const bc = useMptsBreadcrumb()
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const { materialAssemblies, materialItems, saveMaterialAssembly, getMaterialItemById } = useMpts()
  const navigate = useNavigate()
  const [form, setForm] = useState<MaterialAssembly>(() => emptyAsm())

  useEffect(() => {
    if (isNew) {
      setForm(emptyAsm())
      return
    }
    const f = materialAssemblies.find((x) => x.id === id)
    if (f) setForm({ ...f, lines: f.lines.map((l) => ({ ...l })) })
  }, [id, isNew, materialAssemblies])

  const calcCost = useMemo(() => {
    return form.lines.reduce((s, l) => {
      const mi = materialItems.find((m) => m.materialNum === l.materialNum)
      return s + (mi ? mi.materialCost * l.qty : 0)
    }, 0)
  }, [form.lines, materialItems])

  const calcWeight = useMemo(() => {
    return form.lines.reduce((s, l) => {
      const mi = materialItems.find((m) => m.materialNum === l.materialNum)
      return s + (mi ? mi.matWeight * l.qty : 0)
    }, 0)
  }, [form.lines, materialItems])

  const itemsForCategory = (cat: MaterialCategory) => materialItems.filter((m) => m.category === cat)
  const catLabel = (c: MaterialCategory) => t(`mpts.cat.${c}`)

  const save = (close: boolean) => {
    saveMaterialAssembly({
      ...form,
      materialCost: calcCost,
      matWeight: calcWeight,
    })
    if (close) navigate(`${MPTS_BASE_PATH}/catalog/material-assemblies`)
  }

  const updateLine = (lid: string, patch: Partial<AssemblyLine>) => {
    setForm((f) => ({
      ...f,
      lines: f.lines.map((l) => {
        if (l.id !== lid) return l
        const next = { ...l, ...patch }
        if (patch.itemId || patch.materialNum) {
          const mi = patch.itemId
            ? getMaterialItemById(patch.itemId)
            : materialItems.find((m) => m.materialNum === next.materialNum)
          if (mi) {
            next.itemId = mi.id
            next.materialNum = mi.materialNum
            next.category = mi.category
          }
        }
        return next
      }),
    }))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <MptsPageHeader
        breadcrumb={bc.assemblyForm}
        title={
          isNew ? t('mpts.assemblyForm.newTitle') : t('mpts.assemblyForm.editTitle', { num: form.materialNum || t('mpts.common.dash') })
        }
      />
      <MptsActionBar
        left={
          <span
            className="text-slate-600 dark:text-slate-400"
            dangerouslySetInnerHTML={{
              __html: t('mpts.assemblyForm.calcLine', { cost: calcCost.toFixed(2), wt: calcWeight.toFixed(2) }),
            }}
          />
        }
        right={
          <>
            <button
              type="button"
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
              onClick={() => save(false)}
            >
              {t('mpts.common.save')}
            </button>
            <button
              type="button"
              className="rounded border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300"
              onClick={() => save(true)}
            >
              {t('mpts.common.saveClose')}
            </button>
            <button
              type="button"
              className="rounded border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-600"
              onClick={() => navigate(`${MPTS_BASE_PATH}/catalog/material-assemblies`)}
            >
              {t('mpts.common.close')}
            </button>
            <button type="button" className="rounded px-3 py-1.5 text-xs text-slate-600" onClick={onCloseModule}>
              {t('mpts.common.exitModule')}
            </button>
          </>
        }
      />

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <MptsFormSection title={t('mpts.assemblyForm.section.header')}>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-[11px] font-medium">
              {t('mpts.common.category')}
              <select
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as MaterialCategory }))}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {catLabel(c)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-medium">
              {t('mpts.field.materialNum')} *
              <input
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.materialNum}
                onChange={(e) => setForm((f) => ({ ...f, materialNum: e.target.value }))}
              />
            </label>
            <label className="text-[11px] font-medium">
              {t('mpts.field.embedLabel')}
              <input
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.embedLabel}
                onChange={(e) => setForm((f) => ({ ...f, embedLabel: e.target.value }))}
              />
            </label>
            <label className="text-[11px] font-medium md:col-span-2">
              {t('mpts.field.description')} *
              <input
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>
            <label className="text-[11px] font-medium">
              {t('mpts.field.bendType')}
              <select
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.bendType}
                onChange={(e) => setForm((f) => ({ ...f, bendType: e.target.value }))}
              >
                <option value="Std">{t('mpts.materialItem.bend.std')}</option>
                <option value="—">{t('mpts.common.dash')}</option>
              </select>
            </label>
            <label className="text-[11px] font-medium">
              {t('mpts.field.glCode')}
              <input
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.glCode}
                onChange={(e) => setForm((f) => ({ ...f, glCode: e.target.value }))}
              />
            </label>
            <label className="text-[11px] font-medium">
              {t('mpts.materialItem.label.bomUnit')}
              <input
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.bomUnit}
                onChange={(e) => setForm((f) => ({ ...f, bomUnit: e.target.value }))}
              />
            </label>
            <label className="text-[11px] font-medium">
              {t('mpts.materialItem.label.purchaseUnit')}
              <input
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.purchaseUnit}
                onChange={(e) => setForm((f) => ({ ...f, purchaseUnit: e.target.value }))}
              />
            </label>
            <label className="text-[11px] font-medium">
              {t('mpts.materialItem.label.unitConversion')}
              <input
                type="number"
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.unitConversion}
                onChange={(e) => setForm((f) => ({ ...f, unitConversion: Number(e.target.value) }))}
              />
            </label>
            <label className="text-[11px] font-medium">
              {t('mpts.field.materialWaste')}
              <input
                type="number"
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.materialWaste}
                onChange={(e) => setForm((f) => ({ ...f, materialWaste: Number(e.target.value) }))}
              />
            </label>
            <label className="text-[11px] font-medium">
              {t('mpts.field.orderBy')}
              <input
                type="number"
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.orderBy}
                onChange={(e) => setForm((f) => ({ ...f, orderBy: Number(e.target.value) }))}
              />
            </label>
            <label className="text-[11px] font-medium">
              {t('mpts.assemblyForm.label.materialCostEntry')}
              <input
                type="number"
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.materialCost}
                onChange={(e) => setForm((f) => ({ ...f, materialCost: Number(e.target.value) }))}
              />
            </label>
            <div className="text-[11px] font-medium">
              {t('mpts.assemblyForm.label.calcCost')}
              <div className="mt-0.5 rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs tabular-nums text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                {calcCost.toFixed(2)}{' '}
                <span className="text-[10px] text-slate-500">{t('mpts.assemblyForm.calcBadge')}</span>
              </div>
            </div>
            <label className="text-[11px] font-medium">
              {t('mpts.assemblyForm.label.matWeightEntry')}
              <input
                type="number"
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.matWeight}
                onChange={(e) => setForm((f) => ({ ...f, matWeight: Number(e.target.value) }))}
              />
            </label>
            <div className="text-[11px] font-medium">
              {t('mpts.assemblyForm.label.calcWeight')}
              <div className="mt-0.5 rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs tabular-nums dark:border-slate-600 dark:bg-slate-800">
                {calcWeight.toFixed(2)}{' '}
                <span className="text-[10px] text-slate-500">{t('mpts.assemblyForm.calcBadge')}</span>
              </div>
            </div>
            <label className="text-[11px] font-medium md:col-span-3">
              {t('mpts.tpl.label.file')}
              <input
                type="file"
                className="mt-0.5 block text-xs"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  setForm((f) => ({ ...f, fileName: file ? file.name : null }))
                }}
              />
              {form.fileName ? <span className="ml-2 text-[11px]">{form.fileName}</span> : null}
            </label>
            <div className="flex flex-wrap gap-3 md:col-span-3">
              {(
                [
                  ['advanceOrder', t('mpts.materialItem.label.advanceOrder')],
                  ['active', t('mpts.common.active')],
                  ['production', t('mpts.materialItem.label.production')],
                  ['cip', t('mpts.materialItem.label.cip')],
                  ['erection', t('mpts.materialItem.label.erection')],
                ] as const
              ).map(([k, lab]) => (
                <label key={k} className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={form[k]}
                    onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.checked }))}
                  />
                  {lab}
                </label>
              ))}
            </div>
          </div>
        </MptsFormSection>

        <MptsFormSection title={t('mpts.assemblyForm.section.subItems')}>
          <div className="mb-2 flex justify-between gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white"
              onClick={() => setForm((f) => ({ ...f, lines: [...f.lines, newLine()] }))}
            >
              <Plus className="h-3 w-3" /> {t('mpts.tpl.addRow')}
            </button>
          </div>
          <div className="max-h-[420px] overflow-auto">
            <MptsDenseTable>
              <thead>
                <tr>
                  <MptsTh />
                  <MptsTh>{t('mpts.common.category')}</MptsTh>
                  <MptsTh>{t('mpts.assemblies.th.item')}</MptsTh>
                  <MptsTh className="text-right">{t('mpts.field.orderBy')}</MptsTh>
                  <MptsTh className="text-right">{t('mpts.field.qty')}</MptsTh>
                  <MptsTh className="text-right">{t('mpts.field.dimLength')}</MptsTh>
                  <MptsTh>{t('mpts.field.bendType')}</MptsTh>
                  <MptsTh className="text-right">A</MptsTh>
                  <MptsTh className="text-right">B</MptsTh>
                  <MptsTh className="text-right">C</MptsTh>
                  <MptsTh className="text-right">D</MptsTh>
                  <MptsTh className="text-right">E</MptsTh>
                  <MptsTh className="text-right">F</MptsTh>
                </tr>
              </thead>
              <tbody>
                {form.lines.map((l) => (
                  <tr key={l.id}>
                    <MptsTd>
                      <button
                        type="button"
                        className="text-red-600"
                        aria-label={t('mpts.common.delete')}
                        onClick={() => setForm((f) => ({ ...f, lines: f.lines.filter((x) => x.id !== l.id) }))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </MptsTd>
                    <MptsTd>
                      <select
                        className="w-full min-w-[100px] rounded border border-slate-300 px-1 py-0.5 text-[11px] dark:border-slate-600 dark:bg-slate-900"
                        value={l.category}
                        onChange={(e) => {
                          const cat = e.target.value as MaterialCategory
                          updateLine(l.id, { category: cat, itemId: '', materialNum: '' })
                        }}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {catLabel(c)}
                          </option>
                        ))}
                      </select>
                    </MptsTd>
                    <MptsTd>
                      <select
                        className="w-full min-w-[120px] rounded border border-slate-300 px-1 py-0.5 font-mono text-[11px] dark:border-slate-600 dark:bg-slate-900"
                        value={l.itemId}
                        onChange={(e) => {
                          const iid = e.target.value
                          const mi = materialItems.find((m) => m.id === iid)
                          updateLine(l.id, {
                            itemId: iid,
                            materialNum: mi?.materialNum ?? '',
                          })
                        }}
                      >
                        <option value="">{t('mpts.common.dash')}</option>
                        {itemsForCategory(l.category).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.materialNum}
                          </option>
                        ))}
                      </select>
                    </MptsTd>
                    <MptsTd className="text-right">
                      <input
                        type="number"
                        className="w-14 rounded border border-slate-300 px-1 py-0.5 text-right text-[11px] dark:border-slate-600 dark:bg-slate-900"
                        value={l.orderBy}
                        onChange={(e) => updateLine(l.id, { orderBy: Number(e.target.value) })}
                      />
                    </MptsTd>
                    <MptsTd className="text-right">
                      <input
                        type="number"
                        className="w-16 rounded border border-slate-300 px-1 py-0.5 text-right text-[11px] dark:border-slate-600 dark:bg-slate-900"
                        value={l.qty}
                        onChange={(e) => updateLine(l.id, { qty: Number(e.target.value) })}
                      />
                    </MptsTd>
                    <MptsTd className="text-right">
                      <input
                        type="number"
                        className="w-16 rounded border border-slate-300 px-1 py-0.5 text-right text-[11px] dark:border-slate-600 dark:bg-slate-900"
                        value={l.dimLength}
                        onChange={(e) => updateLine(l.id, { dimLength: Number(e.target.value) })}
                      />
                    </MptsTd>
                    <MptsTd>
                      <input
                        className="w-16 rounded border border-slate-300 px-1 py-0.5 text-[11px] dark:border-slate-600 dark:bg-slate-900"
                        value={l.bendType}
                        onChange={(e) => updateLine(l.id, { bendType: e.target.value })}
                      />
                    </MptsTd>
                    {(['dimA', 'dimB', 'dimC', 'dimD', 'dimE', 'dimF'] as const).map((dk) => (
                      <MptsTd key={dk} className="text-right">
                        <input
                          type="number"
                          className="w-14 rounded border border-slate-300 px-1 py-0.5 text-right text-[11px] dark:border-slate-600 dark:bg-slate-900"
                          value={l[dk]}
                          onChange={(e) => updateLine(l.id, { [dk]: Number(e.target.value) } as Partial<AssemblyLine>)}
                        />
                      </MptsTd>
                    ))}
                  </tr>
                ))}
              </tbody>
            </MptsDenseTable>
          </div>
        </MptsFormSection>
      </div>
    </div>
  )
}
