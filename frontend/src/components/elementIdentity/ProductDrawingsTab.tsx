import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ProductDrawingRevision, ProjectProduct } from '../../elementIdentity/types'
import { useI18n } from '../../i18n/I18nProvider'
import { defaultDrawingPdfUrl, newRowId } from './productEditorUtils'

function buildEmbeddedPdfUrl(pdfUrl: string): string {
  return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}#pagemode=none&zoom=page-width`
}

type Props = {
  product: ProjectProduct
  onPatch: (partial: Partial<ProjectProduct>) => void
}

export function ProductDrawingsTab({ product, onPatch }: Props) {
  const { locale } = useI18n()
  const revisions = product.drawingRevisions ?? []
  const [selectedRevId, setSelectedRevId] = useState<string | null>(null)

  const activeRevision = useMemo(() => {
    if (!revisions.length) return null
    return revisions.find((r) => r.id === selectedRevId) ?? revisions[0]!
  }, [revisions, selectedRevId])

  const setRevs = (next: ProductDrawingRevision[]) => {
    onPatch({ drawingRevisions: next })
    if (!next.some((r) => r.id === selectedRevId)) setSelectedRevId(next[0]?.id ?? null)
  }

  const addRevision = () => {
    const n = revisions.length + 1
    const row: ProductDrawingRevision = {
      id: newRowId('dr'),
      revision: `R${n}`,
      title: locale === 'en' ? 'New drawing' : 'Yeni çizim',
      updatedAt: new Date().toLocaleString(locale === 'en' ? 'en-GB' : 'tr-TR'),
      updatedBy: locale === 'en' ? 'You' : 'Siz',
      changeNote: '',
      pdfUrl: defaultDrawingPdfUrl(),
      fileName: 'document.pdf',
    }
    setRevs([row, ...revisions])
    setSelectedRevId(row.id)
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 lg:max-w-[14rem]">
        <button type="button" onClick={addRevision} className="rounded-lg border border-slate-200/80 bg-white/70 px-2 py-1.5 text-xs font-semibold dark:border-slate-600 dark:bg-slate-900/40">
          <span className="inline-flex items-center gap-1">
            <Plus className="size-3.5" />
            {locale === 'en' ? 'New revision' : 'Yeni revizyon'}
          </span>
        </button>
        <ul className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200/50 p-1 dark:border-slate-600/40">
          {revisions.map((rev) => (
            <li key={rev.id}>
              <div className="flex items-start gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedRevId(rev.id)}
                  className={`min-w-0 flex-1 rounded-lg px-2 py-1.5 text-left text-xs ${
                    activeRevision?.id === rev.id
                      ? 'bg-sky-500/15 font-semibold text-slate-900 dark:bg-sky-400/15 dark:text-slate-50'
                      : 'hover:bg-white/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="font-mono">{rev.revision}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-600 dark:text-slate-300">{rev.title}</span>
                  <span className="text-[10px] text-slate-500">{rev.updatedAt}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRevs(revisions.filter((r) => r.id !== rev.id))}
                  className="shrink-0 p-1 text-slate-400 hover:text-rose-600"
                  aria-label="remove"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {activeRevision ? (
          <div className="space-y-2 rounded-xl border border-slate-200/50 p-2 text-xs dark:border-slate-600/40">
            <label className="block">
              <span className="text-[11px] text-slate-500">{locale === 'en' ? 'Title' : 'Başlık'}</span>
              <input
                value={activeRevision.title}
                onChange={(e) => {
                  const next = revisions.map((r) => (r.id === activeRevision.id ? { ...r, title: e.target.value } : r))
                  setRevs(next)
                }}
                className="mt-0.5 w-full rounded border border-slate-300/80 bg-white px-1 py-1 dark:border-slate-600 dark:bg-slate-950"
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-slate-500">{locale === 'en' ? 'Change note' : 'Değişiklik notu'}</span>
              <textarea
                value={activeRevision.changeNote}
                rows={2}
                onChange={(e) => {
                  const next = revisions.map((r) => (r.id === activeRevision.id ? { ...r, changeNote: e.target.value } : r))
                  setRevs(next)
                }}
                className="mt-0.5 w-full resize-y rounded border border-slate-300/80 bg-white px-1 py-1 dark:border-slate-600 dark:bg-slate-950"
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-slate-500">PDF URL</span>
              <input
                value={activeRevision.pdfUrl ?? ''}
                onChange={(e) => {
                  const next = revisions.map((r) => (r.id === activeRevision.id ? { ...r, pdfUrl: e.target.value } : r))
                  setRevs(next)
                }}
                className="mt-0.5 w-full rounded border border-slate-300/80 bg-white px-1 py-1 font-mono text-[11px] dark:border-slate-600 dark:bg-slate-950"
              />
            </label>
          </div>
        ) : (
          <p className="text-xs text-slate-500">{locale === 'en' ? 'No revisions yet.' : 'Henüz revizyon yok.'}</p>
        )}
      </div>
      <div className="min-h-[14rem] min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200/60 bg-slate-100/80 dark:border-slate-600/50 dark:bg-slate-900/50">
        {activeRevision?.pdfUrl ? (
          <iframe title="pdf" className="h-[min(28rem,50vh)] w-full border-0" src={buildEmbeddedPdfUrl(activeRevision.pdfUrl)} />
        ) : (
          <div className="flex h-48 items-center justify-center text-xs text-slate-500">—</div>
        )}
      </div>
    </div>
  )
}
