import { ChevronRight } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { ProjectCardItem } from '../../data/projectManagementCardsMock'
import {
  projectCreateCustomersMock,
  projectCreateDraftMock,
  projectCreateOwnersMock,
  projectCreatePriorityOptions,
  projectCreateStatusOptions,
} from '../../data/projectManagementCreateMock'
import '../muhendislikOkan/engineeringOkanLiquid.css'

function nowUpdatedAtMock(): string {
  return new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })
}

export function ProjectManagementCreatePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const allowed = Boolean((location.state as { fromProjectManagement?: boolean } | null)?.fromProjectManagement)
  if (!allowed) return <Navigate to="/proje" replace />

  const panelClass = 'okan-liquid-panel'
  const nestedClass = 'okan-liquid-panel-nested'

  const [draft, setDraft] = useState(() => ({ ...projectCreateDraftMock }))
  const [savedPreview, setSavedPreview] = useState<ProjectCardItem | null>(null)

  const previewJson = useMemo(() => (savedPreview ? JSON.stringify(savedPreview, null, 2) : ''), [savedPreview])

  const update = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const id = `pm-new-${Date.now()}`
    const row: ProjectCardItem = {
      id,
      code: draft.code.trim() || projectCreateDraftMock.code,
      name: draft.name.trim() || 'Adsiz proje',
      customer: draft.customer,
      owner: draft.owner,
      status: draft.status,
      priority: draft.priority,
      startDate: draft.startDate,
      dueDate: draft.dueDate,
      progress: Math.min(100, Math.max(0, Number(draft.progress) || 0)),
      note: draft.note.trim() || '-',
      updatedAt: nowUpdatedAtMock(),
    }
    setSavedPreview(row)
  }

  return (
    <div className="okan-liquid-root flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-[1.25rem]">
      <div className="okan-liquid-blobs" aria-hidden>
        <div className="okan-liquid-blob okan-liquid-blob--a" />
        <div className="okan-liquid-blob okan-liquid-blob--c" />
      </div>
      <div className="okan-liquid-content flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-1">
        <div className="mt-2 shrink-0 px-2 sm:mt-3 sm:px-3">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex w-fit max-w-full items-center gap-1 text-sm text-slate-700 dark:text-slate-200"
          >
            <button
              type="button"
              onClick={() => navigate('/proje')}
              className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
            >
              Proje Yonetimi
            </button>
            <ChevronRight className="size-3.5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
            <span className="max-w-[34ch] truncate rounded-lg px-2 py-1 text-xs font-semibold text-slate-900 dark:text-slate-50">
              Proje olustur
            </span>
          </nav>
        </div>

        <section className={`${panelClass} shrink-0 p-4`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Yeni proje</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Asagidaki alanlar mock veri ile on doldurulur; kayit yalnizca onizleme uretir (backend yok).
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/proje')}
              className="okan-liquid-btn-secondary px-4 py-2 text-sm font-semibold"
            >
              Listeye don
            </button>
          </div>
        </section>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className={`${panelClass} flex flex-col gap-4 p-4`}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Proje adi</span>
                <input
                  required
                  value={draft.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="okan-liquid-input border-0 px-3 py-2.5 text-sm shadow-none"
                  autoComplete="off"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Proje kodu</span>
                <input
                  value={draft.code}
                  onChange={(e) => update('code', e.target.value)}
                  className="okan-liquid-input border-0 px-3 py-2.5 text-sm shadow-none"
                  autoComplete="off"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Musteri</span>
                <select
                  value={draft.customer}
                  onChange={(e) => update('customer', e.target.value)}
                  className="okan-liquid-select border-0 px-3 py-2.5 text-sm shadow-none"
                >
                  {projectCreateCustomersMock.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Sorumlu</span>
                <select
                  value={draft.owner}
                  onChange={(e) => update('owner', e.target.value)}
                  className="okan-liquid-select border-0 px-3 py-2.5 text-sm shadow-none"
                >
                  {projectCreateOwnersMock.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Durum</span>
                <select
                  value={draft.status}
                  onChange={(e) => update('status', e.target.value as typeof draft.status)}
                  className="okan-liquid-select border-0 px-3 py-2.5 text-sm shadow-none"
                >
                  {projectCreateStatusOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Oncelik</span>
                <select
                  value={draft.priority}
                  onChange={(e) => update('priority', e.target.value as typeof draft.priority)}
                  className="okan-liquid-select border-0 px-3 py-2.5 text-sm shadow-none"
                >
                  {projectCreatePriorityOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Baslangic (gg.aa.yyyy)</span>
                <input
                  value={draft.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                  className="okan-liquid-input border-0 px-3 py-2.5 text-sm shadow-none"
                  placeholder="21.04.2026"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Termin (gg.aa.yyyy)</span>
                <input
                  value={draft.dueDate}
                  onChange={(e) => update('dueDate', e.target.value)}
                  className="okan-liquid-input border-0 px-3 py-2.5 text-sm shadow-none"
                  placeholder="15.06.2026"
                />
              </label>
              <label className="flex flex-col gap-1.5 md:col-span-2">
                <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                  Ilk ilerleme (0–100%)
                </span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.progress}
                  onChange={(e) => update('progress', Number(e.target.value))}
                  className="okan-liquid-input max-w-[12rem] border-0 px-3 py-2.5 text-sm shadow-none"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Not</span>
              <textarea
                rows={4}
                value={draft.note}
                onChange={(e) => update('note', e.target.value)}
                className="okan-liquid-input resize-none border-0 px-3 py-2.5 text-sm shadow-none"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="okan-liquid-btn-primary px-5 py-2.5 text-sm font-semibold">
                Kaydet (mock onizleme)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft({ ...projectCreateDraftMock })
                  setSavedPreview(null)
                }}
                className="okan-liquid-btn-secondary px-4 py-2.5 text-sm font-semibold"
              >
                Taslagi sifirla
              </button>
            </div>
          </form>

          {savedPreview ? (
            <section className={`${panelClass} flex flex-col gap-3 p-4`}>
              <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Mock kayit ozeti</p>
              <div className={`${nestedClass} grid gap-2 p-3 text-sm sm:grid-cols-2`}>
                <div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Kod</p>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{savedPreview.code}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Guncelleme</p>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{savedPreview.updatedAt}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Ad</p>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{savedPreview.name}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Musteri</p>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{savedPreview.customer}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Sorumlu</p>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{savedPreview.owner}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Ilerleme</p>
                  <p className="font-medium text-slate-900 dark:text-slate-50">%{savedPreview.progress}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Not</p>
                  <p className="text-slate-800 dark:text-slate-200">{savedPreview.note}</p>
                </div>
              </div>
              <div className={`${nestedClass} p-3`}>
                <p className="mb-2 text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-300">
                  ProjectCardItem (mock JSON)
                </p>
                <pre className="max-h-40 overflow-auto text-[11px] leading-relaxed text-slate-800 dark:text-slate-200">
                  {previewJson}
                </pre>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
