import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { MPTS_BASE_PATH } from '../constants'
import { useMpts } from '../MptsContext'
import type { JobSpecificMaterialRow, ProductionInstanceRow, ProductionPiece } from '../types'
import { MptsActionBar } from '../components/MptsActionBar'
import { MptsBadge } from '../components/MptsBadge'
import { MptsDenseTable, MptsTd, MptsTh } from '../components/MptsDenseTable'
import { MptsFormSection } from '../components/MptsFormSection'
import { MptsPageHeader } from '../components/MptsPageHeader'
import { MptsTabPanel, MptsTabs, type TabItem } from '../components/MptsTabs'
import { useMptsBreadcrumb } from '../useMptsBreadcrumb'

function uid(p: string) {
  return `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
}

export function EditProductionPiecePage({ onCloseModule }: { onCloseModule: () => void }) {
  const { t } = useI18n()
  const bc = useMptsBreadcrumb()
  const tabs: TabItem[] = useMemo(
    () => [
      { id: 'piece-mark', label: t('mpts.piece.edit.tab.pieceMark') },
      { id: 'standard-material', label: t('mpts.piece.edit.tab.standardMat') },
      { id: 'job-specific', label: t('mpts.piece.edit.tab.jobSpecific') },
    ],
    [t],
  )
  const { pieceId } = useParams<{ pieceId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'piece-mark'
  const setTab = (id: string) => setSearchParams({ tab: id }, { replace: true })

  const { productionPieces, saveProductionPiece, getTemplateById, pushToast } = useMpts()
  const [form, setForm] = useState<ProductionPiece | null>(null)

  useEffect(() => {
    const p = productionPieces.find((x) => x.id === pieceId)
    if (p) {
      setForm({
        ...p,
        header: { ...p.header, addWork: [...p.header.addWork] },
        instances: p.instances.map((i) => ({ ...i, aw: [...i.aw] })),
        standardMaterial: p.standardMaterial.map((s) => ({ ...s })),
        jobSpecificMaterial: p.jobSpecificMaterial.map((j) => ({ ...j })),
      })
    }
  }, [pieceId, productionPieces])

  const tpl = getTemplateById(form?.templateId ?? undefined)

  const released = form?.drawingStatus === 'Released' || form?.header.drawingStatus === 'Released'
  const readOnlyPiece = released

  const save = (close: boolean) => {
    if (!form) return
    saveProductionPiece(form)
    if (close) navigate(`${MPTS_BASE_PATH}/production/piece-marks`)
  }

  if (!form) {
    return <div className="p-4 text-sm text-slate-600">{t('mpts.piece.edit.notFound')}</div>
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <MptsPageHeader
        breadcrumb={bc.productionEdit}
        title={form.pieceMark}
        badge={
          <>
            <MptsBadge variant="job">{t('mpts.piece.edit.badge.instance')}</MptsBadge>
            <MptsBadge variant={released ? 'success' : 'warn'}>
              {released ? t('mpts.production.drawing.released') : t('mpts.production.drawing.notReleased')}
            </MptsBadge>
          </>
        }
      />

      <div className="okan-liquid-panel-nested mb-2 border-amber-400/30 bg-amber-50/50 px-3 py-2 text-xs text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
        <span className="font-semibold">
          {t('mpts.common.job')} {form.header.jobId}
        </span>
        <span className="mx-2">|</span>
        {form.header.location} · {form.header.phase} · {form.header.productCategory}
        {tpl ? (
          <>
            <span className="mx-2">|</span>
            {t('mpts.piece.edit.summaryTemplate', { mark: tpl.pieceMark })}
          </>
        ) : null}
      </div>

      <div className="okan-liquid-panel-nested mb-2 px-3 py-2 text-xs">
        <strong>{form.pieceMark}</strong> · {t('mpts.field.qty')} {form.qty} ·{' '}
        {t(`mpts.drawingStatus.${form.header.drawingStatus}`)}
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
              onClick={() => navigate(`${MPTS_BASE_PATH}/production/piece-marks`)}
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
          <MptsFormSection title={t('mpts.piece.edit.section.header')}>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label={t('mpts.common.job')} value={form.header.jobId} readOnly />
              <Field
                label={t('mpts.field.location')}
                value={form.header.location}
                readOnly={readOnlyPiece}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, location: v } } : f))}
              />
              <Field
                label={t('mpts.field.phase')}
                value={form.header.phase}
                readOnly={readOnlyPiece}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, phase: v } } : f))}
              />
              <Field
                label={t('mpts.field.productCategory')}
                value={form.header.productCategory}
                readOnly={readOnlyPiece}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, productCategory: v } } : f))}
              />
              <Field
                label={t('mpts.piece.edit.label.productType')}
                value={form.header.productType}
                readOnly={readOnlyPiece}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, productType: v } } : f))}
              />
              <Field
                label={t('mpts.field.crossSection')}
                value={form.header.crossSection}
                readOnly={readOnlyPiece}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, crossSection: v } } : f))}
              />
              <Field
                label={t('mpts.field.pieceMark')}
                value={form.header.pieceMark}
                readOnly={readOnlyPiece}
                onChange={(v) =>
                  setForm((f) => (f ? { ...f, header: { ...f.header, pieceMark: v }, pieceMark: v } : f))
                }
              />
              <Field
                label={t('mpts.field.qty')}
                type="number"
                value={String(form.header.qty)}
                readOnly={readOnlyPiece}
                onChange={(v) =>
                  setForm((f) => (f ? { ...f, header: { ...f.header, qty: Number(v) }, qty: Number(v) } : f))
                }
              />
              <label className="text-[11px] font-medium">
                {t('mpts.piece.edit.label.drawingStatus')}
                <select
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  value={form.header.drawingStatus}
                  onChange={(e) =>
                    setForm((f) =>
                      f
                        ? {
                            ...f,
                            header: { ...f.header, drawingStatus: e.target.value },
                            drawingStatus: e.target.value,
                          }
                        : f,
                    )
                  }
                >
                  {(['Draft', 'In Review', 'Released'] as const).map((s) => (
                    <option key={s} value={s}>
                      {t(`mpts.drawingStatus.${s}`)}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label={t('mpts.piece.edit.label.dateIssued')}
                type="date"
                value={form.header.dateIssued}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, dateIssued: v } } : f))}
              />
            </div>
          </MptsFormSection>

          <MptsFormSection title={t('mpts.piece.edit.section.dims')}>
            <div className="grid gap-3 md:grid-cols-3">
              <ProdDimTriplet
                label={t('mpts.piece.edit.dim.length')}
                readOnly={readOnlyPiece}
                ft={form.header.lengthFt}
                inch={form.header.lengthIn}
                frac={form.header.lengthFrac}
                onFt={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, lengthFt: v } } : f))}
                onIn={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, lengthIn: v } } : f))}
                onFrac={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, lengthFrac: v } } : f))}
              />
              <ProdDimTriplet
                label={t('mpts.piece.edit.dim.width')}
                readOnly={readOnlyPiece}
                ft={form.header.widthFt}
                inch={form.header.widthIn}
                frac={form.header.widthFrac}
                onFt={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, widthFt: v } } : f))}
                onIn={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, widthIn: v } } : f))}
                onFrac={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, widthFrac: v } } : f))}
              />
              <ProdDimTriplet
                label={t('mpts.piece.edit.dim.depth')}
                readOnly={readOnlyPiece}
                ft={form.header.depthFt}
                inch={form.header.depthIn}
                frac={form.header.depthFrac}
                onFt={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, depthFt: v } } : f))}
                onIn={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, depthIn: v } } : f))}
                onFrac={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, depthFrac: v } } : f))}
              />
              <Field
                label={t('mpts.piece.edit.label.weight')}
                type="number"
                value={String(form.header.weight)}
                readOnly={readOnlyPiece}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, weight: Number(v) } } : f))}
              />
              <label className="md:col-span-3 text-[11px] font-medium">
                {t('mpts.field.note')}
                <textarea
                  className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                  rows={2}
                  value={form.header.note}
                  onChange={(e) => setForm((f) => (f ? { ...f, header: { ...f.header, note: e.target.value } } : f))}
                />
              </label>
            </div>
          </MptsFormSection>

          <MptsFormSection title={t('mpts.piece.edit.section.revision')}>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label={t('mpts.field.rev')} value={form.header.rev} onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, rev: v } } : f))} />
              <Field
                label={t('mpts.tpl.label.revText')}
                value={form.header.revText}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, revText: v } } : f))}
              />
              <Field
                label={t('mpts.tpl.label.revDate')}
                type="date"
                value={form.header.revDate}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, revDate: v } } : f))}
              />
              <Field
                label={t('mpts.tpl.label.returnLegs')}
                type="number"
                value={String(form.header.returnLegs)}
                onChange={(v) =>
                  setForm((f) => (f ? { ...f, header: { ...f.header, returnLegs: Number(v) } } : f))
                }
              />
            </div>
          </MptsFormSection>

          <MptsFormSection title={t('mpts.piece.edit.section.vol')}>
            <div className="grid gap-3 md:grid-cols-3">
              <Field
                label={t('mpts.tpl.label.structCy')}
                type="number"
                value={String(form.header.structCy)}
                readOnly={readOnlyPiece}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, structCy: Number(v) } } : f))}
              />
              <Field
                label={t('mpts.tpl.label.archCy')}
                type="number"
                value={String(form.header.archCy)}
                readOnly={readOnlyPiece}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, archCy: Number(v) } } : f))}
              />
              <div className="text-[11px] font-medium">
                {t('mpts.tpl.label.totalCy')}
                <div className="mt-0.5 rounded border bg-slate-100 px-2 py-1 text-xs tabular-nums dark:bg-slate-800">
                  {(form.header.structCy + form.header.archCy).toFixed(2)}
                </div>
              </div>
              <Field
                label={t('mpts.tpl.label.releaseStr')}
                value={form.header.releaseStr}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, releaseStr: v } } : f))}
              />
              <Field
                label={t('mpts.tpl.label.day28Release')}
                value={form.header.day28Release}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, day28Release: v } } : f))}
              />
              <Field
                label={t('mpts.tpl.label.structSf')}
                type="number"
                value={String(form.header.structSf)}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, structSf: Number(v) } } : f))}
              />
              <Field
                label={t('mpts.tpl.label.archSf')}
                type="number"
                value={String(form.header.archSf)}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, archSf: Number(v) } } : f))}
              />
              <div className="text-[11px] font-medium">
                {t('mpts.tpl.label.totalSf')}
                <div className="mt-0.5 rounded border bg-slate-100 px-2 py-1 text-xs tabular-nums dark:bg-slate-800">
                  {(form.header.structSf + form.header.archSf).toFixed(1)}
                </div>
              </div>
              <Field
                label={t('mpts.tpl.label.braceType')}
                value={form.header.braceType}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, braceType: v } } : f))}
              />
              <Field
                label={t('mpts.tpl.label.braceQty')}
                type="number"
                value={String(form.header.braceQty)}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, braceQty: Number(v) } } : f))}
              />
            </div>
          </MptsFormSection>

          <MptsFormSection title={t('mpts.piece.edit.section.sig')}>
            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label={t('mpts.piece.edit.label.drawnBy')}
                value={form.header.drawnBy}
                readOnly={readOnlyPiece}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, drawnBy: v } } : f))}
              />
              <Field
                label={t('mpts.piece.edit.label.dateDrawn')}
                type="date"
                value={form.header.dateDrawn}
                readOnly={readOnlyPiece}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, dateDrawn: v } } : f))}
              />
              <Field
                label={t('mpts.piece.edit.label.checkedBy')}
                value={form.header.checkedBy}
                readOnly={readOnlyPiece}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, checkedBy: v } } : f))}
              />
              <Field
                label={t('mpts.piece.edit.label.dateChecked')}
                type="date"
                value={form.header.dateChecked}
                readOnly={readOnlyPiece}
                onChange={(v) => setForm((f) => (f ? { ...f, header: { ...f.header, dateChecked: v } } : f))}
              />
            </div>
          </MptsFormSection>

          <MptsFormSection title={t('mpts.piece.edit.section.addWork')}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {form.header.addWork.map((v, i) => (
                <label key={i} className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={v}
                    disabled={readOnlyPiece}
                    onChange={(e) =>
                      setForm((f) => {
                        if (!f) return f
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
          </MptsFormSection>

          <MptsFormSection title={t('mpts.piece.edit.section.instances')}>
            <div className="max-h-72 overflow-auto">
              <MptsDenseTable>
                <thead>
                  <tr>
                    <MptsTh>{t('mpts.piece.th.status')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.ctrlNum')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.pieceSn')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.guid')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.yardLoc')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.castDate')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.bedName')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.pos')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.loadDate')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.loadNo')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.qcCheck')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.prePour')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.postPour')}</MptsTh>
                    <MptsTh>{t('mpts.piece.th.shipping')}</MptsTh>
                    <MptsTh className="text-right">{t('mpts.piece.th.countCy')}</MptsTh>
                    <MptsTh className="text-right">{t('mpts.piece.th.countSf')}</MptsTh>
                    <MptsTh>AW1</MptsTh>
                    <MptsTh>AW2</MptsTh>
                    <MptsTh>AW3</MptsTh>
                    <MptsTh>AW4</MptsTh>
                    <MptsTh>AW5</MptsTh>
                    <MptsTh>AW6</MptsTh>
                  </tr>
                </thead>
                <tbody>
                  {form.instances.map((row) => (
                    <InstanceRow
                      key={row.id}
                      row={row}
                      onChange={(nr) =>
                        setForm((f) =>
                          f
                            ? {
                                ...f,
                                instances: f.instances.map((x) => (x.id === row.id ? nr : x)),
                              }
                            : f,
                        )
                      }
                    />
                  ))}
                </tbody>
              </MptsDenseTable>
            </div>
            {form.instances.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">{t('mpts.piece.instancesEmpty')}</p>
            ) : null}
          </MptsFormSection>
        </div>
      </MptsTabPanel>

      <MptsTabPanel active={tab} id="standard-material">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="okan-liquid-panel-nested border-sky-400/20 bg-sky-50/35 px-3 py-2 text-xs text-blue-950 dark:bg-sky-950/35 dark:text-blue-100">
          {t('mpts.piece.bomNote', { tpl: tpl ? ` (${tpl.pieceMark})` : '' })}
          </div>
          <MptsActionBar
          left={
            <span className="text-slate-600">
              {t('mpts.piece.variance')}{' '}
              {form.standardMaterial.reduce((s, r) => s + (r.actualQty - r.prevActualQty), 0).toFixed(2)}
            </span>
          }
          right={
            <>
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-[11px] dark:border-slate-600"
                onClick={() => pushToast({ type: 'success', text: t('mpts.toast.bomCopied') })}
              >
                {t('mpts.piece.bomCopy')}
              </button>
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-[11px] dark:border-slate-600"
                onClick={() => pushToast({ type: 'info', text: t('mpts.toast.bomExportQueued') })}
              >
                {t('mpts.piece.bomExport')}
              </button>
            </>
          }
        />
          <div className="min-h-0 flex-1 overflow-auto">
          <MptsDenseTable>
            <thead>
              <tr>
                <MptsTh>{t('mpts.common.category')}</MptsTh>
                <MptsTh>{t('mpts.field.materialNum')}</MptsTh>
                <MptsTh>{t('mpts.tpl.th.embed')}</MptsTh>
                <MptsTh>{t('mpts.field.description')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.field.qty')}</MptsTh>
                <MptsTh className="bg-sky-100 text-right text-[10px] dark:bg-sky-950/50">{t('mpts.piece.prevQty')}</MptsTh>
                <MptsTh className="bg-sky-100 text-right text-[10px] dark:bg-sky-950/50">{t('mpts.piece.prevActQty')}</MptsTh>
                <MptsTh className="bg-emerald-100 text-right text-[10px] dark:bg-emerald-950/50">{t('mpts.piece.actualQty')}</MptsTh>
                <MptsTh className="bg-emerald-100 text-right text-[10px] dark:bg-emerald-950/50">{t('mpts.piece.prevActQty')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.th.weight')}</MptsTh>
                <MptsTh>{t('mpts.tpl.th.unit')}</MptsTh>
                <MptsTh>{t('mpts.tpl.th.bend')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.th.dimL')}</MptsTh>
              </tr>
            </thead>
            <tbody>
              {form.standardMaterial.map((r) => (
                <tr key={r.id} className={r.fromTemplate ? '' : 'bg-amber-50/50'}>
                  <MptsTd>{t(`mpts.cat.${r.category}`)}</MptsTd>
                  <MptsTd className="font-mono text-[11px]">{r.materialNum}</MptsTd>
                  <MptsTd>{r.embedLabel}</MptsTd>
                  <MptsTd>{r.description}</MptsTd>
                  <MptsTd className="text-right tabular-nums">{r.qty}</MptsTd>
                  <MptsTd className="bg-sky-50/80 text-right tabular-nums dark:bg-sky-950/30">{r.prevQty}</MptsTd>
                  <MptsTd className="bg-sky-50/80 text-right tabular-nums dark:bg-sky-950/30">{r.prevActualQty}</MptsTd>
                  <MptsTd className="bg-emerald-50/80 text-right dark:bg-emerald-950/30">
                    <input
                      type="number"
                      className="w-20 rounded border px-1 py-0.5 text-right text-[11px]"
                      value={r.actualQty}
                      onChange={(e) =>
                        setForm((f) =>
                          f
                            ? {
                                ...f,
                                standardMaterial: f.standardMaterial.map((x) =>
                                  x.id === r.id ? { ...x, actualQty: Number(e.target.value) } : x,
                                ),
                              }
                            : f,
                        )
                      }
                    />
                  </MptsTd>
                  <MptsTd className="bg-emerald-50/80 text-right tabular-nums dark:bg-emerald-950/30">{r.prevActualQty}</MptsTd>
                  <MptsTd className="text-right tabular-nums">{r.weight.toFixed(2)}</MptsTd>
                  <MptsTd>{r.unit}</MptsTd>
                  <MptsTd>{r.bendType}</MptsTd>
                  <MptsTd className="text-right tabular-nums">{r.dimLength}</MptsTd>
                </tr>
              ))}
            </tbody>
          </MptsDenseTable>
          </div>
        </div>
      </MptsTabPanel>

      <MptsTabPanel active={tab} id="job-specific">
        <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">{t('mpts.piece.jobMatHint')}</p>
        <button
          type="button"
          className="mb-2 rounded bg-slate-700 px-2 py-1 text-[11px] font-semibold text-white"
          onClick={() =>
            setForm((f) => {
              if (!f) return f
              const row: JobSpecificMaterialRow = {
                id: uid('js'),
                category: 'Miscellaneous Items',
                materialNum: '',
                description: '',
                qty: 1,
                actualQty: 1,
                weight: 0,
                unit: 'EA',
              }
              return { ...f, jobSpecificMaterial: [...f.jobSpecificMaterial, row] }
            })
          }
        >
          <Plus className="mr-1 inline h-3 w-3" />
          {t('mpts.piece.addJobLine')}
        </button>
        <MptsDenseTable>
          <thead>
            <tr>
              <MptsTh />
              <MptsTh>JS</MptsTh>
              <MptsTh>{t('mpts.common.category')}</MptsTh>
              <MptsTh>{t('mpts.field.materialNum')}</MptsTh>
              <MptsTh>{t('mpts.field.description')}</MptsTh>
              <MptsTh className="text-right">{t('mpts.field.qty')}</MptsTh>
              <MptsTh className="text-right">{t('mpts.piece.actualQty')}</MptsTh>
              <MptsTh className="text-right">{t('mpts.tpl.th.weight')}</MptsTh>
              <MptsTh>{t('mpts.tpl.th.unit')}</MptsTh>
            </tr>
          </thead>
          <tbody>
            {form.jobSpecificMaterial.map((r) => (
              <tr key={r.id}>
                <MptsTd>
                  <button
                    type="button"
                    className="text-red-600"
                    aria-label={t('mpts.common.delete')}
                    onClick={() =>
                      setForm((f) =>
                        f ? { ...f, jobSpecificMaterial: f.jobSpecificMaterial.filter((x) => x.id !== r.id) } : f,
                      )
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </MptsTd>
                <MptsTd>
                  <MptsBadge variant="neutral">JS</MptsBadge>
                </MptsTd>
                <MptsTd>{t(`mpts.cat.${r.category}`)}</MptsTd>
                <MptsTd>
                  <input
                    className="w-full rounded border px-1 py-0.5 font-mono text-[11px]"
                    value={r.materialNum}
                    onChange={(e) =>
                      setForm((f) =>
                        f
                          ? {
                              ...f,
                              jobSpecificMaterial: f.jobSpecificMaterial.map((x) =>
                                x.id === r.id ? { ...x, materialNum: e.target.value } : x,
                              ),
                            }
                          : f,
                      )
                    }
                  />
                </MptsTd>
                <MptsTd>
                  <input
                    className="w-full rounded border px-1 py-0.5 text-[11px]"
                    value={r.description}
                    onChange={(e) =>
                      setForm((f) =>
                        f
                          ? {
                              ...f,
                              jobSpecificMaterial: f.jobSpecificMaterial.map((x) =>
                                x.id === r.id ? { ...x, description: e.target.value } : x,
                              ),
                            }
                          : f,
                      )
                    }
                  />
                </MptsTd>
                <MptsTd className="text-right">
                  <input
                    type="number"
                    className="w-16 rounded border px-1 py-0.5 text-right text-[11px]"
                    value={r.qty}
                    onChange={(e) =>
                      setForm((f) =>
                        f
                          ? {
                              ...f,
                              jobSpecificMaterial: f.jobSpecificMaterial.map((x) =>
                                x.id === r.id ? { ...x, qty: Number(e.target.value) } : x,
                              ),
                            }
                          : f,
                      )
                    }
                  />
                </MptsTd>
                <MptsTd className="text-right">
                  <input
                    type="number"
                    className="w-16 rounded border px-1 py-0.5 text-right text-[11px]"
                    value={r.actualQty}
                    onChange={(e) =>
                      setForm((f) =>
                        f
                          ? {
                              ...f,
                              jobSpecificMaterial: f.jobSpecificMaterial.map((x) =>
                                x.id === r.id ? { ...x, actualQty: Number(e.target.value) } : x,
                              ),
                            }
                          : f,
                      )
                    }
                  />
                </MptsTd>
                <MptsTd className="text-right">
                  <input
                    type="number"
                    className="w-16 rounded border px-1 py-0.5 text-right text-[11px]"
                    value={r.weight}
                    onChange={(e) =>
                      setForm((f) =>
                        f
                          ? {
                              ...f,
                              jobSpecificMaterial: f.jobSpecificMaterial.map((x) =>
                                x.id === r.id ? { ...x, weight: Number(e.target.value) } : x,
                              ),
                            }
                          : f,
                      )
                    }
                  />
                </MptsTd>
                <MptsTd>{r.unit}</MptsTd>
              </tr>
            ))}
          </tbody>
        </MptsDenseTable>
      </MptsTabPanel>
      </div>
    </div>
  )
}

function ProdDimTriplet({
  label,
  ft,
  inch,
  frac,
  readOnly,
  onFt,
  onIn,
  onFrac,
}: {
  label: string
  ft: number
  inch: number
  frac: string
  readOnly: boolean
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
          readOnly={readOnly}
          className="w-full rounded border px-1 py-0.5 text-xs"
          value={ft}
          onChange={(e) => onFt(Number(e.target.value))}
        />
        <input
          type="number"
          readOnly={readOnly}
          className="w-full rounded border px-1 py-0.5 text-xs"
          value={inch}
          onChange={(e) => onIn(Number(e.target.value))}
        />
        <input
          readOnly={readOnly}
          className="w-full rounded border px-1 py-0.5 text-xs"
          value={frac}
          onChange={(e) => onFrac(e.target.value)}
        />
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  readOnly,
  type = 'text',
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
  type?: string
}) {
  return (
    <label className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
      {label}
      <input
        type={type}
        readOnly={readOnly}
        className={`mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900 ${
          readOnly ? 'cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''
        }`}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  )
}

function InstanceRow({
  row,
  onChange,
}: {
  row: ProductionInstanceRow
  onChange: (r: ProductionInstanceRow) => void
}) {
  return (
    <tr>
      <MptsTd>
        <input
          className="w-20 rounded border px-1 py-0.5 text-[11px]"
          value={row.status}
          onChange={(e) => onChange({ ...row, status: e.target.value })}
        />
      </MptsTd>
      <MptsTd className="font-mono text-[10px]">{row.ctrlNum}</MptsTd>
      <MptsTd className="font-mono text-[10px]">{row.pieceSn}</MptsTd>
      <MptsTd>
        <input
          className="w-44 rounded border px-1 font-mono text-[9px]"
          value={row.guid}
          onChange={(e) => onChange({ ...row, guid: e.target.value })}
        />
      </MptsTd>
      <MptsTd>
        <input className="w-16 rounded border px-1 text-[11px]" value={row.yardLoc} onChange={(e) => onChange({ ...row, yardLoc: e.target.value })} />
      </MptsTd>
      <MptsTd>
        <input type="date" className="w-28 rounded border px-1 text-[11px]" value={row.castDate} onChange={(e) => onChange({ ...row, castDate: e.target.value })} />
      </MptsTd>
      <MptsTd>
        <input className="w-16 rounded border px-1 text-[11px]" value={row.bedName} onChange={(e) => onChange({ ...row, bedName: e.target.value })} />
      </MptsTd>
      <MptsTd>
        <input className="w-10 rounded border px-1 text-[11px]" value={row.pos} onChange={(e) => onChange({ ...row, pos: e.target.value })} />
      </MptsTd>
      <MptsTd>
        <input type="date" className="w-28 rounded border px-1 text-[11px]" value={row.loadDate} onChange={(e) => onChange({ ...row, loadDate: e.target.value })} />
      </MptsTd>
      <MptsTd>
        <input className="w-16 rounded border px-1 text-[11px]" value={row.loadNo} onChange={(e) => onChange({ ...row, loadNo: e.target.value })} />
      </MptsTd>
      <MptsTd>
        <input className="w-14 rounded border px-1 text-[11px]" value={row.qcCheck} onChange={(e) => onChange({ ...row, qcCheck: e.target.value })} />
      </MptsTd>
      <MptsTd>
        <input className="w-14 rounded border px-1 text-[11px]" value={row.prePour} onChange={(e) => onChange({ ...row, prePour: e.target.value })} />
      </MptsTd>
      <MptsTd>
        <input className="w-14 rounded border px-1 text-[11px]" value={row.postPour} onChange={(e) => onChange({ ...row, postPour: e.target.value })} />
      </MptsTd>
      <MptsTd>
        <input className="w-16 rounded border px-1 text-[11px]" value={row.shipping} onChange={(e) => onChange({ ...row, shipping: e.target.value })} />
      </MptsTd>
      <MptsTd className="text-right">
        <input
          type="number"
          className="w-16 rounded border px-1 text-right text-[11px]"
          value={row.countCy}
          onChange={(e) => onChange({ ...row, countCy: Number(e.target.value) })}
        />
      </MptsTd>
      <MptsTd className="text-right">
        <input
          type="number"
          className="w-16 rounded border px-1 text-right text-[11px]"
          value={row.countSf}
          onChange={(e) => onChange({ ...row, countSf: Number(e.target.value) })}
        />
      </MptsTd>
      {row.aw.map((a, i) => (
        <MptsTd key={i}>
          <input
            type="checkbox"
            checked={a}
            onChange={(e) => {
              const aw = [...row.aw]
              aw[i] = e.target.checked
              onChange({ ...row, aw })
            }}
          />
        </MptsTd>
      ))}
    </tr>
  )
}
