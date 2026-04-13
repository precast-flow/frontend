import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '../../../i18n/I18nProvider'
import { useMpts, useMptsBasePath } from '../MptsContext'
import type { MaterialCategory, MaterialItem } from '../types'
import { useMptsBreadcrumb } from '../useMptsBreadcrumb'
import { MptsActionBar } from '../components/MptsActionBar'
import { MptsFormSection } from '../components/MptsFormSection'
import { MptsModal } from '../components/MptsModal'
import { MptsPageHeader } from '../components/MptsPageHeader'

const categories: MaterialCategory[] = [
  'Rebar',
  'Strand',
  'Insert',
  'Lifting Loop',
  'Miscellaneous Items',
  'Assembly Kit',
]

const units = ['EA', 'LB', 'LF', 'CY', 'SF', 'SY']

function emptyItem(): MaterialItem {
  return {
    id: `mi-${Date.now()}`,
    category: 'Rebar',
    materialNum: '',
    embedLabel: '',
    description: '',
    bendType: 'Std',
    materialCost: 0,
    matWeight: 0,
    glCode: '',
    bomUnit: 'EA',
    purchaseUnit: 'EA',
    unitConversion: 1,
    materialWaste: 0,
    orderBy: 10,
    dimLength: 0,
    fileName: null,
    customFields: Array.from({ length: 10 }, () => ''),
    advanceOrder: false,
    active: true,
    production: true,
    cip: false,
    erection: false,
  }
}

