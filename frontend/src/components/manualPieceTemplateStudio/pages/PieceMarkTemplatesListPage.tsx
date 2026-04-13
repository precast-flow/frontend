import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Download, FileBarChart, Pencil, Plus, Trash2, XCircle } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { useMpts, useMptsBasePath } from '../MptsContext'
import { useMptsBreadcrumb } from '../useMptsBreadcrumb'
import { MptsActionBar } from '../components/MptsActionBar'
import { MptsBadge } from '../components/MptsBadge'
import { MptsDenseTable, MptsTd, MptsTh } from '../components/MptsDenseTable'
import { MptsPageHeader } from '../components/MptsPageHeader'

export function PieceMarkTemplatesListPage({ onCloseModule }: { onCloseModule: () => void }) {
  const { t } = useI18n()
  const bc = useMptsBreadcrumb()
  const { templates, deleteTemplate, cloneTemplate, pushToast } = useMpts()
  const base = useMptsBasePath()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [loc, setLoc] = useState('all')
  const [active, setActive] = useState<'all' | 'yes' | 'no'>('all')
  const [sel, setSel] = useState<string | null>(null)

  const locs = useMemo(() => {
    const s = new Set<string>()
    templates.forEach((x) => s.add(x.location))
    return [...s]
  }, [templates])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return templates.filter((x) => {
      if (loc !== 'all' && x.location !== loc) return false
      if (active === 'yes' && !x.active) return false
      if (active === 'no' && x.active) return false
      if (!q) return true
      return `${x.pieceMark} ${x.description} ${x.productCode}`.toLowerCase().includes(q)
    })
  }, [templates, search, loc, active])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MptsPageHeader
        breadcrumb={bc.templatesList}
        title={t('mpts.templates.title')}
        badge={<MptsBadge variant="template">{t('mpts.tpl.badge.template')}</MptsBadge>}
      />
      <MptsActionBar
        filters={
          <>
            <label className="flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <span className="shrink-0 whitespace-nowrap">{t('mpts.common.search')}</span>
              <input
                className="okan-liquid-input min-w-[17rem] max-w-[28rem] flex-1 px-2.5 py-1.5 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <span className="shrink-0 whitespace-nowrap">{t('mpts.common.location')}</span>
              <select
                className="okan-liquid-select min-w-[7rem] px-2.5 py-1.5 text-sm"
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
              >
                <option value="all">{t('mpts.common.all')}</option>
                {locs.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <span className="shrink-0 whitespace-nowrap">{t('mpts.common.active')}</span>
              <select
                className="okan-liquid-select min-w-[5.5rem] px-2.5 py-1.5 text-sm"
                value={active}
                onChange={(e) => setActive(e.target.value as typeof active)}
              >
                <option value="all">{t('mpts.common.all')}</option>
                <option value="yes">{t('mpts.common.yes')}</option>
                <option value="no">{t('mpts.common.no')}</option>
              </select>
            </label>
          </>
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
              className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold disabled:opacity-45"
              disabled={!sel}
              onClick={() => sel && cloneTemplate(sel)}
            >
              <Copy className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.templates.clone')}
            </button>
            <button
              type="button"
              className="okan-liquid-btn-primary px-3 py-1.5 text-xs font-semibold"
              onClick={() => navigate(`${base}/templates/piece-mark-templates/new`)}
            >
              <Plus className="mr-1 inline h-3.5 w-3.5" />
              {t('mpts.common.addNew')}
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

      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded border border-dashed p-8">
          <p className="text-sm text-slate-700 dark:text-slate-200">{t('mpts.templates.empty')}</p>
          <button
            type="button"
            className="mt-2 rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
            onClick={() => navigate(`${base}/templates/piece-mark-templates/new`)}
          >
            {t('mpts.common.addNew')}
          </button>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <MptsDenseTable>
            <thead className="sticky top-0 z-10">
              <tr>
                <MptsTh className="w-8" />
                <MptsTh>{t('mpts.common.location')}</MptsTh>
                <MptsTh>{t('mpts.templates.th.pieceMark')}</MptsTh>
                <MptsTh>{t('mpts.field.description')}</MptsTh>
                <MptsTh>{t('mpts.templates.th.productCategory')}</MptsTh>
                <MptsTh>{t('mpts.templates.th.productCode')}</MptsTh>
                <MptsTh>{t('mpts.templates.th.crossSection')}</MptsTh>
                <MptsTh>{t('mpts.common.active')}</MptsTh>
                <MptsTh className="text-right">{t('mpts.common.actions')}</MptsTh>
              </tr>
            </thead>
            <tbody>
              {filtered.map((x) => (
                <tr
                  key={x.id}
                  className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${sel === x.id ? 'bg-blue-50/80 dark:bg-blue-950/40' : ''}`}
                  onClick={() => setSel(x.id)}
                >
                  <MptsTd onClick={(e) => e.stopPropagation()}>
                    <input
                      type="radio"
                      name="tpl-sel"
                      checked={sel === x.id}
                      onChange={() => setSel(x.id)}
                      aria-label={t('mpts.common.select')}
                    />
                  </MptsTd>
                  <MptsTd>{x.location}</MptsTd>
                  <MptsTd className="font-mono text-[11px]">{x.pieceMark}</MptsTd>
                  <MptsTd className="max-w-[200px] truncate">{x.description}</MptsTd>
                  <MptsTd>{x.productCategory}</MptsTd>
                  <MptsTd className="font-mono text-[11px]">{x.productCode}</MptsTd>
                  <MptsTd>{x.crossSection}</MptsTd>
                  <MptsTd>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        x.active ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {x.active ? t('mpts.common.yes') : t('mpts.common.no')}
                    </span>
                  </MptsTd>
                  <MptsTd className="text-right whitespace-nowrap">
                    <button
                      type="button"
                      className="mr-1 rounded p-1 text-blue-700 hover:bg-blue-50 dark:text-blue-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`${base}/templates/piece-mark-templates/${x.id}`)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="mr-1 rounded p-1 text-slate-700 hover:bg-slate-100 dark:text-slate-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        cloneTemplate(x.id)
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-red-700 hover:bg-red-50 dark:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm(t('mpts.templates.deleteConfirm', { mark: x.pieceMark }))) deleteTemplate(x.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
