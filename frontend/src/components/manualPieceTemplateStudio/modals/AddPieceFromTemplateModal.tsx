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
  /** Sayı input’u state’i string: boşken yazılabilir; `Number('')`→0 hatası olmaz */
  const [qtyStr, setQtyStr] = useState('1')

  const tplOptions = useMemo(() => {
    return templates.filter((x) => {
      if (plant && x.location !== plant) return false
      if (product && x.productCategory !== product) return false
      return true
    })
  }, [templates, plant, product])

  const selectedTpl = templates.find((x) => x.id === templateId)

  const qty = useMemo(() => {
    if (qtyStr.trim() === '') return 0
    const n = parseInt(qtyStr, 10)
    return Number.isFinite(n) && n >= 0 ? n : 0
  }, [qtyStr])

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
        <div className="flex w-full flex-wrap justify-end gap-2">
          <button type="button" className="okan-liquid-btn-secondary px-4 py-2.5 text-sm font-semibold" onClick={onClose}>
            {t('mpts.common.cancel')}
          </button>
          <button
            type="button"
            disabled={!valid}
            className="okan-liquid-btn-primary px-4 py-2.5 text-sm font-semibold disabled:pointer-events-none disabled:opacity-40"
            onClick={submit}
          >
            {t('mpts.common.add')}
          </button>
        </div>
      }
    >
      <div className="grid gap-5 md:grid-cols-2 md:items-start">
        <div className="okan-liquid-panel-nested space-y-3.5 p-4">
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
            {t('mpts.common.job')}
            <input
              className="okan-liquid-input mt-1.5 w-full cursor-default px-3 py-2.5 font-mono text-sm opacity-95"
              readOnly
              value={jobId}
            />
          </label>
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span>{t('mpts.modal.addFromTpl.phase')}</span>{' '}
            <span className="text-amber-800 dark:text-amber-200">*</span>
            <select
              className="okan-liquid-select mt-1.5 w-full px-3 py-2.5 text-sm"
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
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span>{t('mpts.modal.addFromTpl.plant')}</span>{' '}
            <span className="text-amber-800 dark:text-amber-200">*</span>
            <select
              className="okan-liquid-select mt-1.5 w-full px-3 py-2.5 text-sm"
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
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span>{t('mpts.modal.addFromTpl.product')}</span>{' '}
            <span className="text-amber-800 dark:text-amber-200">*</span>
            <select
              className="okan-liquid-select mt-1.5 w-full px-3 py-2.5 text-sm"
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
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span>{t('mpts.modal.addFromTpl.template')}</span>{' '}
            <span className="text-amber-800 dark:text-amber-200">*</span>
            <select
              className="okan-liquid-select mt-1.5 w-full px-3 py-2.5 text-sm disabled:opacity-45"
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
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span>{t('mpts.modal.addFromTpl.pieceMark')}</span>{' '}
            <span className="text-amber-800 dark:text-amber-200">*</span>
            <input
              className="okan-liquid-input mt-1.5 w-full px-3 py-2.5 font-mono text-sm"
              value={pieceMark}
              onChange={(e) => setPieceMark(e.target.value)}
            />
          </label>
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span>{t('mpts.modal.addFromTpl.qty')}</span>{' '}
            <span className="text-amber-800 dark:text-amber-200">*</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="okan-liquid-input mt-1.5 w-full px-3 py-2.5 text-sm tabular-nums"
              value={qtyStr}
              onChange={(e) => {
                const v = e.target.value.trim()
                if (v === '') {
                  setQtyStr('')
                  return
                }
                if (!/^\d+$/.test(v)) return
                setQtyStr(String(parseInt(v, 10)))
              }}
            />
          </label>
        </div>
        <div className="okan-liquid-panel-nested flex min-h-[12rem] flex-col p-4 md:min-h-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('mpts.modal.addFromTpl.previewTitle')}
          </p>
          {selectedTpl ? (
            <dl className="mt-3 space-y-3 text-xs text-slate-800 dark:text-slate-200">
              <div className="border-b border-white/10 pb-2 dark:border-white/8">
                <dt className="text-[11px] text-slate-500 dark:text-slate-400">{t('mpts.field.description')}</dt>
                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">{selectedTpl.description}</dd>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-white/10 pb-2 dark:border-white/8">
                <div>
                  <dt className="text-[11px] text-slate-500 dark:text-slate-400">{t('mpts.common.location')}</dt>
                  <dd className="mt-0.5">{selectedTpl.location}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500 dark:text-slate-400">{t('mpts.field.rev')}</dt>
                  <dd className="mt-0.5 font-mono">{selectedTpl.header.rev}</dd>
                </div>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500 dark:text-slate-400">{t('mpts.modal.addFromTpl.estWeight')}</dt>
                <dd className="mt-0.5 tabular-nums font-medium">
                  {selectedTpl.header.weight.toLocaleString()} {t('mpts.modal.addFromTpl.lb')}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-6 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t('mpts.modal.addFromTpl.previewEmpty')}</p>
          )}
        </div>
      </div>
    </MptsModal>
  )
}
