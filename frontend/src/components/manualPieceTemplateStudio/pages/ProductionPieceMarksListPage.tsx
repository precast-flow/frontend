import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileBarChart, Plus, XCircle } from 'lucide-react'
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

      <div className="mb-3 flex flex-wrap items-center gap-3 rounded border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs dark:border-amber-800 dark:bg-amber-950/40">
        <label className="font-semibold text-amber-950 dark:text-amber-100">
          {t('mpts.common.job')} *
          <select
            className="ml-2 rounded border border-amber-300 bg-white px-2 py-1 font-mono text-xs dark:border-amber-700 dark:bg-slate-900"
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
        <span className="text-amber-900/80 dark:text-amber-200/90">{t('mpts.production.jobBanner')}</span>
      </div>

      <MptsActionBar
        left={
          <label className="text-[11px]">
            {t('mpts.common.filter')}
            <input
              className="ml-1 rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
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
              className="rounded border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-600"
              onClick={() => pushToast({ type: 'info', text: t('mpts.toast.reportQueued') })}
            >
              <FileBarChart className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.report')}
            </button>
            <button
              type="button"
              className="rounded border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-600"
              onClick={() => pushToast({ type: 'success', text: t('mpts.toast.exportQueued') })}
            >
              <Download className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.export')}
            </button>
            <button
              type="button"
              className="rounded border border-slate-400 px-3 py-1.5 text-xs font-medium"
              onClick={() => addEmptyPiece(selectedJobId)}
            >
              <Plus className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.production.addPiece')}
            </button>
            <button
              type="button"
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
              onClick={() => setModalOpen(true)}
            >
              {t('mpts.production.addFromTemplate')}
            </button>
            <button type="button" className="rounded px-3 py-1.5 text-xs text-slate-600" onClick={onCloseModule}>
              <XCircle className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.close')}
            </button>
          </>
        }
      />

      <AddPieceFromTemplateModal open={modalOpen} onClose={() => setModalOpen(false)} jobId={selectedJobId} />

      {!selectedJobId ? (
        <div className="flex flex-1 items-center justify-center rounded border border-dashed p-8 text-sm text-slate-600">
          {t('mpts.production.selectJob')}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded border border-dashed border-amber-200 bg-amber-50/30 p-8 dark:border-amber-900 dark:bg-amber-950/20">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t('mpts.production.emptyJob')}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
              onClick={() => setModalOpen(true)}
            >
              {t('mpts.production.addFromTemplate')}
            </button>
            <button
              type="button"
              className="rounded border border-slate-300 px-4 py-2 text-xs dark:border-slate-600"
              onClick={() => addEmptyPiece(selectedJobId)}
            >
              {t('mpts.production.addPiece')}
            </button>
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
                  className="cursor-pointer hover:bg-amber-50/50 dark:hover:bg-amber-950/30"
                  onClick={() => navigate(`${base}/production/pieces/${r.id}/edit`)}
                >
                  <MptsTd className="font-mono font-semibold text-blue-800 dark:text-blue-300">{r.pieceMark}</MptsTd>
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
