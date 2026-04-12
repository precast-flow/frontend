import { useMemo, useState } from 'react'
import { useI18n } from '../../../i18n/I18nProvider'
import { useMpts } from '../MptsContext'
import { MptsModal } from '../components/MptsModal'

type Props = {
  open: boolean
  onClose: () => void
  jobId: string
}

export function AddPieceFromTemplateModal({ open, onClose, jobId }: Props) {
  const { t } = useI18n()
  const { jobs, templates, addPieceFromTemplate } = useMpts()
  const job = jobs.find((j) => j.id === jobId)

  const [phase, setPhase] = useState(job?.phases[0] ?? '')
  const [plant, setPlant] = useState(job?.plants[0] ?? '')
  const [product, setProduct] = useState(job?.products[0] ?? '')
  const [templateId, setTemplateId] = useState('')
  const [pieceMark, setPieceMark] = useState('')
  const [qty, setQty] = useState(1)

  const tplOptions = useMemo(() => {
    return templates.filter((x) => {
      if (plant && x.location !== plant) return false
      if (product && x.productCategory !== product) return false
      return true
    })
  }, [templates, plant, product])

  const selectedTpl = templates.find((x) => x.id === templateId)

  const valid = phase && plant && product && templateId && pieceMark.trim() && qty > 0

  const submit = () => {
    if (!valid) return
    addPieceFromTemplate({
      jobId,
      phase,
      plant,
      product,
      templateId,
      pieceMark: pieceMark.trim(),
      qty,
    })
    onClose()
  }

  return (
    <MptsModal
      open={open}
      title={t('mpts.modal.addFromTpl.title')}
      onClose={onClose}
      widthClass="max-w-4xl"
      footer={
        <div className="flex w-full justify-end gap-2">
          <button type="button" className="rounded border border-slate-300 px-4 py-2 text-xs dark:border-slate-600" onClick={onClose}>
            {t('mpts.common.cancel')}
          </button>
          <button
            type="button"
            disabled={!valid}
            className="rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
            onClick={submit}
          >
            {t('mpts.common.add')}
          </button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
            {t('mpts.common.job')}
            <input
              className="mt-0.5 w-full rounded border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-800"
              readOnly
              value={jobId}
            />
          </label>
          <label className="block text-[11px] font-medium">
            {t('mpts.modal.addFromTpl.phase')} *
            <select
              className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-900"
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
            >
              <option value="">{t('mpts.modal.addFromTpl.selectPhase')}</option>
              {job?.phases.map((p: string) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-medium">
            {t('mpts.modal.addFromTpl.plant')} *
            <select
              className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-900"
              value={plant}
              onChange={(e) => {
                setPlant(e.target.value)
                setTemplateId('')
              }}
            >
              <option value="">{t('mpts.modal.addFromTpl.selectPlant')}</option>
              {job?.plants.map((p: string) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-medium">
            {t('mpts.modal.addFromTpl.product')} *
            <select
              className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-900"
              value={product}
              onChange={(e) => {
                setProduct(e.target.value)
                setTemplateId('')
              }}
            >
              <option value="">{t('mpts.modal.addFromTpl.selectProduct')}</option>
              {job?.products.map((p: string) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-medium">
            {t('mpts.modal.addFromTpl.template')} *
            <select
              className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-900"
              value={templateId}
              onChange={(e) => {
                const id = e.target.value
                setTemplateId(id)
                const tpl = templates.find((x) => x.id === id)
                if (tpl) setPieceMark(tpl.pieceMark)
              }}
              disabled={!phase || !plant || !product}
            >
              <option value="">{t('mpts.modal.addFromTpl.selectTemplate')}</option>
              {tplOptions.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.pieceMark} — {x.description}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-medium">
            {t('mpts.modal.addFromTpl.pieceMark')} *
            <input
              className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-900"
              value={pieceMark}
              onChange={(e) => setPieceMark(e.target.value)}
            />
          </label>
          <label className="block text-[11px] font-medium">
            {t('mpts.modal.addFromTpl.qty')} *
            <input
              type="number"
              min={1}
              className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-900"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="rounded-lg border border-blue-100 bg-slate-50 p-4 dark:border-blue-900/50 dark:bg-slate-800/50">
          <p className="text-xs font-semibold uppercase text-slate-500">{t('mpts.modal.addFromTpl.previewTitle')}</p>
          {selectedTpl ? (
            <dl className="mt-3 space-y-1 text-xs">
              <div>
                <dt className="text-slate-500">{t('mpts.field.description')}</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{selectedTpl.description}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('mpts.common.location')}</dt>
                <dd>{selectedTpl.location}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('mpts.field.rev')}</dt>
                <dd>{selectedTpl.header.rev}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('mpts.modal.addFromTpl.estWeight')}</dt>
                <dd className="tabular-nums">
                  {selectedTpl.header.weight.toLocaleString()} {t('mpts.modal.addFromTpl.lb')}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">{t('mpts.modal.addFromTpl.previewEmpty')}</p>
          )}
        </div>
      </div>
    </MptsModal>
  )
}
