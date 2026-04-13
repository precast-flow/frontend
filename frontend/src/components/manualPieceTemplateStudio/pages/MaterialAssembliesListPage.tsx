import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileBarChart, Layers, Pencil, Plus, Trash2, XCircle } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { useMpts, useMptsBasePath } from '../MptsContext'
import type { MaterialAssembly, MaterialCategory } from '../types'
import { useMptsBreadcrumb } from '../useMptsBreadcrumb'
import { MptsActionBar } from '../components/MptsActionBar'
import { MptsPaginationBar } from '../components/MptsPaginationBar'
import { MptsBadge } from '../components/MptsBadge'
import { MptsDenseTable, MptsTd, MptsTh } from '../components/MptsDenseTable'
import { MptsModal } from '../components/MptsModal'
import { MptsPageHeader } from '../components/MptsPageHeader'

export function MaterialAssembliesListPage({ onCloseModule }: { onCloseModule: () => void }) {
  const { t } = useI18n()
  const bc = useMptsBreadcrumb()
  const { materialAssemblies, deleteMaterialAssembly, pushToast } = useMpts()
  const base = useMptsBasePath()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [drawerAsm, setDrawerAsm] = useState<MaterialAssembly | null>(null)
  const [page, setPage] = useState(1)
  const perPage = 25

  const catLabel = (c: MaterialCategory) => t(`mpts.cat.${c}`)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return materialAssemblies.filter((r) => {
      if (!q) return true
      const blob = `${r.materialNum} ${r.description} ${r.embedLabel}`.toLowerCase()
      return blob.includes(q)
    })
  }, [materialAssemblies, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MptsPageHeader
        breadcrumb={bc.catalogList}
        title={t('mpts.assemblies.title')}
        subtitle={t('mpts.assemblies.subtitle')}
        badge={<MptsBadge variant="asm">{t('mpts.assemblies.badge')}</MptsBadge>}
      />
      <MptsActionBar
        filters={
          <label className="flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span className="shrink-0 whitespace-nowrap">{t('mpts.common.search')}</span>
            <input
              className="okan-liquid-input min-w-[17rem] max-w-[28rem] flex-1 px-2.5 py-1.5 text-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
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
              className="okan-liquid-btn-primary px-3 py-1.5 text-xs font-semibold"
              onClick={() => navigate(`${base}/catalog/material-assemblies/new`)}
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
        <div className="flex flex-1 flex-col items-center justify-center rounded border border-dashed border-indigo-200 p-8 dark:border-indigo-800">
          <Layers className="mb-2 h-10 w-10 text-indigo-400" />
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t('mpts.assemblies.empty')}</p>
          <button
            type="button"
            className="mt-3 rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
            onClick={() => navigate(`${base}/catalog/material-assemblies/new`)}
          >
            {t('mpts.common.addNew')}
          </button>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-auto">
            <MptsDenseTable>
              <thead className="sticky top-0 z-10">
                <tr>
                  <MptsTh className="w-10" />
                  <MptsTh sticky>{t('mpts.materialItems.th.category')}</MptsTh>
                  <MptsTh sticky>{t('mpts.materialItems.th.materialNum')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.embed')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.description')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.glCode')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.bendType')}</MptsTh>
                  <MptsTh className="text-right">{t('mpts.materialItems.th.materialCost')}</MptsTh>
                  <MptsTh className="text-right">{t('mpts.materialItems.th.dimLength')}</MptsTh>
                  <MptsTh className="text-right">{t('mpts.materialItems.th.orderBy')}</MptsTh>
                  <MptsTh>{t('mpts.common.active')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.prod')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.cip')}</MptsTh>
                  <MptsTh>{t('mpts.materialItems.th.erect')}</MptsTh>
                  <MptsTh className="text-right">{t('mpts.common.actions')}</MptsTh>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={
                      idx % 2 === 0
                        ? 'bg-indigo-50/40 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }
                  >
                    <MptsTd>
                      <MptsBadge variant="asm">{t('mpts.assemblies.badge')}</MptsBadge>
                    </MptsTd>
                    <MptsTd sticky>{catLabel(r.category)}</MptsTd>
                    <MptsTd sticky className="font-mono text-[11px]">
                      {r.materialNum}
                    </MptsTd>
                    <MptsTd>{r.embedLabel}</MptsTd>
                    <MptsTd className="max-w-[180px] truncate">{r.description}</MptsTd>
                    <MptsTd className="font-mono text-[11px]">{r.glCode}</MptsTd>
                    <MptsTd>{r.bendType}</MptsTd>
                    <MptsTd className="text-right tabular-nums">{r.materialCost.toFixed(2)}</MptsTd>
                    <MptsTd className="text-right tabular-nums">—</MptsTd>
                    <MptsTd className="text-right tabular-nums">{r.orderBy}</MptsTd>
                    <MptsTd>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          r.active ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {r.active ? t('mpts.common.yes') : t('mpts.common.no')}
                      </span>
                    </MptsTd>
                    <MptsTd>{r.production ? '✓' : '—'}</MptsTd>
                    <MptsTd>{r.cip ? '✓' : '—'}</MptsTd>
                    <MptsTd>{r.erection ? '✓' : '—'}</MptsTd>
                    <MptsTd className="text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="mr-1 rounded p-1 text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300"
                        onClick={() => setDrawerAsm(r)}
                        title={t('mpts.assemblies.viewContents')}
                      >
                        <Layers className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="mr-1 rounded p-1 text-blue-700 hover:bg-blue-50 dark:text-blue-300"
                        onClick={() => navigate(`${base}/catalog/material-assemblies/${r.id}/edit`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-red-700 hover:bg-red-50 dark:text-red-300"
                        onClick={() => {
                          if (window.confirm(t('mpts.assemblies.deleteConfirm', { num: r.materialNum })))
                            deleteMaterialAssembly(r.id)
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
          <MptsPaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <MptsModal
        open={!!drawerAsm}
        title={drawerAsm ? t('mpts.assemblies.drawerTitle', { num: drawerAsm.materialNum }) : ''}
        onClose={() => setDrawerAsm(null)}
        widthClass="max-w-lg"
        footer={
          <button
            type="button"
            className="rounded bg-slate-800 px-3 py-1.5 text-xs text-white"
            onClick={() => setDrawerAsm(null)}
          >
            {t('mpts.common.close')}
          </button>
        }
      >
        {drawerAsm ? (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase text-slate-500">
                <th className="py-1">{t('mpts.assemblies.th.item')}</th>
                <th className="py-1">{t('mpts.tpl.th.qty')}</th>
                <th className="py-1">{t('mpts.materialItems.th.category')}</th>
              </tr>
            </thead>
            <tbody>
              {drawerAsm.lines.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-1 font-mono">{l.materialNum}</td>
                  <td className="py-1 tabular-nums">{l.qty}</td>
                  <td className="py-1">{catLabel(l.category)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </MptsModal>
    </div>
  )
}
