import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileBarChart, LayoutGrid, Plus, XCircle } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { useMpts, useMptsBasePath } from '../MptsContext'
import { useMptsBreadcrumb } from '../useMptsBreadcrumb'
import { AddPieceFromTemplateModal } from '../modals/AddPieceFromTemplateModal'
import { MptsActionBar } from '../components/MptsActionBar'
import { MptsBadge } from '../components/MptsBadge'
import { MptsDenseTable, MptsTd, MptsTh } from '../components/MptsDenseTable'
import { MptsPageHeader } from '../components/MptsPageHeader'

export function ProductionPieceMarksListPage({ onCloseModule }: { onCloseModule: () => void }) {
  const { t } = useI18n()
  const bc = useMptsBreadcrumb()
  const navigate = useNavigate()
  const { productionPieces, selectedJobId, setSelectedJobId, jobs, addEmptyPiece, pushToast } = useMpts()
  const base = useMptsBasePath()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return productionPieces.filter((p) => {
      if (p.jobId !== selectedJobId) return false
      if (!q) return true
      return p.pieceMark.toLowerCase().includes(q)
    })
  }, [productionPieces, selectedJobId, search])

  const drawingLabel = (s: string) => {
    const v = t(`mpts.drawingStatus.${s}`)
    return v === `mpts.drawingStatus.${s}` ? s : v
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MptsPageHeader
        breadcrumb={bc.productionList}
        title={t('mpts.production.title')}
        badge={<MptsBadge variant="job">{t('mpts.badge.job')}</MptsBadge>}
      />

      <div className="okan-liquid-banner-warn mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 text-xs">
        <label className="flex flex-wrap items-center gap-2 font-semibold text-amber-950 dark:text-amber-100">
          <span>
            {t('mpts.common.job')} <span className="text-amber-800 dark:text-amber-200">*</span>
          </span>
          <select
            className="okan-liquid-select min-w-[10rem] px-2.5 py-1.5 font-mono text-xs"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.id}
              </option>
            ))}
          </select>
        </label>
        <span className="max-w-[42rem] text-[11px] leading-snug text-amber-900/90 dark:text-amber-100/90">
          {t('mpts.production.jobBanner')}
        </span>
      </div>

      <MptsActionBar
        left={
          <label className="flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span className="shrink-0 whitespace-nowrap">{t('mpts.common.filter')}</span>
            <input
              className="okan-liquid-input min-w-[12rem] max-w-[24rem] flex-1 px-2.5 py-1.5 text-sm"
              placeholder={t('mpts.production.filterPh')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        }
        right={
          <>
            <button
              type="button"
              className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold"
              onClick={() => pushToast({ type: 'info', text: t('mpts.toast.reportQueued') })}
            >
              <FileBarChart className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.report')}
            </button>
            <button
              type="button"
              className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold"
              onClick={() => pushToast({ type: 'success', text: t('mpts.toast.exportQueued') })}
            >
              <Download className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.export')}
            </button>
            <button
              type="button"
              className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold"
              onClick={() => addEmptyPiece(selectedJobId)}
            >
              <Plus className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.production.addPiece')}
            </button>
            <button
              type="button"
              className="okan-liquid-btn-primary px-3 py-1.5 text-xs font-semibold"
              onClick={() => setModalOpen(true)}
            >
              <LayoutGrid className="mr-1 inline h-3.5 w-3.5 opacity-95" aria-hidden />
              {t('mpts.production.addFromTemplate')}
            </button>
            <button
              type="button"
              className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold"
              onClick={onCloseModule}
            >
              <XCircle className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.close')}
            </button>
          </>
        }
      />

      <AddPieceFromTemplateModal open={modalOpen} onClose={() => setModalOpen(false)} jobId={selectedJobId} />

      {!selectedJobId ? (
        <div className="okan-liquid-panel-nested flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center text-sm text-slate-600 dark:text-slate-400">
          {t('mpts.production.selectJob')}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-4 sm:p-6">
          <div className="okan-liquid-panel-nested w-full max-w-md border border-dashed border-slate-300/55 px-6 py-9 text-center shadow-none dark:border-white/12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/35 shadow-[0_4px_16px_rgb(15_23_42/0.06)] dark:border-white/10 dark:bg-white/8">
              <LayoutGrid className="h-6 w-6 text-slate-600 dark:text-slate-300" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-50">{t('mpts.production.emptyJob')}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                className="okan-liquid-btn-primary inline-flex items-center px-4 py-2 text-xs font-semibold"
                onClick={() => setModalOpen(true)}
              >
                <LayoutGrid className="mr-2 h-3.5 w-3.5 opacity-95" aria-hidden />
                {t('mpts.production.addFromTemplate')}
              </button>
              <button
                type="button"
                className="okan-liquid-btn-secondary inline-flex items-center px-4 py-2 text-xs font-semibold"
                onClick={() => addEmptyPiece(selectedJobId)}
              >
                <Plus className="mr-2 h-3.5 w-3.5" aria-hidden />
                {t('mpts.production.addPiece')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <MptsDenseTable>
            <thead className="sticky top-0 z-10">
              <tr>
                <MptsTh>{t('mpts.field.pieceMark')}</MptsTh>
                <MptsTh>{t('mpts.production.th.phase')}</MptsTh>
                <MptsTh>{t('mpts.production.th.plant')}</MptsTh>
                <MptsTh>{t('mpts.field.productCategory')}</MptsTh>
                <MptsTh>{t('mpts.field.productCode')}</MptsTh>
                <MptsTh>{t('mpts.field.crossSection')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.tpl.th.qty')}</MptsTh>
                <MptsTh>{t('mpts.production.th.drawingStatus')}</MptsTh>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer hover:bg-slate-50/90 dark:hover:bg-slate-800/55"
                  onClick={() => navigate(`${base}/production/pieces/${r.id}/edit`)}
                >
                  <MptsTd className="font-mono font-semibold text-slate-900 dark:text-slate-100">{r.pieceMark}</MptsTd>
                  <MptsTd>{r.phase}</MptsTd>
                  <MptsTd>{r.plant}</MptsTd>
                  <MptsTd>{r.productCategory}</MptsTd>
                  <MptsTd className="font-mono text-[11px]">{r.productCode}</MptsTd>
                  <MptsTd>{r.crossSection}</MptsTd>
                  <MptsTd className="text-right tabular-nums">{r.qty}</MptsTd>
                  <MptsTd>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        r.drawingStatus === 'Released' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {drawingLabel(r.drawingStatus)}
                    </span>
                  </MptsTd>
                </tr>
              ))}
            </tbody>
          </MptsDenseTable>
        </div>
      )}
    </div>
  )
}