export function MaterialItemFormPage({ onCloseModule }: { onCloseModule: () => void }) {
  const { t } = useI18n()
  const bc = useMptsBreadcrumb()
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const { materialItems, saveMaterialItem, pushToast } = useMpts()
  const base = useMptsBasePath()
  const navigate = useNavigate()
  const [form, setForm] = useState<MaterialItem>(() => emptyItem())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [asmOpen, setAsmOpen] = useState(false)
  const [cfOpen, setCfOpen] = useState(false)

  const catLabel = (c: MaterialCategory) => t(`mpts.cat.${c}`)

  useEffect(() => {
    if (isNew) {
      setForm(emptyItem())
      return
    }
    const found = materialItems.find((x) => x.id === id)
    if (found) {
      setForm({
        ...found,
        customFields: [...found.customFields],
      })
    }
  }, [id, isNew, materialItems])

  const validate = () => {
    const e: Record<string, string> = {}
    const req = t('mpts.validation.required')
    if (!form.category) e.category = req
    if (!form.materialNum.trim()) e.materialNum = req
    if (!form.description.trim()) e.description = req
    const dup = materialItems.some((x) => x.materialNum === form.materialNum.trim() && x.id !== form.id)
    if (dup) e.materialNum = t('mpts.materialItem.err.duplicate')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = (close: boolean) => {
    if (!validate()) {
      pushToast({ type: 'error', text: t('mpts.toast.validationFix') })
      return
    }
    saveMaterialItem({ ...form, materialNum: form.materialNum.trim() })
    if (close) navigate(`${base}/catalog/material-items`)
  }

  const field = (
    label: string,
    key: keyof MaterialItem,
    el: 'text' | 'number' | 'textarea',
    required?: boolean,
  ) => (
    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
      {label}
      {required ? <span className="text-red-600"> *</span> : null}
      {el === 'textarea' ? (
        <textarea
          className={`mt-0.5 w-full rounded border px-2 py-1 text-xs dark:bg-slate-900 ${
            errors[String(key)] ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          }`}
          rows={3}
          value={String(form[key] ?? '')}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      ) : (
        <input
          type={el === 'number' ? 'number' : 'text'}
          className={`mt-0.5 w-full rounded border px-2 py-1 text-xs dark:bg-slate-900 ${
            errors[String(key)] ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          }`}
          value={el === 'number' ? (form[key] as number) : String(form[key] ?? '')}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              [key]: el === 'number' ? Number(e.target.value) : e.target.value,
            }))
          }
        />
      )}
      {errors[String(key)] ? <span className="text-[10px] text-red-600">{errors[String(key)]}</span> : null}
    </label>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <MptsPageHeader
        breadcrumb={bc.materialItemForm}
        title={
          isNew
            ? t('mpts.materialItem.newTitle')
            : t('mpts.materialItem.editTitle', { num: form.materialNum || t('mpts.common.dash') })
        }
      />
      <MptsActionBar
        left={null}
        right={
          <>
            <button
              type="button"
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              onClick={() => save(false)}
            >
              {t('mpts.common.save')}
            </button>
            <button
              type="button"
              className="rounded border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
              onClick={() => save(true)}
            >
              {t('mpts.common.saveClose')}
            </button>
            <button
              type="button"
              className="rounded border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-600"
              onClick={() => navigate(`${base}/catalog/material-items`)}
            >
              {t('mpts.common.close')}
            </button>
            <button
              type="button"
              className="rounded border border-amber-500 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-amber-950/40"
              onClick={() => setAsmOpen(true)}
            >
              {t('mpts.materialItem.updateAssemblies')}
            </button>
            <button
              type="button"
              className="rounded px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              onClick={onCloseModule}
            >
              {t('mpts.common.exitModule')}
            </button>
          </>
        }
      />

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <MptsFormSection title={t('mpts.materialItem.section.identity')}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {t('mpts.common.category')} *
              <select
                className={`mt-0.5 w-full rounded border px-2 py-1 text-xs dark:bg-slate-900 ${
                  errors.category ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
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
            {field(t('mpts.field.materialNum'), 'materialNum', 'text', true)}
            {field(t('mpts.field.embedLabel'), 'embedLabel', 'text')}
            {field(t('mpts.field.description'), 'description', 'textarea', true)}
            <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {t('mpts.field.bendType')}
              <select
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.bendType}
                onChange={(e) => setForm((f) => ({ ...f, bendType: e.target.value }))}
              >
                <option value="Std">{t('mpts.materialItem.bend.std')}</option>
                <option value="—">—</option>
                <option value="Custom">{t('mpts.materialItem.bend.custom')}</option>
              </select>
            </label>
            {field(t('mpts.field.glCode'), 'glCode', 'text')}
          </div>
        </MptsFormSection>

        <MptsFormSection title={t('mpts.materialItem.section.units')}>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {t('mpts.materialItem.label.bomUnit')}
              <select
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.bomUnit}
                onChange={(e) => setForm((f) => ({ ...f, bomUnit: e.target.value }))}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {t('mpts.materialItem.label.purchaseUnit')}
              <select
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                value={form.purchaseUnit}
                onChange={(e) => setForm((f) => ({ ...f, purchaseUnit: e.target.value }))}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
            {field(t('mpts.materialItem.label.unitConversion'), 'unitConversion', 'number')}
          </div>
        </MptsFormSection>

        <MptsFormSection title={t('mpts.materialItem.section.cost')}>
          <div className="grid gap-3 md:grid-cols-3">
            {field(t('mpts.field.materialCost'), 'materialCost', 'number')}
            {field(t('mpts.materialItem.label.matWeight'), 'matWeight', 'number')}
            {field(t('mpts.field.dimLength'), 'dimLength', 'number')}
            {field(t('mpts.field.materialWaste'), 'materialWaste', 'number')}
            {field(t('mpts.field.orderBy'), 'orderBy', 'number')}
          </div>
        </MptsFormSection>

        <MptsFormSection title={t('mpts.materialItem.section.attachment')}>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              className="text-xs"
              onChange={(e) => {
                const f = e.target.files?.[0]
                setForm((x) => ({ ...x, fileName: f ? f.name : null }))
              }}
            />
            {form.fileName ? (
              <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] dark:bg-slate-700">
                {form.fileName}
                <button
                  type="button"
                  className="ml-2 text-red-700"
                  onClick={() => setForm((x) => ({ ...x, fileName: null }))}
                >
                  {t('mpts.materialItem.label.remove')}
                </button>
              </span>
            ) : null}
          </div>
        </MptsFormSection>

        <div>
          <button
            type="button"
            className="text-xs font-semibold text-blue-700 underline dark:text-blue-300"
            onClick={() => setCfOpen(!cfOpen)}
          >
            {t('mpts.materialItem.toggleCf', {
              action: cfOpen ? t('mpts.materialItem.hide') : t('mpts.materialItem.show'),
            })}
          </button>
          {cfOpen ? (
            <MptsFormSection title={t('mpts.materialItem.section.cf')} className="mt-2">
              <div className="grid gap-2 md:grid-cols-2">
                {form.customFields.map((v, i) => (
                  <label key={i} className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {t('mpts.materialItem.customFieldN', { n: String(i + 1) })}
                    <input
                      className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                      value={v}
                      onChange={(e) =>
                        setForm((f) => {
                          const cf = [...f.customFields]
                          cf[i] = e.target.value
                          return { ...f, customFields: cf }
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            </MptsFormSection>
          ) : null}
        </div>

        <MptsFormSection title={t('mpts.materialItem.section.flags')}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {(
              [
                ['advanceOrder', 'mpts.materialItem.label.advanceOrder'],
                ['active', 'mpts.materialItem.label.active'],
                ['production', 'mpts.materialItem.label.production'],
                ['cip', 'mpts.materialItem.label.cip'],
                ['erection', 'mpts.materialItem.label.erection'],
              ] as const
            ).map(([k, labKey]) => (
              <label key={k} className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={form[k]}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.checked }))}
                />
                {t(labKey)}
              </label>
            ))}
          </div>
        </MptsFormSection>
      </div>

      <MptsModal
        open={asmOpen}
        title={t('mpts.materialItem.updateAsmModalTitle')}
        onClose={() => setAsmOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded px-3 py-1.5 text-xs" onClick={() => setAsmOpen(false)}>
              {t('mpts.common.cancel')}
            </button>
            <button
              type="button"
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
              onClick={() => {
                pushToast({ type: 'success', text: t('mpts.toast.assemblyLinksRefreshed') })
                setAsmOpen(false)
              }}
            >
              {t('mpts.common.apply')}
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {t('mpts.materialItem.updateAsmBody', { num: form.materialNum || t('mpts.common.dash') })}
        </p>
        <ul className="mt-2 list-inside list-disc text-xs text-slate-600 dark:text-slate-400">
          <li>ASM-2044 (mock)</li>
          <li>ASM-3100 (mock)</li>
        </ul>
      </MptsModal>
    </div>
  )
}
